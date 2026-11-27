/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getThumb, getThumbUrl, fetchThumb } from "./lib/core/media.js";
import config from "../config.js";
import { generateWAMessageFromContent, prepareWAMessageMedia } from "@rexxhayanasi/elaina-baileys";
import { serialize, getCachedThumb } from "./lib/core/serialize.js";
import { saluranCtx } from "./lib/core/context.js";
import {
  getPlugin,
  getPluginCount,
  getAllPlugins,
  pluginStore,
  getAllCommandNames,
} from "./lib/core/plugins.js";
import { getDatabase } from "./lib/data/database.js";
import { isCaseCommand } from "./lib/data/koin.js";
import {
  formatUptime,
  createWaitMessage,
  createErrorMessage,
} from "./lib/core/formatter.js";
import { getUptime } from "./connection.js";
import { logger, c } from "./lib/core/logger.js";
import {
  isLid,
  isLidConverted,
  lidToJid,
  convertLidArray,
  resolveAnyLidToJid,
  cacheParticipantLids,
  savePersistentCache,
  getLidCacheSize,
} from "./lib/core/lid.js";
import { hasActiveSession, getSession } from "./lib/features/game-data.js";
import {
  levenshtein,
  formatAfkDuration,
  checkPermission,
  checkMode,
} from "./lib/core/middleware.js";
import {
  handleAntilink,
  handleAntiJudol,
  handleAntiPhising,
  handleAntiCustom,
  handleAntiRemove,
  handleAntiRemoveFromUpsert,
  cacheMessageForAntiRemove,
  handleAntilinkGc,
  handleAntilinkAll,
  handleAntiHidetag,
  handleAntiSwGc,
} from "./lib/features/group-protection.js";
import {
  debounceMessage,
  getCachedUser,
  getCachedGroup,
  getCachedSetting,
} from "./lib/core/performance.js";
import {
  isJadibotOwner,
  isJadibotPremium,
  loadJadibotDb,
} from "./lib/data/jadibot-database.js";
import { getActiveJadibots } from "./lib/features/jadibot-manager.js";
import { handleCommand as handleCaseCommand } from "./case/miku.js";
import { menfessReplyHandler } from "./lib/features/menfess.js";
import { RateLimiterMemory } from "rate-limiter-flexible";
import {
  DAILY_FEATURE_LIMIT,
  consumeDailyFeature,
  getDailyFeatureStatus,
  isDailyLimitExemptCommand,
} from "./lib/data/daily-limit.js";
import { games as mikuGames } from "./lib/features/games.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import axios from "axios";
import * as timeHelper from "./lib/core/time.js";
const safe = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

// Runtime tracker untuk fitur antispam-close.
// Format: groupJid -> { sender, messages: [{ key, at }] }
const spamCloseTrackers = new Map();
const SPAM_CLOSE_THRESHOLD = 5;

function getDailyLimitParticipants(m) {
  return m?.groupMetadata?.participants || [];
}

function dailyLimitBypass(m, status = null, db = null) {
  const user = db && m?.sender ? db.getUser(m.sender) : null;
  const hasEnergiLimit = user?.energi === -1 || Number(user?.energi || 0) > 0;
  return Boolean(
    m?.isOwner ||
    m?.isPartner ||
    m?.isPremium ||
    isDailyLimitExemptCommand(m?.command) ||
    status?.unlimited ||
    hasEnergiLimit
  );
}

async function enforceDailyFeatureLimit(m, db) {
  const status = getDailyFeatureStatus(
    db,
    m.sender,
    getDailyLimitParticipants(m),
  );
  if (dailyLimitBypass(m, status, db) || status.remaining > 0) return true;

  await m.reply(
    `🚫 *LÍMITE DIARIO AGOTADO*\n\n` +
      `Ya usaste *${DAILY_FEATURE_LIMIT}/${DAILY_FEATURE_LIMIT}* funciones hoy.\n` +
      `Podrás volver a usarlas mañana a partir de las *00.00 WIB*.\n\n` +
      `> Consulta tu uso con: \`${m.prefix}limit\``,
  );
  return false;
}

function consumeDailyFeatureIfNeeded(m, db) {
  const status = getDailyFeatureStatus(
    db,
    m.sender,
    getDailyLimitParticipants(m),
  );
  if (dailyLimitBypass(m, status, db)) return status;
  return consumeDailyFeature(db, m.sender, getDailyLimitParticipants(m));
}

function isCountableSpamCloseMessage(m) {
  if (!m?.message || !m?.sender || !m?.isGroup) return false;

  // Owner grup, admin, dan nomor bot tidak pernah dihitung sebagai spam.
  // Pesan mereka tetap memutus urutan spam agar "5× berturut-turut"
  // benar-benar berarti 5 pesan tanpa diselingi pesan lain.
  if (m.fromMe || m.isBot || m.isAdmin || m.isOwner) return false;

  const ignoredTypes = new Set([
    "protocolMessage",
    "reactionMessage",
    "pollUpdateMessage",
    "keepInChatMessage",
    "pinInChatMessage",
    "senderKeyDistributionMessage",
    "deviceSentMessage",
  ]);

  return !ignoredTypes.has(m.type);
}

function resetSpamCloseTracker(chatId) {
  if (chatId) spamCloseTrackers.delete(chatId);
}

/**
 * Mendeteksi 5 pesan beruntun dari anggota yang sama ketika spamclose aktif.
 * Mengembalikan snapshot pesan spam saat ambang tercapai.
 */
function trackSpamCloseMessage(m, db) {
  const groupData = db.getGroup(m.chat) || {};
  if (groupData.spamclose?.enabled !== true) {
    resetSpamCloseTracker(m.chat);
    return null;
  }

  // Semua pesan yang bukan pesan spam yang sedang dihitung memutus
  // urutan, termasuk pesan owner/admin/nomor bot.
  if (!isCountableSpamCloseMessage(m)) {
    resetSpamCloseTracker(m.chat);
    return null;
  }

  const current = spamCloseTrackers.get(m.chat);
  if (!current || current.sender !== m.sender) {
    const next = { sender: m.sender, messages: [{ key: m.key, at: Date.now() }] };
    spamCloseTrackers.set(m.chat, next);
    return null;
  }

  current.messages.push({ key: m.key, at: Date.now() });
  if (current.messages.length < SPAM_CLOSE_THRESHOLD) return null;

  // Ambil tepat 5 pesan terakhir yang beruntun.
  const messages = current.messages.slice(-SPAM_CLOSE_THRESHOLD);
  resetSpamCloseTracker(m.chat);
  return { sender: m.sender, messages };
}

async function handleSpamClose(m, sock, db) {
  const trigger = trackSpamCloseMessage(m, db);
  if (!trigger || !m.isBotAdmin) return false;

  try {
    // Tutup grup lebih dulu, lalu hapus 5 pesan pemicu.
    await sock.groupSettingUpdate(m.chat, "announcement");

    await Promise.allSettled(
      trigger.messages.map(({ key }) =>
        sock.sendMessage(m.chat, { delete: key }).catch(() => {})
      )
    );

    let groupMeta = m.groupMetadata;
    if (!groupMeta) {
      try {
        groupMeta = await sock.groupMetadata(m.chat);
      } catch {
        groupMeta = null;
      }
    }

    const participants = groupMeta?.participants || [];
    const resolveParticipant = (jid) => {
      if (!jid) return null;
      const exact = participants.find((p) => {
        const ids = [p?.jid, p?.id, p?.lid].filter(Boolean);
        return ids.includes(jid);
      });
      return exact?.jid || exact?.id || exact?.lid || jid;
    };

    const groupOwner = resolveParticipant(groupMeta?.owner || groupMeta?.subjectOwner);
    const fallbackAdmin = participants.find((p) => p?.admin === "admin" || p?.admin === "superadmin");
    const ownerJid = groupOwner || fallbackAdmin?.jid || fallbackAdmin?.id || fallbackAdmin?.lid || null;

    const offenderJid = resolveParticipant(trigger.sender) || trigger.sender;
    const offenderTag = `@${String(offenderJid).split("@")[0]}`;
    const ownerTag = ownerJid ? `@${String(ownerJid).split("@")[0]}` : "Dueño del grupo";
    const mentions = [offenderJid, ...(ownerJid ? [ownerJid] : [])].filter(Boolean);

    const report =
      `╭─〔 🚨 *SPAMCLOSE* 〕
` +
      `│ ⚠️ Spam 5× detectado
` +
      `│ 👤 Autor: ${offenderTag}
` +
      `│ 🔒 Grupo: *cerrado automáticamente*
` +
      `│ 🗑️ Mensajes de spam: *5 eliminados*
` +
      `╰─┬──────────────
` +
      `  ╰─ 👑 ${ownerTag}, hola jefe, hay spam que sacar de aquí 😎`;

    await sock.sendMessage(m.chat, { text: report, mentions });
    return true;
  } catch (error) {
    resetSpamCloseTracker(m.chat);
    return false;
  }
}

