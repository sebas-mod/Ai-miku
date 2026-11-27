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
import sharp from 'sharp'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'

const config = MikuRuntime.config;
const te = MikuRuntime.te;
const uploadToTmpFiles = MikuRuntime.uploadToTmpFilesOrg;
const uploadToCatbox = MikuRuntime.uploadToCatboxFile;

  const pluginConfig = {
    name: "topixel",
    alias: [],
    category: "maker",
    description: "Convierte tu foto en una imagen pixel art llamativa",
    usage: ".topixel [level] (responde o envía una foto)",
    example: ".topixel 30",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true,
  };

  function getBlock(level) {
    const value = Math.min(Math.max(Number(level) || 12, 1), 40);
    return 41 - value;
  }

  async function pixelArt(inputBuffer, level) {
    const image = sharp(inputBuffer, { limitInputPixels: false }).rotate().ensureAlpha();
    const meta = await image.metadata();

    const width = meta.width;
    const height = meta.height;
    const block = getBlock(level);

    const input = await image.raw().toBuffer();
    const output = Buffer.alloc(input.length);

    for (let y = 0; y < height; y += block) {
      for (let x = 0; x < width; x += block) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let count = 0;

        const maxY = Math.min(y + block, height);
        const maxX = Math.min(x + block, width);

        for (let yy = y; yy < maxY; yy++) {
          for (let xx = x; xx < maxX; xx++) {
            const i = (yy * width + xx) * 4;
            r += input[i];
            g += input[i + 1];
            b += input[i + 2];
            a += input[i + 3];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);

        for (let yy = y; yy < maxY; yy++) {
          for (let xx = x; xx < maxX; xx++) {
            const i = (yy * width + xx) * 4;
            output[i] = r;
            output[i + 1] = g;
            output[i + 2] = b;
            output[i + 3] = a;
          }
        }
      }
    }

    return await sharp(output, {
      raw: { width, height, channels: 4 }
    })
      .png({ compressionLevel: 9, adaptiveFiltering: false })
      .toBuffer();
  }

  async function handler(m, { sock }) {
    let media = null;
    const level = m.args[0] || "12";

    if (m.quoted?.message) {
      const type = m.quoted.mtype;
      if (!type || type !== "imageMessage") {
        return m.reply("⚠️ ¡Responde al mensaje de la imagen!");
      }
      media = await m.quoted.download();
    } else if (m.message) {
      const type = m.mtype;
      if (!type || type !== "imageMessage") {
        return m.reply(`👾 *PIXEL ART MAKER*\n\nEnvía o responde a una foto con el comando \`${m.prefix}topixel [nivel]\` para convertir tu foto en estilo pixel art retro!\n\n_Nota: el nivel es opcional, de 1 a 40 (cuanto mayor, más pixelado)._`);
      }
      media = await m.download();
    }

    if (!media) return m.reply("❌ No se pudo leer la imagen, ¡inténtalo de nuevo!");

    await m.react("🕕");

    try {
      const pixelatedBuffer = await pixelArt(media, level);

      await sock.sendMessage(
        m.chat,
        {
          image: pixelatedBuffer,
          caption: `👾 *¡PIXEL ART CREADO!*\n\nAquí tienes tu foto en estilo pixel art retro de 8 bits. ¿A qué mola?`
        },
        { quoted: m }
      );

      await m.react("✅");
    } catch (err) {
      await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
