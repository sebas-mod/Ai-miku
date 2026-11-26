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
    name: "mailbox",
    alias: [],
    category: "rpg",
    description: "mailbox",
    usage: ".mailbox",
    example: ".mailbox",
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

      const { initRpgUser, sender, pushname, reply } = A
      initRpgUser(sender, pushname)
                global.mailbox ||= {}
                global.mailbox[sender] ||= []

                let mails = global.mailbox[sender]
                if (!mails.length) return reply(`📭 Kotak suratmu kosong.`)

                let teks = `💌 *MAILBOX:*\n` + mails.map((m, i) => `${i + 1}. Dari: ${m.from}\n📦: ${m.item}`).join('\n\n')
                reply(teks)
}

export { pluginConfig as config, handler }
