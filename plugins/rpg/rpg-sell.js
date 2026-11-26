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
    name: "sell-utama",
    alias: ["sellutama", "rpgsell"],
    category: "rpg",
    description: "Fitur RPG sell-utama",
    usage: ".sell-utama",
    example: ".sell-utama",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { args }) {
      let user = global.db.data.users[m.sender]
      let e = global.rpg.emoticon

      let item = (args[0] || '').toLowerCase()
      let jumlah = parseInt(args[1]) || 1

      let harga = {
          trash: 50,

          ikan: 1500,
          lele: 2000,
          nila: 2000,
          bawal: 2500,
          udang: 3000,
          kepiting: 3500,
          paus: 10000,

          ayam: 5000,
          kambing: 8000,
          sapi: 12000,
          babi: 10000,
          banteng: 15000,

          diamond: 9000,
          emerald: 7000
      }

      if (!item) {
          throw `
*${(global.namebot || 'BOT').toUpperCase()} RPG SELL* ❀

📦 Item yang bisa dijual

🗑 Trash
🐟 Ikan / Lele / Nila / Bawal
🦐 Udang
🦀 Kepiting
🐋 Paus

🐓 Ayam
🐐 Kambing
🐄 Sapi
🐖 Babi
🐃 Banteng

💎 Diamond
❇️ Emerald

Contoh:
.sell ikan 5
.sell ayam 2
.sell diamond
`
      }

      if (!(item in harga)) throw `Item tidak bisa dijual`

      if (user[item] < jumlah) throw `Item tidak cukup`

      let total = harga[item] * jumlah

      user[item] -= jumlah
      user.money += total

      m.reply(`
❀ *BERHASIL MENJUAL* ❀

Item : ${item}
Jumlah : ${jumlah}

${e('money')} +${total}
`.trim())
  }

export { pluginConfig as config, handler }
