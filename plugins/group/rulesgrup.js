/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js"

const pluginConfig = {
    name: "rulesgrup",
    alias: ["grouprules", "aturangrup", "grules"],
    category: "group",
    description: "Menampilkan rules dan aturan grup secara lengkap",
    usage: ".rulesgrup",
    example: ".rulesgrup",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

const DEFAULT_GROUP_RULES = `📜 *REGLAS DEL GRUPO*

¡Bienvenido a este grupo! Para que el ambiente siga siendo agradable y cómodo para todos los miembros, respeta estas normas.

🔹 *ETIQUETA AL COMUNICARSE*

- Usa un *lenguaje respetuoso* y trátate bien con los demás. No se toleran insultos ni discursos de odio.
- Prohibido hacer *spam* de mensajes repetidos, incluidos stickers, imágenes y notas de voz en exceso.
- Prohibido difundir *contenido discriminatorio, pornográfico o violento* en cualquier forma.
- No *insultes, acoses ni avergüences* a los demás miembros del grupo.

🔹 *CONTENIDO Y ENLACES*

- Prohibido *promocionar* productos, servicios o cuentas de redes sociales sin permiso de los administradores.
- Prohibido *difundir enlaces* sin la aprobación de los administradores, incluidos enlaces a otros grupos de WhatsApp.
- Prohibido difundir *noticias falsas* o información sin verificar.
- Prohibido enviar *documentos o archivos sospechosos* que puedan contener virus.

🔹 *USO DEL BOT*

- Usa los comandos del bot *con moderación*, sin spamearlos.
- *Respeta las instrucciones de los administradores* en todo momento. Su decisión es definitiva.
- Si tienes un problema, coméntalo con los administradores en privado, no en el grupo.

🔹 *CONSECUENCIAS*

- Las faltas leves reciben un *aviso* de los administradores.
- Las faltas graves o repetidas suponen la *expulsión* del grupo.
- Los administradores pueden expulsar a un miembro en cualquier momento sin previo aviso.

_Al unirte a este grupo, se considera que aceptas todas estas reglas._`

async function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customRules = groupData.groupRules
    const rulesText = customRules || DEFAULT_GROUP_RULES

    await m.reply(rulesText)
}

export { pluginConfig as config, handler, DEFAULT_GROUP_RULES }
