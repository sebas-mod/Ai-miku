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
import { spawn } from 'child_process'
import sharp from 'sharp'
import archiver from 'archiver'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

const pluginConfig = {
    name: "kumpul",
    alias: ["pdfbuat", "kolase", "slideshow", "zipkan", "gabungvideo", "gabungaudio", "mixav"],
    category: "convert",
    description: "kumpul",
    usage: ".kumpul",
    example: ".kumpul",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const FFMPEG_BIN = ffmpegInstaller?.path || 'ffmpeg'

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

global._mikuMediaPool = global._mikuMediaPool || new Map()

const pool = {
  list(sender) {
    return global._mikuMediaPool.get(sender) || []
  },
  add(sender, item) {
    const cur = pool.list(sender)
    if (cur.length >= 20) cur.shift()
    cur.push(item)
    global._mikuMediaPool.set(sender, cur)
    return cur.length
  },
  remove(sender, index1) {
    const cur = pool.list(sender)
    if (index1 < 1 || index1 > cur.length) return false
    cur.splice(index1 - 1, 1)
    global._mikuMediaPool.set(sender, cur)
    return true
  },
  clear(sender) {
    global._mikuMediaPool.delete(sender)
  }
}

const du = {
  safeName(name, fallback = 'berkas') {
    const cleaned = String(name || '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
    return cleaned || fallback
  },
  async getFile(sock, m) {
    const q = m.quoted || m
    const mime = q.mimetype || q.msg?.mimetype || q.message?.[q.type]?.mimetype || ''
    let buf = null
    if (typeof q.download === 'function') buf = await q.download().catch(() => null)
    if (!buf && typeof m.download === 'function' && q === m) buf = await m.download().catch(() => null)
    if (!buf && sock?.downloadMediaMessage) buf = await sock.downloadMediaMessage(q).catch(() => null)
    if (!buf || !buf.length) return null
    let kind = 'other', ext = 'bin'
    if (buf.slice(0, 4).toString() === '%PDF' || /pdf/i.test(mime)) { kind = 'pdf'; ext = 'pdf' }
    else if (/^image\//i.test(mime) || (buf[0] === 0xFF && buf[1] === 0xD8)) { kind = 'image'; ext = 'jpg' }
    else if (/^video\//i.test(mime)) { kind = 'video'; ext = 'mp4' }
    else if (/^audio\//i.test(mime)) { kind = 'audio'; ext = 'mp3' }
    const name = q.msg?.fileName || q.fileName || `item-${Date.now().toString(36)}.${ext}`
    return { buffer: buf, name, mime: mime || 'application/octet-stream', sniff: { kind, ext } }
  }
}

const io = {
  async blurFit(buffer, W = 1280, H = 720) {
    const bg = await sharp(buffer, { failOn: 'none' }).rotate().resize(W, H, { fit: 'cover' }).blur(24).modulate({ brightness: 0.7 }).jpeg({ quality: 85 }).toBuffer()
    const fg = await sharp(buffer, { failOn: 'none' }).rotate().resize(W, H, { fit: 'inside' }).png().toBuffer()
    return sharp(bg).composite([{ input: fg, gravity: 'center' }]).jpeg({ quality: 90 }).toBuffer()
  }
}

const ffm = {
  runMulti(buffers, outExt, buildArgs, timeout = 240000) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'miku-pool-'))
    const ins = buffers.map((b, i) => {
      const p = path.join(dir, `in_${i}`)
      fs.writeFileSync(p, b)
      return p
    })
    const outFile = path.join(dir, `out.${outExt}`)
    const args = ['-y', ...buildArgs(ins, outFile)]
    return new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG_BIN, args)
      let err = ''
      const timer = setTimeout(() => proc.kill('SIGKILL'), timeout)
      proc.stderr.on('data', (d) => { err += d.toString() })
      proc.on('error', (e) => { clearTimeout(timer); fs.rmSync(dir, { recursive: true, force: true }); reject(e) })
      proc.on('close', (code) => {
        clearTimeout(timer)
        try {
          if (code !== 0 || !fs.existsSync(outFile)) throw new Error(err.split('\n').slice(-3).join(' ') || 'FFmpeg gagal memproses media.')
          const res = fs.readFileSync(outFile)
          fs.rmSync(dir, { recursive: true, force: true })
          resolve(res)
        } catch (e) {
          fs.rmSync(dir, { recursive: true, force: true })
          reject(e)
        }
      })
    })
  }
}

