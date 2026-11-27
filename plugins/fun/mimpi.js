/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
/**
 * Mimpi / Dream World - Fun dream interpretation generator
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'mimpi',
    alias: ['dream', 'dreamworld'],
    category: 'fun',
    description: 'Explora el mundo de tus sueños según tu nombre',
    usage: '.mimpi <nombre>',
    example: '.mimpi Keisya',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const DREAM_LEVELS = ['Lúcido ✨', 'Místico 🌟', 'Etéreo 💫', 'Divino 🌙', 'Legendario 🎇']
const DREAM_QUALITIES = ['Tranquilo 😌', 'Aventura 🚀', 'Místico 🔮', 'Profecía 📖', 'Épico 🗺️']

const ELEMENTS = [
    '🌊 Océano de Cristal Luminoso',
    '🌈 Arcoíris Flotante',
    '🌺 Jardín Flotante',
    '⭐ Constelación Viva',
    '🌙 Luna Doble',
    '🏰 Castillo en las Nubes',
    '🌋 Montaña Prisma',
    '🎭 Teatro de Sombras'
]

const EVENTS = [
    '🦋 Una mariposa trae un mensaje secreto',
    '🎭 Máscaras que bailan solas',
    '🌊 Lluvia de estrellas sobre el mar',
    '🎪 Desfile de criaturas mágicas',
    '🌺 Flores que cantan canciones antiguas',
    '🎨 Pinturas que cobran vida',
    '🎵 La música se ve como colores',
    '⚡ Rayos que forman una escalera al cielo'
]

const ENCOUNTERS = [
    '🐉 Dragón Arcoíris Sabio',
    '🧙‍♂️ Mago de las Estrellas',
    '🦊 Zorro Espíritu de Nueve Colas',
    '🧝‍♀️ Hada de los Sueños',
    '🦁 León de Cristal',
    '🐋 Ballena Voladora Mística',
    '🦅 El Ave Fénix del Tiempo',
    '🐢 Tortuga que Sostiene el Mundo',
    '🦄 Unicornio Dimensional'
]

const POWERS = [
    '✨ Controlar el tiempo',
    '🌊 Hablar con los elementos',
    '🎭 Cambiar de forma',
    '🌈 Manipulación de la Realidad',
    '👁️ Ver el futuro',
    '🎪 Teletransporte Dimensional',
    '🌙 Sanación Espiritual',
    '⚡ Energía Cósmica'
]

const MESSAGES = [
    'Tu viaje traerá un gran cambio',
    'Un secreto antiguo saldrá a la luz muy pronto',
    'Un poder oculto despertará pronto',
    'Un nuevo destino te espera en el horizonte',
    'Tu conexión espiritual se hará más fuerte',
    'Ocurrirá una gran transformación',
    'La claridad llegará de donde menos lo esperas',
    'Una misión importante está a punto de comenzar'
]

function generateDream(seed) {
    const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)

    const pick = (arr) => arr[seedNum % arr.length]
    const pickMulti = (arr, count) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, count)
    }

    return {
        level: pick(DREAM_LEVELS),
        quality: pick(DREAM_QUALITIES),
        elements: pickMulti(ELEMENTS, 3),
        events: pickMulti(EVENTS, 2),
        encounters: pickMulti(ENCOUNTERS, 2),
        powers: pickMulti(POWERS, 2),
        message: pick(MESSAGES)
    }
}

async function handler(m, { sock }) {
    const args = m.args || []
    let name = args.join(' ') || m.pushName || m.sender.split('@')[0]

    await m.react('🌙')
    await m.reply('🌙 *Memasuki alam mimpi...*')
    await new Promise(r => setTimeout(r, 1500))

    const dream = generateDream(name)

    let txt = `╭═══❯ *🌙 DREAM WORLD* ❮═══\n`
    txt += `│ 👤 *Explorer:* ${name}\n`
    txt += `│ ⭐ *Level:* ${dream.level}\n`
    txt += `│ 💫 *Quality:* ${dream.quality}\n`
    txt += `│ 🌈 *Elements:*\n`
    for (const el of dream.elements) {
        txt += `│ ├ ${el}\n`
    }
    txt += `│ 🎪 *Events:*\n`
    for (const ev of dream.events) {
        txt += `│ ├ ${ev}\n`
    }
    txt += `│ 🌟 *Encounters:*\n`
    for (const enc of dream.encounters) {
        txt += `│ ├ ${enc}\n`
    }
    txt += `│ 💫 *Powers:*\n`
    for (const pow of dream.powers) {
        txt += `│ ├ ${pow}\n`
    }
    txt += `│ 🔮 *Message:*\n`
    txt += `│ ${dream.message}\n`
    txt += `╰════════════════════`

    await m.reply(txt)
}

export { pluginConfig as config, handler }
