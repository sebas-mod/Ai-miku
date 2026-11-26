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
import FormData from 'form-data'

const pickMedia = ElysiaRuntime.pickMedia;
const reactTo = ElysiaRuntime.reactTo;

const pluginConfig = {
    name: "aidetect",
    alias: [],
    category: "tools",
    description: "aidetect",
    usage: ".aidetect",
    example: ".aidetect",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const baseURL = 'https://hivedetect.ai'

  const headers = {
      accept: 'application/json, text/plain, */*',
      origin: baseURL,
      referer: `${baseURL}/new`,
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
  }

  const persen = (n) => typeof n === 'number' ? (n * 100).toFixed(2) + '%' : 'Tidak tersedia'

  async function handler(m, { sock, prefix, command, reply }) {
      try {
          const media = pickMedia(m)
          const mime = media?.mime || ''
          if (!/^image\/(jpeg|jpg|png|webp)$/i.test(mime)) {
              return reply(`Responde o envía una imagen con el texto *${prefix}${command}*`)
          }

          await reactTo(sock, m, '⏳')
          const buffer = await media.download()
          if (!buffer?.length) throw new Error('No se pudo descargar la imagen.')

          const form = new FormData()
          form.append('media', buffer, { filename: `image.${mime.split('/')[1]}`, contentType: mime })

          const upload = await axios.post(`${baseURL}/api/v1/upload`, form, {
              headers: { ...headers, ...form.getHeaders() },
              timeout: 120000,
              maxBodyLength: Infinity
          })

          const key = upload.data?.data?.short_key
          if (!key) throw new Error('No se pudo subir la imagen.')

          const { data } = await axios.get(`${baseURL}/json/${key}.json`, { headers, timeout: 60000 })
          const classes = data?.visual?.status?.[0]?.response?.output?.[0]?.classes
          if (!Array.isArray(classes)) throw new Error('El resultado de la detección aún no está listo, inténtalo en un momento.')

          const ai = classes.find(v => v.class === 'ai_generated')?.score
          const human = classes.find(v => v.class === 'not_ai_generated')?.score
          const deepfake = classes.find(v => v.class === 'deepfake')?.score

          const hasil = typeof ai === 'number' && typeof human === 'number'
              ? (ai > human ? 'Es probable que la imagen haya sido creada por IA.' : 'Es probable que la imagen no sea obra de una IA.')
              : 'Todavía no se puede concluir el resultado.'

          await reply(
              `*🔍 DETEKSI GAMBAR AI*\n\n` +
              `Estado: ${hasil}\n\n` +
              `AI Generated: ${persen(ai)}\n` +
              `Not AI Generated: ${persen(human)}\n` +
              `Deepfake: ${persen(deepfake)}\n\n` +
              `_Hasil berupa estimasi model deteksi, bukan kepastian mutlak._`
          )
          await reactTo(sock, m, '✅')
      } catch (e) {
          await reactTo(sock, m, '❌')
          const detail = typeof e.response?.data === 'string' ? e.response.data.slice(0, 200) : e.message
          reply(`❌ No se pudo analizar la imagen.\n${detail}`)
      }
  }

export { pluginConfig as config, handler }
