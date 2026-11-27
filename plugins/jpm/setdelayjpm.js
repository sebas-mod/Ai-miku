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
    name: "setdelayjpm",
    alias: [],
    category: "jpm",
    description: "Fitur jpm setdelayjpm",
    usage: ".setdelayjpm",
    example: ".setdelayjpm",
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
      if (isNaN(ms) || ms < 500) return example('<ms> (mínimo 500, ejemplo: 3000)')
      jpmSetCfg('delayJpm', ms)
      return reply(`*▢ DELAY JPM*\n• Demora: ${ms}EM\n• Estado: cambiado correctamente`)
  }

export { pluginConfig as config, handler }
