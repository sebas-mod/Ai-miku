/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import config from '../../config.js'
import { getRankInfo } from '../../src/lib/data/level.js'
import { collectRankingUsers, jidDigits } from '../../src/lib/data/ranking.js'
import { renderTop10, getUserAvatar, fmtInt, fmtMoney, fmtCompact } from '../../src/lib/core/rank-canvas.js'

// Catatan: alias 'toplevel' & 'topxp' dilepas ke plugin user/toplevel (canvas level),
// dan 'rank' dilepas ke plugin user/level.
const pluginConfig = {
    name: 'leaderboard',
    alias: [
        'lb', 'top', 'ranking', 'topglobal',
        'topmoney', 'topkoin', 'topuang', 'topduit', 'richest', 'sultan',
        'topexp', 'toplimit', 'topenergi', 'topenergy'
    ],
    category: 'main',
    description: 'Leaderboard global 10 besar (uang, exp, energi) dalam bentuk gambar',
    usage: '.leaderboard [uang|exp|energi]',
    example: '.topmoney',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const TYPES = {
    money: {
        title: 'TOP 10 TERKAYA',
        subtitle: 'Peringkat global berdasarkan total uang (dompet + bank)',
        accent: '#f5c451',
        value: (u) => u.total,
        row: (u) => ({
            main: fmtMoney(u.total),
            mainLabel: 'TOTAL UANG',
            sub: `Lv.${u.level} • Dompet ${fmtCompact(u.koin)} • Bank ${fmtCompact(u.bank)}`
        })
    },
    exp: {
        title: 'TOP 10 EXP',
        subtitle: 'Peringkat global berdasarkan total EXP',
        accent: '#a78bfa',
        value: (u) => u.exp,
        row: (u) => ({
            main: `Lv.${u.level}`,
            mainLabel: `${fmtInt(u.exp)} XP`,
            sub: getRankInfo(u.level).title
        })
    },
    energi: {
        title: 'TOP 10 ENERGI',
        subtitle: 'Peringkat global berdasarkan energi',
        accent: '#5eead4',
        value: (u) => u.energi,
        row: (u) => ({
            main: fmtInt(u.energi),
            mainLabel: 'ENERGI',
            sub: `Lv.${u.level} • Uang ${fmtCompact(u.total)}`
        })
    }
}

function detectType(cmd, args) {
    if (/exp|xp/.test(cmd)) return 'exp'
    if (/energi|energy|limit/.test(cmd)) return 'energi'
    if (/money|koin|uang|duit|richest|sultan/.test(cmd)) return 'money'
    const a = (args[0] || '').toLowerCase()
    if (['exp', 'xp', 'level'].includes(a)) return 'exp'
    if (['energi', 'energy', 'limit'].includes(a)) return 'energi'
    return 'money'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const type = detectType((m.command || '').toLowerCase(), m.args || [])
    const cfg = TYPES[type]

    const all = collectRankingUsers(db)
        .filter((u) => cfg.value(u) > 0)
        .sort((a, b) => cfg.value(b) - cfg.value(a))

    if (all.length === 0) {
        return m.reply(`📊 *ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ*\n\n> Belum ada data user di database.`)
    }

    const myId = jidDigits(m.sender)
    const myIndex = all.findIndex((u) => u.id === myId)
    const top = all.slice(0, 10)
    const avatars = await Promise.all(top.map((u) => getUserAvatar(sock, u.jid)))

    const rows = top.map((u, i) => ({
        name: u.name,
        avatar: avatars[i],
        isMe: u.id === myId,
        ...cfg.row(u)
    }))

    const image = await renderTop10({
        key: 'leaderboard',
        title: cfg.title,
        subtitle: cfg.subtitle,
        accent: cfg.accent,
        rows,
        me: { rank: myIndex >= 0 ? myIndex + 1 : 0, total: all.length },
        botName: config.bot?.name || 'Elysia Assistant'
    })

    const caption =
        `🏆 *${cfg.title}* 🏆\n\n` +
        (myIndex >= 0
            ? `> Posisi kamu: *#${myIndex + 1}* dari *${fmtInt(all.length)}* user.`
            : `> Kamu belum masuk peringkat.`)

    const pick = [
        ['money', '💰 Top Uang', 'topmoney'],
        ['exp', '✨ Top EXP', 'topexp'],
        ['energi', '⚡ Top Energi', 'topenergi']
    ].filter(([k]) => k !== type)

    try {
        await sock.sendButton(m.chat, image, caption, m, {
            buttons: pick.map(([, label, cmd]) => ({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: label, id: `${m.prefix}${cmd}` })
            }))
        })
    } catch {
        await sock.sendMessage(m.chat, { image, caption }, { quoted: m })
    }
}

export { pluginConfig as config, handler }
