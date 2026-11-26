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
    name: "market-utama",
    alias: ["pasar", "mjual", "mbeli", "mtarik", "mku"],
    category: "rpg",
    description: "Fitur RPG market-utama",
    usage: ".market-utama",
    example: ".market-utama",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const rpgStore = ElysiaRuntime.rpgStore;
const saveDB = ElysiaRuntime.saveDB;
const sharedMarket = ElysiaRuntime.sharedMarket;
const invGet = ElysiaRuntime.invGet;
const invAdd = ElysiaRuntime.invAdd;

const CFG = {
    pajakPersen: 5,
    maxListing: 5,
    durasiHari: 7,
    hargaMin: 1,
    hargaMax: 100000000,
    itemBoleh: 'semua',
    itemDilarang: ['money', 'exp', 'level', 'limit', 'bank', 'health', 'stamina', 'atm', 'fullatm', 'age', 'regtime', 'afk', 'warn', 'premiumtime', 'sword', 'pickaxe', 'axe', 'fishingrod', 'armor']
}

const PER_HAL = 10

const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
const prefixOf = () => (Array.isArray(global.prefix) ? global.prefix.find(p => typeof p === 'string' && p) : '') || '.'
const save = () => { try { saveDB(global.db) } catch {} }
const users = () => rpgStore().users
const market = () => sharedMarket()

function canTrade(item) {
    item = String(item || '').toLowerCase()
    if (!/^[a-z0-9_ ]+$/.test(item)) return false
    if (CFG.itemDilarang.map(v => String(v).toLowerCase()).includes(item)) return false
    if (/durability|time|last|cooldown|^is|registered|banned|premium|name|role|guild|clan|streak/.test(item)) return false
    if (Array.isArray(CFG.itemBoleh) && !CFG.itemBoleh.map(v => String(v).toLowerCase()).includes(item)) return false
    return true
}

function marketExpire() {
    if (!global.db) return
    const mk = market()
    const lim = Date.now() - CFG.durasiHari * 864e5
    const keep = []
    let changed = false
    for (const l of mk.list) {
        if (l.at < lim) {
            const u = users()[l.seller]
            if (u) invAdd(u, l.item, l.qty)
            changed = true
        } else keep.push(l)
    }
    if (changed) { mk.list = keep; save() }
}

function marketList() { marketExpire(); return market().list }

function marketJual(jid, item, qty, harga) {
    marketExpire()
    item = String(item || '').toLowerCase()
    qty = Math.floor(Number(qty))
    harga = Math.floor(Number(harga))
    const u = users()[jid]
    if (!canTrade(item)) return { ok: false, msg: `Item *${item}* tidak bisa dijual.` }
    if (invGet(u, item) <= 0) return { ok: false, msg: `Kamu tidak punya item *${item}*.` }
    if (!(qty > 0)) return { ok: false, msg: 'Jumlah tidak valid.' }
    if (!(harga >= CFG.hargaMin && harga <= CFG.hargaMax)) return { ok: false, msg: `Harga per item harus ${fmt(CFG.hargaMin)} - ${fmt(CFG.hargaMax)}.` }
    if (invGet(u, item) < qty) return { ok: false, msg: `${item} kamu cuma ${fmt(invGet(u, item))}.` }
    const mk = market()
    if (mk.list.filter(l => l.seller === jid).length >= CFG.maxListing) return { ok: false, msg: `Maksimal ${CFG.maxListing} listing aktif.` }
    invAdd(u, item, -qty)
    const id = ++mk.seq
    mk.list.push({ id, seller: jid, item, qty, harga, at: Date.now() })
    save()
    return { ok: true, id }
}

function marketBeli(jid, id, qty) {
    marketExpire()
    const mk = market()
    const l = mk.list.find(x => x.id === Number(id))
    if (!l) return { ok: false, msg: 'Listing tidak ditemukan (mungkin sudah terjual / kedaluwarsa).' }
    if (l.seller === jid) return { ok: false, msg: `Itu listing milikmu sendiri. Pakai ${prefixOf()}mtarik untuk menariknya.` }
    qty = Math.max(1, Math.floor(Number(qty)) || l.qty)
    if (qty > l.qty) return { ok: false, msg: `Stok listing tinggal ${l.qty}.` }
    const buyer = users()[jid]
    const total = l.harga * qty
    if ((Number(buyer.money) || 0) < total) return { ok: false, msg: `Money kurang. Butuh ${fmt(total)}.` }
    const pajak = Math.floor(total * (Number(CFG.pajakPersen) || 0) / 100)
    const seller = users()[l.seller]
    buyer.money -= total
    invAdd(buyer, l.item, qty)
    if (seller) seller.money = (Number(seller.money) || 0) + total - pajak
    l.qty -= qty
    if (l.qty <= 0) mk.list = mk.list.filter(x => x !== l)
    save()
    return { ok: true, item: l.item, qty, total, pajak, seller: l.seller, terima: total - pajak }
}

