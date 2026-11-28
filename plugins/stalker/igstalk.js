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
  name: "igstalk",
  alias: ["stalkig", "instagramstalk"],
  category: "stalker",
  description: "Cek profil Instagram berdasarkan username",
  usage: ".igstalk <username>",
  example: ".igstalk instagram",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 6, energi: 1, isEnabled: true,
};

async function fetchIgProfile(username) {
  const endpoints = [
    `https://api.siputzx.my.id/api/stalk/instagram?username=${encodeURIComponent(username)}`,
    `https://api.agatz.xyz/api/igstalk?message=${encodeURIComponent(username)}`,
    `https://api.nexray.eu.cc/stalk/instagram?username=${encodeURIComponent(username)}`,
  ];
  for (const url of endpoints) {
    try {
      const { data } = await axios.get(url, { timeout: 14000 });
      const d = data?.data || data?.result || data;
      if (d && (d.username || d.full_name || d.fullname)) {
        return {
          username: d.username || username,
          fullname: d.full_name || d.fullname || d.name || "-",
          bio: d.biography || d.bio || "-",
          followers: d.followers_count ?? d.followers ?? "-",
          following: d.following_count ?? d.following ?? "-",
          posts: d.posts_count ?? d.posts ?? d.media_count ?? "-",
          verified: Boolean(d.is_verified || d.verified),
          private: Boolean(d.is_private || d.private),
          avatar: d.profile_pic_url_hd || d.profile_pic_url || d.avatar || d.photo || null,
        };
      }
    } catch {}
  }
  return null;
}

async function handler(m, { sock }) {
  const username = String(m.text || "").trim().replace(/^@/, "");
  if (!username) return m.reply(`📸 ¡Escribe el nombre de usuario de Instagram!\n> Ejemplo: \`${m.prefix}igstalk instagram\``);

  await m.react("🔎");
  const u = await fetchIgProfile(username);
  if (!u) {
    await m.react("❌");
    return m.reply(`❌ El perfil de Instagram *@${username}* no existe o está restringido.`);
  }

  const fmt = (v) => (typeof v === "number" ? v.toLocaleString("id-ID") : String(v));
  const caption =
    `╭─❖「 📸 *INSTAGRAM STALKER* 」\n` +
    `│ 👤 Nombre    : *${u.fullname}* ${u.verified ? "☑️" : ""}\n` +
    `│ 🔖 Username  : \`@${u.username}\`\n` +
    `│ 🔒 Privado   : ${u.private ? "Sí" : "No"}\n` +
    `├───〔 *STATISTIK* 〕\n` +
    `│ 🖼️ Postingan : *${fmt(u.posts)}*\n` +
    `│ 👥 Followers : *${fmt(u.followers)}*\n` +
    `│ 🤝 Following : *${fmt(u.following)}*\n` +
    `├───〔 *BIO* 〕\n` +
    `│ ${String(u.bio || "-").slice(0, 220)}\n` +
    `│ 🔗 https://instagram.com/${u.username}\n` +
    `╰─────────────────────❖`;

  if (u.avatar) {
    try {
      await sock.sendMessage(m.chat, { image: { url: u.avatar }, caption }, { quoted: m });
      await m.react("✅");
      return;
    } catch {}
  }
  await m.reply(caption);
  await m.react("✅");
}

export { pluginConfig as config, handler };
