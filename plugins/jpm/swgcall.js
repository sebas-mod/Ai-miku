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
const sendGroupStatus = MikuRuntime.sendGroupStatus;

const pluginConfig = {
    name: "swgcall",
    alias: [],
    category: "jpm",
    description: "Fitur jpm swgcall",
    usage: ".swgcall",
    example: ".swgcall",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, reply, example }) {
      if (global.__jpmRunning) return reply('❌ Masih ada proses JPM/SWGC yang berjalan. Tunggu selesai atau ketik *stopjpm*.')

      const media = await getMedia(m, ['image', 'video', 'audio'])
      const caption = text || media?.caption || m.quoted?.text || ''
      if (!caption && !media) return example('teks status  (atau reply foto/video/audio)')

      const groups = await jpmGroups(sock)
      if (!groups.length) return reply('❌ Tidak ada grup yang bisa dikirimi status.')

      const delay = jpmCfg().delayJpm
      const tipe = media ? ({ image: 'Foto', video: 'Video', audio: 'Audio' }[media.kind] || 'Media') : 'Teks'
      await reply(
          `*▢ PROSES SWGC ALL*\n` +
          `• Total grup : ${groups.length}\n` +
          `• Tipe : ${tipe}\n` +
          `• Delay : ${delay}ms\n\n` +
          `Hentikan dengan *stopjpm*`
      )

      const { ok, fail } = await jpmLoop(groups, delay, g =>
          sendGroupStatus(sock, g.id, { text: caption, media }))

      return reply(
          `*▢ SWGC ALL SELESAI*\n` +
          `• Total grup : ${groups.length}\n` +
          `• Berhasil : ${ok} grup\n` +
          `• Gagal : ${fail} grup` +
          (ok + fail < groups.length ? `\n• Dilewati (dihentikan) : ${groups.length - ok - fail} grup` : '')
      )
  }

export { pluginConfig as config, handler }
