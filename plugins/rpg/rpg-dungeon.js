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
    name: "dungeon",
    alias: ["dng", "gua"],
    category: "rpg",
    description: "Fitur RPG dungeon",
    usage: ".dungeon",
    example: ".dungeon",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn }) {
  let user = global.db.data.users[m.sender]
  let e = global.rpg.emoticon

  if (user.health < 80)
  return conn.reply(m.chat,'Health minimal 80 untuk masuk dungeon\nGunakan *.heal*',m)

  let boss = pickRandom([
  'Dark Oni',
  'Shadow Dragon',
  'Blood Demon',
  'Ancient Golem',
  'Night Reaper'
  ])

  let damage = Math.floor(Math.random()*40)+20
  let exp = Math.floor(Math.random()*5000)+2000
  let money = Math.floor(Math.random()*80000)+20000
  let diamond = Math.floor(Math.random()*3)
  let mythic = Math.floor(Math.random()*2)
  let legendary = Math.floor(Math.random()*1)

  user.health -= damage
  user.exp += exp
  user.money += money
  user.diamond += diamond
  user.mythic += mythic
  user.legendary += legendary
  let text = `
*${(global.namebot || 'BOT').toUpperCase()} RPG DUNGEON* ❀

👹 Boss : *${boss}*

Kamu berhasil mengalahkan boss!

❤️ Health -${damage}

🎁 Reward

${e('exp')} Exp : +${exp}
${e('money')} Money : +${money}
${diamond ? `${e('diamond')} Diamond : +${diamond}` : ''}
${mythic ? `🎁 Mythic : +${mythic}` : ''}
${legendary ? `🗃️ Legendary : +${legendary}` : ''}

Hati-hati dungeon berikutnya lebih kuat...
`.trim()

  conn.sendMessage(m.chat,{
  text
  },{quoted: m})
  }

  function pickRandom(list){
  return list[Math.floor(Math.random()*list.length)]
  }

export { pluginConfig as config, handler }
