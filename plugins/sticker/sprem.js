/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const sendPremiumSticker = ElysiaRuntime.sendPremiumSticker;

const pluginConfig = {
    name: "sprem",
    alias: [],
    category: "sticker",
    description: "sprem",
    usage: ".sprem",
    example: ".sprem",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, jid, reply }) {
      const q = m.quoted
      if (q?.mtype !== 'stickerMessage') return reply('Reply sticker WEBP biasa dulu.')
      if (q.mimetype !== 'image/webp') return reply('Ini bukan sticker WEBP biasa. Untuk lottie/application/was beda cara.')

      try {
          const buffer = await q.download()
          await sendPremiumSticker(sock, jid, buffer, { isAnimated: q.isAnimated, quoted: m })
      } catch (e) {
          console.error('[SPREM]', e)
          reply('Gagal inject atribut sticker. Cek console.')
      }
  }

export { pluginConfig as config, handler }
