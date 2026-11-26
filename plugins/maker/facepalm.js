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
    name: "facepalm",
    alias: [],
    category: "maker",
    description: "Bikin gambar facepalm dari fotomu",
    usage: ".facepalm (reply/kirim foto)",
    example: ".facepalm",
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

      const overlayUrl = "https://raw.githubusercontent.com/BochilGaming/games-wabot/master/src/image/facepalm.png";
      const layerBuffer = await axios.get(overlayUrl, { responseType: "arraybuffer" }).then(r => r.data);

      const avatar = await loadImage(media);
      const layer = await loadImage(Buffer.from(layerBuffer));

      const canvas = createCanvas(632, 357);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 632, 357);
      ctx.drawImage(avatar, 199, 112, 235, 235);
      ctx.drawImage(layer, 0, 0, 632, 357);

      const buffer = await canvas.encode("png");
      await sock.sendMessage(m.chat, { image: buffer, caption: "🤦‍♂️ *Facepalm*" }, { quoted: m });
      await m.react("✅");

    } catch (err) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
