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
      name: 'clankick',
      alias: ["ckick"],
      category: "clan",
      description: 'Kick member dari clan (leader only)',
      usage: '.clankick @user',
      example: '.clankick @user',
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
      if (!clan) return m.reply(`❌ Clan tidak ditemukan`)
      if (clan.leader !== m.sender) return m.reply(`❌ Hanya leader yang bisa kick`)

      const target = m.mentionedJid?.[0] || m.quoted?.sender
      if (!target) {
          return m.reply(
              `👢 *CLAN KICK*\n\n` +
              `Tag atau reply member yang mau dikeluarkan\n\n` +
              `Contoh: *.clankick @user*`
          )
      }

      if (target === m.sender) return m.reply(`❌ Tidak bisa kick diri sendiri`)
      if (!clan.members.includes(target)) return m.reply(`❌ User bukan member clan ini`)

      clan.members = clan.members.filter(jid => jid !== target)
      db.setUser(target, { clanId: null })
      db.save()

      const emblem = clan.emblem || '🏰'

      await m.reply(
          `${emblem} *KICKED*\n\n` +
          `@${target.split('@')[0]} dikeluarkan dari *${clan.name}*\n` +
          `Sisa members: ${clan.members.length}/50`,
          { mentions: [target] }
      )
  }

export { pluginConfig as config, handler }