let FormData,
  levelHelper,
  handleBuyerDone,
  kyubigameAnswerHandler,
  family100AnswerHandler,
  pushkontakAnswerHandler,
  anticustomReplyHandler,
  dafontAnswerHandler,
  gantiAssetAnswerHandler,
  srtAnswerHandler,
  mathAnswerHandler,
  checkAfk,
  isMuted,
  detectBot,
  autoStickerHandler,
  autoMediaHandler,
  checkAntidocument,
  checkAntisticker,
  checkAntimedia,
  ytmp4Plugin,
  confessPlugin,
  sulapPlugin,
  tembakPlugin,
  geminiPlugin,
  handleAutoDownload,
  checkStickerCommand,
  handleStickerReply,
  sendWelcomeMessage,
  sendGoodbyeMessage,
  autoJoinDetector,
  isMutedMember,
  isMutegc;

try {
  FormData = (await import("form-data")).default || (await import("form-data"));
} catch { }
try {
  levelHelper = await import("./lib/data/level.js");
} catch { }
try {
  confessPlugin = await import("../plugins/fun/confess.js");
} catch { }
try {
  sulapPlugin = await import("../plugins/fun/sulap.js");
} catch { }
try {
  tembakPlugin = await import("../plugins/fun/tembak.js");
} catch { }
try {
  geminiPlugin = await import("../plugins/ai/gemini.js");
} catch { }
try {
  anticustomReplyHandler = (await import("../plugins/group/anticustom.js"))
    .replyHandler;
} catch { }
try {
  checkAfk = (await import("../plugins/group/afk.js")).checkAfk;
} catch { }
try {
  isMuted = (await import("../plugins/group/mute.js")).isMuted;
} catch { }
try {
  isMutedMember = (await import("../plugins/group/mutemember.js"))
    .isMutedMember;
} catch { }
try {
  isMutegc = (await import("../plugins/group/mutegc.js")).isMutegc;
} catch { }
try {
  detectBot = (await import("../plugins/group/antibot.js")).detectBot;
} catch { }
try {
  autoStickerHandler = (await import("../plugins/group/autosticker.js"))
    .autoStickerHandler;
} catch { }
try {
  autoMediaHandler = (await import("../plugins/group/automedia.js"))
    .autoMediaHandler;
} catch { }
try {
  checkAntidocument = (await import("../plugins/group/antidocument.js"))
    .checkAntidocument;
} catch { }
try {
  checkAntisticker = (await import("../plugins/group/antisticker.js"))
    .checkAntisticker;
} catch { }
try {
  checkAntimedia = (await import("../plugins/group/antimedia.js"))
    .checkAntimedia;
} catch { }
try {
} catch { }
try {
  handleAutoDownload = (await import("./lib/features/auto-download.js"))
    .handleAutoDownload;
} catch { }
try {
  checkStickerCommand = (await import("./lib/features/sticker-command.js"))
    .checkStickerCommand;
} catch { }
try {
  sendWelcomeMessage = (await import("../plugins/group/welcome.js"))
    .sendWelcomeMessage;
} catch { }
try {
  sendGoodbyeMessage = (await import("../plugins/group/goodbye.js"))
    .sendGoodbyeMessage;
} catch { }
try {
  autoJoinDetector = (await import("../plugins/owner/autojoingc.js"))
    .autoJoinDetector;
} catch { }

let checkSpam = null,
  handleSpamAction = null;
try {
  const m = await import("../plugins/group/antispam.js");
  checkSpam = m.checkSpam;
  handleSpamAction = m.handleSpamAction;
} catch { }

let checkSlowmode = null,
  incrementChatCount = null;
try {
  checkSlowmode = (await import("../plugins/group/slowmode.js")).checkSlowmode;
} catch { }
try {
  incrementChatCount = (await import("../plugins/group/topchat.js"))
    .incrementChatCount;
} catch { }

let isToxic = null,
  handleToxicMessage = null;
try {
  const m = await import("../plugins/group/antitoxic.js");
  isToxic = m.isToxic;
  handleToxicMessage = m.handleToxicMessage;
} catch { }

const spamDelayTracker = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of spamDelayTracker) {
    if (now - v > 15000) spamDelayTracker.delete(k);
  }
}, 30000);

let _smartTriggerThumb = undefined;
async function getSmartTriggerThumb() {
  if (_smartTriggerThumb !== undefined) return _smartTriggerThumb;
  try {
    const url = getThumbUrl("smarttrigger");
    if (url) {
      _smartTriggerThumb = await fetchThumb("smarttrigger")
    } else {
      _smartTriggerThumb = null;
    }
  } catch {
    _smartTriggerThumb = null;
  }
  return _smartTriggerThumb;
}

const globalRateLimiter = new RateLimiterMemory({
  points: 8,
  duration: 3,
  blockDuration: 2,
});

const cachedGamePlugins = new Map();

try {
  const gameDir = path.join(process.cwd(), "plugins", "game");
  const gameFiles = fs
    .readdirSync(gameDir)
    .filter((f) => f.endsWith(".js") && !f.startsWith("_"));
  for (const file of gameFiles) {
    try {
      const plugin = await import(`../plugins/game/${file}`);
      const name = file.replace(".js", "");
      if (plugin.answerHandler) cachedGamePlugins.set(name, plugin);
    } catch { }
  }
} catch { }

async function handleGameAnswer(m, sock) {
  try {
    if (sulapPlugin?.answerHandler) {
      const handled = await sulapPlugin.answerHandler(m, sock);
      if (handled) return true;
    }

    if (tembakPlugin?.answerHandler) {
      const handled = await tembakPlugin.answerHandler(m, sock);
      if (handled) return true;
    }

    const utPlugin = cachedGamePlugins.get('ulartangga');
    if (utPlugin?.answerHandler) {
      if (await utPlugin.answerHandler(m, sock)) return true;
    }

    const tttPlugin = cachedGamePlugins.get('tictactoe');
    if (tttPlugin?.answerHandler) {
      if (await tttPlugin.answerHandler(m, sock)) return true;
    }

    const suitPlugin = cachedGamePlugins.get('suitpvp');
    if (suitPlugin?.answerHandler) {
      if (await suitPlugin.answerHandler(m, sock)) return true;
    }

    if (!hasActiveSession(m.chat)) return false;

    const session = getSession(m.chat);
    if (!session) return false;

    const targeted = cachedGamePlugins.get(session.gameType);
    if (targeted) {
      const handled = await targeted.answerHandler(m, sock);
      if (handled) return true;
    }
  } catch { }
  return false;
}

async function handleSmartTriggers(m, sock, db) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();

  const firstWord = text.split(" ")[0];
  if (
    /^[\.\/\!\#\-]?(autoreply|ar|smarttrigger|smarttriggers)$/.test(firstWord)
  ) {
    return false;
  }

  if (text === "done") {
    const sessions = db.setting("transactionSessions") || {};
    if (sessions[m.sender]) {
      try {
        if (handleBuyerDone) {
          const session = sessions[m.sender];
          await handleBuyerDone(m, sock, session);
          delete sessions[m.sender];
          db.setting("transactionSessions", sessions);
          await db.save();
          return true;
        }
      } catch (e) {
        console.error("[Handler] Done trigger error:", e.message);
      }
    }
  }

  const globalSmartTriggers =
    db.setting("smartTriggers") ?? config.features?.smartTriggers ?? false;

  try {
    const saluranId = config.saluran?.id || "120363393471527483@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Ai Miku";
    const botName = config.bot?.name || "Ai Miku";

    let isAutoreplyEnabled = globalSmartTriggers;

    const processCustomReply = async (replyItem) => {
      let replyText = (replyItem.reply || "")
        .replace(/{name}/g, m.pushName || "User")
        .replace(/{tag}/g, `@${m.sender.split("@")[0]}`)
        .replace(/{sender}/g, m.sender.split("@")[0])
        .replace(/{botname}/g, config.bot?.name || "Bot")
        .replace(/{time}/g, timeHelper.formatTime("HH:mm:ss"))
        .replace(/{date}/g, timeHelper.formatDate("DD MMMM YYYY"));

      const mentions = replyText.includes(`@${m.sender.split("@")[0]}`)
        ? [m.sender]
        : [];

      if (replyItem.image && fs.existsSync(replyItem.image)) {
        const imageBuffer = fs.readFileSync(replyItem.image);
        await sock.sendMedia(m.chat, imageBuffer, replyText, m, {
          mentions: mentions,
          type: "image",
        });
      } else {
        await m.reply(replyText, { mentions: mentions });
      }
      return true;
    };

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      isAutoreplyEnabled = groupData.autoreply ?? globalSmartTriggers;

      if (isAutoreplyEnabled) {
        let customReplies = groupData.customReplies || [];
        if (!Array.isArray(customReplies)) {
          customReplies = [];
          db.setGroup(m.chat, { customReplies });
        }
        for (const replyItem of customReplies) {
          if (!replyItem?.trigger) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }

        const globalCustomReplies = db.setting("globalCustomReplies") || [];
        for (const replyItem of globalCustomReplies) {
          if (!replyItem?.trigger) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }
      }
    } else {
      const privateAutoreply = db.setting("autoreplyPrivate") ?? false;
      if (!privateAutoreply && !globalSmartTriggers) return false;
      isAutoreplyEnabled = privateAutoreply || globalSmartTriggers;

      if (isAutoreplyEnabled) {
        const globalCustomReplies = db.setting("globalCustomReplies") || [];
        for (const replyItem of globalCustomReplies) {
          if (!replyItem?.trigger) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }
      }
    }

    if (!isAutoreplyEnabled) return false;

    const botJid = sock.user?.id;
    const isMentioned = m.mentionedJid?.some(
      (jid) => jid === botJid || jid?.includes(sock.user?.id?.split(":")[0]),
    );

    const thumbBuffer = await getSmartTriggerThumb();

    const contextInfos = saluranCtx();

    if (isMentioned) {
      await m.reply(
        `Alguien está llamando a ${botName}?

¿Qué quieres de mí @${m.sender.split("@")[0]}?`,
        { mentions: [m.sender] },
      );
      return true;
    }

    if (text?.toLowerCase() === "p") {
      await m.reply(
        `Hai @${m.sender.split("@")[0]}, saluda primero, ¿vale?`,
        { mentions: [m.sender] },
      );
      return true;
    }

    if (text?.toLowerCase() === "bot") {
      await m.reply(`Hola @${m.sender.split("@")[0]}, ${botName} activo ✅`, {
        mentions: [m.sender],
      });
      return true;
    }

    if (text?.toLowerCase()?.includes("assalamualaikum")) {
      await m.reply(`Waaalaikumssalam @${m.sender.split("@")[0]}`, {
        mentions: [m.sender],
      });
      return true;
    }

    if (text?.toLowerCase()?.includes("hallo")) {
      await m.reply(`Hola también, @${m.sender.split("@")[0]}`, {
        mentions: [m.sender],
      });
      return true;
    }
  } catch (error) {
    console.error("[SmartTriggers] Error:", error.message);
  }

  return false;
}

