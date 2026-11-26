/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import axios from "axios";

const te = ElysiaRuntime.te;

  const pluginConfig = {
    name: "fakeffduo",
    alias: ["fffduo"],
    category: "maker",
    description: "Bikin gambar banner Fake FF (Duo)",
    usage: ".fakeffduo <nama1>|<nama2>|[bgNum]",
    example: ".fakeffduo Fauzan|Bot|1",
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
      const fontBuffer = await axios.get("https://files.catbox.moe/knb2k0.otf", { responseType: "arraybuffer" }).then(r => r.data);
      GlobalFonts.register(Buffer.from(fontBuffer), "TeutonNormal");
      isFontLoaded = true;
  }

  async function handler(m, { sock }) {
    await loadFont();
    const input = m.text?.trim();
    if (!input || !input.includes("|")) {
      return m.reply(`⚠️ Escribe 2 nombres separados por |\nEjemplo: \`${m.prefix}${m.command} Fauzan|Bot|1\``);
    }

    const parts = input.split("|");
    const name1 = parts[0]?.trim();
    const name2 = parts[1]?.trim();
    const bg = parseInt(parts[2]?.trim() || "1");

    if (!name1 || !name2) {
      return m.reply(`⚠️ ¡Se necesitan los parámetros name1 y name2!`);
    }

    const githubBaseUrl = "https://raw.githubusercontent.com/Raavfy-24/Maker/refs/heads/main";
    const max = 50;

    if (bg < 1 || bg > max) {
      return m.reply(`⚠️ El fondo debe ser de 1 a ${max}`);
    }

    await m.react("🕕");

    try {
      const bgUrl = `${githubBaseUrl}/FAKE%20FF%20DUO/${bg}.png`;
      const bgBuffer = await axios.get(bgUrl, { responseType: "arraybuffer" }).then(r => r.data);

      const background = await loadImage(Buffer.from(bgBuffer));
      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      ctx.font = `bold 38px "TeutonNormal"`;
      ctx.textAlign = "center";

      ctx.fillStyle = "#ffffff";
      ctx.fillText(name1, 212, canvas.height - 314);

      ctx.fillStyle = "#ffb300";
      ctx.fillText(name1, 212, canvas.height - 314);

      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 1.6;
      ctx.strokeText(name1, 212, canvas.height - 314);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(name2, 740, canvas.height - 434);

      ctx.fillStyle = "#ffb300";
      ctx.fillText(name2, 740, canvas.height - 434);

      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 1.6;
      ctx.strokeText(name2, 740, canvas.height - 434);

      const buffer = await canvas.encode("png");
      await sock.sendMessage(m.chat, { image: buffer, caption: "🎮 *Fake FF Duo*" }, { quoted: m });
      await m.react("✅");

    } catch (err) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
