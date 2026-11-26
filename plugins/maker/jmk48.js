/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadMediaMessage, getContentType } from '@rexxhayanasi/elaina-baileys';
import axios from "axios";

const te = ElysiaRuntime.te;

  const pluginConfig = {
    name: "jmk48",
    alias: [],
    category: "maker",
    description: "Bikin gambarmu jadi member JMK48",
    usage: ".jmk48 (reply/kirim foto)",
    example: ".jmk48",
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
      return m.reply(`⚠️ Envía o responde a una foto de perfil con el comando \`${m.prefix}${m.command}\``);
    }

    await m.react("🕕");

    try {
      media = await downloadMediaMessage(msgObj, "buffer", {});
      if (!media) throw new Error("No se pudo leer el multimedia");

      const frameURL = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230335511.png";
      const frameBuffer = await axios.get(frameURL, { responseType: "arraybuffer" }).then(r => r.data);

      const userImg = await loadImage(media);
      const frameImg = await loadImage(Buffer.from(frameBuffer));

      const canvas = createCanvas(frameImg.width, frameImg.height);
      const ctx = canvas.getContext("2d");

      const centerX = canvas.width / 2;
      const centerY = Math.round(canvas.height * 0.5);
      const radius = Math.round(canvas.width * 0.4);

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const minSide = Math.min(userImg.width, userImg.height);
      const cropX = (userImg.width - minSide) / 2;
      const cropY = (userImg.height - minSide) / 2;

      ctx.drawImage(userImg, cropX, cropY, minSide, minSide, centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();

      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

      const buffer = await canvas.encode("png");
      await sock.sendMessage(m.chat, { image: buffer, caption: "🎤 *JMK48 Member*" }, { quoted: m });
      await m.react("✅");

    } catch (err) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
