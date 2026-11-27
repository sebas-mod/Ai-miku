/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const config = MikuRuntime.config;
const te = MikuRuntime.te;
const drawBrat = MikuRuntime.drawBrat;

  const pluginConfig = {
    name: "bratgreen",
    alias: ["bgreen"],
    category: "sticker",
    description: "Membuat sticker brat ijo",
    usage: ".bratgreen <text>",
    example: ".bratgreen Hai semua",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    const text = m.args.join(" ").trim();
    if (!text) {
      return m.reply(`🖼️ *BRAT GREEN*\n\n> Introducir texto\n\n\`Ejemplo: ${m.prefix}bratgreen Hola a todos\``);
    }

    m.react("🕕");

    try {
      const buffer = await drawBrat({
        text,
        bgColor: "#8ACE00",
        width: 512,
        height: 512,
        maxWidth: 450,
        maxHeight: 450,
        centerX: 256,
        centerY: 256,
        maxFontSize: 130,
        fontDecrement: 5,
        lineHeightMult: 1.1,
        textColor: "#000000"
      });

      await sock.sendImageAsSticker(m.chat, buffer, m, {
        packname: config.sticker.packname,
        author: config.sticker.author,
      });
      m.react("✅");
    } catch (error) {
      m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
