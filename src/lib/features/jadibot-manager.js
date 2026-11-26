/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { saluranCtx } from "../core/context.js";
import {
  delay,
  jidNormalizedUser,
  useMultiFileAuthState,
} from "@rexxhayanasi/elaina-baileys";
import { logger } from "../core/logger.js";
import { addJadibotOwner } from "../data/jadibot-database.js";
import { extendSocket } from "../core/socket.js";

const JADIBOT_AUTH_FOLDER = path.join(process.cwd(), "session", "jadibot");
const jadibotSessions = new Map();
const pendingSessions = new Map();
const reconnectAttempts = new Map();
const rateLimit = new Map();

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 5000;
const PAIRING_TIMEOUT_MS = 60000;

if (!fs.existsSync(JADIBOT_AUTH_FOLDER)) {
  fs.mkdirSync(JADIBOT_AUTH_FOLDER, { recursive: true });
}

function normalizePhoneId(jid, sock = null) {
  if (!jid) return "";
  let raw = String(jid);
  if (raw.endsWith("@lid") && sock?.getJid) {
    raw = sock.getJid(raw) || raw;
  }
  return raw.replace(/@.+/g, "").split(":")[0].replace(/[^0-9]/g, "");
}

function getJadibotAuthPath(jid) {
  const id = normalizePhoneId(jid);
  return path.join(JADIBOT_AUTH_FOLDER, id);
}

function deleteSessionFolder(authPath) {
  try {
    if (authPath && fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      return true;
    }
  } catch (e) {
    logger.error("Jadibot", `Failed to delete session ${authPath}: ${e.message}`);
  }
  return false;
}

function isAuthRegistered(authPath) {
  try {
    const credsFile = path.join(authPath, "creds.json");
    if (!fs.existsSync(credsFile)) return false;
    const raw = JSON.parse(fs.readFileSync(credsFile, "utf8"));
    return Boolean(raw?.registered);
  } catch {
    return false;
  }
}

function isJadibotActive(jid) {
  const id = normalizePhoneId(jid);
  return jadibotSessions.has(id) || pendingSessions.has(id);
}

function getActiveJadibots() {
  return Array.from(jadibotSessions.entries()).map(([id, data]) => ({
    id,
    jid: id + "@s.whatsapp.net",
    ...data,
  }));
}

function getAllJadibotSessions() {
  const sessions = [];
  if (!fs.existsSync(JADIBOT_AUTH_FOLDER)) return sessions;

  const dirs = fs.readdirSync(JADIBOT_AUTH_FOLDER);
  for (const dir of dirs) {
    const credsPath = path.join(JADIBOT_AUTH_FOLDER, dir, "creds.json");
    if (fs.existsSync(credsPath)) {
      sessions.push({
        id: dir,
        jid: dir + "@s.whatsapp.net",
        isActive: jadibotSessions.has(dir),
        credsPath,
      });
    }
  }
  return sessions;
}

function createJadibotStore() {
  return {
    messages: new Map(),
    chats: new Map(),
    contacts: {},
    bind(ev) {
      ev.on("messages.upsert", ({ messages }) => {
        for (const msg of messages || []) {
          const jid = msg.key?.remoteJid;
          if (!jid) continue;
          if (!this.messages.has(jid)) this.messages.set(jid, new Map());
          const chat = this.messages.get(jid);
          if (msg.key?.id) {
            chat.set(msg.key.id, msg);
            if (chat.size > 200) {
              const keys = [...chat.keys()];
              for (let i = 0; i < keys.length - 150; i++) chat.delete(keys[i]);
            }
          }
          if (!this.chats.has(jid)) {
            this.chats.set(jid, { id: jid });
          }
          if (msg.pushName && jid.endsWith("@s.whatsapp.net")) {
            this.contacts[jid] = {
              ...this.contacts[jid],
              notify: msg.pushName,
            };
          }
        }
      });
      ev.on("chats.upsert", (chats) => {
        for (const chat of chats || []) {
          if (chat.id) this.chats.set(chat.id, chat);
        }
      });
      ev.on("contacts.upsert", (contacts) => {
        for (const contact of contacts || []) {
          if (contact.id) {
            this.contacts[contact.id] = {
              ...this.contacts[contact.id],
              ...contact,
            };
          }
        }
      });
    },
    async loadMessage(jid, id) {
      return this.messages.get(jid)?.get(id) || undefined;
    },
  };
}

