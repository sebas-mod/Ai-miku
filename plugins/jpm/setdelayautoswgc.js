/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const jpmSetCfg = ElysiaRuntime.jpmSetCfg;

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
      if (isNaN(ms) || ms < 1000) return example('<ms>  (minimal 1000, contoh: 60000)')
      jpmSetCfg('delayAutoSwgc', ms)
      return reply(`*▢ DELAY AUTO SWGC*\n• Delay : ${ms}ms\n• Status : Berhasil diubah\n• Info : berlaku untuk autoswgc berikutnya`)
  }

export { pluginConfig as config, handler }
