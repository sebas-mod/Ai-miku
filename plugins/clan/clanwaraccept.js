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
      name: 'clanwaraccept',
      alias: ["cwaraccept"],
      category: "clan",
      description: 'Terima tantangan clan war',
      usage: '.clanwaraccept',
      example: '.clanwaraccept',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 10,
      energi: 0,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const db = getDatabase()
      const user = db.getUser(m.sender)

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!`)
      }

      const clan = db.db.data.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      if (clan.leader !== m.sender && clan.roles?.[m.sender] !== 'coleader') {
          return m.reply(`❌ ¡Solo *Líder* o *Co-Líder* pueden aceptar la guerra!`)
      }

      if (!db.db.data.pendingWars) db.db.data.pendingWars = {}

      let pendingWar = null
      let pendingId = null

      for (const [id, war] of Object.entries(db.db.data.pendingWars)) {
          if (war.targetClanId === clan.id && war.status === 'pending') {
              pendingWar = war
              pendingId = id
              break
          }
      }

      if (!pendingWar) {
          return m.reply(`❌ ¡No hay desafíos de guerra entrantes para tu clan!`)
      }

      const attackerClan = db.db.data.clans[pendingWar.attackerClanId]
      if (!attackerClan) {
          delete db.db.data.pendingWars[pendingId]
          await db.save()
          return m.reply(`❌ ¡El clan emisor ya no existe!`)
      }

      pendingWar.status = 'accepted'
      pendingWar.acceptedAt = new Date().toISOString()
      pendingWar.warStart = Date.now()
      pendingWar.warEnd = Date.now() + (24 * 60 * 60 * 1000)

      if (!db.db.data.activeWars) db.db.data.activeWars = {}
      const warId = `war_${Date.now()}`

      db.db.data.activeWars[warId] = {
          id: warId,
          attacker: pendingWar.attackerClanId,
          defender: pendingWar.targetClanId,
          startTime: pendingWar.warStart,
          endTime: pendingWar.warEnd,
          attackerScore: 0,
          defenderScore: 0,
          attackerMembers: [],
          defenderMembers: [],
          status: 'active'
      }

      delete db.db.data.pendingWars[pendingId]
      await db.save()

      let txt = `⚔️ *ᴄʟᴀɴ ᴡᴀʀ ᴀᴄᴄᴇᴘᴛᴇᴅ!*\n\n`
      txt += `╭┈┈⬡「 🎯 *ᴡᴀʀ ɪɴꜰᴏ* 」\n`
      txt += `┃ ⚔️ Attacker: *${attackerClan.name}*\n`
      txt += `┃ 🛡️ Defender: *${clan.name}*\n`
      txt += `┃ ⏰ Duración: *24 horas*\n`
      txt += `┃ 📅 Inicio: Ahora\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
      txt += `> ¡Escribe *.clanwar* para ver el estado de la guerra!\n> ¡Escribe *.clanwarscore* para ver la puntuación!`

      for (const member of clan.members) {
          await sock.sendMessage(member, { text: txt }).catch(() => {})
      }
      for (const member of attackerClan.members) {
          await sock.sendMessage(member, { text: txt }).catch(() => {})
      }

      await m.reply(txt)
  }

export { pluginConfig as config, handler }
