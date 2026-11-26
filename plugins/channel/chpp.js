/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { need, pickTarget, assertCanPost, explain } from './setch.js'

const pickImage = ElysiaRuntime.pickImage;

const pluginConfig = {
    name: "chpp",
    alias: [],
    category: "channel",
    description: "chpp (reply foto)",
    usage: ".chpp (reply foto)",
    example: ".chpp (reply foto)",
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
          if (!img) return reply(`Kirim atau reply sebuah gambar dengan ${p}chpp.`)
          const buffer = await img.download()
          if (!Buffer.isBuffer(buffer)) return reply('Gagal mengunduh gambar. Coba kirim ulang.')
          await sock.newsletterUpdatePicture(t.id, buffer)
          return reply(`✅ Foto saluran *${t.name}* diperbarui.`)
      } catch (err) {
          console.log('[CH] chpp:', err.message)
          return reply(`❌ ${explain(err)}`)
      }
  }

export { pluginConfig as config, handler }
