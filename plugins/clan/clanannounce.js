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
      name: 'clanannounce',
      alias: ["cannounce"],
      category: "clan",
      description: 'Kirim pengumuman ke semua member clan',
      usage: '.clanannounce <pesan>',
      example: '.clanannounce Besok ada event war!',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 30,
      energi: 0,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const db = getDatabase()
      const user = db.getUser(m.sender)
      const message = m.text?.trim()

      if (!message) {
          return m.reply(`📢 *CLAN ANNOUNCE*\n\n> Enviar anuncios a todos los miembros del clan.\n\n> Ejemplo:.clanannounce ¡Mañana hay un evento de guerra!`)
      }

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!`)
      }

      const clan = db.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      if (clan.leader !== m.sender && clan.roles?.[m.sender] !== 'coleader') {
          return m.reply(`❌ ¡Solo *Líder* o *Co-Líder* pueden anunciar!`)
      }

      const userData = db.getUser(m.sender)
      const userName = userData?.name || m.pushName || m.sender.split('@')[0]

      let txt = `📢 *ᴄʟᴀɴ ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ*\n\n`
      txt += `╭┈┈⬡「 🏰 *${clan.name}* 」\n`
      txt += `┃ 👑 De: *${userName}*\n`
      txt += `┃ 📝 Mensaje:\n`
      txt += `┃ *${message}*\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
      txt += `> Escribe.c para responder en el chat del clan`

      let successCount = 0
      for (const member of clan.members) {
          await sock.sendMessage(member, { text: txt }).catch(() => {})
          successCount++
      }

      await m.reply(`✅ Pengumuman terkirim ke *${successCount}* member clan!`)
  }

export { pluginConfig as config, handler }
