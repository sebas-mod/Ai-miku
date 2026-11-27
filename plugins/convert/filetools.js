/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import zlib from 'zlib'
import crypto from 'crypto'
import { spawnSync, spawn } from 'child_process'
import archiver from 'archiver'

const pluginConfig = {
    name: "cekfile",
    alias: ["rename", "unzip", "csv2json", "json2csv", "todoc"],
    category: "convert",
    description: "cekfile",
    usage: ".cekfile",
    example: ".cekfile",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function pdfEscape(str) {
  return String(str || '')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function createPurePdfContext() {
  const FONT_WIDTH_FACTOR = { r: 0.52, b: 0.56, i: 0.52, bi: 0.56 }
  const makeFont = (key, pdfName) => ({
    key,
    pdfName,
    encodeText: (s) => pdfEscape(s),
    widthOfTextAtSize: (t, size) => String(t || '').length * size * (FONT_WIDTH_FACTOR[key] || 0.53),
    heightAtSize: (size) => size
  })
  const F = {
    r: makeFont('r', '/F1'),
    b: makeFont('b', '/F2'),
    i: makeFont('i', '/F3'),
    bi: makeFont('bi', '/F4')
  }
  const pages = []
  const addPage = (w = 595.28, h = 841.89) => {
    const ops = []
    const page = {
      width: w,
      height: h,
      ops,
      getSize: () => ({ width: w, height: h }),
      drawRectangle: ({ x = 0, y = 0, width = 10, height = 10, color = null, borderColor = null, borderWidth = 0 }) => {
        ops.push('q')
        if (color) ops.push(`${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} rg`)
        if (borderColor && borderWidth > 0) {
          ops.push(`${borderWidth.toFixed(2)} w ${borderColor.r.toFixed(3)} ${borderColor.g.toFixed(3)} ${borderColor.b.toFixed(3)} RG`)
        }
        const cmd = color && borderColor && borderWidth > 0 ? 'B' : color ? 'f' : 'S'
        ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re ${cmd}`)
        ops.push('Q')
      },
      drawLine: ({ start, end, thickness = 1, color = { r: 0, g: 0, b: 0 } }) => {
        ops.push(
          `q ${thickness.toFixed(2)} w ${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} RG ` +
          `${start.x.toFixed(2)} ${start.y.toFixed(2)} m ${end.x.toFixed(2)} ${end.y.toFixed(2)} l S Q`
        )
      },
      drawText: (text, { x = 0, y = 0, size = 11, font = F.r, color = { r: 0, g: 0, b: 0 } } = {}) => {
        const clean = pdfEscape(text)
        ops.push(
          `BT ${font.pdfName || '/F1'} ${size.toFixed(2)} Tf ` +
          `${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} rg ` +
          `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${clean}) Tj ET`
        )
      }
    }
    pages.push(page)
    return page
  }

  const save = async () => {
    if (!pages.length) addPage()
    const objects = []
    const addObj = (body) => {
      objects.push(body)
      return objects.length
    }
    const f1 = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
    const f2 = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
    const f3 = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>')
    const f4 = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-BoldOblique /Encoding /WinAnsiEncoding >>')

    const pageIds = []
    const pagesRootId = addObj('') // placeholder

    for (const pg of pages) {
      const streamData = pg.ops.join('\n')
      const contentId = addObj(`<< /Length ${Buffer.byteLength(streamData, 'latin1')} >>\nstream\n${streamData}\nendstream`)
      const pageId = addObj(
        `<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 ${pg.width.toFixed(2)} ${pg.height.toFixed(2)}] ` +
        `/Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R /F3 ${f3} 0 R /F4 ${f4} 0 R >> >> /Contents ${contentId} 0 R >>`
      )
      pageIds.push(pageId)
    }

    objects[pagesRootId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
    const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesRootId} 0 R >>`)

    let out = '%PDF-1.4\n'
    const offsets = [0]
    for (let i = 0; i < objects.length; i++) {
      offsets.push(Buffer.byteLength(out, 'latin1'))
      out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
    }
    const xrefPos = Buffer.byteLength(out, 'latin1')
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    for (let i = 1; i <= objects.length; i++) {
      out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
    }
    out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`
    return Buffer.from(out, 'latin1')
  }

  return {
    F,
    rgb: (r, g, b) => ({ r, g, b }),
    doc: { addPage, save }
  }
}

const pdfdoc = {
  create: async () => createPurePdfContext(),
  hex: (rgbFn, h) => {
    const c = String(h || '#000000').replace('#', '')
    const n = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16) || 0
    return rgbFn(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
  },
  wrap: (font, size, maxW, text) => {
    const out = []
    for (const para of String(text || '').replace(/\r/g, '').split('\n')) {
      if (!para.trim()) { out.push(''); continue }
      let cur = ''
      for (const word of para.split(/\s+/)) {
        const test = cur ? `${cur} ${word}` : word
        if (font.widthOfTextAtSize(test, size) > maxW && cur) {
          out.push(cur)
          cur = word
        } else {
          cur = test
        }
      }
      if (cur) out.push(cur)
    }
    return out.length ? out : ['']
  }
}

pdfdoc.Pen = class Pen {
  constructor(ctx, opts = {}) {
    this.ctx = ctx
    this.W = opts.W || 595.28
    this.H = opts.H || 841.89
    this.top = opts.top ?? 56
    this.bottom = opts.bottom ?? 56
    this.left = opts.left ?? 56
    this.right = opts.right ?? 56
    this.width = this.W - this.left - this.right
    this.page = ctx.doc.addPage(this.W, this.H)
    this.y = this.H - this.top
  }
  ensure(h = 20) {
    if (this.y - h < this.bottom) {
      this.page = this.ctx.doc.addPage(this.W, this.H)
      this.y = this.H - this.top
    }
  }
  gap(v = 8) { this.y -= v }
  rect(x, y, w, h, fillHex, opts = {}) {
    this.page.drawRectangle({
      x, y, width: w, height: h,
      color: fillHex ? pdfdoc.hex(this.ctx.rgb, fillHex) : null,
      borderColor: opts.border ? pdfdoc.hex(this.ctx.rgb, opts.border) : null,
      borderWidth: opts.bw || 0
    })
  }
  line(colorHex = '#cccccc', thickness = 1, after = 8) {
    this.ensure(thickness + after)
    this.page.drawLine({
      start: { x: this.left, y: this.y },
      end: { x: this.left + this.width, y: this.y },
      thickness,
      color: pdfdoc.hex(this.ctx.rgb, colorHex)
    })
    this.y -= after
  }
  text(str, opts = {}) {
    const size = opts.size || 11
    const font = this.ctx.F[opts.font || 'r'] || this.ctx.F.r
    const color = pdfdoc.hex(this.ctx.rgb, opts.color || '#111111')
    const x = opts.x ?? this.left
    const width = opts.width ?? this.width
    const lh = (opts.lh || 1.4) * size
    const lines = pdfdoc.wrap(font, size, width, str)
    for (const ln of lines) {
      this.ensure(lh)
      let tx = x
      const lw = font.widthOfTextAtSize(ln, size)
      if (opts.align === 'center') tx = x + (width - lw) / 2
      else if (opts.align === 'right') tx = x + width - lw
      this.page.drawText(ln, { x: tx, y: this.y - size, size, font, color })
      this.y -= lh
    }
    if (opts.after) this.y -= opts.after
  }
  row(cols, opts = {}) {
    const size = opts.size || 10
    const pad = opts.pad ?? 6
    const rowH = size + pad * 2
    this.ensure(rowH)
    if (opts.bg) {
      this.rect(this.left, this.y - rowH, this.width, rowH, opts.bg)
    }
    let cx = this.left
    for (const col of cols) {
      const font = this.ctx.F[col.font || 'r'] || this.ctx.F.r
      const color = pdfdoc.hex(this.ctx.rgb, col.color || '#111111')
      const txt = String(col.text ?? '')
      const tw = font.widthOfTextAtSize(txt, size)
      let tx = cx + 6
      if (col.align === 'center') tx = cx + (col.w - tw) / 2
      else if (col.align === 'right') tx = cx + col.w - tw - 6
      this.page.drawText(txt, { x: tx, y: this.y - pad - size + 2, size, font, color })
      cx += col.w
    }
    this.y -= rowH
  }
  save() {
    return this.ctx.doc.save()
  }
}

const numwords = {
  terbilang(n) {
    n = Math.floor(Math.abs(Number(n) || 0))
    if (n === 0) return 'nol'
    const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas']
    const sebut = (x) => {
      if (x < 12) return satuan[x]
      if (x < 20) return `${sebut(x - 10)} belas`
      if (x < 100) return `${sebut(Math.floor(x / 10))} puluh ${sebut(x % 10)}`.trim()
      if (x < 200) return `seratus ${sebut(x - 100)}`.trim()
      if (x < 1000) return `${sebut(Math.floor(x / 100))} ratus ${sebut(x % 100)}`.trim()
      if (x < 2000) return `seribu ${sebut(x - 1000)}`.trim()
      if (x < 1e6) return `${sebut(Math.floor(x / 1000))} ribu ${sebut(x % 1000)}`.trim()
      if (x < 1e9) return `${sebut(Math.floor(x / 1e6))} juta ${sebut(x % 1e6)}`.trim()
      if (x < 1e12) return `${sebut(Math.floor(x / 1e9))} miliar ${sebut(x % 1e9)}`.trim()
      return `${sebut(Math.floor(x / 1e12))} triliun ${sebut(x % 1e12)}`.trim()
    }
    return sebut(n).replace(/\s+/g, ' ').trim()
  }
}

const uitext = {
  parseMoney(raw) {
    if (raw == null) return null
    let s = String(raw).trim().toLowerCase().replace(/^rp\.?\s*/i, '').replace(/\s+/g, '')
    let mult = 1
    if (/(jt|juta)$/i.test(s)) { mult = 1e6; s = s.replace(/(jt|juta)$/i, '') }
    else if (/(rb|ribu|k)$/i.test(s)) { mult = 1e3; s = s.replace(/(rb|ribu|k)$/i, '') }
    else if (/(m|miliar)$/i.test(s)) { mult = 1e9; s = s.replace(/(m|miliar)$/i, '') }
    if (mult > 1) {
      s = s.replace(',', '.')
    } else {
      s = s.replace(/\./g, '').replace(',', '.')
    }
    const v = Number(s)
    return Number.isFinite(v) && v > 0 ? Math.round(v * mult) : null
  },
  rp(n) {
    return 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID')
  },
  panel(title, sections) {
    let out = `✨ *${title}* ✨\n\n`
    for (const sec of sections) {
      if (sec.head) out += `${sec.head}\n`
      for (const ln of sec.lines || []) {
        if (ln) out += `• ${ln}\n`
      }
      out += '\n'
    }
    return out.trim()
  }
}

const kit = {
  rest(body) {
    return String(body || '').replace(/^\S+\s*/, '')
  },
  fmtSize(b) {
    const n = Number(b) || 0
    if (n >= 1048576) return `${(n / 1048576).toFixed(2)} MB`
    if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`
    return `${n} B`
  },
  numArg(val, def, min, max) {
    const n = Number(val)
    if (!Number.isFinite(n)) return def
    return Math.min(max, Math.max(min, n))
  }
}

const du = {
  safeName(name, fallback = 'file') {
    const cleaned = String(name || '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
    return cleaned || fallback
  },
  sniff(buf, fileName = '', declaredMime = '') {
    if (!Buffer.isBuffer(buf) || !buf.length) return { kind: 'other', ext: 'bin', mime: 'application/octet-stream', label: 'Binary' }
    if (buf.slice(0, 4).toString() === '%PDF') return { kind: 'pdf', ext: 'pdf', mime: 'application/pdf', label: 'Documento PDF' }
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return { kind: 'image', ext: 'jpg', mime: 'image/jpeg', label: 'Imagen JPEG' }
    if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return { kind: 'image', ext: 'png', mime: 'image/png', label: 'Imagen PNG' }
    if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return { kind: 'image', ext: 'webp', mime: 'image/webp', label: 'Imagen WebP' }
    if (buf.slice(0, 4).equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) {
      const ext = path.extname(fileName).slice(1).toLowerCase()
      if (['docx', 'xlsx', 'pptx', 'odt'].includes(ext)) return { kind: 'office', ext, mime: declaredMime || 'application/octet-stream', label: `Documentos de oficina (${ext.toUpperCase()})` }
      return { kind: 'zip', ext: 'zip', mime: 'application/zip', label: 'Arsip ZIP' }
    }
    if (buf.slice(0, 3).toString() === 'ID3' || (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0)) return { kind: 'audio', ext: 'mp3', mime: 'audio/mpeg', label: 'audio MP3' }
    if (buf.slice(0, 4).toString() === 'OggS') return { kind: 'audio', ext: 'ogg', mime: 'audio/ogg', label: 'Audio OGG/Opus' }
    if (buf.slice(4, 8).toString() === 'ftyp') return { kind: 'video', ext: 'mp4', mime: 'video/mp4', label: 'vídeos MP4' }
    // Check if printable UTF-8 text
    let nonPrint = 0
    const sample = buf.slice(0, Math.min(buf.length, 512))
    for (const b of sample) {
      if (b === 0) { nonPrint = 999; break }
      if (b < 9 || (b > 13 && b < 32)) nonPrint++
    }
    if (nonPrint / Math.max(1, sample.length) < 0.05) {
      const ext = path.extname(fileName).slice(1).toLowerCase() || 'txt'
      return { kind: 'text', ext, mime: declaredMime || 'text/plain', label: `Texto (${ext.toUpperCase()})` }
    }
    const ext = path.extname(fileName).slice(1).toLowerCase() || 'bin'
    return { kind: 'other', ext, mime: declaredMime || 'application/octet-stream', label: `Archivo.${ext}` }
  },
  which(bin) {
    const r = spawnSync('which', [bin], { encoding: 'utf8' })
    return r.status === 0 && r.stdout.trim() ? r.stdout.trim() : null
  },
  async withTmp(fn) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'miku-ft-'))
    try { return await fn(dir) } finally { fs.rmSync(dir, { recursive: true, force: true }) }
  },
  exec(bin, args = [], opts = {}) {
    return new Promise((resolve, reject) => {
      const p = spawn(bin, args, { env: { ...process.env, ...(opts.env || {}) } })
      const out = [], err = []
      const timer = opts.timeout ? setTimeout(() => p.kill('SIGKILL'), opts.timeout) : null
      p.stdout.on('data', (d) => out.push(d))
      p.stderr.on('data', (d) => err.push(d))
      p.on('error', (e) => { if (timer) clearTimeout(timer); reject(e) })
      p.on('close', (code) => {
        if (timer) clearTimeout(timer)
        resolve({ code, out: Buffer.concat(out), err: Buffer.concat(err).toString('utf8') })
      })
    })
  },
  async getFile(sock, m) {
    const q = m.quoted || m
    const mime = q.mimetype || q.msg?.mimetype || q.message?.[q.type]?.mimetype || ''
    let buf = null
    if (typeof q.download === 'function') buf = await q.download().catch(() => null)
    if (!buf && typeof m.download === 'function' && q === m) buf = await m.download().catch(() => null)
    if (!buf && sock?.downloadMediaMessage) buf = await sock.downloadMediaMessage(q).catch(() => null)
    if (!buf || !buf.length) return null
    const rawName = q.msg?.fileName || q.fileName || q.message?.documentMessage?.fileName || ''
    const sniff = du.sniff(buf, rawName, mime)
    const name = rawName || `archivo.${sniff.ext}`
    return { buffer: buf, name, mime: mime || sniff.mime, sniff }
  }
}