async function buildPdfFromJpegsPure(jpegPages) {
  // Builds a valid multi-page PDF 1.4 with DCTDecode (JPEG) XObjects
  const objects = []
  const addObj = (body) => { objects.push(body); return objects.length }
  const pagesRootId = addObj('')
  const pageIds = []

  for (let i = 0; i < jpegPages.length; i++) {
    const { jpg, width, height } = jpegPages[i]
    const land = width > height * 1.15
    const [pw, ph] = land ? [842, 595] : [595, 842]
    const mg = 24
    const s = Math.min((pw - mg * 2) / width, (ph - mg * 2) / height)
    const dw = width * s, dh = height * s
    const dx = (pw - dw) / 2, dy = (ph - dh) / 2

    const imgHeader = Buffer.from(
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`,
      'latin1'
    )
    const imgFooter = Buffer.from('\nendstream', 'latin1')
    const imgId = addObj(Buffer.concat([imgHeader, jpg, imgFooter]))

    const contentStr = `q ${dw.toFixed(2)} 0 0 ${dh.toFixed(2)} ${dx.toFixed(2)} ${dy.toFixed(2)} cm /Im0 Do Q`
    const contentId = addObj(`<< /Length ${contentStr.length} >>\nstream\n${contentStr}\nendstream`)
    const pageId = addObj(
      `<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>`
    )
    pageIds.push(pageId)
  }

  objects[pagesRootId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesRootId} 0 R >>`)

  const parts = [Buffer.from('%PDF-1.4\n', 'latin1')]
  const offsets = [0]
  let curLen = parts[0].length
  for (let i = 0; i < objects.length; i++) {
    offsets.push(curLen)
    const head = Buffer.from(`${i + 1} 0 obj\n`, 'latin1')
    const body = Buffer.isBuffer(objects[i]) ? objects[i] : Buffer.from(String(objects[i]), 'latin1')
    const tail = Buffer.from('\nendobj\n', 'latin1')
    parts.push(head, body, tail)
    curLen += head.length + body.length + tail.length
  }
  const xrefPos = curLen
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`
  parts.push(Buffer.from(xref, 'latin1'))
  return Buffer.concat(parts)
}

const fail = (m) => Object.assign(new Error(m), { userMessage: m })
const ICON = { image: '🖼️', pdf: '📕', video: '🎬', audio: '🎵', other: '📄' }
const mine = (c, kind) => pool.list(c.sender).filter((i) => (Array.isArray(kind) ? kind.includes(i.kind) : !kind || i.kind === kind))
const need = (items, n, what) => {
  if (items.length < n) throw fail(`Butuh minimal ${n} ${what} di keranjang. Tambahkan dengan reply media lalu ketik \`.kumpul\``)
}
const nameArg = (c, def) => du.safeName(kit.rest(c.body).trim().replace(/\.[a-z0-9]{2,4}$/i, '') || def, def)

