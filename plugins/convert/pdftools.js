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
import { spawnSync, spawn } from 'child_process'

const pluginConfig = {
    name: "pdftoimg",
    alias: ["pdfsplit", "pdfhapus", "pdfrotate", "pdfinfo", "pdftext", "pdfwm", "pdfnomor", "pdfcompress", "teks2pdf"],
    category: "convert",
    description: "pdftoimg",
    usage: ".pdftoimg",
    example: ".pdftoimg",
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

const fail = (msg) => Object.assign(new Error(msg), { userMessage: msg })

async function tryRequirePdfLib() {
  try { return await import('pdf-lib') } catch { return null }
}

const du = {
  safeName(name, fallback = 'dokumen') {
    const cleaned = String(name || '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
    return cleaned || fallback
  },
  which(bin) {
    const r = spawnSync('which', [bin], { encoding: 'utf8' })
    return r.status === 0 && r.stdout.trim() ? r.stdout.trim() : null
  },
  async withTmp(fn) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'miku-pdf-'))
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
  parseRange(spec, maxPages) {
    if (!spec || /^semua|all$/i.test(spec)) {
      return Array.from({ length: maxPages }, (_, i) => i + 1)
    }
    const pages = []
    for (const part of String(spec).split(',').map((s) => s.trim()).filter(Boolean)) {
      const m = part.match(/^(\d+)\s*-\s*(\d+)$/)
      if (m) {
        const a = Math.max(1, Math.min(maxPages, Number(m[1])))
        const b = Math.max(1, Math.min(maxPages, Number(m[2])))
        const step = a <= b ? 1 : -1
        for (let i = a; step > 0 ? i <= b : i >= b; i += step) pages.push(i)
      } else {
        const p = Number(part)
        if (Number.isInteger(p) && p >= 1 && p <= maxPages) pages.push(p)
      }
    }
    if (!pages.length) throw fail(`Rentang halaman tidak valid (dokumen memiliki ${maxPages} halaman).`)
    return pages
  },
  async getFile(sock, m) {
    const q = m.quoted || m
    const mime = q.mimetype || q.msg?.mimetype || q.message?.[q.type]?.mimetype || ''
    let buf = null
    if (typeof q.download === 'function') buf = await q.download().catch(() => null)
    if (!buf && typeof m.download === 'function' && q === m) buf = await m.download().catch(() => null)
    if (!buf && sock?.downloadMediaMessage) buf = await sock.downloadMediaMessage(q).catch(() => null)
    if (!buf || !buf.length) return null
    const isPdf = buf.slice(0, 4).toString() === '%PDF' || /pdf/i.test(mime)
    const name = q.msg?.fileName || q.fileName || (isPdf ? 'dokumen.pdf' : 'berkas.txt')
    return {
      buffer: buf,
      name,
      mime: isPdf ? 'application/pdf' : (mime || 'text/plain'),
      sniff: { kind: isPdf ? 'pdf' : 'text', ext: isPdf ? 'pdf' : 'txt' }
    }
  }
}

function inspectPdfPure(buf) {
  const raw = buf.toString('latin1')
  const pageMatches = raw.match(/\/Type\s*\/Page\b(?!s)/g) || []
  const countMatch = raw.match(/\/Count\s+(\d+)/)
  const pageCount = Math.max(pageMatches.length, countMatch ? Number(countMatch[1]) : 1)
  const mb = raw.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/)
  const width = mb ? Number(mb[3]) - Number(mb[1]) : 595.28
  const height = mb ? Number(mb[4]) - Number(mb[2]) : 841.89
  const pickTag = (tag) => {
    const m = raw.match(new RegExp(`\\/${tag}\\s*\\(([^)]*)\\)`))
    return m ? m[1] : '-'
  }
  return {
    pageCount,
    width,
    height,
    title: pickTag('Title'),
    author: pickTag('Author'),
    creator: pickTag('Creator'),
    producer: pickTag('Producer'),
    encrypted: /\/Encrypt\b/.test(raw)
  }
}

