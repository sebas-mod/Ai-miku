/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "gitclone",
    alias: [],
    category: "download",
    description: "gitclone",
    usage: ".gitclone",
    example: ".gitclone",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
  async function handler(m, { conn, args, usedPrefix, command }) {
      if (!args[0]) throw `Example user ${usedPrefix}${command} https://github.com/ImYanXiao/Elaina-MultiDevice`
      if (!regex.test(args[0])) throw '¡URL no válida! '
      let [_, user, repo] = args[0].match(regex) || []
      repo = repo.split(/[\/?#]/)[0].replace(/\.git$/, '')
      let url = `https://api.github.com/repos/${user}/${repo}/zipball`
      let head = await fetch(url, { method: 'HEAD' })
      let disposition = head.headers.get('content-disposition')
      if (!head.ok || !disposition) throw '¡Repositorio no encontrado o privado!'
      let filename = disposition.match(/attachment; filename=(.*)/)?.[1] || `${repo}.zip`
      await m.reply(`D o w n l o a d i n g. . .`)
      await conn.sendFile(m.chat, url, filename, null, m)
  }

export { pluginConfig as config, handler }
