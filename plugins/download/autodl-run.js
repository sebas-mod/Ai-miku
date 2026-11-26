/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const aiodl = ElysiaRuntime.aiodl;
const reactTo = ElysiaRuntime.reactTo;

const pluginConfig = {
    name: "autodl-run",
    alias: ["autodlrun"],
    category: "download",
    description: "Fitur download autodl-run",
    usage: ".autodl-run",
    example: ".autodl-run",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const HOSTS = /(^|\.)(tiktok\.com|instagram\.com|youtu\.be|youtube\.com|facebook\.com|fb\.watch|twitter\.com|x\.com)$/i
  const MAX_IMAGES = 5
  const recent = new Map()
  const busy = new Set()

  function findUrl(text) {
      for (const raw of String(text).match(/https?:\/\/[^\s]+/gi) || []) {
          try {
              const u = new URL(raw.replace(/[),.!?]+$/, ''))
              if (HOSTS.test(u.hostname)) return u.href
          } catch {}
      }
      return null
  }

  async function handler(m, { sock, jid }) {
      if (!global.db?.groups?.[jid]?.autodl) return false
      const url = findUrl(m.text || m.body)
      if (!url) return false

      const key = `${jid}|${url}`
      if (busy.has(jid) || Date.now() - (recent.get(key) || 0) < 60_000) return true
      recent.set(key, Date.now())
      if (recent.size > 200) recent.delete(recent.keys().next().value)

      busy.add(jid)
      try {
          await reactTo(sock, m, '⏳')
          const result = await Promise.race([
              aiodl(url),
              new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 90_000))
          ])
          const media = result?.media || []
          if (!media.length) throw new Error('media kosong')

          const caption = result.title ? String(result.title).slice(0, 900) : undefined
          const video = media.find(x => x.type === 'video')
          if (video) {
              await sock.sendMessage(jid, { video: { url: video.url }, caption }, { quoted: m })
          } else {
              const images = media.filter(x => x.type !== 'audio').slice(0, MAX_IMAGES)
              for (const [i, item] of images.entries()) {
                  await sock.sendMessage(jid, { image: { url: item.url }, caption: i === 0 ? caption : undefined }, { quoted: m })
              }
              const audio = media.find(x => x.type === 'audio')
              if (!images.length && audio) await sock.sendMessage(jid, { audio: { url: audio.url }, mimetype: 'audio/mpeg' }, { quoted: m })
          }
          await reactTo(sock, m, '✅')
          return true
      } catch (e) {
          console.error('[AUTODL]', e?.message || e)
          await reactTo(sock, m, '❌').catch(() => {})
          return true
      } finally {
          busy.delete(jid)
      }
  }

  handler.customPrefix = /https?:\/\/\S*(tiktok\.com|instagram\.com|youtu\.be|youtube\.com|facebook\.com|fb\.watch|twitter\.com|x\.com)\S*/i

export { pluginConfig as config, handler }
