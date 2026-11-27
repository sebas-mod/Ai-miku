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
import FormData from 'form-data'

const config = MikuRuntime.config;
const uploadToCatboxFile = MikuRuntime.uploadToCatboxFile;
const sendImageAsSticker = MikuRuntime.sendImageAsSticker;
const pickImage = MikuRuntime.pickImage;
const uploadFile = MikuRuntime.uploadFile;
const reactTo = MikuRuntime.reactTo;

const pluginConfig = {
    name: "smeme",
    alias: ["stikermeme"],
    category: "sticker",
    description: "smeme atas|bawah",
    usage: ".smeme atas|bawah",
    example: ".smeme atas|bawah",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function uploadUguu(buffer, ext) {
    const form = new FormData()
    form.append('files[]', buffer, { filename: `meme.${ext}` })
    const res = await axios.post('https://uguu.se/upload.php', form, { headers: form.getHeaders(), timeout: 30000 })
    return res.data?.files?.[0]?.url
  }

  async function isDirectImage(url) {
    try {
      const r = await axios.get(url, { responseType: 'stream', timeout: 15000, validateStatus: () => true })
      r.data.destroy()
      return r.status === 200 && /^image\//i.test(String(r.headers['content-type'] || ''))
    } catch {
      return false
    }
  }

  async function uploadForMeme(buffer, mime) {
    const ext = /png/.test(mime) ? 'png' : 'jpg'
    const hosts = [
      () => uploadToCatboxFile(buffer, `meme.${ext}`),
      () => uploadUguu(buffer, ext),
      () => uploadFile(buffer)
    ]
    for (const up of hosts) {
      try {
        const url = await up()
        if (url && await isDirectImage(url)) return url
      } catch {}
    }
    return null
  }

  const formatMemegenText = (str) => {
    if (!str || !str.trim()) return '_'
    return str.trim()
      .replace(/_/g, '__')
      .replace(/-/g, '--')
      .replace(/ /g, '_')
      .replace(/\?/g, '~q')
      .replace(/%/g, '~p')
      .replace(/#/g, '~h')
      .replace(/\//g, '~s')
      .replace(/\\/g, '~b')
      .replace(/"/g, "''")
      .replace(/&/g, '~a')
  }

  async function handler(m, { sock, text, reply, prefix, usedPrefix, command }) {
    const p = usedPrefix ?? prefix ?? '.'
    const image = pickImage(m)

    if (!image) {
      return reply(`Enviar/Responder a imagen con texto:\n${p}${command || 'smeme'} texto superior|texto inferior\n\n❌ ¡Solo se puede usar para imágenes (no para pegatinas)!`)
    }

    const [atas, bawah] = text ? String(text).split('|') : ['', '']

    await reactTo(sock, m, '⏳')
    await reply(global.mess?.wait || 'Espera un momento, por favor...')

    try {
      const mediaBuffer = await image.download()
      if (!mediaBuffer?.length) throw new Error('No se pudo descargar la imagen, intente reenviarla.')

      const imageUrl = await uploadForMeme(mediaBuffer, image.mime || '')
      if (!imageUrl) throw new Error('No se pudieron cargar imágenes en el alojamiento (todos los servidores fallaron), inténtelo nuevamente más tarde.')

      const encodedAtas = encodeURIComponent(formatMemegenText(atas))
      const encodedBawah = encodeURIComponent(formatMemegenText(bawah))
      const apiUrl = `https://api.memegen.link/images/custom/${encodedAtas}/${encodedBawah}.png?background=${encodeURIComponent(imageUrl)}`

      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      })

      const resultBuffer = Buffer.from(response.data)

      await sendImageAsSticker(sock, m.chat, resultBuffer, m, {
        packname: config.sticker.packname,
        author: config.sticker.author
      })

      await reactTo(sock, m, '✅')
    } catch (error) {
      console.error('[SMEME ERROR]', error?.message || error)
      await reactTo(sock, m, '❌')
      return reply(`❌ ${error?.message || global.mess?.error || 'Ocurrió un error.'}`)
    }
  }

export { pluginConfig as config, handler }
