/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import vm from 'node:vm'
import util from 'node:util'
import { downloadMediaMessage } from '@rexxhayanasi/elaina-baileys'

const pluginConfig = {
    name: "multiscript",
    alias: ["js2jawa", "js2sunda", "js2indo", "jawa2js", "jawa2sunda", "jawa2indo", "sunda2js", "sunda2jawa", "sunda2indo", "indo2js", "indo2jawa", "indo2sunda", "msconvert", "multiconvert", "convertscript", "jawa", "sunda", "indo", "runjawa", "runsunda", "runindo", "multi"],
    category: "convert",
    description: "Transpiler dan eksekutor kode multi-bahasa daerah (Jawa, Sunda, Indo, JS)",
    usage: ".js2jawa <kode>",
    example: ".js2jawa console.log('halo')",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const TIMEOUT_MS = 5000

const KEYWORD_MAP = {
  jawa: {
    let: 'ono', const: 'paten', if: 'yen', else: 'ora', while: 'nganti',
    for: 'kanggo', of: 'saka', in: 'ing', function: 'fungsi', return: 'balekno',
    break: 'mandheg', continue: 'lanjutna', throw: 'buang', try: 'nyoba',
    catch: 'nompo', finally: 'akhire', switch: 'milih', case: 'kasus',
    default: 'asale', class: 'kelas', extends: 'warisan', this: 'iki',
    new: 'anyar', async: 'sambil', await: 'enteni', true: 'bener',
    false: 'salah', null: 'suwung', undefined: 'rajelas', print: 'tampilno'
  },
  sunda: {
    let: 'aya', const: 'tetep', if: 'lamun', else: 'salian', while: 'salila',
    for: 'keur', of: 'tina', in: 'dina', function: 'fungsi', return: 'balikkeun',
    break: 'eureun', continue: 'lanjutkeun', throw: 'balingkeun', try: 'coba',
    catch: 'tangkep', finally: 'ahirna', switch: 'milih', case: 'kasus',
    default: 'baku', class: 'kelas', extends: 'turunan', this: 'ieu',
    new: 'anyar', async: 'sabari', await: 'anti', true: 'bener',
    false: 'salah', null: 'kosong', undefined: 'teuJelas', print: 'tampilkeun'
  },
  indo: {
    let: 'biarkan', const: 'konstanta', if: 'jika', else: 'selain', while: 'selama',
    for: 'untuk', of: 'dari', in: 'dalam', function: 'fungsi', return: 'kembalikan',
    break: 'hentikan', continue: 'lanjutkan', throw: 'lempar', try: 'coba',
    catch: 'tangkap', finally: 'akhirnya', switch: 'pilih', case: 'kasus',
    default: 'asali', class: 'kelas', extends: 'warisi', this: 'ini',
    new: 'baru', async: 'sembari', await: 'tunggu', true: 'benar',
    false: 'salah', null: 'kosong', undefined: 'tidakJelas', print: 'cetak'
  },
  js: {
    let: 'let', const: 'const', if: 'if', else: 'else', while: 'while',
    for: 'for', of: 'of', in: 'in', function: 'function', return: 'return',
    break: 'break', continue: 'continue', throw: 'throw', try: 'try',
    catch: 'catch', finally: 'finally', switch: 'switch', case: 'case',
    default: 'default', class: 'class', extends: 'extends', this: 'this',
    new: 'new', async: 'async', await: 'await', true: 'true',
    false: 'false', null: 'null', undefined: 'undefined', print: 'console.log'
  }
}

function translateCode(source, fromLang, toLang) {
  const srcMap = KEYWORD_MAP[fromLang]
  const dstMap = KEYWORD_MAP[toLang]
  if (!srcMap || !dstMap) throw new Error(`Bahasa tidak dikenali: ${fromLang} -> ${toLang}`)

  const tokenToCanonical = new Map()
  for (const [canon, word] of Object.entries(srcMap)) {
    tokenToCanonical.set(word, canon)
  }
  if (fromLang === 'js') {
    tokenToCanonical.set('var', 'let')
  }

  // Regex matching comments, string literals, `console.log`, or identifiers
  const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\bconsole\.log\b|\b[A-Za-z_$][A-Za-z0-9_$]*\b)/g

  return String(source || '').replace(tokenRegex, (match, _1, offset, fullStr) => {
    if (
      match.startsWith('//') ||
      match.startsWith('/*') ||
      match.startsWith('"') ||
      match.startsWith("'") ||
      match.startsWith('`')
    ) {
      return match
    }
    // Avoid translating property access like obj.if or obj.cetak (unless console.log)
    if (match !== 'console.log' && offset > 0 && fullStr[offset - 1] === '.') {
      return match
    }
    const canon = tokenToCanonical.get(match)
    if (!canon) return match
    return dstMap[canon] || match
  })
}