function extractPdfTextPure(buf) {
  const raw = buf.toString('latin1')
  const chunks = []
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  let match
  while ((match = streamRegex.exec(raw)) !== null) {
    let content = Buffer.from(match[1], 'latin1')
    try { content = zlib.inflateSync(content) } catch {}
    const str = content.toString('latin1')
    for (const tj of str.matchAll(/\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g)) {
      chunks.push(tj[1].replace(/\\([nrt()])/g, (_, c) => (c === 'n' ? '\n' : c === 'r' ? '' : c === 't' ? ' ' : c)))
    }
  }
  return chunks.join(' ').trim()
}

async function textToPdfPure(text) {
  const ctx = await pdfdoc.create()
  const p = new pdfdoc.Pen(ctx, { top: 56, bottom: 56, left: 56, right: 56 })
  p.text(String(text || ''), { size: 11, lh: 1.45 })
  return p.save()
}

const baseName = (n) => du.safeName(String(n).replace(/\.[^.]+$/, ''), 'dokumen')
const pdfOut = (buffer, name) => ({ documents: [{ buffer: Buffer.from(buffer), name: `${name}.pdf`, mime: 'application/pdf', caption: '✅ Selesai diproses' }] })

const loadPdfLibDoc = async (buf) => {
  const pl = await tryRequirePdfLib()
  if (!pl) throw fail('Fitur edit struktur halaman PDF ini memerlukan paket `pdf-lib` (`npm i pdf-lib`).')
  return pl.PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false })
}

