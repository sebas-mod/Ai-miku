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
    name: "inventory",
    alias: ["inven", "tas"],
    category: "rpg",
    description: "Fitur RPG inventory",
    usage: ".inventory",
    example: ".inventory",
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
      let totalitem =
      user.potion +
      user.diamond +
      user.emerald +
      user.trash +
      user.common +
      user.uncommon +
      user.mythic +
      user.legendary

      let text = `
*${(global.namebot || 'BOT').toUpperCase()} RPG INVENTORY* ❀

━━━━━━━━━━━━━━
${e('health')} *Health* : ${user.health}
${e('stamina')} *Stamina* : ${user.stamina}
${e('exp')} *Exp* : ${user.exp}

${e('money')} *Money* : ${user.money}
${e('bank')} *Bank* : ${user.bank}

━━━━━━━━━━━━━━
📦 *ITEM STORAGE*

${e('potion')} Potion : ${user.potion}
${e('diamond')} Diamond : ${user.diamond}
${e('emerald')} Emerald : ${user.emerald}
${e('trash')} Trash : ${user.trash}

${e('common')} Common Crate : ${user.common}
${e('uncommon')} Uncommon Crate : ${user.uncommon}
${e('mythic')} Mythic Crate : ${user.mythic}
${e('legendary')} Legendary Crate : ${user.legendary}

━━━━━━━━━━━━━━
⚒️ *TOOLS*

${e('sword')} Sword : ${user.sword}
${e('pickaxe')} Pickaxe : ${user.pickaxe}
${e('fishingrod')} Fishing Rod : ${user.fishingrod}
${e('armor')} Armor : ${user.armor}

━━━━━━━━━━━━━━
🐾 *KANDANG*

🐃 Banteng : ${user.banteng}
🐅 Harimau : ${user.harimau}
🐘 Gajah : ${user.gajah}
🐐 Kambing : ${user.kambing}
🐼 Panda : ${user.panda}
🐊 Buaya : ${user.buaya}
🐃 Kerbau : ${user.kerbau}
🐄 Sapi : ${user.sapi}
🐒 Monyet : ${user.monyet}
🐗 Babi Hutan : ${user.babihutan}
🐖 Babi : ${user.babi}
🐓 Ayam : ${user.ayam}

━━━━━━━━━━━━━━
🐟 *IKAN*

🐟 Ikan : ${user.ikan}
🐟 Lele : ${user.lele}
🐟 Nila : ${user.nila}
🐟 Bawal : ${user.bawal}
🦐 Udang : ${user.udang}
🐋 Paus : ${user.paus}
🦀 Kepiting : ${user.kepiting}

━━━━━━━━━━━━━━
🍖 *MAKANAN*

🍗 Ayam Bakar : ${user.ayambakar}
🍗 Ayam Goreng : ${user.ayamgoreng}
🍲 Opor Ayam : ${user.oporayam}
🍲 Gulai Ayam : ${user.gulaiayam}
🥩 Rendang : ${user.rendang}
🥩 Steak : ${user.steak}
🍖 Babi Panggang : ${user.babipanggang}

━━━━━━━━━━━━━━
📊 *Total Item* : ${totalitem}

✦ ${global.namebot || 'Bot'} RPG System
`.trim()

      await conn.sendMessage(m.chat, {
          text: text
      }, { quoted: m })
  }

export { pluginConfig as config, handler }
