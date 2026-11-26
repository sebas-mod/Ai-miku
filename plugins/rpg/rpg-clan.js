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
    name: "clan",
    alias: [],
    category: "rpg",
    description: "Fitur RPG clan",
    usage: ".clan",
    example: ".clan",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const rpgStore = ElysiaRuntime.rpgStore;
const saveDB = ElysiaRuntime.saveDB;

const CFG = {
    wajibGuild: true,
    biayaBuat: 100000,
    maxAnggota: 20,
    maxNama: 12,
    pesertaWar: 5,
    minAnggotaWar: 2,
    cooldownWarMenit: 60,
    expiredTantanganMenit: 10,
    acakPersen: 25,
    bobot: { level: 10, sword: 30, armor: 20, pickaxe: 5, potion: 2 },
    menang: { money: 50000, exp: 5000 },
    kalah: { exp: 1000 },
    rampasKasPersen: 10
}

const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
const prefixOf = () => (Array.isArray(global.prefix) ? global.prefix.find(p => typeof p === 'string' && p) : '') || '.'
const save = () => { try { saveDB(global.db) } catch {} }
const users = () => rpgStore().users
const tag = (j) => `@${String(j).split('@')[0]}`
const ICON = { money: '💹 Money', exp: 'Exp', limit: '🎫 Limit' }

function giveReward(u, r = {}) {
    for (const [k, v] of Object.entries(r || {})) {
        const n = Number(v) || 0
        if (n) u[k] = (Number(u[k]) || 0) + n
    }
}
const rewardText = (r) => Object.entries(r || {}).filter(([, v]) => Number(v)).map(([k, v]) => `${ICON[k] || k} ${fmt(v)}`).join(' • ') || '-'

