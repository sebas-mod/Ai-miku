/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const clockString = ElysiaRuntime.clockString;

const pluginConfig = {
    name: "hunt-utama",
    alias: ["huntutama", "rpghunt"],
    category: "rpg",
    description: "Fitur RPG hunt-utama",
    usage: ".hunt-utama",
    example: ".hunt-utama",
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

  if(!user.guild)
  return conn.reply(m.chat,'Kamu belum join guild\nGunakan *.guild*',m)

  let monsters = [
  { name:'Goblin', rank:'F', exp:200, money:1000 },
  { name:'Orc', rank:'E', exp:400, money:2000 },
  { name:'Skeleton Knight', rank:'D', exp:800, money:4000 },
  { name:'Dark Mage', rank:'C', exp:1200, money:6000 },
  { name:'Wyvern', rank:'B', exp:2500, money:12000 },
  { name:'Ancient Dragon', rank:'S', exp:8000, money:40000 }
  ]

  let cooldown = 300000
  let now = Date.now()

  if(now-user.lasthunt < cooldown){
  let sisa = cooldown-(now-user.lasthunt)
  return conn.reply(m.chat,`Tunggu ${clockString(sisa)} untuk berburu lagi`,m)
  }

  let monster = monsters[Math.floor(Math.random()*monsters.length)]

  let damage = Math.floor(Math.random()*30)+10

  user.health -= damage

  if(user.health <= 0){
  user.health = 100

  return conn.reply(m.chat,`
*${(global.namebot || 'BOT').toUpperCase()} RPG* ❀

Kamu bertemu *${monster.name}* 🐉

Namun kamu kalah...

❤️ Health kembali 100
`,m)
  }

  user.exp += monster.exp
  user.money += monster.money

  user.lasthunt = now

  conn.reply(m.chat,`
⚔️ *BATTLE RESULT*

Monster : ${monster.name}
Rank : ${monster.rank}

💰 Money +${monster.money}
Exp +${monster.exp}

❤️ Health tersisa ${user.health}
`,m)
  }

export { pluginConfig as config, handler }
