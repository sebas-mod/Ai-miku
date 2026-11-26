/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'setrulesgrup',
    alias: ['setgrouprules', 'setaturangrup'],
    category: 'group',
    description: 'Set rules/aturan grup custom (admin only)',
    usage: '.setrulesgrup <text>',
    example: '.setrulesgrup 1. Jangan spam\n2. Hormati sesama',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')

    if (!text) {
        return m.reply(
            `📝 *REGLAS DEL GRUPO*\n\n` +
            `> Envía el nuevo texto de las reglas\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}setrulesgrup 1. No hagas spam
2. Hormati sesama\``
        )
    }

    db.setGroup(m.chat, { groupRules: text })

    m.reply(
        `✅ *REGLAS DEL GRUPO ACTUALIZADAS*\n\n` +
        `¡Las reglas del grupo se han actualizado!\n` +
        `Escribe \`${m.prefix}rulesgrup\` para verlas.`
    )
}

export { pluginConfig as config, handler }