const ERROR_MESSAGES = {
  401: {
    reason: "Sesión cerrada / número no autenticado",
    action: "Hay que volver a emparejar",
    fatal: true,
  },
  403: {
    reason: "Acceso denegado / baneado",
    action: "Es posible que este número esté baneado en WhatsApp",
    fatal: true,
  },
  405: {
    reason: "El servidor rechazó el método de conexión",
    action: "Se reintentará la conexión",
    fatal: false,
  },
  406: {
    reason: "Número restringido",
    action: "WhatsApp limitó este número, espera unas horas",
    fatal: true,
  },
  408: {
    reason: "Tiempo de espera agotado",
    action: "Conexión lenta, reintentando conectar",
    fatal: false,
  },
  409: {
    reason: "Conflicto de sesión",
    action: "La sesión se está usando en otro dispositivo",
    fatal: true,
  },
  411: {
    reason: "Autenticación fallida",
    action: "Hay que volver a emparejar",
    fatal: true,
  },
  428: {
    reason: "Conexión cortada / límite de peticiones",
    action: "Reintentando conectar",
    fatal: false,
  },
  440: {
    reason: "Sesión caducada / hay que iniciar sesión",
    action: "Hay que volver a emparejar",
    fatal: true,
  },
  500: {
    reason: "Error del servidor de WhatsApp",
    action: "El servidor de WhatsApp está fallando",
    fatal: false,
  },
  501: {
    reason: "Función no compatible",
    action: "Hay que volver a emparejar",
    fatal: true,
  },
  503: {
    reason: "Servicio no disponible",
    action: "WhatsApp está en mantenimiento",
    fatal: false,
  },
  515: {
    reason: "Stream error (restart diperlukan)",
    action: "Menyambungkan ulang otomatis",
    fatal: false,
  },
};

const CONNECTION_CLOSED_REASONS = [
  {
    match: /logged out/i,
    reason: "Akun di-logout",
    action: "Akun di-logout dari perangkat tertaut",
    fatal: true,
  },
  {
    match: /replaced/i,
    reason: "Session digantikan",
    action: "Login di perangkat lain",
    fatal: true,
  },
  {
    match: /Multidevice mismatch/i,
    reason: "Session tidak valid",
    action: "Perlu pairing ulang",
    fatal: true,
  },
  {
    match: /bad session/i,
    reason: "Session rusak",
    action: "Perlu pairing ulang",
    fatal: true,
  },
  {
    match: /restart required/i,
    reason: "Hace falta reiniciar",
    action: "Reconectando automáticamente",
    fatal: false,
  },
  {
    match: /Connection Closed|write EOF|ECONNRESET|ETIMEDOUT|timeout/i,
    reason: "Conexión cortada / tiempo agotado",
    action: "Reintentando conectar",
    fatal: false,
  },
];

function parseDisconnectError(lastDisconnect) {
  const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMessage = lastDisconnect?.error?.message || "Conexión cortada";

  if (statusCode && ERROR_MESSAGES[statusCode]) {
    return {
      ...ERROR_MESSAGES[statusCode],
      code: statusCode,
      message: errorMessage,
    };
  }

  for (const pattern of CONNECTION_CLOSED_REASONS) {
    if (pattern.match.test(errorMessage)) {
      return {
        code: statusCode || "N/A",
        reason: pattern.reason,
        action: pattern.action,
        fatal: pattern.fatal,
        message: errorMessage,
      };
    }
  }

  return {
    code: statusCode || "N/A",
    reason: errorMessage || "Gagal terhubung",
    action: "Mencoba sambung ulang",
    fatal: false,
    message: errorMessage,
  };
}

function isSocketAlive(sock) {
  try {
    if (!sock) return false;
    if (sock.ws && sock.ws.readyState === 1) return true;
    if (sock.user?.id) return true;
    return false;
  } catch {
    return false;
  }
}

async function safeSend(sock, jid, content, options = {}) {
  try {
    if (!jid || !sock) return null;
    return await sock.sendMessage(jid, content, options);
  } catch (e) {
    logger.error("Jadibot", `safeSend failed: ${e.message}`);
    return null;
  }
}

