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
    name: "faktaunik",
    alias: [],
    category: "tools",
    description: "faktaunik",
    usage: ".faktaunik",
    example: ".faktaunik",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const facts = [
    'La miel pura es el único alimento que nunca caduca, ¡ni siquiera después de miles de años!',
    'El corazón de la ballena azul es del tamaño de un coche pequeño y su latido se oye a 3 kilómetros de distancia. 🐋',
    'Los gatos pasan cerca del 70% de su vida durmiendo. ( ˘͈ ᵕ ˘͈ ) 🐱',
    'Las hormigas nunca duermen y no tienen pulmones. 🐜',
    'Las huellas dactilares de los koalas se parecen tanto a las humanas que cuesta distinguirlas al microscopio. 🐨',
    'El agua caliente se congela más rápido que la fría (efecto Mpemba). ❄️',
    'Los pulpos tienen 3 corazones y su sangre es azul. 🐙',
    'Una cucharadita de una estrella de neutrones pesa unos 6.000 millones de toneladas. 🌌',
    'Botánicamente el plátano es una baya, ¡y la fresa no!',
    'Las mariposas saborean con las patas. 🦋'
  ]

  async function handler(m) {
    const item = facts[Math.floor(Math.random() * facts.length)]
    await m.reply(
      `╭─── ୨୧ DATO CURIOSO ୨୧ ───╮\n` +
      `│ ૮₍˶ᵔ ᵕ ᵔ˶₎ა ¿lo sabías?\n` +
      `╰─────────────────────────╯\n\n` +
      `୨ৎ *Dato del mundo:*\n${item}\n\n` +
      `꒰ა ♡ ໒꒱ nuevos conocimientos con ${global.namebot}!`
    )
  }

export { pluginConfig as config, handler }
