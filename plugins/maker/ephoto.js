/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "ephoto",
    alias: [],
    category: "maker",
    description: "ephoto",
    usage: ".ephoto",
    example: ".ephoto",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const EFFECTS = [
      'glitchtext',
      'writetext',
      'advancedglow',
      'typographytext',
      'pixelglitch',
      'neonglitch',
      'flagtext',
      'flag3dtext',
      'deletingtext',
      'blackpinkstyle',
      'glowingtext',
      'underwatertext',
      'logomaker',
      'cartoonstyle',
      'papercutstyle',
      'watercolortext',
      'effectclouds',
      'blackpinklogo',
      'gradienttext',
      'summerbeach',
      'luxurygold',
      'multicoloredneon',
      'sandsummer',
      'galaxywallpaper',
      '1917style',
      'makingneon',
      'royaltext',
      'freecreate',
      'galaxystyle',
      'amongustext',
      'rainytext',
      'lighteffects',
  ]

  async function handler(m, { reply, prefix }) {
      const list = EFFECTS.map(e => `• \`${prefix}${e}\``).join('\n')

      return reply(
          `🎨 *EFECTOS EPHOTO*\n\n` +
          ` > ¡Crea efectos de texto geniales!\n\n` +
          `╭┈┈⬡「 📋 *LISTA DE EFECTOS* 」\n${list}\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> *Ejemplo:* ${prefix}glitchtext Elysia Assistant`
      )
  }

export { pluginConfig as config, handler }
