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

const te = MikuRuntime.te;

  const pluginConfig = {
    name: "darkness",
    alias: ["darkness", "drakness"],
    category: "maker",
    description: "Aplica un efecto oscuro a la imagen",
    usage: ".darkness [amount]",
    example: ".darkness 100 (sambil reply imagen)",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
  };

  function applyDarkness(ctx, width, height, amount) {
    const img = ctx.getImageData(0, 0, width, height);

    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = Math.max(0, img.data[i] - amount);
      img.data[i + 1] = Math.max(0, img.data[i + 1] - amount);
      img.data[i + 2] = Math.max(0, img.data[i + 2] - amount);
    }

    ctx.putImageData(img, 0, 0);
  }

  async function handler(m, { sock }) {
    const amountStr = m.text?.trim() || "50";
    const amount = parseInt(amountStr, 10);

    if (isNaN(amount) || amount < 0 || amount > 255) {
      return m.reply("⚠️ El parámetro amount debe ser un número entre 0 y 255.");
    }

    const msg = m.message;
    const isQuotedImage = m.quoted && (getContentType(m.quoted.message) === "imageMessage" || m.quoted.mtype === "imageMessage");
    const isImage = getContentType(msg) === "imageMessage" || m.mtype === "imageMessage";

    if (!isImage && !isQuotedImage) {
      return m.reply(`⚠️ Envía o responde a una imagen con el texto \`${m.prefix}${m.command} ${amount}\``);
    }

    await m.react("🕕");

    try {
      const targetMsg = isQuotedImage ? m.quoted : m;
      const mediaData = await downloadMediaMessage(
        targetMsg,
        "buffer",
        {},
        { logger: console }
      );

      const img = await loadImage(mediaData);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);
      applyDarkness(ctx, canvas.width, canvas.height, amount);

      const buffer = await canvas.encode("png");

      await sock.sendMessage(m.chat, {
        image: buffer,
        caption: `🌙 Efek darkness diterapkan (amount: ${amount})`
      }, { quoted: m });

      await m.react("✅");
    } catch (error) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
