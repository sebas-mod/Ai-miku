/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getThumb } from "../../src/lib/core/media.js";
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
} from "@rexxhayanasi/elaina-baileys";
import { formatUptime } from "../../src/lib/core/formatter.js";
import {
  getCommandsByCategory,
  getCategories,
} from "../../src/lib/core/plugins.js";

const pluginConfig = {
  name: "menu",
  alias: ["help", "bantuan", "commands", "m"],
  category: "main",
  description: "Menampilkan menu utama bot",
  usage: ".menu",
  example: ".menu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const CATEGORY_EMOJIS = {
  owner: "👑",
  rpg: "⚔️",
  rich: "🕹️",
  stalker: "🔎",
  roleplay: "🎭",
  tebak: "🧩",
  vercel: "▲",
  audio: "🎧",
  maker: "🎨",
  channel: "📢",
  clan: "🏰",
  pushkontak: "📲",
  main: "🏠",
  utility: "🔧",
  tools: "🛠️",
  fun: "🎮",
  game: "🎯",
  download: "📥",
  downloader: "📥",
  search: "🔍",
  sticker: "🖼️",
  media: "🎬",
  ai: "🤖",
  group: "👥",
  religi: "☪️",
  islamic: "🕌",
  info: "ℹ️",
  cek: "🔮",
  menfess: "💌",
  user: "📊",
  canvas: "🎨",
  random: "🎲",
  ephoto: "🖌️",
  jpm: "📨",
  anime: "🍥",
  asupan: "🎞️",
  convert: "🔄",
  berita: "📰",
  nsfw: "🔞",
  linode: "☁️",
  primbon: "🔮",
  cecan: "💃",
  stalker: "🕵️",
  tts: "🗣️",
  vps: "🌊",
};

function getSortedCategories(m, botMode) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "rich",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "religi",
    "info",
    "cek",
    "menfess",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "pushkontak",
    "store",
  ];
  const modeAllowedMap = {
    md: null,
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  const modeExcludeMap = {
    md: ["pushkontak", "store"],
    store: null,
    pushkontak: null,
  };
  const allowedCats = modeAllowedMap[botMode];
  const excludeCats = modeExcludeMap[botMode] || [];
  const sortedCats = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const result = [];
  let totalCmds = 0;
  for (const cat of sortedCats) {
    if (cat === "owner" && !m.isOwner) continue;
    if (allowedCats && !allowedCats.includes(cat.toLowerCase())) continue;
    if (excludeCats && excludeCats.includes(cat.toLowerCase())) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[cat] || "📁";
    result.push({ cat, cmds, emoji });
  }
  for (const cat of categories) {
    totalCmds += (commandsByCategory[cat] || []).length;
  }
  return { sorted: result, totalCmds, commandsByCategory };
}

// Hasil upload gambar header dipakai ulang agar menu terkirim cepat
let _headerCache = { key: null, media: null, ts: 0 };
const HEADER_CACHE_TTL = 15 * 60 * 1000;