function extractZipPure(buffer) {
  // Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break }
  }
  if (eocdOffset === -1) throw new Error('La estructura ZIP no es válida o está dañada.')
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10)
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16)
  const entries = []
  let ptr = cdOffset
  for (let i = 0; i < totalEntries && ptr + 46 <= buffer.length; i++) {
    if (buffer.readUInt32LE(ptr) !== 0x02014b50) break
    const method = buffer.readUInt16LE(ptr + 10)
    const compSize = buffer.readUInt32LE(ptr + 20)
    const uncompSize = buffer.readUInt32LE(ptr + 24)
    const nameLen = buffer.readUInt16LE(ptr + 28)
    const extraLen = buffer.readUInt16LE(ptr + 30)
    const commentLen = buffer.readUInt16LE(ptr + 32)
    const localHeaderOffset = buffer.readUInt32LE(ptr + 42)
    const name = buffer.slice(ptr + 46, ptr + 46 + nameLen).toString('utf8')
    ptr += 46 + nameLen + extraLen + commentLen
    if (name.endsWith('/') || /(^|\/)((__MACOSX)|(\.DS_Store))/.test(name)) continue
    if (localHeaderOffset + 30 > buffer.length || buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) continue
    const lNameLen = buffer.readUInt16LE(localHeaderOffset + 26)
    const lExtraLen = buffer.readUInt16LE(localHeaderOffset + 28)
    const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen
    const compData = buffer.slice(dataStart, dataStart + compSize)
    let fileBuf
    if (method === 0) fileBuf = compData
    else if (method === 8) fileBuf = zlib.inflateRawSync(compData)
    else throw new Error(`Método de compresión ZIP (${method}) no es compatible.`)
    entries.push({ name, uncompressedSize: uncompSize, buffer: fileBuf })
  }
  return entries
}

