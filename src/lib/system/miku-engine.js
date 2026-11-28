/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { sendButtons as _coreSendButtons } from "../core/buttons.js"
/**
 * ✦ Ai Miku — Core Plugin Engine (src/lib/system/miku-engine.js)
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
import { createRequire as _eCreateRequire } from 'node:module'
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

const MikuEngine = (() => {
  const config = _mikuConfig || {}
  const fs = _eFs
  const path = _ePath
  const os = _eOs
  const crypto = _eCrypto
  const axios = _eAxios
  const { exec, spawn } = _eChildProcess

  // Ensure global.db structure is always available and persisted
  // Si ya existe la base de datos con el nombre anterior, se sigue usando para no perder los datos
  const _oldDbFile = path.join(process.cwd(), 'database', 'elysia_rpg_store.json')
  const _newDbFile = path.join(process.cwd(), 'database', 'miku_rpg_store.json')
  const DB_FILE = (!fs.existsSync(_newDbFile) && fs.existsSync(_oldDbFile)) ? _oldDbFile : _newDbFile
  if (!global.db) {
    let loaded = {}
    try {
      if (fs.existsSync(DB_FILE)) loaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    } catch {}
    global.db = {
      users: loaded.users || {},
      groups: loaded.groups || {},
      settings: loaded.settings || {},
      rpgData: loaded.rpgData || { users: {}, chats: {}, settings: {}, bridge: {} },
      fitur: loaded.fitur || {},
      fun: loaded.fun || { pacar: {}, tembak: {}, couple: {} },
      dio: loaded.dio || { praktis: {}, profile: {} },
      reminders: loaded.reminders || []
    }
  }
  global.db.rpgData ||= { users: {}, chats: {}, settings: {}, bridge: {} }
  global.db.rpgData.users ||= {}
  global.db.fitur ||= {}
  global.db.groups ||= {}
  global.db.dio ||= { praktis: {}, profile: {} }
  if (!Object.prototype.hasOwnProperty.call(global.db, 'data')) {
    Object.defineProperty(global.db, 'data', {
      enumerable: false,
      configurable: true,
      get: () => global.db.rpgData
    })
  }

  global.namebot = config.bot?.name || 'Ai Miku'
  global.ownername = config.owner?.name || 'Arthazy'
  global.linkSaluran = config.saluran?.link || 'https://whatsapp.com'
  global.idSaluran = config.saluran?.id || ''
  global.nameSaluran = config.saluran?.name || global.namebot
  global.APIs ||= { faa: 'https://api-faa.my.id', deline: 'https://api.siputzx.my.id' }
  global.wait ||= config.messages?.wait || '⏳ Espera un momento, lo estoy procesando...'
  global.fstatus = undefined
  global.multiplier ||= 38
  global.rpg ||= {
    emoticon(k = '') {
      k = String(k).toLowerCase()
      const map = {
        level: '📊', limit: '🎫', health: '❤️', stamina: '⚡', exp: '✨',
        money: '💰', bank: '🏦', potion: '🧪', diamond: '💎', common: '📦',
        uncommon: '🛍️', mythic: '🎁', legendary: '🗃️', superior: '💼', pet: '🐾',
        trash: '🗑️', armor: '🛡️', sword: '⚔️', pickaxe: '⛏️', fishingrod: '🎣',
        wood: '🪵', rock: '🪨', string: '🕸️', horse: '🐴', cat: '🐱',
        dog: '🐶', fox: '🦊', petfood: '🍖', iron: '⛓️', gold: '🪙',
        emerald: '❇️', upgrader: '🧰'
      }
      for (const [key, emo] of Object.entries(map)) {
        if (k.includes(key)) return emo
      }
      return '🔹'
    }
  }

  // Ayudantes de prototipos usados por varios scripts
  if (!Array.prototype.getRandom) {
    Object.defineProperty(Array.prototype, 'getRandom', {
      value: function () { return this[Math.floor(Math.random() * this.length)] },
      configurable: true, writable: true
    })
  }
  if (!Number.prototype.toTimeString) {
    Object.defineProperty(Number.prototype, 'toTimeString', {
      value: function () { return clockString(this) },
      configurable: true, writable: true
    })
  }

  let _saveTimer = null
  function saveDB() {
    if (_saveTimer) return
    _saveTimer = setTimeout(() => {
      _saveTimer = null
      try {
        fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
        fs.writeFileSync(DB_FILE, JSON.stringify({
          users: global.db.users,
          groups: global.db.groups,
          settings: global.db.settings,
          rpgData: global.db.rpgData,
          fitur: global.db.fitur,
          fun: global.db.fun,
          dio: global.db.dio,
          reminders: global.db.reminders
        }))
      } catch {}
    }, 2000)
    _saveTimer.unref?.()
  }
  const persist = saveDB

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const jidNumber = (jid = '') => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '')
  const userOf = jidNumber
  const digits = (s = '') => String(s || '').replace(/\D/g, '')
  const isLidJid = (jid = '') => String(jid || '').endsWith('@lid')
  const resolvePhone = async (sock, jid) => jidNumber(jid)
  const toPN = async (sock, jid) => {
    if (!jid) return jid
    if (String(jid).endsWith('@g.us') || String(jid).endsWith('@newsletter')) return jid
    const n = jidNumber(jid)
    return n ? `${n}@s.whatsapp.net` : jid
  }
  const getOwners = () => (config.owner?.numbers || []).map(String)
  const formatWib = (ts = Date.now()) => new Date(ts).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  const wibDay = (t = Date.now()) => new Date(t + 7 * 3600000).toISOString().slice(0, 10)
  const durasi = (ms) => {
    const s = Math.max(0, Math.ceil(Number(ms || 0) / 1000))
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), d = s % 60
    return [h && `${h} hora(s)`, m && `${m} minuto(s)`, (!h && d) && `${d} segundo(s)`].filter(Boolean).join(' ') || '0 segundos'
  }
  const clockString = (ms) => {
    const n = Number(ms)
    if (!Number.isFinite(n) || n <= 0) return '0 segundos'
    const s = Math.ceil(n / 1000)
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return [d && `${d} día(s)`, h && `${h} hora(s)`, m && `${m} minuto(s)`, sec && `${sec} segundo(s)`].filter(Boolean).join(' ')
  }
  const formatRemaining = (until) => {
    if (until == null) return 'permanente'
    const diff = until - Date.now()
    if (diff <= 0) return 'agotado'
    return clockString(diff)
  }
  const fiturFmt = (n) => Number(n || 0).toLocaleString('id-ID')
  const cfg = () => ({ ...(config.features || {}), ...(global.db?.fitur?.cfg || {}) })

  function makeDefaultUser(name = 'Petualang') {

  return {
      name, exp: 0, money: 0, koin: 0, saldo: 0, level: 1, limit: 25, energi: 25,
      age: null, regTime: null, afk: -1, afkReason: '', warn: 0, role: '⚔️ Adventurer',
      premium: false, premiumTime: 0, registered: false, banned: false, autolevelup: true,
      bibitapel: 0, bibitjeruk: 0, bibitdurian: 0, bibitmangga: 0, bibitpisang: 0, bibitanggur: 0,
      apel: 0, jeruk: 0, durian: 0, mangga: 0, pisang: 0, anggur: 0,
      banteng: 0, harimau: 0, gajah: 0, kambing: 0, panda: 0, buaya: 0, kerbau: 0, sapi: 0, monyet: 0, babihutan: 0, babi: 0, ayam: 0,
      ikan: 0, lele: 0, nila: 0, bawal: 0, udang: 0, paus: 0, kepiting: 0,
      sword: 0, pickaxe: 0, axe: 0, fishingrod: 0, armor: 0, atm: 0,
      sworddurability: 100, pickaxedurability: 100, axedurability: 100, fishingroddurability: 100, armordurability: 100,
      fullatm: 0, potion: 2, string: 0, wood: 0, rock: 0, coal: 0, iron: 0, diamond: 0, emerald: 0, trash: 0,
      common: 0, uncommon: 0, mythic: 0, legendary: 0,
      ayambakar: 0, ayamgoreng: 0, oporayam: 0, gulaiayam: 0, steak: 0, rendang: 0, babipanggang: 0,
      ikanbakar: 0, lelebakar: 0, nilabakar: 0, bawalbakar: 0, udangbakar: 0, pausbakar: 0, kepitingbakar: 0,
      lastadventure: 0, lastbansos: 0, lastberburu: 0, lastdagang: 0, lastduel: 0, lastrampok: 0,
      lastmining: 0, lastnebang: 0, lastnguli: 0, lastclaim: 0, lastweekly: 0, lastmonthly: 0,
      lastenergy: 0, lastmulung: 0, lastngocok: 0, lastwarnet: 0, lastquest: 0, lastberkebon: 0, lastfishing: 0, lasthunt: 0,
      tiketcoin: 0, botol: 0, kaleng: 0, kardus: 0,
      health: 100, maxhealth: 100, stamina: 100, mana: 50, energy: 100,
      gold: 0, bank: 0, horse: 0, horseexp: 0, cat: 0, catexp: 0, fox: 0, foxexp: 0, dog: 0, dogexp: 0,
      bait: 0, fertilizer: 0, rpg: { hp: 100, maxHp: 100, mana: 50, maxMana: 50, stamina: 100, level: 1, exp: 0 },
      inventory: {}, cooldowns: {}
    }
  }

  function rpgStore() {
    global.db.rpgData ||= { users: {}, chats: {}, settings: {}, bridge: {} }
    global.db.rpgData.users ||= {}
    return global.db.rpgData
  }

  function ensureUser(mOrObj = {}) {
    const rawSender = mOrObj.sender || mOrObj.jid || ''
    const key = jidNumber(rawSender) ? `${jidNumber(rawSender)}@s.whatsapp.net` : String(rawSender)
    const users = rpgStore().users
    if (!users[key]) {
      users[key] = makeDefaultUser(mOrObj.pushName || jidNumber(key) || 'Petualang')
    }
    const u = users[key]
    if (u.registered === undefined) u.registered = false
    u.rpg ||= { hp: u.health ?? 100, maxHp: u.maxhealth ?? 100, mana: u.mana ?? 50, maxMana: 50, stamina: u.stamina ?? 100, level: u.level ?? 1, exp: u.exp ?? 0 }
    u.inventory ||= {}
    u.cooldowns ||= {}
    if (u.koin && !u.money) u.money = u.koin
    if (u.money && !u.koin) u.koin = u.money
    return u
  }

  function beri(user, hadiah = {}) {
    const ICON = { money: '💰 Money', exp: '✨ Exp', limit: '🎫 Limit' }
    const out = []
    for (const [k, v] of Object.entries(hadiah || {})) {
      const n = Number(v) || 0
      if (!n) continue
      user[k] = (Number(user[k]) || 0) + n
      out.push(`${ICON[k] || k} +${n.toLocaleString('id-ID')}`)
    }
    saveDB()
    return out
  }

  const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75
  function xpRange(lvl = 1, mult = global.multiplier || 38) {
    lvl = Math.max(0, Math.floor(Number(lvl) || 0))
    const min = lvl === 0 ? 0 : Math.round(Math.pow(lvl, growth) * mult) + 1
    const max = Math.round(Math.pow(lvl + 1, growth) * mult)

  return { min, max, xp: max - min }
  }

  // Thumbnail & Context Info pointing directly to config.js -> thumbUrl
  let _smallThumbBuf = null
  let _smallThumbFetching = false

  function getThumbFromConfig(cat = 'default') {
    const map = config.thumbUrl || {}
    return map.small || map.allmenu || map.menu || 'https://c.termai.cc/i149/k04E.jpg'
  }

  function warmSmallThumb(url) {
    if (_smallThumbBuf || _smallThumbFetching || !url) return
    _smallThumbFetching = true
    fetch(url, { signal: AbortSignal.timeout(10000) })
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .then((ab) => {
        if (ab && ab.byteLength > 0) _smallThumbBuf = Buffer.from(ab)
      })
      .catch(() => {})
      .finally(() => {
        _smallThumbFetching = false
      })
  }

  warmSmallThumb(getThumbFromConfig())

  function saluranCtx(cat = 'default', customTitle = '') {
    const thumb = getThumbFromConfig(cat)
    warmSmallThumb(thumb)

    return {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: config.saluran?.id || '120363393471527483@newsletter',
        newsletterName: config.saluran?.name || config.bot?.name || 'Ai Miku',
        serverMessageId: 100
      },
      externalAdReply: {
        title: customTitle || (config.bot?.name || 'Ai Miku'),
        body: `Creado por ${config.owner?.name || 'Arthazy'}`,
        thumbnailUrl: thumb,
        ...(_smallThumbBuf ? { thumbnail: _smallThumbBuf } : {}),
        sourceUrl: config.info?.website || 'https://arthazyspace.my.id',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }

  function te(prefix = '.', command = 'cmd', pushName = 'Kak') {
    return `⚠️ Perdón ${pushName}, el comando *${prefix}${command}* tuvo un problema. Inténtalo de nuevo en un momento.`
  }

  async function f(url, type = 'json', method = 'GET', headers = {}, body = null) {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', ...headers },
        body,
        signal: AbortSignal.timeout(45000)
      })
      if (!res.ok) return null
      if (type === 'json') return await res.json()
      if (type === 'text') return await res.text()
      const ab = await res.arrayBuffer()
      return type === 'buffer' ? Buffer.from(ab) : ab
    } catch {
      return null
    }
  }

  async function safeJson(res, fallback = null) {
    try {
      if (!res) return fallback
      if (typeof res.json === 'function') return await res.json()
      if (typeof res.text === 'function') return JSON.parse(await res.text())
      return fallback
    } catch {
      return fallback
    }
  }

  function queueFFmpeg(cmdStr) {
    return new Promise((resolve, reject) => {
      exec(cmdStr, { maxBuffer: 50 * 1024 * 1024, timeout: 60000 }, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async function obfuscateJs(code) {
    try {
      const mod = await import('javascript-obfuscator')
      const obf = mod.default || mod
      return obf.obfuscate(code, { compact: true, stringArray: true, stringArrayEncoding: ['base64'] }).getObfuscatedCode()
    } catch {
      const b64 = Buffer.from(String(code || ''), 'utf8').toString('base64')
      return `/* Obfuscated by Ai Miku */\neval(Buffer.from('${b64}','base64').toString('utf8'));`
    }
  }

  function getAssetBuffer(name) {
    try {
      const p = path.join(process.cwd(), 'assets', name)
      if (fs.existsSync(p)) return fs.readFileSync(p)
    } catch {}
    return null
  }

  function defaultAvatar() {
    return Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
  }

  async function getProfileBuffer(sock, jid) {
    try {
      const url = await sock.profilePictureUrl(jid, 'image')
      if (url) {
        const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
        return Buffer.from(r.data)
      }
    } catch {}
    return defaultAvatar()
  }
  const canvasGetAvatarBuffer = getProfileBuffer

  function canvasRoundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function canvasDrawAvatar(ctx, img, x, y, size) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, x, y, size, size)
    ctx.restore()
  }

  async function uploadToCatboxFile(buf, filename = 'file.jpg') {
    const fd = new FormData()
    fd.append('reqtype', 'fileupload')
    fd.append('fileToUpload', new Blob([buf]), filename)
    const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: fd })
    const t = (await r.text()).trim()
    if (t.startsWith('http')) return t
    throw new Error('Error al subir a Catbox')
  }

  async function uploadToTmpFilesOrg(buf, filename = 'image.jpg') {
    try {
      return await uploadToCatboxFile(buf, filename)
    } catch {
      const fd = new FormData()
      fd.append('file', new Blob([buf]), filename)
      const r = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: fd })
      const j = await r.json()
      return j?.data?.url?.replace('tmpfiles.org/', 'tmpfiles.org/dl/') || null
    }
  }

  async function uploadTo0x0(buf, opts = {}) {
    const u = await uploadToTmpFilesOrg(buf, opts.filename || 'image.jpg')

  return { url: u, directUrl: u }
  }
  const uploadToTmpFiles = uploadTo0x0
  const uploadFile = uploadToTmpFilesOrg

  class ImageUploadService {
    async uploadFromBinary(buf, name = 'image.jpg') {
      const u = await uploadToTmpFilesOrg(buf, name)

  return { directLink: u, url: u }
    }
  }

  function createExif(meta = {}) {
    const json = Buffer.from(JSON.stringify({
      'sticker-pack-id': meta.packId || 'com.aimiku.sticker',
      'sticker-pack-name': meta.packname || config.sticker?.packname || 'Ai Miku',
      'sticker-pack-publisher': meta.author || config.sticker?.author || 'Arthazy',
      emojis: meta.emojis || ['✨']
    }), 'utf8')
    const hdr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const out = Buffer.concat([hdr, json])
    out.writeUIntLE(json.length, 14, 4)
    return out
  }

  async function addExifToWebp(webpBuf, meta = {}) {
    try {
      const webpmux = (await import('node-webpmux')).default || (await import('node-webpmux'))
      const img = new webpmux.Image()
      await img.load(webpBuf)
      img.exif = createExif(meta)
      return await img.save(null)
    } catch {
      return webpBuf
    }
  }

  async function sendImageAsSticker(sock, jid, input, quoted, meta = {}) {
    const sharp = (await import('sharp')).default
    let buf = input
    if (typeof input === 'string' && /^https?:\/\//i.test(input)) {
      const r = await axios.get(input, { responseType: 'arraybuffer', timeout: 30000 })
      buf = Buffer.from(r.data)
    } else if (typeof input === 'string' && fs.existsSync(input)) {
      buf = fs.readFileSync(input)
    }
    let webp = buf.slice(0, 4).toString() === 'RIFF'
      ? buf
      : await sharp(buf, { failOn: 'none' }).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 82 }).toBuffer()
    webp = await addExifToWebp(webp, meta)
    return sock.sendMessage(jid, { sticker: webp }, quoted ? { quoted } : {})
  }

  async function sendStickerPack(sock, jid, items = [], quoted, meta = {}) {
    let sent = null
    for (const item of (items || []).slice(0, 12)) {
      try {
        sent = await sendImageAsSticker(sock, jid, item, quoted, {
          packname: meta.name || meta.packname,
          author: meta.publisher || meta.author
        })
      } catch {}
    }
    return sent
  }

  async function sendPremiumSticker(sock, jid, webpBuf, { quoted } = {}) {
    return sendImageAsSticker(sock, jid, webpBuf, quoted)
  }

  async function sendAlbum(sock, jid, items = [], opts = {}) {
    const list = (items || []).filter((x) => x && (x.url || x.buffer)).slice(0, 15)
    for (let i = 0; i < list.length; i++) {
      const it = list[i]
      const media = it.buffer ? it.buffer : { url: it.url }
      const payload = it.type === 'video'
        ? { video: media, mimetype: 'video/mp4', caption: it.caption || '' }
        : { image: media, caption: it.caption || '' }
      await sock.sendMessage(jid, payload, opts.quoted ? { quoted: opts.quoted } : {})
    }
    return list.length
  }

  async function drawBrat({ text = '', bgColor = '#ffffff', textColor = '#000000', width = 512, height = 512 } = {}) {
    const { createCanvas } = await import('@napi-rs/canvas')
    const cv = createCanvas(width, height)
    const ctx = cv.getContext('2d')
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const words = String(text).split(/\s+/)
    const size = Math.max(28, Math.min(96, Math.floor(380 / Math.max(1, Math.sqrt(text.length)))))
    ctx.font = `bold ${size}px sans-serif`
    const lines = []
    let cur = ''
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w
      if (ctx.measureText(test).width > width * 0.85 && cur) { lines.push(cur); cur = w }
      else cur = test
    }
    if (cur) lines.push(cur)
    const lh = size * 1.2
    const y0 = height / 2 - ((lines.length - 1) * lh) / 2
    lines.forEach((ln, i) => ctx.fillText(ln, width / 2, y0 + i * lh))
    return cv.toBuffer('image/png')
  }

  function pickMedia(m) {
    const q = m.quoted
    const qType = q?.type || q?.mtype || ''
    const mType = m.type || m.mtype || ''
    if (q && (q.isMedia || /image|video|audio|document|sticker/i.test(qType)) && typeof q.download === 'function') {

  return { mtype: qType, mime: q.mimetype || q.msg?.mimetype || '', download: () => q.download(), node: q }
    }
    if ((m.isMedia || /image|video|audio|document|sticker/i.test(mType)) && typeof m.download === 'function') {

  return { mtype: mType, mime: m.mimetype || m.msg?.mimetype || '', download: () => m.download(), node: m.msg || m }
    }
    return null
  }

  function pickImage(m) {
    const q = m.quoted
    const qType = q?.type || q?.mtype || ''
    const mType = m.type || m.mtype || ''
    if (/image/i.test(mType) && typeof m.download === 'function') {

  return { mtype: 'imageMessage', mime: m.mimetype || 'image/jpeg', download: () => m.download(), node: m }
    }
    if (q && /image/i.test(qType) && typeof q.download === 'function') {

  return { mtype: 'imageMessage', mime: q.mimetype || 'image/jpeg', download: () => q.download(), node: q }
    }
    return null
  }

  async function reactTo(sock, m, emoji) {
    try {
      if (typeof m?.react === 'function') return await m.react(emoji)
      await sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
    } catch {}
  }

  const KODE_BAHASA = `\nid  Indonesian\nen  English\nja  Japanese\nko  Korean\nar  Arabic\nzh-CN Chinese (Simplified)\nzh-TW Chinese (Traditional)\nde  German\nfr  French\nes  Spanish\nru  Russian\npt  Portuguese\nhi  Hindi\nth  Thai\nvi  Vietnamese\nms  Malay\ntr  Turkish\nit  Italian\nnl  Dutch\npl  Polish\njv  Javanese\nsu  Sundanese`

  async function getMeta(sock, jid) {
    try { return await sock.groupMetadata(jid) } catch { return { id: jid, participants: [] } }
  }
  const isIosId = (id) => /^3A.{18}$/.test(String(id || ''))
  const chatIsIos = () => false
  const viewOnceStatus = () => null
  const viewOnceGet = async () => null

  // Reminders
  const listReminders = () => Array.isArray(global.db?.reminders) ? global.db.reminders : []
  const addReminder = ({ chat, sender, text, due }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
    global.db.reminders = [...listReminders(), { id, chat, sender, text, due, at: Date.now() }]
    saveDB()
    return id
  }
  const delReminders = (pred) => {
    const cur = listReminders()
    const next = cur.filter((r) => !pred(r))
    global.db.reminders = next
    saveDB()
    return cur.length - next.length
  }

  // Credentials
  const SERVICES = {
    github: { main: 'token', fields: ['token'], label: 'GitHub' },
    vercel: { main: 'token', fields: ['token', 'teamId'], label: 'Vercel' },
    digitalocean: { main: 'token', fields: ['token'], label: 'DigitalOcean' },
    panel: { main: 'plta', fields: ['domain', 'plta', 'pltc', 'node'], label: 'Panel Pterodactyl' }
  }
  const allOwn = () => ({})
  const delOwn = () => true
  const mask = (v) => {
    const s = String(v || '')
    return !s ? '(vacío)' : s.length <= 8 ? s.slice(0, 2) + '••••' : `${s.slice(0, 4)}••••${s.slice(-3)}`
  }

  // Unified Database Accessor
  const _dbObj = {
    get data() { return rpgStore() },
    get users() { return rpgStore().users },
    get groups() { return global.db.groups },
    get settings() { return global.db.settings },
    get clans() {
      global.db.fitur.clans ||= {}
      return global.db.fitur.clans
    },
    get activeWars() {
      global.db.fitur.activeWars ||= {}
      return global.db.fitur.activeWars
    },
    get pendingWars() {
      global.db.fitur.pendingWars ||= {}
      return global.db.fitur.pendingWars
    },
    get warHistory() {
      global.db.fitur.warHistory ||= []
      return global.db.fitur.warHistory
    },
    getUser(jid) {
      if (!jid) return null
      return ensureUser({ sender: jid })
    },
    setUser(jid, data = {}) {
      const u = ensureUser({ sender: jid })
      Object.assign(u, data)
      if (data.koin !== undefined) u.money = data.koin
      if (data.money !== undefined) u.koin = data.money
      saveDB()
      return u
    },
    updateKoin(jid, delta) {
      const u = ensureUser({ sender: jid })
      u.money = Math.max(0, (Number(u.money) || 0) + (Number(delta) || 0))
      u.koin = u.money
      saveDB()
      return u.money
    },
    updateSaldo(jid, delta) {
      const u = ensureUser({ sender: jid })
      u.bank = Math.max(0, (Number(u.bank) || 0) + (Number(delta) || 0))
      u.saldo = u.bank
      saveDB()
      return u.bank
    },
    updateExp(jid, delta) {
      const u = ensureUser({ sender: jid })
      u.exp = Math.max(0, (Number(u.exp) || 0) + (Number(delta) || 0))
      if (u.rpg) u.rpg.exp = u.exp
      saveDB()
      return u.exp
    },
    updateEnergi(jid, delta) {
      const u = ensureUser({ sender: jid })
      u.limit = Math.max(0, (Number(u.limit) || 0) + (Number(delta) || 0))
      u.energi = u.limit
      saveDB()
      return u.limit
    },
    checkCooldown(jid, key) {
      const u = ensureUser({ sender: jid })
      const until = u.cooldowns?.[key] || 0
      return Date.now() < until ? Math.ceil((until - Date.now()) / 1000) : false
    },
    setCooldown(jid, key, sec) {
      const u = ensureUser({ sender: jid })
      u.cooldowns ||= {}
      u.cooldowns[key] = Date.now() + Number(sec || 0) * 1000
      saveDB()
    },
    incrementStat() {},
    save: () => saveDB(),
    markDirty: () => saveDB()
  }
  const getDatabase = () => _dbObj

  async function addExpWithLevelCheck(sock, m, db, user, expDelta) {
    const u = user || ensureUser(m)
    const oldLvl = Number(u.level) || 1
    u.exp = Math.max(0, (Number(u.exp) || 0) + (Number(expDelta) || 0))
    const newLvl = Math.max(oldLvl, Math.floor(u.exp / 2500) + 1)
    u.level = newLvl
    if (u.rpg) {
      u.rpg.level = newLvl
      u.rpg.exp = u.exp
    }
    saveDB()
    if (newLvl > oldLvl) {
      await sock.sendMessage(m.chat, {
        text: `🎊 *¡SUBIÓ DE NIVEL!* 🎊\n👤 @${jidNumber(m.sender)} pasó de *Nv.${oldLvl}* ➔ *Nv.${newLvl}*!`,
        mentions: [m.sender]
      }, { quoted: m }).catch(() => {})
    }

  return { leveledUp: newLvl > oldLvl, oldLevel: oldLvl, newLevel: newLvl }
  }

  // Compat Sock & Message Enhancer
  function compatSock(sock) {
    if (!sock) return sock
    return new Proxy(sock, {
      get(target, prop) {
        if (prop === 'sendImageAsSticker') return (jid, buf, q, meta) => sendImageAsSticker(target, jid, buf, q, meta)
        if (prop === 'sendVideoAsSticker') return (jid, buf, q, meta) => sendImageAsSticker(target, jid, buf, q, meta)
        if (prop === 'sendStickerPack') return (jid, packs, q, meta) => sendStickerPack(target, jid, packs, q, meta)
        if (prop === 'sendAlbum') return (jid, items, opts) => sendAlbum(target, jid, items, opts)
        if (prop === 'sendMedia') {
          return (jid, src, caption = '', q, opts = {}) => {
            const media = Buffer.isBuffer(src) ? src : { url: src?.url || src }
            const t = opts.type || 'image'
            return target.sendMessage(jid, { [t]: media, caption, ...opts }, q ? { quoted: q } : {})
          }
        }
        if (prop === 'sendFile') {
          return async (jid, src, filename = 'file', caption = '', q, ptt = false, opts = {}) => {
            let buf = src
            if (typeof src === 'string' && /^https?:\/\//i.test(src)) {
              const r = await axios.get(src, { responseType: 'arraybuffer', timeout: 45000 })
              buf = Buffer.from(r.data)
            } else if (typeof src === 'string' && fs.existsSync(src)) {
              buf = fs.readFileSync(src)
            }
            const mime = opts.mimetype || ''
            if (/webp/i.test(mime) || /\.webp$/i.test(filename)) return target.sendMessage(jid, { sticker: buf, ...opts }, q ? { quoted: q } : {})
            if (/^audio/i.test(mime) || /\.(mp3|ogg|wav|m4a)$/i.test(filename)) return target.sendMessage(jid, { audio: buf, mimetype: mime || 'audio/mpeg', ptt: Boolean(ptt), ...opts }, q ? { quoted: q } : {})
            if (/^video/i.test(mime) || /\.(mp4|mkv|mov)$/i.test(filename)) return target.sendMessage(jid, { video: buf, mimetype: mime || 'video/mp4', caption, ...opts }, q ? { quoted: q } : {})
            if (/^image/i.test(mime) || /\.(jpe?g|png)$/i.test(filename)) return target.sendMessage(jid, { image: buf, caption, ...opts }, q ? { quoted: q } : {})
            return target.sendMessage(jid, { document: buf, fileName: filename, mimetype: mime || 'application/octet-stream', caption, ...opts }, q ? { quoted: q } : {})
          }
        }
        if (prop === 'reply') {
          return (jid, text, q, opts = {}) => target.sendMessage(jid, { text: String(text ?? ''), ...opts }, q ? { quoted: q } : {})
        }
        if (prop === 'getName') {
          return (jid) => rpgStore().users[jid]?.name || jidNumber(jid)
        }
        if (prop === 'parseMention') {
          return (t = '') => [...String(t).matchAll(/@([0-9]{5,16}|0)/g)].map((x) => `${x[1]}@s.whatsapp.net`)
        }
        const v = Reflect.get(target, prop)
        return typeof v === 'function' ? v.bind(target) : v
      }
    })
  }

  function enhanceMessage(m, sock, ctx = {}) {
    const mType = m.type || m.mtype || ''
    const q = m.quoted
    const qEnhanced = q ? new Proxy(q, {
      get(qt, qp) {
        if (qp === 'mtype' || qp === 'type') return qt.type || qt.mtype || ''
        if (qp === 'msg') return qt.msg || qt
        if (qp === 'text') return qt.text || qt.body || ''
        const v = Reflect.get(qt, qp)
        return typeof v === 'function' ? v.bind(qt) : v
      }
    }) : null

    return new Proxy(m, {
      get(target, prop) {
        if (prop === 'mtype' || prop === 'type') return mType
        if (prop === 'quoted') return qEnhanced
        if (prop === 'text') return ctx.text ?? target.text ?? ''
        if (prop === 'args') return ctx.args ?? target.args ?? []
        if (prop === 'prefix') return ctx.prefix ?? target.prefix ?? '.'
        if (prop === 'command') return ctx.command ?? target.command ?? ''
        if (prop === 'edit') return (t, key) => sock.sendMessage(target.chat, { text: String(t ?? ''), edit: key?.key || key })
        const v = Reflect.get(target, prop)
        return typeof v === 'function' ? v.bind(target) : v
      }
    })
  }

  function mikuWrapPlugin(pluginCfg, fn) {
    const cmds = [].concat(pluginCfg.name || [], pluginCfg.alias || []).map((x) => String(x).toLowerCase()).filter(Boolean)
    const wrapped = async (m, ctx = {}) => {
      const sock = compatSock(ctx.sock || ctx.conn)
      const em = enhanceMessage(m, sock, ctx)
      const prefix = ctx.prefix || ctx.usedPrefix || m.prefix || '.'
      return fn(em, {
        ...ctx,
        sock,
        conn: sock,
        prefix,
        usedPrefix: prefix,
        text: em.text,
        args: em.args,
        config,
        db: getDatabase(),
        reply: (t, o) => m.reply(t, o)
      })
    }
    wrapped.command = cmds
    wrapped.tags = [pluginCfg.category || 'tools']
    wrapped.help = [pluginCfg.usage || cmds[0] || '']
    wrapped.owner = Boolean(pluginCfg.isOwner)
    wrapped.premium = Boolean(pluginCfg.isPremium)
    wrapped.group = Boolean(pluginCfg.isGroup)
    wrapped.private = Boolean(pluginCfg.isPrivate)
    wrapped.admin = Boolean(pluginCfg.isAdmin)
    return wrapped
  }

  function mikuWrapClassic(fn) {
    const wrapped = async (m, ctx = {}) => {
      const sock = compatSock(ctx.sock || ctx.conn)
      const em = enhanceMessage(m, sock, ctx)
      const prefix = ctx.prefix || ctx.usedPrefix || m.prefix || '.'
      try {
        return await fn.call(sock, em, {
          ...ctx,
          sock,
          conn: sock,
          usedPrefix: prefix,
          prefix,
          args: em.args,
          text: em.text,
          q: em.text,
          quoted: em.quoted || em,
          reply: (t, o) => m.reply(t, o)
        })
      } catch (e) {
        if (typeof e === 'string') return m.reply(e)
        throw e
      }
    }
    wrapped.command = fn.command
    wrapped.tags = fn.tags || ['tools']
    wrapped.help = fn.help || []
    wrapped.owner = Boolean(fn.owner || fn.rowner)
    wrapped.premium = Boolean(fn.premium)
    wrapped.group = Boolean(fn.group)
    wrapped.private = Boolean(fn.private)
    wrapped.admin = Boolean(fn.admin)
    return wrapped
  }

  function mikuBindCommand(fn, primaryName, opts = {}) {
    const wrapped = async (m, ctx = {}) => fn(m, ctx)
    Object.assign(wrapped, fn)
    const rawCmds = Array.isArray(fn.command) ? fn.command : fn.command ? [fn.command] : [primaryName]
    wrapped.command = [...new Set([primaryName, ...rawCmds.filter((x) => typeof x === 'string')].map((x) => String(x).toLowerCase()))]
    wrapped.help = fn.help || [primaryName]
    wrapped.tags = fn.tags || ['tools']
    return wrapped
  }

  function mergePlugins(...args) {
    const tag = typeof args[0] === 'string' ? args.shift() : null
    const fns = args.filter((x) => typeof x === 'function')
    const wrapped = async (m, ctx = {}) => {
      const cmd = String(ctx.command || m.command || '').toLowerCase()
      const target = fns.find((f) => [].concat(f.command || []).map((c) => String(c).toLowerCase()).includes(cmd)) || fns[0]
      if (target) return target(m, ctx)
    }
    wrapped.command = [...new Set(fns.flatMap((f) => [].concat(f.command || []).map(String)))]
    wrapped.tags = tag ? [tag] : (fns[0]?.tags || ['tools'])
    wrapped.help = wrapped.command
    return wrapped
  }

  function adapt(fn, opts = {}) {
    const wrapped = async (m, ctx = {}) => {
      const sock = compatSock(ctx.sock || ctx.conn)
      const em = enhanceMessage(m, sock, ctx)
      const prefix = ctx.prefix || ctx.usedPrefix || m.prefix || '.'
      ensureUser(em)
      let groupMetadata = em.groupMetadata || { id: em.chat, participants: [] }
      if (em.isGroup && (!groupMetadata.participants || !groupMetadata.participants.length)) {
        groupMetadata = (await getMeta(sock, em.chat)) || groupMetadata
      }
      try {
        return await fn.call(sock, em, {
          ...ctx,
          sock,
          conn: sock,
          usedPrefix: prefix,
          prefix,
          args: em.args,
          text: em.text,
          sender: em.sender,
          isPrems: Boolean(ctx.isPremium || m.isPremium || m.isOwner),
          isOwner: Boolean(ctx.isOwner || m.isOwner),
          isROwner: Boolean(ctx.isOwner || m.isOwner),
          groupMetadata,
          participants: groupMetadata.participants || [],
          reply: (t, o) => m.reply(t, o)
        })
      } finally {
        saveDB()
      }
    }
    wrapped.command = fn.command
    wrapped.tags = [opts.category || (Array.isArray(fn.tags) ? fn.tags[0] : fn.tags) || 'tools']
    wrapped.help = fn.help || []
    wrapped.owner = Boolean(fn.owner || fn.rowner)
    wrapped.premium = Boolean(fn.premium)
    wrapped.group = Boolean(fn.group)
    wrapped.admin = Boolean(fn.admin)
    return wrapped
  }

  // Built-in mikuLib registry (includes cekbio, thumb, helperbails)
  const _builtinLibs = {
    cekbio: async () => ({
      getJamPercentage(bioData, setAt, isBusiness) {
        let s = 50
        if (bioData) s += 20
        if (setAt) s += 15
        if (isBusiness) s += 15
        return Math.min(100, s)
      },
      createProgressBar(cur, tot) {
        const p = tot > 0 ? Math.floor((cur / tot) * 10) : 0
        const pct = tot > 0 ? Math.floor((cur / tot) * 100) : 0
        return '█'.repeat(p) + '░'.repeat(Math.max(0, 10 - p)) + ` ${pct}%`
      },
      async checkMetaBusiness(conn, jid) {
        try { return { isBusiness: Boolean(await conn.getBusinessProfile?.(jid).catch(() => null)) } }
        catch { return { isBusiness: false } }
      },
      createBioResultFile(results) {
        const tmpPath = path.join(os.tmpdir(), `cekbio_${Date.now()}.txt`)
        const text = (results || []).map((r) => `${r.number} | ${r.status || r.bio || '-'}`).join('\n')
        fs.writeFileSync(tmpPath, text, 'utf8')
        return tmpPath
      },
      async parseNumbersFromBuffer(buffer) {
        const matches = buffer.toString('utf8').match(/\b\d{10,15}\b/g)
        return matches ? [...new Set(matches)] : []
      }
    }),
    thumb: async () => ({
      getActiveThumbBuffer: async () => {
        try {
          const r = await axios.get(getThumbFromConfig('tools'), { responseType: 'arraybuffer', timeout: 10000 })
          return Buffer.from(r.data)
        } catch {
          return null
        }
      }
    }),
    helperbails: async () => {
      const b = await import('@rexxhayanasi/elaina-baileys')

  return { ...b, default: (s) => s }
    }
  }

  const _rbRegistry = new Map()
  function mikuMountPlugin(id, factory, libs = null) {
    _rbRegistry.set(id, { factory, value: null, libs })
  }

  async function mikuInvokePlugin(id, m, ctx = {}) {
    const entry = _rbRegistry.get(id)
    if (!entry) return
    const sock = compatSock(ctx.sock || ctx.conn)
    const prefix = ctx.prefix || ctx.usedPrefix || m.prefix || '.'
    const mikuGlobal = new Proxy({}, {
      get(_, prop) {
        if (prop === 'mainSock' || prop === 'conn') return sock
        if (prop === 'namaBot' || prop === 'botName') return global.namebot
        if (prop === 'botCreator') return global.ownername
        if (prop === 'owner') return getOwners()
        if (prop === 'prefix') return [prefix]
        return global[prop]
      },
      set(_, prop, val) { global[prop] = val; return true }
    })
    const localCache = {}
    const mikuLib = async (name) => {
      if (entry.libs && entry.libs[name]) {
        return (localCache[name] ||= await entry.libs[name]({ mikuGlobal, mikuLib }))
      }
      if (_builtinLibs[name]) {
        return (localCache[name] ||= await _builtinLibs[name]({ mikuGlobal, mikuLib }))
      }

  return {}
    }
    if (!entry.value) {
      entry.value = await entry.factory({ mikuGlobal, mikuLib })
    }
    const fn = entry.value
    const em = enhanceMessage(m, sock, ctx)
    let groupMetadata = em.groupMetadata || { id: em.chat, participants: [] }
    if (em.isGroup && (!groupMetadata.participants || !groupMetadata.participants.length)) {
      groupMetadata = (await getMeta(sock, em.chat)) || groupMetadata
    }
    const fullCtx = {
      ...ctx,
      sock,
      conn: sock,
      jid: em.chat,
      sender: em.sender,
      prefix,
      usedPrefix: prefix,
      text: em.text,
      args: em.args,
      command: ctx.command || em.command || '',
      isOwner: Boolean(ctx.isOwner || m.isOwner),
      isPremium: Boolean(ctx.isPremium || m.isPremium || m.isOwner),
      isAdmin: Boolean(ctx.isAdmin || m.isAdmin),
      isUserAdmin: Boolean(ctx.isAdmin || m.isAdmin),
      isBotAdmin: Boolean(ctx.isBotAdmin || m.isBotAdmin),
      groupMetadata,
      participants: groupMetadata.participants || [],
      reply: (t, o) => m.reply(t, o),
      react: (e) => reactTo(sock, m, e),
      example: (usage) => m.reply(`📌 *Ejemplo de uso:*\n\`${prefix}${ctx.command || em.command} ${usage}\``)
    }
    return fn(em, fullCtx)
  }

  const mikuStateVault = () => (global.db.dio ||= { praktis: {}, profile: {} })
  const mikuStateCommit = () => saveDB()
  const _dioRegistry = new Map()
  const _cjsRequire = _eCreateRequire(import.meta.url)

  function mikuWorldMount(id, fn, libs = null) {
    _dioRegistry.set(id, { fn, libs, mod: null, cache: new Map() })
  }

  async function mikuWorldInvoke(id, m, ctx = {}) {
    const entry = _dioRegistry.get(id)
    if (!entry) return
    if (!entry.mod) {
      entry.mod = { exports: {} }
      const req = (spec) => {
        const clean = String(spec).replace(/^(\.\.?\/)+(lib\/)?/, '')
        if (entry.libs && entry.libs[clean]) {
          if (!entry.cache.has(clean)) {
            const sub = { exports: {} }
            entry.cache.set(clean, sub)
            entry.libs[clean](sub, sub.exports, req)
          }
          return entry.cache.get(clean).exports
        }
        return _cjsRequire(spec)
      }
      entry.fn(entry.mod, entry.mod.exports, req)
    }
    const sock = compatSock(ctx.sock || ctx.conn)
    const em = enhanceMessage(m, sock, ctx)
    const prefix = ctx.prefix || ctx.usedPrefix || m.prefix || '.'
    return entry.mod.exports.run({
      sock,
      m: em,
      body: m.body || m.text || '',
      budy: m.body || m.text || '',
      text: em.text,
      q: em.text,
      args: em.args,
      command: ctx.command || em.command || '',
      prefix,
      usedPrefix: prefix,
      pushname: m.pushName || 'User',
      pushName: m.pushName || 'User',
      reply: (t, o) => m.reply(t, o),
      from: m.chat,
      isGroup: Boolean(m.isGroup),
      isCreator: Boolean(ctx.isOwner || m.isOwner),
      isOwner: Boolean(ctx.isOwner || m.isOwner),
      isPremium: Boolean(ctx.isPremium || m.isPremium)
    })
  }

  function styleMikuText(rawText, cat = 'tools', cmd = '') {
    if (typeof rawText !== 'string') return rawText;
    let t = rawText.trim();
    if (!t) return rawText;
    if (t.includes('✦「') || t.includes('╭─── ❖') || /^https?:\/\/\S+$/i.test(t) || /^[\[{]/.test(t)) {
      return t
        .replace(/Ourin-AI|Ourin|Kaguya\s*MD|Kaguya/gi, 'Ai Miku')
        .replace(/YannRzy(?:\s*Tech)?|Yannrzy/gi, 'Arthazy');
    }
    const badges = {
      clan: '🏰 MIKU CLAN',
      audio: '🎧 MIKU AUDIO',
      download: '📥 MIKU DOWNLOAD',
      pushkontak: '📲 CONTACTOS DE MIKU',
      sticker: '🎨 MIKU STICKER',
      tools: '🛠️ MIKU TOOLS',
      search: '🔎 MIKU SEARCH',
      maker: '✨ MIKU MAKER',
      jpm: '📡 MIKU JPM',
      channel: '📢 MIKU CHANNEL',
      anime: '🌸 MIKU ANIME',
    };
    const badge = badges[cat] || '✦ AI MIKU';
    t = t
      .replace(/Ourin-AI|Ourin|Kaguya\s*MD|Kaguya/gi, 'Ai Miku')
      .replace(/YannRzy(?:\s*Tech)?|Yannrzy/gi, 'Arthazy')
      .replace(/^[╭┌]──+[『「\s]*(.+?)[』」\s]*──*[╮┐]$/gm, '✦「 *$1* 」')
      .replace(/^[╰└][─━═┈]+[╯┘⬡·]*$/gm, '')
      .replace(/^[│┃]\s*[•▪-]\s*/gm, '   ✧ ')
      .replace(/^[│┃]\s*/gm, '   ✧ ')
      .replace(/^\*▢\s*([^*]+)\*/gm, '✦「 *$1* 」')
      .replace(/^[•▪]\s+/gm, '   ✧ ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const lines = t.split('\n').filter((l, i, arr) => !(l.trim() === '' && arr[i - 1]?.trim() === ''));
    if (lines.length <= 3 && !t.includes('✦「')) {
      const body = lines.map((l) => (l.trim().startsWith('✧') ? l : `   ✧ ${l.replace(/^>\s*/, '')}`)).join('\n');
      return `✦「 *${badge}* 」\n${body}`;
    }
    if (!t.includes('✦「') && lines.length > 3) {
      const first = lines[0].replace(/\*/g, '').trim();
      const rest = lines.slice(1).map((l) => {
        if (!l.trim()) return '';
        return l.trim().startsWith('✧') || l.trim().startsWith('✦「') ? l : `   ✧ ${l.replace(/^>\s*/, '')}`;
      }).join('\n');
      return `✦「 *${first || badge}* 」\n${rest}`;
    }
    return t;
  }

  function buildRuntimeContext(m, ctx = {}, currentCat = 'tools') {
    const rawSock = ctx.sock || ctx.conn || global.sock || {};
    const prefix = ctx.prefix || ctx.usedPrefix || m?.prefix || config?.command?.prefix || '.';
    const command = ctx.command || m?.command || '';
    const cat = String(currentCat || 'tools').toLowerCase();
    const skipStyleCats = new Set(['main', 'owner', 'group', 'canvas', 'fun', 'cek', 'user', 'ai', 'menfess', 'convert', 'premium']);

    const sock = (rawSock && typeof rawSock === 'object') ? new Proxy(rawSock, {
      get(target, prop) {
        if (prop === 'sendMessage' && typeof target.sendMessage === 'function') {
          return (jid, content, options) => {
            if (!skipStyleCats.has(cat) && content && typeof content === 'object') {
              if (typeof content.text === 'string') content = { ...content, text: styleMikuText(content.text, cat, command) };
              else if (typeof content.caption === 'string') content = { ...content, caption: styleMikuText(content.caption, cat, command) };
            }
            if (options?.quoted?.key && (options.quoted.key.remoteJid === 'status@broadcast' || options.quoted.key.participant === '0@s.whatsapp.net')) {
              options = { ...options, quoted: m };
            }
            return target.sendMessage(jid, content, options);
          };
        }
        if (prop === 'reply' && typeof target.reply !== 'function') {
          return (jid, text, quoted, options = {}) => {
            const styled = (!skipStyleCats.has(cat) && typeof text === 'string') ? styleMikuText(text, cat, command) : text;
            const safeQuoted = (quoted?.key && (quoted.key.remoteJid === 'status@broadcast' || quoted.key.participant === '0@s.whatsapp.net')) ? m : quoted;
            return target.sendMessage(jid, { text: styled, ...options }, safeQuoted ? { quoted: safeQuoted } : undefined);
          };
        }
        const v = Reflect.get(target, prop, target);
        return typeof v === 'function' ? v.bind(target) : v;
      }
    }) : rawSock;

    const em = (typeof enhanceMessage === 'function') ? enhanceMessage(m, sock, ctx) : m;
    const reply = async (txt, opts = {}) => {
      const out = (!skipStyleCats.has(cat) && typeof txt === 'string') ? styleMikuText(txt, cat, command) : txt;
      if (typeof m?.reply === 'function') return await m.reply(out, opts);
      if (typeof sock?.sendMessage === 'function') return await sock.sendMessage(em?.chat || m?.chat, { text: String(out), ...opts }, { quoted: m });
    };

    const groupMetadata = ctx.groupMetadata || em?.groupMetadata || m?.groupMetadata || { id: em?.chat || m?.chat, participants: [] };
    return {
      ...ctx,
      m: em,
      sock,
      conn: sock,
      jid: em?.chat || m?.chat,
      chat: em?.chat || m?.chat,
      sender: em?.sender || m?.sender,
      pushname: m?.pushName || em?.pushName || 'User',
      pushName: m?.pushName || em?.pushName || 'User',
      prefix,
      usedPrefix: prefix,
      text: ctx.text ?? em?.text ?? m?.text ?? '',
      args: ctx.args || em?.args || m?.args || [],
      command,
      isGroup: Boolean(m?.isGroup || em?.isGroup),
      isOwner: Boolean(ctx.isOwner || m?.isOwner),
      isROwner: Boolean(ctx.isROwner || ctx.isOwner || m?.isOwner),
      isCreator: Boolean(ctx.isOwner || m?.isOwner),
      isPremium: Boolean(ctx.isPremium || m?.isPremium || m?.isOwner),
      isAdmin: Boolean(ctx.isAdmin || m?.isAdmin),
      isUserAdmin: Boolean(ctx.isAdmin || m?.isAdmin),
      isBotAdmin: Boolean(ctx.isBotAdmin || m?.isBotAdmin),
      groupMetadata,
      participants: ctx.participants || m?.groupMembers || groupMetadata.participants || [],
      reply,
      react: (e) => (typeof m?.react === 'function' ? m.react(e) : reactTo(sock, m, e)),
      example: (usage) => reply(`╭─── ❖ 『 💡 *GUÍA DE LA FUNCIÓN* 』 ❖\n│ ✦ *Comando:* ${prefix}${command}\n│ ✦ *Ejemplo:* ${prefix}${command} ${usage}\n╰──────────────────❖\n_✦ Ai Miku • by Arthazy_`),
    };
  }

  function enhanceHandler(fn, pluginConfig = {}) {
    if (typeof fn !== 'function') return fn;
    if (fn.__mikuEnhanced) return fn;
    const cat = String(pluginConfig?.category || 'tools').toLowerCase();
    const wrapped = async function(m, ctx = {}) {
      const rctx = buildRuntimeContext(m, ctx, cat);
      const regRequiredCats = new Set(['clan', 'game', 'games', 'fun', 'cek']);
      const cmdLow = String(rctx.command || pluginConfig?.name || '').toLowerCase();
      if (!rctx.isOwner && (pluginConfig?.isRegistered || regRequiredCats.has(cat)) && !['daftar','reg','register','verifikasi','verify','unreg','ceksn','listdaftar'].includes(cmdLow)) {
        const mainUser = ctx?.db?.getUser ? ctx.db.getUser(rctx.m.sender) : null;
        if (!mainUser?.isRegistered) {
          const p = rctx.prefix || '.';
          return await rctx.reply(
            `╭─── ❖ 『 🔒 *ACCESO SOLO PARA AVENTUREROS* 』 ❖\n` +
            `│ ✦ ¡Todavía no estás registrado en *Ai Miku*!\n` +
            `│ ✦ La función *${p}${rctx.command || pluginConfig?.name}* necesita tu Tarjeta de Aventurero.\n` +
            `├─── ❖ 『 📝 *CÓMO REGISTRARTE* 』 ❖\n` +
            `│ 📌 *Escribe:* \`${p}daftar Nombre.Edad\`\n` +
            `│ ✨ *Ejemplo:* \`${p}daftar ${rctx.m.pushName || 'Arthazy'}.19\`\n` +
            `│ 🎁 *Bono:* +25.000 monedas, +15.000 EXP y +15 energía!\n` +
            `╰──────────────────────────❖`
          );
        }
      }
      if (!Array.prototype.getRandom) {
        Object.defineProperty(Array.prototype, 'getRandom', {
          value: function() { return this[Math.floor(Math.random() * this.length)]; },
          writable: true,
          configurable: true,
        });
      }
      if (!global.rpg || typeof global.rpg.emoticon !== 'function') {
        const emMap = { money: '💰', bank: '🏦', exp: '✨', level: '📊', limit: '⚡', health: '❤️', potion: '🧪', diamond: '💎', gold: '🪙', iron: '⛓️', wood: '🪵', rock: '🪨', string: '🕸️', trash: '🗑️', common: '📦', uncommon: '🎁', mythic: '🟣', legendary: '🟡' };
        global.rpg = { emoticon: (k) => emMap[String(k || '').toLowerCase()] || '✦' };
      }
      if (global.bankCentral === undefined) global.bankCentral = 0;
      if (rctx.m?.sender && typeof ensureUser === 'function') {
        try { ensureUser(rctx.m); } catch {}
      }
      return await fn.call(this, rctx.m, rctx);
    };
    wrapped.__mikuEnhanced = true;
    return wrapped;
  }

  function createWorldHandler(factoryFn, libs = {}) {
    let instance = null;
    const reqCache = {};
    const cjsRequire = (spec) => {
      const clean = spec.replace(/^\.\//, '');
      if (reqCache[clean]) return reqCache[clean];
      if (libs && libs[clean]) {
        const mod = { exports: {} };
        libs[clean](mod, mod.exports, cjsRequire);
        reqCache[clean] = mod.exports;
        return mod.exports;
      }
      return ({ axios: _eAxios, fs: _eFs, path: _ePath, crypto: _eCrypto, child_process: _eChildProcess, util: { promisify: _ePromisify } }[spec] || {});
    };
    return async function handler(m, ctx = {}) {
      if (!instance) {
        const mod = { exports: {} };
        factoryFn(mod, mod.exports, cjsRequire);
        instance = mod.exports;
      }
      const rctx = buildRuntimeContext(m, ctx, 'search');
      if (typeof instance === 'function') return await instance(rctx.m, rctx);
      if (typeof instance?.run === 'function') return await instance.run({ ...rctx, m: rctx.m });
      if (typeof instance?.handler === 'function') return await instance.handler(rctx.m, rctx);
    };
  }

  const _mikuLibs = new Map();
  const _mikuLibCache = new Map();
  function defineLib(name, factory) {
    _mikuLibs.set(name, factory);
  }
  async function mikuLib(name, localLibs = null) {
    if (localLibs && typeof localLibs[name] === 'function') {
      const k = 'local:' + name + ':' + String(localLibs[name]).length;
      if (!_mikuLibCache.has(k)) {
        _mikuLibCache.set(k, await localLibs[name]({ mikuLib: (n) => mikuLib(n, localLibs) }));
      }
      return _mikuLibCache.get(k);
    }
    if (_mikuLibCache.has(name)) return _mikuLibCache.get(name);
    if (_mikuLibs.has(name)) {
      const val = await _mikuLibs.get(name)({ mikuLib });
      _mikuLibCache.set(name, val);
      return val;
    }
    if (name === 'thumb') {
      return {
        getActiveThumbBuffer: async () => null,
        getThumbUrl: (k) => getThumbFromConfig(k),
      };
    }
    return {};
  }
  const mikuGlobal = global;

  return {
    buildRuntimeContext, defineLib, mikuLib, mikuGlobal, enhanceHandler, createWorldHandler,
    config, te, saluranCtx, getDatabase, rpgStore, makeDefaultUser, ensureUser,
    saveDB, persist, sleep, jidNumber, userOf, digits, isLidJid, resolvePhone, toPN,
    getOwners, formatWib, wibDay, durasi, clockString, formatRemaining, fiturFmt, fmt: fiturFmt, cfg, beri,
    xpRange, f, safeJson, queueFFmpeg, obfuscateJs,
    getAssetBuffer, defaultAvatar, getProfileBuffer, canvasGetAvatarBuffer, canvasRoundedRectPath, canvasDrawAvatar, drawAvatar: canvasDrawAvatar,
    uploadToCatboxFile, uploadToCatbox: uploadToCatboxFile, uploadToTmpFilesOrg, uploadToTmpFiles, uploadTo0x0, uploadFile, ImageUploadService,
    addExifToWebp, sendImageAsSticker, sendStickerPack, sendPremiumSticker, sendAlbum, drawBrat,
    pickMedia, pickImage, reactTo, KODE_BAHASA,
    getMeta, isIosId, chatIsIos, viewOnceStatus, viewOnceGet,
    listReminders, addReminder, delReminders,
    SERVICES, allOwn, delOwn, mask,
    addExpWithLevelCheck, compatSock, enhanceMessage,
    mikuWrapPlugin, mikuWrapClassic, mikuBindCommand, mergePlugins, adapt,
    mikuMountPlugin, mikuInvokePlugin, mikuWorldMount, mikuWorldInvoke, mikuStateVault, mikuStateCommit, getThumbFromConfig
  }
})()

export { MikuEngine };
export default MikuEngine;
