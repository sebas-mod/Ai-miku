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
    name: "narrator",
    alias: [],
    category: "rpg",
    description: "narrator",
    usage: ".narrator",
    example: ".narrator",
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

      const { reply } = A
      switch (0) {
          default:
              {
                let teks = `🎙️ *Narator Berbisik...*\n\n“Langkahmu baru saja dimulai. Dunia menantimu.”\n\nGunakan *storyquest* untuk menjelajah kisahmu.`
                return reply(teks)
              }
      }
}

export { pluginConfig as config, handler }
