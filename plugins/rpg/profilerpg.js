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
    name: "profilerpg",
    alias: [],
    category: "rpg",
    description: "profilerpg",
    usage: ".profilerpg",
    example: ".profilerpg",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, A) {

      const { initRpgUser, sender, pushname, rpgDb, reply } = A
      initRpgUser(sender, pushname)
                let user = rpgDb[sender]

                const hpNow = user.hp ?? 100, hpMax = user.maxHp ?? 100
                const hpBar = '❤️'.repeat(Math.max(1, Math.round((hpNow / Math.max(1, hpMax)) * 5))) + '🖤'.repeat(Math.max(0, 5 - Math.round((hpNow / Math.max(1, hpMax)) * 5)))
                let teks =
`╭───〔 ⚔️ *KARTU PETUALANG ELYSIA* ⚔️ 〕───╮
│ 👤 *Nama*     : *${pushname}*
│ 🆔 *ID*       : \`${sender.split('@')[0]}\`
│ ⭐ *Level*    : *Lv.${user.level || 1}* (${user.exp || 0} EXP)
│ ❤️ *HP*       : ${hpBar} (*${hpNow}/${hpMax}*)
│ 🧬 *Status*   : ${user.death ? '💀 Gugur (Butuh Revive)' : '🟢 Sehat Walafiat'}
╰────────────────────────────────────╯

╭───〔 🛡️ *ATRIBUT & KELAS TEMPUR* 〕───╮
│ ⚔️ *Class*    : ${user.class || 'Adventurer'}
│ 🌀 *Elemen*   : ${user.element || 'Netral'}
│ 🧠 *Skill*    : ${user.skill || 'Basic Slash'}
│ ✨ *Talent*   : ${user.talent || 'Belum Aktif'}
│ 📦 *Pasif*    : ${user.passive || 'Belum Ada'}
│ 💫 *Buff*     : ${user.buff || '-'} | 🔥 *Debuff*: ${user.debuff || '-'}
╰────────────────────────────────────╯

╭───〔 💰 *HARTA & PERLENGKAPAN* 〕───╮
│ 🪙 *Coin*     : *${Number(user.coin || 0).toLocaleString('id-ID')}*
│ 🎫 *Limit*    : *${user.limit || 25}*
│ 🧤 *Equip*    : ${user.equip && user.equip.length ? user.equip.join(', ') : (user.weapon || 'Tangan Kosong')}
│ 🐴 *Mount*    : ${user.mount || 'Jalan Kaki'}
│ 🧿 *Spirit*   : ${user.spirit || 'Belum Aktif'}
│ 📍 *Lokasi*   : *${user.location || 'Kota Awal Elysia'}*
│ 🏆 *Medal*    : ${user.medal || 0} | 📜 *Prestige*: ${user.prestige || 0}
│ 🎒 *Isi Tas*  : ${user.inv && user.inv.length > 0 ? user.inv.slice(0, 12).join(', ') : 'Kosong'}
╰────────────────────────────────────╯`

                reply(teks)
}

export { pluginConfig as config, handler }
