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
    name: "gbank",
    alias: [],
    category: "rpg",
    description: "gbank",
    usage: ".gbank",
    example: ".gbank",
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

      const { initRpgUser, sender, m, rpgDb, ensureBankFields, reply, rpgGuildDb, saveGuild, text, fmt, saveRpg, isGuildLeaderOrOfficer } = A
      switch (0) {
          default:
              {
                initRpgUser(sender, m.pushName)
                const me = rpgDb[sender]; ensureBankFields(me)

                if (!me.guild) return reply('⚠️ Kamu belum tergabung guild.')

                rpgGuildDb[me.guild] ??= { bank: 0, leader: null, officers: [], name: `Guild-${me.guild}` }
                const g = rpgGuildDb[me.guild]

                if (!g.leader) { g.leader = sender; saveGuild() }

                const args = (text||'').trim().split(/\s+/)
                const aksi = (args[0]||'').toLowerCase()
                const jumlah = parseInt(args[1],10)

                if (!aksi) {
                  return reply(
              `🏰 *GUILD BANK*
            gbank saldo                → cek saldo guild
            gbank setor <jumlah>       → setor coin ke guild
            gbank tarik <jumlah>       → tarik (ketua/officer saja)`)
                }

                if (aksi === 'saldo') {
                  return reply(`🏦 Saldo Guild *${g.name}*: ${fmt(g.bank)}`)
                }

                if (aksi === 'setor') {
                  if (!Number.isInteger(jumlah) || jumlah <= 0) return reply('⚠️ Masukkan jumlah.')
                  if (me.coin < jumlah) return reply('❌ Coin tidak cukup.')
                  me.coin -= jumlah
                  g.bank += jumlah
                  saveRpg(); saveGuild()
                  return reply(`✅ Setor ${fmt(jumlah)} coin ke bank guild.\nSaldo guild: ${fmt(g.bank)}`)
                }

                if (aksi === 'tarik') {
                  const allowed = isGuildLeaderOrOfficer(sender)
                  if (!allowed) return reply('❌ Hanya ketua/officer yang boleh tarik.')
                  if (!Number.isInteger(jumlah) || jumlah <= 0) return reply('⚠️ Masukkan jumlah.')
                  if (g.bank < jumlah) return reply('❌ Saldo guild tidak cukup.')
                  g.bank -= jumlah
                  me.coin += jumlah
                  saveRpg(); saveGuild()
                  return reply(`✅ Tarik ${fmt(jumlah)} coin dari bank guild.\nSaldo guild: ${fmt(g.bank)}`)
                }

                return reply('❓ Perintah gbank tidak dikenali.')
              }
      }
}

export { pluginConfig as config, handler }
