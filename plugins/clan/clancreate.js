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
      name: 'clancreate',
      alias: ["buatclan"],
      category: "clan",
      description: 'Buat clan baru',
      usage: '.clancreate <nama>',
      example: '.clancreate DragonSlayer',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 10,
      energi: 0,
      isEnabled: true
  }

  const CLAN_CREATE_COST = 50000
  const MAX_CLAN_NAME = 20
  const CLAN_EMBLEMS = ['🐉', '🦅', '🐺', '🦁', '🔥', '⚡', '🌙', '☀️', '💎', '🗡️']

  function generateShortId(name, existingClans) {
      const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase()
      let id = clean.length >= 3 ? clean.slice(0, 3) : clean.padEnd(3, 'X')
      if (!existingClans[id]) return id
      id = clean.slice(0, 4) || id
      if (!existingClans[id]) return id
      for (let i = 1; i <= 99; i++) {
          const attempt = clean.slice(0, 3) + i
          if (!existingClans[attempt]) return attempt
      }
      return clean.slice(0, 2) + Math.random().toString(36).slice(2, 5).toUpperCase()
  }

  async function handler(m) {
      const db = getDatabase()
      const user = db.getUser(m.sender)
      const clanName = m.text?.trim()

      if (!clanName) {
          return m.reply(
              `⚔️ *CREATE CLAN*\n\n` +
              `Buat clan dan kumpulkan member!\n\n` +
              `Biaya: *Rp ${CLAN_CREATE_COST.toLocaleString('id-ID')}*\n` +
              `Nombre máximo: *${MAX_CLAN_NAME} personaje*\n\n` +
              `Ejemplo: *.clancreate DragonSlayer*`
          )
      }

      if (clanName.length > MAX_CLAN_NAME) {
          return m.reply(`❌ Nombre máximo del clan ${MAX_CLAN_NAME} personaje`)
      }

      if (!/^[a-zA-Z0-9\s]+$/.test(clanName)) {
          return m.reply(`❌ Los nombres de los clanes solo pueden ser letras, números y espacios.`)
      }



      if (user.clanId) {
          return m.reply(`❌ Ya tienes un clan\nSalir primero: *.clanleave*`)
      }

      const existingClan = Object.values(db.clans).find(c => c.name.toLowerCase() === clanName.toLowerCase())
      if (existingClan) {
          return m.reply(`❌ Nombre *${clanName}*ya usado`)
      }

      if ((user.koin || 0) < CLAN_CREATE_COST) {
          return m.reply(
              `❌ No hay suficientes monedas\n\n` +
              `Butuh: *Rp ${CLAN_CREATE_COST.toLocaleString('id-ID')}*\n` +
              `Punya: *Rp ${(user.koin || 0).toLocaleString('id-ID')}*`
          )
      }

      const emblem = CLAN_EMBLEMS[Math.floor(Math.random() * CLAN_EMBLEMS.length)]
      const clanId = generateShortId(clanName, db.clans)
      const clan = {
          id: clanId,
          name: clanName,
          emblem,
          leader: m.sender,
          members: [m.sender],
          exp: 0,
          level: 1,
          wins: 0,
          losses: 0,
          createdAt: new Date().toISOString(),
          description: 'Belum ada deskripsi',
          isOpen: true
      }

      db.clans[clanId] = clan
      db.updateKoin(m.sender, -CLAN_CREATE_COST)
      db.setUser(m.sender, { clanId })
      await db.save()

      await m.reply(
          `${emblem} *CLAN CREATED*\n\n` +
          `*${clanName}*\n` +
          `Leader: @${m.sender.split('@')[0]}\n` +
          `Status: Open · 1/50 members\n\n` +
          `_-Rp ${CLAN_CREATE_COST.toLocaleString('id-ID')}_\n\n` +
          `Invitar amigos: *.claninvite @user*\n` +
          `O comparte ID: *${clanId}*`,
          { mentions: [m.sender] }
      )
  }

export { pluginConfig as config, handler }
