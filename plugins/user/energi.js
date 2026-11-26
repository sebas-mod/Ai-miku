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
import { getDailyFeatureStatus } from '../../src/lib/data/daily-limit.js'
const pluginConfig = {
    name: 'energi',
    alias: ['cekenergi', 'myenergi', 'energy', 'limit', 'ceklimit'],
    category: 'user',
    description: 'Cek energi user',
    usage: '.energi [@user]',
    example: '.energi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Unlimited'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()

    let targetJid = m.sender
    let targetName = m.pushName || 'Kamu'

    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    }

    const user = db.getUser(targetJid) || db.setUser(targetJid) || {}
    const dailyStatus = getDailyFeatureStatus(db, targetJid, m.groupMetadata?.participants || [])
    const isOwner = config.owner?.number?.includes(targetJid.replace(/[^0-9]/g, '')) || config.isOwner?.(targetJid)

    const dbToggle = db.setting('energi')
    const energiEnabled = dbToggle !== undefined ? dbToggle : (config.energi?.enabled !== false)

    const isPrem = Boolean(user.isPremium || config.isPremium?.(targetJid))
    let finalEnergi
    if (!energiEnabled || isOwner || (isPrem && (config.energi?.premium ?? -1) === -1)) {
        finalEnergi = -1
    } else if (isPrem) {
        finalEnergi = user.energi ?? config.energi?.premium ?? -1
    } else {
        finalEnergi = user.energi ?? config.energi?.default ?? 25
    }

    const isUnlimited = finalEnergi === -1
    const energiDisplay = formatNumber(finalEnergi)

    const isSelf = targetJid === m.sender

    let userStatus = 'Free'
    if (isOwner) userStatus = 'Owner'
    else if (isPrem) userStatus = 'Premium'
    if (!energiEnabled) userStatus += ' (Energi OFF)'

    let text = `*〔 ⚡ ENERGI INFO 〕*\n\n`

text += `*〔 👤 User 〕* ${targetName}\n`
text += `*〔 ⚡ Energi 〕* ${energiDisplay}\n`
text += `*〔 📊 Limit Harian 〕* ${isOwner || isPrem || dailyStatus.unlimited ? 'UNLIMITED' : `${dailyStatus.used}/${dailyStatus.limit} dipakai · sisa ${dailyStatus.remaining}`}\n`
text += `*〔 💎 Status 〕* ${userStatus}\n\n`

    if (!energiEnabled) {
        text += `🔌 Sistem energi dinonaktifkan — semua command gratis`
    } else if (isSelf && !isUnlimited && finalEnergi < 10) {
        text += `⚠️ Energi hampir habis!\n`
    } else if (isUnlimited) {
        text += `✨ Energi unlimited aktif!`
    }
    if (dailyStatus.unlimited) {
        text += `\n✨ Limit fitur harian unlimited aktif permanen.`
    }

    await m.reply(text)
}

export { pluginConfig as config, handler }
