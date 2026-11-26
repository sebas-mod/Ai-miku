/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
const pluginConfig = {
  name: "donasi",
  alias: ["donate", "donation", "support", "saweria", "trakteer"],
  category: "main",
  description: "Información de donaciones para apoyar el bot con QRIS",
  usage: ".donasi",
  example: ".donasi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const botName = config.bot?.name || "Ai Miku";
  const ownerName = config.owner?.name || "Owner";
  const saluranId = config.saluran?.id || "120363393471527483@newsletter";
  const saluranName = config.saluran?.name || botName;

  const donasiConfig = config.donasi || {};
  const payments = donasiConfig.payment || [];
  const links = donasiConfig.links || [];
  const qrisUrl = donasiConfig.qris || "";
  const benefits = donasiConfig.benefits || [
    "Apoya el desarrollo",
    "Servidor más estable",
    "Funciones nuevas más rápido",
    "Soporte prioritario",
  ];

  let text = `DONACIÓN AL DUEÑO DE ${botName} 🙏`;

  if (payments.length > 0 || links.length > 0) {
    text += `Pagos\n`;
    for (const pay of payments) {
      text += `🏦 *${pay.name
        ?.toLowerCase()
        .split("")
        .map((c, i) => (i === 0 ? c.toUpperCase() : c))
        .join("")}*\n`;
      text += `◦ ${pay.number} (a nombre de ${pay.holder})\n`;
    }

    for (const link of links) {
      const icons = {
        saweria: "☕",
        trakteer: "🍵",
        paypal: "💰",
        default: "🔗",
      };
      const icon = icons[link.name?.toLowerCase()] || icons.default;
      text += `${icon} *${link.name}*\n`;
      text += `${link.url}\n`;
    }
  } else {
    text += `╭┈┈⬡「 💳 *ᴘᴀʏᴍᴇɴᴛ* 」\n`;
    text += `┃\n`;
    text += `┃ > Sin configurar todavía\n`;
    text += `┃ > Edita config.donasi\n`;
    text += `┃\n`;
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  }

  text += `🎁 *ʙᴇɴᴇꜰɪᴛ*\n`;
  for (const benefit of benefits) {
    text += `◦ ${benefit}\n`;
  }
  text += `\n`;

  text += `_Cualquier donación, por pequeña que sea, ayuda muchísimo_\n`;
  text += `Contacto: @${config.owner?.number?.[0] || "owner"}`;

  const copyButtons = payments.map((pay) => ({
    name: "cta_copy",
    buttonParamsJson: JSON.stringify({
      display_text: `📋 Copiar n.º ${pay.name}`,
      copy_code: pay.number,
    }),
  }));

  const contextInfo = {
    mentionedJid: config.owner?.number?.[0]
      ? [`${config.owner.number[0]}@s.whatsapp.net`]
      : [],
    forwardingScore: 9999,
    isForwarded: true
  };

  if (qrisUrl) {
    try {
      const response = await fetch(qrisUrl);
      const qrisBuffer = Buffer.from(await response.arrayBuffer());

      await sock.sendButton(m.chat, qrisBuffer, text, m, {
        buttons: copyButtons,
      });
    } catch (e) {
      await sock.sendButton(m.chat, null, text, m, {
        buttons: copyButtons,
      });
    }
  } else {
    await sock.sendMessage(
      m.chat,
      {
        text: text,
        footer: botName,
        contextInfo: contextInfo,
        interactiveButtons: copyButtons,
      },
      { quoted: m },
    );
  }
}

export { pluginConfig as config, handler };
