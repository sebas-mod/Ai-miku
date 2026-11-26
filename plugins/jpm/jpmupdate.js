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

const pluginConfig = {
    name: "jpmupdate",
    alias: ["updatejpm", "broadcastupdate", "shareupdate"],
    category: "jpm",
    description: "Fitur jpm jpmupdate",
    usage: ".jpmupdate",
    example: ".jpmupdate",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, prefix, reply, example }) {
      if (!text) return example('v3.0 | ✨ Fitur Baru:\\n- Anime\\n- Dokumen   (pakai \\n untuk baris baru)')
      if (global.__jpmRunning) return reply('❌ JPM sedang berjalan. Ketik *stopjpm* untuk menghentikan.')

      let version = global.versi || 'v1.0'
      let changelog = text
      if (text.includes('|')) {
          const [v, ...rest] = text.split('|')
          version = v.trim() || version
          changelog = rest.join('|').trim()
      }
      if (!changelog) return reply('❌ Changelog tidak boleh kosong.')

      const groups = await jpmGroups(sock)
      if (!groups.length) return reply('❌ Tidak ada grup yang bisa dituju.')

      const tanggal = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'long', year: 'numeric' })
      const botName = global.namebot || 'Elysia Assistant'
      const pesan = `🚀 *UPDATE !! | ${version}*\n\n📅 *Tanggal:* ${tanggal}\n\n*CHANGELOG:*\n${changelog.replace(/\\n/g, '\n')}\n\n*CATATAN TERBARU:*\n> 💡 Ketik *${prefix}menu* untuk melihat fitur-fitur ini.\n> 📢 _Terima kasih telah menggunakan ${botName}_`

      const contextInfo = global.idSaluran
          ? { forwardingScore: 9999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: global.idSaluran, newsletterName: global.nameSaluran || botName, serverMessageId: 127 } }
          : undefined
      const delay = jpmCfg().delayJpm
      await reply(`*▢ JPM UPDATE*\n• Versi : ${version}\n• Target : ${groups.length} grup\n• Delay : ${delay}ms`)

      const { ok, fail } = await jpmLoop(groups, delay, g => sock.sendMessage(g.id, { text: pesan, ...(contextInfo ? { contextInfo } : {}) }))
      return reply(`*▢ JPM UPDATE SELESAI*\n• Berhasil : ${ok} grup\n• Gagal : ${fail} grup`)
  }

export { pluginConfig as config, handler }
