/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import te from "../../src/lib/core/error.js";
const pluginConfig = {
  name: "leave",
  alias: ["leavegrup", "leavegroup", "keluar", "bye"],
  category: "owner",
  description: "El bot sale del grupo",
  usage: ".leave [link]",
  example: ".leave",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function extractInviteCode(text) {
  const patterns = [
    /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/i,
    /wa\.me\/([a-zA-Z0-9]{20,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

async function handler(m, { sock }) {
  const input = m.args.join(" ").trim();

  let targetGroupJid = null;
  let groupName = "";

  if (!input && m.isGroup) {
    targetGroupJid = m.chat;
    try {
      const meta = m.groupMetadata;
      groupName = meta.subject || "Este grupo";
    } catch {
      groupName = "Este grupo";
    }
  } else if (input) {
    const inviteCode = await extractInviteCode(input);

    if (!inviteCode) {
      return m.reply(`❌ *ERROR*\n\n> Enlace de invitación no válido`);
    }

    try {
      const groupInfo = await sock.groupGetInviteInfo(inviteCode);
      targetGroupJid = groupInfo.id;
      groupName = groupInfo.subject || "Unknown";
    } catch (error) {
      return m.reply(
        `❌ *ERROR*\n\n> No se pudo obtener la información del grupo desde el enlace`,
      );
    }
  } else {
    return m.reply(
      `🚪 *SALIR DEL GRUPO*\n\n` +
        `╭┈┈⬡「 📋 *CÓMO USAR* 」\n` +
        `┃ ◦ En el grupo: \`.leave\`\n` +
        `┃ ◦ Via link: \`.leave <link>\`\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo: ${m.prefix}leave https://chat.whatsapp.com/xxx\``,
    );
  }

  if (!targetGroupJid) {
    return m.reply(`❌ *ERROR*\n\n> Grupo no encontrado`);
  }

  await m.react("🕕");

  try {
    global.sewaLeaving = true;

    const saluranId = config.saluran?.id || "120363393471527483@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Ai Miku";

    if (m.isGroup && targetGroupJid === m.chat) {
      await sock.sendMessage(m.chat, {
        text:
          `👋 *DESPEDIDA*\n\n` +
          `> El bot saldrá de este grupo.\n` +
          ` > ¡Gracias por usar el bot!`,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true
        },
      });
    }

    await sock.groupLeave(targetGroupJid);

    global.sewaLeaving = false;

    if (!m.isGroup || targetGroupJid !== m.chat) {
      await m.react("✅");
      await m.reply(
        `✅ *SALIDA COMPLETADA*\n\n` + `> El bot salió de: *${groupName}*`,
      );
    }
  } catch (error) {
    global.sewaLeaving = false;
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
