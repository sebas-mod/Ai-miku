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
      name: 'clanwarscore',
      alias: ["cwarscore"],
      category: "clan",
      description: 'Lihat skor clan war',
      usage: '.clanwarscore',
      example: '.clanwarscore',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 3,
      energi: 0,
      isEnabled: true
  }

  async function handler(m) {
      const db = getDatabase()
      const user = db.getUser(m.sender)

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!`)
      }

      const clan = db.db.data.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      if (!db.db.data.activeWars) db.db.data.activeWars = {}

      let activeWar = null
      for (const war of Object.values(db.db.data.activeWars)) {
          if (war.attacker === clan.id || war.defender === clan.id) {
              activeWar = war
              break
          }
      }

      if (!activeWar) {
          return m.reply(`❌ ¡Tu clan no está en guerra!`)
      }

      const attackerClan = db.db.data.clans[activeWar.attacker]
      const defenderClan = db.db.data.clans[activeWar.defender]
      const timeLeft = Math.max(0, activeWar.endTime - Date.now())
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

      let txt = `⚔️ *ᴄʟᴀɴ ᴡᴀʀ ꜱᴄᴏʀᴇ*\n\n`
      txt += `╭┈┈⬡「 🏆 *ꜱᴄᴏʀᴇ* 」\n`
      txt += `┃ ⚔️ ${attackerClan.name}: *${activeWar.attackerScore} pts*\n`
      txt += `┃ 🛡️ ${defenderClan.name}: *${activeWar.defenderScore} pts*\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
      txt += `╭┈┈⬡「 ⏰ *ᴛɪᴍᴇ ʟᴇꜰᴛ* 」\n`
      txt += `┃ ⏱️ ${hoursLeft} En punto ${minutesLeft} minuto\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`

      if (activeWar.attackerScore > activeWar.defenderScore) {
          txt += `> 🔥 *${attackerClan.name}*¡está sobresaliendo!`
      } else if (activeWar.defenderScore > activeWar.attackerScore) {
          txt += `> 🛡️ *${defenderClan.name}*¡está sobresaliendo!`
      } else {
          txt += `> ⚖️ Skor imbang! Ayo menangkan perang!`
      }

      await m.reply(txt)
  }

export { pluginConfig as config, handler }
