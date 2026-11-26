/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const jpmGroups = ElysiaRuntime.jpmGroups;
const jpmCfg = ElysiaRuntime.jpmCfg;
const jpmJobs = ElysiaRuntime.jpmJobs;

const pluginConfig = {
    name: "jpmstatus",
    alias: [],
    category: "jpm",
    description: "Fitur jpm jpmstatus",
    usage: ".jpmstatus",
    example: ".jpmstatus",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const onoff = v => (v ? '🟢 Aktif' : '🔴 Nonaktif')

  async function handler(m, { sock, reply }) {
      const jobs = jpmJobs()
      const cfg = jpmCfg()

      let total = 0
      let banned = 0
      try {
          total = Object.keys(await sock.groupFetchAllParticipating()).length
          banned = Object.values(global.db.groups || {}).filter(g => g.banned).length
      } catch {}

      return reply(
          `*▢ STATUS JPM*\n` +
          `• Auto JPM : ${onoff(jobs.autoJpm)}\n` +
          `• Auto JPM Tag : ${onoff(jobs.autoJpmTag)}\n` +
          `• Auto SWGC : ${onoff(jobs.autoSwgc)}\n` +
          `• Push Kontak : ${onoff(jobs.pushRunning)}\n` +
          `• Delay JPM : ${cfg.delayJpm}ms\n` +
          `• Delay JPM Tag : ${cfg.delayJpmTag}ms\n` +
          `• Delay Auto SWGC : ${cfg.delayAutoSwgc}ms\n` +
          `• Delay Push Kontak : ${cfg.delayPushKontak}ms\n` +
          `• Total grup : ${total} grup\n` +
          `• Grup banchat (dilewati) : ${banned} grup`
      )
  }

export { pluginConfig as config, handler }
