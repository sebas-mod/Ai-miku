/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "deposit",
    alias: [],
    category: "rpg",
    description: "Deposit berjangka (buat, cek, cair, batal)",
    usage: ".deposit",
    example: ".deposit",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, A) {

      const { initRpgUser, sender, pushname, rpgDb, text, reply, fmt, hms, saveRpg, bankCfg, ensureBankFields, pushLog, prefix } = A
      initRpgUser(sender, pushname)
      const me = rpgDb[sender]
      ensureBankFields(me)

      const args = String(text || '').trim().split(/\s+/)
      const aksi = (args[0] || '').toLowerCase()
      const jumlah = parseInt(args[1], 10)
      const durasiJam = parseInt(args[2], 10)

      if (!aksi) {
          return reply(
  `⏳ *DEPOSIT BERJANGKA*
${prefix}deposit buat <jumlah> <jam> → lock coin dari tabungan, bunga 10% saat cair
${prefix}deposit cek                  → cek status
${prefix}deposit cair                 → cairkan jika jatuh tempo
${prefix}deposit batal                → batalkan sebelum jatuh tempo (kena penalti 5%)`)
      }

      if (aksi === 'buat') {
          if (me.deposit.amount > 0) return reply('❌ Kamu sudah punya deposito aktif.')
          if (!Number.isInteger(jumlah) || jumlah < bankCfg.minAmount) return reply(`⚠️ Minimal deposit ${fmt(bankCfg.minAmount)}.`)
          if (!Number.isInteger(durasiJam) || durasiJam < 1) return reply('⚠️ Durasi minimal 1 jam.')
          if (me.bank < jumlah) return reply('❌ Tabungan tidak cukup. Setor dulu dengan *' + prefix + 'bank simpan <jumlah>*.')

          me.bank -= jumlah
          me.deposit = { amount: jumlah, until: Date.now() + durasiJam * 3600000 }
          pushLog(me, `DEPOSIT BUAT -${fmt(jumlah)} (${durasiJam} jam)`)
          saveRpg()
          return reply(`✅ Deposit ${fmt(jumlah)} coin dibuat untuk ${durasiJam} jam.`)
      }

      if (aksi === 'cek') {
          if (me.deposit.amount <= 0) return reply('❌ Tidak ada deposito.')
          const sisa = me.deposit.until - Date.now()
          return reply(`💰 Deposito: ${fmt(me.deposit.amount)} coin\n⏳ Sisa waktu: ${sisa > 0 ? hms(sisa) : 'sudah jatuh tempo, cairkan dengan *' + prefix + 'deposit cair*'}`)
      }

      if (aksi === 'cair') {
          if (me.deposit.amount <= 0) return reply('❌ Tidak ada deposito.')
          if (Date.now() < me.deposit.until) return reply('⏳ Belum jatuh tempo.')
          const bunga = Math.floor(me.deposit.amount * 0.10)
          const total = me.deposit.amount + bunga
          me.bank += total
          pushLog(me, `DEPOSIT CAIR +${fmt(total)} (termasuk bunga 10%)`)
          me.deposit = { amount: 0, until: 0 }
          saveRpg()
          return reply(`✅ Deposito cair! Kamu dapat ${fmt(total)} coin (bunga 10%).`)
      }

      if (aksi === 'batal') {
          if (me.deposit.amount <= 0) return reply('❌ Tidak ada deposito.')
          const penalti = Math.floor(me.deposit.amount * 0.05)
          const kembali = me.deposit.amount - penalti
          me.bank += Math.max(0, kembali)
          global.bankCentral += penalti
          pushLog(me, `DEPOSIT BATAL +${fmt(kembali)} (penalti ${fmt(penalti)})`)
          me.deposit = { amount: 0, until: 0 }
          saveRpg()
          return reply(`⚠️ Deposit dibatalkan. Kembali ${fmt(kembali)} coin (penalti ${fmt(penalti)}).`)
      }

      return reply('❓ Perintah deposit tidak dikenali.')
}

export { pluginConfig as config, handler }
