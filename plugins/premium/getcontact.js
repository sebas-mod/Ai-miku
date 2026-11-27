/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { createHmac, createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pluginConfig = {
    name: "getcontact",
    alias: ["gc"],
    category: "premium",
    description: "gc login <nomor>",
    usage: ".gc login <número>",
    example: ".gc login <número>",
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const GTC_BASE = 'https://pbssrv-centralevents.com'
const VFK_BASE = 'https://api.verifykit.com'
const HMAC_KEY = '31426764382a642f3a6665497235466f3d236d5d785b722b4c657457442a495b494524324866782a2364292478587a78662d7a7b7578593f71703e2b7e365762'
const VFK_HMAC_KEY = '3452235d713252604a35562d325f765238695738485863672a705e6841544d3c7e6e45463028266f372b544e596f3829236b392825262e534a7e774f37653932'
const VFK_CLIENT_KEY = 'bhvbd7ced119dc6ad6a0b35bd3cf836555d6f71930d9e5a405f32105c790d'
const VFK_FINAL_KEY = 'bd48d8c25293cfb537619cc93ae3d6e372eb2ddfffff4ab0eb000777144c7bfa'
const BUNDLE_ID = 'app.source.getcontact'
const DH_P = 900719898367n
const DH_G = 7n
const APP_VERSION = '8.4.0'
const ANDROID_OS = 'android 9'
const LANG = 'en_US'
const COUNTRY = 'id'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.join(__dirname, '..', '..')
const DB_DIR = path.join(ROOT_DIR, 'database', 'logs')

if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true })
}

const SESSION_FILE = path.join(DB_DIR, 'getcontact_session.json')
const PENDING_FILE = path.join(DB_DIR, 'getcontact_pending.json')

function modPow(base, exp, mod) {
  let res = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp % 2n === 1n) res = (res * base) % mod
    base = (base * base) % mod
    exp = exp / 2n
  }
  return res
}

function dhKeypair() {
  const priv = BigInt(Math.floor(Math.random() * 99000000) + 1000000)
  const pub = modPow(DH_G, priv, DH_P)
  return { priv, pub: Number(pub) }
}

function dhFinalKey(priv, serverPub) {
  const shared = modPow(BigInt(serverPub), priv, DH_P)
  return createHash('sha256').update(shared.toString()).digest('hex')
}

function sig(ts, message, keyHex) {
  return createHmac('sha256', Buffer.from(keyHex, 'hex'))
    .update(`${ts}-${message}`)
    .digest('base64')
}

function encrypt(text, keyHex) {
  const cipher = createCipheriv('aes-256-ecb', Buffer.from(keyHex, 'hex'), null)
  return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64')
}

function decrypt(b64, keyHex) {
  const decipher = createDecipheriv('aes-256-ecb', Buffer.from(keyHex, 'hex'), null)
  return Buffer.concat([decipher.update(Buffer.from(b64, 'base64')), decipher.final()]).toString('utf8')
}

function normalizePhone(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Se requiere un número de teléfono')
  const p = raw.trim().replace(/[^\d+]/g, '')
  if (p.startsWith('+')) return p
  if (p.startsWith('0')) return `+62${p.slice(1)}`
  if (p.startsWith('62')) return `+${p}`
  return `+${p}`
}

function saveSession(creds) { writeFileSync(SESSION_FILE, JSON.stringify(creds, null, 2), 'utf-8') }
function loadSession() {
  if (!existsSync(SESSION_FILE)) return null
  try { return JSON.parse(readFileSync(SESSION_FILE, 'utf-8')) } catch { return null }
}