const specs = {
  pdftoimg: {
    desc: 'Ubah halaman PDF jadi gambar (maks 10 halaman per perintah)',
    usage: '[halaman|1-3|semua] [hd]',
    example: '1-3',
    needs: 'pdf',
    heavy: true,
    run: async (c, f) => {
      const info = inspectPdfPure(f.buffer)
      const total = info.pageCount
      const hd = c.args.some((a) => /^hd$/i.test(a))
      const spec = c.args.find((a) => !/^hd$/i.test(a))
      let pages = du.parseRange(spec || (total > 10 ? '1-10' : 'semua'), total)
      let note = ''
      if (pages.length > 10) { pages = pages.slice(0, 10); note = ' (dibatasi 10 halaman)' }
      if (!du.which('pdftoppm')) {
        throw fail('Konversi halaman PDF ke gambar membutuhkan utilitas `pdftoppm` (poppler-utils) di server.')
      }
      const out = await du.withTmp(async (dir) => {
        const inp = path.join(dir, 'in.pdf')
        fs.writeFileSync(inp, f.buffer)
        const res = []
        for (const pg of pages) {
          const r = await du.exec('pdftoppm', ['-r', String(hd ? 220 : 150), '-f', String(pg), '-l', String(pg), '-jpeg', '-jpegopt', 'quality=90', '-singlefile', inp, path.join(dir, `p${pg}`)], { timeout: 90000 })
          const fileOut = path.join(dir, `p${pg}.jpg`)
          if (r.code !== 0 || !fs.existsSync(fileOut)) throw fail('Gagal merender halaman PDF.')
          res.push({ page: pg, buffer: fs.readFileSync(fileOut) })
        }
        return res
      })
      return { images: out.map((o) => o.buffer), captions: out.map((o) => `📄 Halaman ${o.page}/${total}${note && o === out[0] ? note : ''}`) }
    }
  },
  pdfsplit: {
    desc: 'Ambil halaman tertentu dari PDF jadi PDF baru',
    usage: '<halaman, mis. 1-3,5>',
    example: '2-4',
    needs: 'pdf',
    heavy: true,
    run: async (c, f) => {
      if (!c.args[0]) throw fail('Tulis halaman yang ingin diambil. Contoh: .pdfsplit 1-3,5')
      const pl = await tryRequirePdfLib()
      if (!pl) throw fail('Fitur `.pdfsplit` memerlukan paket `pdf-lib` (`npm i pdf-lib`).')
      const src = await loadPdfLibDoc(f.buffer)
      const pages = du.parseRange(c.args[0], src.getPageCount())
      const out = await pl.PDFDocument.create()
      for (const p of await out.copyPages(src, pages.map((x) => x - 1))) out.addPage(p)
      return pdfOut(await out.save(), `${baseName(f.name)}-hal-${c.args[0].replace(/[^\d,-]/g, '')}`)
    }
  },
  pdfhapus: {
    desc: 'Hapus halaman tertentu dari PDF',
    usage: '<halaman, mis. 2,5-6>',
    example: '2',
    needs: 'pdf',
    heavy: true,
    run: async (c, f) => {
      if (!c.args[0]) throw fail('Tulis nomor halaman yang ingin dihapus. Contoh: .pdfhapus 2,5-6')
      const src = await loadPdfLibDoc(f.buffer)
      const del = new Set(du.parseRange(c.args[0], src.getPageCount()))
      if (del.size >= src.getPageCount()) throw fail('Tidak boleh menghapus seluruh halaman PDF.')
      ;[...del].sort((a, b) => b - a).forEach((p) => src.removePage(p - 1))
      return pdfOut(await src.save(), `${baseName(f.name)}-edit`)
    }
  },
  pdfrotate: {
    desc: 'Putar halaman PDF (90, 180, 270)',
    usage: '[derajat] [halaman]',
    example: '90 1-2',
    needs: 'pdf',
    heavy: true,
    run: async (c, f) => {
      const pl = await tryRequirePdfLib()
      if (!pl) throw fail('Fitur `.pdfrotate` memerlukan paket `pdf-lib` (`npm i pdf-lib`).')
      const deg = [90, 180, 270].includes(Number(c.args[0])) ? Number(c.args[0]) : 90
      const src = await loadPdfLibDoc(f.buffer)
      const pages = du.parseRange(c.args[1], src.getPageCount())
      for (const p of pages) {
        const pg = src.getPage(p - 1)
        pg.setRotation(pl.degrees((pg.getRotation().angle + deg) % 360))
      }
      return pdfOut(await src.save(), `${baseName(f.name)}-putar`)
    }
  },
  pdfinfo: {
    desc: 'Lihat informasi PDF: jumlah halaman, ukuran kertas, judul, pembuat',
    needs: 'pdf',
    run: async (c, f) => {
      const info = inspectPdfPure(f.buffer)
      const mm = (v) => Math.round((v / 72) * 25.4)
      const paper = [['A4', 210, 297], ['A3', 297, 420], ['A5', 148, 210], ['Letter', 216, 279], ['Legal', 216, 356]].find(
        ([, w, h]) => (Math.abs(mm(info.width) - w) < 4 && Math.abs(mm(info.height) - h) < 4) || (Math.abs(mm(info.width) - h) < 4 && Math.abs(mm(info.height) - w) < 4)
      )
      return uitext.panel('INFORMASI PDF', [
        { head: '📄 *DOKUMEN*', lines: [`Nama : ${f.name}`, `Halaman : ${info.pageCount}`, `Ukuran File : ${kit.fmtSize(f.buffer.length)}`, `Ukuran Kertas : ${paper ? paper[0] : 'Kustom'} (${mm(info.width)}×${mm(info.height)} mm)`] },
        { head: '🧬 *METADATA*', lines: [`Judul : ${info.title}`, `Penulis : ${info.author}`, `Pembuat : ${info.creator}`, `Produser : ${info.producer}`, `Terenkripsi : ${info.encrypted ? 'Ya' : 'Tidak'}`] }
      ])
    }
  },
  pdftext: {
    desc: 'Ekstrak teks dari dokumen PDF',
    usage: '[halaman]',
    example: '1-2',
    needs: 'pdf',
    heavy: true,
    run: async (c, f) => {
      const info = inspectPdfPure(f.buffer)
      const pages = c.args[0] ? du.parseRange(c.args[0], info.pageCount) : null
      let text = ''
      if (du.which('pdftotext')) {
        text = await du.withTmp(async (dir) => {
          const inp = path.join(dir, 'in.pdf')
          fs.writeFileSync(inp, f.buffer)
          const a = ['-layout', '-enc', 'UTF-8']
          if (pages) a.push('-f', String(pages[0]), '-l', String(pages[pages.length - 1]))
          const r = await du.exec('pdftotext', [...a, inp, '-'], { timeout: 60000 })
          return r.out.toString('utf8')
        })
      } else {
        text = extractPdfTextPure(f.buffer)
      }
      text = text.replace(/\f/g, '\n\n').replace(/\n{3,}/g, '\n\n').trim()
      if (!text) throw fail('Tidak ada lapisan teks yang dapat diekstrak dari PDF ini.')
      if (text.length <= 3500) return `📄 *TEKS DOKUMEN PDF*\n\n${text}`
      return { documents: [{ buffer: Buffer.from(text, 'utf8'), name: `${baseName(f.name)}.txt`, mime: 'text/plain', caption: `📄 Teks PDF (${text.length.toLocaleString('id-ID')} karakter)` }] }
    }
  },
  pdfwm: {
    desc: 'Tambahkan watermark teks miring di seluruh halaman PDF',
    usage: '<teks>',
    example: 'RAHASIA',
    needs: 'pdf',
    heavy: true,
    run: async (c, f) => {
      const t = kit.rest(c.body).trim()
      if (!t || t.length > 40) throw fail('Tulis teks watermark (maks 40 karakter). Contoh: .pdfwm RAHASIA')
      const pl = await tryRequirePdfLib()
      if (!pl) throw fail('Fitur `.pdfwm` memerlukan paket `pdf-lib` (`npm i pdf-lib`).')
      const d = await loadPdfLibDoc(f.buffer)
      const font = await d.embedFont(pl.StandardFonts.HelveticaBold)
      for (const pg of d.getPages()) {
        const { width, height } = pg.getSize()
        const size = Math.min(80, Math.max(24, Math.floor(width / Math.max(4, t.length))))
        pg.drawText(t, {
          x: width * 0.2,
          y: height * 0.45,
          size,
          font,
          color: pl.rgb(0.55, 0.55, 0.55),
          opacity: 0.28,
          rotate: pl.degrees(45)
        })
      }
      return pdfOut(await d.save(), `${baseName(f.name)}-wm`)
    }
  },
  pdfnomor: {
    desc: 'Tambahkan nomor halaman di bagian bawah tiap halaman PDF',
    usage: '[kiri|tengah|kanan]',
    example: 'tengah',
    needs: 'pdf',
    heavy: true,
    run: async (c, f) => {
      const pl = await tryRequirePdfLib()
      if (!pl) throw fail('Fitur `.pdfnomor` memerlukan paket `pdf-lib` (`npm i pdf-lib`).')
      const d = await loadPdfLibDoc(f.buffer)
      const font = await d.embedFont(pl.StandardFonts.Helvetica)
      const pos = (c.args[0] || 'tengah').toLowerCase()
      const n = d.getPageCount()
      d.getPages().forEach((pg, i) => {
        const { width } = pg.getSize()
        const label = `${i + 1} / ${n}`
        const w = font.widthOfTextAtSize(label, 10)
        pg.drawText(label, {
          x: pos === 'kiri' ? 36 : pos === 'kanan' ? width - 36 - w : (width - w) / 2,
          y: 22,
          size: 10,
          font,
          color: pl.rgb(0.3, 0.3, 0.3)
        })
      })
      return pdfOut(await d.save(), `${baseName(f.name)}-nomor`)
    }
  },
  pdfcompress: {
    desc: 'Perkecil ukuran file PDF',
    needs: 'pdf',
    heavy: true,
    run: async (c, f) => {
      let out = null
      if (du.which('gs')) {
        out = await du.withTmp(async (dir) => {
          fs.writeFileSync(path.join(dir, 'in.pdf'), f.buffer)
          await du.exec('gs', ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', '-dPDFSETTINGS=/ebook', '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${path.join(dir, 'out.pdf')}`, path.join(dir, 'in.pdf')], { timeout: 180000 })
          return fs.existsSync(path.join(dir, 'out.pdf')) ? fs.readFileSync(path.join(dir, 'out.pdf')) : null
        })
      } else if (du.which('qpdf')) {
        out = await du.withTmp(async (dir) => {
          fs.writeFileSync(path.join(dir, 'in.pdf'), f.buffer)
          await du.exec('qpdf', ['--object-streams=generate', '--compress-streams=y', '--recompress-flate', '--compression-level=9', path.join(dir, 'in.pdf'), path.join(dir, 'out.pdf')], { timeout: 120000 })
          return fs.existsSync(path.join(dir, 'out.pdf')) ? fs.readFileSync(path.join(dir, 'out.pdf')) : null
        })
      } else if (await tryRequirePdfLib()) {
        out = Buffer.from(await (await loadPdfLibDoc(f.buffer)).save({ useObjectStreams: true }))
      } else {
        throw fail('Kompresi PDF memerlukan Ghostscript (`gs`), `qpdf`, atau paket `pdf-lib`.')
      }
      if (!out || out.length >= f.buffer.length) {
        return `ℹ️ Ukuran PDF ini sudah optimal (${kit.fmtSize(f.buffer.length)}).`
      }
      return {
        documents: [{
          buffer: out,
          name: `${baseName(f.name)}-kompres.pdf`,
          mime: 'application/pdf',
          caption: `✅ ${kit.fmtSize(f.buffer.length)} ➔ ${kit.fmtSize(out.length)} (Hemat ${Math.round((1 - out.length / f.buffer.length) * 100)}%)`
        }]
      }
    }
  },
  teks2pdf: {
    desc: 'Ubah teks (atau reply pesan/file .txt) menjadi dokumen PDF',
    usage: '<teks>',
    example: 'Halo dunia',
    run: async (c) => {
      let t = kit.rest(c.body).trim()
      if (!t) t = c.msg.quoted?.text || c.msg.quoted?.body || ''
      if (!t) {
        const f = await du.getFile(c.sock, c.msg).catch(() => null)
        if (f && f.sniff.kind === 'text') t = f.buffer.toString('utf8')
      }
      if (!t) throw fail('Tulis teksnya, reply pesan teks, atau reply file .txt.\nContoh: `.teks2pdf Halo dunia`')
      if (t.length > 60000) throw fail('Teks terlalu panjang (maks 60.000 karakter).')
      return pdfOut(await textToPdfPure(t), `teks-${Date.now()}`)
    }
  }
}

async function handler(m, { conn, sock, text, args, usedPrefix = '.', command = 'pdfinfo' }) {
  const client = conn || sock
  const cmd = (command || '').toLowerCase()
  const spec = specs[cmd]
  if (!spec) return

  const rawBody = `${usedPrefix + cmd} ${text || (args || []).join(' ')}`.trim()
  const file = spec.needs === 'pdf' ? await du.getFile(client, m) : null
  if (spec.needs === 'pdf' && (!file || file.sniff.kind !== 'pdf')) {
    return m.reply(`📕 Kirim atau reply dokumen PDF dengan perintah *${usedPrefix + cmd}${spec.usage ? ' ' + spec.usage : ''}*\n_${spec.desc}_`)
  }

  await m.react('⏳')
  try {
    const res = await spec.run({ body: rawBody, prefix: usedPrefix, command: cmd, args: args || [], sender: m.sender, sock: client, msg: m }, file)
    if (typeof res === 'string') {
      await m.react('✅')
      return m.reply(res)
    }
    if (res?.images?.length) {
      for (let i = 0; i < res.images.length; i++) {
        await client.sendMessage(m.chat, { image: res.images[i], caption: res.captions?.[i] || '' }, { quoted: m })
      }
    }
    if (res?.documents?.length) {
      for (const d of res.documents) {
        await client.sendMessage(m.chat, { document: d.buffer, fileName: d.name, mimetype: d.mime || 'application/pdf', caption: d.caption || '' }, { quoted: m })
      }
    }
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ ${e.userMessage || e.message}`)
  }
}

export { pluginConfig as config, handler }
