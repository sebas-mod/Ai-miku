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
import * as cheerio from 'cheerio'

const pluginConfig = {
    name: "amongustext",
    alias: [],
    category: "maker",
    description: "amongustext <text>",
    usage: ".amongustext <text>",
    example: ".amongustext <text>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const EFFECT_URL = 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html'
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'

  async function ephotoEffect(url, textInput) {
      const formData = new FormData()

      const initialResponse = await axios.get(url, {
          headers: { 'user-agent': UA }
      })

      const $ = cheerio.load(initialResponse.data)

      const token = $('input[name=token]').val()
      const buildServer = $('input[name=build_server]').val()
      const buildServerId = $('input[name=build_server_id]').val()

      formData.append('text[]', textInput)
      formData.append('token', token)
      formData.append('build_server', buildServer)
      formData.append('build_server_id', buildServerId)

      const postResponse = await axios({
          url,
          method: 'POST',
          data: formData,
          headers: {
              'Accept': '*/*',
              'Accept-Language': 'en-US,en;q=0.9',
              'user-agent': UA,
              'cookie': initialResponse.headers['set-cookie']?.join('; '),
              ...formData.getHeaders()
          }
      })

      const $$ = cheerio.load(postResponse.data)
      const formValueInput = JSON.parse($$('input[name=form_value_input]').val())
      formValueInput['text[]'] = formValueInput.text
      delete formValueInput.text

      const { data: finalResponseData } = await axios.post(
          'https://en.ephoto360.com/effect/create-image',
          new URLSearchParams(formValueInput),
          {
              headers: {
                  'user-agent': UA,
                  'cookie': initialResponse.headers['set-cookie'].join('; ')
              }
          }
      )

      return buildServer + finalResponseData.image
  }

  async function handler(m, { sock, reply, prefix, command, text }) {
      if (!text) {
          return reply(`╭─── ❖ 『 ✨ *ELYSIA ARTWORK* 』 ❖\n│ ✦ Masukkan teks yang ingin dibuat!\n│ ✦ *Contoh:* ${prefix}${command} Elysia Assistant`)
      }

      await m.react('🕕')

      try {
          const imageUrl = await ephotoEffect(EFFECT_URL, text)

          await sock.sendMessage(m.chat, {
              image: { url: imageUrl },
              caption: `✅ *Among Us Cover*\n\n> Text: ${text}`
          }, { quoted: m })

          await m.react('✅')
      } catch (e) {
          await m.react('❌')
          await reply(`╭─── ❖ 『 ⚠️ *GAGAL MEMPROSES* 』 ❖\n│ ✦ *Detail:* ${e.message}\n╰──────────────────❖\n_✦ Elysia Assistant sudah mencoba memproses, silakan coba sesaat lagi ya~_`)
      }
  }

export { pluginConfig as config, handler }
