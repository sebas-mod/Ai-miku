/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const jpmJobs = MikuRuntime.jpmJobs;

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
      if (!jobs.pushRunning) return reply('❌ El envío de contactos no está en marcha.')
      jobs.pushRunning = false
      return reply('*▢ ENVÍO DE CONTACTOS*\n• Estado : Detenido')
  }

export { pluginConfig as config, handler }
