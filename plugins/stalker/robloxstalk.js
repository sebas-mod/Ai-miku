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
  name: "robloxstalk",
  alias: ["stalkroblox", "rbstalk"],
  category: "stalker",
  description: "Cek profil, bio, dan avatar pengguna Roblox",
  usage: ".robloxstalk <username>",
  example: ".robloxstalk Builderman",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 1, isEnabled: true,
};

async function handler(m, { sock }) {
  const username = String(m.text || "").trim().replace(/^@/, "");
  if (!username) return m.reply(`🧱 Masukkan username Roblox!\n> Contoh: \`${m.prefix}robloxstalk Builderman\``);

  await m.react("🔎");
  try {
    const lookup = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      { usernames: [username], excludeBannedUsers: false },
      { timeout: 12000 }
    );
    const base = lookup.data?.data?.[0];
    if (!base?.id) {
      await m.react("❌");
      return m.reply(`❌ Akun Roblox *${username}* tidak ditemukan.`);
    }

    const uid = base.id;
    const [detailRes, friendsRes, followersRes, thumbRes] = await Promise.all([
      axios.get(`https://users.roblox.com/v1/users/${uid}`, { timeout: 12000 }),
      axios.get(`https://friends.roblox.com/v1/users/${uid}/friends/count`, { timeout: 10000 }).catch(() => ({ data: {} })),
      axios.get(`https://friends.roblox.com/v1/users/${uid}/followers/count`, { timeout: 10000 }).catch(() => ({ data: {} })),
      axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${uid}&size=420x420&format=Png&isCircular=false`, { timeout: 10000 }).catch(() => ({ data: {} })),
    ]);

    const u = detailRes.data || {};
    const avatarUrl = thumbRes.data?.data?.[0]?.imageUrl || null;
    const created = u.created ? new Date(u.created).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "-";

    const caption =
      `╭─❖「 🧱 *ROBLOX STALKER* 」\n` +
      `│ 👤 Display   : *${u.displayName || base.displayName}* ${u.hasVerifiedBadge ? "☑️" : ""}\n` +
      `│ 🔖 Username  : \`@${u.name || base.name}\`\n` +
      `│ 🆔 User ID   : \`${uid}\`\n` +
      `│ 🚫 Banned    : ${u.isBanned ? "Ya" : "Tidak"}\n` +
      `│ 📅 Dibuat    : ${created}\n` +
      `├───〔 *STATISTIK* 〕\n` +
      `│ 🤝 Friends   : *${Number(friendsRes.data?.count || 0).toLocaleString("id-ID")}*\n` +
      `│ 👥 Followers : *${Number(followersRes.data?.count || 0).toLocaleString("id-ID")}*\n` +
      `├───〔 *BIO* 〕\n` +
      `│ ${(u.description || "-").slice(0, 220)}\n` +
      `│ 🔗 https://www.roblox.com/users/${uid}/profile\n` +
      `╰─────────────────────❖`;

    if (avatarUrl) {
      await sock.sendMessage(m.chat, { image: { url: avatarUrl }, caption }, { quoted: m });
    } else {
      await m.reply(caption);
    }
    await m.react("✅");
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ Gagal mengambil data Roblox: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
