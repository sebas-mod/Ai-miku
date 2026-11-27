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
      name: 'clanwarhistory',
      alias: ["cwarhistory"],
      category: "clan",
      description: 'Lihat riwayat clan war',
      usage: '.clanwarhistory',
      example: '.clanwarhistory',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 5,
      energi: 0,
      isEnabled: true
  }

  async function handler(m) {
      const db = getDatabase()
      const user = db.getUser(m.sender)

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!`)
      }

      const clan = db.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }



      const warHistory = db.warHistory
          .filter(war => war.attacker === clan.id || war.defender === clan.id)
          .slice(-10)
          .reverse()

      if (warHistory.length === 0) {
          return m.reply(`📜 *HISTORIA DE GUERRA*\n\n> Clanes *${clan.name}*¡aún no tiene ningún historial de guerra!`)
      }

      let txt = `📜 *HISTORIA DE GUERRA* [${clan.name}]\n\n`

      for (let i = 0; i < warHistory.length; i++) {
          const war = warHistory[i]
          const isAttacker = war.attacker === clan.id
          const opponentId = isAttacker ? war.defender : war.attacker
          const opponent = db.clans[opponentId]
          const opponentName = opponent?.name || 'Unknown Clan'

          const isWin = (isAttacker && war.attackerScore > war.defenderScore) ||
                        (!isAttacker && war.defenderScore > war.attackerScore)

          const result = isWin ? '✅ WIN' : '❌ LOSE'
          const date = new Date(war.endTime).toLocaleDateString('id-ID')

          txt += `╭┈┈⬡「 ${i+1} 」\n`
          txt += `┃ 📅 ${date}\n`
          txt += `┃ 🆚 Vs *${opponentName}*\n`
          txt += `┃ 📊 ${war.attackerScore} - ${war.defenderScore}\n`
          txt += `┃ 🎯 *${result}*\n`
          txt += `╰┈┈┈┈┈┈┈┈⬡\n`
          if (i < warHistory.length - 1) txt += `\n`
      }

      const wins = warHistory.filter(war => {
          const isAttacker = war.attacker === clan.id
          return (isAttacker && war.attackerScore > war.defenderScore) ||
                 (!isAttacker && war.defenderScore > war.attackerScore)
      }).length

      const totalWars = warHistory.length
      const winRate = Math.floor((wins / totalWars) * 100)

      txt += `\n╭┈┈⬡「 📊 *ᴛᴏᴛᴀʟ* 」\n`
      txt += `┃ 🏆 Menang: *${wins}*\n`
      txt += `┃ 📉 Kalah: *${totalWars - wins}*\n`
      txt += `┃ 📈 Win rate: *${winRate}%*\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡`

      await m.reply(txt)
  }

export { pluginConfig as config, handler }
