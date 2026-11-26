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
    name: "storyquest",
    alias: [],
    category: "rpg",
    description: "storyquest",
    usage: ".storyquest",
    example: ".storyquest",
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

      const { initRpgUser, sender, rpgDb, reply } = A
      switch (0) {
          default:
              {
                initRpgUser(sender)
                let user = rpgDb[sender]

                let story = user.story || 0
                let list = [
                  '🌄 Kamu terbangun di desa terpencil...',
                  '🧙 Seorang penyihir tua memanggilmu untuk misi suci...',
                  '🐉 Kamu mendengar rumor tentang naga di gunung utara...',
                  '🏰 Sebuah kerajaan membutuhkan pertolonganmu...',
                  '☠️ Sebuah makhluk gelap mengintai dunia ini...'
                ]
                let teks = `📜 *STORY QUEST*\n\n${list[story % list.length]}\n\nKetik *nextquest* untuk lanjut cerita.`
                return reply(teks)
              }
      }
}

export { pluginConfig as config, handler }
