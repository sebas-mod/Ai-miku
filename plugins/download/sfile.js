/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const sfileSearch = MikuRuntime.sfileSearch;
const sfileDownload = MikuRuntime.sfileDownload;

const pluginConfig = {
    name: "sfile",
    alias: ["sfiledl"],
    category: "download",
    description: "sfile",
    usage: ".sfile",
    example: ".sfile",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, text, command }) {
    if (!text) throw '¡Envía una búsqueda o un enlace!'

    if (command === 'sfile') {
      const results = await sfileSearch(text)

      if (!results.length) throw 'Archivo no encontrado'

      let msg = '🔎 Resultados de búsqueda:\n\n'

      results.slice(0, 10).forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n`
        msg += `📦 ${v.size}\n`
        msg += `🔗 ${v.link}\n\n`
      })

      m.reply(msg)
    }

    if (command === 'sfiledl') {
      if (!text.includes('sfile.co')) throw 'Enlace no válido'

      const { metadata, download } = await sfileDownload(text, true)

      const caption = `📄 Nombre: ${metadata.filename}
📦 Tipo: ${metadata.mimetype}
⬇️ Download: ${metadata.download_count}
👤 Author: ${metadata.author_name}`

      await conn.sendFile(m.chat, download, metadata.filename, caption, m)
    }
  }

export { pluginConfig as config, handler }
