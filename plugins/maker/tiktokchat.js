/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'
import fs from 'fs'
import https from 'https'
import http from 'http'
import FormData from 'form-data'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const te = ElysiaRuntime.te;

  const pluginConfig = {
    name: "tiktokchat",
    alias: [],
    category: "maker",
    description: "Membuat fake chat TikTok dari avatar kamu",
    usage: ".tiktokchat username | pesan (reply gambar)",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
  };

  async function handler(m, { sock, text }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

    if (!isImage || !text || !text.includes("|")) {
      let help = `💬 *TIKTOK CHAT CANVAS*\n\n`
      help += `¡Esta función crea diseños de chat falsos con estilo TikTok!\n\n`
      help += `*Cómo usar:*\n`
      help += `- Envía una foto de perfil (avatar) con el texto *${m.prefix}tiktokchat usuario | tu mensaje*\n`
      help += `- O responde a una foto de perfil con *${m.prefix}tiktokchat usuario | tu mensaje*\n\n`
      help += `*Ejemplo:* ${m.prefix}tiktokchat Zann | ¡Hola, hoy hace buen día!`
      return m.reply(help);
    }

    await m.react("🕕");

    try {
      let [username, ...msgParts] = text.split("|");
      username = username.trim();
      const message = msgParts.join("|").trim();

      let buffer;
      if (m.quoted && m.quoted.isMedia) {
        buffer = await m.quoted.download();
      } else if (m.isMedia) {
        buffer = await m.download();
      }

      if (!buffer) {
        await m.react("❌");
        return m.reply(`Lo siento, el sistema no pudo descargar el avatar que enviaste.`);
      }

      const form = new FormData();
      form.append("username", username);
      form.append("text", message);
      form.append("avatar", buffer, { filename: "avatar.jpg", contentType: "image/jpeg" });

      const response = await axios.post("https://my.izuka-api.xyz/api/canvas/tiktok-chat", form, {
        headers: form.getHeaders(),
        responseType: "arraybuffer",
        timeout: 60000
      });

      await sock.sendMessage(m.chat, { image: Buffer.from(response.data) }, { quoted: m });
      await m.react("✅");
    } catch (error) {
      console.error("[TIKTOKCHAT Plugin Error]", error);
      await m.react("❌");
      m.reply(`Lo siento, no se pudo crear el canvas de TikTok Chat. Inténtalo de nuevo en un momento.`);
    }
  }

export { pluginConfig as config, handler }
