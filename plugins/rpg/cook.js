/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const RECIPES = ElysiaRuntime.RECIPES;

const pluginConfig = {
    name: "cook",
    alias: [],
    category: "rpg",
    description: "Masak makanan dari resep",
    usage: ".cook",
    example: ".cook",
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

      const { initRpgUser, sender, pushname, rpgDb, text, reply, saveRpg, prefix } = A
      initRpgUser(sender, pushname)
      const key = String(text || '').trim().toLowerCase()
      if (!key) return reply(`Masukkan nama resep: contoh *${prefix}cook supikan*\nLihat resep: *${prefix}cookbook*`)
      const r = RECIPES[key]
      if (!r) return reply(`Resep *${key}* tidak dikenal.\nLihat resep: *${prefix}cookbook*`)

      const u = rpgDb[sender]
      const pick = []
      for (const n of r.need) {
          const idx = u.inv.findIndex((it, i) => !pick.includes(i) && (n.prefix ? String(it).toLowerCase().startsWith(n.match) : String(it).toLowerCase() === n.match))
          if (idx === -1) return reply(`🍲 Bahan kurang untuk *${key}*.\nButuh: ${r.label}`)
          pick.push(idx)
      }
      u.inv = u.inv.filter((_, i) => !pick.includes(i))
      u.inv.push(`masakan:${key}`)
      saveRpg()
      return reply(`🍲 Kamu memasak *${key}*!`)
}

export { pluginConfig as config, handler }
