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
import { getDatabase } from "../../src/lib/data/database.js";
import { getOwnerName } from "../../config.js";
import te from "../../src/lib/core/error.js";
const pluginConfig = {
  name: "ganti-namaowner",
  alias: ["setnamaowner", "setnameowner", "setownername"],
  category: "owner",
  description: "Ganti nama owner (utama atau tambahan)",
  usage: ".ganti-namaowner <nomor> <nama baru>",
  example: ".ganti-namaowner 628xxx Fauzan",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config }) {
  const db = getDatabase();
  const input = m.args;

  if (!input[0]) {
    const nameMap = db.setting("ownerNames") || {};
    const mainOwnerNum = config.owner?.number?.[0] || "";
    const mainName = config.owner?.name || "Owner";
    let list = `👤 *LISTA DE NOMBRES DE OWNERS*\n\n`;
    list += `👑 Main: *${mainName}* (${mainOwnerNum})\n`;
    const entries = Object.entries(nameMap);
    if (entries.length > 0) {
      entries.forEach(([num, name]) => {
        list += `👤 ${num}: *${name}*\n`;
      });
    } else {
      list += `\n > Aún no hay nombres personalizados para owners adicionales`;
    }
    list += `\n\n*Uso:*\n`;
    list += `\`${m.prefix}ganti-namaowner <número> <nombre>\`\n`;
    list += `\`${m.prefix}ganti-namaowner main <nombre>\` — cambia el nombre del owner principal`;
    return m.reply(list);
  }

  if (input[0].toLowerCase() === "main") {
    const newName = input.slice(1).join(" ").trim();
    if (!newName) {
      return m.reply(
        `👤 *CAMBIAR NOMBRE DEL OWNER PRINCIPAL*\n\n> Nombre actual: *${config.owner?.name || "-"}*\n\n\`${m.prefix}ganti-namaowner <nombre nuevo>\``,
      );
    }
    try {
      const configPath = path.join(process.cwd(), "config.js");
      let configContent = fs.readFileSync(configPath, "utf8");
      configContent = configContent.replace(
        /owner:\s*\{[\s\S]*?name:\s*['"]([^'"]*)['"]/,
        (match, oldName) =>
          match
            .replace(`'${oldName}'`, `'${newName}'`)
            .replace(`"${oldName}"`, `'${newName}'`),
      );
      fs.writeFileSync(configPath, configContent);
      config.owner.name = newName;
      return m.reply(
        `✅ *LISTO*\n\n> Nombre del owner principal cambiado a: *${newName}*`,
      );
    } catch (error) {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  const targetNumber = input[0].replace(/[^0-9]/g, "");
  const newName = input.slice(1).join(" ").trim();

  if (!targetNumber || targetNumber.length < 10) {
    return m.reply(
      `❌ *ERROR*\n\n > Número no válido\n\n\`${m.prefix}ganti-namaowner 628xxx NombreOwner\``,
    );
  }

  if (!newName) {
    const currentName = getOwnerName(targetNumber);
    return m.reply(
      `👤 *NOMBRE DEL OWNER*\n\n> ${targetNumber}: *${currentName}*\n\n\`${m.prefix}ganti-namaowner ${targetNumber} <nombre nuevo>\``,
    );
  }

  const nameMap = db.setting("ownerNames") || {};
  nameMap[targetNumber] = newName;
  db.setting("ownerNames", nameMap);

  return m.reply(
    `✅ *LISTO*\n\n> Nombre del owner *${targetNumber}* cambiado a: *${newName}*`,
  );
}

export { pluginConfig as config, handler };
