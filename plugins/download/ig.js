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

const sendAlbum = MikuRuntime.sendAlbum;

const pluginConfig = {
    name: "igexport",
    alias: ["ig", "instagram"],
    category: "download",
    description: "igexport",
    usage: ".igexport",
    example: ".igexport",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const BASE_URL = 'https://igexport.com'

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  async function handler(m, { sock, text, args, reply, usedPrefix, command }) {
  	const botName = global.namebot || 'Bot'
  	const rawUrl = text || (m.quoted ? (m.quoted.text || m.quoted.caption) : '') || args[0]

  	const igMatch = rawUrl?.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels|tv)\/[a-zA-Z0-9_\-\.]+/i)
  	const targetUrl = igMatch ? igMatch[0] : null

  	if (!targetUrl) {
  		return reply(
  			`📸 *INSTAGRAM DOWNLOADER (IGEXPORT)*\n\n` +
  			`Format:\n` +
  			`• \`${usedPrefix + command} <URL Postingan / Reel Instagram>\`\n` +
  			`• O responde a un mensaje que contenga un enlace con \`${usedPrefix + command}\`\n\n` +
  			`*Ejemplo:*\n` +
  			`• \`${usedPrefix + command} https://www.instagram.com/reel/C8xyz123/\``
  		)
  	}

  	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => null)

  	try {
  		const isReel = /instagram\.com\/(?:reel|reels|tv)\//i.test(targetUrl)
  		const endpoint = isReel
  			? `${BASE_URL}/api/ig-reels/?url=${encodeURIComponent(targetUrl)}`
  			: `${BASE_URL}/api/ig-photo/?url=${encodeURIComponent(targetUrl)}`

  		const { data } = await axios.get(endpoint, {
  			headers: {
  				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  				'Accept': 'application/json',
  				'Referer': `${BASE_URL}/id/video-download/`
  			},
  			timeout: 30000
  		})

  		if (!data?.ok) {
  			throw new Error('Contenido de Instagram no encontrado o cuenta privada.')
  		}

  		if (isReel) {
  			const videoUrl = data.media?.videoUrl
  			if (!videoUrl) {
  				throw new Error('Video Reel no encontrado en la respuesta del servidor.')
  			}

  			const caption = [
  				'🎬 *INSTAGRAM REELS DOWNLOADER*',
  				'─────────────────────────',
  				`• 🌐 *Source:* Igexport`,
  				'',
  				`© ${botName}`
  			].join('\n')

  			await sock.sendMessage(m.chat, {
  				video: { url: videoUrl },
  				mimetype: 'video/mp4',
  				fileName: data.media?.filename || 'instagram_reel.mp4',
  				caption
  			}, { quoted: m })

  			await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } }).catch(() => null)
  			return
  		}

  		const items = (data.media?.items || []).filter(item => item?.url)
  		if (!items.length) {
  			throw new Error('No hay contenido para descargar.')
  		}

  		if (items.length > 1) {
  			await sendAlbum(sock, m.chat, items.map((it, i) => ({
  				type: it.type === 'video' ? 'video' : 'image',
  				url: it.url,
  				caption: i === 0 ? `📸 *Instagram Media* (${items.length} item)\n\n© ${botName}` : ''
  			})), { quoted: m })
  			await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } }).catch(() => null)
  			return
  		}

  		for (let i = 0; i < items.length; i++) {
  			const item = items[i]
  			const isVideo = item.type === 'video'
  			const caption = items.length > 1
  				? `📸 *Instagram Media* [${i + 1}/${items.length}]\n\n© ${botName}`
  				: `✨ *Instagram Downloaded*\n\n© ${botName}`

  			if (isVideo) {
  				await sock.sendMessage(m.chat, {
  					video: { url: item.url },
  					mimetype: 'video/mp4',
  					fileName: item.filename || 'instagram.mp4',
  					caption
  				}, { quoted: m })
  			} else {
  				await sock.sendMessage(m.chat, {
  					image: { url: item.url },
  					caption
  				}, { quoted: m })
  			}

  			if (items.length > 1 && i < items.length - 1) {
  				await delay(1200)
  			}
  		}

  		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } }).catch(() => null)

  	} catch (e) {
  		console.error('[IGEXPORT ERROR]:', e.response?.data || e.message || e)
  		await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null)
  		return reply(`❌ Error al descargar el contenido de Instagram: ${e.message || e}`)
  	}
  }

export { pluginConfig as config, handler }
