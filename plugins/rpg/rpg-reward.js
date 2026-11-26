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
    name: "reward",
    alias: ["harian", "daily", "claim", "mingguan", "weekly", "monthly", "bulanan"],
    category: "rpg",
    description: "Fitur RPG reward",
    usage: ".reward",
    example: ".reward",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const CFG = {
    harian: { cooldownJam: 24, free: { exp: 500, money: 1000, limit: 5 }, prem: { exp: 1000, money: 5000, limit: 10 } },
    mingguan: { cooldownJam: 168, free: { exp: 2999, money: 7000, limit: 15 }, prem: { exp: 4999, money: 14000, limit: 30 } },
    bulanan: { cooldownJam: 720, free: { exp: 4999, money: 50000, limit: 30 }, prem: { exp: 5999, money: 100000, limit: 50 } },
    streak: {
        on: true,
        toleransiJam: { harian: 48, mingguan: 336 },
        tingkat: { harian: [[30, 100], [14, 50], [7, 25], [3, 10]], mingguan: [[8, 50], [4, 25], [2, 10]] },
        milestone: { harian: { setiap: 7, hadiah: { limit: 10 } }, mingguan: { setiap: 4, hadiah: { limit: 20 } } }
    }
}

const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
const ICON = { money: '💹 Money', exp: 'Exp', limit: '🎫 Limit' }
const LAST_KEY = { harian: 'lastclaim', mingguan: 'lastweekly', bulanan: 'lastmonthly' }

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

function formatTime(ms) {
    const h = Math.floor(ms / 3600000)
    const mnt = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${h} Jam ${mnt} Menit ${s} Detik`
}

const rewardConfig = (type) => {
    const c = CFG[type]
    if (!c) return undefined
    return { cooldown: c.cooldownJam * 3600000, lastKey: LAST_KEY[type], free: c.free, prem: c.prem }
}

const streakConfig = (type) => {
    const st = CFG.streak
    if (!st.on || !st.tingkat[type]) return undefined
    const ms = st.milestone[type] || { setiap: 0, hadiah: {} }
    return {
        key: type === 'harian' ? 'streakDaily' : 'streakWeekly',
        unit: type === 'harian' ? 'hari' : 'minggu',
        grace: st.toleransiJam[type] * 3600000,
        tiers: st.tingkat[type].map(([n, p]) => [n, p / 100]),
        milestone: ms.setiap, milestoneReward: ms.hadiah || {}
    }
}

async function handler(m, { command, isPrems }) {
    const type = /harian|claim|daily/i.test(command) ? 'harian' : /mingguan|weekly/i.test(command) ? 'mingguan' : /monthly|bulanan/i.test(command) ? 'bulanan' : null
    if (!type) return

    const user = global.db.data.users[m.sender]
    const cfg = rewardConfig(type)

    const now = Date.now()
    const last = Number(user[cfg.lastKey]) || 0
    const remaining = last + cfg.cooldown - now

    if (remaining > 0) {
        const sc = streakConfig(type)
        const streakNow = sc ? Number(user[sc.key]) || 0 : 0
        return m.reply(`⏳ Kamu sudah klaim *${type}*.\n` + `Tunggu *${formatTime(remaining)}* lagi.` + (streakNow ? `\n🔥 Streak: ${streakNow} ${sc.unit}` : ''))
    }

    const reward = { ...(isPrems ? cfg.prem : cfg.free) }
    const sc = streakConfig(type)
    let streakText = ''

    if (sc) {
        const broken = last > 0 && now - last > sc.grace
        const prev = Number(user[sc.key]) || 0
        const streak = !last || broken ? 1 : prev + 1
        const bonus = (sc.tiers.find(([n]) => streak >= n) || [0, 0])[1]

        if (bonus) for (const k of ['exp', 'money', 'limit']) reward[k] = Math.round(reward[k] * (1 + bonus))
        const milestone = sc.milestone > 0 && streak % sc.milestone === 0
        let milestoneParts = []
        if (milestone) milestoneParts = giveReward(user, sc.milestoneReward)

        user[sc.key] = streak
        const hariKe = ((streak - 1) % 7) + 1
        const siklus = type === 'harian' ? `\n🍰 Hari ke-${hariKe}/7 ${'🍓'.repeat(hariKe)}${'🤍'.repeat(7 - hariKe)}${hariKe === 7 ? ' ✨ HADIAH BESAR!' : ''}` : ''
        streakText =
            `\n\n🔥 Streak: *${streak} ${sc.unit}*` +
            (bonus ? ` (bonus +${Math.round(bonus * 100)}%)` : '') +
            siklus + (milestone && milestoneParts.length ? `\n🎉 Bonus milestone: ${milestoneParts.join(', ')}` : '') +
            (broken && prev > 1 ? `\n💔 Streak sebelumnya (${prev} ${sc.unit}) putus, mulai lagi dari 1.` : '')
        const nextTier = [...sc.tiers].reverse().find(([n]) => n > streak)
        if (nextTier) streakText += `\n➡️ ${nextTier[0] - streak} ${sc.unit} lagi untuk bonus +${Math.round(nextTier[1] * 100)}%`
        streakText += `\n⚠️ Klaim lagi sebelum ${new Date(now + sc.grace).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })} supaya streak tidak putus.`
    }

    user.exp += reward.exp
    user.money += reward.money
    user.limit += reward.limit

    user[cfg.lastKey] = now

    m.reply(`🎁 *Hadiah ${type.charAt(0).toUpperCase() + type.slice(1)}*\n` + `\n+ ${reward.exp} Exp` + `\n+ ${reward.money} Money` + `\n+ ${reward.limit} Limit` + streakText)
}

handler.as = 'harian'

export { pluginConfig as config, handler }