const specs = {
  kumpul: {
    desc: 'Keranjang media: kumpulkan gambar/video/audio/file untuk diolah bersama',
    usage: '[list|reset|hapus <no>]',
    run: async (c) => {
      const a = (c.args[0] || '').toLowerCase()
      if (a === 'reset' || a === 'kosong') {
        pool.clear(c.sender)
        return '🗑️ Keranjang media berhasil dikosongkan.'
      }
      if (a === 'hapus') {
        const n = Number(c.args[1])
        return pool.remove(c.sender, n) ? `🗑️ Item #${n} dihapus dari keranjang.` : 'Nomor item tidak ditemukan. Cek daftar dengan `.kumpul list`'
      }
      if (a === 'list' || a === 'daftar') {
        const items = pool.list(c.sender)
        if (!items.length) return '📦 Keranjang masih kosong. Reply file/media dengan `.kumpul` untuk menambahkan.'
        return uitext.panel('KERANJANG MEDIA', [
          { head: `📦 *${items.length} BERKAS TERSIMPAN*`, lines: items.map((i, n) => `${n + 1}. ${ICON[i.kind]} ${i.name} (${kit.fmtSize(i.buffer.length)})`) },
          { head: '🛠️ *PERINTAH OLAH*', lines: ['.pdfbuat • .kolase • .slideshow • .zipkan', '.gabungvideo • .gabungaudio • .mixav', '.kumpul hapus <no> • .kumpul reset'] }
        ])
      }
      const f = await du.getFile(c.sock, c.msg).catch(() => null)
      if (!f) {
        const items = pool.list(c.sender)
        return `📦 Isi keranjang saat ini: *${items.length} file*.\n\nReply gambar/video/audio/file dengan *\${c.prefix}kumpul* untuk menambahkan, lalu olah dengan:\n\`.pdfbuat\` • \`.kolase\` • \`.slideshow\` • \`.zipkan\` • \`.gabungvideo\` • \`.gabungaudio\` • \`.mixav\``
      }
      const kind = ['image', 'pdf', 'video', 'audio'].includes(f.sniff.kind) ? f.sniff.kind : 'other'
      const n = pool.add(c.sender, { buffer: f.buffer, name: f.name, kind, mime: f.mime })
      return `✅ Ditambahkan ke-#${n}: ${ICON[kind]} *${f.name}*\nTotal di keranjang: *${n} file*.`
    }
  },
  pdfbuat: {
    desc: 'Gabungkan semua gambar di keranjang menjadi satu dokumen PDF',
    usage: '[nama file]',
    heavy: true,
    run: async (c) => {
      const items = mine(c, 'image')
      need(items, 1, 'gambar')
      const jpegPages = []
      for (const it of items) {
        const jpg = await sharp(it.buffer, { failOn: 'none' }).rotate().flatten({ background: '#ffffff' }).jpeg({ quality: 90 }).toBuffer()
        const meta = await sharp(jpg).metadata()
        jpegPages.push({ jpg, width: meta.width || 800, height: meta.height || 1000 })
      }
      const out = await buildPdfFromJpegsPure(jpegPages)
      return { documents: [{ buffer: out, name: `${nameArg(c, 'dokumen')}.pdf`, mime: 'application/pdf', caption: `✅ PDF selesai dibuat: ${jpegPages.length} halaman • ${kit.fmtSize(out.length)}` }] }
    }
  },
  kolase: {
    desc: 'Susun semua gambar di keranjang menjadi satu kolase rapi',
    usage: '[jumlah kolom]',
    heavy: true,
    run: async (c) => {
      const items = mine(c, 'image')
      need(items, 2, 'gambar')
      const list = items.slice(0, 16)
      const cols = Math.min(list.length, Math.round(kit.numArg(c.args[0], Math.ceil(Math.sqrt(list.length)), 1, 6)))
      const rows = Math.ceil(list.length / cols)
      const cell = cols >= 4 ? 420 : 560
      const gap = 14
      const W = cols * cell + (cols + 1) * gap
      const H = rows * cell + (rows + 1) * gap
      const comps = []
      for (let i = 0; i < list.length; i++) {
        const t = await sharp(list[i].buffer, { failOn: 'none' }).rotate().resize(cell, cell, { fit: 'cover', position: 'attention' }).jpeg({ quality: 90 }).toBuffer()
        comps.push({ input: t, left: gap + (i % cols) * (cell + gap), top: gap + Math.floor(i / cols) * (cell + gap) })
      }
      const img = await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } }).composite(comps).jpeg({ quality: 92 }).toBuffer()
      return { image: img, caption: `🖼️ Kolase ${list.length} foto (${cols}×${rows})` }
    }
  },
  slideshow: {
    desc: 'Jadikan gambar di keranjang menjadi video slideshow (+ musik jika ada audio di keranjang)',
    usage: '[detik per foto 1-8]',
    heavy: true,
    run: async (c) => {
      const items = mine(c, 'image').slice(0, 15)
      need(items, 2, 'gambar')
      const d = kit.numArg(c.args[0], 3, 1, 8)
      const fade = Math.min(0.6, d / 3)
      const frames = []
      for (const it of items) frames.push(await io.blurFit(it.buffer, 1280, 720))
      const aud = mine(c, 'audio')[0]
      const total = items.length * d - (items.length - 1) * fade
      const bufs = aud ? [...frames, aud.buffer] : frames
      const out = await ffm.runMulti(bufs, 'mp4', (ins, o) => {
        const a = []
        frames.forEach((_, i) => a.push('-loop', '1', '-framerate', '25', '-t', String(d), '-f', 'image2', '-i', ins[i]))
        if (aud) a.push('-i', ins[frames.length])
        let f = ''
        let last = '0:v'
        for (let i = 1; i < frames.length; i++) {
          const off = (i * (d - fade)).toFixed(2)
          f += `[${last}][${i}:v]xfade=transition=fade:duration=${fade.toFixed(2)}:offset=${off}[x${i}];`
          last = `x${i}`
        }
        f += `[${last}]format=yuv420p[v]`
        a.push('-filter_complex', f, '-map', '[v]')
        if (aud) a.push('-map', `${frames.length}:a`, '-c:a', 'aac', '-b:a', '128k', '-t', total.toFixed(2))
        a.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-movflags', '+faststart', o)
        return a
      }, 240000)
      return { video: out, caption: `🎞️ Slideshow ${items.length} foto • ${total.toFixed(0)} detik${aud ? ' + musik' : ''}` }
    }
  },
  zipkan: {
    desc: 'Kompres semua file di keranjang menjadi satu arsip ZIP',
    usage: '[nama arsip]',
    heavy: true,
    run: async (c) => {
      const items = pool.list(c.sender)
      need(items, 1, 'file')
      const out = await new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 6 } })
        const chunks = []
        archive.on('data', (d) => chunks.push(d))
        archive.on('error', reject)
        archive.on('end', () => resolve(Buffer.concat(chunks)))
        const used = new Set()
        items.forEach((it, i) => {
          let n = it.name
          if (used.has(n)) n = `${i + 1}-${n}`
          used.add(n)
          archive.append(it.buffer, { name: n })
        })
        archive.finalize()
      })
      return { documents: [{ buffer: out, name: `${nameArg(c, 'arsip')}.zip`, mime: 'application/zip', caption: `🗜️ ${items.length} file dikemas ke ZIP (${kit.fmtSize(out.length)})` }] }
    }
  },
  gabungvideo: {
    desc: 'Gabungkan semua video di keranjang menjadi satu video MP4',
    heavy: true,
    run: async (c) => {
      const items = mine(c, 'video').slice(0, 6)
      need(items, 2, 'video')
      const out = await ffm.runMulti(items.map((i) => i.buffer), 'mp4', (ins, o) => {
        const a = []
        ins.forEach((f) => a.push('-i', f))
        let f = ''
        ins.forEach((_, i) => {
          f += `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,format=yuv420p[v${i}];`
        })
        f += ins.map((_, i) => `[v${i}]`).join('') + `concat=n=${ins.length}:v=1:a=0[v]`
        a.push('-filter_complex', f, '-map', '[v]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25', '-movflags', '+faststart', o)
        return a
      }, 300000)
      return { video: out, caption: `🎬 ${items.length} video berhasil digabung` }
    }
  },
  gabungaudio: {
    desc: 'Gabungkan semua audio/VN di keranjang menjadi satu MP3',
    heavy: true,
    run: async (c) => {
      const items = mine(c, 'audio').slice(0, 12)
      need(items, 2, 'audio')
      const out = await ffm.runMulti(items.map((i) => i.buffer), 'mp3', (ins, o) => {
        const a = []
        ins.forEach((f) => a.push('-i', f))
        a.push(
          '-filter_complex',
          ins.map((_, i) => `[${i}:a]aresample=44100,aformat=channel_layouts=stereo[a${i}]`).join(';') +
          `;${ins.map((_, i) => `[a${i}]`).join('')}concat=n=${ins.length}:v=0:a=1[a]`,
          '-map', '[a]', '-c:a', 'libmp3lame', '-b:a', '160k', o
        )
        return a
      }, 240000)
      return { audio: out, caption: `🎵 ${items.length} audio berhasil digabung` }
    }
  },
  mixav: {
    desc: 'Pasang audio dari keranjang sebagai suara baru pada video di keranjang',
    heavy: true,
    run: async (c) => {
      const v = mine(c, 'video')[0]
      const a = mine(c, 'audio')[0]
      if (!v || !a) throw fail('Butuh 1 video dan 1 audio di keranjang. Tambahkan dengan reply media lalu ketik `.kumpul`')
      const out = await ffm.runMulti(
        [v.buffer, a.buffer],
        'mp4',
        (ins, o) => ['-i', ins[0], '-i', ins[1], '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', o],
        240000
      )
      return { video: out, caption: '🎧 Audio berhasil dipasang pada video' }
    }
  }
}

async function handler(m, { conn, sock, text, args, usedPrefix = '.', command = 'kumpul' }) {
  const client = conn || sock
  const cmd = (command || '').toLowerCase()
  const spec = specs[cmd]
  if (!spec) return

  const rawBody = `${usedPrefix + cmd} ${text || (args || []).join(' ')}`.trim()
  await m.react('⏳')
  try {
    const res = await spec.run({ body: rawBody, prefix: usedPrefix, command: cmd, args: args || [], sender: m.sender, sock: client, msg: m })
    if (typeof res === 'string') {
      await m.react('✅')
      return m.reply(res)
    }
    if (res?.image) {
      await client.sendMessage(m.chat, { image: res.image, caption: res.caption || '' }, { quoted: m })
    }
    if (res?.video) {
      await client.sendMessage(m.chat, { video: res.video, mimetype: 'video/mp4', caption: res.caption || '' }, { quoted: m })
    }
    if (res?.audio) {
      await client.sendMessage(m.chat, { audio: res.audio, mimetype: 'audio/mpeg' }, { quoted: m })
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
