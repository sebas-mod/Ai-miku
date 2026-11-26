/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import { calculateLevel, getRole, checkAndNotifyLevelUp } from '../../src/lib/data/level.js'

const pluginConfig = {
    name: 'addlevel',
    alias: ['tambahlevel', 'givelevel', 'addlvl'],
    category: 'owner',
    description: 'Tambah level user (via exp)',
    usage: '.addlevel <jumlah> @user',
    example: '.addlevel 5 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args

    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let levels = parseInt(numArg) || 0

    let targetJid = extractTarget(m)

    if (!targetJid && levels > 0) {
        targetJid = m.sender
    }

    if (!targetJid || levels <= 0) {
        return m.reply(
            `📊 *ADD LEVEL*\n\n` +
            `Sistema para añadir niveles a un miembro al instante.\n\n` +
            `*USO:*\n` +
            `- *${m.prefix}addlevel <cantidad>* — (para ti mismo)\n` +
            `- *${m.prefix}addlevel <cantidad> @user* — (a otra persona)\n\n` +
            `*EJEMPLO DE USO:*\n` +
            `- *${m.prefix}addlevel 5*\n` +
            `- *${m.prefix}addlevel 10 @user*`
        )
    }

    await m.react('🕕')

    const user = db.getUser(targetJid) || db.setUser(targetJid, {})
    if (!user.rpg) user.rpg = {}

    const expToAdd = levels * 10000

    const oldExp = user.exp || 0
    const newExp = db.updateExp(targetJid, expToAdd)
    user.exp = newExp

    const mockM = { ...m, sender: targetJid, pushName: m.pushName }
    const addResult = await checkAndNotifyLevelUp(sock, mockM, db, user, oldExp, newExp)

    db.setUser(targetJid, user)

    await m.react('✅')

    const finalLevel = addResult.newLevel || calculateLevel(user.exp)

    await m.reply(
        `✅ *NIVEL AÑADIDO*\n\n` +
        `Se añadieron *${levels} niveles* a *@${targetJid.split('@')[0]}*.\n\n` +
        `*Statistik Terkini:*\n` +
        `- Level Sekarang: *${finalLevel}*\n` +
        `- Rol actual: *${getRole(finalLevel)}*\n` +
        `- Total XP: *${user.exp.toLocaleString()}* XP`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
