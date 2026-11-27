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
const getMedia = MikuRuntime.getMedia;
const mediaContent = MikuRuntime.mediaContent;

const pluginConfig = {
    name: "jpm",
    alias: ["broadcastgrup"],
    category: "jpm",
    description: "Fitur jpm jpm",
    usage: ".jpm",
    example: ".jpm",
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
      if (!text && !media) return example('mensaje del transmisor (o contestador foto/video + titulo)')

      const groups = await jpmGroups(sock)
      const delay = jpmCfg().delayJpm
      await reply(`*▢ ENVIANDO JPM*\n• Grupo total: ${groups.length}\n• Tipo: ${media ? 'Media + Texto' : 'Texto'}\n• Retardo: ${delay}ms`)

      const { ok, fail } = await jpmLoop(groups, delay, g =>
          sock.sendMessage(g.id, media ? mediaContent(media, text) : { text }))

      return reply(`*▢ JPM TERMINADO*\n• Correctos: ${ok} grupo\n• Fallidos: ${fail} grupo`)
  }

export { pluginConfig as config, handler }
