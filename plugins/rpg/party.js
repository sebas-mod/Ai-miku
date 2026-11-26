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
    name: "party",
    alias: [],
    category: "rpg",
    description: "party",
    usage: ".party",
    example: ".party",
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

      const { initRpgUser, sender, pushname, text, rpgDb, reply } = A
      initRpgUser(sender, pushname)
                global.partyList = global.partyList || {}

                if (!text) {
                  let party = global.partyList[sender] || []
                  let daftar = party.map((id, i) => `${i + 1}. ${rpgDb[id]?.name || 'Tidak dikenal'}`).join('\n') || 'Belum ada anggota.'
                  reply(`👥 *PARTY-MU:*\n${daftar}`)
                  return
                }

                if (m.quoted) {
                  let target = m.quoted.sender
                  initRpgUser(target)
                  global.partyList[sender] ||= []
                  if (!global.partyList[sender].includes(target)) {
                    global.partyList[sender].push(target)
                    reply(`✅ ${rpgDb[target].name} telah ditambahkan ke party-mu.`)
                  } else {
                    reply(`⚠️ Player sudah ada di party.`)
                  }
                  return
                }

                reply(`reply ke player yang ingin kamu ajak ke party.`)
}

export { pluginConfig as config, handler }
