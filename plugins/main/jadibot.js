/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { startJadibot, isJadibotActive } from "../../src/lib/features/jadibot-manager.js";

const pluginConfig = {
  name: "jadibot",
  alias: ["jadibotqr", "becomebot"],
  category: "main",
  description: "Convierte tu número en un bot (código de emparejamiento / QR)",
  usage: ".jadibot [número] o .jadibot qr",
  example: ".jadibot",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const arg0 = String(m.args?.[0] || "").trim().toLowerCase();
  const useQR = arg0 === "qr" || m.command === "jadibotqr";

  let targetJid = m.sender;
  if (targetJid?.endsWith("@lid") && sock?.getJid) {
    targetJid = sock.getJid(targetJid) || targetJid;
  }

  // Permite escribir el número a mano si m.sender sigue siendo @lid o se quiere otro número
  if (!useQR && arg0 && /^\+?[0-9]{10,15}$/.test(arg0.replace(/[\s-]/g, ""))) {
    let num = arg0.replace(/[^0-9]/g, "");
    if (num.startsWith("0")) num = "62" + num.slice(1);
    targetJid = `${num}@s.whatsapp.net`;
  }

  if (!targetJid || !targetJid.includes("@s.whatsapp.net")) {
    return m.reply(
      `❌ No se pudo identificar tu número de WhatsApp.\n` +
        `> Prueba con: \`${m.prefix || "."}jadibot 628xxxxxxxxxx\``
    );
  }

  const cleanNum = targetJid.replace(/@.+/g, "").split(":")[0].replace(/[^0-9]/g, "");
  targetJid = `${cleanNum}@s.whatsapp.net`;

  if (isJadibotActive(targetJid)) {
    return m.reply(
      `⚠️ *ᴊᴀᴅɪʙᴏᴛ ʏᴀ ᴀᴄᴛɪᴠᴏ*\n\n` +
        `> El número *@${cleanNum}* ya es un bot.\n` +
        `> Escribe \`${m.prefix || "."}stopjadibot\` para detenerlo.`,
      { mentions: [targetJid] }
    );
  }

  if (useQR) {
    await m.reply(
      `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴍᴏᴅᴏ ǫʀ*\n\n` +
        `> 📱 Objetivo: *@${cleanNum}*\n` +
        `> ⏳ Preparando la conexión...\n` +
        `> Escanea el código QR que se enviará.`,
      { mentions: [targetJid] }
    );
  } else {
    await m.reply(
      `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴄᴏ́ᴅɪɢᴏ ᴅᴇ ᴇᴍᴘᴀʀᴇᴊᴀᴍɪᴇɴᴛᴏ*\n\n` +
        `> 📱 Objetivo: *@${cleanNum}*\n` +
        `> ⏳ Preparando la conexión y solicitando el código...`,
      { mentions: [targetJid] }
    );
  }

  try {
    await startJadibot(sock, m, targetJid, !useQR);
  } catch (e) {
    // Evita el mensaje duplicado si startJadibot ya avisó del error en el chat
    if (!e?.alreadyNotified) {
      await m.reply(
        `❌ *ᴊᴀᴅɪʙᴏᴛ ꜰᴀʟʟɪᴅᴏ*\n\n` +
          `> ${e.message || "Ocurrió un error al iniciar jadibot."}`
      );
    }
  }
}

export { pluginConfig as config, handler };
