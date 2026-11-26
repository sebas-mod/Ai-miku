/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const sendAlbum = MikuRuntime.sendAlbum;
const igDownloadAuto = MikuRuntime.igDownloadAuto;

const pluginConfig = {
    name: "igdl",
    alias: [],
    category: "download",
    description: "igdl",
    usage: ".igdl",
    example: ".igdl",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, args, text, command, usedPrefix }) {
    const input = (text || args?.[0] || '').trim()
    if (!input) return m.reply(`*Example:* ${usedPrefix || '.'}${command} https://www.instagram.com/p/xxxx/\n_Para las historias basta con enviar el nombre de usuario, ejemplo:_ ${usedPrefix || '.'}${command} jkt48.fiony`)

    try {
      await m.react('🕒')
      const res = await igDownloadAuto(input, 'fastdl')

      let caption = `📸 *Instagram Downloader*`
      if (res.author && res.author !== 'unknown') caption += `\n\n👤 *Author*: @${res.author}`
      if (res.caption) caption += `\n📝 *Caption*:\n${res.caption}`
      caption = caption.trim()

      if (res.media.length > 1) {
        await sendAlbum(conn, m.chat, res.media.map((it, i) => ({
          type: it.type === 'Video' ? 'video' : 'image',
          url: it.url,
          caption: i === 0 ? caption : ''
        })), { quoted: m })
        return await m.react('✅')
      }

      for (const item of res.media) {
        if (item.type === 'Video') {
          await conn.sendMessage(m.chat, { video: { url: item.url }, caption }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, { image: { url: item.url }, caption }, { quoted: m })
        }
        caption = ''
      }
      await m.react('✅')
    } catch (e) {
      console.log(e)
      await m.react('❌')
      m.reply(`❌ Error: ${e?.message || e}`)
    }
  }

export { pluginConfig as config, handler }
