/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import * as ch from 'cheerio'

const pickImage = MikuRuntime.pickImage;
const reactTo = MikuRuntime.reactTo;

const pluginConfig = {
    name: "imagetoasci",
    alias: [],
    category: "tools",
    description: "imagetoasci <reply gambar/url>",
    usage: ".imagetoasci <reply gambar/url>",
    example: ".imagetoasci <reply gambar/url>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const siteBase = 'https://www.text-image.com'
  const asciiPage = '/convert/ascii.html'
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'

  async function handler(m, { sock, text, prefix, command, reply }) {
      const usedPrefix = prefix || '.'
      const url = /^https?:\/\//i.test(String(text || '').trim()) ? String(text).trim().split(/\s+/)[0] : null
      const img = pickImage(m)

      if (!img && !url) {
          return reply(`*🍂 ¡Falta una imagen!*\n*Ejemplo: ${usedPrefix + command} (responde a una imagen o envía una URL)*`)
      }

      await reactTo(sock, m, '⏳')
      try {
          let buffer = null
          let sourceUrl = null

          if (img) {
              buffer = await img.download()
          } else {
              sourceUrl = url
              try {
                  const r = await fetch(sourceUrl)
                  if (!r.ok) return reply(`*🍂 ¡No se pudo obtener la imagen!*\n*Estado:* ${r.status} ${r.statusText}`)
                  buffer = Buffer.from(await r.arrayBuffer())
              } catch {
                  buffer = null
              }
          }

          if (!buffer?.length && !sourceUrl) return reply('*🍂 ¡Formato no válido!*\n*Usa: responder a una imagen o una URL de imagen.*')

          const size = buffer ? buffer.length : 0
          let width
          if (size && size < 150_000) width = 50
          else if (size && size < 350_000) width = 65
          else if (size && size < 700_000) width = 80
          else width = 100

          const getHeaders = {
              'User-Agent': UA,
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9'
          }

          const getController = new AbortController()
          const getTimeout = setTimeout(() => getController.abort(), 10000)
          const getRes = await fetch(siteBase + asciiPage, { method: 'GET', signal: getController.signal, headers: getHeaders })
          clearTimeout(getTimeout)
          const setCookie = getRes.headers.get('set-cookie') ?? ''
          await getRes.text()

          const buildForm = (w, useImageUrlOnly = false) => {
              const f = new FormData()
              f.append('format', 'ascii')
              f.append('width', String(w))
              f.append('textcolor', '#000000')
              f.append('bgcolor', '#ffffff')
              f.append('invert', '0')
              f.append('contrast', '1')
              if (!useImageUrlOnly && buffer) f.append('image', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg')
              if (sourceUrl) f.append('imageurl', sourceUrl)
              return f
          }

          const postHeaders = {
              Origin: siteBase,
              Referer: siteBase + asciiPage,
              'User-Agent': UA,
              Accept: getHeaders.Accept,
              'Accept-Language': getHeaders['Accept-Language']
          }
          if (setCookie) postHeaders.Cookie = setCookie.split(',').map(s => s.split(';')[0]).join('; ')

          const tryConvert = async (form) => {
              const controller = new AbortController()
              const timeout = setTimeout(() => controller.abort(), 25000)
              const res = await fetch(siteBase + '/convert/result.cgi', { method: 'POST', body: form, signal: controller.signal, headers: postHeaders })
              clearTimeout(timeout)
              return { ok: res.ok, status: res.status, text: await res.text() }
          }

          const valid = (r) => r.ok && r.text.includes('id="tiresult"')
          let res = await tryConvert(buildForm(width, false))
          if (!valid(res) && width !== 65) res = await tryConvert(buildForm(65, false))
          if (!valid(res) && sourceUrl) res = await tryConvert(buildForm(width, true))

          if (!valid(res)) {
              const html = res.text || ''
              if (html.includes('Error:')) {
                  const cleanErr = html.split('Error:')[1].split('<')[0].trim()
                  return reply(`*🍂 No se pudo convertir — la imagen no se puede procesar.*\n*Motivo:* ${cleanErr}`)
              }
              return reply(`*🍂 No se pudo convertir — resultado vacío.*\n*Ancho:* ${width}\n*Estado:* ${res.status}`)
          }

          const $ = ch.load(res.text)
          const ascii = $('#tiresult').text().trim()
          const share = $('#sharebutton').parent().find('a').attr('href') ?? null
          if (!ascii) return reply(`*🍂 No se pudo convertir — resultado vacío.*\n*Ancho:* ${width}`)

          let out = `*✨ Image To Ascii (Auto-Width) ✨*\n\n`
          out += `*🖼️ Ancho automático:* *${width}*\n\n`
          out += `*📄 Resultado ASCII:*\n\`\`\`\n${ascii}\n\`\`\``
          if (share) out += `\n*🔗 Share Link:* ${share}`
          await reply(out)
          await reactTo(sock, m, '✅')
      } catch (e) {
          await reactTo(sock, m, '❌')
          return reply(`*🍂 ¡Ocurrió un error al procesar la imagen!*\n*Error:* ${e?.message ?? 'unknown error'}`)
      }
  }

export { pluginConfig as config, handler }
