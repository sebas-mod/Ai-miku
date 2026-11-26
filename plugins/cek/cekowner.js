/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { isOwner, isPremium } from "../../src/helper.js"

const pluginConfig = {
  name: "cekowner",
  alias: ["ownerinfo", "cekrole"],
  category: "cek",
  description: "Cek kasta & status role user (Owner / Premium / Warga Sipil)",
  usage: ".cekowner [@user / reply / nomor]",
  example: ".cekowner @user",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  isAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
}

async function handler(m, { text }) {
  let jid = m.quoted?.sender || m.mentionedJid?.[0]
  if (!jid) {
    const num = String(text || "").replace(/[^0-9]/g, "")
    jid = num
      ? `${num.startsWith("0") ? "62" + num.slice(1) : num}@s.whatsapp.net`
      : m.sender
  }
  const number = jid.split("@")[0]
  const owner = Boolean(isOwner(number))
  const premium = owner || Boolean(isPremium(number))

  let badge = "🌱 Warga Sipil (Free User)"
  let aura = "Aura Pejuang Kuota Harian"
  if (owner) {
    badge = "👑 Supreme Developer / Owner"
    aura = "Aura Penguasa Server Tak Terbatas"
  } else if (premium) {
    badge = "💎 Sultan VIP (Premium Member)"
    aura = "Aura Ningrat Bebas Limit"
  }

  const msg =
    `╭───〔 🪪 *KARTU KASTA MEMBER* 🪪 〕───╮\n` +
    `│ 👤 *User*   : @${number}\n` +
    `│ 🏷️ *Status* : *${badge}*\n` +
    `│ ✨ *Aura*   : ${aura}\n` +
    `╰──────────────────────────────────╯`

  await m.reply(msg, { mentions: [jid] })
}

export { pluginConfig as config, handler }
