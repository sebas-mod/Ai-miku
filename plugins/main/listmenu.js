/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { getPluginsByCategory } from "../../src/lib/core/plugins.js";
import { sendElysiaNativeMenu } from "../../src/lib/core/native-menu.js";

const pluginConfig = {
  name: "listmenu",
  alias: ["menugroup", "groupmenu", "listgroup"],
  category: "main",
  description: "Menampilkan semua menu grup beserta fungsi setiap command",
  usage: ".listmenu",
  example: ".listmenu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const cleanText = (value, fallback = "Fitur grup") => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
};
const truncate = (text, max = 72) => {
  const value = cleanText(text);
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

async function handler(m, { sock }) {
  const prefix = m.prefix || config.command?.prefix || ".";
  const plugins = getPluginsByCategory("group")
    .filter((plugin) => plugin?.config?.isEnabled !== false)
    .map((plugin) => plugin.config)
    .sort((a, b) => {
      const aName = Array.isArray(a.name) ? a.name[0] : a.name;
      const bName = Array.isArray(b.name) ? b.name[0] : b.name;
      return String(aName).localeCompare(String(bName));
    });

  const seen = new Set();
  const rows = [];
  for (const info of plugins) {
    const names = Array.isArray(info.name) ? info.name : [info.name];
    const name = String(names[0] || "").trim().toLowerCase();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    rows.push({
      title: `${prefix}${name}`,
      description: truncate(info.description || info.usage || "Fitur grup"),
      id: `${prefix}${name}`,
    });
  }
  if (!rows.length) return m.reply("❌ Menu grup belum tersedia.");

  const sections = [];
  const chunkSize = 10;
  for (let i = 0; i < rows.length; i += chunkSize) {
    sections.push({ title: `GROUP MENU ${Math.floor(i / chunkSize) + 1}`, rows: rows.slice(i, i + chunkSize) });
  }
  // Tetap bisa kembali ke menu utama, sebagai section tersendiri agar batas baris tiap section terjaga.
  sections.push({
    title: "NAVIGASI",
    rows: [{
      title: "◆ KEMBALI",
      description: "Kembali ke menu utama",
      id: `${prefix}menu`,
    }],
  });
  const body = [
    `╭─〔 👥 GROUP MENU 〕─⬣`,
    `│ Total fitur: ${rows.length}`,
    `│ Pilih command untuk melihat/menjalankannya.`,
    `╰─⬣`,
  ].join("\n");
  return sendElysiaNativeMenu(sock, m, {
    buttonId: "pilihan_listmenu",
    pickerTitle: "☰ LIST MENU GROUP",
    sections,
    contentText: body,
    footerText: `${config.bot?.name || "Elysia Assistant"} • Group Menu`,
    address: "LIST MENU GROUP",
    thumbKey: "listmenu",
  });
}

export { pluginConfig as config, handler };
