/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const config = MikuRuntime.config;
const te = MikuRuntime.te;
const getAssetBuffer = MikuRuntime.getAssetBuffer;
const isIosId = MikuRuntime.isIosId;
const chatIsIos = MikuRuntime.chatIsIos;

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
      title: "Imagen brat",
      rows: [
        { command: "bratimg", title: "Brat Default", description: "Sticker brat versi biasa" },
        { command: "bratgreen", title: "Brat Green", description: "Variant brat warna hijau" },
        { command: "bratcewek", title: "Brat Cewek", description: "Variant brat cewek" },
        { command: "brathd", title: "Brat HD", description: "Variant brat HD" },
      ],
    },
    {
      title: "Vídeo de brat",
      rows: [
        { command: "bratvid", title: "Vídeo de brat", description: "Sticker brat animated" },
        { command: "bratvid2", title: "Vídeo de brat V2", description: "Sticker brat video v2" },
        { command: "bratgojovid", title: "Vídeo de Brat Gojo", description: "Variant brat Gojo video" },
        { command: "bratvermeilvid", title: "Vídeo de Brat Vermeil", description: "Variant brat Vermeil video" },
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
      "🌿 *si quieres hacer brat, selecciona la variante de brat a continuación*\n\n" +
      list +
      `\n\nEjemplo: ${m.prefix}bratimg ${text || "Hai semua"}`
    );
  }

  const isIosMessage = (m) => isIosId(m.key?.id) || (!m.isGroup && chatIsIos(m.chat));

  // Android/Desktop: tombol list. iPhone: 3 tombol reply + daftar teks lengkap di badan pesan.
  async function sendBratMenu(m, sock, text) {
    const p = m.prefix;
    const arg = text ? ` ${text}` : "";
    const logo = getAssetBuffer("brat");
    const body =
      "🌿 *¿Qué función de brat quieres usar?*\n\n" +
      (text
        ? `Tu texto: _${text}_\n\nSeleccione una variante a través del botón a continuación 👇`
        : `Aún no has escrito el texto. Tipo *${p}brat <text>* luego seleccione la variante, o seleccione la variante y luego escriba el texto.\n\nEjemplo: ${p}brat Hola a todos`);
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
              { type: "reply", text: "Vídeo de brat", id: `${p}bratvid${arg}` },
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
              text: "Seleccione Brat",
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
      console.error("El botón [brat] falló, envía texto sin formato:", err.stack || err);
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
        `🖼️ *BRAT IMAGE*\n\n> Introducir texto\n\n\`Ejemplo: ${m.prefix}bratimg Hola a todos\``,
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