const clans = () => {
    const s = (global.db.fitur ||= {})
    return (s.clan ||= {})
}
const clanKey = (n) => String(n || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const getClan = (key) => clans()[key]
const allClans = () => Object.entries(clans()).map(([key, c]) => ({ key, ...c }))
const clanOfUser = (jid) => { const k = users()[jid]?.clan; const c = k && clans()[k]; return c ? { key: k, ...c } : null }

function clanBuat(jid, nama) {
    const u = users()[jid]
    const key = clanKey(nama)
    if (!key || key.length < 3) return { ok: false, msg: 'Nama clan minimal 3 huruf/angka.' }
    if (String(nama).length > CFG.maxNama) return { ok: false, msg: `Nama clan maksimal ${CFG.maxNama} karakter.` }
    if (clanOfUser(jid)) return { ok: false, msg: `Kamu sudah punya clan. Keluar dulu dengan ${prefixOf()}clan keluar` }
    if (u.clanId) return { ok: false, msg: `Kamu masih tergabung di clan lain. Keluar dulu dengan ${prefixOf()}clan-leave` }
    if (CFG.wajibGuild && !u.guild) return { ok: false, msg: `Kamu harus ikut guild dulu: ${prefixOf()}guild` }
    if (clans()[key]) return { ok: false, msg: 'Nama clan sudah dipakai.' }
    if ((Number(u.money) || 0) < CFG.biayaBuat) return { ok: false, msg: `Money kurang. Biaya buat clan ${fmt(CFG.biayaBuat)}.` }
    u.money -= CFG.biayaBuat
    clans()[key] = { nama: String(nama).trim(), ketua: jid, anggota: [jid], kas: 0, menang: 0, kalah: 0, dibuat: Date.now(), warCd: 0 }
    u.clan = key
    save()
    return { ok: true, key }
}

function clanGabung(jid, nama) {
    const u = users()[jid]
    const key = clanKey(nama)
    const cl = clans()[key]
    if (!cl) return { ok: false, msg: 'Clan tidak ditemukan.' }
    if (clanOfUser(jid)) return { ok: false, msg: 'Kamu sudah punya clan.' }
    if (u.clanId) return { ok: false, msg: 'Kamu masih tergabung di clan lain. Keluar dulu dengan clan-leave.' }
    if (CFG.wajibGuild && !u.guild) return { ok: false, msg: `Kamu harus ikut guild dulu: ${prefixOf()}guild` }
    if (cl.anggota.length >= CFG.maxAnggota) return { ok: false, msg: 'Clan sudah penuh.' }
    cl.anggota.push(jid)
    u.clan = key
    save()
    return { ok: true, nama: cl.nama }
}

function clanKeluar(jid) {
    const cu = clanOfUser(jid)
    if (!cu) return { ok: false, msg: 'Kamu tidak punya clan.' }
    const cl = clans()[cu.key]
    cl.anggota = cl.anggota.filter(j => j !== jid)
    users()[jid].clan = ''
    let bubar = false
    if (!cl.anggota.length) { delete clans()[cu.key]; bubar = true }
    else if (cl.ketua === jid) cl.ketua = cl.anggota[0]
    save()
    return { ok: true, nama: cu.nama, bubar, ketuaBaru: bubar ? null : cl.ketua }
}

function clanKick(ketua, target) {
    const cu = clanOfUser(ketua)
    if (!cu || cu.ketua !== ketua) return { ok: false, msg: 'Hanya ketua clan yang bisa kick.' }
    if (target === ketua) return { ok: false, msg: 'Tidak bisa kick diri sendiri.' }
    const cl = clans()[cu.key]
    if (!cl.anggota.includes(target)) return { ok: false, msg: 'User itu bukan anggota clanmu.' }
    cl.anggota = cl.anggota.filter(j => j !== target)
    if (users()[target]) users()[target].clan = ''
    save()
    return { ok: true, nama: cu.nama }
}

function clanDonasi(jid, jumlah) {
    const cu = clanOfUser(jid)
    if (!cu) return { ok: false, msg: 'Kamu tidak punya clan.' }
    jumlah = Math.floor(Number(jumlah))
    const u = users()[jid]
    if (!(jumlah > 0)) return { ok: false, msg: 'Jumlah tidak valid.' }
    if ((Number(u.money) || 0) < jumlah) return { ok: false, msg: 'Money kamu kurang.' }
    u.money -= jumlah
    clans()[cu.key].kas += jumlah
    save()
    return { ok: true, nama: cu.nama, kas: clans()[cu.key].kas }
}

function memberPower(jid) {
    const u = users()[jid] || {}
    let p = 0
    for (const [k, w] of Object.entries(CFG.bobot)) p += (Number(u[k]) || 0) * (Number(w) || 0)
    return Math.round(p)
}

function clanPower(key) {
    const cl = clans()[key]
    if (!cl) return { total: 0, peserta: [] }
    const peserta = cl.anggota.map(j => ({ jid: j, p: memberPower(j) })).sort((a, b) => b.p - a.p).slice(0, CFG.pesertaWar)
    return { total: peserta.reduce((s, x) => s + x.p, 0), peserta }
}

const pending = (global.__clanWarPending ||= new Map())

function clanTantang(jid, namaLawan, chat) {
    const me = clanOfUser(jid)
    if (!me || me.ketua !== jid) return { ok: false, msg: 'Hanya ketua clan yang bisa menantang war.' }
    const key = clanKey(namaLawan)
    const lawan = clans()[key]
    if (!lawan) return { ok: false, msg: 'Clan lawan tidak ditemukan.' }
    if (key === me.key) return { ok: false, msg: 'Tidak bisa war melawan clan sendiri.' }
    if (me.anggota.length < CFG.minAnggotaWar || lawan.anggota.length < CFG.minAnggotaWar) return { ok: false, msg: `Kedua clan minimal punya ${CFG.minAnggotaWar} anggota.` }
    const cdMs = CFG.cooldownWarMenit * 60000
    for (const cl of [me, lawan]) {
        const sisa = (cl.warCd || 0) + cdMs - Date.now()
        if (sisa > 0) return { ok: false, msg: `Clan *${cl.nama}* masih cooldown war ${Math.ceil(sisa / 60000)} menit.` }
    }
    pending.set(key, { dari: me.key, at: Date.now(), chat })
    return { ok: true, lawan, ketuaLawan: lawan.ketua, menit: CFG.expiredTantanganMenit }
}

function clanTolak(jid) {
    const me = clanOfUser(jid)
    if (!me || me.ketua !== jid) return { ok: false, msg: 'Hanya ketua clan yang bisa menolak.' }
    const p = pending.get(me.key)
    if (!p) return { ok: false, msg: 'Tidak ada tantangan war untuk clanmu.' }
    pending.delete(me.key)
    return { ok: true, dari: clans()[p.dari]?.nama || p.dari }
}

function clanTerima(jid) {
    const me = clanOfUser(jid)
    if (!me || me.ketua !== jid) return { ok: false, msg: 'Hanya ketua clan yang bisa menerima war.' }
    const p = pending.get(me.key)
    if (!p || Date.now() - p.at > CFG.expiredTantanganMenit * 60000) {
        pending.delete(me.key)
        return { ok: false, msg: 'Tidak ada tantangan war yang aktif (atau sudah kedaluwarsa).' }
    }
    pending.delete(me.key)
    const A = clans()[p.dari]
    const B = clans()[me.key]
    if (!A || !B) return { ok: false, msg: 'Salah satu clan sudah bubar.' }

    const pa = clanPower(p.dari)
    const pb = clanPower(me.key)
    const rnd = () => 1 + (Math.random() * 2 - 1) * (Number(CFG.acakPersen) || 0) / 100
    const sa = pa.total * rnd()
    const sb = pb.total * rnd()
    const aMenang = sa >= sb
    const [W, wk, wp, L, lk, lp] = aMenang ? [A, p.dari, pa, B, me.key, pb] : [B, me.key, pb, A, p.dari, pa]

    const rampas = Math.floor(L.kas * (Number(CFG.rampasKasPersen) || 0) / 100)
    L.kas -= rampas
    W.kas += rampas
    W.menang++
    L.kalah++
    const now = Date.now()
    A.warCd = now
    B.warCd = now
    for (const x of wp.peserta) if (users()[x.jid]) giveReward(users()[x.jid], CFG.menang)
    for (const x of lp.peserta) if (users()[x.jid]) giveReward(users()[x.jid], CFG.kalah)
    save()
    return {
        ok: true, chat: p.chat,
        pemenang: { key: wk, nama: W.nama, power: Math.round(aMenang ? sa : sb), peserta: wp.peserta.map(x => x.jid) },
        kalah: { key: lk, nama: L.nama, power: Math.round(aMenang ? sb : sa), peserta: lp.peserta.map(x => x.jid) },
        rampas
    }
}

async function handler(m, { conn, args }) {
    const c = CFG
    const p = prefixOf()
    const sub = (args[0] || '').toLowerCase()
    const rest = args.slice(1).join(' ').trim()
    const send = (t, mentions = []) => conn.sendMessage(m.chat, { text: t, mentions }, { quoted: m })

    if (!sub) {
        return send([
            `⚔️ *${(global.namebot || 'BOT').toUpperCase()} CLAN* ⚔️`, '',
            `${p}clan buat <nama>  (biaya ${fmt(c.biayaBuat)})`, `${p}clan gabung <nama>`, `${p}clan keluar`, `${p}clan info [nama]`,
            `${p}clan list  |  ${p}clan top`, `${p}clan donasi <jumlah>`, `${p}clan kick @user  (ketua)`,
            `${p}clan war <nama clan>  (ketua)`, `${p}clan terima / ${p}clan tolak  (ketua yang ditantang)`, '',
            `Menang war: ${rewardText(c.menang)} untuk tiap peserta.${c.wajibGuild ? `\nSyarat: sudah ikut ${p}guild.` : ''}`
        ].join('\n'))
    }

    if (sub === 'buat') {
        const r = clanBuat(m.sender, rest)
        return m.reply(r.ok ? `✅ Clan *${rest}* berhasil dibuat. Kamu ketuanya!\nAjak teman: ${p}clan gabung ${rest}` : `❌ ${r.msg}`)
    }
    if (sub === 'gabung') {
        const r = clanGabung(m.sender, rest)
        return m.reply(r.ok ? `✅ Kamu bergabung ke clan *${r.nama}*.` : `❌ ${r.msg}`)
    }
    if (sub === 'keluar') {
        const r = clanKeluar(m.sender)
        if (!r.ok) return m.reply(`❌ ${r.msg}`)
        return m.reply(`👋 Kamu keluar dari clan *${r.nama}*.${r.bubar ? '\nClan bubar karena tidak ada anggota.' : ''}`)
    }
    if (sub === 'kick') {
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target) return m.reply(`Contoh: ${p}clan kick @user`)
        const r = clanKick(m.sender, target)
        return r.ok ? send(`🚪 ${tag(target)} dikeluarkan dari clan *${r.nama}*.`, [target]) : m.reply(`❌ ${r.msg}`)
    }
    if (sub === 'donasi') {
        const r = clanDonasi(m.sender, args[1])
        return m.reply(r.ok ? `💝 Donasi masuk ke kas clan *${r.nama}*. Kas sekarang ${fmt(r.kas)}.` : `❌ ${r.msg}`)
    }

    if (sub === 'info') {
        const cl = rest ? { key: clanKey(rest), ...(getClan(clanKey(rest)) || {}) } : clanOfUser(m.sender)
        if (!cl || !cl.nama) return m.reply(rest ? 'Clan tidak ditemukan.' : `Kamu belum punya clan. Buat dengan ${p}clan buat <nama>`)
        const pw = clanPower(cl.key)
        const mem = [...cl.anggota].sort((a, b) => memberPower(b) - memberPower(a))
        return send([
            `🏰 *CLAN ${cl.nama.toUpperCase()}*`, '',
            `👑 Ketua : ${tag(cl.ketua)}`, `👥 Anggota : ${cl.anggota.length}/${c.maxAnggota}`, `💰 Kas : ${fmt(cl.kas)}`,
            `🏆 Menang : ${cl.menang} | Kalah : ${cl.kalah}`, `⚡ Kekuatan war (top ${c.pesertaWar}) : ${fmt(pw.total)}`, '',
            ...mem.map((j, i) => `${i + 1}. ${tag(j)} • ⚡${fmt(memberPower(j))}${j === cl.ketua ? ' 👑' : ''}`)
        ].join('\n'), cl.anggota)
    }

    if (sub === 'list' || sub === 'top') {
        const list = allClans().sort((a, b) => b.menang - a.menang || clanPower(b.key).total - clanPower(a.key).total).slice(0, 15)
        if (!list.length) return m.reply('Belum ada clan.')
        return send('🏰 *DAFTAR CLAN*\n\n' + list.map((x, i) => `${i + 1}. *${x.nama}* • 👥${x.anggota.length} • 🏆${x.menang}W/${x.kalah}L • ⚡${fmt(clanPower(x.key).total)}`).join('\n'))
    }

    if (sub === 'war') {
        const r = clanTantang(m.sender, rest, m.chat)
        if (!r.ok) return m.reply(`❌ ${r.msg}`)
        const me = clanOfUser(m.sender)
        return send(`⚔️ *TANTANGAN WAR*\nClan *${me.nama}* menantang clan *${r.lawan.nama}*!\n\n${tag(r.ketuaLawan)} ketik *${p}clan terima* atau *${p}clan tolak* dalam ${r.menit} menit.`, [r.ketuaLawan])
    }
    if (sub === 'tolak') {
        const r = clanTolak(m.sender)
        return m.reply(r.ok ? `🛡️ Tantangan dari clan *${r.dari}* ditolak.` : `❌ ${r.msg}`)
    }
    if (sub === 'terima') {
        const r = clanTerima(m.sender)
        if (!r.ok) return m.reply(`❌ ${r.msg}`)
        const W = r.pemenang, L = r.kalah
        const mentions = [...W.peserta, ...L.peserta]
        return conn.sendMessage(r.chat || m.chat, {
            text: [
                '⚔️ *HASIL CLAN WAR* ⚔️', '',
                `🏆 Pemenang : *${W.nama}* (⚡${fmt(W.power)})`,
                `💀 Kalah : *${L.nama}* (⚡${fmt(L.power)})`, '',
                `Peserta ${W.nama}: ${W.peserta.map(tag).join(' ')}`, `→ ${rewardText(c.menang)} / orang`, '',
                `Peserta ${L.nama}: ${L.peserta.map(tag).join(' ')}`, `→ ${rewardText(c.kalah)} / orang`,
                r.rampas ? `\n💰 Kas ${L.nama} dirampas ${fmt(r.rampas)} → ${W.nama}` : ''
            ].join('\n').trim(), mentions
        })
    }

    return m.reply(`Sub-perintah tidak dikenal. Ketik ${p}clan untuk bantuan.`)
}

export { pluginConfig as config, handler }
