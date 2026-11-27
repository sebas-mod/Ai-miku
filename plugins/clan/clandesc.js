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
      name: 'clandesc',
      alias: ["cdesc"],
      category: "clan",
      description: 'Edit deskripsi clan',
      usage: '.clandesc <deskripsi>',
      example: '.clandesc Clan pejuang sejati',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 15,
      energi: 0,
      isEnabled: true
  }

  const MAX_DESC = 100

  async function handler(m) {
      const db = getDatabase()
      const user = db.getUser(m.sender)
      const description = m.text?.trim()

      if (!description) {
          return m.reply(`📝 *CLAN DESCRIPTION*\n\n> ¡Ingresa una nueva descripción del clan!\n> Máximo ${MAX_DESC} personaje\n\n> Ejemplo:.clandesc Clan de verdaderos guerreros`)
      }

      if (description.length > MAX_DESC) {
          return m.reply(`❌ Deskripsi maksimal ${MAX_DESC} karakter!`)
      }

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!\n> Crea un clan con *.clancreate*`)
      }

      const clan = db.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      if (clan.leader !== m.sender) {
          return m.reply(`❌ ¡Solo el *líder* del clan puede editar la descripción!`)
      }

      clan.description = description
      await db.save()

      let txt = `📝 *ᴄʟᴀɴ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ ᴜᴘᴅᴀᴛᴇᴅ!*\n\n`
      txt += `╭┈┈⬡「 📋 *RESULTADO* 」\n`
      txt += `┃ 📛 Nombre del clan: *${clan.name}*\n`
      txt += `┃ 📝 Nueva descripción:\n`
      txt += `┃ *${description}*\n`
      txt += `┃ 👑 Leader: @${m.sender.split('@')[0]}\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡`

      await m.reply(txt, { mentions: [m.sender] })
  }

export { pluginConfig as config, handler }
