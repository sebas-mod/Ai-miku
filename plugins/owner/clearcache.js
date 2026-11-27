/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import {
  clearDatabaseCache,
  getDatabaseCacheStats,
  startDatabaseCacheCleaner,
  stopDatabaseCacheCleaner,
} from "../../src/lib/system/cache-cleaner.js";

const pluginConfig = {
  name: "clearcache",
  alias: ["autoclearcache", "delcache", "cleandbcache"],
  category: "owner",
  description: "Bersihkan atau atur auto-clear folder database/cache",
  usage: ".clearcache [status|on|off]",
  example: ".clearcache",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const arg = String(m.args?.[0] || "").trim().toLowerCase();
  const opt = (config.database.autoClearCache ||= {
    enabled: true,
    intervalMinutes: 60,
  });

  if (arg === "status") {
    const stats = getDatabaseCacheStats();
    return m.reply(
      `╭─── ❖ 『 🧹 *STATUS AUTO CLEAR CACHE* 』 ❖\n` +
        `│ 📂 *Folder:* \`database/cache\`\n` +
        `│ 📄 *Cantidad de archivos:* ${stats.fileCount} file\n` +
        `│ 💾 *Tamaño total:* ${stats.formattedSize}\n` +
        `│ ⚙️ *Borrado automático:* ${opt.enabled ? "✅ Activo" : "❌ Inactivo"}\n` +
        `│ ⏱️ *Interval:* Cada ${opt.intervalMinutes || 60} minutos\n` +
        `╰──────────────────────────❖`
    );
  }

  if (arg === "on") {
    opt.enabled = true;
    startDatabaseCacheCleaner();
    return m.reply(
      `✅ *Borrado automático \`database/cache\` activado!*\n> Se limpia automáticamente cada *${opt.intervalMinutes || 60} minutos*.`
    );
  }

  if (arg === "off") {
    opt.enabled = false;
    stopDatabaseCacheCleaner();
    return m.reply(`🛑 *Borrado automático \`database/cache\` dinonaktifkan.*`);
  }

  const r = clearDatabaseCache();
  if (r.missing || r.deleted === 0) {
    return m.reply(`✨ Folder \`database/cache\` ya está limpia (0 archivos).`);
  }

  return m.reply(
    `╭─── ❖ 『 🧹 *CACHE DATABASE DIBERSIHKAN* 』 ❖\n` +
      `│ 📂 *Folder:* \`database/cache\`\n` +
      `│ 🗑️ *Eliminados:* ${r.deleted} file\n` +
      `│ 💾 *Ruang Bebas:* ${r.formattedFreed}\n` +
      `│ 🛡️ *Database Utama:* Aman\n` +
      `╰──────────────────────────❖`
  );
}

export { pluginConfig as config, handler };
