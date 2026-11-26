/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const invSummary = ElysiaRuntime.invSummary;

const pluginConfig = {
    name: "inv",
    alias: [],
    category: "rpg",
    description: "Lihat inventory",
    usage: ".inv",
    example: ".inv",
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

      const { initRpgUser, sender, pushname, rpgDb, reply, fmt, prefix } = A
      initRpgUser(sender, pushname)
      const u = rpgDb[sender]
      const items = invSummary(u)
      const status = `💰 Coin: ${fmt(u.coin)} | 🏦 Bank: ${fmt(u.bank)}\n⚔️ Senjata: ${u.weapon || '-'} | 🛡️ Armor: ${u.armor || '-'}`
      if (!items.length) return reply(`🎒 *INVENTORY*\n\n${status}\n\nTas kamu kosong.`)
      return reply(`🎒 *INVENTORY*\n\n${status}\n\n${items.map(([n, c]) => `• ${n} x${c}`).join('\n')}\n\nGunakan: *${prefix}equip <item>* untuk memasang\nGunakan: *${prefix}sell <item>* untuk menjual`)
}

export { pluginConfig as config, handler }
