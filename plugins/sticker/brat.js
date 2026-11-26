/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const config = ElysiaRuntime.config;
const te = ElysiaRuntime.te;
const getAssetBuffer = ElysiaRuntime.getAssetBuffer;
const isIosId = ElysiaRuntime.isIosId;
const chatIsIos = ElysiaRuntime.chatIsIos;

  const pluginConfig = {
    name: "brat",
    alias: ["bratimg"],
    category: "sticker",
    description: "Menu variant brat dan generator sticker brat",
    usage: ".brat | .bratimg <text>",
    example: ".bratimg Hai semua",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true,
  };

  const BRAT_SECTIONS = [
    {
      title: "Brat Gambar",
      rows: [
        { command: "bratimg", title: "Brat Default", description: "Sticker brat versi biasa" },
        { command: "bratgreen", title: "Brat Green", description: "Variant brat warna hijau" },
        { command: "bratcewek", title: "Brat Cewek", description: "Variant brat cewek" },
        { command: "brathd", title: "Brat HD", description: "Variant brat HD" },
      ],
    },
    {
      title: "Brat Video",
      rows: [
        { command: "bratvid", title: "Brat Video", description: "Sticker brat animated" },
        { command: "bratvid2", title: "Brat Video V2", description: "Sticker brat video v2" },
        { command: "bratgojovid", title: "Brat Gojo Video", description: "Variant brat Gojo video" },
        { command: "bratvermeilvid", title: "Brat Vermeil Video", description: "Variant brat Vermeil video" },
      ],
    },
    {
      title: "Brat Karakter (1)",
      rows: [
        { command: "bratgojo", title: "Brat Gojo", description: "Variant brat Gojo" },
        { command: "bratvermeil", title: "Brat Vermeil", description: "Variant brat Vermeil" },
        { command: "bratanime", title: "Brat Anime", description: "Brat versi anime" },
        { command: "bratgura", title: "Brat Gura", description: "Brat anime chibi" },
        { command: "bratbahlil", title: "Brat Bahlil", description: "Brat versi Bahlil" },
        { command: "bratpatrick", title: "Brat Patrick", description: "Brat versi Patrick" },
        { command: "bratsquidward", title: "Brat Squidward", description: "Brat versi Squidward" },
      ],
    },
    {
      title: "Brat Karakter (2)",
      rows: [
        { command: "bratwhite", title: "Brat White", description: "Brat versi putih" },
        { command: "bratchika", title: "Brat Chika", description: "Brat versi Chika" },
        { command: "bratkobato", title: "Brat Kobato", description: "Brat versi Kobato" },
        { command: "bratmenhera", title: "Brat Menhera", description: "Brat versi Menhera" },
        { command: "bratnezuko", title: "Brat Nezuko", description: "Brat versi Nezuko" },
        { command: "bratqiqi", title: "Brat Qiqi", description: "Brat versi Qiqi" },
        { command: "bratruromiya", title: "Brat Ruromiya", description: "Brat versi Ruromiya" },
        { command: "bratumaru", title: "Brat Umaru", description: "Brat versi Umaru" },
      ],
    },
  ];

  function bratMenuText(m, text) {
    const list = BRAT_SECTIONS.flatMap((sec) => sec.rows)
      .map((item) => `▢ ${m.prefix}${item.command} _(${item.description})_`)
      .join("\n");

    return (
      "🌿 *kamu mau buat brat yak, silahkan pilih variant brat di bawah*\n\n" +
      list +
      `\n\nContoh: ${m.prefix}bratimg ${text || "Hai semua"}`
    );
  }

  const isIosMessage = (m) => isIosId(m.key?.id) || (!m.isGroup && chatIsIos(m.chat));

  // Android/Desktop: tombol list. iPhone: 3 tombol reply + daftar teks lengkap di badan pesan.
  async function sendBratMenu(m, sock, text) {
    const p = m.prefix;
    const arg = text ? ` ${text}` : "";
    const logo = getAssetBuffer("brat");
    const body =
      "🌿 *Mau pakai fitur brat yang mana?*\n\n" +
      (text
        ? `Teks kamu: _${text}_\n\nPilih variant lewat tombol di bawah 👇`
        : `Kamu belum menulis teks. Ketik *${p}brat <teks>* lalu pilih variant, atau pilih variant lalu tulis teksnya.\n\nContoh: ${p}brat Hai semua`);
    const footer = global.namebot || "Brat Maker";

    try {
      if (isIosMessage(m)) {
        return await sock.sendButtons(
          m.chat,
          {
            ...(logo ? { image: logo } : {}),
            text: bratMenuText(m, text),
            footer,
                  thumbKey: 'reply',
            mentions: [m.sender],
            iosKeepReply: true,
            buttons: [
              { type: "reply", text: "Brat Default", id: `${p}bratimg${arg}` },
              { type: "reply", text: "Brat Green", id: `${p}bratgreen${arg}` },
              { type: "reply", text: "Brat Video", id: `${p}bratvid${arg}` },
            ],
          },
          { quoted: m },
        );
      }

      return await sock.sendButtons(
        m.chat,
        {
          ...(logo ? { image: logo } : {}),
          text: body,
          footer,
                  thumbKey: 'reply',
          mentions: [m.sender],
          buttons: [
            {
              type: "list",
              text: "Pilih Brat",
              sections: BRAT_SECTIONS.map((sec) => ({
                title: sec.title,
                rows: sec.rows.map((item) => ({
                  title: item.title,
                  description: item.description,
                  id: `${p}${item.command}${arg}`,
                })),
              })),
            },
          ],
        },
        { quoted: m },
      );
    } catch (err) {
      console.error("[brat] tombol gagal, kirim teks biasa:", err.stack || err);
      const caption = bratMenuText(m, text);
      if (logo) return sock.sendMessage(m.chat, { image: logo, caption, mentions: [m.sender] }, { quoted: m });
      return sock.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m });
    }
  }

  async function handler(m, { sock }) {
    const text = m.text;
    const command = String(m.command || "").toLowerCase();

    if (command === "brat") {
      await sendBratMenu(m, sock, text);
      return;
    }

    if (!text) {
      return m.reply(
        `🖼️ *ʙʀᴀᴛ ɪᴍᴀɢᴇ*\n\n> Masukkan teks\n\n\`Contoh: ${m.prefix}bratimg Hai semua\``,
      );
    }

    m.react("🕕");

    try {
      await sock.sendImageAsSticker(m.chat, `https://api.nexray.eu.cc/maker/brat?text=${encodeURIComponent(text)}`, m, {
        packname: config.sticker.packname,
        author: config.sticker.author,
      });

      m.react("✅");
    } catch (error) {
      m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
