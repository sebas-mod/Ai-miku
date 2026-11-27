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
      name: 'clanleave',
      alias: ["cleave"],
      category: "clan",
      description: 'Keluar dari clan',
      usage: '.clanleave',
      example: '.clanleave',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 10,
      energi: 0,
      isEnabled: true
  }

  async function handler(m) {
      const db = getDatabase()
      const user = db.getUser(m.sender)

      if (!user?.clanId) return m.reply(`❌ Aún no tienes un clan`)


      const clan = db.clans[user.clanId]
      if (!clan) {
          db.setUser(m.sender, { clanId: null })
          db.save()
          return m.reply(`❌ Clan no encontrado, datos borrados`)
      }

      if (clan.leader === m.sender) {
          if (clan.members.length > 1) {
              return m.reply(
                  `❌ ¡Tú eres el líder!\n\n` +
                  `Transferir primero: *.clantransfer @user*\n` +
                  `O expulsar a todos los miembros primero`
              )
          }
          delete db.clans[user.clanId]
          db.setUser(m.sender, { clanId: null })
          db.save()

          const emblem = clan.emblem || '🏰'
          return m.reply(`${emblem} Clanes *${clan.name}* ha sido disuelto`)
      }

      clan.members = clan.members.filter(jid => jid !== m.sender)
      db.setUser(m.sender, { clanId: null })
      db.save()

      await m.reply(`👋 Te has quedado sin *${clan.name}*`)
  }

export { pluginConfig as config, handler }
