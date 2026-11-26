/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getThumb, getJpegThumb } from "../../src/lib/core/media.js";
import fs from "fs";
import sharp from "sharp";
import { convertToVoiceNote } from "../../src/lib/core/vn-audio.js";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@rexxhayanasi/elaina-baileys";
import config from "../../config.js";
import { getTimeGreeting } from "../../src/lib/core/formatter.js";
import {
  getCommandsByCategory,
  getCategories,
  getPlugin,
} from "../../src/lib/core/plugins.js";
import { getCasesByCategory, getCaseCount } from "../../src/case/elysia.js";

const pluginConfig = {
  name: "allmenu",
  alias: ["fullmenu", "am", "allcommand", "semua"],
  category: "main",
  description: "Muestra todas las funciones del bot con un diseño ordenado y compacto",
  usage: ".allmenu [categoría]",
  example: ".allmenu ai",
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
  info: "ℹ️",
  menfess: "💌",
  user: "📊",
  canvas: "🎨",
  random: "🎲",
  premium: "💎",
  ephoto: "🖌️",
  jpm: "📨",
  pushkontak: "📨",
  store: "🛍️",
  convert: "🔄",
  vps: "☁️",
  linode: "☁️",
  tts: "🗣️",
  anime: "🍥",
  berita: "📰",
};

const CATEGORY_ORDER = [
  "main", "utility", "tools", "ai", "download", "search", "media",
  "sticker", "game",
    "rich", "fun", "group", "economy", "canvas",
  "random", "convert", "info", "menfess", "user", "premium", "store",
  "ephoto", "jpm", "pushkontak", "vps", "linode", "tts",
  "anime", "berita", "owner",
];

function getModeFilter(m, botMode) {
  const modeConfig = {
    md: { allowed: null, excluded: ["store", "panel", "otp"] },
    store: { allowed: ["main", "group", "sticker", "owner", "store"], excluded: [] },
    pushkontak: { allowed: ["main", "group", "sticker", "owner", "pushkontak"], excluded: [] },
    all: { allowed: null, excluded: [] },
  };

  const current = modeConfig[botMode] || modeConfig.md;
  return (category) => {
    const cat = category.toLowerCase();
    if (cat === "owner" && !m.isOwner) return false;
    if (current.allowed && !current.allowed.includes(cat)) return false;
    if (current.excluded?.includes(cat)) return false;
    return true;
  };
}

function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.toLowerCase());
    const bi = CATEGORY_ORDER.indexOf(b.toLowerCase());
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || a.localeCompare(b);
  });
}

