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
    name: "cookbook",
    alias: [],
    category: "rpg",
    description: "cookbook",
    usage: ".cookbook",
    example: ".cookbook",
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
      reply(`📖 *Resep Masakan:*\n- supikan = ikan (hasil .fish) + air (gratis)\n- nasiherba = nasi (gandum hasil .farm) + herba (hasil .forage)\n\nMasak dengan: *.cook <nama resep>*`)
}

export { pluginConfig as config, handler }
