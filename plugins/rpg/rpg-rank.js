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
    name: "rank-utama",
    alias: ["rankutama", "rpgrank"],
    category: "rpg",
    description: "Fitur RPG rank-utama",
    usage: ".rank-utama",
    example: ".rank-utama",
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

  let rank = 'F'

  if(user.exp > 5000) rank='E'
  if(user.exp > 10000) rank='D'
  if(user.exp > 20000) rank='C'
  if(user.exp > 40000) rank='B'
  if(user.exp > 70000) rank='A'
  if(user.exp > 120000) rank='S'

  conn.reply(m.chat,`
❀ *ADVENTURER STATUS* ❀

👤 @${m.sender.split('@')[0]}

🏅 Rank : ${rank}
Exp : ${user.exp}
💰 Money : ${user.money}
❤️ Health : ${user.health}
`,m,{mentions:[m.sender]})
  }

export { pluginConfig as config, handler }
