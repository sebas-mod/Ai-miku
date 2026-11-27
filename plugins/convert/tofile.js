/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import path from 'path'

const pluginConfig = {
    name: "tofile",
    alias: [],
    category: "convert",
    description: "tofile <namafile.ext> (reply teks)",
    usage: ".tofile <namafile.ext> (reply teks)",
    example: ".tofile <namafile.ext> (reply teks)",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const TOFILE_MIME = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.cjs': 'application/javascript',
  '.ts': 'application/typescript',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.css': 'text/css',
  '.py': 'text/x-python',
  '.sh': 'application/x-sh',
  '.xml': 'application/xml',
  '.yaml': 'application/x-yaml',
  '.yml': 'application/x-yaml',
  '.csv': 'text/csv',
  '.sql': 'application/sql',
  '.env': 'text/plain',
  '.ini': 'text/plain',
  '.php': 'application/x-httpd-php',
  '.java': 'text/x-java-source',
  '.c': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.go': 'text/x-go',
  '.rs': 'text/rust'
}

async function handler(m, { conn, sock, text, args, usedPrefix = '.', command = 'tofile' }) {
  const client = conn || sock
  const quotedText = m.quoted?.text || m.quoted?.body || ''
  let fileName = (args[0] || '').trim()
  let content = quotedText

  if (!content) {
    if (args.length >= 2 && /\.[a-z0-9]{1,6}$/i.test(args[0])) {
      fileName = args[0]
      content = (text || '').replace(new RegExp(`^\\s*${args[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`), '')
    } else {
      fileName = `notas_${Date.now()}.txt`
      content = text || ''
    }
  } else if (!fileName) {
    fileName = `código_${Date.now()}.txt`
  }

  if (!content || !content.trim()) {
    return m.reply(
      `📄 *CONVERTIR TEXTO EN DOCUMENTO*\n\n` +
      `• Responder mensajes de texto con \`${usedPrefix + command} nombre de archivo.js\`\n` +
      `• O escriba \`${usedPrefix + command} nombre de archivo.txt <texto del contenido>\``
    )
  }

  if (!path.extname(fileName)) fileName += '.txt'
  const ext = path.extname(fileName).toLowerCase()
  const mimetype = TOFILE_MIME[ext] || 'text/plain'
  const buffer = Buffer.from(content, 'utf-8')

  await client.sendMessage(
    m.chat,
    {
      document: buffer,
      fileName,
      mimetype,
      caption: `📄 *${fileName}* (${buffer.length.toLocaleString('id-ID')} byte)`
    },
    { quoted: m }
  )
}

export { pluginConfig as config, handler }
