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
const getMedia = ElysiaRuntime.getMedia;
const mediaContent = ElysiaRuntime.mediaContent;
const memberJids = ElysiaRuntime.memberJids;
const pushKode = ElysiaRuntime.pushKode;
const sendVcf = ElysiaRuntime.sendVcf;

const pluginConfig = {
    name: "pushkontak",
    alias: ["puskontak"],
    category: "pushkontak",
    description: "Fitur pushkontak pushkontak",
    usage: ".pushkontak",
    example: ".pushkontak",
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, jid, text, reply, example }) {
      const media = await getMedia(m)
      if (!text && !media) return example('pesan yang ingin di-push ke member  (atau reply foto/video + caption)')

      const jobs = jpmJobs()
      if (jobs.pushRunning) return reply('❌ Push kontak sedang berjalan. Ketik *stoppush* untuk menghentikan.')

      const meta = await getMeta(sock, jid, true)
      const members = await memberJids(sock, meta)
      if (!members.length) return reply('❌ Tidak ada member yang bisa dituju di grup ini.')

      const delay = jpmCfg().delayPushKontak
      jobs.pushRunning = true
      await reply(`*▢ PUSH KONTAK*\n• Target : ${members.length} member\n• Delay : ${delay}ms\n• Auto-save : VCF\n\nHentikan dengan *stoppush*`)

      const saved = []
      let result
      try {
          result = await jpmLoop(members, delay, async to => {
              const caption = `${text || ''}\n\n#${pushKode()}`.trim()
              await sock.sendMessage(to, media ? mediaContent(media, caption) : { text: caption })
              saved.push(to)
          }, () => !jobs.pushRunning)
      } finally {
          jobs.pushRunning = false
      }

      if (saved.length) {
          const nama = String(meta.subject || 'Grup').replace(/\s+/g, '_')
          await sendVcf(sock, m.sender, saved, {
              fileName: `Kontak_${nama}_${saved.length}`,
              caption: `*▢ AUTO-SAVE KONTAK*\n• Total : ${saved.length} kontak\n• Grup : ${meta.subject || '-'}\n\nImport file ini ke HP untuk menyimpan semua kontak.`
          }).catch(e => console.error('[PUSHKONTAK] gagal kirim VCF:', e?.message || e))
      }

      return reply(`*▢ PUSH KONTAK SELESAI*\n• Berhasil : ${result.ok} member\n• Gagal : ${result.fail} member\n• Tersimpan : ${saved.length} kontak (VCF)`)
  }

export { pluginConfig as config, handler }
