/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
/**
 * ✦ Ai Miku — Social & Waifu Kernel (src/lib/system/social-kernel.js)
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

const MikuGuildKernel = (() => {
  const { saveDB, persist, sleep, jidNumber, toPN, ensureUser } = MikuEngine
  const store = () => (global.db.fitur ||= {})
  const save = () => saveDB()
  const num = jidNumber
  const rupiah = (n) => Number(n || 0).toLocaleString('id-ID')
  const formatDuration = (ms) => MikuEngine.clockString(ms)
  const pick = (a) => a[Math.floor(Math.random() * a.length)]
  const rememberSock = (s) => { if (s) global.__sosialSock = s }

  const gameStore = () => {
    const s = store()
    s.game ||= { tower: {}, map: {}, stock: {} }
    return s.game
  }
  const rpgUser = async (sock, m) => {
    const pn = await toPN(sock, m.sender)
    return { pn, user: ensureUser({ sender: pn, pushName: m.pushName || num(pn) }) }
  }
  const addMoney = async (sock, jid, pushName, amount) => {
    const pn = await toPN(sock, jid)
    const u = ensureUser({ sender: pn, pushName: pushName || num(pn) })
    u.money = (Number(u.money) || 0) + Number(amount || 0)
    saveDB()
    return u.money
  }
  const combatStats = (u) => {
    const lvl = Math.max(1, Number(u.level) || 1)
    const sword = Math.min(Number(u.sword) || 0, 1) * 15 + Math.min(Number(u.goldsword) || 0, 1) * 30
    const armor = Math.min(Number(u.armor) || 0, 1) * 8
    return { atk: 10 + lvl * 2 + sword, def: 2 + Math.floor(lvl / 2) + armor }
  }
  const simulateFight = (playerHp, p, monster) => {
    let hp = playerHp, mhp = monster.hp, rounds = 0
    const hit = (atk, def) => Math.max(1, Math.round((atk - def * 0.5) * (0.8 + Math.random() * 0.4)))
    while (hp > 0 && mhp > 0 && rounds < 60) {
      rounds++
      mhp -= hit(p.atk, monster.def || 0)
      if (mhp <= 0) break
      hp -= hit(monster.atk, p.def)
    }
    return { win: mhp <= 0 && hp > 0, hpLeft: Math.max(0, hp), rounds }
  }
  const weekKey = (t = Date.now()) => {
    const d = new Date(t + 7 * 3600000)
    return `${d.getUTCFullYear()}-W${String(Math.ceil(d.getUTCDate() / 7)).padStart(2, '0')}`
  }

  const JPM_DEFAULTS = { delayJpm: 3000, delayJpmTag: 3000, delayAutoSwgc: 60000, delayPushKontak: 2000 }
  const JPM_MIN_INTERVAL = 5000
  const jpmCfg = () => ({ ...JPM_DEFAULTS, ...(store().jpm || {}) })
  const jpmSetCfg = (key, value) => {
    const s = store()
    s.jpm ||= {}
    s.jpm[key] = value
    save()
  }
  const jpmJobs = () => (global.__jpmJobs ||= { autoJpm: null, autoJpmTag: null, autoSwgc: null, pushRunning: false })
  function parseInterval(raw) {
    const mt = String(raw || '').toLowerCase().match(/^(\d+(?:\.\d+)?)(ms|s|m|h)?$/)
    if (!mt) return null
    return Math.round(parseFloat(mt[1]) * { ms: 1, s: 1000, m: 60000, h: 3600000 }[mt[2] || 'ms'])
  }
  function splitInterval(text, fallbackMs = 60000) {
    const t = String(text || '').trim()
    const first = t.split(/\s+/)[0] || ''
    const ms = parseInterval(first)
    return ms === null ? { interval: fallbackMs, teks: t } : { interval: ms, teks: t.slice(first.length).trim() }
  }
  const jpmBlacklist = (auto = false) => [...(store().jpm?.[auto ? 'blAuto' : 'blacklist'] || [])]
  const jpmSetBlacklist = (auto, list) => jpmSetCfg(auto ? 'blAuto' : 'blacklist', [...new Set(list)])
  async function jpmGroups(sock, { auto = false } = {}) {
    const all = await sock.groupFetchAllParticipating()
    const skip = new Set([...jpmBlacklist(false), ...(auto ? jpmBlacklist(true) : [])])
    return Object.values(all).filter((g) => !skip.has(g.id))
  }
  function tagList(meta) {
    const mentions = (meta?.participants || []).map((p) => p.id)
    return { mentions, text: mentions.map((id) => `@${jidNumber(id)}`).join(' ') }
  }
  const MEDIA_KIND = { imageMessage: 'image', videoMessage: 'video', audioMessage: 'audio', documentMessage: 'document', documentWithCaptionMessage: 'document' }
  async function getMedia(m, kinds = ['image', 'video']) {
    const node = m.quoted?.isMedia ? m.quoted : (m.isMedia ? m : null)
    if (!node || typeof node.download !== 'function') return null
    const mType = node.type || node.mtype || ''
    const kind = MEDIA_KIND[mType] || (/image/i.test(mType) ? 'image' : /video/i.test(mType) ? 'video' : /audio/i.test(mType) ? 'audio' : null)
    if (!kind || !kinds.includes(kind)) return null
    const buffer = await node.download().catch(() => null)
    if (!buffer) return null
    return { kind, buffer, mime: node.mimetype || '', fileName: node.fileName || 'file', ptt: Boolean(node.ptt), caption: node.text || '' }
  }
  function mediaContent(media, caption = '', mentions) {
    const c = { [media.kind]: media.buffer }
    if (caption && media.kind !== 'audio') c.caption = caption
    if (media.kind !== 'image') c.mimetype = media.mime
    if (media.kind === 'audio') c.ptt = media.ptt
    if (media.kind === 'document') c.fileName = media.fileName
    if (mentions) c.mentions = mentions
    return c
  }
  async function jpmLoop(targets, delayMs, send, isStopped = () => false) {
    let ok = 0, fail = 0
    global.__jpmRunning = true
    try {
      for (const t of targets) {
        if (isStopped() || global.__jpmStop) break
        try { await send(t); ok++ } catch { fail++ }
        await sleep(delayMs)
      }
    } finally {
      global.__jpmRunning = false
      global.__jpmStop = false
    }
    return { ok, fail }
  }
  function jpmStartJob(name, ms, tick) {
    const jobs = jpmJobs()
    jpmStopJob(name)
    let busy = false
    const job = { ms, startedAt: Date.now(), timer: null }
    job.timer = setInterval(async () => {
      if (busy) return
      busy = true
      try { await tick(() => jobs[name] !== job) } catch {} finally { busy = false }
    }, ms)
    jobs[name] = job
    return job
  }
  function jpmStopJob(name) {
    const jobs = jpmJobs()
    const job = jobs[name]
    if (!job) return false
    clearInterval(job.timer)
    jobs[name] = null
    return true
  }
  async function sendGroupStatus(sock, jid, { text = '', media = null } = {}) {
    if (media) {
      return sock.sendMessage(jid, mediaContent(media, text))
    }
    return sock.sendMessage(jid, { text })
  }
  async function memberJids(sock, meta) {
    const me = jidNumber(sock.user?.id)
    const out = []
    for (const p of meta?.participants || []) {
      const jid = await toPN(sock, p.phoneNumber || p.id)
      if (jid && jid.endsWith('@s.whatsapp.net') && jidNumber(jid) !== me && !out.includes(jid)) out.push(jid)
    }
    return out
  }
  const pushKode = (n = 6) => Array.from({ length: n }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')
  function buildVcf(jids, nameOf) {
    return jids.map((jid, i) => {
      const nomor = jidNumber(jid)
      const nama = nameOf ? nameOf(jid, i) : `WA[${pushKode(2)}] ${nomor}`
      return ['BEGIN:VCARD', 'VERSION:3.0', `FN:${nama}`, `TEL;type=CELL;type=VOICE;waid=${nomor}:+${nomor}`, 'END:VCARD', ''].join('\n')
    }).join('')
  }
  async function sendVcf(sock, to, jids, { fileName, caption = '', nameOf, quoted } = {}) {
    if (!jids.length) return false
    const safe = String(fileName || `kontak_${jids.length}`).replace(/[\\/:*?"<>|]+/g, '_')
    await sock.sendMessage(to, {
      document: Buffer.from(buildVcf(jids, nameOf), 'utf8'),
      fileName: safe.endsWith('.vcf') ? safe : `${safe}.vcf`,
      mimetype: 'text/vcard',
      caption
    }, quoted ? { quoted } : undefined)
    return true
  }

  return {
    store, save, num, rupiah, formatDuration, pick, rememberSock, gameStore, rpgUser,
    persist, addMoney, combatStats, simulateFight, weekKey,
    JPM_DEFAULTS, JPM_MIN_INTERVAL, jpmCfg, jpmSetCfg, jpmJobs, splitInterval,
    jpmBlacklist, jpmSetBlacklist, jpmGroups, tagList, getMedia, mediaContent,
    jpmLoop, jpmStartJob, jpmStopJob, sendGroupStatus, memberJids, pushKode, sendVcf
  }
})()

export { MikuGuildKernel };
export default MikuGuildKernel;
