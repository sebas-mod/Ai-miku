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
      name: "iqc",
      alias: [],
      category: "maker",
      description: "Membuat Fake Quote iOS style secara instan.",
      usage: ".iqc [text/reply]",
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 5,
      energi: 2,
      isEnabled: true,
  };

  async function handler(m, { sock, text }) {
      try {
          const targetText = text || (m.quoted && m.quoted.text ? m.quoted.text : "");

          if (!targetText) {
              let help = `💬 *FITUR FAKE QUOTE iOS*\n\n`
              help += `Fitur ini digunakan untuk membuat gambar quote elegan bergaya iOS dengan sangat cepat.\n\n`
              help += `*Cara Penggunaan:*\n`
              help += `- Ketik *${m.prefix}iqc <teks kamu>*\n`
              help += `- Atau kamu bisa membalas (reply) pesan teks orang lain dengan perintah *${m.prefix}iqc*\n\n`
              help += `_Pesan tersebut akan secara otomatis diubah menjadi quote keren!_`
              return m.reply(help)
          }

          await m.react('🕕');

          const apiUrl = `https://my.izuka-api.xyz/api/canvas/iqc?text=${encodeURIComponent(targetText)}`

          await sock.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });

          await m.react('✅');
      } catch (error) {
          console.error("[IQC Plugin Error]", error)
          await m.react('❌')
          m.reply(`Maaf, terjadi kesalahan saat mencoba membuat gambar quote. Silakan coba lagi beberapa saat.`)
      }
  }

export { pluginConfig as config, handler }
