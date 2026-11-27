/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadMediaMessage, getContentType } from '@rexxhayanasi/elaina-baileys';
import axios from "axios";

const te = MikuRuntime.te;

  const pluginConfig = {
    name: "afinitasml2",
    alias: [],
    category: "maker",
    description: "Crea una tarjeta de afinidad de ML (versión 2) con tu foto",
    usage: ".afinitasml2 (responde o envía una foto)",
    example: ".afinitasml2",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    let media = null;
    const msgObj = m.quoted?.message ? m.quoted : m;
    const type = getContentType(msgObj.message);

    if (!type || type !== "imageMessage") {
      return m.reply(`⚠️ Envía o responde a una foto con el comando \`${m.prefix}${m.command}\``);
    }

    await m.react("🕕");

    try {
      media = await downloadMediaMessage(msgObj, "buffer", {});
      if (!media) throw new Error("No se pudo leer el multimedia");

      const bgURL = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772821724016.png";

      const bgBuffer = await axios.get(bgURL, { responseType: "arraybuffer" }).then(r => r.data);

      const userImage = await loadImage(media);
      const bg = await loadImage(Buffer.from(bgBuffer));

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      const frame = { x: 450, y: 847, width: 205, height: 205 };
      const avatarSize = 300;
      const avatarX = frame.x + (frame.width - avatarSize) / 2;
      const avatarY = frame.y + (frame.height - avatarSize) / 2;

      const minSide = Math.min(userImage.width, userImage.height);
      const cropX = (userImage.width - minSide) / 2;
      const cropY = (userImage.height - minSide) / 2;

      ctx.drawImage(
        userImage,
        cropX,
        cropY,
        minSide,
        minSide,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
      );

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      const buffer = await canvas.encode("png");
      await sock.sendMessage(m.chat, { image: buffer, caption: "📱 *Afinitas ML v2*" }, { quoted: m });
      await m.react("✅");

    } catch (err) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