async function handler(m, { sock, config: botConfig, db, uptime }) {
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";

  let imageBuffer = null;
  let thumbBuffer = null;
  try {
    imageBuffer = getThumb("menu");
    thumbBuffer = getThumb("quoted");
  } catch (e) {
    console.error("Gagal load assets:", e.message);
  }

  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.id || "120363393471527483@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Elysia Assistant";
  const saluranLink =
    botConfig.saluran?.link ||
    "https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O";

  const { sorted: menuSorted, totalCmds } = getSortedCategories(m, botMode);
  const uptimeFormatted = formatUptime(uptime);
  const user = (await db.getUser(m.sender)) || {};

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Makassar" })
  );
  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(now.getHours())}.${pad(now.getMinutes())}`;
  const botName = botConfig.bot?.name || "Elysia Assistant";
  const ownerName = botConfig.owner?.name || botConfig.bot?.developer || "Owner";
  const role = m.isOwner ? "Owner" : m.isPremium ? "Premium" : "Member";
  const statusEmoji = m.isOwner ? "👑" : m.isPremium ? "💎" : "🆓";
  const remaining = m.isOwner || m.isPremium ? "∞" : (user.energi ?? 0);

  const bodyText =
    `ɪ ᴀᴍ ᴇʟʏꜱɪᴀ ʏᴏᴜʀ ᴘᴇʀꜱᴏɴᴀʟ ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ᴀꜱꜱɪꜱᴛᴀɴᴛ ᴏɴ ᴡʜᴀᴛꜱᴀᴘᴘ, ʜᴇʀᴇ ᴛᴏ ʜᴇʟᴘ ʏᴏᴜ ᴡɪᴛʜ ᴄᴏᴍᴍᴀɴᴅꜱ, ᴛᴏᴏʟꜱ, ᴀɴᴅ ᴀʟʟ ᴛʜᴇ ꜰᴇᴀᴛᴜʀᴇꜱ ᴀᴠᴀɪʟᴀʙʟᴇ ɪɴ ᴛʜɪꜱ ʙᴏᴛ.`;

  const footerText = [
    "—–·「 PROFILE 」·–—",
    `   ✧ Username : ${m.pushName || "User"}`,
    `   ✧ Status   : ${statusEmoji} ${role}`,
    `   ✧ Limit    : ${remaining}`,
    "",
    "—–·「 SYSTEM 」·–—",
    `   ✧ Bot Name      : ${botName}`,
    `   ✧ Owner         : ${ownerName}`,
    `   ✧ Version       : v${botConfig.bot?.version || "1.0"}`,
    `   ✧ Total Feature : ${totalCmds}`,
    `   ✧ Time          : ${timeStr} WITA`,
    `   ✧ Active since  : ${uptimeFormatted}`,
    "",
    " Enjoy the bot's features",
  ].join("\n");

  const categoryRows = menuSorted.map(({ cat, emoji, cmds }) => ({
    title: `${emoji || "▪"} ${String(cat).toUpperCase()}`,
    description: `${cmds.length} fitur tersedia`,
    id: `${prefix}allmenu ${cat}`,
  }));

  const menuRows = [
    { title: "All Menu", description: `Lihat semua ${totalCmds} fitur bot`, id: `${prefix}allmenu` },
    { title: "Profile", description: "Lihat informasi akun kamu", id: `${prefix}profile` },
    { title: "Rules", description: "Baca panduan dan aturan bot", id: `${prefix}rules` },
    { title: "Owner Bot", description: "Hubungi pengembang bot", id: `${prefix}owner` },
    ...categoryRows,
  ];

  const buttons = [
    { name: "" },
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "Menu",
        sections: [
          { title: "MAIN MENU", rows: menuRows.slice(0, 4) },
          { title: "KATEGORI FITUR", rows: categoryRows },
        ],
        icon: "DEFAULT",
      }),
    },
    { name: "" },
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "Support",
        sections: [
          {
            title: `SUPPORT ${botName}`,
            rows: [
              { title: "Contact Owner", description: "Chat langsung dengan pengembang", id: `${prefix}owner` },
              { title: "Donasi", description: "Dukung pengembangan bot", id: `${prefix}donasi` },
            ],
          },
        ],
        icon: "REVIEW",
      }),
    },
    {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "Buy Panel",
        url: "https://zanspiwptero.shoppanel.my.id",
        merchant_url: "https://zanspiwptero.shoppanel.my.id",
      }),
    },
  ];

  try {
    let headerMedia = null;
    const sourceImage = imageBuffer || thumbBuffer;
    if (sourceImage && sourceImage.length) {
      const cacheKey = `${sourceImage.length}:${sourceImage.subarray(0, 24).toString("hex")}`;
      if (
        _headerCache.key === cacheKey &&
        Date.now() - _headerCache.ts < HEADER_CACHE_TTL
      ) {
        headerMedia = _headerCache.media;
      } else {
        try {
          headerMedia = await prepareWAMessageMedia(
            { image: sourceImage },
            { upload: sock.waUploadToServer }
          );
          _headerCache = { key: cacheKey, media: headerMedia, ts: Date.now() };
        } catch (mediaError) {
          console.warn("[Menu Native Flow] Gagal menyiapkan gambar:", mediaError.message);
        }
      }
    }

    const ownerNumber = String(
      Array.isArray(botConfig.owner?.number)
        ? botConfig.owner.number[0] || ""
        : botConfig.owner?.number || ""
    ).replace(/\D/g, "");

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        interactiveMessage: {
          header: {
            hasMediaAttachment: !!headerMedia,
            ...(headerMedia ? { imageMessage: headerMedia.imageMessage } : {}),
          },
          body: { text: bodyText },
          footer: { text: footerText },
          nativeFlowMessage: {
            buttons,
            messageParamsJson: JSON.stringify({
              limited_time_offer: {
                text: botConfig.bot?.priceTag || "$9.99 USD",
                url: ownerNumber ? `https://wa.me/${ownerNumber}` : saluranLink,
                copy_code: botName,
              },
            }),
          },
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 1,
            isForwarded: true,
            ...(saluranId
              ? {
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                }
              : {}),
          },
        },
      },
      { quoted: m, userJid: sock.user.jid }
    );

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (error) {
    console.error("[Menu Native Flow] Gagal mengirim menu:", error);
    await m.reply(`${bodyText}\n\n${footerText}`);
  }
}

export default {
  config: pluginConfig,
  handler,
};
