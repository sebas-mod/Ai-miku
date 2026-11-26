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
    name: "bank-utama",
    alias: ["rpgbank", "bankrpg"],
    category: "rpg",
    description: "Cek saldo Bank RPG Utama (Money, Bank, ATM)",
    usage: ".bank-utama",
    example: ".bank-utama",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { reply, prefix }) {
  const store = (global.db ||= { data: { users: {} } })
  store.data ||= { users: {} }
  store.data.users ||= {}
  const user = (store.data.users[m.sender] ||= { money: 0, bank: 0, atm: 0, fullatm: 1000000 })
  const fmt = (n) => (Number(n) || 0).toLocaleString('id-ID')
  const p = prefix || m.prefix || '.'

  const text = [
    `✦「 🏦 *ELYSIA RPG BANK UTAMA* 」`,
    `   ✧ Dompet  : 💰 Rp ${fmt(user.money)}`,
    `   ✧ Bank    : 🏦 Rp ${fmt(user.bank)}`,
    `   ✧ ATM     : 💳 ${Number(user.atm) > 0 ? `Level ${user.atm} ✅` : 'Belum Punya ❌'}`,
    ``,
    `✦「 📌 *PERINTAH TERKAIT* 」`,
    `   ✧ ${p}deposit <jumlah> — Setor ke bank`,
    `   ✧ ${p}withdraw <jumlah> — Tarik dari bank`,
    `   ✧ ${p}buyatm — Beli kartu ATM`,
    `   ✧ ${p}bank — Menu bank lengkap (transfer, pinjam, bunga)`,
  ].join('\n')

  await reply(text)
}

export { pluginConfig as config, handler }
