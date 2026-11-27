/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const jpmCfg = MikuRuntime.jpmCfg;
const jpmStartJob = MikuRuntime.jpmStartJob;
const getMedia = MikuRuntime.getMedia;
const sendGroupStatus = MikuRuntime.sendGroupStatus;

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
      if (!caption && !media) return example('texto (o foto/vídeo/audio contestador)')

      const delay = jpmCfg().delayAutoSwgc
      await reply(`*▢ AUTO SWGC AKTIF*\n• Grupo: ${jid}\n• Intervalo: cada ${delay / 1000} segundo\n\nPara con *stopswgc*`)

      jpmStartJob('autoSwgc', delay, async () => {
          await sendGroupStatus(sock, jid, { text: caption, media })
      })
  }

export { pluginConfig as config, handler }
