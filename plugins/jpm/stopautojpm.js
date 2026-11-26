/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const jpmStopJob = ElysiaRuntime.jpmStopJob;

const pluginConfig = {
    name: "stopautojpm",
    alias: [],
    category: "jpm",
    description: "Fitur jpm stopautojpm",
    usage: ".stopautojpm",
    example: ".stopautojpm",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { reply }) {
      if (!jpmStopJob('autoJpm')) return reply('❌ Auto JPM tidak sedang berjalan.')
      return reply('*▢ AUTO JPM*\n• Status : Dihentikan')
  }

export { pluginConfig as config, handler }
