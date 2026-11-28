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
  name: "ffstalk",
  alias: ["stalkff", "cekff"],
  category: "stalker",
  description: "Consulta el apodo y la info de la cuenta de Free Fire por UID",
  usage: ".ffstalk <uid>",
  example: ".ffstalk 123456789",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 1, isEnabled: true,
};

async function handler(m) {
  const uid = String(m.text || "").trim().replace(/[^0-9]/g, "");
  if (!uid) return m.reply(`🔥 ¡Escribe el UID de Free Fire!\n> Ejemplo: \`${m.prefix}ffstalk 123456789\``);

  await m.react("🔎");
  const endpoints = [
    `https://api.siputzx.my.id/api/stalk/ff?id=${encodeURIComponent(uid)}`,
    `https://api.nexray.eu.cc/stalk/ff?id=${encodeURIComponent(uid)}`,
    `https://api.agatz.xyz/api/ffstalk?id=${encodeURIComponent(uid)}`,
  ];

  for (const url of endpoints) {
    try {
      const { data } = await axios.get(url, { timeout: 12000 });
      const d = data?.data || data?.result || data;
      const nick = d?.nickname || d?.username || d?.name || d?.account?.nickname;
      if (nick) {
        const level = d?.level || d?.account?.level || "-";
        const likes = d?.likes || d?.liked || d?.account?.liked || "-";
        const region = d?.region || d?.account?.region || "-";
        await m.react("✅");
        return m.reply(
          `╭─❖「 🔥 *FREE FIRE STALKER* 」\n` +
          `│ 👤 Nickname : *${nick}*\n` +
          `│ 🆔 UID      : \`${uid}\`\n` +
          `│ ⭐ Level    : *${level}*\n` +
          `│ 👍 Likes    : *${likes}*\n` +
          `│ 🏳️ Region   : ${region}\n` +
          `╰─────────────────────❖`
        );
      }
    } catch {}
  }

  await m.react("❌");
  await m.reply(`❌ No se encontró la cuenta de Free Fire con UID \`${uid}\`.`);
}

export { pluginConfig as config, handler };
