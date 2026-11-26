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
import sharp from 'sharp'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'

const config = ElysiaRuntime.config;
const te = ElysiaRuntime.te;
const uploadToTmpFiles = ElysiaRuntime.uploadToTmpFilesOrg;
const uploadToCatbox = ElysiaRuntime.uploadToCatboxFile;

  const pluginConfig = {
      name: 'balogo',
      alias: [],
      category: "maker",
      description: 'Membuat logo Blue Archive style',
      usage: '.balogo <textL> & <textR>',
      example: '.balogo Blue & Archive',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 1,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const input = m.text?.trim() || ''
      const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)

      if (parts.length < 2) {
          return m.reply(`🎮 *ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ ʟᴏɢᴏ*\n\n> Masukkan 2 teks untuk logo\n\n> Contoh: ${m.prefix}balogo Blue & Archive`)
      }

      const textL = parts[0]
      const textR = parts[1]

      m.react('🕕')

      try {
          await sock.sendMessage(m.chat, { image: { url: `https://api.nexray.web.id/maker/balogo?text=${encodeURIComponent(textL)} ${encodeURIComponent(textR)}` } }, { quoted: m })

          m.react('✅')
      } catch (error) {
          m.react('☢')
          m.reply(te(m.prefix, m.command, m.pushName))
      }
  }

export { pluginConfig as config, handler }