/**
 * Cek apakah user sedang spam
 * @param {string} jid - JID user
 * @returns {boolean} True jika sedang spam
 */
async function isSpamming(jid) {
  if (!config.features?.antiSpam) return false;

  try {
    await globalRateLimiter.consume(jid);
    return false;
  } catch {
    return true;
  }
}

/**
 * Handler utama untuk memproses pesan
 * @param {Object} msg - Raw message dari Baileys
 * @param {Object} sock - Socket connection
 * @returns {Promise<void>}
 * @example
 * sock.ev.on('messages.upsert', async ({ messages }) => {
 *   await messageHandler(messages[0], sock);
 * });
 */
async function messageHandler(msg, sock, options = {}) {
  const isJadibot = options.isJadibot || false;
  try {
    let m;
    try {
      m = await serialize(sock, msg);
    } catch (serializeErr) {
      return;
    }

    if (!m) return;
    if (!m.message) return;
    if (!m.sender) m.sender = m.chat || "";

    if (global.giveawaySessions?.has(m.sender)) {
      try {
        const { handleSession: gaHandler } =
          await import("../plugins/group/giveaway.js");
        const gaHandled = await gaHandler(m, sock);
        if (gaHandled) return;
      } catch (e) { }
    }

    if (m.message?.stickerPackMessage && sock.saveStickerPack) {
      try {
        const packMsg = m.message.stickerPackMessage;
        const packId = packMsg.stickerPackId || m.id;
        const packName = packMsg.name || "Paquete desconocido";
        sock.saveStickerPack(packId, { stickerPackMessage: packMsg }, packName);
      } catch (e) { }
    }

    const db = getDatabase();
    if (!db?.ready) {
      return;
    }

    if (!m.isBot && m.sender && m.isGroup) {
      let contacts = db.setting("contacts") || {};
      const currentName = m.pushName;
      if (currentName && currentName !== "User" && currentName !== "Unknown" && currentName !== "~ User") {
        if (!contacts[m.sender] || contacts[m.sender].name !== currentName) {
          contacts[m.sender] = {
            jid: m.sender,
            name: currentName
          };
          db.setting("contacts", contacts);
        }
      }

      const ownerNumbers = (global.owner || []).map(o => typeof o === "string" ? o.replace(/[^0-9]/g, "") : String(o));
      const senderNumber = m.sender.replace(/[^0-9]/g, "");
      const isOwnerUser = m.isOwner || ownerNumbers.includes(senderNumber);

      if (isOwnerUser) {
        const groupData = db.getGroup(m.chat);
        if (groupData && groupData.autoSambut && groupData.autoSambut.enabled) {
          const ownerId = m.sender;
          const lastChat = groupData.autoSambut.lastChats?.[ownerId] || 0;
          const delayMs = groupData.autoSambut.delayMs || (groupData.autoSambut.delay ? groupData.autoSambut.delay * 3600000 : 7200000);
          const now = Date.now();

          if (lastChat > 0 && (now - lastChat >= delayMs)) {
            if (groupData.autoSambut.pesan !== undefined && !groupData.autoSambut.pesanList) {
              groupData.autoSambut.pesanList = [groupData.autoSambut.pesan];
            }

            const pList = groupData.autoSambut.pesanList || ["¡Hola {user}! Bienvenido de nuevo 🙇‍♂️"];
            const randomMsg = pList[Math.floor(Math.random() * pList.length)];

            let sambutan = randomMsg
              .replace(/{name}/gi, m.pushName || "Owner")
              .replace(/{user}/gi, `@${ownerId.split('@')[0]}`);

            m.reply(sambutan, { mentions: [ownerId] }).catch(() => { });
          }

          if (!groupData.autoSambut.lastChats) groupData.autoSambut.lastChats = {};
          groupData.autoSambut.lastChats[ownerId] = now;
          db.setGroup(m.chat, { autoSambut: groupData.autoSambut });
        }
      }
    }

    const jadibotId = options.jadibotId || null;
    if (isJadibot && jadibotId) {
      const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
      const senderNum = m.sender?.replace(/[^0-9]/g, "") || "";
      const botNum = botJid.replace(/[^0-9]/g, "");
      m.isOwner = isJadibotOwner(jadibotId, m.sender) || senderNum === botNum;
      m.isPremium = isJadibotPremium(jadibotId, m.sender) || m.isOwner;
    }

    // Update/cache group names here; incoming-message terminal output is handled once
    // in connection.js so it still appears even when command handling fails early.
    if (m.isGroup) {
      const groupData = db.getGroup(m.chat);
      const groupName = groupData?.name || "Unknown Group";
      if (groupName === "Unknown Group" || groupName === "Unknown") {
        sock.groupMetadata(m.chat)
          .then((meta) => {
            if (meta?.subject) db.setGroup(m.chat, { name: meta.subject });
          })
          .catch(() => { });
      }
    }

    if (checkAfk) {
      checkAfk(m, sock).catch(() => { });
    }

    if (m.isGroup && !m.isNewsletter) {
      cacheMessageForAntiRemove(m, sock, db);

      const spamCloseTriggered = await handleSpamClose(m, sock, db);
      if (spamCloseTriggered) return;

      const antiJudolTriggered = await handleAntiJudol(m, sock, db);
      if (antiJudolTriggered) return;

      const antiPhisingTriggered = await handleAntiPhising(m, sock, db);
      if (antiPhisingTriggered) return;

      const antiCustomTriggered = await handleAntiCustom(m, sock, db);
      if (antiCustomTriggered) return;

      const antilinkTriggered = await handleAntilink(m, sock, db);
      if (antilinkTriggered) return;

      const antilinkGcTriggered = await handleAntilinkGc(m, sock, db);
      if (antilinkGcTriggered) return;

      const antilinkAllTriggered = await handleAntilinkAll(m, sock, db);
      if (antilinkAllTriggered) return;

      const antiHidetagTriggered = await handleAntiHidetag(m, sock, db);
      if (antiHidetagTriggered) return;

      const antiSwGcTriggered = await handleAntiSwGc(m, sock, db);
      if (antiSwGcTriggered) return;

      if (checkAntidocument) {
        const isAntidocument = await checkAntidocument(m, sock, db);
        if (isAntidocument) return;
      }

      if (detectBot && !m.isOwner && !m.isAdmin) {
        try {
          const botDetected = await detectBot(m, sock);
          if (botDetected) return;
        } catch (e) { }
      }

      if (isMuted && !m.isAdmin && !m.isOwner) {
        try {
          if (isMuted(m.chat, db)) {
            if (m.isBotAdmin) await sock.sendMessage(m.chat, { delete: m.key });
            return;
          }
        } catch (e) { }
      }

      if (isMutedMember && !m.isAdmin && !m.isOwner) {
        try {
          if (isMutedMember(m.chat, m.sender, db)) {
            if (m.isBotAdmin) await sock.sendMessage(m.chat, { delete: m.key });
            return;
          }
        } catch (e) { }
      }

      if (isMutegc && !m.isAdmin && !m.isOwner && !m.isPartner) {
        try {
          if (isMutegc(m.chat, db)) return;
        } catch (e) { }
      }

      if (checkSpam && handleSpamAction && !m.isAdmin) {
        try {
          const isSpam = await checkSpam(m, sock, db);
          if (isSpam) {
            const delayKey = `${m.chat}_${m.sender}`;
            spamDelayTracker.set(delayKey, Date.now());
            await handleSpamAction(m, sock, db);
          }
        } catch (e) { }
      }

      if (checkSlowmode && !m.isAdmin && !m.isOwner) {
        try {
          const slowResult = checkSlowmode(m, sock, db);
          if (slowResult) {
            if (slowResult.mode === "onlycommand") {
              if (m.isCommand) return;
            } else {
              await sock.sendMessage(m.chat, { delete: m.key });
              return;
            }
          }
        } catch (e) { }
      }

      if (isToxic && handleToxicMessage) {
        try {
          const groupData = db.getGroup(m.chat) || {};
          if (groupData.antitoxic && !m.isAdmin && !m.isOwner) {
            const toxicWords = groupData.toxicWords || [];
            const result = isToxic(m.body, toxicWords);
            if (result.toxic) {
              await handleToxicMessage(m, sock, db, result.word);
              return;
            }
          }
        } catch (e) { }
      }
    }

    if (m.isGroup && incrementChatCount) {
      try {
        incrementChatCount(m.chat, m.sender, db, m.pushName);
      } catch (e) { }
    }

    const modeCheck = checkMode(m, getActiveJadibots);
    if (!modeCheck.allowed) {
      if (modeCheck.isAfk && m.isCommand) {
        await m.reply(modeCheck.afkMessage);
      } else if (modeCheck.hasJadibots && m.isCommand && !isJadibot) {
        await sock.sendMessage(
          m.chat,
          {
            text: modeCheck.jadibotMessage,
            contextInfo: {
              ...saluranCtx(),
              mentionedJid: modeCheck.jadibotMentions,
            },
          },
          { quoted: m },
        );
      } else if (modeCheck.isOnlyThisGroup && m.isCommand) {
        await m.reply(modeCheck.onlyThisGroupMessage);
      }
      return;
    }

    if (m.isBanned) {
      if (m.isCommand) {
        await m
          .reply(
            config.messages?.banned ||
            "🚫 *Estás baneado y no puedes usar este bot.*",
          )
          .catch(() => { });
      }
      logger.warn("Banned user", m.sender);
      return;
    }

    if (m.isGroup && m.isCommand && !m.isOwner) {
      const groupData = db.getGroup(m.chat) || {};
      if (groupData.isBanned) {
        // kalau mau nambih text juga boleh bang, pake m.reply atau sendMessage
        return;
      }
    }

    const botId = sock.user?.id?.split(":")[0] || "unknown";
    const msgKey = `${botId}_${m.chat}_${m.sender}_${m.id}`;
    if (debounceMessage(msgKey)) {
      return;
    }

    if (db.setting("autoRead") ?? config.features?.autoRead) {
      sock.readMessages([m.key]).catch(() => { });
    }
    if (!m.pushName || m.pushName === "Unknown" || m.pushName.trim() === "") {
      if (!m.isCommand && !m.isBot && !m.fromMe && !m.isNewsletter) {
        return;
      }
      m.pushName = m.isNewsletter
        ? "Channel"
        : m.sender?.split("@")[0] || "User";
    }

    if (m.isCommand) {
      db.setUser(m.sender, {
        name: m.originalPushName || m.pushName,
        lastSeen: new Date().toISOString(),
      });
    }

    const cmdVnEnabled = db.setting("cmdVn") || false;
    if (
      cmdVnEnabled &&
      m.type === "audioMessage" &&
      !m.isCommand &&
      config.APIkey?.groq
    ) {
      let inputFile = null;
      let wavFile = null;
      const cleanupCmdVnFiles = () => {
        [inputFile, wavFile].forEach((filePath) => {
          if (!filePath) return;
          try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          } catch { }
        });
      };
      try {
        const audioMsg = m.message?.audioMessage;
        const maxSize = 500 * 1024;
        if (
          audioMsg &&
          (!audioMsg.fileLength || audioMsg.fileLength <= maxSize)
        ) {
          const buffer = await m.download();
          if (buffer && buffer.length > 1000) {
            const tmpDir = path.join(process.cwd(), "tmp");
            if (!fs.existsSync(tmpDir))
              fs.mkdirSync(tmpDir, { recursive: true });

            inputFile = path.join(tmpDir, `vncmd_${Date.now()}.ogg`);
            wavFile = path.join(tmpDir, `vncmd_${Date.now()}.wav`);

            fs.writeFileSync(inputFile, buffer);

            await new Promise((resolve, reject) => {
              exec(
                `ffmpeg -y -i "${inputFile}" -ar 16000 -ac 1 -f wav "${wavFile}"`,
                { timeout: 15000 },
                (err) => (err ? reject(err) : resolve()),
              );
            });

            const wavBuffer = fs.readFileSync(wavFile);
            const form = new FormData();
            form.append("file", wavBuffer, {
              filename: "audio.wav",
              contentType: "audio/wav",
            });
            form.append("model", "whisper-large-v3");
            form.append("language", "id");
            form.append("response_format", "json");

            const { data } = await axios.post(
              "https://api.groq.com/openai/v1/audio/transcriptions",
              form,
              {
                headers: {
                  ...form.getHeaders(),
                  Authorization: `Bearer ${config.APIkey.groq}`,
                },
                timeout: 30000,
                maxContentLength: Infinity,
              },
            );

            cleanupCmdVnFiles();
            inputFile = null;
            wavFile = null;

            const transcript = (data.text || "")
              .trim()
              .toLowerCase()
              .replace(/[.,!?;:'"]/g, "")
              .trim();

            if (transcript) {
              const words = transcript.split(/\s+/);
              const rawWord = words[0];
              const prefix = config.command?.prefix || ".";

              const allPlugins = getAllPlugins();
              const allNames = [];
              for (const p of allPlugins) {
                if (p.config?.name && typeof p.config.name === "string")
                  allNames.push(p.config.name.toLowerCase());
                if (Array.isArray(p.config?.alias)) {
                  for (const a of p.config.alias) {
                    if (a && typeof a === "string")
                      allNames.push(a.toLowerCase());
                  }
                }
              }

              let bestMatch = null;
              let bestScore = Infinity;

              for (const cmd of allNames) {
                if (cmd === rawWord) {
                  bestMatch = cmd;
                  bestScore = 0;
                  break;
                }
                if (rawWord.startsWith(cmd) && cmd.length >= 3) {
                  const score = rawWord.length - cmd.length;
                  if (score < bestScore) {
                    bestScore = score;
                    bestMatch = cmd;
                  }
                }
                const dist = levenshtein(rawWord, cmd);
                if (dist <= 3 && dist < bestScore) {
                  bestScore = dist;
                  bestMatch = cmd;
                }
              }

              if (bestMatch) {
                const commandArgs = words.slice(1).join(" ");
                m.body = `${prefix}${bestMatch}${commandArgs ? " " + commandArgs : ""}`;
                const { parseCommand } =
                  await import("./lib/core/serialize.js");
                const parsed = parseCommand(m.body, prefix);
                m.isCommand = parsed.isCommand;
                m.command = parsed.command;
                m.args = parsed.args;
                m.prefix = parsed.prefix;
                m.isVnCommand = true;
              }
            }
          }
        }
      } catch (e) {
        cleanupCmdVnFiles();
        console.error("[CMD VN] Error:", e.message);
      }
    }

    if (m.body) {
      try {
        const userObj = db.getUser(m.sender) || db.setUser(m.sender);

        if (levelHelper && levelHelper.addExpWithLevelCheck) {
          await levelHelper.addExpWithLevelCheck(sock, m, db, userObj, 15);
        }
      } catch (e) {
        console.error("[Level System] Error:", e.message);
      }
    }

    if (autoJoinDetector && m.body) {
      try {
        const joined = await autoJoinDetector(m, sock);
        if (joined) return;
      } catch (e) { }
    }

    if (m.body?.startsWith(">>") && m.isOwner) {
      const code = m.body.slice(2).trim();
      if (!code) return;

      try {
        const AsyncFunction = Object.getPrototypeOf(
          async function () { },
        ).constructor;

        const execCode = new AsyncFunction(
          "m",
          "sock",
          "db",
          "config",
          "getDatabase",
          "console",
          `
          const { default: axios } = await import('axios')
          const { default: fs } = await import('fs')
          const { default: path } = await import('path')
          const { default: os } = await import('os')
          const { promisify } = await import('util')
          const { generateWAMessage, getBuffer, generateWAMessageFromContent, proto, generateMessageID } = await import('@rexxhayanasi/elaina-baileys')
          const { exec: childExec } = await import('child_process')
          const { VERSION, Button, ButtonV2, Carousel, AIRich, } = await import('./lib/core/builder.js')
          const exec = promisify(childExec)

          ${code}
          `,
        );

        const result = await execCode(
          m,
          sock,
          db,
          config,
          getDatabase,
          console,
        );

        if (result !== undefined && result !== null) {
          const output =
            typeof result === "object"
              ? JSON.stringify(result, null, 2)
              : String(result);

          if (output.length > 0) {
            await m.reply(
              `✅ *ᴇxᴇᴄ ʀᴇsᴜʟᴛ*\n\n\`\`\`\n${output.substring(0, 4000)}\n\`\`\``,
            );
          }
        }
      } catch (execError) {
        await m.reply(
          `❌ *ᴇxᴇᴄ ᴇʀʀᴏʀ*\n\n\`\`\`\n${execError.message}\n\nStack:\n${execError.stack?.substring(0, 1000) || "N/A"}\n\`\`\``,
        );
      }
      return;
    }

    if (m.body?.startsWith("!!") && m.isOwner) {
      const expr = m.body.slice(2).trim();
      if (!expr) return;

      try {
        const AsyncFunction = Object.getPrototypeOf(
          async function () { },
        ).constructor;

        const inspectCode = new AsyncFunction(
          "m",
          "sock",
          "db",
          "config",
          "getDatabase",
          "console",
          `
          const util = await import('util')
          const { default: axios } = await import('axios')
          const { default: fs } = await import('fs')
          const { default: path } = await import('path')
          const { default: os } = await import('os')
          const { generateWAMessage, getBuffer, generateWAMessageFromContent, proto, generateMessageID } = await import('@rexxhayanasi/elaina-baileys')

          const result = await ${expr}
          if (result === undefined) return 'undefined'
          if (result === null) return 'null'
          if (typeof result === 'string') return result
          try {
            return util.inspect.default(result, { depth: 4, maxArrayLength: 30, maxStringLength: 300, breakLength: 60, compact: false })
          } catch {
            try { return JSON.stringify(result, null, 2) } catch { return String(result) }
          }
          `,
        );

        const output = await inspectCode(
          m,
          sock,
          db,
          config,
          getDatabase,
          console,
        );

        if (output && String(output).length > 0) {
          const str = String(output);
          await m.reply(
            `${str}`,
          );
        }
      } catch (inspectError) {
        await m.reply(
          `${inspectError.message}\n\`\`\``,
        );
      }
      return;
    }

    // Owner Dev Shortcuts (Kaguya-style: $, =>, >, ls tanpa prefix)
    if (m.isOwner && m.body) {
      const rawBody = m.body;

      // 1. $ <command> : Jalankan perintah terminal/shell
      if (rawBody.startsWith("$")) {
        const shellCmd = rawBody.slice(1).trim();
        if (!shellCmd) return;
        try {
          const { exec: childExec } = await import("child_process");
          childExec(
            shellCmd,
            { cwd: process.cwd(), timeout: 60000, maxBuffer: 10 * 1024 * 1024 },
            async (err, stdout, stderr) => {
              let out = "";
              if (stdout) out += stdout;
              if (stderr) out += (out ? "\n" : "") + stderr;
              if (err && !stderr) out += (out ? "\n" : "") + err.message;
              out = String(out || "").trim();
              if (!out) out = "✅ Terminado sin salida.";
              if (out.length > 4000) out = out.slice(0, 4000) + "\n... (truncated)";
              await m.reply(out).catch(() => {});
            },
          );
        } catch (e) {
          await m.reply(String(e?.message || e)).catch(() => {});
        }
        return;
      }

      // 2. => <code> : Async JS eval dengan auto-return
      if (rawBody.startsWith("=>")) {
        let code = rawBody.slice(2).trim();
        if (!code && m.quoted) code = (m.quoted.text || m.quoted.body || "").trim();
        if (!code) return;
        try {
          const util = await import("util");
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
          const fn = new AsyncFunction(
            "m",
            "sock",
            "db",
            "config",
            "getDatabase",
            "console",
            `
            const { default: axios } = await import('axios')
            const { default: fs } = await import('fs')
            const { default: path } = await import('path')
            const { default: os } = await import('os')
            const { promisify } = await import('util')
            const { exec: childExec } = await import('child_process')
            const exec = promisify(childExec)
            return (
              ${code}
            )
            `,
          );
          const result = await fn(m, sock, db, config, getDatabase, console);
          let out = util.format(result);
          if (out.length > 4000) out = out.slice(0, 4000) + "\n... (truncated)";
          await m.reply(out);
        } catch (e) {
          const util = await import("util");
          await m.reply(util.format(e).slice(0, 4000));
        }
        return;
      }

      // 3. > <code> : Async JS eval (statement / multi-line, tanpa auto-return)
      if (rawBody.startsWith(">") && !rawBody.startsWith(">>")) {
        let code = rawBody.slice(1).trim();
        if (!code && m.quoted) code = (m.quoted.text || m.quoted.body || "").trim();
        if (!code) return;
        try {
          const util = await import("util");
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
          const fn = new AsyncFunction(
            "m",
            "sock",
            "db",
            "config",
            "getDatabase",
            "console",
            `
            const { default: axios } = await import('axios')
            const { default: fs } = await import('fs')
            const { default: path } = await import('path')
            const { default: os } = await import('os')
            const { promisify } = await import('util')
            const { exec: childExec } = await import('child_process')
            const exec = promisify(childExec)
            ${code}
            `,
          );
          const result = await fn(m, sock, db, config, getDatabase, console);
          if (result !== undefined) {
            let out = util.format(result);
            if (out.length > 4000) out = out.slice(0, 4000) + "\n... (truncated)";
            await m.reply(out);
          }
        } catch (e) {
          const util = await import("util");
          await m.reply(util.format(e).slice(0, 4000));
        }
        return;
      }

      // 4. ls [path] : List isi folder/file direktori bot tanpa prefix
      if (/^ls(?:\s+.*)?$/i.test(rawBody.trim())) {
        const target = rawBody.trim().slice(2).trim();
        try {
          const { buildLsOutput } = await import("../plugins/owner/ls.js");
          await m.reply(buildLsOutput(target));
        } catch (e) {
          await m.reply(`❌ Error al leer el directorio: ${e.message}`);
        }
        return;
      }
    }

    const hasSuitGame =
      global.suitGames &&
      Object.values(global.suitGames).some(
        (r) =>
          (r.chat === m.chat || !m.isGroup) && [r.p, r.p2].includes(m.sender),
      );

    const hasTTTGame =
      global.tictactoeGames &&
      Object.values(global.tictactoeGames).some(
        (r) =>
          r.state === "PLAYING" &&
          r.chat === m.chat &&
          [r.game.playerX, r.game.playerO].filter(Boolean).includes(m.sender),
      );

    const hasUTGame = global.ulartanggaGames?.[m.chat]?.status === "PLAYING";

    // Tangkap jawaban tantangan Math tanpa prefix sebelum handler game lain.
    if (!m.isCommand && mathAnswerHandler) {
      try {
        const handled = await mathAnswerHandler(m, sock);
        if (handled) return;
      } catch (e) {
        console.error("[Handler] Math answer error:", e.message);
      }
    }

    let gameEvaluated = false;
    if (
      (hasActiveSession(m.chat) && m.quoted) ||
      hasSuitGame ||
      hasTTTGame ||
      hasUTGame
    ) {
      gameEvaluated = true;
      const gameHandled = await handleGameAnswer(m, sock);
      if (gameHandled) return;
    }

    try {
      if (kyubigameAnswerHandler) {
        const handled = await kyubigameAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Kyubigame answer error:", e.message);
    }

    try {
      if (family100AnswerHandler) {
        const handled = await family100AnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Family100 answer error:", e.message);
    }

    try {
      if (pushkontakAnswerHandler) {
        const handled = await pushkontakAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Pushkontak answer error:", e.message);
    }

    try {
      if (dafontAnswerHandler) {
        const handled = await dafontAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] Dafont answer error:", e.message);
    }

    try {
      if (gantiAssetAnswerHandler) {
        const handled = await gantiAssetAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] GantiAsset answer error:", e.message);
    }

    try {
      if (srtAnswerHandler) {
        const handled = await srtAnswerHandler(m, sock);
        if (handled) return;
      }
    } catch (e) {
      console.error("[Handler] SRT answer error:", e.message);
    }

    if (!m.isCommand) {
      if (hasActiveSession(m.chat) && !gameEvaluated) {
        gameEvaluated = true;
        const gameHandled = await handleGameAnswer(m, sock);
        if (gameHandled) return;
      }

      // Menfess: reply pesan menfess dari bot di chat pribadi → balasan anonim tanpa perintah
      if (!m.isGroup && !m.fromMe && (m.quoted?.id || m.quoted?.key?.id)) {
        const menfessHandled = await menfessReplyHandler(m, { sock });
        if (menfessHandled) return;
      }

      // Gemini: reply jawaban Gemini dari bot -> lanjut ngobrol tanpa perintah
      if (geminiPlugin?.replyHandler && !m.fromMe && m.quoted?.id) {
        const geminiHandled = await geminiPlugin.replyHandler(m, { sock });
        if (geminiHandled) return;
      }

      // AudioSticker (.saudio): captura el audio/nota de voz directamente cuando la sesión de 60 segundos está activa
      if (!m.fromMe && globalThis.__audioStickerSessions?.has(`${m.chat}:${m.sender}`)) {
        const asMod = await import("../plugins/convert/audiosticker.js").catch(() => null);
        if (asMod?.handleAudioStickerBefore) {
          const handled = await asMod.handleAudioStickerBefore(m, sock);
          if (handled) return;
        }
      }

      // Game Miku: tangkap input langkah/tebakan saat sesi game aktif di chat
      if (!m.fromMe && globalThis.__mikuGameSessions?.has(m.chat)) {
        const gameMod = await import("./lib/features/miku-game.js").catch(() => null);
        if (gameMod?.handleActiveGameInput) {
          const gameHandled = await gameMod.handleActiveGameInput(m, sock);
          if (gameHandled) return;
        }
      }

      // AMPrem: tangkap link firebase verifikasi Alight Motion secara otomatis
      if (!m.fromMe && global.ampremState?.[m.sender] && /alight-creative\.firebaseapp\.com/i.test(m.body || m.text || "")) {
        const ampremMod = await import("../plugins/premium/amprem.js").catch(() => null);
        if (ampremMod?.replyHandler) {
          const amHandled = await ampremMod.replyHandler(m);
          if (amHandled) return;
        }
      }

      const smartHandled = await handleSmartTriggers(m, sock, db);
      if (smartHandled) return;

      if (m.quoted?.id || m.quoted?.key?.id) {
        try {
          if (anticustomReplyHandler) {
            const handled = await anticustomReplyHandler(m, { sock });
            if (handled) return;
          }
          if (
            global.confessData?.has(m.quoted.id) &&
            confessPlugin?.replyHandler
          ) {
            const handled = await confessPlugin.replyHandler(m, { sock });
            if (handled) return;
          }
          if (
            global.sulapSessions?.has(m.quoted.id) &&
            sulapPlugin?.replyHandler
          ) {
            const handled = await sulapPlugin.replyHandler(m, sock);
            if (handled) return;
          }
        } catch { }
      }

      if (autoStickerHandler && m.isGroup) {
        autoStickerHandler(m, sock).catch(() => { });
      }

      if (autoMediaHandler && m.isGroup) {
        autoMediaHandler(m, sock).catch(() => { });
      }

      if (checkAntisticker && m.isGroup) {
        const stickerHandled = await checkAntisticker(m, sock, db);
        if (stickerHandled) return;
      }

      if (checkAntimedia && m.isGroup) {
        const mediaHandled = await checkAntimedia(m, sock, db);
        if (mediaHandled) return;
      }

      if (handleStickerReply && m.isGroup) {
        const stickerReplyHandled = await handleStickerReply(m, sock);
        if (stickerReplyHandled) return;
      }

      if (checkStickerCommand) {
        try {
          const stickerCmd = checkStickerCommand(m);
          if (stickerCmd) {
            const prefix = m.prefix || config.command?.prefix || ".";
            m.body = `${prefix}${stickerCmd}`;
            const { parseCommand } = await import("./lib/core/serialize.js");
            const parsed = parseCommand(m.body, prefix);
            m.isCommand = parsed.isCommand;
            m.command = parsed.command;
            m.args = parsed.args;
            m.prefix = parsed.prefix;
          }
        } catch (e) {
          console.error("[Handler] Sticker command error:", e.message);
        }
      }

      if (!m.isCommand) return;
    }

    const delayKey = `${m.chat}_${m.sender}`;
    if (!m.isOwner && !m.isPremium) {
      const lastSpamDetect = spamDelayTracker.get(delayKey);
      if (lastSpamDetect) {
        const elapsed = Date.now() - lastSpamDetect;
        if (elapsed < 10000) {
          await new Promise((r) => setTimeout(r, 500));
        } else {
          spamDelayTracker.delete(delayKey);
        }
      }
    }

    const spamKey = `${botId}_${m.sender}`;
    if (!m.isOwner && !m.isPremium && (await isSpamming(spamKey))) {
      return;
    }

    const storeData = db.setting("storeList") || {};
    const storeCommand = storeData[m.command.toLowerCase()];

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      const botMode = groupData.botMode || "all";

      if (botMode === "store" && storeCommand) {
        storeData[m.command.toLowerCase()].views =
          (storeCommand.views || 0) + 1;
        db.setting("storeList", storeData);

        const caption =
          `📦 *${m.command.toUpperCase()}*\n\n` +
          `${storeCommand.content}\n\n` +
          `───────────────\n` +
          `> 👁️ Views: ${storeData[m.command.toLowerCase()].views}\n` +
          `> 💳 Escribe \`${m.prefix}payment\` para pagar`;

        if (storeCommand.hasImage && storeCommand.imagePath) {
          try {
            const imageBuffer = await getCachedThumb(storeCommand.imagePath);
            if (imageBuffer) {
              await sock.sendMessage(
                m.chat,
                {
                  image: imageBuffer,
                  caption: caption,
                },
                { quoted: m },
              );
              return;
            }
          } catch (e) {
            console.error("Error al cargar el almacén de imágenes:", e.message);
          }
        }

        await m.reply(caption);
        return;
      }
    }

    if (isCaseCommand(m.command)) {
      if (!(await enforceDailyFeatureLimit(m, db))) return;

      try {
        const caseResult = await handleCaseCommand(m, sock);
        if (caseResult && caseResult.handled) {
          consumeDailyFeatureIfNeeded(m, db);
          if (config.dev?.debugLog) {
            logger.success("Case", `Handled: ${m.command}`);
          }
          return;
        }
      } catch (caseError) {
        logger.error("Case System", caseError.message);
        if (config.dev?.debugLog) {
          console.error("[CaseSystem] Stack:", caseError.stack);
        }
      }
    }
    let plugin = getPlugin(m.command);

    if (!plugin) {
      if (storeCommand) {
        storeData[m.command.toLowerCase()].views =
          (storeCommand.views || 0) + 1;
        db.setting("storeList", storeData);

        const caption =
          `📦 *${m.command.toUpperCase()}*\n\n` +
          `${storeCommand.content}\n\n` +
          `───────────────\n` +
          `> 👁️ Views: ${storeData[m.command.toLowerCase()].views}\n` +
          `> 💳 Escribe \`${m.prefix}payment\` para pagar`;

        if (storeCommand.hasImage && storeCommand.imagePath) {
          try {
            const imageBuffer = await getCachedThumb(storeCommand.imagePath);
            if (imageBuffer) {
              await sock.sendMessage(
                m.chat,
                {
                  image: imageBuffer,
                  caption: caption,
                },
                { quoted: m },
              );
              return;
            }
          } catch (e) {
            console.error("Error al cargar el almacén de imágenes:", e.message);
          }
        }

        await m.reply(caption);
        return;
      }

      return;
    }

    if (!plugin.config.isEnabled) {
      return;
    }

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      let botMode = groupData.botMode || "all";
      const pluginCategory = plugin.config.category?.toLowerCase();
      const baseAllowed = ["main", "group", "sticker", "owner"];

      if (isJadibot) {
        botMode = "all";

        const jadibotBlockedCategories = [
          "owner",
          "sewa",
          "panel",
          "store",
          "pushkontak",
        ];
        const jadibotBlockedCommands = [
          "sewa",
          "sewabot",
          "sewalist",
          "listsewa",
          "addsewa",
          "delsewa",
          "extendsewa",
          "checksewa",
          "sewainfo",
          "sewagroup",
          "stopsewa",
          "jadibot",
          "listjadibot",
          "addowner",
          "delowner",
          "ownerlist",
          "listowner",
          "self",
          "public",
          "botmode",
          "restart",
          "shutdown",
        ];

        if (
          jadibotBlockedCategories.includes(pluginCategory) ||
          jadibotBlockedCommands.includes(m.command.toLowerCase())
        ) {
          return m.reply(
            `⚠️ *ᴀᴄᴄᴇsᴏ ʀᴇsᴛʀɪɴɢɪᴅᴏ*\n\n` +
            `Esta función solo está disponible en el bot principal.\n` +
            `Jadibot no puede acceder a esta función.\n\n` +
            `> Contacta al dueño del bot principal para más información.`,
          );
        }
      }

      const modeConfig = {
        all: { allowed: null, excluded: null, name: "All Features" },
        md: {
          allowed: null,
          excluded: ["pushkontak", "store", "panel", "otp"],
          name: "Multi Device",
        },
        pushkontak: {
          allowed: [...baseAllowed, "pushkontak"],
          name: "Envío de contactos",
        },
        store: { allowed: [...baseAllowed, "store"], name: "Store" },
        otp: { allowed: [...baseAllowed, "otp"], name: "OTP" },
      };

      const categoryModeMap = {
        download: "md",
        search: "md",
        ai: "md",
        fun: "md",
        game: "md",
        media: "md",
        utility: "md",
        tools: "md",
        ephoto: "md",
        religi: "md",
        info: "md",
        pushkontak: "pushkontak",
        store: "store",
        otp: "otp",
        jpm: "md",
      };

      const currentConfig = modeConfig[botMode] || modeConfig.all;

      if (
        m.command !== "botmode" &&
        m.command !== "menu" &&
        m.command !== "allmenu" &&
        m.command !== "xozo"
      ) {
        let isBlocked = false;

        if (
          currentConfig.allowed &&
          !currentConfig.allowed.includes(pluginCategory)
        ) {
          isBlocked = true;
        }
        if (
          currentConfig.excluded &&
          currentConfig.excluded.includes(pluginCategory)
        ) {
          isBlocked = true;
        }

        if (isBlocked) {
          const suggestedMode = categoryModeMap[pluginCategory] || "all";
          const suggestedModeName =
            modeConfig[suggestedMode]?.name || "Multi Device";

          await m.reply(
            `🔒 *ᴄᴏᴍᴍᴀɴᴅ ᴛɪᴅᴀᴋ ᴛᴇʀsᴇᴅɪᴀ*\n\n` +
            `> El bot está en modo *${currentConfig.name}*\n` +
            `> El comando \`${m.prefix}${m.command}\` está disponible en el modo *${suggestedModeName}*\n\n` +
            `💡 Contacta a un administrador del grupo para cambiar el modo:\n` +
            `\`${m.prefix}botmode ${suggestedMode}\``,
          );
          return;
        }
      }

      if (!m.isAdmin && !m.isOwner) {
        const pluginCat = plugin.config.category?.toLowerCase();
        const grpData = db.getGroup(m.chat) || {};

        if (pluginCat === "game" && grpData.game === false && m.command !== "xozo") {
          await m.reply(
            `🎮 *JUEGOS DESACTIVADOS*\n\nUn administrador desactivó los juegos en este grupo.\nPídele que los active de nuevo con el comando *${m.prefix}game on*`
          );
          return;
        }

      }
    }

    const permission = checkPermission(m, plugin.config);
    if (!permission.allowed) {
      await m.reply(permission.reason);
      return;
    }

    const user = db.getUser(m.sender);

    // Wajib Daftar (Registration Gate) untuk kategori Clan, Game, Fun, Cek, dan User
    const regExemptCmds = new Set([
      "daftar", "reg", "register", "verifikasi", "verify",
      "unreg", "unregister", "hapusdaftar", "ceksn", "sn",
      "kartudaftar", "idcard", "listdaftar", "menu", "allmenu", "help"
    ]);
    const regRequiredCats = new Set(["clan", "game", "games", "fun", "cek", "user"]);
    const pCatLower = String(plugin.config?.category || "").toLowerCase();
    const cmdLower = String(m.command || plugin.config?.name || "").toLowerCase();
    const isUserRegistered = Boolean(user?.isRegistered);

    if (
      !m.isOwner &&
      !regExemptCmds.has(cmdLower) &&
      (plugin.config?.isRegistered === true || regRequiredCats.has(pCatLower)) &&
      !isUserRegistered
    ) {
      const p = m.prefix || config.command?.prefix || ".";
      const thumbReg = "https://cdn.zass.in/P3Q2YXg8u3.jpeg"; // Thumbnail langsung untuk peringatan belum daftar
      const regMsg =
        `╭─── ❖ 『 🔒 *ACCESO SOLO PARA AVENTUREROS* 』 ❖\n` +
        `│ ✦ ¡Hola *@${m.sender.split("@")[0]}*!\n` +
        `│ ✦ La función *${p}${m.command}* (Categoría: *${pCatLower.toUpperCase()}*) solo puede usarla un miembro registrado.\n` +
        `├─── ❖ 『 📝 *CÓMO REGISTRARTE RÁPIDO* 』 ❖\n` +
        `│ 📌 *Escribe:* \`${p}daftar Nombre.Edad\`\n` +
        `│ ✨ *Ejemplo:* \`${p}daftar ${m.pushName || "Arthazy"}.19\`\n` +
        `├─── ❖ 『 🎁 *REGALO DE REGISTRO* 』 ❖\n` +
        `│ 💰 *+Rp 25.000* monedas y *+15.000* EXP\n` +
        `│ ⚡ *+15* energía y *+5* pociones de vida\n` +
        `╰──────────────────────────❖\n` +
        `_✦ ¡Regístrate gratis ahora y empieza tu aventura!_`;
      try {
        await sock.sendMessage(
          m.chat,
          {
            text: regMsg,
            contextInfo: {
              mentionedJid: [m.sender],
              externalAdReply: {
                title: "🔒 REGISTRO OBLIGATORIO",
                body: `¡Escribe ${p}daftar Nombre.Edad para abrir esta función!`,
                thumbnailUrl: thumbReg,
                mediaType: 1,
                renderLargerThumbnail: false,
              },
            },
          },
          { quoted: m }
        );
      } catch {
        await m.reply(regMsg, { mentions: [m.sender] });
      }
      return;
    }
    const dailyFeatureStatus = getDailyFeatureStatus(
      db,
      m.sender,
      getDailyLimitParticipants(m),
    );

    if (!m.isOwner && !m.isPartner && plugin.config.cooldown > 0) {
      const cooldownRemaining = db.checkCooldown(
        m.sender,
        m.command,
        plugin.config.cooldown,
      );
      if (cooldownRemaining) {
        m.react("⏱️").catch(() => { });
        return;
      }
    }

    if (!(await enforceDailyFeatureLimit(m, db))) return;

    const energiEnabled =
      db.setting("energi") !== undefined
        ? db.setting("energi")
        : config.energi?.enabled !== false;

    const capEnergiOverrides = db.setting("capenergi") || {};
    const pluginEnergiCost = capEnergiOverrides[plugin.config.name] !== undefined ? capEnergiOverrides[plugin.config.name] : (plugin.config.energi || 0);

    if (energiEnabled && pluginEnergiCost > 0 && user?.energi !== -1 && !dailyFeatureStatus.unlimited) {
      const ownerEnergi = config.energi?.owner ?? -1;
      const premiumEnergi = config.energi?.premium ?? -1;
      const defaultEnergi = config.energi?.default ?? 0;

      let currentEnergi;
      if (
        (m.isOwner || m.isPartner) &&
        (ownerEnergi === -1 || user?.energi === -1)
      ) {
      } else if (m.isPremium && (premiumEnergi === -1 || user?.energi === -1)) {
      } else {
        currentEnergi =
          user?.energi ??
          (m.isOwner || m.isPartner
            ? ownerEnergi
            : m.isPremium
              ? premiumEnergi
              : defaultEnergi);
        if (currentEnergi < pluginEnergiCost) {
          await m.reply(config.messages?.energiExceeded || "⚡ Energi habis!");
          return;
        }
        db.updateEnergi(m.sender, -pluginEnergiCost);

        if (db.setting("notiflimit")) {
          let limitMsg = config.messages?.limitDeducted || "🔋 Tu límite bajó en {amount}. Límite restante: {sisa}";
          limitMsg = limitMsg.replace("{amount}", pluginEnergiCost.toString()).replace("{sisa}", (currentEnergi - pluginEnergiCost).toString());
          await m.reply(limitMsg);
        }
      }
    }

    if (db.setting("autoTyping") ?? config.features?.autoTyping) {
      sock.sendPresenceUpdate("composing", m.chat).catch(() => { });
    }

    const context = {
      sock,
      m,
      args: m.args || [],
      text: m.text || "",
      command: m.command || "",
      prefix: m.prefix || config.command?.prefix || ".",
      config,
      db,
      uptime: getUptime(),
      plugins: {
        count: getPluginCount(),
      },
      jadibotId: jadibotId,
      isJadibot: isJadibot,
    };

    await plugin.handler(m, context);
    consumeDailyFeatureIfNeeded(m, db);

    if (!m.isOwner && !m.isPartner && plugin.config.cooldown > 0) {
      db.setCooldown(m.sender, m.command, plugin.config.cooldown);
    }

    db.incrementStat("commandsExecuted");
    db.incrementStat(`command_${m.command}`);

    if (db.setting("autoTyping") ?? config.features?.autoTyping) {
      sock.sendPresenceUpdate("paused", m.chat).catch(() => { });
    }
  } catch (error) {
    // Abaikan reject/throw kosong (undefined/null) agar console tidak spam "handler > undefined"
    if (error === undefined || error === null) {
      return;
    }

    // Jika plugin melempar string (pola klasik: throw "pesan panduan"), kirim langsung ke user tanpa log FAIL
    if (typeof error === "string") {
      const cleanMsg = error.trim();
      if (cleanMsg) {
        try {
          const m = await serialize(sock, msg);
          if (m) await m.reply(cleanMsg);
        } catch {}
      }
      return;
    }

    const errMsg =
      error?.message ||
      (typeof error === "object"
        ? (() => {
            try {
              return JSON.stringify(error);
            } catch {
              return String(error);
            }
          })()
        : String(error));

    logger.error("handler", errMsg);
    if (error?.stack) {
      console.error("[Handler Stack]", error.stack);
    }

    try {
      const db = getDatabase();
      if (db) {
        db.incrementStat("commandErrors");
        const errorLog = db.setting("errorLog") || [];
        errorLog.unshift({
          cmd: "unknown",
          err: String(errMsg).substring(0, 200),
          at: Date.now(),
        });
        if (errorLog.length > 50) errorLog.splice(50);
        db.setting("errorLog", errorLog);
      }
    } catch { }

    try {
      const m = await serialize(sock, msg);
      if (m) {
        await m.reply(`Parece que hubo un problema, contacta al dueño`);
      }
    } catch {
      logger.error("Failed to send error message");
    }
  }
}

/**
 * Handler untuk update group participants
 * @param {Object} update - Update data
 * @param {Object} sock - Socket connection
 * @returns {Promise<void>}
 */
async function groupHandler(update, sock) {
  try {
    if (global.sewaLeaving) return;

    const { id: groupJid, participants, action } = update;

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return;
    }

    const db = getDatabase();

    let groupData = db.getGroup(groupJid);
    if (!groupData) {
      db.setGroup(groupJid, {
        welcome: config.welcome?.defaultEnabled ?? true,
        goodbye: config.goodbye?.defaultEnabled ?? true,
        leave: config.goodbye?.defaultEnabled ?? true,
      });
      groupData = db.getGroup(groupJid);
    }

    let groupMeta;
    try {
      const cached = global.groupMetadataCache?.get(groupJid);
      if (cached && Date.now() - (cached._ts || 0) < 30000) {
        groupMeta = cached;
      } else {
        groupMeta = await sock.groupMetadata(groupJid);
        if (global.groupMetadataCache) {
          groupMeta._ts = Date.now();
          global.groupMetadataCache.set(groupJid, groupMeta);
        }
      }

      if (groupMeta?.participants) {
        cacheParticipantLids(groupMeta.participants);
      }
    } catch (e) {
      if (
        e.message?.includes("forbidden") ||
        e.message?.includes("401") ||
        e.message?.includes("403")
      ) {
        return;
      }
      if (
        e.message?.includes("rate-overlimit") ||
        e?.output?.statusCode === 429
      ) {
        logger.warn("GroupHandler", "rate-limited, skipping event");
        return;
      }
      throw e;
    }

    for (let participant of participants) {
      let participantJid;

      if (typeof participant === "object" && participant !== null) {
        participantJid =
          participant.jid || participant.id || participant.lid || "";
      } else {
        participantJid = participant;
      }

      if (!participantJid || typeof participantJid !== "string") continue;

      if (isLid(participantJid) || isLidConverted(participantJid)) {
        const found = groupMeta.participants?.find(
          (p) =>
            p.id === participantJid ||
            p.lid === participantJid ||
            p.lid === participantJid.replace("@s.whatsapp.net", "@lid"),
        );
        if (found) {
          participantJid =
            found.jid &&
              !found.jid.endsWith("@lid") &&
              !isLidConverted(found.jid)
              ? found.jid
              : found.id &&
                !found.id.endsWith("@lid") &&
                !isLidConverted(found.id)
                ? found.id
                : lidToJid(participantJid);
        } else {
          participantJid = lidToJid(participantJid);
        }
      }

      participant = participantJid;

      if (action === "add" && sendWelcomeMessage) {
        await sendWelcomeMessage(sock, groupJid, participant, groupMeta);
      }

      if (action === "remove" && sendGoodbyeMessage) {
        await sendGoodbyeMessage(sock, groupJid, participant, groupMeta);
      }

      const saluranId = config.saluran?.id || "120363393471527483@newsletter";
      const saluranName =
        config.saluran?.name || config.bot?.name || "Ai Miku";

      let groupPpUrl = null;
      try {
        groupPpUrl = await sock.profilePictureUrl(groupJid, "image");
      } catch { }

      const rankActions = {
        promote: {
          notifKey: "notifPromote",
          emoji: "🎉",
          label: "PROMOTE",
          text: (p, a) =>
            `🌿 @${p} ahora es administrador nuevo 💕\nPromovido por: @${a}`,
        },
        demote: {
          notifKey: "notifDemote",
          emoji: "📉",
          label: "DEMOTE",
          text: (p, a) =>
            `🌿 @${p} ya no es administrador.\nDegradado por: @${a}`,
        },
      };

      const rankCfg = rankActions[action];
      if (rankCfg && groupData[rankCfg.notifKey] === true) {
        const author = update.author || null;
        const pNum = participant.split("@")[0];
        const aNum = author?.split("@")[0] || "Unknown";
        const mentions = author ? [participant, author] : [participant];
        // Notifikasi teks saja (tanpa gambar)
        await sock.sendMessage(groupJid, {
          text: `${rankCfg.emoji} *${rankCfg.label}*\n\n${rankCfg.text(pNum, aNum)}`,
          mentions,
        });
      }
    }
  } catch (error) {
    console.error("[GroupHandler] Error:", error.message);
  }
}

async function messageUpdateHandler(updates, sock) {
  const db = getDatabase();

  for (const update of updates) {
    try {
      await handleAntiRemove(update, sock, db);
    } catch (error) {
      continue;
    }

    try {
      const editedMsg = update.update?.message?.editedMessage?.message;
      const regularMsg = update.update?.message;

      const resolvedMessage =
        editedMsg ||
        (regularMsg && !regularMsg.protocolMessage ? regularMsg : null);

      if (!resolvedMessage) continue;

      const newMsg = {
        key: update.key,
        message: editedMsg ? { ...resolvedMessage } : regularMsg,
        messageTimestamp:
          update.messageTimestamp || Math.floor(Date.now() / 1000),
        pushName: update.pushName || "User",
      };

      await messageHandler(newMsg, sock);
    } catch (error) {
      console.error("[MsgUpdate] Error:", error.message);
    }
  }
}

/**
 * Cache untuk menyimpan state terakhir grup
 * Format: { groupId: { announce: boolean, restrict: boolean, lastUpdate: timestamp } }
 */
const groupSettingsCache = new Map();

/**
 * Debounce cooldown untuk mencegah spam (dalam ms)
 */
const GROUP_SETTINGS_COOLDOWN = 1000;

async function groupSettingsHandler(update, sock) {
  try {
    if (global.sewaLeaving) return;
    if (global.isFetchingGroups) return;

    const groupId = update.id;
    if (!groupId || !groupId.endsWith("@g.us")) return;

    if (update.announce === undefined && update.restrict === undefined) {
      return;
    }

    const cached = groupSettingsCache.get(groupId) || {};
    const now = Date.now();

    if (
      cached.lastUpdate &&
      now - cached.lastUpdate < GROUP_SETTINGS_COOLDOWN
    ) {
      return;
    }

    let hasRealChange = false;

    let groupName = groupId;
    let groupPpUrl = null;
    try {
      const meta = await sock.groupMetadata(groupId);
      groupName = meta?.subject || groupId;
    } catch { }
    try {
      groupPpUrl = await sock.profilePictureUrl(groupId, "image");
    } catch { }

    const db = getDatabase();
    const groupData = db.getGroup(groupId) || {};

    const zannContext = {
      contextInfo: saluranCtx(),
    };

    if (update.announce !== undefined) {
      if (cached.announce === undefined) {
        cached.announce = update.announce;
      } else if (cached.announce !== update.announce) {
        hasRealChange = true;

        if (update.announce === true && groupData.notifCloseGroup === true) {
          await sock.sendText(
            groupId,
            `🥗 El grupo *${groupName}* fue cerrado por un administrador`,
            null,
            zannContext,
          );
        }

        if (update.announce === false && groupData.notifOpenGroup === true) {
          await sock.sendText(
            groupId,
            `🎃 El grupo *${groupName}* fue reabierto por un administrador`,
            null,
            zannContext,
          );
        }

        cached.announce = update.announce;
      }
    }

    if (update.restrict !== undefined) {
      if (cached.restrict === undefined) {
        cached.restrict = update.restrict;
      } else if (cached.restrict !== update.restrict) {
        hasRealChange = true;

        if (update.restrict === true) {
          await sock.sendText(
            groupId,
            `🥗 ¡Información del grupo *${groupName}* restringida!\nSolo los administradores pueden editar el grupo`,
            null,
            zannContext,
          );
        } else {
          await sock.sendText(
            groupId,
            `🥗 ¡Información del grupo *${groupName}* abierta!\nTodos los miembros pueden editar el grupo`,
            null,
            zannContext,
          );
        }
        cached.restrict = update.restrict;
      }
    }
    if (hasRealChange) {
      cached.lastUpdate = now;
    }
    if (cached.announce !== undefined || cached.restrict !== undefined) {
      groupSettingsCache.set(groupId, cached);
    }
  } catch (error) {
    console.error("[GroupSettings] Error:", error.message);
  }
}

export {
  messageHandler,
  groupHandler,
  messageUpdateHandler,
  groupSettingsHandler,
  checkPermission,
  checkMode,
  isSpamming,
  handleAntiRemoveFromUpsert,
};
