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
import FormData from "form-data";

const te = MikuRuntime.te;

  const pluginConfig = {
    name: "codesnap",
    alias: [],
    category: "maker",
    description: "Crea una imagen de fragmento de código",
    usage: ".codesnap <code>",
    example: ".codesnap console.log('hello')",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    const code = m.text?.trim() || m.quoted?.text?.trim();

    if (!code) {
      return m.reply(`⚠️ ¡Por favor, ingresa el código!\nEjemplo: \`${m.prefix}${m.command} console.log('hello')\``);
    }

    await m.react("🕕");

    try {
      const form = new FormData();
      form.append("code", code);

      const img = await axios.post(
        "https://carbonara.solopov.dev/api/cook",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Accept: "image/png"
          },
          responseType: "arraybuffer"
        }
      );

      const buffer = Buffer.from(img.data);
      await sock.sendMessage(m.chat, { image: buffer, caption: "💻 *CodeSnap*" }, { quoted: m });
      await m.react("✅");

    } catch (err) {
      await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
