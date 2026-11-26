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
    name: "jual",
    alias: [],
    category: "rpg",
    description: "jual <item> <jumlah>",
    usage: ".jual <item> <jumlah>",
    example: ".jual <item> <jumlah>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { args }) {
    let user = global.db.data.users[m.sender]
    if (!args[0] || !args[1]) {
      return m.reply(`Contoh:
.jual trash 10
.jual wood 5`)
    }

    const item = args[0].toLowerCase()
    const jumlah = parseInt(args[1])

    if (isNaN(jumlah) || jumlah <= 0) return m.reply('Jumlah tidak valid.')

    const harga = {
      trash: 50,
      wood: 200,
      rock: 150,
      iron: 500,
      string: 300,
      petfood: 250
    }

    if (!(item in harga)) {
      return m.reply(`Item tidak bisa dijual.

Yang bisa dijual:
trash, wood, rock, iron, string, petfood`)
    }

    if (user[item] < jumlah) {
      return m.reply(`Item kamu tidak cukup.`)
    }

    let total = harga[item] * jumlah
    user[item] -= jumlah
    user.money += total

    m.reply(`Berhasil menjual ${jumlah} ${item}
Mendapat uang: Rp${total.toLocaleString()}`)
  }

export { pluginConfig as config, handler }
