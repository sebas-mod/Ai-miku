/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const pluginConfig = {
    name: "attp",
    alias: ["textstiker", "stikeranim"],
    category: "sticker",
    description: "attp <teks>",
    usage: ".attp <teks>",
    example: ".attp <teks>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const config = MikuRuntime.config;

const execFileAsync = promisify(execFile)
const FONT_FILE = fileURLToPath(new URL('../../assets/fonts/Inter-Bold.ttf', import.meta.url))
const COLORS = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#00c7ff', '#3d5afe', '#aa44ff', '#ff2d95']
const SIZE = 512

let ffmpegBin = 'ffmpeg'
try { ffmpegBin = createRequire(import.meta.url)('@ffmpeg-installer/ffmpeg').path || 'ffmpeg' } catch {}

let busy = 0

async function handler(m, { sock, text, reply, prefix, usedPrefix }) {
  const p = usedPrefix ?? prefix ?? '.'
  const raw = String(text || '').trim()
  if (!raw) return reply(`✨ *ATTP*\n\nPegatinas de texto animadas.\nEjemplo: ${p}attp Hola a todos`)
  if (raw.length > 100) return reply('❌ El texto es demasiado largo (máximo 100 letras).')
  if (busy >= 2) return reply('⏳ Está ocupado, inténtalo de nuevo en un momento.')

  let canvasLib
  try { canvasLib = await import('@napi-rs/canvas') } catch {
    return reply('❌ Esta función requiere @napi-rs/canvas, que aún no está instalado en el servidor.')
  }
  const { createCanvas, GlobalFonts } = canvasLib.default ?? canvasLib
  try { GlobalFonts.registerFromPath(FONT_FILE, 'AttpFont') } catch {}

  busy++
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'attp-'))
  try {
    const canvas = createCanvas(SIZE, SIZE)
    const ctx = canvas.getContext('2d')
    const family = '"AttpFont", Impact, "Arial Black", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'

    const words = raw.split(/\s+/).filter(Boolean)
    let size = 170, lines = []
    for (; size >= 24; size -= 4) {
      ctx.font = `bold ${size}px ${family}`
      lines = []
      let line = ''
      for (const w of words) {
        const t = line ? `${line} ${w}` : w
        if (ctx.measureText(t).width <= SIZE * 0.92 || !line) line = t
        else { lines.push(line); line = w }
      }
      if (line) lines.push(line)
      const ok = lines.every(l => ctx.measureText(l).width <= SIZE * 0.94) && lines.length * size * 1.15 <= SIZE * 0.92
      if (ok) break
    }

    const lh = size * 1.15
    const startY = SIZE / 2 - ((lines.length - 1) * lh) / 2
    ctx.font = `bold ${size}px ${family}`
    ctx.lineWidth = Math.max(4, size / 9)

    for (let f = 0; f < COLORS.length; f++) {
      ctx.clearRect(0, 0, SIZE, SIZE)
      ctx.strokeStyle = '#000000'
      ctx.fillStyle = COLORS[f]
      lines.forEach((l, i) => {
        ctx.strokeText(l, SIZE / 2, startY + i * lh)
        ctx.fillText(l, SIZE / 2, startY + i * lh)
      })
      fs.writeFileSync(path.join(dir, `f${f}.png`), canvas.toBuffer('image/png'))
    }

    const out = path.join(dir, 'out.webp')
    await execFileAsync(ffmpegBin, [
      '-y', '-hide_banner', '-nostdin', '-loglevel', 'error',
      '-framerate', '6', '-i', path.join(dir, 'f%d.png'),
      '-vcodec', 'libwebp', '-lossless', '1', '-loop', '0',
      '-preset', 'default', '-an', '-vsync', '0',
      '-s', `${SIZE}:${SIZE}`, out
    ], { timeout: 60000 })

    await sock.sendImageAsSticker(m.chat, fs.readFileSync(out), m, {
      packname: config.sticker.packname,
      author: config.sticker.author
    })
  } catch (e) {
    console.error('[attp]', e?.message || e)
    return reply('❌ No se pudieron crear stickers animados. Asegúrese de que esté instalado ffmpeg con soporte webp.')
  } finally {
    busy--
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

export { pluginConfig as config, handler }
