/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
import te from "../../src/lib/core/error.js";
const pluginConfig = {
  name: "autojoingc",
  alias: ["autojoin", "autojoingroup"],
  category: "owner",
  description: "Auto join grup dari link yang terdeteksi di chat",
  usage: ".autojoingc on/off",
  example: ".autojoingc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};
const GROUP_LINK_REGEX = /chat\.whatsapp\.com\/([a-zA-Z0-9]{18,24})/gi;
async function handler(m) {
  const db = getDatabase();
  const arg = (m.args?.[0] || "").toLowerCase();
  if (!arg || !["on", "off"].includes(arg)) {
    const current = db.setting("autoJoinGc") || false;
    return m.reply(
      `🔗 *UNIRSE AUTOMÁTICAMENTE A GRUPOS*\n\nEstado: *${current ? "ON ✅" : "OFF ❌"}*\n\n\`${m.prefix}autojoingc on\` — activar\n\`${m.prefix}autojoingc off\` — desactivar`,
    );
  }
  const enabled = arg === "on";
  db.setting("autoJoinGc", enabled);
  await db.save();
  m.reply(
    `${enabled ? "✅" : "❌"} Auto join group *${enabled ? "diaktifkan" : "dinonaktifkan"}*`,
  );
}
async function autoJoinDetector(m, sock) {
  const db = getDatabase();
  if (!db?.ready) return false;
  if (!db.setting("autoJoinGc")) return false;
  if (!m.body) return false;
  const matches = [...m.body.matchAll(GROUP_LINK_REGEX)];
  if (!matches.length) return false;
  let joined = 0;
  for (const match of matches) {
    const code = match[1];
    try {
      const result = await sock.groupAcceptInvite(code);
      if (result) {
        joined++;
      }
    } catch (e) {
      const msg = e.message || String(e);
      if (msg.includes("already") || msg.includes("participant")) {
        await m.reply(`⚠️ Ya está en ese grupo`);
      } else if (msg.includes("expired") || msg.includes("revoked")) {
        await m.reply(`❌ El enlace del grupo expiró o fue revocado`);
      } else {
        await m.reply(te(m.prefix, m.command, m.pushName));
      }
    }
  }
  return joined > 0;
}
export { pluginConfig as config, handler, autoJoinDetector };
