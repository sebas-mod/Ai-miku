/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const cfg = ElysiaRuntime.cfg;
const beri = ElysiaRuntime.beri;
const fmt = ElysiaRuntime.fiturFmt;
const wibDay = ElysiaRuntime.wibDay;
const durasi = ElysiaRuntime.durasi;

const pluginConfig = {
    name: "gacha",
    alias: [],
    category: "rpg",
    description: "gacha",
    usage: ".gacha",
    example: ".gacha",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const HADIAH = [
      { w: 40,   nama: 'Permen hiburan',      emoji: '🍬', r: { money: 500 } },
      { w: 25,   nama: 'Kue kecil',           emoji: '🍪', r: { money: 2500 } },
      { w: 15,   nama: 'Pudding manis',       emoji: '🍮', r: { money: 5000 } },
      { w: 10,   nama: 'Kotak camilan',       emoji: '🍡', r: { money: 2000, exp: 500 } },
      { w: 5,    nama: 'Tiket limit',         emoji: '🎫', r: { limit: 1 } },
      { w: 3,    nama: 'Tiket limit x2',      emoji: '🎫', r: { limit: 2 } },
      { w: 1.2,  nama: 'Tiket limit x3',      emoji: '🍓', r: { limit: 3 } },
      { w: 0.6,  nama: 'Tiket limit x5',      emoji: '🍰', r: { limit: 5 } },
      { w: 0.15, nama: 'Tiket limit x10',     emoji: '✨', r: { limit: 10 } },
      { w: 0.05, nama: 'JACKPOT strawberry!', emoji: '🍓', r: { limit: 20, money: 50000 } }
  ]
  const PITY_MIN = HADIAH.findIndex((h) => h.r.limit >= 3)

  function undi(dariIndex = 0) {
      const pool = HADIAH.slice(dariIndex)
      const total = pool.reduce((a, h) => a + h.w, 0)
      let x = Math.random() * total
      for (const h of pool) { if ((x -= h.w) < 0) return h }
      return pool[0]
  }

  const teksR = (r) => Object.entries(r).map(([k, v]) => `${{ limit: '🎫 Limit', money: '💹 Money', exp: 'Exp' }[k] || k} +${fmt(v)}`).join('\n')

  async function handler(m, ctx) {
      const { args } = ctx

      const c = cfg('gacha')
      if ((args[0] || '').toLowerCase() === 'info') {
          const baris = HADIAH.map((h) => `${h.emoji} ${h.nama} — ${h.w}%\n     ${teksR(h.r).replace(/\n/g, ' • ')}`)
          return m.reply(`*HADIAH GACHA*\n\n${baris.join('\n')}\n\n Biaya: 💹 ${fmt(c.biaya)} (1x gratis tiap hari)\n Pity: setiap ${c.pityTiap}x putar berbayar, hadiah minimal Tiket limit x3`)
      }

      const user = global.db.data.users[m.sender]
      const hari = wibDay()
      if (!user.gacha || user.gacha.day !== hari) user.gacha = { day: hari, putar: 0, gratis: false, last: 0, pity: user.gacha?.pity || 0 }
      const g = user.gacha

      const tunggu = (g.last + c.cooldownDetik * 1000) - Date.now()
      if (tunggu > 0) return m.reply(`Sabar ya, tunggu ${durasi(tunggu)} lagi sebelum putar gacha.`)
      if (g.putar >= c.maxPerHari) return m.reply(`Batas gacha hari ini (${c.maxPerHari}x) sudah tercapai. Besok lagi ya~`)

      const gratis = !g.gratis
      if (!gratis) {
          if ((Number(user.money) || 0) < c.biaya) return m.reply(`Money kurang!\n Biaya: 💹 ${fmt(c.biaya)}\n Money kamu: 💹 ${fmt(user.money)}`)
          user.money -= c.biaya
          g.pity = (g.pity || 0) + 1
      } else {
          g.gratis = true
      }

      let hadiah
      const pityKena = !gratis && g.pity >= c.pityTiap
      if (pityKena) { hadiah = undi(PITY_MIN); g.pity = 0 } else hadiah = undi()

      g.putar++
      g.last = Date.now()
      const got = beri(user, hadiah.r)
      const besar = hadiah.r.limit >= 5

      await m.reply([
          besar ? '🎊 *GACHA BESAR!* 🎊' : '*GACHA*',
          '',
          `${hadiah.emoji} Kamu dapat: *${hadiah.nama}*`,
          ...got.map((t) => `   ${t}`),
          '',
          gratis ? '(putaran gratis hari ini)' : `Biaya: 💹 ${fmt(c.biaya)}${pityKena ? ' • Pity aktif!' : ` • pity ${g.pity}/${c.pityTiap}`}`,
          `Putaran hari ini: ${g.putar}/${c.maxPerHari}`
      ].join('\n'))
  }

  handler.exp = 0

export { pluginConfig as config, handler }
