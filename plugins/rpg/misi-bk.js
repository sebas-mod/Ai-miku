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
    name: "misi-bk",
    alias: ["misibk"],
    category: "rpg",
    description: "misi",
    usage: ".misi",
    example: ".misi",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, usedPrefix }) {
      let caption = `
🚨 Silahkan Pilih Misi Kamu:

🛵 Ojek
🚀 Roket
👮 Polisi
🚶 Rob
☠️ Hitman
🚖 Taxy

Contoh:
${usedPrefix}ojek
`.trim()
      m.reply(caption)
  }

export { pluginConfig as config, handler }
