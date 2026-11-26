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
    name: "claim",
    alias: [],
    category: "rpg",
    description: "claim",
    usage: ".claim",
    example: ".claim",
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

  let cooldown = 86400000
  let now = new Date * 1

  if (user.lastclaim && now - user.lastclaim < cooldown) {
  let sisa = cooldown - (now - user.lastclaim)
  let h = Math.floor(sisa / 3600000)
  let mnt = Math.floor(sisa / 60000) % 60
  let d = Math.floor(sisa / 1000) % 60

  return conn.reply(m.chat,`
${(global.namebot || 'BOT').toUpperCase()} CLAIM ❀

Hadiah harian sudah diambil.

Cooldown:
${h}j ${mnt}m ${d}s
`.trim(), m)
  }

  let money = Math.floor(Math.random()*50000)+20000
  let exp = Math.floor(Math.random()*5000)+1000
  let limit = Math.floor(Math.random()*5)+1

  user.money += money
  user.exp += exp
  user.limit += limit
  user.lastclaim = now

  let text = `
${(global.namebot || 'BOT').toUpperCase()} DAILY CLAIM ❀

Hadiah Harian:

💹 Money : +${money}
Exp : +${exp}
🎫 Limit : +${limit}

Datang lagi besok untuk hadiah berikutnya.
`.trim()

  conn.sendMessage(m.chat,{
  text
  },{quoted:m})
  }

export { pluginConfig as config, handler }
