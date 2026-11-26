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
    name: "membunuh",
    alias: [],
    category: "rpg",
    description: "membunuh *@tag*",
    usage: ".membunuh *@tag*",
    example: ".membunuh *@tag*",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, text, usedPrefix, command }) {
      let dapat = (Math.floor(Math.random() * 100000))
      let healtu = (Math.floor(Math.random() * 100))
      let nomors = m.sender
      let who
      if (m.isGroup) who = m.mentionedJid[0]
      else who = m.chat
      if (!who) return m.reply('Tag salah satu lah')

      global.db.data.users[m.sender] = global.db.data.users[m.sender] || {
          money: 0,
          health: 100,
          lastkerja: 0,
          lastsda: 0,
          exp: 0
      }
      global.db.data.users[who] = global.db.data.users[who] || {
          money: 0,
          health: 100,
          lastkerja: 0,
          lastsda: 0,
          exp: 0
      }

      if (typeof global.db.data.users[who] == 'undefined') return m.reply('Pengguna tidak ada didalam data base')

      let __timers = (new Date - global.db.data.users[m.sender].lastsda)
      let _timers = (3600000 - __timers)
      let timers = clockString(_timers)
      let users = global.db.data.users

      if (new Date - users[m.sender].lastsda > 3600000) {
          if (10 > users[who].health) return m.reply('ᴛᴀʀɢᴇᴛ ꜱᴜᴅᴀʜ ᴛɪᴅᴀᴋ ᴍᴇᴍɪʟɪᴋɪ ʜᴇᴀʟᴛʜ💉')
          if (100 > users[who].money) return m.reply('💠ᴛᴀʀɢᴇᴛ ᴛɪᴅᴀᴋ ᴍᴇᴍɪʟɪᴋɪ ᴀᴘᴀᴘᴜɴ :(💠')
          users[who].health -= healtu * 1
          users[who].money -= dapat * 1
          users[m.sender].money += dapat * 1
          users[m.sender].lastsda = new Date * 1
          conn.reply(m.chat, `ᴛᴀʀɢᴇᴛ ʙᴇʀʜᴀꜱɪʟ ᴅɪ ʙᴜɴᴜʜ ᴅᴀɴ ᴋᴀᴍᴜ ᴍᴇɴɢᴀᴍʙɪʟ ᴍᴏɴᴇʏ ᴛᴀʀɢᴇᴛ ꜱᴇʙᴇꜱᴀʀ\n💰${dapat} ᴍᴏɴᴇʏ\nᴅᴀʀᴀʜ ᴛᴀʀɢᴇᴛ ʙᴇʀᴋᴜʀᴀɴɢ -${healtu} ʜᴇᴀʟᴛʜ❤`, m)
      } else conn.reply(m.chat, `Anda Sudah Membunuh Dan Berhasil Sembunyi, tunggu ${timers} untuk membunuh lagi`, m)
  }

  function pickRandom(list) {
      return list[Math.floor(Math.random() * list.length)]
  }
  function clockString(ms) {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
  }

export { pluginConfig as config, handler }
