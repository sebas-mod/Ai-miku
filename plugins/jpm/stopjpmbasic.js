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
    name: "stopjpmbasic",
    alias: ["stopjpmb"],
    category: "jpm",
    description: "Fitur jpm stopjpmbasic",
    usage: ".stopjpmbasic",
    example: ".stopjpmbasic",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { reply }) {
      if (!global.__jpmBasicRunning) return reply('❌ Tidak ada JPM Basic yang sedang berjalan.')
      global.__jpmBasicStop = true
      return reply('*▢ STOP JPM BASIC*\n• Status : Menghentikan JPM Basic...')
  }

export { pluginConfig as config, handler }
