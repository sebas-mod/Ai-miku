/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const config = MikuRuntime.config;

  const pluginConfig = {
    name: "ttp",
    alias: ["stikerteks"],
    category: "sticker",
    description: "Membuat stiker keren dari teks",
    usage: ".ttp <teks>",
    example: ".ttp Hai Cantik",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    const text = m.args.join(" ") || m.text?.trim();

    if (!text) {
      return m.reply("❌ *Vaya, ¿dónde está el texto?*\n\nDebes ingresar el texto que deseas convertir en una pegatina.\n\nEjemplo: `.ttp Hola hermosa`");
    }

    await m.react("🕕");

    try {
      const apiUrl = `https://api.nexray.eu.cc/maker/ttp?text=${encodeURIComponent(text)}`;

      const res = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      const imageBuffer = Buffer.from(res.data);

      await sock.sendImageAsSticker(m.chat, imageBuffer, m, {
        packname: config.sticker.packname,
        author: config.sticker.author,
      });

      await m.react("✅");
    } catch (err) {
      console.error("[TTP Maker]", err.message);
      await m.react("☢");
      m.reply("😔 *Hubo un problema en nuestro sistema.* \n\nEl sistema no pudo contactar con el servidor del creador de pegatinas. Inténtelo de nuevo en unos momentos.");
    }
  }

export { pluginConfig as config, handler }
