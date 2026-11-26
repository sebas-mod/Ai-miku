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
      name: 'clanmembers',
      alias: ["cmembers"],
      category: "clan",
      description: 'Lihat daftar member clan',
      usage: '.clanmembers',
      example: '.clanmembers',
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

      if (!user?.clanId) return m.reply(`❌ Kamu belum punya clan`)
      if (!db.db.data.clans) db.db.data.clans = {}

      const clan = db.db.data.clans[user.clanId]
      if (!clan) return m.reply(`❌ Clan tidak ditemukan`)

      const emblem = clan.emblem || '🏰'
      const mentions = []

      const memberLines = clan.members.map((jid, i) => {
          const memberUser = db.getUser(jid)
          const isLeader = jid === clan.leader
          const level = memberUser?.rpg?.level || memberUser?.level || 1
          const koin = (memberUser?.koin || 0).toLocaleString('id-ID')
          mentions.push(jid)

          const role = isLeader ? '👑' : '•'
          return `${role} @${jid.split('@')[0]}  Lv.${level} · Rp ${koin}`
      })

      await m.reply(
          `${emblem} *${clan.name}* — Members\n\n` +
          memberLines.join('\n') +
          `\n\n${clan.members.length}/50 members`,
          { mentions }
      )
  }

export { pluginConfig as config, handler }
