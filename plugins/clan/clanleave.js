/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const getDatabase = ElysiaRuntime.getDatabase;

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

      if (!user?.clanId) return m.reply(`❌ Kamu belum punya clan`)
      if (!db.db.data.clans) db.db.data.clans = {}

      const clan = db.db.data.clans[user.clanId]
      if (!clan) {
          db.setUser(m.sender, { clanId: null })
          db.save()
          return m.reply(`❌ Clan tidak ditemukan, data dibersihkan`)
      }

      if (clan.leader === m.sender) {
          if (clan.members.length > 1) {
              return m.reply(
                  `❌ Kamu adalah leader!\n\n` +
                  `Transfer dulu: *.clantransfer @user*\n` +
                  `Atau kick semua member terlebih dahulu`
              )
          }
          delete db.db.data.clans[user.clanId]
          db.setUser(m.sender, { clanId: null })
          db.save()

          const emblem = clan.emblem || '🏰'
          return m.reply(`${emblem} Clan *${clan.name}* telah dibubarkan`)
      }

      clan.members = clan.members.filter(jid => jid !== m.sender)
      db.setUser(m.sender, { clanId: null })
      db.save()

      await m.reply(`👋 Kamu keluar dari *${clan.name}*`)
  }

export { pluginConfig as config, handler }
