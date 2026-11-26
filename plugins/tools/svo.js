/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "svo",
    alias: [],
    category: "tools",
    description: "Fitur tools svo",
    usage: ".svo",
    example: ".svo",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, conn, usedPrefix, command }) {
    const client = conn || sock
    const quoted = m.quoted || m
    const mime = quoted.mimetype || m.mimetype || ''

    if (!mime || (!/image/i.test(mime) && !/video/i.test(mime) && !/audio/i.test(mime))) {
      return m.reply(`Kirim atau balas (reply) media dengan command:\n${usedPrefix}${command}`)
    }

    let buffer
    try {
      buffer = typeof quoted.download === 'function' ? await quoted.download() : await m.download()
    } catch (e) {
      return m.reply(`Gagal mengunduh media: ${e.message || e}`)
    }

    if (!buffer || !Buffer.isBuffer(buffer)) {
      return m.reply('Buffer media tidak valid.')
    }

    const caption = quoted.caption || quoted.text || m.text || ''

    try {
      if (/video/i.test(mime)) {
        return await client.sendMessage(
          m.chat,
          {
            video: buffer,
            caption: caption || undefined,
            mimetype: mime,
            viewOnce: true
          },
          { quoted: m.raw }
        )
      }

      if (/audio/i.test(mime)) {
        return await client.sendMessage(
          m.chat,
          {
            audio: buffer,
            mimetype: mime,
            viewOnce: true
          },
          { quoted: m.raw }
        )
      }

      return await client.sendMessage(
        m.chat,
        {
          image: buffer,
          caption: caption || undefined,
          mimetype: mime || 'image/jpeg',
          viewOnce: true
        },
        { quoted: m.raw }
      )
    } catch (e) {
      return m.reply(`Gagal mengirim media View Once: ${e.message || e}`)
    }
  }

  handler.botadmin = false

export { pluginConfig as config, handler }
