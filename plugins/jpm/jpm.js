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
      if (!text && !media) return example('pesan broadcast  (atau reply foto/video + caption)')

      const groups = await jpmGroups(sock)
      const delay = jpmCfg().delayJpm
      await reply(`*▢ PROSES JPM*\n• Total grup : ${groups.length}\n• Tipe : ${media ? 'Media + Teks' : 'Teks'}\n• Delay : ${delay}ms`)

      const { ok, fail } = await jpmLoop(groups, delay, g =>
          sock.sendMessage(g.id, media ? mediaContent(media, text) : { text }))

      return reply(`*▢ JPM SELESAI*\n• Berhasil : ${ok} grup\n• Gagal : ${fail} grup`)
  }

export { pluginConfig as config, handler }
