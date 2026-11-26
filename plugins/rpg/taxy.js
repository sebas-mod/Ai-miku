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
    name: "taxy",
    alias: [],
    category: "rpg",
    description: "taxy",
    usage: ".taxy",
    example: ".taxy",
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
      let __timers = (new Date - user.lastmisi)
      let _timers = (3600000 - __timers)
      let order = isNaN(user.taxy) ? user.taxy = 0 : user.taxy
      let timers = clockString(_timers)
      let name = conn.getName(m.sender)
      let id = m.sender
      let kerja = 'taxy'
      conn.misi = conn.misi ? conn.misi: {}
      if (id in conn.misi) return conn.reply(m.chat, `Selesaikan misi ${conn.misi[id][0]} terlebih dahulu`, m)
      if (new Date - user.lastmisi > 3600000) {
          let randomaku1 = Math.floor(Math.random() * 1000000)
          let randomaku2 = Math.floor(Math.random() * 10000)

          var hsl = `
*—[ Hasil Taxy ${name} ]—*
➕ 💹 Uang = [ ${toRupiah(randomaku1)} ]
➕ Exp = [ ${toRupiah(randomaku2)} ]
➕ 😍 Order Selesai = +1
➕ 📥Total Order Sebelumnya : ${toRupiah(order)}
`.trim()

          user.money += randomaku1
          user.exp += randomaku2
          user.taxy += 1

          setTimeout(() => {
              m.reply('🔍 Mencari pelanggan.....')
          }, 0)

          conn.misi[id] = [
              kerja,
              setTimeout(() => {
                  delete conn.misi[id]
              }, 27000)
          ]

          setTimeout(() => {
              m.reply(hsl)
          }, 27000)

          user.lastmisi = new Date * 1
      } else m.reply(`Silahkan menunggu selama ${timers}, untuk bisa ${kerja} kembali`)
  }
  handler.energy = 5

  function clockString(ms) {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
  }

  const toRupiah = number => parseInt(number).toLocaleString().replace(/,/gi, ".")

export { pluginConfig as config, handler }
