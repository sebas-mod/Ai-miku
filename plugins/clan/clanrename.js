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
      name: 'clanrename',
      alias: ["crename"],
      category: "clan",
      description: 'Ganti nama clan',
      usage: '.clanrename <nama baru>',
      example: '.clanrename DarkPhoenix',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 30,
      energi: 0,
      isEnabled: true
  }

  const MAX_CLAN_NAME = 20
  const RENAME_COST = 25000

  async function handler(m) {
      const db = getDatabase()
      const user = db.getUser(m.sender)
      const newName = m.text?.trim()

      if (!newName) {
          return m.reply(`🏷️ *CLAN RENAME*\n\n> ¡Ingresa un nuevo nombre de clan!\n> Costo: *Rp ${RENAME_COST.toLocaleString('id-ID')}*\n\n> Ejemplo:.clanrename DarkPhoenix`)
      }

      if (newName.length > MAX_CLAN_NAME) {
          return m.reply(`❌ Nombre máximo del clan ${MAX_CLAN_NAME} ¡personaje!`)
      }

      if (!/^[a-zA-Z0-9\s]+$/.test(newName)) {
          return m.reply(`❌ ¡Los nombres de los clanes solo pueden ser letras, números y espacios!`)
      }

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!\n> Crea un clan con *.clancreate*`)
      }

      const clan = db.db.data.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      if (clan.leader !== m.sender) {
          return m.reply(`❌ ¡Solo el *líder* del clan puede cambiar el nombre del clan!`)
      }

      const existingClan = Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === newName.toLowerCase())
      if (existingClan && existingClan.id !== clan.id) {
          return m.reply(`❌ Nombre del clan *${newName}*¡ya usado!`)
      }

      if ((user.koin || 0) < RENAME_COST) {
          return m.reply(`❌ ¡No hay suficiente saldo!\n\n> Requerido: *Rp ${RENAME_COST.toLocaleString('id-ID')}*\n> Tienes: *Rp ${(user.koin || 0).toLocaleString('id-ID')}*`)
      }

      const oldName = clan.name
      clan.name = newName
      db.updateKoin(m.sender, -RENAME_COST)
      await db.save()

      let txt = `🏷️ *ᴄʟᴀɴ ʀᴇɴᴀᴍᴇᴅ!*\n\n`
      txt += `╭┈┈⬡「 📋 *ʀᴇꜱᴜʟᴛ* 」\n`
      txt += `┃ 📛 Nombre antiguo: *${oldName}*\n`
      txt += `┃ Nuevo nombre: *${newName}*\n`
      txt += `┃ 👑 Leader: @${m.sender.split('@')[0]}\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
      txt += `> -Rp ${RENAME_COST.toLocaleString('id-ID')}`

      await m.reply(txt, { mentions: [m.sender] })
  }

export { pluginConfig as config, handler }
