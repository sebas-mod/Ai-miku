/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from "axios";

const te = MikuRuntime.te;

  const pluginConfig = {
    name: "boardingpass",
    alias: ["nasapass", "boarding"],
    category: "maker",
    description: "Crea un ticket de embarque de la NASA personalizado",
    usage: ".boardingpass <nombre>",
    example: ".boardingpass Alex",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true,
  };

  const ZELAPI_KEY = global.apiKeys?.zelapi || "zelapi-u43ihyj";

  async function handler(m, { sock }) {
    const fullText = (m.text || m.body || "").trim();
    const prefix = m.prefix || ".";

    const inputName = fullText.replace(/^[\/.!#]?(boardingpass|nasapass|boarding)\s*/i, "").trim();

    if (!inputName) {
      return m.reply(
        `🚀 *PASE DE ABORDAR*\n\n` +
        `> *Uso:* \`${prefix}boardingpass <Nombre>\`\n` +
        `> *Ejemplo:* \`${prefix}boardingpass Alex\``
      );
    }

    await m.react("🎫");

    try {
      const targetUrl = `https://zelapi.eu.cc/canvas/boardingpass`;

      const res = await axios.get(targetUrl, {
        params: {
          name: inputName,
          apikey: ZELAPI_KEY
        },
        responseType: "arraybuffer",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 20000
      });

      const imageBuffer = Buffer.from(res.data);

      await m.react("✅");

      return await sock.sendMessage(m.chat, {
        image: imageBuffer,
        caption: `🚀 *NASA Pase de embarque* para *${inputName}*`
      }, { quoted: m });

    } catch (error) {
      console.error("[Boarding Pass Error]:", error?.message);
      await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
