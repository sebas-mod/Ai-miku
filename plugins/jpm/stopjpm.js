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
    name: "stopjpm",
    alias: ["stopjasher", "stopjaser"],
    category: "jpm",
    description: "Fitur jpm stopjpm",
    usage: ".stopjpm",
    example: ".stopjpm",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { reply }) {
      if (!global.__jpmRunning) return reply('❌ Tidak ada JPM yang sedang berjalan.')
      global.__jpmStop = true
      return reply('*▢ STOP JPM*\n• Status : Menghentikan proses JPM...')
  }

export { pluginConfig as config, handler }
