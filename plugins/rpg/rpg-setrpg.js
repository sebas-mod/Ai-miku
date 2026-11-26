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
    name: "setrpg",
    alias: [],
    category: "rpg",
    description: "Fitur RPG setrpg",
    usage: ".setrpg",
    example: ".setrpg",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m,{conn,args}) {
  let user = global.db.data.users[m.sender]

  let type = (args[0]||'').toLowerCase()

  if(type !== 'Arthazy')
  return conn.reply(m.chat,'Gunakan:\n.setrpg Arthazy',m)

  if(user.Arthazy)
  return conn.reply(m.chat,`Kamu sudah menjadi Adventurer ${global.namebot || 'Bot'}`,m)

  user.Arthazy = true

  conn.reply(m.chat,`
*${(global.namebot || 'BOT').toUpperCase()} RPG* ❀

Selamat datang Adventurer!

Sekarang kamu bisa berburu monster dengan:
.huntanya
`,m)
  }

export { pluginConfig as config, handler }
