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
    name: "bet",
    alias: [],
    category: "rpg",
    description: "Taruhan coin",
    usage: ".bet",
    example: ".bet",
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

      const { initRpgUser, sender, pushname, rpgDb, text, reply, fmt, saveRpg, prefix } = A
      initRpgUser(sender, pushname)
      if (!text) return reply(`Masukkan jumlah coin: contoh *${prefix}bet 500*`)
      const jumlah = parseInt(text, 10)
      if (!Number.isInteger(jumlah) || jumlah <= 0) return reply('Jumlah tidak valid.')
      const u = rpgDb[sender]
      if (u.coin < jumlah) return reply(`💸 Coin tidak cukup. Kamu punya ${fmt(u.coin)}.`)

      const menang = Math.random() < 0.45
      if (menang) u.coin += jumlah
      else u.coin -= jumlah
      saveRpg()
      return reply(menang
          ? `🎲 Kamu bertaruh ${fmt(jumlah)} coin di arena dan *MENANG*! 🎉\n+💰 ${fmt(jumlah)} (total ${fmt(u.coin)})`
          : `🎲 Kamu bertaruh ${fmt(jumlah)} coin di arena dan *KALAH*... 😢\n-💰 ${fmt(jumlah)} (sisa ${fmt(u.coin)})`)
}

export { pluginConfig as config, handler }
