/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const getDatabase = MikuRuntime.getDatabase;

  const pluginConfig = {
      name: 'clanrank',
      alias: ["crank"],
      category: "clan",
      description: 'Lihat peringkat clan kamu',
      usage: '.clanrank',
      example: '.clanrank',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 5,
      energi: 0,
      isEnabled: true
  }

  function getLevelFromExp(exp) {
      return Math.floor(Math.sqrt(exp / 100)) + 1
  }

  async function handler(m) {
      const db = getDatabase()
      const user = db.getUser(m.sender)

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!\n> Crea un clan con *.clancreate*`)
      }

      const clan = db.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      const allClans = Object.values(db.clans)
          .sort((a, b) => {
              if (b.level !== a.level) return (b.level || 1) - (a.level || 1)
              if (b.exp !== a.exp) return (b.exp || 0) - (a.exp || 0)
              return (b.wins || 0) - (a.wins || 0)
          })

      const rank = allClans.findIndex(c => c.id === clan.id) + 1
      const totalClans = allClans.length
      const level = clan.level || getLevelFromExp(clan.exp || 0)

      let rankIcon = ''
      if (rank === 1) rankIcon = '👑'
      else if (rank === 2) rankIcon = '🥈'
      else if (rank === 3) rankIcon = '🥉'
      else rankIcon = '📊'

      const higherClans = allClans.filter((c, i) => i < rank - 1 && i < 3)
      const lowerClans = allClans.filter((c, i) => i > rank - 1 && i < rank + 3)

      let txt = `${rankIcon} *RANGO DE CLAN*\n\n`
      txt += `╭┈┈⬡「 🏰 *${clan.name}* 」\n`
      txt += `┃ 🎯 Calificación: *${rank} / ${totalClans}*\n`
      txt += `┃ 📊 Persentase: *${Math.floor((rank / totalClans) * 100)}%* teratas\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`

      if (higherClans.length > 0) {
          txt += `╭┈┈⬡「 ⬆️ *CLAN ARRIBA* 」\n`
          for (let i = 0; i < higherClans.length; i++) {
              const c = higherClans[i]
              const pos = i + 1
              txt += `┃ ${pos}. *${c.name}* (Level ${c.level || getLevelFromExp(c.exp || 0)})\n`
          }
          txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
      }

      txt += `╭┈┈⬡「 🎯 *TU CLAN* 」\n`
      txt += `┃ 📛 *${clan.name}*\n`
      txt += `┃ 🏆 Level: *${level}*\n`
      txt += `┃ 👥 Member: *${clan.members?.length || 0}*\n`
      txt += `┃ 💰 Kas: *Rp ${(clan.bank || 0).toLocaleString('id-ID')}*\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`

      if (lowerClans.length > 0) {
          txt += `╭┈┈⬡「 ⬇️ *CLAN ABAJO* 」\n`
          for (let i = 0; i < lowerClans.length; i++) {
              const c = lowerClans[i]
              const pos = rank + i + 1
              if (pos <= totalClans) {
                  txt += `┃ ${pos}. *${c.name}* (Level ${c.level || getLevelFromExp(c.exp || 0)})\n`
              }
          }
          txt += `╰┈┈┈┈┈┈┈┈⬡`
      }

      await m.reply(txt)
  }

export { pluginConfig as config, handler }
