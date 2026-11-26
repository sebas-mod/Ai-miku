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
      name: 'clanleaderboard',
      alias: ["cleaderboard"],
      category: "clan",
      description: 'Lihat ranking clan',
      usage: '.clanleaderboard',
      example: '.clanleaderboard',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
    isRegistered: true,
      cooldown: 5,
      energi: 0,
      isEnabled: true
  }

  function getRankTitle(level) {
      if (level >= 50) return '👑'
      if (level >= 30) return '💎'
      if (level >= 20) return '🏆'
      if (level >= 10) return '🥇'
      if (level >= 5) return '🥈'
      return '🥉'
  }

  async function handler(m) {
      const db = getDatabase()

      if (!db.db.data.clans) db.db.data.clans = {}

      const clans = Object.values(db.db.data.clans)
      if (clans.length === 0) {
          return m.reply(`🏰 Belum ada clan terdaftar\n\nBuat: *.clancreate <nama>*`)
      }

      clans.sort((a, b) => {
          const scoreA = ((a.wins || 0) * 100) + (a.exp || 0) + ((a.level || 1) * 500)
          const scoreB = ((b.wins || 0) * 100) + (b.exp || 0) + ((b.level || 1) * 500)
          return scoreB - scoreA
      })

      const medals = ['🥇', '🥈', '🥉']

      let txt = `🏰 *CLAN LEADERBOARD*\n\n`

      clans.slice(0, 10).forEach((clan, i) => {
          const medal = medals[i] || `${i + 1}.`
          const totalGames = (clan.wins || 0) + (clan.losses || 0)
          const winRate = totalGames > 0
              ? ((clan.wins / totalGames) * 100).toFixed(0)
              : '—'
          const emblem = clan.emblem || '🏰'
          const rank = getRankTitle(clan.level || 1)

          txt += `${medal} ${emblem} *${clan.name}*\n`
          txt += `   ${rank} Lv.${clan.level || 1} · ${clan.wins || 0}W/${clan.losses || 0}L (${winRate}%) · 👥 ${clan.members.length}\n\n`
      })

      txt += `Total *${clans.length}* clan terdaftar`

      await m.reply(txt)
  }

export { pluginConfig as config, handler }
