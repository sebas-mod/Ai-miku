/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const saveDB = ElysiaRuntime.saveDB;
const isLidJid = ElysiaRuntime.isLidJid;
const digits = ElysiaRuntime.digits;
const userOf = ElysiaRuntime.userOf;
const rpgStore = ElysiaRuntime.rpgStore;
const toPN = ElysiaRuntime.toPN;
const makeDefaultUser = ElysiaRuntime.makeDefaultUser;

const pluginConfig = {
    name: "addrpg",
    alias: [],
    category: "rpg",
    description: "addrpg <field> <@user|nomor> <jumlah>",
    usage: ".addrpg <field> <@user|nomor> <jumlah>",
    example: ".addrpg <field> <@user|nomor> <jumlah>",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const SUFFIX = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }
  const MAX = 1e15
  const fmt = (n) => Math.floor(Number(n) || 0).toLocaleString('id-ID')

  const PETS = ['horse', 'cat', 'fox', 'dog', 'dragon', 'wolf', 'phoenix', 'lion', 'centaur', 'griffin', 'kyubi', 'robo']
  const EXTRA_FIELDS = new Set([
      ...PETS, ...PETS.map(p => p + 'exp'),
      'freelimit', 'plastik', 'gelas', 'sand', 'clay', 'chip', 'medal'
  ])

  const USAGE = `
Contoh penggunaan:

.addrpg money @tag 10000
.addrpg exp @tag 5000
.addrpg limit @tag 50
.addrpg level @tag 1
.addrpg bank @tag 10000
.addrpg gold @tag 100

⚔️ Equipment
.addrpg armor @tag 1
.addrpg sword @tag 1
.addrpg pickaxe @tag 1
.addrpg axe @tag 1
.addrpg fishingrod @tag 1
.addrpg atm @tag 1

🛠️ Durability
.addrpg sworddurability @tag 100
.addrpg pickaxedurability @tag 100
.addrpg axedurability @tag 100
.addrpg fishingroddurability @tag 100
.addrpg armordurability @tag 100

🐾 Pet
.addrpg horse @tag 1
.addrpg horseexp @tag 100
.addrpg cat @tag 1
.addrpg catexp @tag 100
.addrpg fox @tag 1
.addrpg foxexp @tag 100
.addrpg dragon @tag 1
.addrpg dragonexp @tag 500
.addrpg wolf @tag 1
.addrpg phoenix @tag 1
.addrpg centaur @tag 1
.addrpg griffin @tag 1
.addrpg kyubi @tag 1
.addrpg robo @tag 1

📊 Status
.addrpg health @tag 100
.addrpg stamina @tag 100
.addrpg mana @tag 50
.addrpg energy @tag 100
.addrpg warn @tag 1

💎 Material
.addrpg potion @tag 10
.addrpg wood @tag 100
.addrpg rock @tag 100
.addrpg coal @tag 100
.addrpg iron @tag 100
.addrpg string @tag 100
.addrpg diamond @tag 50
.addrpg emerald @tag 50
.addrpg trash @tag 100
.addrpg bait @tag 50
.addrpg fertilizer @tag 50

📦 Crate
.addrpg common @tag 10
.addrpg uncommon @tag 10
.addrpg mythic @tag 5
.addrpg legendary @tag 5

Item
.addrpg apel @tag 50
.addrpg mangga @tag 20
.addrpg jeruk @tag 20
.addrpg pisang @tag 20
.addrpg anggur @tag 20
.addrpg durian @tag 20

🌱 Bibit
.addrpg bibitapel @tag 5
.addrpg bibitmangga @tag 5
.addrpg bibitjeruk @tag 5
.addrpg bibitpisang @tag 5
.addrpg bibitanggur @tag 5
.addrpg bibitdurian @tag 5

🐄 Hewan
.addrpg ayam @tag 10
.addrpg sapi @tag 5
.addrpg kambing @tag 5
.addrpg kerbau @tag 5
.addrpg babi @tag 5
.addrpg banteng @tag 1
.addrpg harimau @tag 1
.addrpg gajah @tag 1
.addrpg panda @tag 1
.addrpg buaya @tag 1
.addrpg monyet @tag 1
.addrpg babihutan @tag 1

🐟 Ikan
.addrpg ikan @tag 20
.addrpg lele @tag 20
.addrpg nila @tag 20
.addrpg bawal @tag 20
.addrpg udang @tag 20
.addrpg kepiting @tag 20
.addrpg paus @tag 5

🍗 Makanan
.addrpg ayambakar @tag 5
.addrpg ayamgoreng @tag 5
.addrpg oporayam @tag 5
.addrpg gulaiayam @tag 5
.addrpg steak @tag 5
.addrpg rendang @tag 5
.addrpg babipanggang @tag 5
.addrpg ikanbakar @tag 5
.addrpg lelebakar @tag 5
.addrpg nilabakar @tag 5
.addrpg bawalbakar @tag 5
.addrpg udangbakar @tag 5
.addrpg pausbakar @tag 5
.addrpg kepitingbakar @tag 5

♻️ Mulung
.addrpg botol @tag 20
.addrpg kaleng @tag 20
.addrpg kardus @tag 20
.addrpg tiketcoin @tag 5

🧰 Lainnya
.addrpg list            lihat semua field angka kamu
.addrpg list @tag       lihat semua field angka user lain
.addrpg money 5k        tanpa target = diri sendiri
.addrpg money @tag 2m   singkatan: k = ribu, m = juta, b = miliar, t = triliun
.addrpg money 628xxx 100   target pakai nomor
.addrpg money @tag -500    jumlah minus = kurangi (minimal 0)
(reply pesan user lalu ketik .addrpg money 1000)

💡 Semua field numerik yang ada di database user dapat ditambahkan menggunakan command ini.
`.trim()

  function parseAmount(tok) {
      const s = String(tok || '').trim().toLowerCase().replace(/^\+/, '')
      const mm = s.match(/^(-?\d+(?:[.,]\d+)*)([kmbt])?$/)
      if (!mm) return null
      const v = mm[2] ? parseFloat(mm[1].replace(',', '.')) * SUFFIX[mm[2]] : Number(mm[1].replace(/[.,]/g, ''))
      if (!Number.isFinite(v)) return null
      return Math.floor(v)
  }

  const numericFields = (user) => Object.keys(user).filter(k => typeof user[k] === 'number')

  async function handler(m, { sock, text, prefix, command, reply }) {
      const tokens = String(text || '').split(/\s+/).filter(Boolean)
      if (!tokens.length) return reply(USAGE)

      const type = tokens[0].toLowerCase()
      const isList = /^(list|daftar|field|fields)$/.test(type)

      let amount = null, amountIdx = -1
      if (!isList) {
          for (let i = tokens.length - 1; i >= 1; i--) {
              const a = parseAmount(tokens[i])
              if (a !== null) { amount = a; amountIdx = i; break }
          }
          if (amount === null) return reply(`Jumlah harus berupa angka.\n\nContoh: ${prefix}${command} ${type} @tag 100\nKetik *${prefix}${command}* untuk daftar lengkap.`)
          if (amount === 0) return reply('Jumlah tidak boleh 0.')
          if (Math.abs(amount) > MAX) return reply('Jumlah terlalu besar.')
      }

      let target = m.mentionedJid?.[0] || m.quoted?.sender || null
      if (!target) {
          const upto = isList ? tokens.length : amountIdx
          const num = tokens.slice(1, upto).find(t => /^\+?\d{9,15}$/.test(t))
          if (num) target = `${digits(num).replace(/^0/, '62')}@s.whatsapp.net`
      }
      target ||= m.sender

      const pn = await toPN(sock, target)
      if (isLidJid(pn)) {
          return reply(`Nomor user tidak bisa dikenali (ID tersembunyi). Pakai nomornya:\n${prefix}${command} ${type} 628xxx${isList ? '' : ' ' + amount}`)
      }

      const users = rpgStore().users
      const user = users[pn] ||= makeDefaultUser(userOf(pn))

      if (isList) {
          const keys = numericFields(user).sort()
          const rows = keys.map(k => `${k}: ${fmt(user[k])}`)
          return reply(`📋 *Field angka @${userOf(pn)}* (${keys.length})\n\n${rows.join('\n')}`, { mentions: [pn] })
      }

      if (!(type in user) && EXTRA_FIELDS.has(type)) user[type] = 0

      if (!(type in user)) {
          const like = numericFields(user).filter(k => k.includes(type) || type.includes(k)).slice(0, 8)
          const hint = like.length ? `\n\nMaksud kamu: ${like.map(k => '*' + k + '*').join(', ')}?` : ''
          return reply(`Field *${type}* tidak ditemukan dalam database user.${hint}\n\nKetik *${prefix}${command} list* untuk melihat semua field.`)
      }
      if (typeof user[type] !== 'number') return reply(`Field *${type}* bukan tipe angka.`)

      const before = user[type]
      user[type] = Math.min(MAX, Math.max(0, before + amount))
      saveDB(global.db)

      const sign = amount > 0 ? 'menambahkan' : 'mengurangi'
      return reply(
          `✅ Berhasil ${sign} *${fmt(Math.abs(amount))}* ${amount > 0 ? 'ke' : 'dari'} *${type}*\n\n` +
          `👤 @${userOf(pn)}\n` +
          `📦 ${type}: ${fmt(before)} ➜ *${fmt(user[type])}*`,
          { mentions: [pn] }
      )
  }

export { pluginConfig as config, handler }
