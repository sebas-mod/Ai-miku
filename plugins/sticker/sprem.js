/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const sendPremiumSticker = MikuRuntime.sendPremiumSticker;

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
      if (q?.mtype !== 'stickerMessage') return reply('Responda primero sticker WEBP como de costumbre.')
      if (q.mimetype !== 'image/webp') return reply('Este no es un sticker WEBP ordinario. Para lotetie/aplicación/was el método es diferente.')

      try {
          const buffer = await q.download()
          await sendPremiumSticker(sock, jid, buffer, { isAnimated: q.isAnimated, quoted: m })
      } catch (e) {
          console.error('[SPREM]', e)
          reply('No se pudo inyectar el atributo sticker. Verifique la consola.')
      }
  }

export { pluginConfig as config, handler }
