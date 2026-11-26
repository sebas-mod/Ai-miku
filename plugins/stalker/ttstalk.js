/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";

const pluginConfig = {
  name: "ttstalk",
  alias: ["stalktt", "tiktokstalk"],
  category: "stalker",
  description: "Cek profil TikTok berdasarkan username",
  usage: ".ttstalk <username>",
  example: ".ttstalk tiktok",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 6, energi: 1, isEnabled: true,
};

async function fetchTikTokProfile(username) {
  try {
    const { data } = await axios.get(`https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(username)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 14000,
    });
    const u = data?.data?.user;
    const s = data?.data?.stats;
    if (u?.uniqueId) {
      return {
        username: u.uniqueId,
        nickname: u.nickname || "-",
        bio: u.signature || "-",
        verified: Boolean(u.verified),
        followers: s?.followerCount ?? 0,
        following: s?.followingCount ?? 0,
        likes: s?.heartCount ?? s?.heart ?? 0,
        videos: s?.videoCount ?? 0,
        avatar: u.avatarLarger || u.avatarMedium || null,
      };
    }
  } catch {}

  try {
    const { data } = await axios.get(`https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(username)}`, { timeout: 14000 });
    const u = data?.data?.user || data?.data;
    const s = data?.data?.stats || u;
    if (u && (u.uniqueId || u.username)) {
      return {
        username: u.uniqueId || u.username,
        nickname: u.nickname || u.name || "-",
        bio: u.signature || u.bio || "-",
        verified: Boolean(u.verified),
        followers: s?.followerCount ?? s?.followers ?? 0,
        following: s?.followingCount ?? s?.following ?? 0,
        likes: s?.heartCount ?? s?.likes ?? 0,
        videos: s?.videoCount ?? s?.videos ?? 0,
        avatar: u.avatarLarger || u.avatar || null,
      };
    }
  } catch {}

  return null;
}

async function handler(m, { sock }) {
  const username = String(m.text || "").trim().replace(/^@/, "");
  if (!username) return m.reply(`🎵 Masukkan username TikTok!\n> Contoh: \`${m.prefix}ttstalk tiktok\``);

  await m.react("🔎");
  const u = await fetchTikTokProfile(username);
  if (!u) {
    await m.react("❌");
    return m.reply(`❌ Profil TikTok *@${username}* tidak ditemukan.`);
  }

  const fmt = (v) => Number(v || 0).toLocaleString("id-ID");
  const caption =
    `╭─❖「 🎵 *TIKTOK STALKER* 」\n` +
    `│ 👤 Nama      : *${u.nickname}* ${u.verified ? "☑️" : ""}\n` +
    `│ 🔖 Username  : \`@${u.username}\`\n` +
    `├───〔 *STATISTIK* 〕\n` +
    `│ 👥 Followers : *${fmt(u.followers)}*\n` +
    `│ 🤝 Following : *${fmt(u.following)}*\n` +
    `│ ❤️ Likes     : *${fmt(u.likes)}*\n` +
    `│ 🎬 Video     : *${fmt(u.videos)}*\n` +
    `├───〔 *BIO* 〕\n` +
    `│ ${String(u.bio || "-").slice(0, 220)}\n` +
    `│ 🔗 https://www.tiktok.com/@${u.username}\n` +
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
