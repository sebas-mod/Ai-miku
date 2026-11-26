/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const invCount = ElysiaRuntime.invCount;
const invTake = ElysiaRuntime.invTake;

const pluginConfig = {
    name: "craft",
    alias: [],
    category: "rpg",
    description: "Craft armor (tulang + kulit)",
    usage: ".craft",
    example: ".craft",
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

      const { initRpgUser, sender, pushname, rpgDb, reply, saveRpg } = A
      initRpgUser(sender, pushname)
      const u = rpgDb[sender]
      const bahan = ['tulang', 'kulit']
      const hasil = 'armor'

      if (!bahan.every(b => invCount(u, b) > 0)) return reply(`🧪 Untuk membuat *${hasil}*, kamu butuh:\n- tulang\n- kulit`)
      for (const b of bahan) invTake(u, b, 1)
      u.inv.push(hasil)
      saveRpg()
      return reply(`🧪 Kamu berhasil membuat *${hasil}*!`)
}

export { pluginConfig as config, handler }
