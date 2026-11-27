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
    name: "darkangel",
    alias: [],
    category: "maker",
    description: "Bikin card dark angel dari fotomu",
    usage: ".darkangel <teks> (reply/kirim foto)",
    example: ".darkangel Dark",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
  };

  function drawCircularText(ctx, text, centerX, centerY, radius) {
    const chars = text.split('');
    const n = chars.length;
    const arcSpan = Math.PI * 0.7;
    const angleIncrement = n > 1 ? arcSpan / (n - 1) : 0;
    const start = Math.PI / 2 + arcSpan / 2;

    for (let i = 0; i < n; i++) {
      const char = chars[i];
      const angle = start - i * angleIncrement;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle - Math.PI / 2);
      ctx.strokeText(char, 0, 0);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }

  async function handler(m, { sock }) {
    const text = m.text?.trim();
    if (!text) {
      return m.reply(`⚠️ ¡Escribe el texto!\nEjemplo: \`${m.prefix}${m.command} Hola\``);
    }

    let media = null;
    const msgObj = m.quoted?.message ? m.quoted : m;
    const type = getContentType(msgObj.message);

    if (!type || type !== "imageMessage") {
      return m.reply(`⚠️ Envía o responde a una foto con el comando \`${m.prefix}${m.command} <texto>\``);
    }

    await m.react("🕕");

    try {
      media = await downloadMediaMessage(msgObj, "buffer", {});
      if (!media) throw new Error("No se pudo leer el multimedia");

      const bgUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771191256062.jpeg";
      const bgBuffer = await axios.get(bgUrl, { responseType: "arraybuffer" }).then(r => r.data);

      const bg = await loadImage(Buffer.from(bgBuffer));
      const userImg = await loadImage(media);
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      const circleSize = 130;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleSize, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const scale = Math.max((circleSize * 2 + 20) / userImg.width, (circleSize * 2 + 20) / userImg.height);
      const imgWidth = userImg.width * scale;
      const imgHeight = userImg.height * scale;

      ctx.drawImage(
        userImg,
        0, 0, userImg.width, userImg.height,
        centerX - imgWidth / 2,
        centerY - imgHeight / 2,
        imgWidth,
        imgHeight
      );
      ctx.restore();

      ctx.beginPath();
      ctx.arc(centerX, centerY, circleSize + 5, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;

      const maxFontSize = 32;
      const minFontSize = 16;
      let fontSize = maxFontSize;
      if (text.length > 10) fontSize = Math.max(minFontSize, maxFontSize - (text.length - 10));
      ctx.font = `bold ${fontSize}px serif`;

      const radius = circleSize + 80;
      drawCircularText(ctx, text.toUpperCase(), centerX, centerY - 25, radius);
      ctx.restore();

      const buffer = await canvas.encode("png");
      await sock.sendMessage(m.chat, { image: buffer, caption: "🖤 *Dark Angel*" }, { quoted: m });
      await m.react("✅");

    } catch (err) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
