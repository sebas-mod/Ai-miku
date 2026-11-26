/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";

const pluginConfig = {
  name: "npmstalk",
  alias: ["stalknpm", "npminfo"],
  category: "stalker",
  description: "Cek informasi paket NPM (versi, author, download mingguan)",
  usage: ".npmstalk <nama-paket>",
  example: ".npmstalk axios",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 1, isEnabled: true,
};

async function handler(m) {
  const pkg = String(m.text || "").trim();
  if (!pkg) return m.reply(`📦 Masukkan nama paket NPM!\n> Contoh: \`${m.prefix}npmstalk axios\``);

  await m.react("🔎");
  try {
    const [{ data }, dlRes] = await Promise.all([
      axios.get(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`, { timeout: 12000 }),
      axios.get(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`, { timeout: 10000 }).catch(() => ({ data: {} })),
    ]);

    const latest = data["dist-tags"]?.latest || "-";
    const latestObj = data.versions?.[latest] || {};
    const author = typeof latestObj.author === "string" ? latestObj.author : latestObj.author?.name || "-";
    const updated = data.time?.modified ? new Date(data.time.modified).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "-";
    const weekly = Number(dlRes.data?.downloads || 0).toLocaleString("id-ID");

    const text =
      `╭─❖「 📦 *NPM PACKAGE STALKER* 」\n` +
      `│ 🏷️ Paket     : *${data.name}*\n` +
      `│ 🔖 Versi     : \`v${latest}\`\n` +
      `│ 👤 Author    : ${author}\n` +
      `│ 📜 Lisensi   : ${latestObj.license || data.license || "-"}\n` +
      `│ 📥 Unduh/mgg : *${weekly}*\n` +
      `│ 🕒 Update    : ${updated}\n` +
      `├───〔 *DESKRIPSI* 〕\n` +
      `│ ${data.description || "-"}\n` +
      `│ 🔗 https://www.npmjs.com/package/${data.name}\n` +
      `╰─────────────────────❖`;

    await m.reply(text);
    await m.react("✅");
  } catch (err) {
    await m.react("❌");
    const msg = err?.response?.status === 404 ? `Paket NPM *${pkg}* tidak ditemukan.` : `Gagal mengambil data NPM: ${err.message}`;
    await m.reply(`❌ ${msg}`);
  }
}

export { pluginConfig as config, handler };
