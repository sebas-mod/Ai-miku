/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getAllPlugins } from '../../src/lib/core/plugins.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'benefitpremium',
    alias: ['premiumbenefits', 'premiumfitur', 'benefitprem'],
    category: 'main',
    description: 'Ver la explicación y la lista de funciones exclusivas Premium',
    usage: '.benefitpremium',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const premiumCommands = plugins.filter(p => p.config.isPremium && p.config.isEnabled)

    const seen = new Set()
    const commandList = []
    for (const p of premiumCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()

    const totalCommands = commandList.length
    const defaultLimit = config.limits?.default || 25
    const premiumLimit = config.limits?.premium || 100

    const message =
        `⭐ *¿ǫᴜᴇ ᴇs ᴘʀᴇᴍɪᴜᴍ?*\n\n` +
        `Premium es un *usuario de pago* que tiene acceso a funciones exclusivas y ventajas extra.\n\n` +
        `╭┈┈⬡「 💎 *ᴠᴇɴᴛᴀᴊᴀs ᴘʀᴇᴍɪᴜᴍ* 」\n` +
        `┃ ✦ \`\`\`Límite diario: ${premiumLimit}x (frente a ${defaultLimit}x de un usuario normal)\`\`\`\n` +
        `┃ ✦ \`\`\`Cooldown más corto\`\`\`\n` +
        `┃ ✦ \`\`\`Acceso a funciones exclusivas\`\`\`\n` +
        `┃ ✦ \`\`\`Prioridad de respuesta\`\`\`\n` +
        `┃ ✦ \`\`\`Sin marca de agua en algunas funciones\`\`\`\n` +
        `┃ ✦ \`\`\`Soporte prioritario\`\`\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *ᴄᴏ́ᴍᴏ ᴏʙᴛᴇɴᴇʀʟᴏ* 」\n` +
        `┃ \`Premium se consigue así:\`\n` +
        `┃ • Contacta al dueño del bot\n` +
        `┃ • \`\`\`${config.command?.prefix || '.'}addprem <número> <duración>\`\`\`\n` +
        `┃ • Ejemplo: .addprem 628xxx 30d\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *ᴄᴏᴍᴀɴᴅᴏs ᴘʀᴇᴍɪᴜᴍ* 」\n` +
        `┃ \`Total: ${totalCommands} comandos\`\n` +
        `┃\n` +
        (totalCommands > 0
            ? commandList.map(cmd => `┃ ${cmd}`).join('\n')
            : `┃ Todos los comandos están disponibles para usuarios normales`) +
        `\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `¿Quieres mejorar tu plan? Contacta al dueño del bot\n${config.owner.number.map(num => `- wa.me/${num}`).join('\n') }`

    await m.reply(message)
}

export { pluginConfig as config, handler }
