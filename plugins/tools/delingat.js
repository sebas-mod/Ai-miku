/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const delReminders = ElysiaRuntime.delReminders;
const listReminders = ElysiaRuntime.listReminders;
const userOf = ElysiaRuntime.userOf;

const pluginConfig = {
    name: "delingat",
    alias: [],
    category: "tools",
    description: "delingat <no|all>",
    usage: ".delingat <no|all>",
    example: ".delingat <no|all>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const mine = (r, sender) => userOf(r.sender) === userOf(sender)

  async function handler(m, { text, sender, reply, example }) {
      const input = String(text || '').trim()
      const rows = listReminders().filter(r => mine(r, sender)).sort((a, b) => a.due - b.due)
      if (!rows.length) return reply('Kamu belum punya pengingat aktif.')
      if (/^(all|semua)$/i.test(input)) {
          const n = delReminders(r => mine(r, sender))
          return reply(`✅ ${n} pengingat dihapus.`)
      }
      const no = parseInt(input)
      if (!no || no < 1 || no > rows.length) return example('1  (nomor dari .listingat) atau all')
      delReminders(r => r.id === rows[no - 1].id)
      return reply(`✅ Pengingat no. ${no} dihapus.`)
  }

export { pluginConfig as config, handler }
