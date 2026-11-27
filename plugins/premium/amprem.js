/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";

const pluginConfig = {
  name: "amprem",
  alias: ["batalkan"],
  category: "premium",
  description: "Activa cuentas de Alight Motion Premium por Magic Link",
  usage: ".amprem <email>",
  example: ".amprem emailkamu@gmail.com",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const AM_API_HOST = "https://am.zervida.my.id";
const ENDPOINT_LINK = `${AM_API_HOST}/api/amprem/link`;
const ENDPOINT_CLAIM = `${AM_API_HOST}/api/amprem/claim`;
const SESSION_TIMEOUT = 5 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIREBASE_LINK_PATTERN = /https?:\/\/alight-creative\.firebaseapp\.com\/\S+/i;

global.ampremState = global.ampremState || {};

function clearAmSession(userId) {
  if (global.ampremState[userId]?.timer) {
    clearTimeout(global.ampremState[userId].timer);
  }
  delete global.ampremState[userId];
}

function registerAmSession(m, email) {
  const userId = m.sender;
  clearAmSession(userId);
  const timer = setTimeout(() => {
    if (global.ampremState[userId]?.timer !== timer) return;
    delete global.ampremState[userId];
    m.reply("⌛ La sesión de reclamo de Alight Motion Premium se cancela automáticamente (tiempo de espera de 5 minutos).").catch(() => {});
  }, SESSION_TIMEOUT);
  timer.unref?.();
  global.ampremState[userId] = { email, timer, createdAt: Date.now() };
}

async function processAmClaim(m, email, link) {
  await m.react("⏳").catch(() => {});
  await m.reply("⏳ *Verificando enlace y habilitando Alight Motion Premium...*");
  try {
    const { data = {} } = await axios.post(
      ENDPOINT_CLAIM,
      { email, link },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      }
    );
    if (data.status === "premium" || data.success === true) {
      await m.react("✅").catch(() => {});
      return m.reply(
        `╭─── ❖ 『 🎉 *ALIGHT MOTION PREMIUM ACTIVO* 』 ❖\n` +
          `│ 📧 *Email:* \`${email}\`\n` +
          `│ 💎 *ESTADO:* PREMIUM ACTIVO\n` +
          `│ 📱 ¡Vuelva a abrir su aplicación Alight Motion!\n` +
          `╰──────────────────────────❖\n` +
          `_✦ Ai Miku • Premium Service_`
      );
    }
    await m.react("❌").catch(() => {});
    return m.reply(
      `⚠️ *El reclamo no ha tenido éxito.*\n> ${data.error || data.message || "Inténtalo de nuevo en unos minutos."}`
    );
  } catch (err) {
    await m.react("❌").catch(() => {});
    return m.reply(
      `❌ *No se pudo reclamar:* ${err.response?.data?.error || err.response?.data?.message || err.message || "Inténtalo más tarde."}`
    );
  }
}

export async function replyHandler(m) {
  const state = global.ampremState?.[m.sender];
  if (!state) return false;
  const rawText = String(m.body || m.text || "").trim();
  const match = rawText.match(FIREBASE_LINK_PATTERN);
  if (!match) return false;

  const email = state.email;
  clearAmSession(m.sender);
  await processAmClaim(m, email, match[0]);
  return true;
}

async function handler(m) {
  const userId = m.sender;
  const p = m.prefix || ".";
  const cmd = String(m.command || "amprem").toLowerCase();
  const rawText = String(m.text || "").trim();
  const parts = rawText.split(/\s+/).filter(Boolean);

  if (cmd === "batalkan") {
    if (!global.ampremState[userId]) {
      return m.reply("ℹ️ Actualmente no hay sesiones de activación de Alight Motion en ejecución.");
    }
    clearAmSession(userId);
    await m.react("🛑").catch(() => {});
    return m.reply(
      `✅Sesión de activación cancelada.\n> Escribe \`${p}amprem email@ejemplo.com\` en cualquier momento para reiniciar.`
    );
  }

  // Tangkap jika user mengirim link firebase saat sesi aktif
  const linkFound = rawText.match(FIREBASE_LINK_PATTERN)?.[0] || null;
  const emailFound = parts.find((v) => EMAIL_PATTERN.test(v)) || null;

  if (!emailFound && linkFound && global.ampremState[userId]) {
    const savedEmail = global.ampremState[userId].email;
    clearAmSession(userId);
    return processAmClaim(m, savedEmail, linkFound);
  }

  if (!emailFound) {
    return m.reply(
      `╭─── ❖ 『 💎 *ALIGHT MOTION PREMIUM* 』 ❖\n` +
        `│ 📌 *Cómo usarlo:*\n` +
        `│ 1. Ketik \`${p}amprem emailkamu@gmail.com\`\n` +
        `│ 2. Revisa la bandeja de entrada/spam y copia el enlace *"Sign in to Alight Creative"*\n` +
        `│ 3. Enviar el enlace a este chat (límite 5 minuto)\n` +
        `│ 4. Tipo \`${p}batalkan\` para cancelar la sesión\n` +
        `╰──────────────────────────❖`
    );
  }

  if (linkFound) {
    clearAmSession(userId);
    return processAmClaim(m, emailFound, linkFound);
  }

  await m.react("⏳").catch(() => {});
  try {
    const { data } = await axios.post(
      ENDPOINT_LINK,
      { email: emailFound },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    if (data?.status === "premium") {
      clearAmSession(userId);
      await m.react("✅").catch(() => {});
      return m.reply(`🎉 *Cuenta \`${emailFound}¡\` tiene el estado PREMIUM!*`);
    }
  } catch (err) {
    clearAmSession(userId);
    await m.react("❌").catch(() => {});
    return m.reply(
      `❌ *No se pudo enviar el enlace de verificación:* ${err.response?.data?.error || err.response?.data?.message || err.message || "El servidor está ocupado."}`
    );
  }

  registerAmSession(m, emailFound);
  await m.react("📩").catch(() => {});
  return m.reply(
    `╭─── ❖ 『 📩 *MAGIC LINK TERKIRIM* 』 ❖\n` +
      `│ 📧 *Email:* \`${emailFound}\`\n` +
      `│ ✦ Revisa tu bandeja de entrada/spam, luego copia el enlace *"Iniciar sesión en Alight Creative"* y envíalo directamente a este chat.\n` +
      `│ ⏱️ Límite de tiempo: *5 minutos*\n` +
      `│ 🛑 Batalkan: \`${p}batalkan\`\n` +
      `╰──────────────────────────❖`
  );
}

export { pluginConfig as config, handler };
