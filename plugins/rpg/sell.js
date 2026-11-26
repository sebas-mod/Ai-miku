/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const sellPrice = ElysiaRuntime.sellPrice;
const invTake = ElysiaRuntime.invTake;
const invCount = ElysiaRuntime.invCount;

const pluginConfig = {
    name: "sell",
    alias: [],
    category: "rpg",
    description: "Jual item ke sistem",
    usage: ".sell",
    example: ".sell",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, A) {

      const { initRpgUser, sender, pushname, rpgDb, text, reply, fmt, saveRpg, prefix } = A
      initRpgUser(sender, pushname)
      if (!text) return reply(`Ketik nama item yang ingin dijual. Contoh: *${prefix}sell ramuan*\nJual banyak: *${prefix}sell daging 3* / *${prefix}sell daging all*`)

      const u = rpgDb[sender]
      const mt = text.trim().toLowerCase().match(/^(.*?)(?:\s+(\d{1,3}|all))?$/)
      const name = (mt[1] || '').trim()
      const have = invCount(u, name)
      if (!have) return reply(`Kamu tidak punya item *${name}* untuk dijual.`)

      const qty = mt[2] === 'all' ? have : Math.min(have, Math.max(1, parseInt(mt[2] || '1', 10)))
      const harga = sellPrice(name) * qty
      invTake(u, name, qty)
      u.coin += harga
      saveRpg()
      return reply(`💸 Kamu menjual *${name}*${qty > 1 ? ` x${qty}` : ''}\n+💰 ${fmt(harga)} koin`)
}

export { pluginConfig as config, handler }
