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
  name: "vdomain",
  alias: ["verceldomain"],
  category: "vercel",
  description: "Lihat atau tambahkan custom domain pada proyek Vercel",
  usage: ".vdomain <proyek> [domain-baru]",
  example: ".vdomain webku | .vdomain webku contoh.my.id",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const token = getVercelToken(m.sender);
  if (!token) return m.reply(missingTokenReply(m.prefix));

  const [rawProj, newDomain] = String(m.text || "").trim().split(/\s+/).filter(Boolean);
  const proj = sanitizeProjectName(rawProj);
  if (!proj) {
    return m.reply(`🌐 Masukkan nama proyek Vercel!\n> Lihat domain: \`${m.prefix}vdomain <proyek>\`\n> Tambah domain: \`${m.prefix}vdomain <proyek> <domain.com>\``);
  }

  await m.react("🕕");
  try {
    if (newDomain) {
      const res = await vercelRequest(token, "POST", `/v10/projects/${encodeURIComponent(proj)}/domains`, { name: newDomain });
      await m.react("✅");
      return m.reply(
        `╭─❖「 🌐 *DOMAIN DITAMBAHKAN* 」\n` +
        `│ 📦 Proyek : *${proj}*\n` +
        `│ 🔗 Domain : *${res?.name || newDomain}*\n` +
        `│ ✅ Status : ${res?.verified ? "Terverifikasi" : "Menunggu konfigurasi DNS"}\n` +
        `╰─────────────────────❖`
      );
    }

    const data = await vercelRequest(token, "GET", `/v9/projects/${encodeURIComponent(proj)}/domains`);
    const domains = Array.isArray(data?.domains) ? data.domains : [];
    if (!domains.length) {
      await m.react("✅");
      return m.reply(`🌐 Proyek *${proj}* belum memiliki domain terdaftar.`);
    }

    const lines = domains.map((d, i) => `│ ${i + 1}. ${d.verified ? "✅" : "⏳"} *${d.name}*`);
    await m.react("✅");
    await m.reply(
      `╭─❖「 🌐 *DOMAIN PROYEK: ${proj}* 」\n` +
      `${lines.join("\n")}\n` +
      `╰─────────────────────❖`
    );
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ Gagal memproses domain Vercel: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
