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
      help += `Fitur ini digunakan untuk membuat desain chat palsu bergaya TikTok yang estetis!\n\n`
      help += `*Cara Penggunaan:*\n`
      help += `- Kirim foto profil (avatar) dengan caption *${m.prefix}tiktokchat username | pesan kamu*\n`
      help += `- Atau balas (reply) foto profil dengan pesan *${m.prefix}tiktokchat username | pesan kamu*\n\n`
      help += `*Contoh:* ${m.prefix}tiktokchat Zann | Halo, hari ini cerah ya!`
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
        return m.reply(`Maaf, sistem gagal mengunduh gambar avatar yang kamu berikan.`);
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
      m.reply(`Maaf, gagal membuat canvas TikTok Chat kali ini. Coba lagi beberapa saat.`);
    }
  }

export { pluginConfig as config, handler }
