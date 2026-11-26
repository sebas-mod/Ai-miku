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
    name: "guild-utama",
    alias: ["guildutama", "rpgguild"],
    category: "rpg",
    description: "Fitur RPG guild-utama",
    usage: ".guild-utama",
    example: ".guild-utama",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m,{conn}) {
  let user = global.db.data.users[m.sender]

  if(user.guild)
  return conn.reply(m.chat,'Kamu sudah menjadi Adventurer Guild',m)

  user.guild = true
  user.rank = 'F'

  conn.reply(m.chat,`
*${(global.namebot || 'BOT').toUpperCase()} ADVENTURER GUILD* ❀

Selamat datang Adventurer!

Rank kamu sekarang : *F*

Gunakan:
.hunt → berburu monster
.rank → cek rank
`,m)
  }

export { pluginConfig as config, handler }
