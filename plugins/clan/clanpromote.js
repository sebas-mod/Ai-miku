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
      name: 'clanpromote',
      alias: ["cpromote"],
      category: "clan",
      description: 'Naikkan jabatan member (Co-Leader/Elder)',
      usage: '.clanpromote @user <coleader|elder>',
      example: '.clanpromote @user coleader',
      isOwner: false,
      isPremium: false,
      isGroup: true,
      isPrivate: false,
    isRegistered: true,
      cooldown: 10,
      energi: 0,
      isEnabled: true
  }

  async function handler(m, { mention }) {
      const db = getDatabase()
      const user = db.getUser(m.sender)
      const args = m.text?.trim().split(/\s+/)

      let target = mention?.[0] || (args[0] ? (args[0].includes('@') ? args[0] : null) : null)
      let role = args?.find(a => ['coleader', 'elder'].includes(a.toLowerCase()))

      if (!target || !role) {
          return m.reply(`⭐ *CLAN PROMOTE*\n\n> Promocionar miembros a co-líder o anciano\n\n> Ejemplo:\n>.clanpromote @user colíder\n>.clanpromote @user mayor`)
      }

      target = target.replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net'

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!`)
      }

      const clan = db.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      if (clan.leader !== m.sender) {
          return m.reply(`❌ ¡Solo el *líder* del clan puede promocionar miembros!`)
      }

      if (!clan.members.includes(target)) {
          return m.reply(`❌ ¡El objetivo no es miembro de tu clan!`)
      }

      if (target === m.sender) {
          return m.reply(`❌ ¡No puedes promocionarte!`)
      }

      if (!clan.roles) clan.roles = {}

      clan.roles[target] = role
      await db.save()

      let txt = `⭐ *ᴄʟᴀɴ ᴘʀᴏᴍᴏᴛᴇ!*\n\n`
      txt += `╭┈┈⬡「 📋 *RESULTADO* 」\n`
      txt += `┃ 📛 Clan: *${clan.name}*\n`
      txt += `┃ 👤 Member: @${target.split('@')[0]}\n`
      txt += `┃ 🆙 Nuevo puesto de trabajo: *${role === 'coleader' ? 'Co-Leader' : 'Elder'}*\n`
      txt += `┃ 👑 Promovido por: @${m.sender.split('@')[0]}\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡`

      await m.reply(txt, { mentions: [target, m.sender] })
  }

export { pluginConfig as config, handler }
