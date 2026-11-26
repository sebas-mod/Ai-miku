/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const listReminders = ElysiaRuntime.listReminders;
const userOf = ElysiaRuntime.userOf;
const formatRemaining = ElysiaRuntime.formatRemaining;
const formatWib = ElysiaRuntime.formatWib;

const pluginConfig = {
    name: "listingat",
    alias: [],
    category: "tools",
    description: "listingat",
    usage: ".listingat",
    example: ".listingat",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const mine = (r, sender) => userOf(r.sender) === userOf(sender)

  async function handler(m, { prefix, sender, reply }) {
      const rows = listReminders().filter(r => mine(r, sender)).sort((a, b) => a.due - b.due)
      if (!rows.length) return reply('Kamu belum punya pengingat aktif.')
      return reply(
          `*▢ PENGINGATMU* (${rows.length})\n\n` +
          rows.map((r, i) => `${i + 1}. ${r.text.slice(0, 80)}\n   ⏰ ${formatWib(r.due)} (${formatRemaining(r.due)} lagi)`).join('\n') +
          `\n\nHapus: ${prefix}delingat <nomor | all>`
      )
  }

export { pluginConfig as config, handler }
