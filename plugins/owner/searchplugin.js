/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from "fs";
import path from "path";
import { getAllPlugins } from "../../src/lib/core/plugins.js";
import te from "../../src/lib/core/error.js";
const pluginConfig = {
  name: "searchplugin",
  alias: ["splugin", "findplugin", "infoplugin"],
  category: "owner",
  description: "Cari dan tampilkan info plugin",
  usage: ".splugin <nama>",
  example: ".splugin sticker",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function findPluginInfo(name) {
  const allPlugins = getAllPlugins();

  for (const plugin of allPlugins) {
    if (!plugin.config) continue;

    const rawName = plugin.config.name;
    const pName = (
      Array.isArray(rawName) ? rawName[0] : rawName
    )?.toLowerCase();
    const aliases = Array.isArray(plugin.config.alias)
      ? plugin.config.alias
      : plugin.config.alias
        ? [plugin.config.alias]
        : [];

    if (
      pName === name.toLowerCase() ||
      aliases.map((a) => a?.toLowerCase()).includes(name.toLowerCase())
    ) {
      return {
        ...plugin.config,
        filePath: plugin.filePath,
      };
    }
  }

  return null;
}

async function findPluginFromFile(pluginsDir, name) {
  const folders = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const folder of folders) {
    const folderPath = path.join(pluginsDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "");
      if (baseName.toLowerCase() === name.toLowerCase()) {
        const filePath = path.join(folderPath, file);
        try {
          const mod = await import(`file://${filePath.replace(/\\/g, "/")}`);
          return {
            ...mod.config,
            folder,
            file,
            filePath,
          };
        } catch (e) {
          return { folder, file, filePath, error: e.message };
        }
      }
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const name = m.text?.trim();

  if (!name) {
    return m.reply(
      `🔍 *BUSCAR PLUGIN*\n\n` +
        `> Busca y muestra info del plugin\n\n` +
        `*EJEMPLO:*\n` +
        `> \`${m.prefix}splugin sticker\`\n` +
        `> \`${m.prefix}splugin menu\``,
    );
  }

  m.react("🔍");

  try {
    let info = findPluginInfo(name);

    if (!info) {
      const pluginsDir = path.join(process.cwd(), "plugins");
      info = await findPluginFromFile(pluginsDir, name);
    }

    if (!info) {
      await m.react("❌");
      return m.reply(
        `❌ *NO ENCONTRADO*\n\n> Plugin \`${name}\` no encontrado`,
      );
    }

    if (info.error) {
      await m.react("⚠️");
      return m.reply(
        `⚠️ *ERROR DE PLUGIN*\n\n` +
          `> File: \`${info.file}\`\n` +
          `> Folder: \`${info.folder}\`\n` +
          `> Error: \`${info.error}\``,
      );
    }

    const aliases = Array.isArray(info.alias)
      ? info.alias.join(", ")
      : info.alias || "-";
    const isEnabled = info.isEnabled !== false ? "✅ Sí" : "❌ No";
    const isOwner = info.isOwner ? "✅ Sí" : "❌ No";
    const isPremium = info.isPremium ? "✅ Sí" : "❌ No";
    const isGroup = info.isGroup ? "✅ Sí" : "❌ No";
    const isAdmin = info.isAdmin ? "✅ Sí" : "❌ No";

    await m.react("✅");
    return m.reply(
      `📋 *INFO DEL PLUGIN*\n\n` +
        `╭┈┈⬡「 📝 *DETALLE* 」\n` +
        `┃ 📛 NOMBRE: \`${info.name || "-"}\`\n` +
        `┃ 🏷️ ALIAS: \`${aliases}\`\n` +
        `┃ 📁 CATEGORÍA: \`${info.category || "-"}\`\n` +
        `┃ 📄 DESC: ${info.description || "-"}\n` +
        `┃ 📝 USO: \`${info.usage || "-"}\`\n` +
        `┃ 📌 EJEMPLO: \`${info.example || "-"}\`\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *AJUSTES* 」\n` +
        `┃ 🔓 HABILITADO: ${isEnabled}\n` +
        `┃ 👑 PROPIETARIO SOLO: ${isOwner}\n` +
        `┃ 💎 PREMIUM: ${isPremium}\n` +
        `┃ 👥 GRUPO SOLO: ${isGroup}\n` +
        `┃ 🛡️ ADMIN SOLO: ${isAdmin}\n` +
        `┃ ⏱️ ESPERA: \`${info.cooldown || 0}s\`\n` +
        `┃ 🎫 LÍMITE: \`${info.limit || 0}\`\n` +
        `╰┈┈⬡`,
    );
  } catch (error) {
    console.log(error);
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
