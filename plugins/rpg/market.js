/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const sharedMarket = ElysiaRuntime.sharedMarket;

const pluginConfig = {
    name: "market",
    alias: [],
    category: "rpg",
    description: "Jual/beli di pasar antar player",
    usage: ".market",
    example: ".market",
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
      const u = rpgDb[sender]
      const sm = sharedMarket()
      const mk = sm.list
      const arg = String(text || '').trim()
      const aksi = (arg.split(/\s+/)[0] || '').toLowerCase()
      const rest = arg.slice(aksi.length).trim()
      const who = (jid) => String(jid).split('@')[0]

      if (!aksi || aksi === 'list') {
          const rows = mk.slice(0, 15).map((e, i) => `${i + 1}. *${e.item}* — ${fmt(e.harga)} 💰 (penjual ${who(e.seller)})`)
          return reply(`🛒 *MARKETPLACE*\n\n${rows.length ? rows.join('\n') : 'Belum ada barang dijual.'}\n\nJual: *${prefix}market jual <item> <harga>*\nBeli: *${prefix}market beli <item>*\nTarik: *${prefix}market batal <item>*`)
      }

      if (aksi === 'jual') {
          const mt = rest.match(/^(.+?)\s+(\d+)$/)
          if (!mt) return reply(`Format: *${prefix}market jual <item> <harga>*`)
          const item = mt[1].trim()
          const harga = parseInt(mt[2], 10)
          if (!Number.isInteger(harga) || harga <= 0 || harga > 1e9) return reply('Harga tidak valid.')
          const idx = u.inv.findIndex(i => String(i).toLowerCase() === item.toLowerCase())
          if (idx === -1) return reply(`Kamu tidak punya *${item}* untuk dijual.`)
          const real = u.inv[idx]
          u.inv.splice(idx, 1)
          mk.push({ id: ++sm.seq, seller: sender, item: real, qty: 1, harga, at: Date.now() })
          saveRpg()
          return reply(`✅ Kamu menjual *${real}* seharga ${fmt(harga)} 💰`)
      }

      if (aksi === 'beli') {
          if (!rest) return reply(`Format: *${prefix}market beli <item>*`)
          const list = mk.filter(e => String(e.item).toLowerCase() === rest.toLowerCase() && e.seller !== sender).sort((a, b) => a.harga - b.harga)
          const entry = list[0]
          if (!entry) return reply(`Item *${rest}* tidak tersedia di market.`)
          if (u.coin < entry.harga) return reply(`💸 Koinmu tidak cukup. Butuh ${fmt(entry.harga)}.`)
          const seller = initRpgUser(entry.seller, 'Player')
          u.coin -= entry.harga
          seller.coin += entry.harga
          u.inv.push(entry.item)
          entry.qty = (Number(entry.qty) || 1) - 1
          if (entry.qty <= 0) mk.splice(mk.indexOf(entry), 1)
          saveRpg()
          return reply(`🛍️ Kamu membeli *${entry.item}* dari market seharga ${fmt(entry.harga)} 💰`)
      }

      if (aksi === 'batal') {
          const idx = mk.findIndex(e => e.seller === sender && String(e.item).toLowerCase() === rest.toLowerCase())
          if (idx === -1) return reply('Kamu tidak punya barang itu di market.')
          const [e] = mk.splice(idx, 1)
          for (let i = 0; i < (Number(e.qty) || 1); i++) u.inv.push(e.item)
          saveRpg()
          return reply(`↩️ *${e.item}* dikembalikan ke inventory.`)
      }

      return reply('Perintah market tidak valid.')
}

export { pluginConfig as config, handler }
