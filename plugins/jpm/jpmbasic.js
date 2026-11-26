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
const getMedia = ElysiaRuntime.getMedia;
const mediaContent = ElysiaRuntime.mediaContent;

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
      if (!pesan && !media) return example('pesan broadcast  (atau reply foto/video + caption)')
      if (global.__jpmBasicRunning) return reply('❌ JPM Basic sedang berjalan. Ketik *stopjpmbasic* untuk menghentikan.')

      const groups = await jpmGroups(sock)
      if (!groups.length) return reply('❌ Tidak ada grup yang bisa dituju.')
      const delay = jpmCfg().delayJpm
      await reply(`*▢ JPM BASIC*\n• Target : ${groups.length} grup\n• Tipe : ${media ? 'Media + Teks' : 'Teks'}\n• Delay : ${delay}ms\n\nHentikan dengan *stopjpmbasic*`)

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
      return reply(`*▢ JPM BASIC SELESAI*\n• Berhasil : ${res.ok} grup\n• Gagal : ${res.fail} grup`)
  }

export { pluginConfig as config, handler }
