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
    name: "mulai",
    alias: [],
    category: "rpg",
    description: "mulai",
    usage: ".mulai",
    example: ".mulai",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn }) {
    let user = global.db.data.users[m.sender]
    if (!user) return

    if (user.rpg) return m.reply('🧙 Kamu sudah memulai petualangan!')

    user.rpg = {
      level: 1,
      exp: 0,
      hp: 100,
      atk: 10,
      gold: 50,
      inventory: [],
      lastHunt: 0
    }

    m.reply(`🎮 Petualangan dimulai!\n\n📊 Level: 1\n❤️ HP: 100\n🪙 Gold: 50\n🔪 ATK: 10\n\nGunakan *.berburu* untuk mulai bertarung!`)
  }

export { pluginConfig as config, handler }
