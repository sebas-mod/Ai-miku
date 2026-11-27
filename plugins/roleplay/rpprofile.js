/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getRpStats, getRpTitle, resolveRpTarget } from "../../src/lib/features/miku-roleplay.js";

const pluginConfig = {
  name: "rpprofile",
  alias: ["rpcard", "rpstatus"],
  category: "roleplay",
  description: "Mira tu tarjeta de perfil de rol, tu ánimo y tus puntos de afecto",
  usage: ".rpprofile [@user]",
  example: ".rpprofile",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const target = resolveRpTarget(m) || m.sender;
  const stats = getRpStats(target);
  const title = getRpTitle(stats.affection);
  const topActs = Object.entries(stats.counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `\`${k}\` (${v}x)`)
    .join(", ") || "-";

  await m.reply(
    `╭─❖「 🎭 *ROLEPLAY PROFILE* 」\n` +
      `│ 👤 User      : @${String(target).split("@")[0]}\n` +
      `│ 🏷️ Gelar     : *${title}*\n` +
      `│ 💭 Mood      : ${stats.mood}\n` +
      `├───〔 *INTERAKSI* 〕\n` +
      `│ 💖 Affection : *${stats.affection}* poin\n` +
      `│ 📤 Acciones enviadas: *${stats.given}x*\n` +
      `│ 📥 Diterima  : *${stats.received}x*\n` +
      `│ ⭐ Favorit   : ${topActs}\n` +
      `╰─────────────────────❖\n` +
      `_Cambia el estado de ánimo con \`${m.prefix}rpmood <nuevo estado>\`._`,
    { mentions: [target] }
  );
}

export { pluginConfig as config, handler };
