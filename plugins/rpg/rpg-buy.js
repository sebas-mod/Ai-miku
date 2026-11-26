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
    name: "buy-utama",
    alias: ["buyutama", "rpgbuy"],
    category: "rpg",
    description: "Fitur RPG buy-utama",
    usage: ".buy-utama",
    example: ".buy-utama",
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
    let user = global.db.data.users[m.sender]
    let e = global.rpg.emoticon

    let item = (args[0] || '').toLowerCase()
    let jumlah = Math.max(1, parseInt(args[1]) || 1)

    let shop = {
      potion: 5000,
      sword: 15000,
      pickaxe: 10000,
      fishingrod: 12000,
      armor: 20000,
      bait: 1000,
      fertilizer: 2500,
      limit: 25000,

      common: 10000,
      uncommon: 25000,
      mythic: 75000,
      legendary: 200000
    }

    if (!(item in shop))
      return conn.sendMessage(m.chat, {
        text: `
*${(global.namebot || 'BOT').toUpperCase()} RPG SHOP* ❀

${e('potion')} Potion : 5000
${e('sword')} Sword : 15000
${e('pickaxe')} Pickaxe : 10000
${e('fishingrod')} Fishing Rod : 12000
${e('armor')} Armor : 20000

🪱 Bait : 1000
🌱 Fertilizer : 2500
🎫 Limit : 25000

📦 Common : 10000
📦 Uncommon : 25000
🎁 Mythic : 75000
🗃️ Legendary : 200000

Gunakan:
.buy nama_item jumlah

Contoh:
.buy potion 2
.buy common 5
.buy mythic 1
`.trim()
      }, { quoted: m })

    const ev = global.economyHooks?.eventshop
    let diskon = ev?.diskonItem?.(item) || 0
    let total = (ev?.hargaDiskon ? ev.hargaDiskon(shop[item], item) : shop[item]) * jumlah

    if (user.money < total)
      return m.reply(`${e('money')} Money kamu tidak cukup!`)

    user.money -= total

    switch (item) {
      case 'limit':
        user.limit = (user.limit || 0) + jumlah
        break

      case 'common':
      case 'uncommon':
      case 'mythic':
      case 'legendary':
        user[item] = (user[item] || 0) + jumlah
        break

      default:
        user[item] = (user[item] || 0) + jumlah
    }

    await conn.sendMessage(m.chat, {
      text: `
❀ *PEMBELIAN BERHASIL* ❀

📦 Item : ${item}
🔢 Jumlah : ${jumlah}
💰 Total : ${total}${diskon ? `\n🏷️ Diskon event : ${diskon}%` : ''}

${e('money')} Sisa Money : ${user.money}
`.trim()
    }, { quoted: m })
  }

export { pluginConfig as config, handler }
