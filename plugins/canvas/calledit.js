/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { existsSync as _tplExists } from 'node:fs'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import te from '../../src/lib/core/error.js'

const pluginConfig = {
    name: 'calledit',
    alias: [],
    category: 'canvas',
    description: 'Membuat edit gambar call WhatsApp dari foto yang dikirim pengguna',
    usage: '.calledit <waktu>/<nama> + foto',
    example: '.calledit 0.09/Jack + foto',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const TEMPLATE = join(process.cwd(), 'assets', 'calledit-template.png')
const W = 674
const H = 1536
const AVATAR_X = W / 2
const AVATAR_Y = 655
const AVATAR_RADIUS = 134

let templateCache = null
let templateImageCache = null

async function getTemplate() {
    if (!templateCache) templateCache = await readFile(TEMPLATE)
    return templateCache
}

async function getTemplateImage() {
    if (!templateImageCache) {
        templateImageCache = await loadImage(await getTemplate())
    }
    return templateImageCache
}

function drawCircleImage(ctx, image, cx, cy, radius) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()

    const iw = image.width || 1
    const ih = image.height || 1
    const scale = Math.max((radius * 2) / iw, (radius * 2) / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = cx - dw / 2
    const dy = cy - dh / 2
    ctx.drawImage(image, dx, dy, dw, dh)
    ctx.restore()
}

function drawHeaderText(ctx, name, duration) {
    // The template contains the exact WhatsApp call layout; this writes only
    // the dynamic header values on top of the cleaned template.
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    ctx.fillStyle = '#f1f3f4'
    ctx.font = 'bold 22px Arial, sans-serif'
    ctx.fillText(name, AVATAR_X, 111)

    ctx.fillStyle = '#aebac1'
    ctx.font = '18px Arial, sans-serif'
    ctx.fillText(String(duration), AVATAR_X, 140)
    ctx.restore()
}

async function generateLocalCallEdit(name, duration, avatarBuffer) {
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')
    const template = await getTemplateImage()

    // Use the user's exact reference screenshot as the visual template.
    ctx.drawImage(template, 0, 0, W, H)

    drawHeaderText(ctx, name, duration)

    // Place the user-supplied image directly inside the reference circle.
    // The original white ring remains untouched because the photo is clipped
    // slightly inside it.
    if (avatarBuffer) {
        const avatar = await loadImage(avatarBuffer)
        drawCircleImage(ctx, avatar, AVATAR_X, AVATAR_Y, AVATAR_RADIUS)
    }

    return canvas.toBuffer('image/png')
}

async function handler(m, { sock }) {
    if (!_tplExists(TEMPLATE)) {
        return m.reply('⚠️ Template belum ada.\n\nLetakkan gambar template di:\n`assets/calledit-template.png`')
    }
    const text = String(m.text || '').trim()

    if (!text.includes('/')) {
        return m.reply(
            `⚠️ *CARA PAKAI*\n\n` +
            `Kirim foto dengan caption:\n` +
            `> \`${m.prefix}calledit <waktu>/<nama>\`\n\n` +
            `Contoh: \`${m.prefix}calledit 0.09/Jack\`\n\n` +
            `📷 Foto yang kamu kirim akan langsung ditempel ke lingkaran profil.`
        )
    }

    const [rawWaktu, ...nameParts] = text.split('/')
    const waktu = rawWaktu.trim()
    const nama = nameParts.join('/').trim()

    if (!waktu) return m.reply('❌ Waktu tidak boleh kosong!')
    if (!nama) return m.reply('❌ Nama tidak boleh kosong!')
    if (nama.length > 60) return m.reply('❌ Nama terlalu panjang. Maksimal 60 karakter.')

    const imageSource = m.isImage ? m : (m.quoted?.isImage ? m.quoted : null)
    if (!imageSource?.download) {
        return m.reply(
            `❌ Foto wajib dikirim.\n\n` +
            `Kirim foto + caption \`${m.prefix}calledit ${waktu}/${nama}\` ` +
            `atau reply foto lalu kirim perintah tersebut.`
        )
    }

    await m.react('🕕')

    try {
        const imageBuffer = await imageSource.download()
        if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
            throw new Error('Gagal mengunduh gambar')
        }

        const result = await generateLocalCallEdit(nama, waktu, imageBuffer)
        await sock.sendMedia(m.chat, result, null, m, { type: 'image' })
        await m.react('✅')
    } catch (error) {
        console.log('[calledit] Error:', error)
        await m.react('❌')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
