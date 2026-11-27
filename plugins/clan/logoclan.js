/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const getDatabase = MikuRuntime.getDatabase;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  const require = createRequire(import.meta.url);
  const fs = require('fs')
  const path = require('path')

  const pluginConfig = {
      name: 'logoclan',
      alias: [],
      category: "clan",
      description: 'Set logo clan (reply gambar)',
      usage: '.logoclan (reply gambar)',
      example: '.logoclan',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 20,
      energi: 0,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const db = getDatabase()
      const user = db.getUser(m.sender)

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!\n> Crea un clan con *.clancreate*`)
      }

      const clan = db.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      if (clan.leader !== m.sender) {
          return m.reply(`❌ ¡Solo el *líder* del clan puede configurar el logo!`)
      }

      if (!m.quoted || !m.quoted.message?.imageMessage) {
          return m.reply(`🖼️ *CLAN LOGO*\n\n> ¡Responde a la imagen que quieres usar como logo del clan!\n\n> Ejemplo: responde a la imagen y luego escribe.clanlogo`)
      }

      await m.reply('⏳ *Mengupload logo clan...*')

      const media = await m.quoted.download()
      const logoDir = path.join(process.cwd(), 'database', 'media', 'clan_logo')

      if (!fs.existsSync(logoDir)) {
          fs.mkdirSync(logoDir, { recursive: true })
      }

      const logoPath = path.join(logoDir, `${clan.id}.jpg`)
      fs.writeFileSync(logoPath, media)

      if (!clan.logo) clan.logo = {}
      clan.logo.url = logoPath
      clan.logo.updatedAt = new Date().toISOString()
      await db.save()

      let txt = `🖼️ *ᴄʟᴀɴ ʟᴏɢᴏ ᴜᴘᴅᴀᴛᴇᴅ!*\n\n`
      txt += `╭┈┈⬡「 📋 *RESULTADO* 」\n`
      txt += `┃ 📛 Clan: *${clan.name}*\n`
      txt += `┃ 🖼️ ¡Nuevo logo guardado exitosamente!\n`
      txt += `┃ 👑 Leader: @${m.sender.split('@')[0]}\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡`

      await m.reply(txt, { mentions: [m.sender] })
  }

export { pluginConfig as config, handler }
