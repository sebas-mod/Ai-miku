/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { need, pickTarget, assertCanPost, explain } from './setch.js'

const pickImage = MikuRuntime.pickImage;

const pluginConfig = {
    name: "chpp",
    alias: [],
    category: "channel",
    description: "chpp (responde a una foto)",
    usage: ".chpp (responde a una foto)",
    example: ".chpp (responde a una foto)",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, prefix, reply }) {
      const p = prefix || '.'
      try {
          const t = await pickTarget(sock, String(text || ''), p)
          assertCanPost(t)
          need(sock, 'newsletterUpdatePicture')
          const img = pickImage(m)
          if (!img) return reply(`Enviar o responder a una imagen con ${p}chpp.`)
          const buffer = await img.download()
          if (!Buffer.isBuffer(buffer)) return reply('No se pudo descargar la imagen. Intente reenviar.')
          await sock.newsletterUpdatePicture(t.id, buffer)
          return reply(`✅ Foto del canal *${t.name}* diperbarui.`)
      } catch (err) {
          console.log('[CH] chpp:', err.message)
          return reply(`❌ ${explain(err)}`)
      }
  }

export { pluginConfig as config, handler }