async function buildSimpleDocxFromText(text) {
  const xmlEsc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const paras = String(text || '').replace(/\r/g, '').split('\n').map(
    (ln) => `<w:p><w:r><w:t xml:space="preserve">${xmlEsc(ln)}</w:t></w:r></w:p>`
  ).join('')
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`

  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 6 } })
    const chunks = []
    archive.on('data', (d) => chunks.push(d))
    archive.on('error', reject)
    archive.on('end', () => resolve(Buffer.concat(chunks)))
    archive.append(contentTypes, { name: '[Content_Types].xml' })
    archive.append(rels, { name: '_rels/.rels' })
    archive.append(docXml, { name: 'word/document.xml' })
    archive.finalize()
  })
}

const fail = (m) => Object.assign(new Error(m), { userMessage: m })
const base = (n) => String(n).replace(/\.[^.]+$/, '')
const asText = (f) => f.buffer.toString('utf8').replace(/^\uFEFF/, '')

function parseCsv(text) {
  const first = text.split(/\r?\n/, 1)[0] || ''
  const delim = [',', ';', '\t', '|'].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0]
  const rows = []
  let row = []
  let cur = ''
  let q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++ } else if (ch === '"') q = false
      else cur += ch
    } else if (ch === '"') q = true
    else if (ch === delim) { row.push(cur); cur = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cur); cur = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else cur += ch
  }
  row.push(cur)
  if (row.length > 1 || row[0] !== '') rows.push(row)
  return rows
}

const csvCell = (v) => {
  const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const specs = {
  cekfile: {
    desc: 'Verifique el tipo, el tamaño y la suma de verificación del archivo original (MD5/SHA-1/SHA-256)',
    needs: 'file',
    run: async (c, f) => {
      const h = (a) => crypto.createHash(a).update(f.buffer).digest('hex')
      return uitext.panel('ANALISIS FILE', [
        { head: '📄 *INFORMASI BERKAS*', lines: [`Nombre: ${f.name}`, `Tamaño: ${kit.fmtSize(f.buffer.length)} (${f.buffer.length.toLocaleString('id-ID')} bytes)`] },
        { head: '🔍 *DETECTAR FORMATO*', lines: [`Detectado: ${f.sniff.label}`, `Extensión original:.${f.sniff.ext}`, `MIME : ${f.mime}`, path.extname(f.name).slice(1).toLowerCase() && path.extname(f.name).slice(1).toLowerCase() !== f.sniff.ext ? `⚠️ Extensión de nombre (.${path.extname(f.name).slice(1)}) es diferente del contenido del archivo` : ''].filter(Boolean) },
        { head: '🔐 *HASH CHECKSUM*', lines: [`MD5 : ${h('md5')}`, `SHA-1 : ${h('sha1')}`, `SHA-256 : ${h('sha256')}`] }
      ])
    }
  },
  rename: {
    desc: 'Reenviar el archivo con un nuevo nombre (la extensión se conserva si no se escribe)',
    usage: '<nama baru>',
    example: 'laporan-final',
    needs: 'file',
    args: true,
    run: async (c, f) => {
      let n = du.safeName(kit.rest(c.body).trim(), '')
      if (!n) throw fail('Escribe el nuevo nombre.')
      if (!/\.[a-z0-9]{1,6}$/i.test(n)) n += path.extname(f.name) || `.${f.sniff.ext}`
      return { documents: [{ buffer: f.buffer, name: n, mime: f.mime, caption: `✅ Nombre del archivo cambiado a: *${n}*` }] }
    }
  },
  unzip: {
    desc: 'Extraer archivos ZIP y enviar su contenido (máximo 15 archivos, 30 MB)',
    needs: 'file',
    heavy: true,
    run: async (c, f) => {
      if (f.sniff.kind !== 'zip' && f.sniff.kind !== 'office') throw fail('El archivo no es un archivo ZIP.')
      const entries = extractZipPure(f.buffer)
      if (!entries.length) throw fail('Arsip ZIP kosong.')
      const total = entries.reduce((s, e) => s + (e.uncompressedSize || e.buffer.length), 0)
      const list = entries.map((e, i) => `${i + 1}. ${e.name}`).join('\n')
      if (entries.length > 15 || total > 30 * 1024 * 1024) {
        return `📦 ZIP berisi ${entries.length} file (${kit.fmtSize(total)}) — melebihi batas pengiriman (maks 15 file / 30 MB).\n\n${list.slice(0, 1500)}`
      }
      const documents = entries.map((e) => {
        const sn = du.sniff(e.buffer, e.name)
        return { buffer: e.buffer, name: du.safeName(path.basename(e.name)), mime: sn.mime }
      })
      documents[0].caption = `📦 ${documents.length} archivos extraídos exitosamente de *${f.name}*`
      return { documents }
    }
  },
  csv2json: {
    desc: 'Cambie el archivo CSV a JSON (primera fila = nombre de la columna)',
    needs: 'file',
    run: async (c, f) => {
      if (f.sniff.kind !== 'text') throw fail('Enviar o responder al archivo CSV (texto).')
      const rows = parseCsv(asText(f))
      if (rows.length < 2) throw fail('CSV minimal memiliki baris header dan 1 baris data.')
      const head = rows[0].map((h, i) => h.trim() || `kolom${i + 1}`)
      const data = rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])))
      return { documents: [{ buffer: Buffer.from(JSON.stringify(data, null, 2)), name: `${base(f.name)}.json`, mime: 'application/json', caption: `✅ ${data.length} filas • ${head.length} kolom` }] }
    }
  },
  json2csv: {
    desc: 'Cambie el archivo JSON (matriz de objetos) a CSV',
    needs: 'file',
    run: async (c, f) => {
      let data
      try { data = JSON.parse(asText(f)) } catch { throw fail('El formato JSON no es válido.') }
      if (!Array.isArray(data) && data && typeof data === 'object') data = Object.values(data).find(Array.isArray) || [data]
      if (!Array.isArray(data) || !data.length) throw fail('JSON debe ser una matriz de objetos, p.e. [{"a":1},{"a":2}].')
      const head = [...new Set(data.flatMap((o) => (o && typeof o === 'object' ? Object.keys(o) : [])))]
      if (!head.length) throw fail('El contenido de JSON debe ser un objeto.')
      const csv = [head.map(csvCell).join(','), ...data.map((o) => head.map((h) => csvCell(o?.[h])).join(','))].join('\r\n')
      return { documents: [{ buffer: Buffer.from('\uFEFF' + csv), name: `${base(f.name)}.csv`, mime: 'text/csv', caption: `✅ ${data.length} filas • ${head.length} columna (UTF-8 BOM)` }] }
    }
  },
  todoc: {
    desc: 'Convertir texto/HTML/MD/RTF/ODT a documento de Word (DOCX)',
    needs: 'file',
    heavy: true,
    run: async (c, f) => {
      const ext = f.sniff.ext === 'txt' ? 'txt' : f.sniff.ext === 'html' ? 'html' : path.extname(f.name).slice(1).toLowerCase()
      if (!['txt', 'html', 'htm', 'rtf', 'odt', 'md'].includes(ext)) {
        throw fail('Formatos soportados: TXT, MD, HTML, RTF, ODT.')
      }
      const bin = ['soffice', 'libreoffice'].find((b) => du.which(b))
      let out
      if (bin) {
        out = await du.withTmp(async (dir) => {
          const inp = path.join(dir, `documento.${ext === 'md' ? 'txt' : ext}`)
          fs.writeFileSync(inp, f.buffer)
          await du.exec(bin, [`-env:UserInstallation=file://${dir}/profile`, '--headless', '--convert-to', 'docx', '--outdir', dir, inp], { timeout: 180000, env: { HOME: dir } })
          const o = path.join(dir, 'dokumen.docx')
          if (!fs.existsSync(o)) throw fail('La conversión falló.')
          return fs.readFileSync(o)
        })
      } else {
        const plainText = ext === 'html' || ext === 'htm'
          ? asText(f).replace(/<[^>]+>/g, ' ').replace(/\s+\n/g, '\n')
          : asText(f)
        out = await buildSimpleDocxFromText(plainText)
      }
      return { documents: [{ buffer: out, name: `${base(f.name)}.docx`, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', caption: '✅ Documento de Word (.docx) creado exitosamente' }] }
    }
  }
}

