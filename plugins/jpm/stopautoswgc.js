/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const jpmStopJob = MikuRuntime.jpmStopJob;

const pluginConfig = {
    name: "stopautoswgc",
    alias: [],
    category: "jpm",
    description: "Fitur jpm stopautoswgc",
    usage: ".stopautoswgc",
    example: ".stopautoswgc",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { reply }) {
      if (!jpmStopJob('autoSwgc')) return reply('❌ Auto SWGC no está funcionando.')
      return reply('*▢ AUTO SWGC*\n• Status : Dihentikan')
  }

export { pluginConfig as config, handler }
