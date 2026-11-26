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
    name: "gajian",
    alias: [],
    category: "rpg",
    description: "gajian",
    usage: ".gajian",
    example: ".gajian",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn }) {
    let LastClaim = global.db.data.users[m.sender].lastclaim
    let cdm = `${MeNit(new Date - LastClaim)}`
    let cds = `${DeTik(new Date - LastClaim)}`
    let cd1 = Math.ceil(44 - cdm)
    let cd2 = Math.ceil(59 - cds)
    if (new Date - global.db.data.users[m.sender].lastclaim > 2700000) {
      global.db.data.users[m.sender].money += 50000
      global.db.data.users[m.sender].exp += 100
      m.reply('Nih gaji lu +Rp50.000')
      global.db.data.users[m.sender].lastclaim = new Date * 1
    } else return m.reply(`Lu udah ambil jatah hari ini.\n\nTunggu ${cd1} Menit ${cd2} Detik!`)
  }

  function JaM(ms) {
    let h = isNaN(ms) ? '60' : Math.floor(ms / 3600000) % 60
    return [h].map(v => v.toString().padStart(2, 0) ).join(':')
  }

  function MeNit(ms) {
    let m = isNaN(ms) ? '60' : Math.floor(ms / 60000) % 60
    return [m].map(v => v.toString().padStart(2, 0) ).join(':')
  }

  function DeTik(ms) {
    let s = isNaN(ms) ? '60' : Math.floor(ms / 1000) % 60
    return [s].map(v => v.toString().padStart(2, 0) ).join(':')
  }

export { pluginConfig as config, handler }
