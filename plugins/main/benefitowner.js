/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getAllPlugins } from '../../src/lib/core/plugins.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'benefitowner',
    alias: ['ownerbenefits', 'ownerfitur'],
    category: 'main',
    description: 'Ver la explicación y la lista de funciones exclusivas del dueño',
    usage: '.benefitowner',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const ownerCommands = plugins.filter(p => p.config.isOwner && p.config.isEnabled)

    const seen = new Set()
    const commandList = []
    for (const p of ownerCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()

    const totalCommands = commandList.length

    const message =
        `👑 *¿ǫᴜᴇ ᴇs ᴇʟ ᴅᴜᴇñᴏ?*\n\n` +
        `El dueño es *la persona propietaria del bot*, con acceso total a todas las funciones y al control del sistema.\n\n` +
        `╭┈┈⬡「 🔐 *ᴘʀɪᴠɪʟᴇɢɪᴏs ᴅᴇʟ ᴅᴜᴇñᴏ* 」\n` +
        `┃ ✦ \`\`\`Acceso a todos los comandos sin restricciones\`\`\`\n` +
        `┃ ✦ \`\`\`Límite ilimitado (-1)\`\`\`\n` +
        `┃ ✦ \`\`\`Se salta todos los cooldowns\`\`\`\n` +
        `┃ ✦ \`\`\`Control total del sistema del bot\`\`\`\n` +
        `┃ ✦ \`\`\`Gestión de usuarios y grupos\`\`\`\n` +
        `┃ ✦ \`\`\`Acceso al panel y al servidor\`\`\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *ᴄᴏ́ᴍᴏ ꜰᴜɴᴄɪᴏɴᴀ* 」\n` +
        `┃ \`El dueño se añade con:\`\n` +
        `┃ • \`\`\`${config.command?.prefix || '.'}addowner <número>\`\`\`\n` +
        `┃ • O directamente en config.js\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *ᴄᴏᴍᴀɴᴅᴏs ᴅᴇʟ ᴅᴜᴇñᴏ* 」\n` +
        `┃ \`Total: ${totalCommands} comandos\`\n` +
        `┃\n` +
        commandList.map(cmd => `┃ ${cmd}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> ¡Contacta al dueño para obtener acceso!`

    await m.reply(message)
}

export { pluginConfig as config, handler }
