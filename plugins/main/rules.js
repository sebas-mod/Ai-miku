/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js"
import { getDatabase } from "../../src/lib/data/database.js"

const pluginConfig = {
    name: "rules",
    alias: ["aturanbot", "botrules", "peraturanbot"],
    category: "main",
    description: "Muestra las reglas y normas de uso del bot completas",
    usage: ".rules",
    example: ".rules",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

function buildDefaultRules(botName, prefix) {
    return `📜 *REGLAS DE ${botName.toUpperCase()}*

¡Hola! Antes de usar todas las funciones disponibles, asegúrate de entender y respetar estas reglas. Están pensadas para que todos los usuarios estén cómodos y el bot funcione sin problemas.

🔹 *REGLAS GENERALES*

- Está totalmente prohibido hacer *spam de comandos* repetidamente en poco tiempo. El sistema anti-spam está activo y el bot puede banear automáticamente a quien lo haga.
- Usa todas las funciones del bot con *criterio y responsabilidad*. No abuses de las funciones para perjudicar a otras personas.
- Está prohibido usar el bot para difundir *contenido discriminatorio, discursos de odio o contenido ilegal* en cualquier forma.
- *Respeta a los demás usuarios* del bot. No uses las funciones para molestar, acosar o perjudicar a otros.
- No envíes *contenido NSFW* en grupos sin la autorización previa de los administradores.

🔹 *REGLAS DE USO DE LAS FUNCIONES*

- Cada comando consume *energía*. Úsala con criterio para que no se agote enseguida.
- Las funciones *premium* solo están disponibles para quienes tienen suscripción. Escribe *${prefix}benefitpremium* para más información.
- Si encuentras un *bug o error*, avisa al dueño del bot con *${prefix}owner*. No lo aproveches.
- Está prohibido *pedir funciones sin sentido* o presionar al dueño para que añada algo concreto.

🔹 *CONSECUENCIAS DE UN INCUMPLIMIENTO*

- Un incumplimiento leve recibirá un *aviso* de un administrador o del dueño
- Un incumplimiento grave o repetido puede provocar el *baneo permanente* del bot
- El dueño puede decidir la sanción sin avisar antes

_Al usar este bot, se entiende que has leído y aceptas todas las reglas anteriores._`
}

async function handler(m) {
    const db = getDatabase()
    const botName = config.bot?.name || "Ai Miku"
    const customRules = db.setting("botRules")

    let rulesText
    if (customRules && typeof customRules === "string" && customRules.trim().length > 0) {
        rulesText = customRules
    } else if (Array.isArray(customRules) && customRules.length > 0) {
        rulesText = `📜 *REGLAS DE ${botName.toUpperCase()}*\n\n`
        customRules.forEach((rule, i) => {
            rulesText += `${i + 1}. ${rule}\n`
        })
    } else {
        rulesText = buildDefaultRules(botName, m.prefix)
    }

    await m.reply(rulesText)
}

export { pluginConfig as config, handler }
