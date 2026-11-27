/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
/**
 * ✦ Ai Miku — RPG & Clan Kernel (src/lib/system/rpg-kernel.js)
 * ✦ Architect: Arthazy
 */
import _mikuConfig from '../../../config.js'
import _eFs, { promises as _eFsPromises, mkdirSync as _eMkdirSync } from 'fs'
import _ePath, { join as _ePathJoin } from 'path'
import _eOs from 'os'
import _eCrypto, { webcrypto as _igjhWebcrypto } from 'crypto'
import _eAxios from 'axios'
import _eChildProcess, { exec as _eExec, spawn as _eSpawn } from 'child_process'
import { promisify as _ePromisify } from 'util'
import _sQs from 'qs'
import * as _sCheerio from 'cheerio'
import _sFetch from 'node-fetch'
import _sFormData from 'form-data'
import _sMimeDb from 'mime-types'
import _ngDns from 'dns'
import _ngHttp from 'http'
import _ngHttps from 'https'
import _ngNet from 'net'
import { createContext as _igjhCreateContext, runInContext as _igjhRunInContext } from 'node:vm'

import { MikuEngine } from './miku-engine.js'

const MikuRpgKernel = (() => {
  const {
    config, getDatabase, rpgStore, ensureUser, saveDB, jidNumber, saluranCtx,
    addExpWithLevelCheck, mikuWrapPlugin, getThumbFromConfig
  } = MikuEngine

  global.db.rpgData.game ||= {
    rpg: {}, guild: {}, market: [], bankCentral: 0, partyList: {}, mailbox: {}, crypto: { portfolio: {}, watchlist: {}, alert: {} }
  }
  const gameRoot = () => global.db.rpgData.game

  const rpgDb = gameRoot().rpg
  const rpgGuildDb = gameRoot().guild
  const saveRpg = () => saveDB()
  const saveGuild = () => saveDB()

  function initRpgUser(sender, pushname = 'Petualang') {
    const u = ensureUser({ sender, pushName: pushname })
    if (!rpgDb[sender]) {
      rpgDb[sender] = {
        name: pushname || u.name || 'Petualang',
        coin: Number(u.money) || 250,
        bank: Number(u.bank) || 0,
        exp: Number(u.exp) || 0,
        maxExp: 100,
        level: Number(u.level) || 1,
        hp: Number(u.health) || 100,
        maxHp: Number(u.maxhealth) || 100,
        stamina: Number(u.stamina) || 100,
        mana: Number(u.mana) || 50,
        inv: [],
        weapon: u.equipWeapon || '',
        armor: u.equipArmor || '',
        class: u.class || 'Warrior',
        element: u.element || 'Netral',
        skill: u.skill || 'Slash',
        location: u.location || 'Kota Awal Miku',
        quest: { dailyDone: false }
      }
    }
    const r = rpgDb[sender]
    r.inv ||= []
    r.quest ||= { dailyDone: false }
    return r
  }

  const flatByNumber = (numStr) => {
    const clean = jidNumber(numStr)
    return ensureUser({ sender: `${clean}@s.whatsapp.net` })
  }

  const invGet = (u, item) => Number(u?.inventory?.[item] ?? u?.[item] ?? 0)
  const invAdd = (u, item, count = 1) => {
    if (!u) return 0
    u.inventory ||= {}
    u.inventory[item] = Math.max(0, (Number(u.inventory[item]) || 0) + Number(count || 0))
    saveDB()
    return u.inventory[item]
  }

  function sharedMarket() {
    global.db.fitur.market ||= { seq: 0, list: [] }
    return global.db.fitur.market
  }

  const bankCfg = {
    minAmount: 10, dailyTransferCap: 100000, interestRate: 0.02, loanInterest: 0.2,
    heistSuccess: 0.5, heistCut: 0.2, heistCooldownMs: 3600000, insurancePremium: 250,
    insuranceCoverage: 0.5, feeRate: 0.01
  }
  function ensureBankFields(u) {
    u.bank ??= 0; u.loan ??= 0; u.lastInterest ??= 0; u.lastHeist ??= 0
    u.transferDay ??= 0; u.transferUsed ??= 0; u.insurance ??= false
    u.bankLog ??= []; u.deposit ??= { amount: 0, until: 0 }; u.escrow ??= null
  }
  const todayKey = () => {
    const d = new Date()
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  }
  function pushLog(u, msg) {
    ensureBankFields(u)
    u.bankLog.unshift(`[${new Date().toLocaleString('id-ID')}] ${msg}`)
    if (u.bankLog.length > 20) u.bankLog.length = 20
  }
  function isGuildLeaderOrOfficer(sender) {
    const r = rpgDb[sender]
    if (!r) return false
    if (r.isGuildLeader || r.isGuildOfficer) return true
    const g = r.guild && rpgGuildDb[r.guild]
    return Boolean(g && (g.leader === sender || (g.officers || []).includes(sender)))
  }

  const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
  const hms = (ms) => MikuEngine.clockString(ms)
  const msToTime = hms
  const pickRandom = (a) => a[Math.floor(Math.random() * a.length)]
  const randomNumber = (min, max = null) => {
    if (max === null) { max = min; min = 0 }
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  const shuffle = (a) => {
    const c = [...a]
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[c[i], c[j]] = [c[j], c[i]]
    }
    return c
  }
  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  // Upgraded RPG Preview Card with Thumbnail from config.js -> thumbUrl.rpg
  function styleRpgText(rawText) {
    const t = String(rawText ?? '').trim()
    if (!t || t.startsWith('╭') || t.startsWith('╔')) return t
    return `╭───〔 ⚔️ *MIKU FANTASY RPG* ⚔️ 〕───╮\n${t}\n╰──────────────────────────────────╯`
  }

  async function sendRpgPreview(sock, jid, text, title = '⚔️ MIKU FANTASY RPG', body = '', opts = {}) {
    const styled = styleRpgText(text)
    const mentions = [...new Set([
      ...(opts.mentions || []),
      ...[...styled.matchAll(/@(\d{5,16})/g)].map((m) => `${m[1]}@s.whatsapp.net`)
    ])]
    return sock.sendMessage(
      jid,
      {
        text: styled,
        mentions,
        contextInfo: saluranCtx('rpg', title || '⚔️ MIKU FANTASY RPG')
      },
      opts.quoted ? { quoted: opts.quoted } : {}
    )
  }

  function rpgPlugin(pluginCfg, fn, opts = {}) {
    return mikuWrapPlugin(pluginCfg, async (m, ctx) => {
      const db = getDatabase()
      const user = db.getUser(m.sender)
      return fn(m, { ...ctx, db, user, config })
    })
  }

  function rpgCmd(cmdList, fn, opts = {}) {
    const cmds = [].concat(cmdList).map(String)
    const plugin = async (m, ctx = {}) => {
      const sock = ctx.sock || ctx.conn
      const sender = m.sender
      const pushname = m.pushName || jidNumber(sender) || 'Petualang'
      initRpgUser(sender, pushname)
      const prefix = ctx.prefix || ctx.usedPrefix || m.prefix || '.'
      const args = ctx.args || m.args || []
      const text = ctx.text || m.text || ''
      const reply = (msg, extra = {}) => sendRpgPreview(sock, m.chat, msg, '⚔️ MIKU FANTASY RPG', '', { quoted: m, ...extra })
      const A = {
        Bot: sock,
        m,
        reply,
        text,
        args,
        sender,
        prefix,
        command: ctx.command || m.command || cmds[0],
        pushname,
        isOwner: Boolean(ctx.isOwner || m.isOwner),
        isAdmins: Boolean(ctx.isAdmin || m.isAdmin),
        botname: global.namebot,
        mikuCmd: `${prefix}${ctx.command || cmds[0]}`,
        XRO: () => reply('⚠️ Esta función es exclusiva del dueño.'),
        XRG: () => reply('⚠️ Esta función solo funciona dentro de un grupo.'),
        XReaction: () => m.react('✅'),
        botUser: () => ensureUser(m),
        botStore: rpgStore,
        saveBot: saveDB,
        giveExp: (amt) => addExpWithLevelCheck(sock, m, getDatabase(), ensureUser(m), amt),
        rpgDb, saveRpg, rpgGuildDb, saveGuild, initRpgUser,
        ensureBankFields, bankCfg, pushLog, todayKey, isGuildLeaderOrOfficer,
        fmt, hms, msToTime, pickRandom, randomNumber, shuffle, delay
      }
      try {
        return await fn(A)
      } finally {
        saveDB()
      }
    }
    plugin.command = cmds
    plugin.tags = [opts.tags || 'rpg']
    plugin.help = cmds
    plugin.owner = Boolean(opts.owner)
    plugin.premium = Boolean(opts.premium)
    plugin.group = Boolean(opts.group)
    plugin.admin = Boolean(opts.admin)
    return plugin
  }

  // Crypto RPG Mini-Engine
  const COIN_MAP = { btc: 'bitcoin', eth: 'ethereum', sol: 'solana', bnb: 'binancecoin', doge: 'dogecoin', xrp: 'ripple', ada: 'cardano', ton: 'the-open-network', trx: 'tron', shib: 'shiba-inu', pepe: 'pepe', usdt: 'tether' }
  async function cryptoRun(A, mode) {
    const { reply, sender, args, prefix, fmt: fNum } = A
    const store = (gameRoot().crypto ||= { portfolio: {}, watchlist: {}, alert: {} })
    const rawCoin = String(args[0] || '').toLowerCase()
    const coinId = COIN_MAP[rawCoin] || rawCoin
    if (mode === 'price') {
      if (!coinId) return reply(`📈 Ejemplo: \`${prefix}crypto-price btc\``)
      const r = await MikuEngine.f(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd,idr`)
      const d = r?.[coinId]
      if (!d) return reply('❌ Moneda no encontrada en CoinGecko.')
      return reply(`💹 *PRECIO CRYPTO: ${coinId.toUpperCase()}*\n• USD : $${fNum(d.usd)}\n• IDR : Rp${fNum(d.idr)}`)
    }
    if (mode === 'portfolio') {
      const p = store.portfolio[sender] || {}
      const keys = Object.keys(p)
      if (!keys.length) return reply('📭 Tu cartera de criptomonedas está vacía.')
      return reply(`💼 *CARTERA DE CRIPTOMONEDAS*\n\n` + keys.map((k) => `• *${k.toUpperCase()}* : ${Number(p[k]).toFixed(6)}`).join('\n'))
    }
    if (mode === 'watchlist') {
      const w = store.watchlist[sender] || []
      if (!w.length) return reply('📋 La lista de seguimiento está vacía.')
      return reply(`👀 *SEGUIMIENTO DE CRIPTO*\n\n` + w.map((k, i) => `${i + 1}. ${k.toUpperCase()}`).join('\n'))
    }
    if (mode === 'watchadd') {
      if (!coinId) return reply(`Ejemplo: \`${prefix}crypto-watchadd btc\``)
      const w = (store.watchlist[sender] ||= [])
      if (!w.includes(coinId)) w.push(coinId)
      saveDB()
      return reply(`✅ *${coinId.toUpperCase()}* añadido a la lista de seguimiento.`)
    }
    if (mode === 'watchdel') {
      const w = (store.watchlist[sender] ||= [])
      store.watchlist[sender] = w.filter((x) => x !== coinId)
      saveDB()
      return reply(`🗑️ *${coinId.toUpperCase()}* eliminado de la lista de seguimiento.`)
    }
    return reply(`💹 Usa los comandos: \`${prefix}crypto-price btc\`, \`${prefix}crypto-portfolio\`, \`${prefix}crypto-watchlist\``)
  }

  // Database Shop & Recipes
  const SHOP = {
    weapon: { title: 'Weapon ⚔️', items: { 'pedang kayu': 500, 'belati baja': 1000, 'busur elven': 1200, 'pedang naga': 3500 } },
    armor: { title: 'Armor 🛡️', items: { 'tameng kayu': 600, 'armor kulit': 900, 'zirah ksatria': 2500 } },
    potion: { title: 'Potion 🧪', items: { ramuan: 150, elixirlife: 750 } },
    material: { title: 'Material 🧱', items: { tulang: 80, kulit: 80, daging: 60 } },
    key: { title: 'Key Item 🔑', items: { kunci: 300 } },
    mystic: { title: 'Mystic ✨', items: { scrollclass: 500, stonebless: 350, essencexp: 400, spiritcore: 1000 } },
    mount: { title: 'Pet & Mount 🐾', items: { kuda: 2000, serigala: 4500, naga: 12000 } }
  }
  const SHOP_ALIAS = { weapon: 'weapon', senjata: 'weapon', armor: 'armor', potion: 'potion', ramuan: 'potion', material: 'material', bahan: 'material', key: 'key', keyitem: 'key', kunci: 'key', mystic: 'mystic', mount: 'mount', pet: 'mount', petmount: 'mount' }
  const priceOf = (name) => {
    for (const cat of Object.values(SHOP)) if (cat.items[name] !== undefined) return cat.items[name]
    return undefined
  }
  function applyPurchase(u, item) {
    switch (item) {
      case 'scrollclass': u.class = null; return 'Clase reiniciada. Elige una clase nueva con *.class*.'
      case 'stonebless': u.buff = 'atk+10%'; return '¡Buff *ATK +10%* activo!'
      case 'essencexp': return { exp: 500, text: '+500 EXP!' }
      case 'spiritcore': u.spirit = 'phoenix'; return '¡El espíritu *Phoenix* te acompaña!'
      case 'elixirlife': u.death = false; return 'Status kematian dipulihkan!'
      default: u.inv.push(item); return ''
    }
  }
  const SELL_PRICE = { daging: 40, kulit: 40, tulang: 40, gandum: 30, apel: 30, armor: 250, ramuan: 60, kunci: 120, fragmen: 50 }
  const sellPrice = (item) => {
    const k = String(item).toLowerCase()
    if (SELL_PRICE[k] !== undefined) return SELL_PRICE[k]
    if (k.startsWith('cocina:')) return 150
    const s = priceOf(k)
    return s !== undefined ? Math.max(10, Math.floor(s * 0.4)) : 100
  }
  const RECIPES = {
    supikan: { need: [{ match: 'ikan', prefix: true }], free: ['air'], label: 'ikan + air' },
    nasiherba: { need: [{ match: 'gandum' }, { match: 'herba' }], free: [], label: 'gandum + herba' }
  }
  const QUEST_POOL = [
    { item: 'daging', jumlah: 2, coin: 350, exp: 250 },
    { item: 'kulit', jumlah: 2, coin: 380, exp: 250 },
    { item: 'tulang', jumlah: 2, coin: 400, exp: 280 }
  ]
  async function questRun(A) {
    const { initRpgUser: initU, sender, pushname, rpgDb: db, reply, saveRpg: sv, giveExp } = A
    initU(sender, pushname)
    const u = db[sender]
    const q = (u.quest = u.quest && typeof u.quest === 'object' ? u.quest : { dailyDone: false })
    const today = todayKey()
    if (q.day !== today) { q.day = today; q.dailyDone = false }
    const misi = QUEST_POOL[today % QUEST_POOL.length]
    const count = (u.inv || []).filter((i) => i === misi.item).length
    if (q.dailyDone) return reply('📜 ¡Ya completaste la misión diaria de hoy! Vuelve mañana.')
    if (count < misi.jumlah) {
      return reply(
        `📜 * TABLÓN DE MISIONES DIARIAS DE MIKU*\n\n` +
        `🎯 *Objetivo*  : Reúne *${misi.jumlah}x ${misi.item}*\n` +
        `📊 *Progreso*  : *${count}/${misi.jumlah}*\n` +
        `🎁 *Premio*    : 💰 ${misi.coin} monedas y ✨ ${misi.exp} EXP\n\n` +
        `💡 Consigue los materiales con *.hunt* y reclama con *.claimquest*.`
      )
    }
    let sisa = misi.jumlah
    u.inv = u.inv.filter((i) => {
      if (i === misi.item && sisa > 0) { sisa--; return false }
      return true
    })
    u.coin = (Number(u.coin) || 0) + misi.coin
    q.dailyDone = true
    sv()
    await giveExp(misi.exp)
    return reply(`🎉 *¡MISIÓN DIARIA COMPLETADA!*\n• 💰 +${misi.coin} monedas\n• ✨ +${misi.exp} EXP`)
  }
  const invCount = (u, name) => (u.inv || []).filter((i) => String(i).toLowerCase() === String(name).toLowerCase()).length
  function invTake(u, name, n = 1) {
    let left = n
    u.inv = (u.inv || []).filter((i) => {
      if (left > 0 && String(i).toLowerCase() === String(name).toLowerCase()) { left--; return false }
      return true
    })
    return n - left
  }
  function invSummary(u) {
    const map = new Map()
    for (const i of u.inv || []) map.set(i, (map.get(i) || 0) + 1)
    return [...map.entries()]
  }

  return {
    rpgDb, saveRpg, rpgGuildDb, saveGuild, initRpgUser, flatByNumber,
    invGet, invAdd, sharedMarket, sendRpgPreview, rpgPlugin, rpgCmd, cryptoRun,
    SHOP, SHOP_ALIAS, priceOf, applyPurchase, SELL_PRICE, sellPrice, RECIPES,
    questRun, invCount, invTake, invSummary,
    ensureBankFields, bankCfg, pushLog, todayKey, isGuildLeaderOrOfficer,
    fmt, hms, msToTime, pickRandom, randomNumber, shuffle, delay
  }
})()

export { MikuRpgKernel };
export default MikuRpgKernel;

global.__mikuRpgKernelRef = MikuRpgKernel;
