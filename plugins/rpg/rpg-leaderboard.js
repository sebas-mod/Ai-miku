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
    name: "leaderboard",
    alias: ["lb"],
    category: "rpg",
    description: "Fitur RPG leaderboard",
    usage: ".leaderboard",
    example: ".leaderboard",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, args }) {
      let users = Object.entries(global.db.data.users).map(([jid, data]) => ({
          jid,
          ...data
      }))

      let fields = Object.keys(global.db.data.users[m.sender] || {})

      let type = args[0]?.toLowerCase()

      if (!type) {
      let menu = fields
      .filter(v => typeof global.db.data.users[m.sender][v] === 'number')
      .slice(0,20)
      .map(v => `• .leaderboard ${v}`)
      .join('\n')

      let text = `
*${(global.namebot || 'BOT').toUpperCase()} RPG LEADERBOARD* ❀

Pilih kategori leaderboard:

${menu}

Contoh:
.leaderboard money
.leaderboard exp
.leaderboard level
`.trim()

      return conn.sendMessage(m.chat,{
          text
      },{quoted: m})
      }

      if (!fields.includes(type)) {
          return conn.reply(m.chat,'Kategori tidak ditemukan.',m)
      }

      let sorted = users
      .map(u => ({ jid:u.jid, value:u[type] || 0 }))
      .filter(u => u.value > 0)
      .sort((a,b)=> b.value - a.value)

      let len = 10

      let text = `
*${(global.namebot || 'BOT').toUpperCase()} RPG LEADERBOARD* ❀

📊 Kategori : *${type.toUpperCase()}*

${sorted.slice(0,len).map((u,i)=>
`${i+1}. @${u.jid.split('@')[0]} • ${u.value}`
).join('\n') || 'Belum ada data'}
`.trim()

      conn.sendMessage(m.chat,{
          text,
          mentions: sorted.slice(0,len).map(u=>u.jid)
      },{quoted: m})
  }

export { pluginConfig as config, handler }
