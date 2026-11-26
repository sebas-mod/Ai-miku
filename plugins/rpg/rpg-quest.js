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
    name: "quest-utama",
    alias: ["questutama", "rpgquest"],
    category: "rpg",
    description: "Fitur RPG quest-utama",
    usage: ".quest-utama",
    example: ".quest-utama",
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
  if (!user.lastquest) user.lastquest = 0

  let cooldown = 86400000
  let now = Date.now()

  if (now - user.lastquest < cooldown) {
  let sisa = cooldown - (now - user.lastquest)
  let h = Math.floor(sisa / 3600000)
  let mnt = Math.floor(sisa % 3600000 / 60000)

  return conn.reply(m.chat,`Quest sudah diambil\nCoba lagi ${h} jam ${mnt} menit`,m)
  }

  let exp = Math.floor(Math.random()*5000)+2000
  let money = Math.floor(Math.random()*80000)+20000
  let diamond = Math.floor(Math.random()*2)

  user.exp += exp
  user.money += money
  user.diamond += diamond

  user.lastquest = now

  let text = `
*${(global.namebot || 'BOT').toUpperCase()} RPG QUEST* ❀

🎯 Quest berhasil diselesaikan

🎁 Reward

${e('exp')} Exp : +${exp}
${e('money')} Money : +${money}
${diamond ? `${e('diamond')} Diamond : +${diamond}` : ''}

Quest berikutnya tersedia besok
`.trim()

  conn.sendMessage(m.chat,{
  text
  },{quoted: m})
  }

export { pluginConfig as config, handler }
