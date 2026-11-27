/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "cekoperator",
    alias: ["operator"],
    category: "tools",
    description: "cekoperator",
    usage: ".cekoperator",
    example: ".cekoperator",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

export const PREFIX = {
    Telkomsel: {
        '0811': 'Halo', '0812': 'simPATI', '0813': 'simPATI', '0821': 'simPATI', '0822': 'simPATI',
        '0823': 'Kartu AS', '0851': 'by.U', '0852': 'Kartu AS', '0853': 'Kartu AS'
    },
    'Indosat Ooredoo': {
        '0814': 'Matrix / Mentari', '0815': 'Mentari', '0816': 'Mentari',
        '0855': 'IM3', '0856': 'IM3', '0857': 'IM3', '0858': 'Mentari'
    },
    XL: {
        '0817': 'XL', '0818': 'XL', '0819': 'XL', '0859': 'XL', '0877': 'XL', '0878': 'XL'
    },
    Axis: {
        '0831': 'Axis', '0832': 'Axis', '0833': 'Axis', '0838': 'Axis'
    },
    Tri: {
        '0895': '3 (Tri)', '0896': '3 (Tri)', '0897': '3 (Tri)', '0898': '3 (Tri)', '0899': '3 (Tri)'
    },
    Smartfren: {
        '0881': 'Smartfren', '0882': 'Smartfren', '0883': 'Smartfren', '0884': 'Smartfren',
        '0885': 'Smartfren', '0886': 'Smartfren', '0887': 'Smartfren', '0888': 'Smartfren', '0889': 'Smartfren'
    }
}

function normalize(input) {
    let n = String(input).replace(/[^\d+]/g, '')
    if (n.startsWith('+')) n = n.slice(1)
    if (n.startsWith('62')) n = '0' + n.slice(2)
    else if (n.startsWith('8')) n = '0' + n
    return n
}

export function operatorOf(input) {
    const number = normalize(input)
    if (!/^08\d{8,12}$/.test(number)) return '-'
    const prefix = number.slice(0, 4)
    for (const [name, list] of Object.entries(PREFIX)) if (list[prefix]) return name
    return '-'
}

async function handler(m, { text, reply, example }) {
    if (!String(text || '').trim()) return example('08123456789')

    const number = normalize(text)
    if (!/^08\d{8,12}$/.test(number)) {
        return reply('Número no válido. Escribe un número de Indonesia, por ejemplo 08123456789 o 628123456789')
    }

    const prefix = number.slice(0, 4)
    let operator = null
    let kartu = null
    for (const [name, list] of Object.entries(PREFIX)) {
        if (list[prefix]) { operator = name; kartu = list[prefix]; break }
    }

    if (!operator) {
        return reply(`El prefijo *${prefix}* no está en los datos de operadores.\n\nPuede que sea de un operador pequeño o un prefijo nuevo.`)
    }

    return reply(
        `📱 *CEK OPERATOR*\n\n` +
        `Número: ${number}\n` +
        `Formato: +62${number.slice(1)}\n` +
        `Prefix   : ${prefix}\n` +
        `Operator : *${operator}*\n` +
        `Kartu    : ${kartu}\n\n` +
        `_Basado en el prefijo inicial. Los números que cambiaron de operador (portabilidad) pueden no coincidir con este resultado._`
    )
}

export { pluginConfig as config, handler }
