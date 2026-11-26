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
    name: "trade",
    alias: [],
    category: "rpg",
    description: "trade",
    usage: ".trade",
    example: ".trade",
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

      const { initRpgUser, sender, pushname, m, reply, rpgDb, text, saveRpg } = A
      initRpgUser(sender, pushname)
                if (!m.quoted) {
                  reply(`reply pesan target trade.\nFormat: *trade itemnamanya* atau *trade 500* (koin)`)
                  return
                }

                let targetId = m.quoted.sender
                initRpgUser(targetId)
                let user = rpgDb[sender]
                let target = rpgDb[targetId]

                if (!text) {
                  reply(`Ketik item atau jumlah koin yang ingin kamu kirim.`)
                  return
                }

                let jumlah = parseInt(text)
                if (!isNaN(jumlah)) {
                  if (user.coin < jumlah) {
                    reply(`Uangmu tidak cukup!`)
                    return
                  }
                  user.coin -= jumlah
                  target.coin += jumlah
                  saveRpg()
                  reply(`✅ Kamu mengirim ${jumlah} 💰 ke ${target.name}`)
                } else {
                  let idx = user.inv.findIndex(i => i === text)
                  if (idx === -1) {
                    reply(`Kamu tidak punya item *${text}*`)
                    return
                  }
                  user.inv.splice(idx, 1)
                  target.inv.push(text)
                  saveRpg()
                  reply(`🎁 Kamu memberikan *${text}* ke ${target.name}`)
                }
}

export { pluginConfig as config, handler }