const detectLanguage = (code) => {
  const scores = { jawa: 0, sunda: 0, indo: 0, js: 0 }
  const words = (code || '').toLowerCase().match(/[a-z]+/g) || []

  const jawaWords = ['ono', 'paten', 'tampilno', 'yen', 'ora', 'nganti', 'kanggo', 'balekno', 'iki', 'bener']
  const sundaWords = ['aya', 'tetep', 'tampilkeun', 'lamun', 'salian', 'salila', 'keur', 'balikkeun', 'ieu']
  const indoWords = ['biarkan', 'konstanta', 'cetak', 'jika', 'selain', 'selama', 'untuk', 'kembalikan', 'ini']
  const jsWords = ['let', 'const', 'console', 'log', 'if', 'else', 'function', 'return']

  for (const w of words) {
    if (jawaWords.includes(w)) scores.jawa += 2
    if (sundaWords.includes(w)) scores.sunda += 2
    if (indoWords.includes(w)) scores.indo += 2
    if (jsWords.includes(w)) scores.js += 1
  }

  let bestLang = 'jawa'
  let maxScore = 0
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestLang = lang
    }
  }
  return bestLang
}

const normalizeLangName = (lang) => {
  const l = (lang || '').toLowerCase().trim()
  if (['jawa', 'jv', 'javanese'].includes(l)) return 'jawa'
  if (['sunda', 'su', 'sundanese'].includes(l)) return 'sunda'
  if (['indo', 'id', 'indonesia', 'indonesian'].includes(l)) return 'indo'
  if (['js', 'javascript', 'node'].includes(l)) return 'js'
  return null
}

const cleanCodeFences = (code) => {
  if (!code) return ''
  return code
    .trim()
    .replace(/^```[a-zA-Z0-9_-]*\r?\n?/i, '')
    .replace(/\r?\n?```$/i, '')
    .trim()
}

const formatArg = (arg) => {
  if (typeof arg === 'string') return arg
  if (arg === undefined) return 'undefined'
  if (arg === null) return 'null'
  if (typeof arg === 'function') return arg.toString()
  try {
    return util.inspect(arg, { depth: 3, colors: false, compact: true })
  } catch {
    return String(arg)
  }
}

