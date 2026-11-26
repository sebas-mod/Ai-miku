/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { getThumbUrl } from '../../src/lib/core/media.js'

const pluginConfig = {
    name: "me",
    alias: ["me-utama", "rpgme", "statusrpg"],
    category: "rpg",
    description: "Status petualang RPG lengkap dengan foto profil pengguna",
    usage: ".me",
    example: ".me",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, conn }) {
  const client = sock || conn
  const store = (global.db ||= { data: { users: {} } })
  store.data ||= { users: {} }
  store.data.users ||= {}
  const user = (store.data.users[m.sender] ||= { level: 1, exp: 0, health: 100, maxhealth: 100, stamina: 100, money: 0, bank: 0, diamond: 0, emerald: 0, limit: 0 })
  const fmt = (n) => (Number(n) || 0).toLocaleString('id-ID')
  const bar = (v, max = 100) => {
    const f = Math.min(8, Math.max(0, Math.round((Number(v || 0) / Math.max(1, max)) * 8)))
    return '▰'.repeat(f) + '▱'.repeat(8 - f)
  }

  const caption = [
    `✦「 👑 *STATUS PETUALANG ELYSIA* 」`,
    `   ✧ Petualang : @${m.sender.split('@')[0]}`,
    `   ✧ Level     : *Lv.${user.level || 1}*`,
    `   ✧ EXP       : *${fmt(user.exp)} XP*`,
    ``,
    `✦「 ⚔️ *ATRIBUT* 」`,
    `   ✧ ❤️ Health  : ${bar(user.health, user.maxhealth || 100)} *${user.health || 100}*`,
    `   ✧ ⚡ Stamina : ${bar(user.stamina, 100)} *${user.stamina || 100}*`,
    ``,
    `✦「 💰 *ASET* 」`,
    `   ✧ Money     : *Rp ${fmt(user.money)}*`,
    `   ✧ Bank      : *Rp ${fmt(user.bank)}*`,
    `   ✧ Permata   : 💎 *${fmt(user.diamond)}* | ❇️ *${fmt(user.emerald)}*`,
    `   ✧ Limit     : 🎫 *${fmt(user.limit)}*`,
  ].join('\n')

  let ppUrl = null
  try {
    ppUrl = await client.profilePictureUrl(m.sender, 'image')
  } catch {}
  const finalPp = ppUrl || getThumbUrl('ppKosong') || 'https://i.imgur.com/TuItj4L.png'

  try {
    await client.sendMessage(m.chat, { image: { url: finalPp }, caption, mentions: [m.sender] }, { quoted: m })
  } catch {
    await client.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m })
  }
}

export { pluginConfig as config, handler }
