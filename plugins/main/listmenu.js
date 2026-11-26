/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { getPluginsByCategory } from "../../src/lib/core/plugins.js";
import { sendMikuNativeMenu } from "../../src/lib/core/native-menu.js";

const pluginConfig = {
  name: "listmenu",
  alias: ["menugroup", "groupmenu", "listgroup"],
  category: "main",
  description: "Muestra todos los menús de grupo junto con la función de cada comando",
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

const cleanText = (value, fallback = "Funciones de grupo") => {
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
      description: truncate(info.description || info.usage || "Funciones de grupo"),
      id: `${prefix}${name}`,
    });
  }
  if (!rows.length) return m.reply("❌ El menú de grupo todavía no está disponible.");

  const sections = [];
  const chunkSize = 10;
  for (let i = 0; i < rows.length; i += chunkSize) {
    sections.push({ title: `MENÚ DE GRUPO ${Math.floor(i / chunkSize) + 1}`, rows: rows.slice(i, i + chunkSize) });
  }
  // Siempre se puede volver al menú principal con una sección aparte,
  // así no se supera el límite de filas por sección.
  sections.push({
    title: "NAVEGACIÓN",
    rows: [{
      title: "◆ VOLVER",
      description: "Volver al menú principal",
      id: `${prefix}menu`,
    }],
  });
  const body = [
    `╭─〔 👥 MENÚ DE GRUPO 〕─⬣`,
    `│ Total de funciones: ${rows.length}`,
    `│ Elige un comando para verlo o ejecutarlo.`,
    `╰─⬣`,
  ].join("\n");
  return sendMikuNativeMenu(sock, m, {
    buttonId: "pilihan_listmenu",
    pickerTitle: "☰ LISTA DE MENÚS DE GRUPO",
    sections,
    contentText: body,
    footerText: `${config.bot?.name || "Ai Miku"} • Menú de grupo`,
    address: "LISTA DE MENÚS DE GRUPO",
    thumbKey: "listmenu",
  });
}

export { pluginConfig as config, handler };
