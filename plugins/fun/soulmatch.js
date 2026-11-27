/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
/**
 * Soul Match / Belahan Jiwa - Fun compatibility checker
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'soulmatch',
    alias: [],
    category: 'fun',
    description: 'Cek kecocokan jiwa dengan seseorang',
    usage: '.soulmatch nama1|nama2',
    example: '.soulmatch Raiden|Mei',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const ELEMENTS = ['Api 🔥', 'Air 💧', 'Tanah 🌍', 'Angin 🌪️', 'Petir ⚡', 'Es ❄️', 'Cahaya ✨', 'Bayangan 🌑']
const ZODIAC = ['♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo',
               '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces']
const SOUL_TYPES = [
    "Líder Valiente", "Penyeimbang Bijaksana", "Kreator Ekspresif", "Pembangun Solid",
    "Petualang Bebas", "Pelindung Setia", "Pemikir Mistis", "Penakluk Kuat", "Humanitarian Murni"
]

function generateSoulData(name, seed) {
    const nameVal = Array.from(name.toLowerCase()).reduce((a, c) => a + c.charCodeAt(0), 0)
    return {
        element: ELEMENTS[(nameVal + seed) % ELEMENTS.length],
        zodiac: ZODIAC[(nameVal + seed * 2) % ZODIAC.length],
        soulType: SOUL_TYPES[(nameVal + seed * 3) % SOUL_TYPES.length]
    }
}

function getMatchDescription(score) {
    if (score >= 90) return "💫 Takdir Sejati"
    if (score >= 80) return "✨ Harmoni Sempurna"
    if (score >= 70) return "🌟 Koneksi Kuat"
    if (score >= 60) return "⭐ Buen Potencial"
    if (score >= 50) return "🌙 Perlu Perjuangan"
    return "🌑 Tantangan Berat"
}

function getReading(score) {
    if (score >= 80) {
        return "Vuestras almas tienen una conexión muy especial y poco común. El destino ha planeado este encuentro."
    } else if (score >= 60) {
        return "Hay una química fuerte entre vosotros. Vuestras diferencias crean armonía."
    } else if (score >= 40) {
        return "Necesitáis tiempo para entenderos. Cada desafío fortalecerá vuestro vínculo."
    }
    return "Diferencia significativa en la energía de las almas. Hará falta mucha adaptación y comprensión."
}

async function handler(m, { sock }) {
    const args = m.args || []
    const text = args.join(' ')

    if (!text || !text.includes('|')) {
        return m.reply(
            `💫 *sᴏᴜʟ ᴍᴀᴛᴄʜ*\n\n` +
            `> ¡Comprueba la compatibilidad de almas de 2 personas!\n\n` +
            `*Format:*\n` +
            `> \`.soulmatch nombre1|nombre2\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`.soulmatch Raiden|Mei\``
        )
    }

    const [nama1, nama2] = text.split('|').map(n => n.trim())

    if (!nama1 || !nama2) {
        return m.reply(`❌ Escribe 2 nombres con el formato: \`${m.prefix}soulmatch nombre1|nombre2\``)
    }

    await m.react('🕕')

    const seed1 = Date.now() % 100
    const seed2 = (Date.now() + 50) % 100
    const soul1 = generateSoulData(nama1, seed1)
    const soul2 = generateSoulData(nama2, seed2)
    const combined = nama1.toLowerCase() + nama2.toLowerCase()
    const baseScore = Array.from(combined).reduce((a, c) => a + c.charCodeAt(0), 0)
    const compatibility = (baseScore % 51) + 50
    let txt = `╭═══❯ *💫 SOUL MATCH* ❮═══\n`
    txt += `│\n`
    txt += `│ 👤 *${nama1}*\n`
    txt += `│ ├ 🔮 Soul: ${soul1.soulType}\n`
    txt += `│ ├ 🌟 Element: ${soul1.element}\n`
    txt += `│ └ 🎯 Zodiac: ${soul1.zodiac}\n`
    txt += `│\n`
    txt += `│ 👤 *${nama2}*\n`
    txt += `│ ├ 🔮 Soul: ${soul2.soulType}\n`
    txt += `│ ├ 🌟 Element: ${soul2.element}\n`
    txt += `│ └ 🎯 Zodiac: ${soul2.zodiac}\n`
    txt += `│\n`
    txt += `│ 💕 *COMPATIBILITY*\n`
    txt += `│ ├ 📊 Score: *${compatibility}%*\n`
    txt += `│ └ 🎭 Status: ${getMatchDescription(compatibility)}\n`
    txt += `│\n`
    txt += `│ 🔮 *Reading:*\n`
    txt += `│ ${getReading(compatibility)}\n`
    txt += `│\n`
    txt += `╰════════════════════`
    await m.reply(txt)
    m.react('✅')
}

export { pluginConfig as config, handler }
