/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const jpmSetCfg = MikuRuntime.jpmSetCfg;

const pluginConfig = {
    name: "setdelayautoswgc",
    alias: [],
    category: "jpm",
    description: "Fitur jpm setdelayautoswgc",
    usage: ".setdelayautoswgc",
    example: ".setdelayautoswgc",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { text, reply, example }) {
      const ms = parseInt(text)
      if (isNaN(ms) || ms < 1000) return example('<ms> (mínimo 1000, ejemplo: 60000)')
      jpmSetCfg('delayAutoSwgc', ms)
      return reply(`*▢ DELAY AUTO SWGC*\n• Demora: ${ms}EM\n• Estado: cambiado correctamente\n• Información: válido para el próximo autoswgc`)
  }

export { pluginConfig as config, handler }
