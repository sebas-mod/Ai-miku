/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
const mikuWrapPlugin = MikuRuntime.mikuWrapPlugin;
import axios from 'axios';
import * as cheerio from 'cheerio';

  const pluginConfig = {
      name: 'animedl',
      alias: [],
      category: "anime",
      description: 'Download anime batch/single episode dari Kusonime',
      usage: '.animedl <judul | eps>',
      example: '.animedl jujutsu kaisen season 2 | 1',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 15,
      energi: 2,
      isEnabled: true
  }

  async function searchAnime(query) {
      try {
          const response = await axios.get(`https://kusonime.com/?s=${encodeURIComponent(query)}`, {
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
          })
          const $ = cheerio.load(response.data)
          const results = []

          $('.venz > ul > .kover').each((i, el) => {
              const item = $(el)
              const title = item.find('.content h2 a').text().trim()
              const url = item.find('.content h2 a').attr('href')
              if (title && url) {
                  results.push({ title, url })
              }
          })

          return results
      } catch (err) {
          console.error('[AnimeDL] Search error:', err.message)
          return []
      }
  }

  async function getAnimeDetail(url) {
      try {
          const response = await axios.get(url, {
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
          })
          const $ = cheerio.load(response.data)

          const title = $('h1.jdlz').text().trim()
          const poster = $('.post-thumb img.wp-post-image').attr('src') || ''

          const info = {}
          $('.info p').each((i, el) => {
              const text = $(el).text().trim()
              if (text.includes(':')) {
                  const [key, ...valueParts] = text.split(':')
                  const cleanKey = key.trim().toLowerCase()
                  const cleanValue = valueParts.join(':').trim()
                  info[cleanKey] = cleanValue
              }
          })

          const downloads = []

          $('.smokeddlrh').each((i, batchEl) => {
              const $batch = $(batchEl)
              const batchTitle = $batch.find('.smokettlrh').text().trim()

              $batch.find('.smokeurlrh').each((j, resEl) => {
                  const $res = $(resEl)
                  const resolution = $res.find('strong').text().trim()

                  const links = []
                  $res.find('a').each((k, a) => {
                      const $a = $(a)
                      const provider = $a.text().trim()
                      const url = $a.attr('href')
                      if (url && url.startsWith('http')) {
                          links.push({ provider, url })
                      }
                  })

                  if (links.length > 0) {
                      downloads.push({
                          title: batchTitle,
                          resolution: resolution,
                          links: links
                      })
                  }
              })
          })

          $('.smokedl .smokeurl').each((i, el) => {
              const $el = $(el)
              const resolution = $el.find('strong').text().trim()
              const links = []
              $el.find('a').each((j, a) => {
                  const $a = $(a)
                  const provider = $a.text().trim()
                  const url = $a.attr('href')
                  if (url && url.startsWith('http')) {
                      links.push({ provider, url })
                  }
              })
              if (links.length > 0) {
                  downloads.push({
                      title: 'Single Episode',
                      resolution: resolution || 'All',
                      links: links
                  })
              }
          })

          return { title, poster, info, downloads }
      } catch (err) {
          console.error('[AnimeDL] Detail error:', err.message)
          return null
      }
  }

  function extractEpisodeFromDownloads(downloads, targetEpisode) {
      const results = []

      for (const item of downloads) {
          const title = item.title || ''
          const resolution = item.resolution || ''

          let episodeMatch = null
          const epRegex = /(?:Episode|Eps|EP|eps|episode)[\s]*(\d+)/i
          const match = title.match(epRegex)

          if (match) {
              episodeMatch = parseInt(match[1])
          }

          const titleLower = title.toLowerCase()
          if (titleLower.includes('batch') || titleLower.includes('season') || titleLower.includes('complete')) {
              if (targetEpisode === 'batch') {
                  results.push({
                      type: 'Batch',
                      title: item.title,
                      resolution: resolution,
                      links: item.links
                  })
              }
          } else if (episodeMatch) {
              if (targetEpisode === 'batch') {
                  continue
              } else if (parseInt(targetEpisode) === episodeMatch) {
                  results.push({
                      type: `Episode ${episodeMatch}`,
                      title: item.title,
                      resolution: resolution,
                      links: item.links
                  })
              }
          }
      }

      return results
  }

  async function run(m, { sock }) {
      const input = m.args.join(' ') || m.text?.trim() || ''

      if (!input) {
          return m.reply(
              `💕 *ᴀɴɪᴍᴇ ᴅᴏᴡɴʟᴏᴀᴅ* 💕\n\n` +
              `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `┃ ✦ *Cara Pakai*\n` +
              `┃\n` +
              `┃   ${m.prefix}animedl <título> | <eps/lote>\n` +
              `┃\n` +
              `┃ ✦ *Ejemplo*\n` +
              `┃\n` +
              `┃   ${m.prefix}animedl jujutsu kaisen | 1\n` +
              `┃   ${m.prefix}animedl jujutsu kaisen | batch\n` +
              `┃\n` +
              `┃ 💗 *Ai Miku:* ¿Qué anime quieres descargar cariño~?\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          )
      }

      const parts = input.split('|').map(p => p.trim())
      const query = parts[0]
      let episode = parts[1] || '1'

      if (!query) {
          return m.reply(`❌ Ingresa el título del anime querido ~`)
      }

      episode = episode.toLowerCase()
      const isBatch = episode === 'batch'

      m.react('💕')
      await m.reply(`⏳ *PROCESSING...*\n\n💗 *Ai Miku:* Buscando anime ${query} cariño ~ espera un momento, está bien 🦋`)

      try {
          const searchResults = await searchAnime(query)

          if (!searchResults || searchResults.length === 0) {
              m.react('💔')
              return m.reply(`💔 *NO ENCONTRADO*\n\n> anime *${query}*no encontrado cariño~`)
          }

          const anime = searchResults[0]
          const detail = await getAnimeDetail(anime.url)

          if (!detail || !detail.downloads.length) {
              m.react('💔')
              return m.reply(`💔 *NO ENCONTRADO*\n\n> Enlace de descarga no encontrado cariño~`)
          }

          let matchedDownloads = []

          if (isBatch) {
              matchedDownloads = extractEpisodeFromDownloads(detail.downloads, 'batch')
          } else {
              const episodeNum = parseInt(episode)
              if (isNaN(episodeNum)) {
                  m.react('💔')
                  return m.reply(`💔 *ERROR*\n\n>Número de episodio no válido, cariño~`)
              }
              matchedDownloads = extractEpisodeFromDownloads(detail.downloads, episodeNum)
          }

          if (matchedDownloads.length === 0) {
              m.react('💔')
              return m.reply(
                  `💔 *NO ENCONTRADO*\n\n` +
                  `> ${isBatch ? 'Batch download' : `Episode ${episode}`} no encontrado cariño ~\n\n` +
                  `> Prueba con otro título o un episodio diferente 🥺`
              )
          }

          let txt = `💕 *ᴀɴɪᴍᴇ ᴅᴏᴡɴʟᴏᴀᴅ* 💕\n\n`
          txt += `╭━━━━━━━━━━━━━━━━━━━━━⬣\n`
          txt += `┃ 📺 *ᴛɪᴛʟᴇ*: ${detail.title}\n`
          if (detail.info.genre) txt += `┃ 🏷️ *ɢᴇɴʀᴇ*: ${detail.info.genre}\n`
          if (detail.info.status) txt += `┃ 📌 *ꜱᴛᴀᴛᴜꜱ*: ${detail.info.status}\n`
          if (detail.info.episode) txt += `┃ 📀 *ᴇᴘɪꜱᴏᴅᴇ*: ${detail.info.episode}\n`
          txt += `╰━━━━━━━━━━━━━━━━━━━━━⬣\n\n`

          for (const dl of matchedDownloads) {
              txt += `╭━━━〔 📦 ${dl.type} › ${dl.resolution} 〕━━━⬣\n`
              for (const link of dl.links) {
                  txt += `┃    • ${link.provider}: ${link.url}\n`
              }
              txt += `╰━━━━━━━━━━━━━━━━━━━━━⬣\n\n`
          }

          txt += `💗 *Ai Miku:* Haz clic en el enlace de arriba para descargar cariño~ 🎬`

          await m.reply(txt)
          m.react('✅')

      } catch (err) {
          console.error('[AnimeDL] Error:', err)
          m.react('💔')
          return m.reply(
              `💔 *ᴇʀʀᴏʀ*\n\n` +
              `> ${err.message}\n\n` +
              `> Inténtalo de nuevo, cariño ~ 🥺`
          )
      }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
