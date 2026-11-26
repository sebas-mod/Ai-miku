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
const jpmLoop = ElysiaRuntime.jpmLoop;
const jpmStartJob = ElysiaRuntime.jpmStartJob;
const getMedia = ElysiaRuntime.getMedia;
const mediaContent = ElysiaRuntime.mediaContent;
const splitInterval = ElysiaRuntime.splitInterval;
const JPM_MIN_INTERVAL = ElysiaRuntime.JPM_MIN_INTERVAL;

const pluginConfig = {
    name: "autojpm",
    alias: ["ajpm"],
    category: "jpm",
    description: "Fitur jpm autojpm",
    usage: ".autojpm",
    example: ".autojpm",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, reply, example }) {
      const media = await getMedia(m)
      const { interval, teks } = splitInterval(text)
      if (!teks && !media) return example('5m pesan auto broadcast  (interval: 30s / 5m / 1h / 60000)')
      if (interval < JPM_MIN_INTERVAL) return reply(`❌ Interval minimal ${JPM_MIN_INTERVAL / 1000} detik.`)

      const delay = jpmCfg().delayJpm
      await reply(`*▢ AUTO JPM AKTIF*\n• Interval : setiap ${interval / 1000} detik\n• Delay antar grup : ${delay}ms\n• Pesan : ${teks || '[Media]'}\n\nHentikan dengan *stopautojpm*`)

      jpmStartJob('autoJpm', interval, async isStopped => {
          const groups = await jpmGroups(sock, { auto: true })
          await jpmLoop(groups, delay, g =>
              sock.sendMessage(g.id, media ? mediaContent(media, teks) : { text: teks }), isStopped)
      })
  }

export { pluginConfig as config, handler }
