/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const rpgStore = ElysiaRuntime.rpgStore;
const fmt = ElysiaRuntime.fiturFmt;

const pluginConfig = {
    name: "top",
    alias: ["toplevel", "topmoney", "toplimit", "topexp", "topbank"],
    category: "rpg",
    description: "top level",
    usage: ".top level",
    example: ".top level",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const KAT = {
      level: { emoji: '🍓', nama: 'LEVEL', sub: 'exp' },
      money: { emoji: '💹', nama: 'MONEY' },
      limit: { emoji: '🎫', nama: 'LIMIT' },
      exp: { emoji: '✨', nama: 'EXP' },
      bank: { emoji: '🏦', nama: 'BANK' }
  }
  const MEDAL = ['🥇', '🥈', '🥉']
  const angka = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

  async function handler(m, { conn, command, args, usedPrefix }) {
      let kat = command.startsWith('top') && command !== 'top' ? command.slice(3) : (args[0] || '').toLowerCase()
      if (!kat) {
          const daftar = Object.entries(KAT).map(([k, v]) => `${v.emoji} ${usedPrefix}top ${k}`).join('\n')
          return m.reply(`*PAPAN PERINGKAT*\n\nPilih kategori:\n${daftar}\n\n Contoh: ${usedPrefix}top level`)
      }
      const def = KAT[kat]
      if (!def) return m.reply(`Kategori *${kat}* tidak ada.\n Pilihan: ${Object.keys(KAT).join(', ')}`)

      const users = Object.entries(rpgStore().users)
          .filter(([, u]) => u && !u.banned)
          .map(([jid, u]) => ({ jid, nama: u.registered && u.name ? u.name : u.name || jid.split('@')[0], nilai: angka(u[kat]), exp: angka(u.exp) }))
          .filter((u) => u.nilai > 0)
          .sort((a, b) => b.nilai - a.nilai || b.exp - a.exp)

      if (!users.length) return m.reply('Belum ada yang masuk peringkat.')

      const top = users.slice(0, 10)
      const baris = top.map((u, i) => {
          const nomor = MEDAL[i] || `${String(i + 1).padStart(2, ' ')}.`
          const nama = String(u.nama).replace(/[\r\n]+/g, ' ').slice(0, 18)
          const nilai = kat === 'level' ? `Lv ${fmt(u.nilai)} • ${fmt(u.exp)} exp` : fmt(u.nilai)
          return `${nomor} ${nama}${i === 0 ? ' 👑' : ''}\n      ${def.emoji} ${nilai}`
      })

      const saya = users.findIndex((u) => u.jid === m.sender)
      const posisi = saya >= 0 ? `Peringkatmu: *#${saya + 1}* dari ${fmt(users.length)} user` : 'Kamu belum masuk peringkat, ayo semangat!'

      await conn.sendMessage(m.chat, {
          text: `${def.emoji} *TOP 10 ${def.nama}* ${def.emoji}\n\n${baris.join('\n')}\n\n${posisi}`
      }, { quoted: m })
  }

  handler.exp = 0

export { pluginConfig as config, handler }
