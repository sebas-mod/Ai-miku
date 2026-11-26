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
    name: "escrow",
    alias: [],
    category: "rpg",
    description: "escrow",
    usage: ".escrow",
    example: ".escrow",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(_m, A) {

      const { initRpgUser, sender, m, rpgDb, ensureBankFields, text, reply, bankCfg, fmt, pushLog, saveRpg } = A
      switch (0) {
          default:
              {
                initRpgUser(sender, m.pushName)
                const me = rpgDb[sender]; ensureBankFields(me)

                const args = (text||'').trim().split(/\s+/)
                const aksi = (args[0]||'').toLowerCase()
                const jumlah = parseInt(args[1],10)
                const tagJid = (m.mentionedJid && m.mentionedJid[0]) || null

                if (!aksi) {
                  return reply(
              `🤝 *ESCROW (Titipan Aman)*
            escrow buat <jumlah> @user  → tahan dana dari tabungan kamu
            escrow cek                   → lihat escrow aktif (punyamu)
            escrow konfirmasi            → CAIR ke penerima (bisa oleh pengirim atau penerima)
            escrow batal                 → batalkan & uang kembali ke tabungan pengirim`)
                }

                if (aksi === 'buat') {
                  if (!Number.isInteger(jumlah) || jumlah < bankCfg.minAmount) return reply(`⚠️ Minimal escrow ${fmt(bankCfg.minAmount)}.`)
                  if (!tagJid) return reply('⚠️ Tag penerima: *escrow buat <jumlah> @user*')
                  if (me.bank < jumlah) return reply('❌ Tabungan tidak cukup.')

                  initRpgUser(tagJid, 'Player')
                  const you = rpgDb[tagJid]; ensureBankFields(you)

                  if (me.escrow) return reply('⚠️ Kamu masih punya escrow aktif. Selesaikan dulu.')
                  me.bank -= jumlah
                  me.escrow = { amount: jumlah, target: tagJid, by: sender, confirmed: false }
                  pushLog(me, `ESCROW BUAT -${fmt(jumlah)} → @${tagJid.split('@')[0]}`)
                  saveRpg()
                  return reply(`✅ Escrow ${fmt(jumlah)} coin dibuat untuk @${tagJid.split('@')[0]}.`, { mentions: [tagJid] })
                }

                if (aksi === 'cek') {
                  if (!me.escrow) return reply('ℹ️ Tidak ada escrow aktif.')
                  const e = me.escrow
                  return reply(`💼 Escrow: ${fmt(e.amount)} → @${(e.target||'').split('@')[0]}\nStatus: ${e.confirmed ? 'Selesai' : 'Menunggu konfirmasi'}`)
                }

                if (aksi === 'konfirmasi') {
                  let ownerId = sender
                  let escrowOwner = rpgDb[ownerId]
                  let isReceiverConfirm = false

                  if (!escrowOwner.escrow) {
                    const ownerEntry = Object.entries(rpgDb).find(([,u]) => u && u.escrow && u.escrow.target === sender)
                    if (!ownerEntry) return reply('❌ Tidak ada escrow yang menujumu atau milikmu.')
                    ownerId = ownerEntry[0]
                    escrowOwner = rpgDb[ownerId]
                    isReceiverConfirm = true
                  }

                  const e = escrowOwner.escrow
                  if (!e) return reply('❌ Tidak ada escrow aktif.')
                  if (e.target !== (isReceiverConfirm ? sender : e.target)) {
                  }

                  initRpgUser(e.target, 'Player'); ensureBankFields(rpgDb[e.target])
                  rpgDb[e.target].bank += e.amount
                  pushLog(escrowOwner, `ESCROW CAIR -${fmt(e.amount)} → @${e.target.split('@')[0]}`)
                  pushLog(rpgDb[e.target], `ESCROW TERIMA +${fmt(e.amount)} dari @${ownerId.split('@')[0]}`)
                  escrowOwner.escrow = null
                  saveRpg()
                  return reply(`🤝 Escrow selesai. ${fmt(e.amount)} coin cair ke @${e.target.split('@')[0]}.`, { mentions: [e.target] })
                }

                if (aksi === 'batal') {
                  if (!me.escrow) return reply('❌ Tidak ada escrow aktif.')
                  const e = me.escrow
                  me.bank += e.amount
                  pushLog(me, `ESCROW BATAL +${fmt(e.amount)} (kembali ke tabungan)`)
                  me.escrow = null
                  saveRpg()
                  return reply('❌ Escrow dibatalkan. Coin dikembalikan ke tabungan.')
                }

                return reply('❓ Perintah escrow tidak dikenali.')
              }
      }
}

export { pluginConfig as config, handler }
