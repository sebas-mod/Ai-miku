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
    name: "talent",
    alias: [],
    category: "rpg",
    description: "talent",
    usage: ".talent",
    example: ".talent",
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

      const { initRpgUser, sender, pushname, rpgDb, reply } = A
      initRpgUser(sender, pushname)
                let kelas = rpgDb[sender].class || 'belum memilih'
                let teks = {
                  knight: '⚔️ Damage +10 saat duel',
                  mage: '🔮 Skill cooldown -10%',
                  archer: '🏹 Critical +15%'
                }
                reply(`💡 *Talent Class ${kelas}:*\n${teks[kelas] || 'Belum tersedia'}`)
}

export { pluginConfig as config, handler }
