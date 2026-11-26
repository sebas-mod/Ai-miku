/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const getMeta = ElysiaRuntime.getMeta;
const jpmCfg = ElysiaRuntime.jpmCfg;
const jpmJobs = ElysiaRuntime.jpmJobs;
const jpmLoop = ElysiaRuntime.jpmLoop;
const memberJids = ElysiaRuntime.memberJids;

const pluginConfig = {
    name: "pushkontak2",
    alias: ["puskontak2", "push2"],
    category: "pushkontak",
    description: "Fitur pushkontak pushkontak2",
    usage: ".pushkontak2",
    example: ".pushkontak2",
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const randomKode = (n = 6) => Array.from({ length: n }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')

  async function handler(m, { sock, jid, text, reply, example }) {
      const [pesan, nama] = String(text || '').split('|').map(s => s.trim())
      if (!pesan || !nama) return example('Halo semuanya!|TokoBaru   (format: pesan|namakontak)')

      const jobs = jpmJobs()
      if (jobs.pushRunning) return reply('❌ Push kontak sedang berjalan. Ketik *stoppush* untuk menghentikan.')

      const members = (await memberJids(sock, await getMeta(sock, jid, true))).filter(id => id !== m.sender)
      if (!members.length) return reply('❌ Tidak ada member yang bisa dituju di grup ini.')

      const delay = jpmCfg().delayPushKontak
      jobs.pushRunning = true
      await reply(`*▢ PUSH KONTAK 2*\n• Target : ${members.length} member\n• Nama kontak : ${nama}\n• Delay : ${delay}ms\n\nHentikan dengan *stoppush*`)

      let res
      try {
          res = await jpmLoop(members, delay, async to => {
              const nomor = to.split('@')[0]
              await sock.sendMessage(to, { text: `${pesan}\n\n#${randomKode()}` })
              await sock.sendMessage(to, {
                  contacts: {
                      displayName: nama,
                      contacts: [{ displayName: nama, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${nama} - ${nomor}\nTEL;type=CELL;type=VOICE;waid=${nomor}:+${nomor}\nEND:VCARD` }]
                  }
              })
          }, () => !jobs.pushRunning)
      } finally {
          jobs.pushRunning = false
      }
      return reply(`*▢ PUSH KONTAK 2 SELESAI*\n• Berhasil : ${res.ok} member\n• Gagal : ${res.fail} member`)
  }

export { pluginConfig as config, handler }
