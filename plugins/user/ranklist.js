/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { ASTRAL_RANKS, calculateLevel, getRankInfo } from "../../src/lib/data/level.js";
import { renderRankList, getUserAvatar } from "../../src/lib/core/rank-canvas.js";
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
  name: "ranklist",
  alias: ["daftarrank", "tierlevel", "listrank", "infopangkat"],
  category: "user",
  description: "Melihat daftar lengkap 21 pangkat Astral beserta syarat level dan bonusnya",
  usage: ".ranklist",
  example: ".ranklist",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender) || {};
  const myLevel = calculateLevel(user.exp || 0);

  const ascending = [...ASTRAL_RANKS].reverse();
  const open = ascending.filter((r) => myLevel >= r.min).length;
  const caption =
    `🏆 *KATALOG PANGKAT ASTRAL* 🏆\n\n` +
    `> Level kamu: *Lv.${myLevel}* • ${getRankInfo(myLevel).title}\n` +
    `> Pangkat terbuka: *${open}/${ascending.length}*\n\n` +
    `_✦ Naikkan levelmu dengan bermain fitur RPG & klaim hadiah di *${m.prefix || "."}claimlevel*_`;

  try {
    const image = await renderRankList({
      name: user.regName || user.name || m.pushName || "Petualang",
      avatar: await getUserAvatar(sock, m.sender),
      myLevel,
      ranks: ascending,
      botName: config.bot?.name || "Ai Miku",
    });
    return await sock.sendMessage(m.chat, { image, caption }, { quoted: m });
  } catch {
    return m.reply(caption);
  }
}

export { pluginConfig as config, handler };