async function startJadibot(sock, m, userJid, usePairing = true, isReconnect = false) {
  const id = normalizePhoneId(userJid, sock);
  if (!id || id.length < 10 || id.length > 15) {
    throw new Error("Nomor WhatsApp tidak valid untuk Jadibot.");
  }

  const normalizedJid = `${id}@s.whatsapp.net`;
  const authPath = path.join(JADIBOT_AUTH_FOLDER, id);

  if (!isReconnect) {
    if (jadibotSessions.has(id) || pendingSessions.has(id)) {
      throw new Error("Jadibot sudah aktif atau sedang proses pairing untuk nomor ini!");
    }

    if (usePairing) {
      const lastAttempt = rateLimit.get(id) || 0;
      const waitMs = 30000 - (Date.now() - lastAttempt);
      if (waitMs > 0) {
        const secs = Math.ceil(waitMs / 1000);
        throw new Error(`Tunggu ${secs} detik sebelum mencoba pairing lagi.`);
      }
      rateLimit.set(id, Date.now());
    }

    // Reset counter percobaan untuk sesi baru
    reconnectAttempts.delete(id);

    // Hapus folder session lama yang belum terdaftar agar pairing selalu fresh
    if (fs.existsSync(authPath) && !isAuthRegistered(authPath)) {
      deleteSessionFolder(authPath);
    }
  }

  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
  } = await import("@rexxhayanasi/elaina-baileys");
  const { version } = await fetchLatestBaileysVersion();
  const pinoModule = await import("pino");
  const pinoLogger = pinoModule.default({ level: "silent" });
  const childStore = createJadibotStore();
  const groupMetadataCache = new Map();

  const childSock = makeWASocket({
    version,
    logger: pinoLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pinoLogger),
    },
    browser: ["Mac OS", "Chrome", "14.4.1"],
    autoFollowNewsletterOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: false,
    defaultQueryTimeoutMs: 25000,
    connectTimeoutMs: 25000,
    keepAliveIntervalMs: 15000,
    retryRequestDelayMs: 250,
    getMessage: async (key) => {
      return (await childStore.loadMessage(key.remoteJid, key.id))?.message;
    },
    cachedGroupMetadata: async (jid) => {
      const cached = groupMetadataCache.get(jid);
      if (cached) return cached;
      try {
        const fresh = await childSock.groupMetadata(jid);
        groupMetadataCache.set(jid, fresh);
        return fresh;
      } catch {
        return undefined;
      }
    },
    fireInitQueries: true,
    emitOwnEvents: true,
    shouldSyncHistoryMessage: () => false,
    transactionOpts: { maxCommitRetries: 5, delayBetweenTriesMs: 500 },
  });

  childStore.bind(childSock.ev);
  childSock.store = childStore;
  await extendSocket(childSock);

  let qrCount = 0;
  let lastQRMsg = null;
  let pairingCode = null;
  let heartbeatInterval = null;
  let pairingTimeout = null;
  let isConnected = false;
  let handledClose = false;

  const pendingEntry = {
    sock: childSock,
    cancelled: false,
    clearTimers() {
      if (pairingTimeout) {
        clearTimeout(pairingTimeout);
        pairingTimeout = null;
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    },
  };
  pendingSessions.set(id, pendingEntry);

  function closeChildSocketQuietly() {
    try {
      childSock.ev.removeAllListeners();
    } catch {}
    try {
      childSock.ws?.close();
    } catch {}
    try {
      childSock.end?.();
    } catch {}
  }

  async function handleFailure(errorInfo) {
    if (handledClose || pendingEntry.cancelled) return;
    handledClose = true;
    pendingEntry.clearTimers();

    const activeSession = jadibotSessions.get(id);
    if (activeSession?.heartbeatInterval) {
      clearInterval(activeSession.heartbeatInterval);
    }

    closeChildSocketQuietly();
    jadibotSessions.delete(id);

    if (lastQRMsg?.key && m?.chat) {
      await safeSend(sock, m.chat, { delete: lastQRMsg.key });
      lastQRMsg = null;
    }

    const prefix = m?.prefix || ".";

    if (errorInfo.fatal) {
      pendingSessions.delete(id);
      reconnectAttempts.delete(id);
      rateLimit.delete(id);
      deleteSessionFolder(authPath);

      let statusEmoji = "❌";
      if (errorInfo.code === 403 || errorInfo.reason?.includes("banned")) {
        statusEmoji = "🚫";
      } else if (errorInfo.code === 406 || errorInfo.reason?.includes("dibatasi")) {
        statusEmoji = "⚠️";
      }

      await safeSend(sock, m?.chat, {
        text:
          `${statusEmoji} *ᴊᴀᴅɪʙᴏᴛ ɢᴀɢᴀʟ / ᴛᴇʀᴘᴜᴛᴜꜱ*\n\n` +
          `> 📱 Nomor: *@${id}*\n` +
          `> 🔢 Kode: \`${errorInfo.code}\`\n` +
          `> 📋 Alasan: *${errorInfo.reason}*\n` +
          `> 🗑️ Session jadibot otomatis dihapus.\n\n` +
          `Ketik \`${prefix}jadibot\` untuk memulai ulang.`,
        mentions: [normalizedJid],
      });
      return;
    }

    const attempt = (reconnectAttempts.get(id) || 0) + 1;

    if (attempt <= MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts.set(id, attempt);
      pendingSessions.delete(id);

      await safeSend(sock, m?.chat, {
        text:
          `🔄 *ᴊᴀᴅɪʙᴏᴛ ʙᴇʟᴜᴍ ᴛᴇʀʜᴜʙᴜɴɢ*\n\n` +
          `> 📱 Nomor: *@${id}*\n` +
          `> 📋 Alasan: *${errorInfo.reason}*\n` +
          `> 🔁 Percobaan: *${attempt}/${MAX_RECONNECT_ATTEMPTS}*\n\n` +
          `> ⏳ Mencoba menyambungkan ulang dalam ${RECONNECT_INTERVAL / 1000} detik...`,
        mentions: [normalizedJid],
      });

      setTimeout(() => {
        if (pendingEntry.cancelled) return;
        const alreadyRegistered = isAuthRegistered(authPath);
        const retryWithPairing = usePairing && !alreadyRegistered;

        if (retryWithPairing) {
          deleteSessionFolder(authPath);
        }

        startJadibot(sock, m, normalizedJid, retryWithPairing, true).catch(async (e) => {
          logger.error("Jadibot", `Reconnect ${attempt}/3 failed for ${id}: ${e.message}`);
          if (!e?.alreadyNotified) {
            await safeSend(sock, m?.chat, {
              text:
                `❌ *ᴊᴀᴅɪʙᴏᴛ ɢᴀɢᴀʟ (${attempt}/${MAX_RECONNECT_ATTEMPTS})*\n\n` +
                `> 📱 Nomor: *@${id}*\n` +
                `> 📋 Alasan: *${e.message || "Gagal menyambungkan"}*`,
              mentions: [normalizedJid],
            });
          }
          if (attempt >= MAX_RECONNECT_ATTEMPTS) {
            jadibotSessions.delete(id);
            pendingSessions.delete(id);
            reconnectAttempts.delete(id);
            rateLimit.delete(id);
            deleteSessionFolder(authPath);
          }
        });
      }, RECONNECT_INTERVAL);
    } else {
      // Semua 3/3 percobaan gagal -> hapus session jadibot & beritahu user
      pendingSessions.delete(id);
      reconnectAttempts.delete(id);
      rateLimit.delete(id);
      deleteSessionFolder(authPath);

      await safeSend(sock, m?.chat, {
        text:
          `❌ *ᴊᴀᴅɪʙᴏᴛ ɢᴀɢᴀʟ ᴛᴇʀʜᴜʙᴜɴɢ (${MAX_RECONNECT_ATTEMPTS}/${MAX_RECONNECT_ATTEMPTS})*\n\n` +
          `> 📱 Nomor: *@${id}*\n` +
          `> 📋 Alasan: *${errorInfo.reason}*\n` +
          `> 🗑️ Session jadibot otomatis dihapus karena gagal terhubung setelah ${MAX_RECONNECT_ATTEMPTS} percobaan.\n\n` +
          `Ketik \`${prefix}jadibot\` untuk mencoba lagi.`,
        mentions: [normalizedJid],
      });
    }
  }

  childSock.ev.on("creds.update", saveCreds);

  childSock.ev.on("connection.update", async (update) => {
    if (handledClose || pendingEntry.cancelled) return;
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairing) {
      qrCount++;
      if (qrCount > 3) {
        await handleFailure({
          code: "QR_EXPIRED",
          reason: "QR Code kadaluarsa (3/3)",
          action: "Scan QR terlalu lama",
          fatal: true,
        });
        return;
      }

      try {
        const qrBuffer = await QRCode.toBuffer(qr, {
          scale: 8,
          margin: 4,
          width: 256,
          color: { dark: "#000000ff", light: "#ffffffff" },
        });

        if (lastQRMsg?.key) {
          await safeSend(sock, m?.chat, { delete: lastQRMsg.key });
        }

        if (!m?.chat) return;
        lastQRMsg = await sock.sendMessage(
          m.chat,
          {
            image: qrBuffer,
            caption:
              `🤖 *ᴊᴀᴅɪʙᴏᴛ — Qʀ ᴄᴏᴅᴇ*\n\n` +
              `Scan kode QR ini untuk menjadi bot.\n\n` +
              `> ⏱️ Expired dalam 20 detik\n` +
              `> 📊 QR Count: ${qrCount}/3`,
          },
          { quoted: m }
        );
      } catch (e) {
        logger.error("Jadibot", "Failed to send QR: " + e.message);
      }
    }

    if (connection === "open") {
      isConnected = true;
      pendingEntry.clearTimers();
      pendingSessions.delete(id);
      reconnectAttempts.delete(id);
      logger.info("Jadibot", `Connected: ${id}`);

      heartbeatInterval = setInterval(() => {
        try {
          if (!isSocketAlive(childSock)) {
            clearInterval(heartbeatInterval);
          }
        } catch {}
      }, 30000);

      jadibotSessions.set(id, {
        sock: childSock,
        jid: childSock.user?.id || normalizedJid,
        startedAt: Date.now(),
        ownerJid: m?.sender || normalizedJid,
        status: "connected",
        connectionReady: true,
        pendingMessages: [],
        heartbeatInterval,
      });

      childSock.sendPresenceUpdate("available").catch(() => {});
      addJadibotOwner(id, m?.sender || normalizedJid);

      if (m?.chat) {
        await safeSend(sock, m.chat, {
          text:
            `✅ *ᴊᴀᴅɪʙᴏᴛ ᴛᴇʀʜᴜʙᴜɴɢ*\n\n` +
            `> 📱 Nomor: *@${id}*\n` +
            `> 🟢 Status: *Online*\n` +
            `> ⏱️ Mulai: *${new Date().toLocaleTimeString("id-ID")}*\n\n` +
            `Bot kamu aktif dan siap menerima perintah!\n\n` +
            `> ℹ️ Ketik \`${m.prefix || "."}stopjadibot\` untuk menghentikan`,
          mentions: [normalizedJid],
        });
      }

      if (lastQRMsg?.key && m?.chat) {
        safeSend(sock, m.chat, { delete: lastQRMsg.key }).catch(() => {});
      }
    }

    if (connection === "close") {
      const errorInfo = parseDisconnectError(lastDisconnect);
      logger.info(
        "Jadibot",
        `Disconnected: ${id}, code: ${errorInfo.code}, reason: ${errorInfo.reason}`
      );
      await handleFailure(errorInfo);
    }
  });

  const processedMessages = new Map();

  childSock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!childSock.user || !childSock.user.id) {
      childSock.user = {
        id: jidNormalizedUser(normalizedJid),
        name: "Jadibot",
      };
    }

    if (type !== "notify" && type !== "append") return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const msgId = msg.key?.id;
      if (msgId && processedMessages.has(msgId)) continue;
      if (msgId) processedMessages.set(msgId, Date.now());

      if (msg.key && msg.key.remoteJid === "status@broadcast") continue;

      const msgTimestamp = msg.messageTimestamp
        ? Number(msg.messageTimestamp) * 1000
        : Date.now();
      const msgAge = Date.now() - msgTimestamp;
      if (msgAge > 60 * 60 * 1000) continue;

      const metadataKeys = [
        "senderKeyDistributionMessage",
        "messageContextInfo",
      ];
      const msgType =
        Object.keys(msg.message).find((k) => !metadataKeys.includes(k)) ||
        Object.keys(msg.message)[0];
      const ignoredTypes = [
        "protocolMessage",
        "senderKeyDistributionMessage",
        "reactionMessage",
        "stickerSyncRmrMessage",
        "encReactionMessage",
        "pollUpdateMessage",
        "pollCreationMessage",
        "pollCreationMessageV2",
        "pollCreationMessageV3",
        "keepInChatMessage",
        "deviceSentMessage",
        "call",
        "peerDataOperationRequestMessage",
      ];
      if (ignoredTypes.includes(msgType)) continue;

      if (!isSocketAlive(childSock)) continue;

      const session = jadibotSessions.get(id);
      if (session && !session.connectionReady) {
        session.pendingMessages = session.pendingMessages || [];
        session.pendingMessages.push(msg);
        continue;
      }

      try {
        const { messageHandler } = await import("../../handler.js");
        await messageHandler(msg, childSock, {
          isJadibot: true,
          jadibotId: id,
        });
      } catch (e) {
        if (
          e.message?.includes("Connection Closed") ||
          e.message?.includes("428")
        ) {
          logger.info(
            "Jadibot",
            `${id} connection closed during handler, skipping`
          );
          break;
        }
        logger.error("Jadibot", `Handler error for ${id}: ${e.message}`);
      }
    }

    const fiveMinAgo = Date.now() - 300000;
    for (const [key, time] of processedMessages) {
      if (time < fiveMinAgo) processedMessages.delete(key);
    }
  });

  // Pasang timeout pengawas agar tidak pernah diam tanpa notifikasi saat gagal konek
  pairingTimeout = setTimeout(() => {
    if (!isConnected && !handledClose && !pendingEntry.cancelled) {
      handleFailure({
        code: "TIMEOUT",
        reason: "Tidak terhubung (waktu pairing habis / timeout)",
        action: "Pastikan kode pairing dimasukkan di WhatsApp",
        fatal: false,
      });
    }
  }, PAIRING_TIMEOUT_MS);

  if (usePairing && !state.creds?.registered) {
    try {
      await delay(2500);
      if (handledClose || pendingEntry.cancelled || isConnected) {
        return { sock: childSock, pairingCode: null };
      }

      const rawCode = await childSock.requestPairingCode(id);
      const cleanCode = String(rawCode || "").replace(/[^A-Za-z0-9]/g, "");
      if (!cleanCode) {
        throw new Error("Pairing code kosong dari server WhatsApp");
      }
      pairingCode = cleanCode.match(/.{1,4}/g)?.join("-") || cleanCode;

      if (m && m.chat) {
        const attemptNow = reconnectAttempts.get(id) || 0;
        const attemptLabel =
          attemptNow > 0
            ? `\n> 🔁 Percobaan: *${attemptNow}/${MAX_RECONNECT_ATTEMPTS}*`
            : "";

        const pairingText =
          `🔗 *ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ᴊᴀᴅɪʙᴏᴛ*\n\n` +
          `Masukkan kode berikut di WhatsApp kamu:\n` +
          `> 📱 *Perangkat Tertaut → Tautkan Perangkat → Tautkan dengan nomor telepon*\n\n` +
          `\`\`\`${pairingCode}\`\`\`\n\n` +
          `> ⏱️ Berlaku *60 detik* sebelum percobaan ulang${attemptLabel}\n` +
          `> ⚠️ Jangan bagikan kode ini ke siapapun`;

        try {
          await sock.sendMessage(
            m.chat,
            {
              text: pairingText,
              contextInfo: saluranCtx(),
              interactiveButtons: [
                {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📋 Copy Pairing Code",
                    copy_code: cleanCode,
                  }),
                },
              ],
            },
            { quoted: m }
          );
        } catch {
          // Fallback ke pesan teks biasa agar kode pairing PASTI terkirim
          await safeSend(sock, m.chat, { text: pairingText }, { quoted: m });
        }
      } else {
        logger.info("Jadibot", `Pairing Code for ${id}: ${pairingCode}`);
      }
    } catch (e) {
      logger.error("Jadibot", "Failed to get pairing code: " + e.message);

      let reason = "Gagal mendapatkan pairing code";
      let fatal = false;
      if (
        e.message?.includes("rate") ||
        e.message?.includes("limit") ||
        e.message?.includes("428")
      ) {
        reason = "Rate limited oleh WhatsApp (tunggu beberapa menit)";
        fatal = true;
      } else if (
        e.message?.includes("banned") ||
        e.message?.includes("blocked") ||
        e.message?.includes("403")
      ) {
        reason = "Nomor mungkin dibanned WhatsApp";
        fatal = true;
      } else if (
        e.message?.includes("Connection Closed") ||
        e.message?.includes("closed")
      ) {
        reason = "Koneksi terputus saat meminta pairing code";
        fatal = false;
      }

      await handleFailure({
        code: "PAIRING_ERR",
        reason,
        action: e.message || "Coba lagi",
        fatal,
      });

      const err = new Error(reason);
      err.alreadyNotified = true;
      throw err;
    }
  }

  return { sock: childSock, pairingCode };
}

