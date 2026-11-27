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

      if (!user?.clanId) return m.reply(`❌ Aún no tienes un clan`)


      const clan = db.clans[user.clanId]
      if (!clan) return m.reply(`❌ Clan no encontrado`)
      if (clan.leader !== m.sender) return m.reply(`❌ Sólo el líder puede patear`)

      const target = m.mentionedJid?.[0] || m.quoted?.sender
      if (!target) {
          return m.reply(
              `👢 *CLAN KICK*\n\n` +
              `Etiqueta o responde al miembro que deseas eliminar\n\n` +
              `Ejemplo: *.clankick @user*`
          )
      }

      if (target === m.sender) return m.reply(`❌ No puedes patearte a ti mismo`)
      if (!clan.members.includes(target)) return m.reply(`❌ El usuario no es miembro de este clan.`)

      clan.members = clan.members.filter(jid => jid !== target)
      db.setUser(target, { clanId: null })
      db.save()

      const emblem = clan.emblem || '🏰'

      await m.reply(
          `${emblem} *KICKED*\n\n` +
          `@${target.split('@')[0]} excluido de *${clan.name}*\n` +
          `Sisa members: ${clan.members.length}/50`,
          { mentions: [target] }
      )
  }

export { pluginConfig as config, handler }
