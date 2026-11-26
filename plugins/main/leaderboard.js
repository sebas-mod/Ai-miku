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

// Nota: los alias 'toplevel' y 'topxp' pasaron al plugin user/toplevel (canvas de nivel),
// y 'rank' pasó al plugin user/level.
const pluginConfig = {
    name: 'leaderboard',
    alias: [
        'lb', 'top', 'ranking', 'topglobal',
        'topmoney', 'topkoin', 'topuang', 'topduit', 'richest', 'sultan',
        'topexp', 'toplimit', 'topenergi', 'topenergy'
    ],
    category: 'main',
    description: 'Ranking global del top 10 (dinero, exp, energía) en forma de imagen',
    usage: '.leaderboard [dinero|exp|energia]',
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
        title: 'TOP 10 MÁS RICOS',
        subtitle: 'Ranking global por dinero total (cartera + banco)',
        accent: '#f5c451',
        value: (u) => u.total,
        row: (u) => ({
            main: fmtMoney(u.total),
            mainLabel: 'DINERO TOTAL',
            sub: `Nv.${u.level} • Cartera ${fmtCompact(u.koin)} • Banco ${fmtCompact(u.bank)}`
        })
    },
    exp: {
        title: 'TOP 10 EXP',
        subtitle: 'Ranking global por EXP total',
        accent: '#a78bfa',
        value: (u) => u.exp,
        row: (u) => ({
            main: `Nv.${u.level}`,
            mainLabel: `${fmtInt(u.exp)} XP`,
            sub: getRankInfo(u.level).title
        })
    },
    energi: {
        title: 'TOP 10 ENERGÍA',
        subtitle: 'Ranking global por energía',
        accent: '#5eead4',
        value: (u) => u.energi,
        row: (u) => ({
            main: fmtInt(u.energi),
            mainLabel: 'ENERGÍA',
            sub: `Nv.${u.level} • Dinero ${fmtCompact(u.total)}`
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
        return m.reply(`📊 *ᴄʟᴀsɪꜰɪᴄᴀᴄɪᴏ́ɴ*\n\n> Todavía no hay usuarios en la base de datos.`)
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
            ? `> Tu posición: *#${myIndex + 1}* de *${fmtInt(all.length)}* usuarios.`
            : `> Todavía no estás en el ranking.`)

    const pick = [
        ['money', '💰 Top Dinero', 'topmoney'],
        ['exp', '✨ Top EXP', 'topexp'],
        ['energi', '⚡ Top Energía', 'topenergi']
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
