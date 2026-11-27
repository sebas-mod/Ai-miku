/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import axios from "axios";

const te = MikuRuntime.te;

  const pluginConfig = {
    name: "basket",
    alias: ["basket"],
    category: "maker",
    description: "Crea una imagen de baloncesto con nombre personalizado",
    usage: ".basket <nombre>",
    example: ".basket Fauzan",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
  };

  let isFontLoaded = false;
  async function loadFont() {
      if (isFontLoaded) return;
      try {
          const fontBuffer = await axios.get("https://files.catbox.moe/8wqg77.ttf", { responseType: "arraybuffer" }).then(r => r.data);
          GlobalFonts.register(Buffer.from(fontBuffer), "ArialBoldBasket");
          isFontLoaded = true;
      } catch (e) { }
  }

  async function handler(m, { sock }) {
    await loadFont();
    const text = m.text?.trim();

    if (!text) {
      return m.reply(`⚠️ ¡Escribe el texto!\nEjemplo: \`${m.prefix}${m.command} Fauzan\``);
    }

    if (text.length > 25) {
      return m.reply("⚠️ ¡El nombre es demasiado largo! Máximo 25 caracteres.");
    }

    await m.react("🕕");

    try {
      const backgroundUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229249253.jpeg";
      const bgBuffer = await axios.get(backgroundUrl, { responseType: 'arraybuffer' }).then(r => r.data);
      const bg = await loadImage(Buffer.from(bgBuffer));

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      const fontFace = isFontLoaded ? "ArialBoldBasket" : "sans-serif";
      ctx.font = `bold 40px "${fontFace}"`;
      ctx.fillStyle = "#1a1a1a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(text, (canvas.width / 2) - 110, 545);

      const buffer = await canvas.encode("png");

      await sock.sendMessage(m.chat, {
        image: buffer,
        caption: "🏀 ¡Imagen de baloncesto creada!"
      }, { quoted: m });

      await m.react("✅");
    } catch (error) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
