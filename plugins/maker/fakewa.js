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
    name: "fakewa",
    alias: ["fwa"],
    category: "maker",
    description: "Crea un perfil de WhatsApp falso",
    usage: ".fakewa <nombre>|<número>|[status] (responde o envía una foto)",
    example: ".fakewa Fauzan|08123456789|Sibuk",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    const input = m.text?.trim();
    if (!input || !input.includes("|")) {
      return m.reply(`⚠️ ¡Escribe el nombre y el número!\nEjemplo: \`${m.prefix}${m.command} Fauzan|08123456789|Ocupado\``);
    }

    const parts = input.split("|");
    const nama = parts[0]?.trim();
    let nomor = parts[1]?.trim();
    const status = parts[2]?.trim() || "Busy";

    if (!nama || !nomor) {
      return m.reply(`⚠️ Se necesitan los parámetros 'nombre' y 'número'`);
    }

    if (nomor.startsWith("08")) nomor = "62" + nomor.slice(1);

    let media = null;
    const msgObj = m.quoted?.message ? m.quoted : m;
    const type = getContentType(msgObj.message);

    if (!type || type !== "imageMessage") {
      return m.reply(`⚠️ Envía o responde a una foto con el comando \`${m.prefix}${m.command} <nombre>|<número>|[status]\``);
    }

    await m.react("🕕");

    try {
      media = await downloadMediaMessage(msgObj, "buffer", {});
      if (!media) throw new Error("No se pudo leer el multimedia");

      const bgUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230249397.jpeg";
      const bgBuffer = await axios.get(bgUrl, { responseType: "arraybuffer" }).then(r => r.data);

      const avatar = await loadImage(media);
      const background = await loadImage(Buffer.from(bgBuffer));

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(background, 0, 0);

      const avatarSize = 350;
      const avatarX = (canvas.width - avatarSize) / 2;
      const avatarY = 163;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const minSide = Math.min(avatar.width, avatar.height);
      const cropX = (avatar.width - minSide) / 2;
      const cropY = (avatar.height - minSide) / 2;
      ctx.drawImage(avatar, cropX, cropY, minSide, minSide, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.fillStyle = "#25D366";
      ctx.font = "25px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Edit", avatarX + avatarSize / 2, avatarY + avatarSize + 104);

      const startY = 760;
      const gapY = 150;
      ctx.textAlign = "left";
      ctx.font = "30px Arial";
      ctx.fillStyle = "#a7a4a4";
      ctx.fillText(nama, 165, startY + 25);
      ctx.fillText(status, 165, startY + gapY + 25);

      function formatNomor(n) {
        if (n.startsWith("62") && n.length >= 10) return `+62 ${n.slice(2,5)}-${n.slice(5,9)}-${n.slice(9)}`;
        else if (n.startsWith("+")) return n;
        else if (/^\d+$/.test(n)) return `+${n}`;
        else return n;
      }

      ctx.fillText(formatNomor(nomor), 165, startY + gapY * 2 + 25);
      ctx.fillStyle = "#25D366";
      ctx.fillText("Instagram", 165, startY + gapY * 3 + 26);

      const buffer = await canvas.encode("png");
      await sock.sendMessage(m.chat, { image: buffer, caption: "📱 *Fake WA*" }, { quoted: m });
      await m.react("✅");

    } catch (err) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
