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
  name: "confess",
  alias: ["confession", "anonim"],
  category: "fun",
  description: "Envía un mensaje anónimo a alguien",
  usage: ".confess número|mensaje",
  example: ".confess 6281234567890|¡Hola, me gustas!",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

if (!global.confessData) global.confessData = new Map();

async function handler(m, { sock }) {
  const input = m.fullArgs?.trim() || m.text?.trim();

  if (!input || !input.includes("|")) {
    let txt = `💌 *LAYANAN MENFESS ANONIM* 💌\n\n`;
    txt += `¿Quieres enviar un mensaje secreto a tu crush o a un amigo sin que te descubran? ¡Claro que sí!\n\n`;
    txt += `*Cómo usarlo:*\n`;
    txt += `👉 \`${m.prefix}confess número|mensaje\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `> \`${m.prefix}confess 6281234567890|Hola, ¡me encanta ver tu sonrisa!\`\n\n`;
    txt += `> 🤫 _Tranquilo, tu identidad está 100% segura y en secreto!_`;
    return m.reply(txt);
  }

  const [rawNumber, ...messageParts] = input.split("|");
  const message = messageParts.join("|").trim();

  if (!rawNumber || !message) {
    return m.reply(`¡Uy, el formato está mal! 😅\n\nPrueba a escribir así: \`${m.prefix}confess número|mensaje\``);
  }

  let targetNumber = rawNumber.trim().replace(/[^0-9]/g, "");

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`Hmm, ¡el número de destino que pusiste no parece válido! 🤔`);
  }

  const targetJid = targetNumber + "@s.whatsapp.net";
  const senderNumber = m.sender.split("@")[0];

  if (targetNumber === senderNumber) {
    return m.reply(`¿Enviarte un mensaje secreto a ti mismo? ¡Mejor dáselo a otra persona! 😂`);
  }

  try {
    const [onWa] = await sock.onWhatsApp(targetNumber);
    if (!onWa?.exists) {
      return m.reply(`Vaya, ¡el número \`${targetNumber}\` no está registrado en WhatsApp! 😔`);
    }
  } catch (e) {}

  if (message.length < 5) {
    return m.reply(`¡El mensaje es demasiado corto! Mínimo 5 caracteres para que tenga sentido. 📝`);
  }

  if (message.length > 1000) {
    return m.reply(`¡El mensaje es demasiado largo! Máximo 1000 caracteres para que no sea pesado. 📜`);
  }

  const confessText = `💌 *¡TIENES UN MENSAJE SECRETO!* 💌\n\n` +
    `Sshh... Alguien te ha enviado un mensaje en secreto:\n\n` +
    `💬 *Contenido del mensaje:*\n` +
    `\`\`\`${message}\`\`\`\n\n` +
    `> 🔒 _Este mensaje se envió de forma anónima (la identidad del remitente es secreta).\n` +
    `> ✉️ _¡Puedes responder a este mensaje! Solo tienes que *RESPONDER* al mensaje._`;

  try {
    const sentMsg = await sock.sendMessage(targetJid, {
      text: confessText,
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
      },
    });

    global.confessData.set(sentMsg.key.id, {
      senderJid: m.sender,
      senderChat: m.chat,
      targetJid: targetJid,
      createdAt: Date.now(),
    });

    setTimeout(() => {
      global.confessData.delete(sentMsg.key.id);
    }, 24 * 60 * 60 * 1000);

    let successTxt = `✅ *¡MENSAJE SECRETO ENVIADO!* ✅\n\n`;
    successTxt += `> 📱 Terkirim ke: \`${targetNumber}\`\n`;
    successTxt += `> 🔒 ¡Tu identidad está a salvo!\n\n`;
    successTxt += `> _Si te responde, ¡te lo haré llegar aquí mismo! Tranquilo_ 😉`;
    await m.reply(successTxt);
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;

  const quotedId = m.quoted?.id || m.quoted?.key?.id;
  if (!quotedId) return false;

  const confessInfo = global.confessData.get(quotedId);
  if (!confessInfo) return false;

  if (m.sender !== confessInfo.targetJid) return false;

  const replyMessage = m.body?.trim();
  if (!replyMessage) return false;

  const saluranId = config.saluran?.id || "120363408770415209@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "vemzo-AI";

  const replyText = `💌 *¡TIENES UNA RESPUESTA AL MENSAJE SECRETO!* 💌\n\n` +
    `La persona a la que enviaste el mensaje secreto acaba de responderte:\n\n` +
    `💬 *Isi Balasan:*\n` +
    `\`\`\`${replyMessage}\`\`\`\n\n` +
    `> 🔒 _Tranquilo, ¡tu identidad sigue siendo secreta!_`;

  try {
    await sock.sendMessage(confessInfo.senderChat, {
      text: replyText,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true
      },
    });

    await sock.sendMessage(m.chat, {
      text: `✅ ¡Listo! He entregado tu respuesta al remitente secreto.`,
    });

    global.confessData.delete(quotedId);
    return true;
  } catch (error) {
    return false;
  }
}

export { pluginConfig as config, handler, replyHandler };
