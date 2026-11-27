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
      name: 'clanbank',
      alias: ["cbank"],
      category: "clan",
      description: 'Cek saldo kas clan',
      usage: '.clanbank',
      example: '.clanbank',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 3,
      energi: 0,
      isEnabled: true
  }

  async function handler(m) {
      const db = getDatabase()
      const user = db.getUser(m.sender)

      if (!user.clanId) {
          return m.reply(`❌¡Aún no tienes clan!\n> Crea un clan con *.clancreate*`)
      }

      const clan = db.db.data.clans[user.clanId]
      if (!clan) {
          return m.reply(`❌ ¡Clan no encontrado!`)
      }

      const totalDonations = clan.bank || 0
      const topDonors = Object.entries(clan.donations || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)

      let txt = `🏦 *ᴋᴀꜱ ᴄʟᴀɴ*\n\n`
      txt += `╭┈┈⬡「 📊 *ɪɴꜰᴏ* 」\n`
      txt += `┃ 📛 Clan: *${clan.name}*\n`
      txt += `┃ 💰 Total kas: *Rp ${totalDonations.toLocaleString('id-ID')}*\n`
      txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`

      if (topDonors.length > 0) {
          txt += `╭┈┈⬡「 🎖️ *ᴛᴏᴘ ᴅᴏɴᴀᴛᴏʀ* 」\n`
          for (let i = 0; i < topDonors.length; i++) {
              const [donorId, amount] = topDonors[i]
              const donorData = db.getUser(donorId)
              const name = donorData?.name || donorId.split('@')[0]
              const medal = i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📌'
              txt += `┃ ${medal} ${i+1}. *${name}*\n`
              txt += `┃    └ Rp ${amount.toLocaleString('id-ID')}\n`
          }
          txt += `╰┈┈┈┈┈┈┈┈⬡`
      }

      await m.reply(txt)
  }

export { pluginConfig as config, handler }
