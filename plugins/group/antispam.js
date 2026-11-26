/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import te from "../../src/lib/core/error.js"

const pluginConfig = {
    name: "antispam",
    alias: ["antispamgc"],
    category: "group",
    description: "Configura la protección del grupo contra el spam abusivo de mensajes",
    usage: ".antispam <on/off/action/delay>",
    example: ".antispam on\n.antispam warning\n.antispam 2",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const spamTracker = new Map()

async function handler(m, { sock, db }) {
    const args = m.args
    const action = args[0]?.toLowerCase()
    const delayMatch = action?.match(/^(\d+)(s|ms)?$/)

    if (!action || (!["on", "off", "warning", "kick", "delete"].includes(action) && !delayMatch)) {
        return m.reply(
            `🛡️ *ANTI SPAM GROUP*\n\n` +
            `Esta función protege al grupo de los miembros que envían mensajes repetidos muy rápido y de forma abusiva, molestando a los demás\n\n` +
            `*Cómo usar:*\n` +
            `> \`${m.prefix}antispam on\` (Activa el antispam)\n` +
            `> \`${m.prefix}antispam off\` (Desactiva el antispam)\n\n` +
            `*Elige el método de castigo:*\n` +
            `> \`${m.prefix}antispam warning\` (Amonesta hasta 3 veces)\n` +
            `> \`${m.prefix}antispam kick\` (Expulsa al spammer al instante y sin piedad)\n` +
            `> \`${m.prefix}antispam delete\` (Borra todos los mensajes de spam enviados)\n\n` +
            `*Atur Sensitivitas Jeda (Delay):*\n` +
            `> \`${m.prefix}antispam 2\` (Fija un máximo de 2 segundos entre mensajes)\n` +
            `> \`${m.prefix}antispam 1500\` (Set jarak ke 1500 milidetik)`
        )
    }

    const groupData = db.getGroup(m.chat) || {}

    if (delayMatch) {
        let delayMs = parseInt(delayMatch[1])
        if (delayMatch[2] === "s" || (delayMs >= 1 && delayMs <= 10)) {
            delayMs = delayMs * 1000
        }

        if (delayMs < 500) delayMs = 500
        if (delayMs > 10000) delayMs = 10000

        groupData.antispamDelay = delayMs
        db.setGroup(m.chat, groupData)

        return m.reply(
            `🛡️ *SENSITIVITAS ANTI SPAM DIPERBARUI*\n\n` +
            `> Espera máxima: *${delayMs} ms* (${(delayMs/1000).toFixed(1)} segundos)\n\n` +
            `Ahora el sistema considerará spam cuando un miembro envíe varios mensajes con menos de *${(delayMs/1000).toFixed(1)} segundos* entre ellos`
        )
    }

    if (action === "on" || action === "off") {
        const isEnable = action === "on"
        if (groupData.antispam === isEnable) {
            return m.reply(`✅ La función antispam ya estaba ${isEnable ? "activada" : "desactivada"} en este grupo, no se hizo ningún cambio`)
        }

        groupData.antispam = isEnable
        db.setGroup(m.chat, groupData)

        await m.reply(
            `🛡️ *ANTI SPAM DIPERBARUI*\n\n` +
            `> Estado: *${isEnable ? "ACTIVO ✅" : "INACTIVO ❌"}*\n\n` +
            `El bot ahora ${isEnable ? "vigilará de cerca" : "dejará de vigilar"} cualquier spam o flood de mensajes de los miembros de este grupo`
        )
    } else {
        groupData.antispamAction = action
        db.setGroup(m.chat, groupData)

        let textAction = ""
        if (action === "warning") textAction = "Aplicar avisos progresivos"
        if (action === "kick") textAction = "Expulsar automáticamente al miembro reincidente"
        if (action === "delete") textAction = "Borrar los mensajes de spam"

        await m.reply(
            `🛡️ *AKSI ANTI SPAM DIPERBARUI*\n\n` +
            `> Metode Hukuman: *${action.toUpperCase()}*\n\n` +
            `El bot aplicará directamente *${textAction}* si detecta que un miembro está haciendo spam abusivo`
        )
    }
}

async function checkSpam(m, sock, db) {
    if (!m.isGroup || m.isAdmin || m.isOwner || m.fromMe) return false

    const groupData = db.getGroup(m.chat)
    if (!groupData || !groupData.antispam) return false

    const senderId = m.sender
    const chatKey = `${m.chat}_${senderId}`
    const now = Date.now()
    const delayThreshold = groupData.antispamDelay || 2000

    const userData = spamTracker.get(chatKey) || { count: 0, lastMessage: 0, warnings: 0 }

    if (now - userData.lastMessage < delayThreshold) {
        userData.count += 1
    } else {
        if (now - userData.lastMessage > delayThreshold + 1000) {
            userData.count = 1
        } else {
            userData.count = Math.max(1, userData.count - 1)
        }
    }

    userData.lastMessage = now
    spamTracker.set(chatKey, userData)

    if (userData.count >= 5) {
        return true
    }

    return false
}

async function handleSpamAction(m, sock, db) {
    const groupData = db.getGroup(m.chat)
    const action = groupData.antispamAction || "warning"
    const senderId = m.sender
    const chatKey = `${m.chat}_${senderId}`
    const userData = spamTracker.get(chatKey)

    if (action === "warning") {
        userData.warnings += 1
        spamTracker.set(chatKey, userData)

        if (userData.warnings >= 3) {
            await m.reply(
                `⚠️ *AVISOS DE SPAM AL MÁXIMO*\n\n` +
                `> Para: @${senderId.split("@")[0]}\n\n` +
                `Has recibido 3 avisos por enviar spam de forma continua. ¡Deja de hacer spam o los administradores del grupo podrán tomar medidas contundentes contra esta infracción!`,
                { mentions: [senderId] }
            )
            userData.warnings = 0
            userData.count = 0
            spamTracker.set(chatKey, userData)
        } else {
            await m.reply(
                `⚠️ *AVISO DE SPAM DETECTADO*\n\n` +
                `> Aviso ${userData.warnings} de un máximo de 3\n\n` +
                `Hola @${senderId.split("@")[0]}, ¡no envíes mensajes repetidos rápidamente en este grupo! Nuestro sistema detectó tu actividad como spam. Respeta la comodidad de los demás miembros`,
                { mentions: [senderId] }
            )
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "kick") {
        if (m.isBotAdmin) {
            await m.reply(
                `🛑 *SPAMMER EXPULSADO*\n\n` +
                `Lo sentimos, @${senderId.split("@")[0]}: el sistema va a expulsarte porque detectó que hiciste spam abusivo en este grupo.`,
                { mentions: [senderId] }
            )
            await sock.groupParticipantsUpdate(m.chat, [senderId], "remove")
            spamTracker.delete(chatKey)
        } else {
            await m.reply(
                `⚠️ *SPAM DETECTADO*\n\n` +
                `Se detectó spam abusivo de @${senderId.split("@")[0]}, pero el bot no puede expulsarlo porque ahora mismo no es administrador del grupo. Hazlo admin para que esta función trabaje al máximo.`,
                { mentions: [senderId] }
            )
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "delete") {
        if (m.isBotAdmin) {
            await sock.sendMessage(m.chat, { delete: m.key })
        } else {
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    }
}

export { pluginConfig as config, handler, checkSpam, handleSpamAction }
