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
    name: "eventshop",
    alias: ["eventbuy"],
    category: "rpg",
    description: "Fitur RPG eventshop",
    usage: ".eventshop",
    example: ".eventshop",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const rpgStore = ElysiaRuntime.rpgStore;
const saveDB = ElysiaRuntime.saveDB;

const CFG = {
    events: []
}

const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
const prefixOf = () => (Array.isArray(global.prefix) ? global.prefix.find(p => typeof p === 'string' && p) : '') || '.'
const save = () => { try { saveDB(global.db) } catch {} }
const users = () => rpgStore().users
const sub = (key, init) => { const s = (global.db.fitur ||= {}); if (!s[key]) s[key] = init; return s[key] }

const WIB = 7 * 36e5
const DAYS = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
const wibDate = (t = Date.now()) => new Date(t + WIB)
const ICON = { money: '💹 Money', exp: 'Exp', limit: '🎫 Limit' }

function giveReward(u, r = {}) {
    const out = []
    for (const [k, v] of Object.entries(r || {})) {
        const n = Number(v) || 0
        if (!n) continue
        u[k] = (Number(u[k]) || 0) + n
        out.push(`${ICON[k] || k} +${fmt(n)}`)
    }
    return out
}

function parseWib(s, end = false) {
    if (!s) return null
    s = String(s).trim()
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T${end ? '23:59:59' : '00:00:00'}+07:00` : `${s.replace(' ', 'T')}:00+07:00`
    const t = Date.parse(iso)
    return Number.isFinite(t) ? t : null
}

const eventKey = (e) => `${e.nama}|${e.mulai || ''}|${e.selesai || ''}|${(e.hari || []).join(',')}`

function isActive(e, now = Date.now()) {
    const w = wibDate(now)
    if (Array.isArray(e.hari) && e.hari.length && !e.hari.map(h => String(h).toLowerCase()).includes(DAYS[w.getUTCDay()])) return false
    const a = parseWib(e.mulai), b = parseWib(e.selesai, true)
    if (a && now < a) return false
    if (b && now > b) return false
    return true
}

function activeEvents() {
    return (CFG.events || []).filter(e => e && e.nama && isActive(e))
}

function diskonItem(item) {
    let best = 0
    for (const e of activeEvents()) {
        const d = Number(e.diskon) || 0
        if (!d) continue
        if (e.item === 'semua' || (Array.isArray(e.item) && e.item.includes(item))) best = Math.max(best, d)
    }
    return Math.min(best, 95)
}
const hargaDiskon = (harga, item) => Math.max(1, Math.round(harga * (100 - diskonItem(item)) / 100))

function stockOf(e, name) {
    const st = sub('eventStock', {})
    return (st[`${eventKey(e)}#${name}`] ||= { terjual: 0, user: {} })
}

function eventBarang() {
    const out = []
    for (const e of activeEvents()) {
        for (const [id, b] of Object.entries(e.barang || {})) {
            const s = stockOf(e, id)
            out.push({ e, id, b, sisa: b.stok > 0 ? Math.max(0, b.stok - s.terjual) : Infinity, terjual: s.terjual })
        }
    }
    return out
}

function eventBeli(jid, id, qty) {
    const hit = eventBarang().find(x => x.id === String(id).toLowerCase())
    if (!hit) return { ok: false, msg: 'Barang event tidak ditemukan atau event sudah berakhir.' }
    const u = users()[jid]
    const { e, b, sisa } = hit
    qty = Math.max(1, Math.floor(qty) || 1)
    if (sisa < qty) return { ok: false, msg: `Stok tinggal ${sisa === Infinity ? '∞' : sisa}.` }
    const s = stockOf(e, hit.id)
    if (b.batasPerUser > 0 && (s.user[jid] || 0) + qty > b.batasPerUser) {
        return { ok: false, msg: `Batas beli per orang ${b.batasPerUser}. Kamu sudah beli ${s.user[jid] || 0}.` }
    }
    const total = Math.round(Number(b.harga) * qty)
    if ((Number(u.money) || 0) < total) return { ok: false, msg: `Money kurang. Butuh ${fmt(total)}.` }
    u.money -= total
    const got = []
    for (const [k, v] of Object.entries(b.beri || {})) got.push(...giveReward(u, { [k]: v * qty }))
    s.terjual += qty
    s.user[jid] = (s.user[jid] || 0) + qty
    save()
    return { ok: true, nama: b.nama || hit.id, total, got }
}

;(global.economyHooks ||= {}).eventshop = { activeEvents, diskonItem, hargaDiskon }

async function handler(m, { conn, args, command }) {
    const p = prefixOf()

    if (/^eventbuy$/i.test(command)) {
        if (!args[0]) return m.reply(`Contoh: ${p}eventbuy paketevent 2\nLihat daftar: ${p}eventshop`)
        const r = eventBeli(m.sender, args[0], parseInt(args[1]) || 1)
        if (!r.ok) return m.reply(`❌ ${r.msg}`)
        return m.reply(`🎉 *PEMBELIAN EVENT BERHASIL*\n\n📦 ${r.nama}\n💰 Total : ${fmt(r.total)}\n🎁 Didapat : ${r.got.join(', ') || '-'}`)
    }

    const ev = activeEvents()
    if (!ev.length) return m.reply('Belum ada event shop yang aktif sekarang.')
    const lines = [`🎉 *${(global.namebot || 'BOT').toUpperCase()} EVENT SHOP* 🎉`, '']
    for (const e of ev) {
        lines.push(`✦ *${e.nama}*`)
        if (e.diskon) lines.push(`🏷️ Diskon ${e.diskon}% untuk ${e.item === 'semua' ? 'semua item' : (e.item || []).join(', ')} (${p}buy)`)
        if (e.selesai) lines.push(`⏰ Sampai ${e.selesai}`)
        if (Array.isArray(e.hari) && e.hari.length) lines.push(`📅 Setiap ${e.hari.join(', ')}`)
        lines.push('')
    }
    const barang = eventBarang()
    if (barang.length) {
        lines.push('🛒 *BARANG KHUSUS*')
        for (const x of barang) {
            lines.push(`• *${x.id}* — ${x.b.nama || x.id}\n   💰 ${fmt(x.b.harga)} | stok ${x.sisa === Infinity ? '∞' : x.sisa}${x.b.batasPerUser > 0 ? ` | max ${x.b.batasPerUser}/orang` : ''}\n   🎁 ${Object.entries(x.b.beri || {}).map(([k, v]) => `${k} x${v}`).join(', ')}`)
        }
        lines.push('', `Beli: ${p}eventbuy <id> [jumlah]`)
    }
    return conn.sendMessage(m.chat, { text: lines.join('\n').trim() }, { quoted: m })
}

handler.as = 'eventshop'

export { pluginConfig as config, handler }
