/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const jpmGroups = MikuRuntime.jpmGroups;
const jpmCfg = MikuRuntime.jpmCfg;
const jpmLoop = MikuRuntime.jpmLoop;
const jpmStartJob = MikuRuntime.jpmStartJob;
const getMedia = MikuRuntime.getMedia;
const mediaContent = MikuRuntime.mediaContent;
const splitInterval = MikuRuntime.splitInterval;
const JPM_MIN_INTERVAL = MikuRuntime.JPM_MIN_INTERVAL;

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
      if (!teks && !media) return example('5m mensajes de transmisión automática (intervalo: 30s / 5m / 1h / 60000)')
      if (interval < JPM_MIN_INTERVAL) return reply(`❌ Intervalo mínimo ${JPM_MIN_INTERVAL / 1000} segundo.`)

      const delay = jpmCfg().delayJpm
      await reply(`*▢ AUTO JPM AKTIF*\n• Intervalo: cada ${interval / 1000} segundo\n• Retraso entre grupos: ${delay}EM\n• Mensaje: ${teks || '[Media]'}\n\nParar con *stopautojpm*`)

      jpmStartJob('autoJpm', interval, async isStopped => {
          const groups = await jpmGroups(sock, { auto: true })
          await jpmLoop(groups, delay, g =>
              sock.sendMessage(g.id, media ? mediaContent(media, teks) : { text: teks }), isStopped)
      })
  }

export { pluginConfig as config, handler }