async function stopJadibot(jid, deleteSession = false) {
  const id = normalizePhoneId(jid);

  const pending = pendingSessions.get(id);
  if (pending) {
    pending.cancelled = true;
    pending.clearTimers();
    try {
      pending.sock?.ev?.removeAllListeners();
      pending.sock?.ws?.close();
    } catch {}
    pendingSessions.delete(id);
  }

  const session = jadibotSessions.get(id);
  if (session) {
    try {
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      session.sock.ev.removeAllListeners();
      session.sock.ws.close();
    } catch {}
    jadibotSessions.delete(id);
  }

  reconnectAttempts.delete(id);
  rateLimit.delete(id);

  if (deleteSession) {
    deleteSessionFolder(getJadibotAuthPath(jid));
  }

  return true;
}

async function stopAllJadibots() {
  const stopped = [];
  for (const [id, pending] of pendingSessions) {
    pending.cancelled = true;
    pending.clearTimers();
    try {
      pending.sock?.ev?.removeAllListeners();
      pending.sock?.ws?.close();
    } catch {}
    stopped.push(id);
  }
  pendingSessions.clear();

  for (const [id, session] of jadibotSessions) {
    try {
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      session.sock.ev.removeAllListeners();
      session.sock.ws.close();
    } catch {}
    if (!stopped.includes(id)) stopped.push(id);
  }
  jadibotSessions.clear();
  reconnectAttempts.clear();
  rateLimit.clear();
  return stopped;
}

