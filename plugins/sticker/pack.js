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
import FormData from 'form-data'

const pluginConfig = {
    name: "pack",
    alias: [],
    category: "sticker",
    description: "pack",
    usage: ".pack",
    example: ".pack",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function toWebp(buffer) {
    return await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer()
  }

  async function uploadUguu(buffer) {
    let form = new FormData()
    form.append('files[]', buffer, 'file.webp')

    let res = await axios.post('https://uguu.se/upload.php', form, {
      headers: form.getHeaders()
    })

    return res.data.files[0].url
  }

  async function handler(m, { conn }) {
    try {
      if (!m.quoted) return m.reply('Reply gambar / sticker')

      let mime = m.quoted.mimetype || ''
      if (!/image|webp/.test(mime)) {
        return m.reply('Harus reply gambar atau sticker')
      }

      let media = await m.quoted.download()
      let webp = await toWebp(media)
      let url = await uploadUguu(webp)

      if (typeof conn.sendStickerPack !== 'function') {
        throw new Error('Fitur sticker pack tidak tersedia pada socket bot')
      }

      await conn.sendStickerPack(
        m.chat,
        [webp],
        m,
        {
          name: global.namebot || 'Bot',
          publisher: `\n\n\n\n${global.ownername || 'Owner'}`,
          description: 'ytta acumalaka'
        }
      )
    } catch (e) {
      console.error(e)
      m.reply('Error bikin sticker pack')
    }
  }

export { pluginConfig as config, handler }
