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
      name: 'clandemote',
      alias: ["cdemote"],
      category: "clan",
      description: 'Turunkan jabatan member',
      usage: '.clandemote @user',
      example: '.clandemote @user',
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

      if (!target) {
          return m.reply(`📉 *CLAN DEMOTE*\n\n> Bajar la posición del miembro a miembro ordinario\n\n> Ejemplo:.clandemote @user`)
      }

      target = target.replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net'

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!`)
      }

      const clan = db.db.data.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      if (clan.leader !== m.sender) {
          return m.reply(`❌ ¡Solo el *líder* del clan puede degradar a los miembros!`)
      }

      if (!clan.members.includes(target)) {
          return m.reply(`❌ ¡El objetivo no es miembro de tu clan!`)
      }

      if (target === m.sender) {
          return m.reply(`❌ ¡No puedes degradarte!`)
      }

      if (!clan.roles?.[target]) {
          return m.reply(`❌ ¡Target no tiene un puesto de trabajo específico!`)
      }

      const oldRole = clan.roles[target]
      delete clan.roles[target]
      await db.save()

      let txt = `📉 *ᴄʟᴀɴ ᴅᴇᴍᴏᴛᴇ!*\n\n`
      txt += `╭┈┈⬡「 📋 *RESULTADO* 」\n`
      txt += `┃ 📛 Clan: *${clan.name}*\n`
      txt += `┃ 👤 Member: @${target.split('@')[0]}\n`
      txt += `┃ 🔻 Puesto anterior: *${oldRole === 'coleader' ? 'Co-Leader' : 'Elder'}*\n`
      txt += `┃ 📌 Nuevo puesto: *Miembro*\n`
      txt += `┃ 👑 Degradado por: @${m.sender.split('@')[0]}\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡`

      await m.reply(txt, { mentions: [target, m.sender] })
  }

export { pluginConfig as config, handler }
