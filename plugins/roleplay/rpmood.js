/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getRpStats, saveRpStats } from "../../src/lib/features/miku-roleplay.js";

const pluginConfig = {
  name: "rpmood",
  alias: ["setmood"],
  category: "roleplay",
  description: "Configura el estado de ánimo del rol en tu tarjeta de perfil",
  usage: ".rpmood <texto del estado de ánimo>",
  example: ".rpmood 🌸 feliz ahora",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const mood = String(m.text || "").trim().slice(0, 40);
  if (!mood) {
    return m.reply(`💭 ¡Escribe el texto de tu estado de ánimo!\n> Ejemplo: \`${m.prefix}rpmood 🌸 Estoy relajado\``);
  }
  const stats = getRpStats(m.sender);
  stats.mood = mood;
  saveRpStats(m.sender, stats);
  await m.reply(`✅ Tu estado de ánimo para el roleplay se actualizó a: *${mood}*`);
}

export { pluginConfig as config, handler };
