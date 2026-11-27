/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";
import { getDatabase } from "../data/database.js";

const DEFAULT_RP = {
  mood: "✨ Santai",
  affection: 0,
  given: 0,
  received: 0,
  counts: {},
};

export function getRpStats(jid) {
  const db = getDatabase();
  const user = db.getUser(jid) || db.setUser(jid);
  const rp = user?.rpStats && typeof user.rpStats === "object" ? user.rpStats : {};
  return {
    mood: rp.mood || DEFAULT_RP.mood,
    affection: Number(rp.affection || 0),
    given: Number(rp.given || 0),
    received: Number(rp.received || 0),
    counts: rp.counts && typeof rp.counts === "object" ? { ...rp.counts } : {},
  };
}

export function saveRpStats(jid, rpStats) {
  const db = getDatabase();
  const user = db.getUser(jid) || db.setUser(jid);
  if (!user) return;
  user.rpStats = rpStats;
  db.setUser(jid, user);
}

export function getRpTitle(affection = 0) {
  if (affection >= 200) return "🌸 Miku Soulmate";
  if (affection >= 100) return "💖 Starlight Sweetheart";
  if (affection >= 50) return "✨ Crystal Companion";
  if (affection >= 20) return "🌷 Warm Friend";
  return "🌱 Newcomer";
}

export function resolveRpTarget(m) {
  const mentioned =
    (Array.isArray(m.mentionedJid) && m.mentionedJid[0]) ||
    (Array.isArray(m.mentions) && m.mentions[0]) ||
    null;
  if (mentioned) return mentioned;
  if (m.quoted?.sender) return m.quoted.sender;
  return null;
}

export async function fetchAnimeReaction(action) {
  const waifuMap = {
    hug: "hug",
    pat: "pat",
    kiss: "kiss",
    slap: "slap",
    cuddle: "cuddle",
    bonk: "bonk",
    poke: "poke",
    bite: "bite",
    dance: "dance",
    blush: "blush",
  };
  const endpoint = waifuMap[action] || "hug";

  try {
    const res = await axios.get(`https://api.waifu.pics/sfw/${endpoint}`, {
      timeout: 10000,
    });
    if (res.data?.url) return res.data.url;
  } catch {}

  try {
    const res = await axios.get(`https://nekos.best/api/v2/${endpoint}`, {
      timeout: 10000,
    });
    const url = res.data?.results?.[0]?.url;
    if (url) return url;
  } catch {}

  return null;
}

export async function executeRpAction(
  m,
  sock,
  {
    action,
    emoji,
    label,
    needTarget = true,
    affectionDelta = 5,
    templateTarget,
    templateSelf,
  }
) {
  const target = resolveRpTarget(m);
  const senderTag = `@${String(m.sender || "").split("@")[0]}`;

  if (needTarget && !target) {
    return m.reply(
      `${emoji} Tag atau reply seseorang untuk melakukan *${label}*!\n> Contoh: \`${m.prefix}${action} @user\``
    );
  }

  const isSelf = !target || target === m.sender;
  const targetTag = target ? `@${String(target).split("@")[0]}` : senderTag;

  // Update RP stats
  const senderStats = getRpStats(m.sender);
  senderStats.given += 1;
  senderStats.counts[action] = (senderStats.counts[action] || 0) + 1;
  senderStats.affection = Math.max(0, senderStats.affection + Math.max(1, Math.floor(affectionDelta / 2)));
  saveRpStats(m.sender, senderStats);

  if (!isSelf && target) {
    const targetStats = getRpStats(target);
    targetStats.received += 1;
    targetStats.affection = Math.max(0, targetStats.affection + affectionDelta);
    saveRpStats(target, targetStats);
  }

  const line = isSelf
    ? templateSelf.replace(/\{sender\}/g, senderTag)
    : templateTarget
        .replace(/\{sender\}/g, senderTag)
        .replace(/\{target\}/g, targetTag);

  const caption =
    `╭─❖「 ${emoji} *ROLEPLAY — ${label.toUpperCase()}* 」\n` +
    `│ ${line}\n` +
    `╰─────────────────────❖`;

  const mentions = isSelf ? [m.sender] : [m.sender, target];
  const mediaUrl = await fetchAnimeReaction(action);

  if (mediaUrl) {
    try {
      const isGif = /\.gif(\?|$)/i.test(mediaUrl);
      if (isGif) {
        await sock.sendMessage(
          m.chat,
          { image: { url: mediaUrl }, caption, mentions },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(
          m.chat,
          { image: { url: mediaUrl }, caption, mentions },
          { quoted: m }
        );
      }
      return;
    } catch {}
  }

  await sock.sendMessage(m.chat, { text: caption, mentions }, { quoted: m });
}
