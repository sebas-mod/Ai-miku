/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const SHOP = ElysiaRuntime.SHOP;
const SHOP_ALIAS = ElysiaRuntime.SHOP_ALIAS;

const pluginConfig = {
    name: "shop",
    alias: [],
    category: "rpg",
    description: "Toko utama RPG",
    usage: ".shop",
    example: ".shop",
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

      const { initRpgUser, sender, pushname, text, reply, fmt, prefix } = A
      initRpgUser(sender, pushname)
      const key = SHOP_ALIAS[String(text || '').trim().toLowerCase().replace(/\s+/g, '')]
      if (!key) {
          const cats = Object.entries(SHOP).map(([k, c], i) => `${i + 1}. *${c.title}* → ${prefix}shop ${k}`).join('\n')
          return reply(`🛒 *TOKO RPG UTAMA*\n\n📦 *Kategori Tersedia:*\n${cats}\n\nContoh: *${prefix}shop weapon*\nBeli item: *${prefix}buy <nama item>*`)
      }
      const cat = SHOP[key]
      const list = Object.entries(cat.items).map(([n, p]) => `• ${n} — ${fmt(p)} coin`).join('\n')
      return reply(`🛒 *${cat.title}*\n\n${list}\n\nBeli: *${prefix}buy <nama item>* (contoh: ${prefix}buy ${Object.keys(cat.items)[0]})`)
}

export { pluginConfig as config, handler }
