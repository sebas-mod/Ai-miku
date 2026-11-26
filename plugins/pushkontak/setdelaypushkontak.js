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
    name: "setdelaypushkontak",
    alias: [],
    category: "pushkontak",
    description: "Fitur pushkontak setdelaypushkontak",
    usage: ".setdelaypushkontak",
    example: ".setdelaypushkontak",
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
      if (isNaN(ms) || ms < 500) return example('<ms>  (minimal 500, contoh: 2000)')
      jpmSetCfg('delayPushKontak', ms)
      return reply(`*▢ DELAY PUSH KONTAK*\n• Delay : ${ms}ms\n• Status : Berhasil diubah`)
  }

export { pluginConfig as config, handler }