async function restartJadibotSession(sock, sessionId) {
  const userJid = sessionId + "@s.whatsapp.net";
  const authPath = path.join(JADIBOT_AUTH_FOLDER, sessionId);

  // Hapus otomatis session jadibot lama yang ternyata belum terdaftar (sisa pairing gagal)
  if (!isAuthRegistered(authPath)) {
    deleteSessionFolder(authPath);
    return;
  }

  try {
    logger.info("Jadibot", `Restoring session: ${sessionId}`);

    const dbPath = path.join(JADIBOT_AUTH_FOLDER, sessionId, "data.json");
    let ownerJid = userJid;
    try {
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        if (data.owners?.[0]) ownerJid = data.owners[0] + "@s.whatsapp.net";
      }
    } catch {}

    const mockM = {
      chat: ownerJid,
      sender: ownerJid,
      prefix: ".",
      key: {
        remoteJid: ownerJid,
        fromMe: false,
        id: "restart-" + Date.now(),
      },
      reply: async (text) => {
        await safeSend(sock, ownerJid, { text });
      },
      react: async () => {},
    };
    await startJadibot(sock, mockM, userJid, false, true);
  } catch (e) {
    logger.error("Jadibot", `Failed to restore ${sessionId}: ${e.message}`);
  }
}

function getJadibotStatus(jid) {
  const id = normalizePhoneId(jid);
  const session = jadibotSessions.get(id);
  if (!session) return null;

  return {
    id,
    jid: session.jid,
    status: session.status || "unknown",
    startedAt: session.startedAt,
    ownerJid: session.ownerJid,
    uptime: Date.now() - session.startedAt,
  };
}

export {
  JADIBOT_AUTH_FOLDER,
  jadibotSessions,
  getJadibotAuthPath,
  isJadibotActive,
  getActiveJadibots,
  getAllJadibotSessions,
  startJadibot,
  stopJadibot,
  stopAllJadibots,
  restartJadibotSession,
  getJadibotStatus,
  isSocketAlive,
  safeSend,
};
