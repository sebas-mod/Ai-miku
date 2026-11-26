/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import path from 'path'

const reactTo = MikuRuntime.reactTo;

const pluginConfig = {
    name: "encfile",
    alias: [],
    category: "tools",
    description: "encfile (reply file js)",
    usage: ".encfile (reply file js)",
    example: ".encfile (reply file js)",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))
  const BAR = (p) => '█'.repeat(p / 10) + '▒'.repeat(10 - p / 10)
  const title = () => `⚡ *ULTRA HARD ENCRYPT — ${global.namebot || 'Ai Miku MD'}* ⚡`

  const card = (percent, note, dot = '🔴') =>
      `${title()}\n\n🔐 *Proses Penguncian Skrip*\n[ ${BAR(percent)} ] *${percent}%*\n> ${dot} ${note}`

  async function handler(m, { sock, prefix, command, reply }) {
      const q = m.quoted
      if (!q) return reply(`Responde primero a un archivo *.js* o *.ts*, luego escribe *${prefix || '.'}${command}*`)

      const originalName = q.fileName || q.documentMessage?.fileName || `file_${Date.now()}.js`
      const ext = path.extname(originalName).toLowerCase()
      if (ext !== '.js' && ext !== '.ts') {
          return reply('El modo *cifrado fuerte anti-bypass* solo funciona con archivos *.js* o *.ts*.')
      }

      let JavaScriptObfuscator
      try {
          JavaScriptObfuscator = (await import('javascript-obfuscator')).default
      } catch {
          return reply('El módulo javascript-obfuscator no está instalado. Ejecuta: npm i javascript-obfuscator')
      }

      const edit = (key, text) => sock.sendMessage(m.chat, { text, edit: key }).catch(() => {})

      try {
          await reactTo(sock, m, '🔃')
          const sent = await sock.sendMessage(m.chat, { text: card(0, 'Descargando el archivo...') }, { quoted: m })

          let buffer
          try { buffer = await q.download() } catch (e) { console.error('[encfile] gagal download:', e?.message || e) }
          if (!buffer?.length) {
              await reactTo(sock, m, '❌')
              return edit(sent.key, '❌ No se pudo descargar el archivo, vuelve a responderlo.')
          }

          await edit(sent.key, card(40, 'Menerapkan Control Flow Flattening & Dead Code Injection...'))
          await sleep(500)

          const result = JavaScriptObfuscator.obfuscate(buffer.toString('utf8'), {
              compact: true,
              controlFlowFlattening: true,
              controlFlowFlatteningThreshold: 1,
              deadCodeInjection: true,
              deadCodeInjectionThreshold: 0.4,
              debugProtection: true,
              disableConsoleOutput: false,
              identifierNamesGenerator: 'hexadecimal',
              log: false,
              numbersToExpressions: true,
              renameGlobals: false,
              selfDefending: true,
              simplify: true,
              splitStrings: true,
              splitStringsChunkLength: 3,
              stringArray: true,
              stringArrayCallsTransform: true,
              stringArrayCallsTransformThreshold: 1,
              stringArrayEncoding: ['rc4'],
              stringArrayIndexShift: true,
              stringArrayRotate: true,
              stringArrayShuffle: true,
              stringArrayWrappersCount: 5,
              stringArrayWrappersChainedCalls: true,
              stringArrayWrappersParametersMaxCount: 5,
              stringArrayWrappersType: 'function',
              stringArrayThreshold: 1
          })
          const output = Buffer.from(result.getObfuscatedCode(), 'utf8')

          await edit(sent.key, card(80, 'Menanamkan proteksi Anti-Tamper & Self-Defending...', '🟡'))
          await sleep(500)
          await edit(sent.key, card(100, '¡Listo! Enviando el archivo cifrado al chat...', '🟢'))

          const newName = `Secure-Hard-${originalName}`
          await sock.sendMessage(m.chat, {
              document: output,
              mimetype: 'application/javascript',
              fileName: newName,
              caption: `⚡ *HARD ENCRYPT ANTI-BYPASS BERHASIL* ⚡\n\n📁 Nama File : *${newName}*\n🔒 Status    : Terkunci Rapat\n\n— ${global.namebot || 'Ai Miku MD'}`
          }, { quoted: m })
          await reactTo(sock, m, '✅')
      } catch (e) {
          console.error(e)
          await reactTo(sock, m, '☢')
          reply(`❌ Terjadi kesalahan sistem: ${e.message}`)
      }
  }

export { pluginConfig as config, handler }
