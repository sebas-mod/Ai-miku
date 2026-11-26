/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import yts from "yt-search";

const pluginConfig = {
  name: "ytstalk",
  alias: ["stalkyt", "youtubestalk"],
  category: "stalker",
  description: "Cek informasi channel YouTube berdasarkan nama atau handle",
  usage: ".ytstalk <nama channel>",
  example: ".ytstalk MrBeast",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 1, isEnabled: true,
};

async function handler(m, { sock }) {
  const query = String(m.text || "").trim().replace(/^@/, "");
  if (!query) return m.reply(`▶️ ¡Escribe el nombre del canal de YouTube!\n> Ejemplo: \`${m.prefix}ytstalk MrBeast\``);

  await m.react("🔎");
  try {
    const res = await yts(query);
    const ch = res?.channels?.[0];
    if (!ch) {
      await m.react("❌");
      return m.reply(`❌ No se encontró el canal de YouTube *${query}*.`);
    }

    const caption =
      `╭─❖「 ▶️ *YOUTUBE STALKER* 」\n` +
      `│ 📺 Channel    : *${ch.name || "-"}*\n` +
      `│ 👥 Subscriber : *${ch.subCountLabel || Number(ch.subCount || 0).toLocaleString("id-ID")}*\n` +
      `│ 🎬 Video      : *${ch.videoCountLabel || ch.videoCount || "-"}*\n` +
      `│ 🔗 Link       : ${ch.url || "-"}\n` +
      `╰─────────────────────❖`;

    const thumb = ch.image || ch.thumbnail;
    if (thumb) {
      const fullThumb = thumb.startsWith("//") ? `https:${thumb}` : thumb;
      try {
        await sock.sendMessage(m.chat, { image: { url: fullThumb }, caption }, { quoted: m });
        await m.react("✅");
        return;
      } catch {}
    }

    await m.reply(caption);
    await m.react("✅");
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ No se pudo obtener la información de YouTube: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
