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

  const pluginConfig = {
      name: 'bratvid2',
      alias: ["bvid2"],
      category: "sticker",
      description: 'Generate brat video v2',
      usage: '.bratvid2 <text>',
      example: '.bratvid2 hello world',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 1,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ')

      if (!text) {
          return m.reply(`🎬 *ʙʀᴀᴛ ᴠɪᴅᴇᴏ ᴠ2*\n\n> Masukkan teks\n\n\`Contoh: ${m.prefix}bratvid2 hello world\``)
      }

      m.react('🕕')

      try {
          const url = `https://api-faa.my.id/faa/bratvid?text=${encodeURIComponent(text)}`
          await sock.sendVideoAsSticker(m.chat, url, m, {
              packname: config.sticker.packname,
              author: config.sticker.author
          })
          m.react('✅')
      } catch (error) {
          m.react('☢')
          m.reply(te(m.prefix, m.command, m.pushName))
      }
  }

export { pluginConfig as config, handler }