async function handler(m, { conn, sock, text, args, usedPrefix = '.', command = 'cekfile' }) {
  const client = conn || sock
  const cmd = (command || '').toLowerCase()
  const spec = specs[cmd]
  if (!spec) return

  const rawBody = `${usedPrefix + cmd} ${text || (args || []).join(' ')}`.trim()
  const file = spec.needs === 'file' ? await du.getFile(client, m) : null
  if (spec.needs === 'file' && !file) {
    return m.reply(`📎 Enviar o responder archivos/documentos con el comando *${usedPrefix + cmd}${spec.usage ? ' ' + spec.usage : ''}*\n_${spec.desc}_`)
  }
  if (spec.args && !(text || (args && args.length))) {
    return m.reply(`❓ Usar formato: \`${usedPrefix + cmd} ${spec.usage}\`\nEjemplo: \`${usedPrefix + cmd} ${spec.example}\``)
  }

  await m.react('⏳')
  try {
    const res = await spec.run({ body: rawBody, prefix: usedPrefix, command: cmd, args: args || [], sender: m.sender, sock: client, msg: m }, file)
    if (typeof res === 'string') {
      await m.react('✅')
      return m.reply(res)
    }
    if (res?.documents?.length) {
      for (const d of res.documents) {
        await client.sendMessage(m.chat, { document: d.buffer, fileName: d.name, mimetype: d.mime, caption: d.caption || '' }, { quoted: m })
      }
    }
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ ${e.userMessage || e.message}`)
  }
}

export { pluginConfig as config, handler }
