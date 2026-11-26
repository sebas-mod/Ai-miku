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
    name: "bankcek",
    alias: ["cekbank"],
    category: "rpg",
    description: "Cek rincian rekening bank, ATM, dan aset RPG",
    usage: ".bankcek [@user]",
    example: ".bankcek",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const fmt = (n) => (Number(n) || 0).toLocaleString('id-ID')

async function handler(m, { reply }) {
  const who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const store = (global.db ||= { data: { users: {} } })
  store.data ||= { users: {} }
  store.data.users ||= {}
  const user = (store.data.users[who] ||= { name: m.pushName || who.split('@')[0], registered: true, atm: 0, bank: 0, fullatm: 1000000, money: 0, chip: 0, robo: 0 })

  const text = [
    `✦「 💳 *DETAIL REKENING BANK* 」`,
    `   ✧ Pemilik   : *${user.name || m.pushName || who.split('@')[0]}*`,
    `   ✧ Target    : @${who.split('@')[0]}`,
    `   ✧ Kartu ATM : ${Number(user.atm) > 0 ? `Level ${fmt(user.atm)} ✅` : 'Belum Punya ❌'}`,
    `   ✧ Saldo Bank: 🏦 Rp ${fmt(user.bank)} / Rp ${fmt(user.fullatm || 1000000)}`,
    `   ✧ Dompet    : 💰 Rp ${fmt(user.money)}`,
    `   ✧ Chip      : 🪙 ${fmt(user.chip)}`,
    `   ✧ Robo      : 🤖 ${Number(user.robo) > 0 ? `Level ${user.robo}` : 'Tidak Ada'}`,
  ].join('\n')

  await reply(text, { mentions: [who] })
}

export { pluginConfig as config, handler }
