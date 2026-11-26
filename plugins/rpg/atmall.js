/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "atmall",
    alias: [],
    category: "rpg",
    description: "atmall",
    usage: ".atmall",
    example: ".atmall",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, A) {

      const { rpgDb, fmt, reply } = A
      switch (0) {
          default:
              {
                const ranking = Object.entries(rpgDb)
                  .map(([id,u]) => ({ id, bank: (u&&u.bank)||0, name: (u&&u.name)||id.split('@')[0] }))
                  .sort((a,b)=>b.bank-a.bank)
                  .slice(0, 10)

                const teks = `🏦 *ATMALL LEADERBOARD*\n\n` +
                  (ranking.length
                    ? ranking.map((u,i)=> `${i+1}. ${u.name} → ${fmt(u.bank)} coin`).join('\n')
                    : 'Belum ada data.')

                return reply(teks)
              }
      }
}

export { pluginConfig as config, handler }
