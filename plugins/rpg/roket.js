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
    name: "roket",
    alias: [],
    category: "rpg",
    description: "roket",
    usage: ".roket",
    example: ".roket",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, usedPrefix }) {
      let __timers = (new Date - global.db.data.users[m.sender].lastmisi)
      let _timers = (3600000 - __timers)
      let user = global.db.data.users[m.sender]
      let order = global.db.data.users[m.sender].rokets
      let timers = clockString(_timers)
      let name = user.registered ? user.name: conn.getName(m.sender)
      let id = m.sender
      let kerja = 'Roket'
      conn.misi = conn.misi ? conn.misi: {}
      if (id in conn.misi) {
          conn.reply(m.chat, `Selesaikan Misi ${conn.misi[id][0]} Terlebih Dahulu`, m)
          throw false
      }
      if (user.health < 80) return m.reply(`Anda Harus Memiliki Minimal 80Health`)
      if (new Date - global.db.data.users[m.sender].lastmisi > 3600000) {
          let ngerok4 = Math.floor(Math.random() * 10)
          let ngerok5 = Math.floor(Math.random() * 10)

          let ngrk4 = (ngerok4 * 100000)
          let ngrk5 = (ngerok5 * 1000)

          let rokit = `🌕

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▄▄▄▒▒▒█▒▒▒▒▄▒▒▒▒▒▒▒▒
▒█▀█▀█▒█▀█▒▒█▀█▒▄███▄▒
░█▀█▀█░█▀██░█▀█░█▄█▄█░
░█▀█▀█░█▀████▀█░█▄█▄█░
████████▀█████████████
🚀

👨‍🚀 Memulai penerbangan....
`.trim()

          let rokit2 = `🌕

🚀
▒▒▄▄▄▒▒▒█▒▒▒▒▄▒▒▒▒▒▒▒▒
▒█▀█▀█▒█▀█▒▒█▀█▒▄███▄▒
░█▀█▀█░█▀██░█▀█░█▄█▄█░
░█▀█▀█░█▀████▀█░█▄█▄█░
████████▀█████████████

➕ Dalam penerbangan....
`.trim()

          let rokit3 = `🌕🚀

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▄▄▄▒▒▒█▒▒▒▒▄▒▒▒▒▒▒▒▒
▒█▀█▀█▒█▀█▒▒█▀█▒▄███▄▒
░█▀█▀█░█▀██░█▀█░█▄█▄█░
░█▀█▀█░█▀████▀█░█▄█▄█░
████████▀█████████████

➕ Sampai di tujuan....
`.trim()

          let rokit4 = `🌕🚀

➕ Sukses Mendarat.... 👨‍🚀
`.trim()

          let hsl = `
*—[ Hasil Ngroket ${name} ]—*
➕ 💹 Uang = [ ${ngrk4} ]
➕ Exp = [ ${ngrk5} ]
➕ 😍 Mendarat Selesai = +1
➕  📥Total Mendarat Sebelumnya : ${order}
`.trim()

          user.money += ngrk4
          user.exp += ngrk5
          user.rokets += 1
          user.health -= 80

          conn.misi[id] = [
              kerja,
              setTimeout(() => {
                  delete conn.misi[id]
              }, 27000)
          ]

          setTimeout(() => {
              conn.reply(m.chat, hsl, m)
          }, 27000)

          setTimeout(() => {
              conn.reply(m.chat, rokit4, m)
          }, 25000)

          setTimeout(() => {
              conn.reply(m.chat, rokit3, m)
          }, 20000)

          setTimeout(() => {
              conn.reply(m.chat, rokit2, m)
          }, 15000)

          setTimeout(() => {
              conn.reply(m.chat, rokit, m)
          }, 10000)

          setTimeout(() => {
              conn.reply(m.chat, `🔍 ${name} Mencari Lokasi.....`, m)
          }, 0)
          user.lastmisi = new Date * 1
      } else m.reply(`Silahkan Menunggu Selama ${timers}, Untuk Menyelesaikan Misi Kembali`)
  }
  handler.level = 10

  function clockString(ms) {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
  }

export { pluginConfig as config, handler }
