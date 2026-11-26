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
    name: "ngocok",
    alias: [],
    category: "rpg",
    description: "Fitur RPG ngocok",
    usage: ".ngocok",
    example: ".ngocok",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  let toM = a => '@' + a.split('@')[0]

  async function handler(m,{conn,participants,groupMetadata}) {
  let user = global.db.data.users[m.sender]
  let now = Date.now()

  let cooldown = 10800000
  let timers = cooldown - (now - user.lastngocok)

  if(user.stamina < 20)
  return m.reply('Stamina tidak cukup\nGunakan *.makan*')

  if(now - user.lastngocok < cooldown)
  return m.reply(`Kamu masih kelelahan\nTunggu ${clockString(timers)} lagi`)

  let pengocok = await conn.getName(m.sender)

  let ps = groupMetadata.participants.map(v => v.id)
  let target = ps[Math.floor(Math.random()*ps.length)]

  let diamond = Math.floor(Math.random()*5)
  let iron = Math.floor(Math.random()*10)
  let gold = Math.floor(Math.random()*7)
  let emerald = Math.floor(Math.random()*4)
  let rock = Math.floor(Math.random()*200)
  let coal = Math.floor(Math.random()*20)
  let exp = Math.floor(Math.random()*100)

  let jln = `
⬛⬛⬛⬛⬛⬛⬛⬛🚶⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️🏘️🏘️🏘️🌳🌳🏘️🌳🌳🌳

✔️ ${pengocok} mencari target...
`

  let jln2 = `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛🚶
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️🏘️🏘️🏘️🌳🌳🏘️🌳🌳🌳

➕ ${pengocok} menemukan target...
`

  let jln3 = `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬛⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️🏘️🏘️🏘️🌳🌳🏘️🌳🌳🚶

➕ ${pengocok} mulai bekerja...
`

  let jln4 = `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬛⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️🏘️🏘️🏘️🌳🌳🏘️🚶

➕ ${pengocok} menerima hasil...
`

  let hasil = `
*${(global.namebot || 'BOT').toUpperCase()} NGOCOK* ❀

💎 Diamond : ${diamond}
⛓ Iron : ${iron}
🪙 Gold : ${gold}
💚 Emerald : ${emerald}
🪨 Rock : ${rock}
🕳 Coal : ${coal}
Exp : ${exp}

Stamina -20

Target : ${toM(target)}
`

  setTimeout(()=>conn.reply(m.chat,hasil,m,{mentions:[target]}),27000)
  setTimeout(()=>conn.reply(m.chat,jln4,m),23000)
  setTimeout(()=>conn.reply(m.chat,jln3,m),18000)
  setTimeout(()=>conn.reply(m.chat,jln2,m),13000)
  setTimeout(()=>conn.reply(m.chat,jln,m),8000)
  setTimeout(()=>conn.reply(m.chat,`🔍 ${pengocok} mencari area...`,m),0)

  user.diamond += diamond
  user.iron += iron
  user.gold += gold
  user.emerald += emerald
  user.rock += rock
  user.coal += coal
  user.exp += exp
  user.stamina -= 20

  user.lastngocok = now
  }

export { pluginConfig as config, handler }
