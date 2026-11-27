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
    name: "jpmbasic",
    alias: ["jpmb", "jaser2"],
    category: "jpm",
    description: "Fitur jpm jpmbasic",
    usage: ".jpmbasic",
    example: ".jpmbasic",
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
      const pesan = text || m.quoted?.text || ''
      if (!pesan && !media) return example('mensaje del transmisor (o contestador foto/video + titulo)')
      if (global.__jpmBasicRunning) return reply('❌ JPM Básico se está ejecutando. Escriba *stopjpmbasic* para detener.')

      const groups = await jpmGroups(sock)
      if (!groups.length) return reply('❌ No hay grupos a los que acudir.')
      const delay = jpmCfg().delayJpm
      await reply(`*▢ JPM BASIC*\n• Objetivos: ${groups.length} grupo\n• Tipo: ${media ? 'Media + Teks' : 'Teks'}\n• Demora: ${delay}EM\n\nPara con *stopjpmbasic*`)

      global.__jpmBasicRunning = true
      global.__jpmBasicStop = false
      let res
      try {
          res = await jpmLoop(groups, delay, g =>
              sock.sendMessage(g.id, media ? mediaContent(media, pesan) : { text: pesan }), () => global.__jpmBasicStop)
      } finally {
          global.__jpmBasicRunning = false
          global.__jpmBasicStop = false
      }
      return reply(`*▢ JPM BASIC SELESAI*\n• Tener éxito: ${res.ok} grupo\n• Fallar: ${res.fail} grupo`)
  }

export { pluginConfig as config, handler }