async function vfkCall(endpoint, payload, deviceId) {
  const raw = JSON.stringify(payload)
  const ts = String(Date.now())
  const signature = sig(ts, raw, VFK_HMAC_KEY)

  const res = await fetch(`${VFK_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VFK-Client-Device-Id': deviceId,
      'X-VFK-Client-Key': VFK_CLIENT_KEY,
      'X-VFK-Sdk-Version': '0.11.4',
      'X-VFK-Os': 'android 9.0',
      'X-VFK-App-Version': '8.16.0',
      'X-VFK-Encrypted': '1',
      'X-VFK-Lang': 'in_ID',
      'X-VFK-Req-Timestamp': ts,
      'X-VFK-Req-Signature': signature
    },
    body: JSON.stringify({ data: encrypt(raw, VFK_FINAL_KEY) })
  })

  const json = await res.json()
  if (json.data) {
    try { return { status: res.status, data: JSON.parse(decrypt(json.data, VFK_FINAL_KEY)) } } catch {}
  }
  return { status: res.status, data: json }
}

async function gtcCall(endpoint, payload, { token, finalKey, clientDeviceId }) {
  const raw = JSON.stringify(payload)
  const ts = String(Date.now())
  const signature = sig(ts, raw, HMAC_KEY)

  const res = await fetch(`${GTC_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-os': ANDROID_OS,
      'x-app-version': APP_VERSION,
      'x-client-device-id': clientDeviceId,
      'x-lang': LANG,
      'x-req-timestamp': ts,
      'x-country-code': COUNTRY,
      'x-encrypted': '1',
      'x-req-signature': signature,
      'x-token': token,
      'User-Agent': 'okhttp/4.12.0'
    },
    body: JSON.stringify({ data: encrypt(raw, finalKey) })
  })

  const json = await res.json()
  if (json.data) {
    try { return { status: res.status, data: JSON.parse(decrypt(json.data, finalKey)) } } catch {}
  }
  return { status: res.status, data: json }
}