function normalizeCommands(commands) {
  return [...new Set((commands || []).map(String).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function formatCommandList(commands, prefix) {
  return commands.map((cmd) => `${prefix}${cmd}`);
}

function categoryBlock(category, commands, prefix) {
  const emoji = CATEGORY_EMOJIS[category.toLowerCase()] || "📋";
  const title = `${category.toUpperCase()} (${commands.length})`;
  const rows = formatCommandList(commands, prefix);
  let text = `✦「 ${emoji} ${title} 」\n`;
  for (const row of rows) text += `   ✧ ${row}\n`;
  return text.trimEnd();
}

function findRequestedCategory(input, categories) {
  if (!input) return null;
  const wanted = input.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return categories.find((cat) => cat.toLowerCase() === wanted) || null;
}

async function handler(m, { sock, config: botConfig, db }) {
  const prefix = botConfig.command?.prefix || ".";
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const commandsByCategory = getCommandsByCategory();
  const casesByCategory = getCasesByCategory();
  const visible = getModeFilter(m, botMode);
  const categories = sortCategories(getCategories()).filter(visible);

  const requestedCategory = findRequestedCategory(m.args?.[0], categories);
  const sections = [];
  let totalCommands = 0;

  for (const category of categories) {
    if (requestedCategory && category !== requestedCategory) continue;

    const pluginCommands = normalizeCommands(commandsByCategory[category]);
    const caseCommands = normalizeCommands(casesByCategory[category]);
    const commands = normalizeCommands([...pluginCommands, ...caseCommands]);
    if (!commands.length) continue;

    totalCommands += commands.length;
    sections.push(categoryBlock(category, commands, prefix));
  }

  if (m.args?.[0] && !requestedCategory) {
    const available = categories.map((cat) => cat).join(", ");
    return m.reply(
      `❌ *CATEGORÍA NO ENCONTRADA*\n\n` +
      `Usa *${prefix}allmenu* para ver todas las funciones.\n` +
      `O *${prefix}allmenu ai* para ver una sola categoría.\n\n` +
      `Categorías: ${available}`,
    );
  }

  if (!sections.length) {
    return m.reply("⚠️ *Todavía no hay funciones disponibles en este modo.*");
  }

  const user = db.getUser(m.sender) || {};
  const botName = botConfig.bot?.name || "Elysia Assistant";
  const version = botConfig.bot?.version || "1.0.0";
  const greeting = getTimeGreeting();
  const role = m.isOwner ? "Owner" : m.isPremium ? "Premium" : "Member";
  const caseCount = getCaseCount();
  const title = requestedCategory
    ? `${CATEGORY_EMOJIS[requestedCategory.toLowerCase()] || "▪"} ${requestedCategory.toUpperCase()}`
    : "ALL MENU";

  const ownerNameFallback = botConfig.owner?.name || botConfig.bot?.developer || "Arthazy";
  const statusEmojiFallback = m.isOwner ? "👑" : m.isPremium ? "💎" : "🆓";
  const remainingFallback = m.isOwner || m.isPremium ? "∞" : (user.energi ?? 0);
  let text = `ɪ ᴀᴍ ᴇʟʏꜱɪᴀ ʏᴏᴜʀ ᴘᴇʀꜱᴏɴᴀʟ ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ᴀꜱꜱɪꜱᴛᴀɴᴛ ᴏɴ ᴡʜᴀᴛꜱᴀᴘᴘ, ʜᴇʀᴇ ᴛᴏ ʜᴇʟᴘ ʏᴏᴜ ᴡɪᴛʜ ᴄᴏᴍᴍᴀɴᴅꜱ, ᴛᴏᴏʟꜱ, ᴀɴᴅ ᴀʟʟ ᴛʜᴇ ꜰᴇᴀᴛᴜʀᴇꜱ ᴀᴠᴀɪʟᴀʙʟᴇ ɪɴ ᴛʜɪꜱ ʙᴏᴛ.\n\n`;
  text += `—–·「 PERFIL 」·–—\n`;
  text += `   ✧ Usuario : ${m.pushName || "User"}\n`;
  text += `   ✧ Estado  : ${statusEmojiFallback} ${role}\n`;
  text += `   ✧ Límite  : ${remainingFallback}\n\n`;
  text += `—–·「 SISTEMA 」·–—\n`;
  text += `   ✧ Nombre-Bot     : ${botName}\n`;
  text += `   ✧ Dueño          : ${ownerNameFallback}\n`;
  text += `   ✧ Versión        : v${version}\n`;
  text += `   ✧ Total-Funciones : ${totalCommands}\n\n`;
  text += sections.join("\n\n");
  text += `\n\n Disfruta de las funciones del bot`;

  // El estilo del All Menu sigue el mismo patrón: un mensaje con la lista larga
  // y un botón ancho "☰ Menú" para abrir la selección de categorías.
  try {
    const thumbnail8 = await getJpegThumb("allmenu", { width: 300, height: 170 });

    const categoryRows8 = categories.map((category) => {
      const categoryCommands = normalizeCommands([
        ...(commandsByCategory[category] || []),
        ...(casesByCategory[category] || []),
      ]);
      const emoji = CATEGORY_EMOJIS[category.toLowerCase()] || "▪";
      return {
        title: `${emoji} ${category.toUpperCase()}`,
        description: `${categoryCommands.length} funciones disponibles`,
        id: `${prefix}allmenu ${category}`,
      };
    }).filter((row) => row.description !== "0 funciones disponibles");

    const categorySections8 = [];
    const chunkSize8 = 10;
    for (let i = 0; i < categoryRows8.length; i += chunkSize8) {
      categorySections8.push({
        title: i === 0 ? "📋 ELIGE CATEGORÍA" : `📋 MÁS CATEGORÍAS ${Math.floor(i / chunkSize8) + 1}`,
        rows: categoryRows8.slice(i, i + chunkSize8),
      });
    }
    const paramsJson8 = JSON.stringify({ title: "☰ Menú", sections: categorySections8 });

    const now8 = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
    const time8 = `${String(now8.getHours()).padStart(2, "0")}.${String(now8.getMinutes()).padStart(2, "0")}`;
    const messageTime8 = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now();
    const ping8 = Math.max(1, Date.now() - messageTime8);
    const uptimeSeconds8 = Math.floor(process.uptime());
    const days8 = Math.floor(uptimeSeconds8 / 86400);
    const hours8 = Math.floor((uptimeSeconds8 % 86400) / 3600);
    const minutes8 = Math.floor((uptimeSeconds8 % 3600) / 60);
    const uptimeText8 = days8 ? `${days8} días ${hours8} horas` : hours8 ? `${hours8} horas ${minutes8} minutos` : `${minutes8} minutos`;
    const ownerNumber8 = String(
      Array.isArray(botConfig.owner?.number)
        ? (botConfig.owner.number[0] || "")
        : (botConfig.owner?.number || ""),
    ).replace(/\D/g, "");

    const ownerName8 = botConfig.owner?.name || botConfig.bot?.developer || "Arthazy";
    const statusEmoji8 = m.isOwner ? "👑" : m.isPremium ? "💎" : "🆓";
    const remaining8 = m.isOwner || m.isPremium ? "∞" : (user.energi ?? 0);
    const profileSystem8 = [
      "—–·「 PERFIL 」·–—",
      `   ✧ Usuario : ${m.pushName || "User"}`,
      `   ✧ Estado  : ${statusEmoji8} ${role}`,
      `   ✧ Límite  : ${remaining8}`,
      "",
      "—–·「 SISTEMA 」·–—",
      `   ✧ Nombre-Bot     : ${botName}`,
      `   ✧ Dueño          : ${ownerName8}`,
      `   ✧ Versión        : v${version}`,
      `   ✧ Total-Funciones : ${totalCommands}`,
      `   ✧ Hora           : ${time8} WITA`,
      `   ✧ Activo desde   : ${uptimeText8}`,
      "",
    ].join("\n");
    const longList8 = `${profileSystem8}\n${sections.join("\n\n")}\n\n Disfruta de las funciones del bot`;
    const saluranId8 = botConfig.saluran?.id || "120363393471527483@newsletter";
    const saluranName8 = botConfig.saluran?.name || botName;

    await sock.relayMessage(
      m.chat,
      {
        buttonsMessage: {
          buttons: [{
            buttonId: "pilihan_menu",
            buttonText: { displayText: "☰ Menú" },
            type: 1,
            nativeFlowInfo: {
              name: "single_select",
              paramsJson: paramsJson8,
            },
          }],
          locationMessage: {
            name: `──「 ${botName} 」──`,
            address: `⏱ ${uptimeText8} · ◷ ${time8} WITA · ⌁ ${ping8}ms`,
            ...(thumbnail8 ? { jpegThumbnail: thumbnail8 } : {}),
          },
          contentText: `ɪ ᴀᴍ ᴇʟʏꜱɪᴀ ʏᴏᴜʀ ᴘᴇʀꜱᴏɴᴀʟ ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ᴀꜱꜱɪꜱᴛᴀɴᴛ ᴏɴ ᴡʜᴀᴛꜱᴀᴘᴘ, ʜᴇʀᴇ ᴛᴏ ʜᴇʟᴘ ʏᴏᴜ ᴡɪᴛʜ ᴄᴏᴍᴍᴀɴᴅꜱ, ᴛᴏᴏʟꜱ, ᴀɴᴅ ᴀʟʟ ᴛʜᴇ ꜰᴇᴀᴛᴜʀᴇꜱ ᴀᴠᴀɪʟᴀʙʟᴇ ɪɴ ᴛʜɪꜱ ʙᴏᴛ.`,
          footerText: longList8,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 777,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: saluranId8,
              newsletterName: saluranName8,
              serverMessageId: 127,
            },
          },
          headerType: 6,
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
        },
      },
      {},
    );

  } catch (error) {
    console.error("[AllMenu] Error:", error);
    await m.reply(text);
  }
}

export { pluginConfig as config, handler };
