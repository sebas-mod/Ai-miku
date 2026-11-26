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
    name: "hitman",
    alias: [],
    category: "rpg",
    description: "hitman",
    usage: ".hitman",
    example: ".hitman",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn }) {
      let user = global.db.data.users[m.sender]

      if (!user.lastmisi) user.lastmisi = 0
      if (!user.bunuh) user.bunuh = 0
      if (!user.warn) user.warn = 0
      if (!user.exp) user.exp = 0
      if (!user.money) user.money = 0

      const cooldown = 3600000
      const now = Date.now()
      const sisa = cooldown - (now - user.lastmisi)

      conn.misi = conn.misi || {}

      if (m.sender in conn.misi)
          return m.reply('Masih ada misi yang belum selesai.')

      if (sisa > 0)
          return m.reply(`Tunggu ${clockString(sisa)} lagi.`)

      conn.misi[m.sender] = true
      m.reply('🔍 Mencari target...')

      setTimeout(() => {
          let uang = Math.floor(Math.random() * 10) * 100000
          let exp = Math.floor(Math.random() * 10) * 1000

          user.money += uang
          user.exp += exp
          user.bunuh += 1
          user.warn += 1
          user.lastmisi = Date.now()

          delete conn.misi[m.sender]

          m.reply(`Berhasil!\nUang: Rp${toRupiah(uang)}\nExp: ${toRupiah(exp)}`)
      }, 27000)
  }

  function clockString(ms) {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
  }

  const toRupiah = n => parseInt(n).toLocaleString().replace(/,/g, ".")

export { pluginConfig as config, handler }
