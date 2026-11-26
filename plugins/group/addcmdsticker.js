/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getQuotedStickerHash, addStickerCommand, listStickerCommands } from '../../src/lib/features/sticker-command.js'
import { getPlugin } from '../../src/lib/core/plugins.js'
const pluginConfig = {
    name: 'addcmdsticker',
    alias: ['addstickercmd', 'setsticker', 'stickeradd'],
    category: 'group',
    description: 'Jadikan sticker sebagai shortcut command',
    usage: '.addcmdsticker <command> (reply sticker)',
    example: '.addcmdsticker menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]

    // Validasi command name
    if (!commandName) {
        const existingCmds = listStickerCommands()

        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴛᴏ ᴄᴏᴍᴍᴀɴᴅ*\n\n`
        txt += `> Responde al sticker y escribe el comando que quieres usar como atajo.\n\n`
        txt += `*Ejemplo:*\n`
        txt += `> Reply sticker, y escribe:\n`
        txt += `> \`.addcmdsticker menu\`\n\n`

        if (existingCmds.length > 0) {
            txt += `╭┈┈⬡「 📋 *ACTIVO* 」\n`
            for (const cmd of existingCmds.slice(0, 10)) {
                txt += `┃ 🖼️ → \`${cmd.command}\`\n`
            }
            if (existingCmds.length > 10) {
                txt += `┃ ... y ${existingCmds.length - 10} más\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }

        return m.reply(txt)
    }

    // Validasi reply sticker
    if (!m.quoted) {
        return m.reply('⚠️ ¡*Responde al sticker* que quieres convertir en comando!')
    }

    const stickerHash = getQuotedStickerHash(m)
    if (!stickerHash) {
        return m.reply('⚠️ ¡El mensaje al que respondes no es un *sticker*!')
    }

    // Validasi command exists
    const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
    const plugin = getPlugin(cleanCmd)

    if (!plugin) {
        return m.reply(
            `❌ ¡No se encontró el comando \`${cleanCmd}\`!\n\n` +
            `> Asegúrate de que el comando que quieres usar como atajo existe.`
        )
    }

    // Add sticker command
    const success = addStickerCommand(stickerHash, cleanCmd, m.sender)

    if (success) {
        await m.react('✅')
        await m.reply(
            `✅ *COMANDO DE STICKER AÑADIDO*\n\n` +
            `> 🖼️ Sticker → \`.${cleanCmd}\`\n\n` +
            `_¡Envía ese sticker para ejecutar el comando!_`
        )
    } else {
        await m.reply('❌ ¡No se pudo guardar el comando de sticker!')
    }
}

export { pluginConfig as config, handler }
