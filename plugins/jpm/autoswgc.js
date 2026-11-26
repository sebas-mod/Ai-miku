/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const jpmCfg = ElysiaRuntime.jpmCfg;
const jpmStartJob = ElysiaRuntime.jpmStartJob;
const getMedia = ElysiaRuntime.getMedia;
const sendGroupStatus = ElysiaRuntime.sendGroupStatus;

const pluginConfig = {
    name: "autoswgc",
    alias: [],
    category: "jpm",
    description: "Fitur jpm autoswgc",
    usage: ".autoswgc",
    example: ".autoswgc",
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, jid, text, reply, example }) {
      const media = await getMedia(m, ['image', 'video', 'audio'])
      const caption = text || media?.caption || m.quoted?.text || ''
      if (!caption && !media) return example('teks  (atau reply foto/video/audio)')

      const delay = jpmCfg().delayAutoSwgc
      await reply(`*▢ AUTO SWGC AKTIF*\n• Grup : ${jid}\n• Interval : setiap ${delay / 1000} detik\n\nHentikan dengan *stopswgc*`)

      jpmStartJob('autoSwgc', delay, async () => {
          await sendGroupStatus(sock, jid, { text: caption, media })
      })
  }

export { pluginConfig as config, handler }