function marketTarik(jid, id) {
    marketExpire()
    const mk = market()
    const l = mk.list.find(x => x.id === Number(id))
    if (!l || l.seller !== jid) return { ok: false, msg: 'Listing tidak ditemukan atau bukan milikmu.' }
    const u = users()[jid]
    invAdd(u, l.item, l.qty)
    mk.list = mk.list.filter(x => x !== l)
    save()
    return { ok: true, item: l.item, qty: l.qty }
}

if (global.__marketplaceTimer) clearInterval(global.__marketplaceTimer)
global.__marketplaceTimer = setInterval(() => { try { marketExpire() } catch (e) { console.error('[MARKETPLACE]', e.message) } }, 60_000)
global.__marketplaceTimer.unref?.()

async function handler(m, { conn, args, command }) {
    const p = prefixOf()
    const cmd = command.toLowerCase()

    if (cmd === 'mjual') {
        if (args.length < 3) return m.reply(`Contoh: ${p}mjual potion 5 6000\n(jual 5 potion, harga 6000 per item)\nPajak penjualan: ${CFG.pajakPersen}%`)
        const r = marketJual(m.sender, args[0], args[1], args[2])
        if (!r.ok) return m.reply(`❌ ${r.msg}`)
        return m.reply(`✅ Listing #${r.id} dibuat.\nPembeli bisa membelinya dengan ${p}mbeli ${r.id}\nTarik kembali: ${p}mtarik ${r.id}`)
    }

    if (cmd === 'mbeli') {
        if (!args[0]) return m.reply(`Contoh: ${p}mbeli 3 2`)
        const r = marketBeli(m.sender, args[0], args[1])
        if (!r.ok) return m.reply(`❌ ${r.msg}`)
        await m.reply(`🛒 *PEMBELIAN BERHASIL*\n\n📦 ${r.item} x${fmt(r.qty)}\n💰 Total : ${fmt(r.total)}`)
        conn.sendMessage(m.chat, { text: `💰 @${r.seller.split('@')[0]} barangmu *${r.item} x${fmt(r.qty)}* terjual! Kamu menerima ${fmt(r.terima)} (pajak ${fmt(r.pajak)}).`, mentions: [r.seller] }).catch(() => null)
        return
    }

    if (cmd === 'mtarik') {
        if (!args[0]) return m.reply(`Contoh: ${p}mtarik 3`)
        const r = marketTarik(m.sender, args[0])
        if (!r.ok) return m.reply(`❌ ${r.msg}`)
        return m.reply(`↩️ Listing ditarik. ${r.item} x${fmt(r.qty)} dikembalikan ke inventory.`)
    }

    const all = marketList()
    const list = cmd === 'mku' ? all.filter(l => l.seller === m.sender) : all
    if (!list.length) return m.reply(cmd === 'mku' ? 'Kamu tidak punya listing aktif.' : `Marketplace masih kosong.\nJual barang: ${p}mjual item jumlah harga`)

    const page = Math.max(1, parseInt(args[0]) || 1)
    const max = Math.ceil(list.length / PER_HAL)
    const rows = [...list].sort((a, b) => b.at - a.at).slice((page - 1) * PER_HAL, page * PER_HAL)
    const mentions = rows.map(l => l.seller)
    const text = [
        `🏪 *${(global.namebot || 'BOT').toUpperCase()} MARKETPLACE*${cmd === 'mku' ? ' — listing kamu' : ''}`,
        `Halaman ${page}/${max} • pajak ${CFG.pajakPersen}%`, '',
        ...rows.map(l => `#${l.id} • *${l.item}* x${fmt(l.qty)}\n   💰 ${fmt(l.harga)}/item • @${l.seller.split('@')[0]}`),
        '', `Beli: ${p}mbeli <id> [jumlah]`
    ].join('\n')
    return conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
}

handler.as = 'market'

export { pluginConfig as config, handler }