const executeInSandbox = async (jsCode) => {
  const logs = []
  const customConsole = {
    log: (...args) => logs.push(args.map(formatArg).join(' ')),
    error: (...args) => logs.push('[ERROR] ' + args.map(formatArg).join(' ')),
    warn: (...args) => logs.push('[WARN] ' + args.map(formatArg).join(' ')),
    info: (...args) => logs.push('[INFO] ' + args.map(formatArg).join(' ')),
    table: (...args) => logs.push(args.map(formatArg).join(' '))
  }

  const sandbox = {
    console: customConsole,
    Math, Date, JSON, RegExp, Array, Object, String, Number, Boolean,
    parseInt, parseFloat, isNaN, isFinite,
    encodeURI, decodeURI, encodeURIComponent, decodeURIComponent,
    Set, Map, Promise,
    fetch: (...args) => fetch(...args)
  }

  const context = vm.createContext(sandbox, {
    codeGeneration: { strings: false, wasm: false }
  })

  const wrappedCode = `(async () => {\n${jsCode}\n})()`
  const startTime = Date.now()
  const execPromise = vm.runInContext(wrappedCode, context, {
    timeout: TIMEOUT_MS,
    displayErrors: true
  })

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Batas waktu eksekusi habis (${TIMEOUT_MS / 1000} detik)!`)), TIMEOUT_MS)
  })

  const result = await Promise.race([execPromise, timeoutPromise])
  const duration = Date.now() - startTime
  return { logs, result, duration }
}

const extractCodeInput = async (m, text, conn) => {
  if (text && text.trim()) return { code: text.trim(), fileExt: null }
  if (m.quoted) {
    if (m.quoted.text) return { code: m.quoted.text.trim(), fileExt: null }
    try {
      let buf = null
      if (typeof m.quoted.download === 'function') buf = await m.quoted.download().catch(() => null)
      if (!buf && typeof conn?.downloadMediaMessage === 'function') buf = await conn.downloadMediaMessage(m.quoted).catch(() => null)
      if (!buf) buf = await downloadMediaMessage(m.quoted, 'buffer', {}, { reuploadRequest: conn?.updateMediaMessage }).catch(() => null)
      if (buf && buf.length > 0) {
        const fileName = m.quoted.msg?.fileName || m.quoted.fileName || ''
        const match = fileName.match(/\.([^.]+)$/)
        const fileExt = match ? match[1].toLowerCase() : null
        return { code: buf.toString('utf-8').trim(), fileExt }
      }
    } catch {}
  }
  return { code: '', fileExt: null }
}

const getHelpMessage = (usedPrefix) =>
  `⚡ *MULTISCRIPT ENGINE (RUN & TRANSPILER)* ⚡\n` +
  `_Konversi & jalankan kode pemrograman berbahasa Jawa, Sunda, Indonesia, dan JavaScript!_\n\n` +
  `🔄 *KONVERSI BAHASA:*\n` +
  `• \`${usedPrefix}js2jawa\` / \`${usedPrefix}jawa2js\`\n` +
  `• \`${usedPrefix}js2sunda\` / \`${usedPrefix}sunda2js\`\n` +
  `• \`${usedPrefix}js2indo\` / \`${usedPrefix}indo2js\`\n` +
  `• \`${usedPrefix}jawa2sunda\` / \`${usedPrefix}sunda2jawa\`\n` +
  `• \`${usedPrefix}jawa2indo\` / \`${usedPrefix}indo2jawa\`\n` +
  `• \`${usedPrefix}sunda2indo\` / \`${usedPrefix}indo2sunda\`\n\n` +
  `🏃 *JALANKAN KODE:*\n` +
  `• \`${usedPrefix}jawa <kode>\`\n` +
  `• \`${usedPrefix}sunda <kode>\`\n` +
  `• \`${usedPrefix}indo <kode>\`\n` +
  `• \`${usedPrefix}multiscript <kode>\` (deteksi otomatis)\n\n` +
  `💡 *Contoh:*\n` +
  `\`${usedPrefix}js2jawa let x = 10; console.log(x);\``

async function handler(m, { text, usedPrefix = '.', command = 'multiscript', conn, sock }) {
  const client = conn || sock
  const cmd = (command || '').toLowerCase()
  const { code: rawCode, fileExt } = await extractCodeInput(m, text, client)

  if (!rawCode || /^(help|contoh|--help|--contoh)$/i.test(rawCode)) {
    return m.reply(getHelpMessage(usedPrefix))
  }

  const code = cleanCodeFences(rawCode)
  if (!code) {
    return m.reply(`💡 Ketik \`${usedPrefix + cmd} <kode>\` atau reply pesan/file berisi kode.`)
  }

  const shortcutMatch = cmd.match(/^([a-z]+)2([a-z]+)$/i)
  const isGenericConvert = /^(msconvert|multiconvert|convertscript)$/i.test(cmd)
  const toMatch = code.match(/--to=([a-zA-Z]+)/i)

  if (shortcutMatch || isGenericConvert || toMatch) {
    let fromLang = null
    let toLang = null
    let cleanConvertCode = code

    if (shortcutMatch) {
      fromLang = normalizeLangName(shortcutMatch[1])
      toLang = normalizeLangName(shortcutMatch[2])
    } else if (toMatch) {
      toLang = normalizeLangName(toMatch[1])
      cleanConvertCode = cleanConvertCode.replace(/--to=[a-zA-Z]+/gi, '').trim()
    } else if (isGenericConvert) {
      const parts = cleanConvertCode.split(/\s+/)
      const a1 = normalizeLangName(parts[0])
      const a2 = normalizeLangName(parts[1])
      if (a1 && a2) {
        fromLang = a1
        toLang = a2
        cleanConvertCode = cleanConvertCode.replace(new RegExp(`^${parts[0]}\\s+${parts[1]}\\s*`, 'i'), '').trim()
      }
    }

    if (!fromLang) {
      fromLang = (fileExt && normalizeLangName(fileExt)) || detectLanguage(cleanConvertCode)
    }
    if (!toLang) {
      toLang = fromLang === 'jawa' ? 'indo' : fromLang === 'sunda' ? 'indo' : 'jawa'
    }

    if (!KEYWORD_MAP[fromLang]) return m.reply(`❌ Bahasa asal tidak didukung: *${fromLang}*`)
    if (!KEYWORD_MAP[toLang]) return m.reply(`❌ Bahasa tujuan tidak didukung: *${toLang}*`)
    if (fromLang === toLang) return m.reply(`⚠️ Bahasa asal dan tujuan sudah sama (*${fromLang.toUpperCase()}*).`)

    try {
      const converted = translateCode(cleanConvertCode, fromLang, toLang)
      return m.reply(`🔄 *KONVERSI KODE: ${fromLang.toUpperCase()} ➔ ${toLang.toUpperCase()}*\n\n\`\`\`${toLang}\n${converted}\n\`\`\``)
    } catch (err) {
      return m.reply(`❌ *Gagal Konversi:* ${err.message}`)
    }
  }

  let runLang = 'jawa'
  if (['jawa', 'runjawa'].includes(cmd)) runLang = 'jawa'
  else if (['sunda', 'runsunda'].includes(cmd)) runLang = 'sunda'
  else if (['indo', 'runindo'].includes(cmd)) runLang = 'indo'
  else if (fileExt && ['jawa', 'sunda', 'indo', 'js'].includes(fileExt)) runLang = fileExt
  else runLang = detectLanguage(code)

  if (!KEYWORD_MAP[runLang]) {
    return m.reply(`❌ Bahasa tidak didukung: *${runLang}*`)
  }

  const isTranspileOnly = /\B--(transpile|js)\b|-t\b/i.test(code)
  const cleanRunCode = code.replace(/\B--(transpile|js)\b|-t\b/gi, '').trim()

  let transpiledJS = ''
  try {
    transpiledJS = runLang === 'js' ? cleanRunCode : translateCode(cleanRunCode, runLang, 'js')
  } catch (err) {
    return m.reply(`❌ *Compile Error (${runLang.toUpperCase()}):* ${err.message}`)
  }

  if (isTranspileOnly) {
    return m.reply(`📜 *HASIL TRANSPILE (${runLang.toUpperCase()} ➔ JS):*\n\n\`\`\`javascript\n${transpiledJS}\n\`\`\``)
  }

  try {
    const { logs, result, duration } = await executeInSandbox(transpiledJS)
    let msg = `🚀 *EKSEKUSI ${runLang.toUpperCase()}* (${duration} ms)\n\n`
    if (logs.length > 0) msg += `📋 *Output:*\n\`\`\`\n${logs.join('\n')}\n\`\`\`\n\n`
    if (result !== undefined) {
      const resStr = typeof result === 'object' ? util.inspect(result, { depth: 3, compact: true }) : String(result)
      msg += `🔄 *Return:* \`${resStr}\`\n\n`
    }
    if (logs.length === 0 && result === undefined) {
      msg += `✓ _Kode selesai dijalankan (tanpa output консоль)_\n`
    }
    return m.reply(msg.trim())
  } catch (err) {
    return m.reply(`❌ *Runtime Error (${runLang.toUpperCase()}):* ${err.message || String(err)}`)
  }
}

export { pluginConfig as config, handler }
