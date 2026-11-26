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
  name: "vlist",
  alias: ["vercellist", "vprojects"],
  category: "vercel",
  description: "Tampilkan daftar semua proyek website di akun Vercel kamu",
  usage: ".vlist",
  example: ".vlist",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const token = getVercelToken(m.sender);
  if (!token) return m.reply(missingTokenReply(m.prefix));

  await m.react("🕕");
  try {
    const data = await vercelRequest(token, "GET", "/v9/projects", undefined, { limit: 30 });
    const projects = Array.isArray(data?.projects) ? data.projects : [];
    if (!projects.length) {
      await m.react("✅");
      return m.reply("📦 Belum ada proyek di akun Vercel kamu.");
    }

    const lines = projects.map((p, i) => {
      const alias = p.targets?.production?.alias?.[0] || `${p.name}.vercel.app`;
      const fw = p.framework || "static";
      return `│ ${i + 1}. *${p.name}* (${fw})\n│    🔗 https://${alias}`;
    });

    await m.react("✅");
    await m.reply(
      `╭─❖「 ▲ *DAFTAR PROYEK VERCEL (${projects.length})* 」\n` +
      `${lines.join("\n")}\n` +
      `╰─────────────────────❖`
    );
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ Gagal memuat proyek Vercel: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
