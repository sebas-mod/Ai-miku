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
    name: "loot",
    alias: [],
    category: "rpg",
    description: "loot",
    usage: ".loot",
    example: ".loot",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(_m, A) {

      const { initRpgUser, sender, pushname, m, reply, rpgDb, saveRpg } = A
      initRpgUser(sender, pushname)
                if (!m.quoted) return reply(`reply ke pesan musuh yang mati.`)
                let target = m.quoted.sender
                initRpgUser(target)

                let musuh = rpgDb[target]
                if (musuh.hp > 0) return reply(`🎯 Target masih hidup.`)

                if (musuh.inv.length === 0) return reply(`📭 Tidak ada barang untuk di-loot.`)

                let ambil = musuh.inv.splice(0, 1)[0]
                rpgDb[sender].inv.push(ambil)
                saveRpg()
                reply(`💰 Kamu berhasil mengambil *${ambil}* dari musuh.`)
}

export { pluginConfig as config, handler }
