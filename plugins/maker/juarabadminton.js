/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import axios from "axios";

const te = ElysiaRuntime.te;

  const pluginConfig = {
    name: "juarabadminton",
    alias: ["sertifikatbadminton", "badmintoncert", "badminton"],
    category: "maker",
    description: "Membuat sertifikat Juara Badminton kustom",
    usage: ".juarabadminton <nama>",
    example: ".juarabadminton Alex",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true,
  };

  const THERESAV_KEY = global.apiKeys?.theresav || "4ZtwE";

  async function handler(m, { sock }) {
    const fullText = (m.text || m.body || "").trim();
    const prefix = m.prefix || ".";

    const inputName = fullText.replace(/^[\/.!#]?(juarabadminton|sertifikatbadminton|badmintoncert|badminton)\s*/i, "").trim();

    if (!inputName) {
      return m.reply(
        `🏸 *CERTIFICADO DE CAMPEÓN DE BÁDMINTON*\n\n` +
        `> *Uso:* \`${prefix}juarabadminton <Nombre>\`\n` +
        `> *Ejemplo:* \`${prefix}juarabadminton Alex\``
      );
    }

    await m.react("🏸");

    try {
      const targetUrl = `https://api.theresav.biz.id/canvas/cbadminton`;

      const res = await axios.get(targetUrl, {
        params: {
          text: inputName,
          apikey: THERESAV_KEY
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
        caption: `🏸 *Certificate of Badminton* for *${inputName}*`
      }, { quoted: m });

    } catch (error) {
      console.error("[Juara Badminton Error]:", error?.message);
      await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
