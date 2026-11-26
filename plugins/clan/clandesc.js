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
          return m.reply(`📝 *ᴄʟᴀɴ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ*\n\n> Masukkan deskripsi clan baru!\n> Maksimal ${MAX_DESC} karakter\n\n> Contoh: .clandesc Clan pejuang sejati`)
      }

      if (description.length > MAX_DESC) {
          return m.reply(`❌ Deskripsi maksimal ${MAX_DESC} karakter!`)
      }

      if (!user.clanId) {
          return m.reply(`❌ Kamu belum punya clan!\n> Buat clan dengan *.clancreate*`)
      }

      const clan = db.db.data.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ Clan tidak ditemukan!`)
      }

      if (clan.leader !== m.sender) {
          return m.reply(`❌ Hanya *leader* clan yang bisa edit deskripsi!`)
      }

      clan.description = description
      await db.save()

      let txt = `📝 *ᴄʟᴀɴ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ ᴜᴘᴅᴀᴛᴇᴅ!*\n\n`
      txt += `╭┈┈⬡「 📋 *ʜᴀꜱɪʟ* 」\n`
      txt += `┃ 📛 Nama clan: *${clan.name}*\n`
      txt += `┃ 📝 Deskripsi baru:\n`
      txt += `┃ *${description}*\n`
      txt += `┃ 👑 Leader: @${m.sender.split('@')[0]}\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡`

      await m.reply(txt, { mentions: [m.sender] })
  }

export { pluginConfig as config, handler }
