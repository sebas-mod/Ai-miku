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
    name: "lbmingguan",
    alias: [],
    category: "rpg",
    description: "Fitur RPG lbmingguan",
    usage: ".lbmingguan",
    example: ".lbmingguan",
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
const getOwners = ElysiaRuntime.getOwners;
const jidNumber = ElysiaRuntime.jidNumber;
const formatWib = ElysiaRuntime.formatWib;

const CFG = {
    mode: 'naik',
    kategori: ['exp', 'money'],
    hariReset: 'minggu',
    jamReset: 20,
    minNilai: 1,
    hadiah: [{ money: 100000, exp: 5000, limit: 10 }, { money: 50000, exp: 3000, limit: 5 }, { money: 25000, exp: 1500, limit: 3 }],
    umumkanKe: 'semuaGrup'
}

const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
const BOT = () => (global.namebot || 'BOT').toUpperCase()
const save = () => { try { saveDB(global.db) } catch {} }
const users = () => rpgStore().users
const store = () => (global.db.fitur ||= {})
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const WIB = 7 * 36e5
const DAYS = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
const wibDate = (t = Date.now()) => new Date(t + WIB)
const ICON = { money: '💹 Money', exp: 'Exp', limit: '🎫 Limit' }

function giveReward(u, r = {}) {
    for (const [k, v] of Object.entries(r || {})) {
        const n = Number(v) || 0
        if (n) u[k] = (Number(u[k]) || 0) + n
    }
}
const rewardText = (r) => Object.entries(r || {}).filter(([, v]) => Number(v)).map(([k, v]) => `${ICON[k] || k} ${fmt(v)}`).join(' • ') || '-'

const owners = () => [...new Set(getOwners().map(n => String(n).replace(/\D/g, '')).filter(Boolean))].map(n => `${n}@s.whatsapp.net`)
const waSock = () => { const s = global.sock; return s && s.platform !== 'telegram' ? s : null }

function lastBoundary(now = Date.now()) {
    const dow = Math.max(0, DAYS.indexOf(String(CFG.hariReset).toLowerCase()))
    const w = wibDate(now)
    let ms = Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate(), Number(CFG.jamReset) || 0) - WIB
    const diff = (w.getUTCDay() - dow + 7) % 7
    ms -= diff * 864e5
    if (ms > now) ms -= 7 * 864e5
    return ms
}

const snapshotOf = (kat) => {
    const snap = {}
    for (const [jid, u] of Object.entries(users())) {
        const v = Number(u?.[kat]) || 0
        if (v > 0) snap[jid] = v
    }
    return snap
}

function lbRank(kat) {
    const lb = store().lb
    return Object.entries(users())
        .map(([jid, u]) => {
            const now = Number(u?.[kat]) || 0
            const base = CFG.mode === 'total' ? 0 : Number(lb?.snap?.[kat]?.[jid]) || 0
            return { jid, nilai: now - base }
        })
        .filter(x => x.nilai >= Math.max(1, Number(CFG.minNilai) || 1))
        .sort((a, b) => b.nilai - a.nilai)
}

const lbInfo = () => ({ mulai: store().lb?.boundary || null, berikutnya: lastBoundary() + 7 * 864e5 })

async function lbAnnounce(text, mentions) {
    const sock = waSock()
    if (!sock) return
    let list = []
    if (CFG.umumkanKe === 'semuaGrup') list = Object.keys(global.db.groups || {}).filter(j => j.endsWith('@g.us'))
    else if (Array.isArray(CFG.umumkanKe)) list = CFG.umumkanKe
    for (const jid of list.slice(0, 60)) {
        await sock.sendMessage(jid, { text, mentions }).catch(() => null)
        await sleep(2500)
    }
    for (const o of owners()) await sock.sendMessage(o, { text, mentions }).catch(() => null)
}

async function lbTick() {
    if (!global.db) return
    const b = lastBoundary()
    const s = store()
    if (!s.lb) {
        s.lb = { boundary: b, snap: Object.fromEntries(CFG.kategori.map(k => [k, snapshotOf(k)])) }
        return save()
    }
    if (s.lb.boundary >= b) return

    const lines = [`🏆 *${BOT()} LEADERBOARD MINGGUAN* 🏆`, 'Periode berakhir, selamat untuk para juara!', '']
    const mentions = []
    for (const kat of CFG.kategori) {
        const rank = lbRank(kat).slice(0, CFG.hadiah.length)
        lines.push(`📊 *${kat.toUpperCase()}*`)
        if (!rank.length) lines.push('_Belum ada yang masuk peringkat._')
        rank.forEach((r, i) => {
            giveReward(users()[r.jid], CFG.hadiah[i])
            mentions.push(r.jid)
            lines.push(`${['🥇', '🥈', '🥉'][i] || `${i + 1}.`} @${jidNumber(r.jid)} • ${fmt(r.nilai)}  →  ${rewardText(CFG.hadiah[i])}`)
        })
        lines.push('')
    }
    lines.push('Periode baru dimulai. Semangat!')
    s.lb = { boundary: b, snap: Object.fromEntries(CFG.kategori.map(k => [k, snapshotOf(k)])) }
    save()
    await lbAnnounce(lines.join('\n'), mentions)
}

if (global.__lbMingguanTimer) clearInterval(global.__lbMingguanTimer)
const tick = () => lbTick().catch(e => console.error('[LB MINGGUAN]', e.message))
setTimeout(tick, 20_000)
global.__lbMingguanTimer = setInterval(tick, 30_000)
global.__lbMingguanTimer.unref?.()

async function handler(m, { conn, args }) {
    const kat = (args[0] || '').toLowerCase()
    const list = kat ? [kat] : CFG.kategori
    if (kat && !CFG.kategori.includes(kat)) return m.reply(`Kategori tersedia: ${CFG.kategori.join(', ')}`)

    const info = lbInfo()
    const lines = [`🏆 *${BOT()} LEADERBOARD MINGGUAN* 🏆`, `Mode: ${CFG.mode === 'total' ? 'nilai total' : 'kenaikan minggu ini'}`, `Hadiah dibagikan: ${formatWib(info.berikutnya)} WIB`, '']
    const mentions = []
    for (const k of list) {
        lines.push(`📊 *${k.toUpperCase()}*`)
        const rank = lbRank(k).slice(0, Math.max(CFG.hadiah.length, 5))
        if (!rank.length) lines.push('_Belum ada yang masuk peringkat._')
        rank.forEach((r, i) => {
            mentions.push(r.jid)
            lines.push(`${['🥇', '🥈', '🥉'][i] || `${i + 1}.`} @${r.jid.split('@')[0]} • ${fmt(r.nilai)}${CFG.hadiah[i] ? `\n     🎁 ${rewardText(CFG.hadiah[i])}` : ''}`)
        })
        lines.push('')
    }
    return conn.sendMessage(m.chat, { text: lines.join('\n').trim(), mentions }, { quoted: m })
}

export { pluginConfig as config, handler }
