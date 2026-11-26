/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getVercelToken, vercelRequest, missingTokenReply } from "../../src/lib/features/miku-vercel.js";

const pluginConfig = {
  name: "vinfo",
  alias: ["vercelinfo", "vercelme"],
  category: "vercel",
  description: "Cek informasi akun Vercel yang terhubung",
  usage: ".vinfo",
  example: ".vinfo",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const token = getVercelToken(m.sender);
  if (!token) return m.reply(missingTokenReply(m.prefix));

  await m.react("🕕");
  try {
    const [userRes, projRes] = await Promise.all([
      vercelRequest(token, "GET", "/v2/user"),
      vercelRequest(token, "GET", "/v9/projects", undefined, { limit: 100 }).catch(() => ({ projects: [] })),
    ]);
    const u = userRes?.user || {};
    const totalProj = Array.isArray(projRes?.projects) ? projRes.projects.length : 0;

    await m.react("✅");
    await m.reply(
      `╭─❖「 ▲ *VERCEL ACCOUNT INFO* 」\n` +
      `│ 👤 Nama      : *${u.name || "-"}*\n` +
      `│ 🔖 Username  : \`${u.username || "-"}\`\n` +
      `│ 📧 Email     : ${u.email || "-"}\n` +
      `│ 📦 Total Web : *${totalProj} proyek*\n` +
      `╰─────────────────────❖`
    );
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ Gagal mengambil info Vercel: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
