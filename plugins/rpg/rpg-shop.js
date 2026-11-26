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
    name: "shop-utama",
    alias: ["rpgshop", "tokorpg"],
    category: "rpg",
    description: "Fitur RPG shop-utama",
    usage: ".shop-utama",
    example: ".shop-utama",
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
    let e = global.rpg.emoticon
    let text = `
*${(global.namebot || 'BOT').toUpperCase()} RPG SHOP* ❀

━━━━━━━━━━━━━━
🛒 *ITEM SHOP*

${e('potion')} Potion : 5000
${e('sword')} Sword : 15000
${e('pickaxe')} Pickaxe : 10000
${e('fishingrod')} Fishing Rod : 12000
${e('armor')} Armor : 20000

🪱 Bait : 1000
🌱 Fertilizer : 2500

━━━━━━━━━━━━━━
🎁 *CRATE SHOP*

📦 Common Crate : 10000
📦 Uncommon Crate : 25000
🎁 Mythic Crate : 75000
🗃️ Legendary Crate : 200000

━━━━━━━━━━━━━━
📌 *Cara Membeli*

.buy nama_item jumlah

Contoh:
.buy potion
.buy potion 5
.buy sword
.buy common 3
.buy mythic 2

━━━━━━━━━━━━━━
💡 *Daftar Nama Item*

• potion
• sword
• pickaxe
• fishingrod
• armor
• bait
• fertilizer
• common
• uncommon
• mythic
• legendary

━━━━━━━━━━━━━━
✦ ${global.namebot || 'Bot'} RPG System
`.trim()

    let promo = global.economyHooks?.eventshop?.activeEvents?.() || []
    if (promo.length) text += '\n\n🎉 *EVENT AKTIF*\n' + promo.map(ev => `• ${ev.nama}${ev.diskon ? ` — diskon ${ev.diskon}%` : ''}${ev.barang ? ' (+ barang spesial)' : ''}`).join('\n') + '\nLihat: .eventshop'

    await conn.sendMessage(m.chat, {
      text
    }, { quoted: m })
  }

export { pluginConfig as config, handler }
