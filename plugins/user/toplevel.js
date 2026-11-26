/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
import { getRankInfo } from "../../src/lib/data/level.js";
import { collectRankingUsers, jidDigits } from "../../src/lib/data/ranking.js";
import { renderTop10, getUserAvatar, fmtInt } from "../../src/lib/core/rank-canvas.js";

const pluginConfig = {
  name: "toplevel",
  alias: ["lblevel", "topxp", "leaderboardlevel", "rankglobal"],
  category: "user",
  description: "Papan peringkat 10 petualang dengan Level & EXP tertinggi (gambar)",
  usage: ".toplevel",
  example: ".toplevel",
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
  const all = collectRankingUsers(db)
    .filter((u) => u.exp > 0)
    .sort((a, b) => b.exp - a.exp);

  if (!all.length) return m.reply(`📊 Belum ada data peringkat level saat ini.`);

  const myId = jidDigits(m.sender);
  const myIndex = all.findIndex((u) => u.id === myId);
  const top = all.slice(0, 10);
  const avatars = await Promise.all(top.map((u) => getUserAvatar(sock, u.jid)));

  const image = await renderTop10({
    key: "toplevel",
    title: "TOP 10 LEVEL",
    subtitle: "Hall of Fame petualang Astral",
    accent: "#a78bfa",
    rows: top.map((u, i) => ({
      name: u.name,
      avatar: avatars[i],
      isMe: u.id === myId,
      main: `Lv.${u.level}`,
      mainLabel: `${fmtInt(u.exp)} XP`,
      sub: getRankInfo(u.level).title,
    })),
    me: { rank: myIndex >= 0 ? myIndex + 1 : 0, total: all.length },
    botName: config.bot?.name || "Ai Miku",
  });

  const caption =
    `🏆 *HALL OF FAME • TOP LEVEL* 🏆\n\n` +
    (myIndex >= 0
      ? `> Posisi kamu: *#${myIndex + 1}* dari *${fmtInt(all.length)}* petualang.`
      : `> Kamu belum masuk peringkat.`);

  try {
    await sock.sendMessage(m.chat, { image, caption }, { quoted: m });
  } catch {
    await m.reply(caption);
  }
}

export { pluginConfig as config, handler };
