/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const priceOf = ElysiaRuntime.priceOf;
const applyPurchase = ElysiaRuntime.applyPurchase;

const pluginConfig = {
    name: "buy",
    alias: [],
    category: "rpg",
    description: "Beli item dari toko",
    usage: ".buy",
    example: ".buy",
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

      const { initRpgUser, sender, pushname, rpgDb, text, reply, fmt, saveRpg, giveExp, prefix } = A
      initRpgUser(sender, pushname)
      if (!text) return reply(`Masukkan nama item yang ingin dibeli.\nLihat daftar: *${prefix}shop*`)

      const mt = text.trim().toLowerCase().match(/^(.*?)(?:\s+(\d{1,2}))?$/)
      const item = (mt[1] || '').trim()
      const harga = priceOf(item)
      if (harga === undefined) return reply(`Item tidak ditemukan di toko.\nLihat daftar: *${prefix}shop*`)

      const special = ['scrollclass', 'stonebless', 'essencexp', 'spiritcore', 'elixirlife'].includes(item)
      const qty = special ? 1 : Math.max(1, Math.min(99, parseInt(mt[2] || '1', 10)))
      const total = harga * qty
      const u = rpgDb[sender]
      if (u.coin < total) return reply(`💰 Uang kamu tidak cukup. Butuh ${fmt(total)}, kamu punya ${fmt(u.coin)}.`)

      u.coin -= total
      let note = ''
      for (let i = 0; i < qty; i++) {
          const r = applyPurchase(u, item)
          if (r && typeof r === 'object') { await giveExp(r.exp); note = r.text } else if (r) note = r
      }
      saveRpg()
      return reply(`✅ Kamu membeli *${item}*${qty > 1 ? ` x${qty}` : ''} seharga ${fmt(total)} coin.${note ? `\n${note}` : ''}`)
}

export { pluginConfig as config, handler }