async function initAuth(phoneNumber) {
  const phone = normalizePhone(phoneNumber)
  const deviceId = randomBytes(8).toString('hex')
  const { priv, pub } = dhKeypair()
  const ts = String(Date.now())

  const regBody = {
    carrierCountryCode: '510', carrierName: 'Indosat Ooredoo', carrierNetworkCode: '01',
    countryCode: COUNTRY, deepLink: null, deviceName: 'SM-G977N', deviceType: 'Android',
    email: null, notificationToken: '', oldToken: null, peerKey: pub, timeZone: 'Asia/Bangkok', token: ''
  }

  const raw = JSON.stringify(regBody)
  const signature = sig(ts, raw, HMAC_KEY)

  const res = await fetch(`${GTC_BASE}/v2.8/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 'x-os': ANDROID_OS, 'x-app-version': APP_VERSION,
      'x-client-device-id': deviceId, 'x-lang': LANG, 'x-req-timestamp': ts,
      'x-country-code': COUNTRY, 'x-encrypted': '0', 'x-req-signature': signature,
      'User-Agent': 'okhttp/4.12.0'
    },
    body: raw
  })

  const regJson = await res.json()
  if (res.status !== 201 || !regJson.result?.token || !regJson.result?.serverKey) {
    throw new Error(regJson.meta?.errorMessage || `Error en el registro: HTTP ${res.status}`)
  }

  const token = regJson.result.token
  const finalKey = dhFinalKey(priv, regJson.result.serverKey)
  const common = { token, finalKey, clientDeviceId: deviceId }
  const base = {
    carrierCountryCode: '510', carrierName: 'Indosat Ooredoo', carrierNetworkCode: '01',
    countryCode: COUNTRY, deviceName: 'SM-G977N', notificationToken: '', timeZone: 'Asia/Bangkok', token
  }

  await gtcCall('/v2.8/init-basic', base, common)
  await gtcCall('/v2.8/ad-settings', { source: 'init', token }, common)
  await gtcCall('/v2.8/init-intro', { ...base, hasRouting: false }, common)
  await gtcCall('/v2.8/country', { countryCode: 'ID', token }, common)
  await gtcCall('/v2.8/validation-start', { app: 'verifykit', countryCode: COUNTRY, notificationToken: '', token }, common)
  await vfkCall('/v2.0/init', {
    isCallPermissionGranted: true, countryCode: 'ID', deviceName: 'SM-G977N',
    installedApps: '{"whatsapp":0,"telegram":0,"viber":0}', outsideCountryCode: 'ID',
    outsidePhoneNumber: phone, timezone: 'Asia/Bangkok', bundleId: BUNDLE_ID
  }, deviceId)
  await vfkCall('/v2.0/country', { countryCode: 'ID', bundleId: BUNDLE_ID }, deviceId)

  const startRes = await vfkCall('/v2.0/start', {
    countryCode: 'ID', mcc: '510', mnc: '01', phoneNumber: phone, app: 'whatsapp', bundleId: BUNDLE_ID
  }, deviceId)

  const deeplink = startRes.data?.result?.deeplink
  const reference = startRes.data?.result?.reference

  if (!deeplink || !reference) throw new Error(startRes.data?.meta?.errorMessage || 'No se pudo iniciar la sesión de VerifyKit')

  const session = { phoneNumber: phone, clientDeviceId: deviceId, token, finalKey, reference, deeplink }
  writeFileSync(PENDING_FILE, JSON.stringify(session, null, 2), 'utf-8')
  return session
}

async function checkAuth() {
  if (!existsSync(PENDING_FILE)) throw new Error('Sesión no encontrada. Escriba .gc login <número> primero.')
  const session = JSON.parse(readFileSync(PENDING_FILE, 'utf-8'))

  const checkRes = await vfkCall('/v2.0/check', { reference: session.reference, bundleId: BUNDLE_ID }, session.clientDeviceId)
  const sessionId = checkRes.data?.result?.sessionId
  if (!sessionId) return { verified: false, message: 'Aún no verificado. Asegúrate de haber enviado el mensaje y marca el 2 azul en WA Getcontact.' }

  const resultRes = await gtcCall('/v2.8/verifykit-result', { sessionId, token: session.token }, session)
  const validationDate = resultRes.data?.result?.validationDate
  if (!validationDate) throw new Error(resultRes.data?.meta?.errorMessage || 'No se pudieron confirmar los resultados de VerifyKit')

  const credentials = { phoneNumber: session.phoneNumber, clientDeviceId: session.clientDeviceId, token: session.token, finalKey: session.finalKey, validationDate }
  saveSession(credentials)
  try { unlinkSync(PENDING_FILE) } catch {}

  return { verified: true, credentials }
}

async function search(phoneNumber) {
  const creds = loadSession()
  if (!creds) throw new Error('Las credenciales aún no existen. Escriba .gc login <número> primero.')

  const phone = normalizePhone(phoneNumber)
  const res = await gtcCall('/v2.8/search', { countryCode: COUNTRY, phoneNumber: phone, source: 'search', token: creds.token }, creds)

  if (res.data?.meta && res.data.meta.httpStatusCode !== 200) {
    throw new Error(`[Getcontact ${res.data.meta.errorCode || res.status}] ${res.data.meta.errorMessage}`)
  }

  const d = res.data?.result || {}
  const profile = d.profile || {}
  return {
    phone, name: profile.name || '', surname: profile.surname || '', displayName: profile.displayName || '',
    email: profile.email || '', tagCount: profile.tagCount || 0,
    tags: (d.tags || []).map((t) => ({ tag: t.tag, count: t.count || 1 }))
  }
}

async function handler(m, ctx = {}) {
  const sock = ctx.sock;
  const jid = ctx.jid || m.chat;
  let pfx = global.prefix || global.db?.data?.settings?.prefix || '.'
  let prefix = '.'

  if (Array.isArray(pfx)) {
    prefix = pfx.includes('.') ? '.' : (pfx[0] || '.')
  } else if (typeof pfx === 'string') {
    prefix = pfx.charAt(0) || '.'
  }

  let rawText = m.text || m.body || (m.message?.conversation || m.message?.extendedTextMessage?.text) || ''
  rawText = rawText.trim()

  const cmdRegex = new RegExp(`^[^\\w\\s]*(gc|getcontact)\\s*`, 'i')
  rawText = rawText.replace(cmdRegex, '').trim()

  const args = rawText ? rawText.split(/\s+/) : []
  const sub = args[0]?.toLowerCase()

  if (!sub) {
    return m.reply(
      `📱 *GETCONTACT SCRAPER* 🕵️‍♂️\n\n` +
      `╭┈┈⬡「 📖 *PENGGUNAAN* 」\n` +
      `┃ • ${prefix}gc login <número>\n` +
      `┃ → Iniciar sesión (completamente obligatorio)\n` +
      `┃ • ${prefix}gc verify\n` +
      `┃ → Verificar verificación WA\n` +
      `┃ • ${prefix}gc <número>\n` +
      `┃ → Buscar datos del número\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `_Ejemplo:_ ${prefix}gc 6281234567890`
    )
  }

  await sock.sendMessage(jid, { react: { text: '⏳', key: m.key } }).catch(() => {})

  try {
    if (sub === 'login') {
      const targetPhone = args[1]
      if (!targetPhone) return m.reply(`¡Ingresa el número HP que deseas verificar!\nEjemplo: ${prefix}gc login 628xxx`)

      const session = await initAuth(targetPhone)

      let msg = `✅ *Sesi VerifyKit Dibuat*\n\n`
      msg += `> 📱 Número: ${session.phoneNumber}\n\n`
      msg += `🔗 *Deeplink:*\n${session.deeplink}\n\n`
      msg += `📌 *Langkah Selanjutnya:*\n`
      msg += `1. Abra el enlace de arriba (abrir a través de HP).\n`
      msg += `2. Envía el mensaje WA que aparece a bot WA Getcontact.\n`
      msg += `3. Espere a que aparezca la marca azul 2.\n`
      msg += `4. Tipo \`${prefix}gc verificar\` aquí.`

      return m.reply(msg)
    }

    if (sub === 'verify') {
      const result = await checkAuth()
      if (!result.verified) return m.reply(`❌ *No verificado*\n\n> ${result.message}`)

      return m.reply(
        `✅ *¡VERIFICACIÓN CORRECTA!*\n\n` +
        `> 📱 Número: ${result.credentials.phoneNumber}\n` +
        `> 📅 Tanggal: ${result.credentials.validationDate}\n\n` +
        `Ahora puedes buscar datos de otras personas con el comando:\n` +
        `${prefix}gc <número de destino>`
      )
    }

    const targetPhone = args[0]
    if (!/^(\+?62|0)\d{8,15}$/.test(targetPhone)) {
      return m.reply(`¡Formato de número no válido! Utilice el formato 08xxx o 628xxx.`)
    }

    const res = await search(targetPhone)

    let caption = `🕵️‍♂️ *GETCONTACT RESULT*\n\n`
    caption += `╭┈┈⬡「 📱 *TARGET* 」\n`
    caption += `┃ 📞 Número: ${res.phone}\n`
    caption += `┃ 📝 Nombre: ${res.name || '-'} ${res.surname || ''}\n`
    caption += `┃ 🏷️ Display: ${res.displayName || '-'}\n`
    caption += `┃ 📧 Email: ${res.email || '-'}\n`
    caption += `┃ 📊 Total Tag: ${res.tagCount}\n`
    caption += `╰┈┈┈┈┈┈┈┈⬡\n\n`

    if (res.tags && res.tags.length > 0) {
      caption += `╭┈┈⬡「 🏷️ *TAGS* 」\n`
      const topTags = res.tags.slice(0, 15)
      for (const t of topTags) {
        caption += `┃ • ${t.tag} (${t.count}x)\n`
      }
      if (res.tags.length > 15) caption += `┃ _+${res.tags.length - 15} otras etiquetas..._\n`
      caption += `╰┈┈┈┈┈┈┈┈⬡`
    } else {
      caption += `_No se encontraron etiquetas._`
    }

    await m.reply(caption)
    await sock.sendMessage(jid, { react: { text: '✅', key: m.key } }).catch(() => {})

  } catch (err) {
    console.error('[Getcontact Error]', err)
    await sock.sendMessage(jid, { react: { text: '❌', key: m.key } }).catch(() => {})
    return m.reply(`❌ *Ocurrió un error*\n\n> ${err.message}`)
  }
}

export { pluginConfig as config, handler }
