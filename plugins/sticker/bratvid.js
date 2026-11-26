/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { bratVid } from 'brat-canvas/video'

const config = MikuRuntime.config;
const te = MikuRuntime.te;

  const pluginConfig = {
      name: 'bratvid',
      alias: ["bvid"],
      category: "sticker",
      description: 'Membuat sticker brat animated',
      usage: '.bratvid <text>',
      example: '.bratvid Hai semua',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 15,
      energi: 1,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ')
      if (!text) {
          return m.reply(`🎬 *ʙʀᴀᴛ ᴀɴɪᴍᴀᴛᴇᴅ*\n\n> Masukkan teks\n\n\`Contoh: ${m.prefix}bratvid Hai semua\``)
      }

      m.react('🕕')

      try {
          const tempFile = path.join(os.tmpdir(), `brat-${Date.now()}.webp`)
          const url = await bratVid(text, {
              outputFormat: 'mp4',
          })
          await fs.promises.writeFile(tempFile, url)
          await sock.sendVideoAsSticker(m.chat, tempFile, m, {
              packname: config.sticker.packname,
              author: config.sticker.author
          })
          await fs.promises.unlink(tempFile)
          m.react('✅')
      } catch (error) {
          m.react('☢')
          m.reply(te(m.prefix, m.command, m.pushName))
      }
  }

export { pluginConfig as config, handler }
