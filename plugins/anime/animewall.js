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
import { createCanvas } from '@napi-rs/canvas';

  const pluginConfig = {
      name: 'animewall',
      alias: [],
      category: "anime",
      description: 'Wallpaper de anime HD aleatorio de varias series',
      usage: '.animewall [series]',
      example: '.animewall\n.animewall naruto\n.animewall zero two',
      isOwner: false,
      isPremium: false,
      isGroup: true,
      isPrivate: false,
      cooldown: 5,
      energi: 1,
      isEnabled: true
  }

  const THEME = {
      bg: '#0a050f',
      primary: '#ff2a6d',
      secondary: '#ff69b4',
      white: '#ffffff',
      gray: '#ff99bb',
      glow: '#ff2a6d'
  }

  const WALLPAPER_APIS = [
      {
          name: 'waifu.pics',
          url: (query) => query ? null : 'https://api.waifu.pics/sfw/wallpaper',
          isRandom: true
      },
      {
          name: 'neko-reimu',
          url: (query) => query ? `https://api.neko-reimu.xyz/api/wallpaper?q=${encodeURIComponent(query)}` : 'https://api.neko-reimu.xyz/api/wallpaper',
          isRandom: true
      }
  ]

  const FALLBACK_WALLPAPERS = [
      'https://wallpapercave.com/wp/wp6603592.jpg',
      'https://wallpapercave.com/wp/wp6603600.jpg',
      'https://wallpapercave.com/wp/wp6603619.jpg',
      'https://wallpapercave.com/wp/wp6603628.jpg'
  ]

  async function fetchWallpaper(query = null) {
      for (const api of WALLPAPER_APIS) {
          try {
              const url = api.url(query)
              if (!url) continue

              const response = await axios.get(url, {
                  timeout: 8000,
                  headers: { 'User-Agent': 'Mozilla/5.0' }
              })

              let imageUrl = null

              if (api.name === 'waifu.pics' && response.data.url) {
                  imageUrl = response.data.url
              } else if (api.name === 'neko-reimu' && response.data.url) {
                  imageUrl = response.data.url
              } else if (response.data.image || response.data.img) {
                  imageUrl = response.data.image || response.data.img
              }

              if (imageUrl) {
                  return { success: true, url: imageUrl, source: api.name }
              }
          } catch (err) {
              console.log(`[AnimeWall] ${api.name} error:`, err.message)
          }
      }

      if (query) {
          try {
              const unsplashUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(query + ' anime')}`
              return { success: true, url: unsplashUrl, source: 'unsplash' }
          } catch (err) {}
      }

      const randomIndex = Math.floor(Math.random() * FALLBACK_WALLPAPERS.length)
      return { success: true, url: FALLBACK_WALLPAPERS[randomIndex], source: 'fallback', isFallback: true }
  }

  async function renderInfoCard(query, wallpaper) {
      const w = 500
      const h = 350
      const canvas = createCanvas(w, h)
      const ctx = canvas.getContext('2d')

      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, THEME.bg)
      grad.addColorStop(1, '#1a0b1a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      ctx.globalAlpha = 0.05
      for (let i = 0; i < w; i += 50) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i, h)
          ctx.strokeStyle = THEME.primary
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, i)
          ctx.lineTo(w, i)
          ctx.stroke()
      }
      ctx.globalAlpha = 1

      ctx.strokeStyle = THEME.primary
      ctx.lineWidth = 3
      ctx.strokeRect(12, 12, w - 24, h - 24)

      ctx.fillStyle = THEME.primary
      ctx.font = 'bold 20px "Segoe UI"'
      ctx.textAlign = 'center'
      ctx.shadowColor = THEME.glow
      ctx.shadowBlur = 10
      ctx.fillText('🖼️ Ai Miku WALLPAPER 🖼️', w/2, 45)
      ctx.shadowBlur = 0

      ctx.fillStyle = THEME.cardBg || '#1a0b1a'
      ctx.beginPath()
      roundRect(ctx, 35, 70, w - 70, 180, 12)
      ctx.fill()

      ctx.fillStyle = THEME.white
      ctx.font = 'bold 18px "Segoe UI"'
      ctx.fillText(query ? `📺 ${query.toUpperCase()}` : '🎲 RANDOM WALLPAPER', w/2, 110)

      ctx.fillStyle = THEME.gray
      ctx.font = '12px "Segoe UI"'
      ctx.fillText(`📡 Source: ${wallpaper.source}`, w/2, 145)

      ctx.fillStyle = THEME.secondary
      ctx.font = '11px "Segoe UI"'
      if (wallpaper.isFallback) {
          ctx.fillText('⚠️ Usando alternativa (puede que la API esté caída)', w/2, 175)
      } else {
          ctx.fillText('✨ ¡Wallpaper listo para descargar, darling~! ✨', w/2, 175)
      }

      ctx.fillStyle = '#00000050'
      ctx.beginPath()
      roundRect(ctx, 70, 200, 360, 35, 10)
      ctx.fill()

      ctx.fillStyle = THEME.white
      ctx.font = '10px "Segoe UI"'
      ctx.fillText('📌 Haga clic en la imagen y luego en "Guardar como imagen" para descargar', w/2, 223)

      ctx.fillStyle = `${THEME.primary}80`
      ctx.font = '9px "Segoe UI"'
      ctx.fillText('Anime Wallpaper', w/2, h - 18)

      return canvas.toBuffer('image/png')
  }

  function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      return ctx
  }

  function formatCaption(query, wallpaper) {
      let caption = `🖼️ *Ai Miku WALLPAPER* 🖼️\n\n`

      if (query) {
          caption += `📺 *Request:* ${query.toUpperCase()}\n`
      } else {
          caption += `🎲 *Random Wallpaper*\n`
      }

      caption += `📡 *Source:* ${wallpaper.source}\n`
      caption += `\n`
      caption += `📌 *Cara download:*\n`
      caption += `1. Haga clic en la imagen de arriba\n`
      caption += `2. Pulsa "...", elige "Guardar como imagen"\n`
      caption += `\n`

      if (wallpaper.isFallback) {
          caption += `⚠️ *Nota:* API está ocupado, este es un fondo de pantalla de respaldo.\n`
      }

      caption += `💕 *Ai Miku:* ${query ? `Nih wallpaper ${query} darling~` : 'Wallpaper aleatorio para ti, darling~'} 🦋`

      return caption
  }

  async function run(m, { sock }) {
      const query = m.text?.trim() || null

      await m.react('🖼️')

      try {
          await m.reply(query ? `🦋 *Ai Miku:* Buscando fondo de pantalla*${query}*... espera un momento, vale~ 🖼️` : `🦋 *Ai Miku:* Tomando un fondo de pantalla aleatorio... espera un momento, vale~ 🖼️`)

          const wallpaper = await fetchWallpaper(query)

          if (!wallpaper.success && !wallpaper.url) {
              await m.react('❌')
              return m.reply(`❌ ¡No se pudo recuperar el fondo de pantalla!\n\nInténtalo de nuevo más tarde, cariño~ 🦋`)
          }

          try {
              const imgBuffer = await renderInfoCard(query, wallpaper)

              await sock.sendMessage(m.chat, {
                  image: imgBuffer,
                  caption: formatCaption(query, wallpaper)
              }, { quoted: m })

              await sock.sendMessage(m.chat, {
                  image: { url: wallpaper.url },
                  caption: `🖼️ *Wallpaper ${query ? query.toUpperCase() : 'Random'}* 🖼️\n\n📡 Source: ${wallpaper.source}\n💕 Ai Miku: Semoga suka darling~`
              }, { quoted: m })

          } catch (imgErr) {
              console.error('[AnimeWall] Render error:', imgErr)
              await sock.sendMessage(m.chat, {
                  image: { url: wallpaper.url },
                  caption: formatCaption(query, wallpaper)
              }, { quoted: m })
          }

          await m.react('✅')

      } catch (err) {
          console.error('[AnimeWall] Error:', err)
          await m.react('❌')
          await m.reply(`❌ *Error:* ${err.message}\n\nInténtalo de nuevo más tarde, cariño~ 🦋`)
      }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
