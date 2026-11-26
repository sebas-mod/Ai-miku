/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getVercelToken, vercelRequest, sanitizeProjectName, missingTokenReply } from "../../src/lib/features/miku-vercel.js";

const pluginConfig = {
  name: "vdelete",
  alias: ["verceldelete", "vdel"],
  category: "vercel",
  description: "Hapus proyek dari akun Vercel kamu",
  usage: ".vdelete <nama-proyek>",
  example: ".vdelete web-lama",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const token = getVercelToken(m.sender);
  if (!token) return m.reply(missingTokenReply(m.prefix));

  const proj = sanitizeProjectName(m.text);
  if (!proj) {
    return m.reply(`🗑️ ¡Escribe el nombre del proyecto de Vercel que quieres borrar!\n> Ejemplo: \`${m.prefix}vdelete web-lama\``);
  }

  await m.react("🕕");
  try {
    await vercelRequest(token, "DELETE", `/v9/projects/${encodeURIComponent(proj)}`);
    await m.react("✅");
    await m.reply(`🗑️ El proyecto de Vercel *${proj}* se eliminó permanentemente.`);
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ No se pudo eliminar el proyecto *${proj}*: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
