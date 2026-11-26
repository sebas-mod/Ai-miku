/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const jpmJobs = ElysiaRuntime.jpmJobs;

const pluginConfig = {
    name: "stoppush",
    alias: ["stoppushkontak", "stoppus"],
    category: "pushkontak",
    description: "Fitur pushkontak stoppush",
    usage: ".stoppush",
    example: ".stoppush",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { reply }) {
      const jobs = jpmJobs()
      if (!jobs.pushRunning) return reply('❌ Push kontak tidak sedang berjalan.')
      jobs.pushRunning = false
      return reply('*▢ PUSH KONTAK*\n• Status : Dihentikan')
  }

export { pluginConfig as config, handler }
