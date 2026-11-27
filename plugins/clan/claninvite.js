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
      name: 'claninvite',
      alias: ["cinvite"],
      category: "clan",
      description: 'Invite & langsung tambahkan user ke clan',
      usage: '.claninvite @user',
      example: '.claninvite @user',
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
      if (!db.db.data.clans) db.db.data.clans = {}

      const clan = db.db.data.clans[user.clanId]
      if (!clan) return m.reply(`❌ Clan no encontrado`)

      const target = m.mentionedJid?.[0] || m.quoted?.sender
      if (!target) {
          return m.reply(
              `📨 *CLAN INVITE*\n\n` +
              `Etiqueta o responde al usuario que deseas invitar\n\n` +
              `Ejemplo: *.claninvite @user*`
          )
      }

      if (target === m.sender) return m.reply(`❌ No puedes invitarte a ti mismo`)

      const targetUser = db.getUser(target)
      if (targetUser?.clanId) return m.reply(`❌ El usuario ya tiene un clan`)
      if (clan.members.length >= 50) return m.reply(`❌ El clan está lleno (50/50)`)

      clan.members.push(target)
      db.setUser(target, { clanId: user.clanId })
      db.save()

      const emblem = clan.emblem || '🏰'

      await m.reply(
          `${emblem} *INVITED!*\n\n` +
          `@${target.split('@')[0]} bergabung ke *${clan.name}*\n` +
          `Members: ${clan.members.length}/50`,
          { mentions: [m.sender, target] }
      )
  }

export { pluginConfig as config, handler }
