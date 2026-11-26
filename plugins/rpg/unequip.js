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
    name: "unequip",
    alias: [],
    category: "rpg",
    description: "unequip",
    usage: ".unequip",
    example: ".unequip",
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
                let user = rpgDb[sender]
                let removed = []

                if (user.weapon) {
                  user.inv.push(user.weapon)
                  removed.push(`🗡️ ${user.weapon}`)
                  user.weapon = ''
                }
                if (user.armor) {
                  user.inv.push(user.armor)
                  removed.push(`🛡️ ${user.armor}`)
                  user.armor = ''
                }

                if (!removed.length) {
                  reply(`Kamu tidak sedang memakai senjata atau armor.`)
                  return
                }

                saveRpg()
                reply(`🔧 Kamu melepas:\n${removed.join('\n')}`)
}

export { pluginConfig as config, handler }
