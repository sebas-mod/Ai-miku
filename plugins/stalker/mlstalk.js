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
  name: "mlstalk",
  alias: ["stalkml", "cekml"],
  category: "stalker",
  description: "Cek nickname akun Mobile Legends dari User ID & Zone ID",
  usage: ".mlstalk <id> <zone>",
  example: ".mlstalk 12345678 1234",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 1, isEnabled: true,
};

async function handler(m) {
  const parts = String(m.text || "").trim().replace(/[()|]/g, " ").split(/\s+/).filter(Boolean);
  const [userId, zoneId] = parts;
  if (!userId || !zoneId) {
    return m.reply(`⚔️ Masukkan User ID & Zone ID Mobile Legends!\n> Contoh: \`${m.prefix}mlstalk 12345678 1234\``);
  }

  await m.react("🔎");
  const endpoints = [
    `https://api.siputzx.my.id/api/stalk/ml?id=${encodeURIComponent(userId)}&zone=${encodeURIComponent(zoneId)}`,
    `https://api.agatz.xyz/api/mlstalk?id=${encodeURIComponent(userId)}&zone=${encodeURIComponent(zoneId)}`,
    `https://api.nexray.web.id/stalk/ml?id=${encodeURIComponent(userId)}&zone=${encodeURIComponent(zoneId)}`,
  ];

  for (const url of endpoints) {
    try {
      const { data } = await axios.get(url, { timeout: 12000 });
      const d = data?.data || data?.result || data;
      const nick = d?.username || d?.nickname || d?.userName || d?.name;
      if (nick) {
        await m.react("✅");
        return m.reply(
          `╭─❖「 ⚔️ *MOBILE LEGENDS STALKER* 」\n` +
          `│ 👤 Nickname : *${nick}*\n` +
          `│ 🆔 User ID  : \`${userId}\`\n` +
          `│ 🌐 Zone ID  : \`${zoneId}\`\n` +
          (d?.region || d?.country ? `│ 🏳️ Region   : ${d.region || d.country}\n` : "") +
          `╰─────────────────────❖`
        );
      }
    } catch {}
  }

  await m.react("❌");
  await m.reply(`❌ Akun Mobile Legends \`${userId} (${zoneId})\` tidak ditemukan.`);
}

export { pluginConfig as config, handler };
