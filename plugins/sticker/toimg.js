/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import sharp from 'sharp'

const pluginConfig = {
    name: "toimg",
    alias: ["stikertoimg", "s2img"],
    category: "sticker",
    description: "toimg",
    usage: ".toimg",
    example: ".toimg",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, usedPrefix, command }) {
    if (!m.quoted) {
      return m.reply(`Reply sticker dengan command *${usedPrefix + command}*`)
    }

    let q = m.quoted
    let mime = q.mimetype || ''

    if (!/image\/webp/.test(mime)) {
      return m.reply('Itu bukan sticker')
    }

    try {
      let media = await q.download()

      let img = await sharp(media)
        .png({ quality: 100 })
        .toBuffer()

      await conn.sendFile(
        m.chat,
        img,
        'image.png',
        null,
        m
      )
    } catch (e) {
      console.error(e)
      m.reply('Gagal convert sticker ke image')
    }
  }

export { pluginConfig as config, handler }
