/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: "kwitansi",
    alias: ["invoice", "suratizin", "suratlamaran", "cv"],
    category: "convert",
    description: "kwitansi",
    usage: ".kwitansi",
    example: ".kwitansi",
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

const { create, Pen, hex } = pdfdoc
  const { terbilang } = numwords
  const { parseMoney, rp } = uitext

  const bad = (m) => Object.assign(new Error('arg'), { userMessage: m })
  const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const wib = () => new Date(Date.now() + 7 * 3600e3)
  const tgl = (d = wib()) => `${d.getUTCDate()} ${BLN[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  const parts = (c, min, usage) => {
    const p = kit.rest(c.body).split('|').map((s) => s.trim())
    if (p.filter(Boolean).length < min) throw bad(`Format:\n${c.prefix}${c.command} ${usage}`)
    return p
  }
  const kv = (p, rows, w = 82) => {
    for (const [k, v] of rows) {
      const y = p.y
      p.text(`${k}`, { width: w, lh: 1.55 })
      const y2 = p.y
      p.y = y
      p.text(`: ${v}`, { x: p.left + w, width: p.width - w, font: 'b', lh: 1.55 })
      p.y = Math.min(p.y, y2)
    }
    p.gap(8)
  }
  const out = (buffer, name, caption) => ({ documents: [{ buffer, name: `${name}.pdf`, mime: 'application/pdf', caption }] })
  const fileName = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'dokumen'
  const nomor = (pre) => { const d = wib(); return `${pre}/${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}/${String(Math.floor(Math.random() * 900) + 100)}` }

  async function kwitansi({ dari, jumlah, untuk, penerima, kota }) {
    const ctx = await create()
    const p = new Pen(ctx, { top: 70, left: 50, right: 50 })
    const W = p.width
    p.rect(p.left - 14, p.y - 360, W + 28, 372, null, { border: '#1d2b55', bw: 2.5 })
    p.rect(p.left - 8, p.y - 354, W + 16, 360, null, { border: '#9aa7d1', bw: 0.8 })
    p.y -= 14
    p.text('KWITANSI', { size: 30, font: 'b', color: '#1d2b55', align: 'center', after: 2 })
    p.text(`No. ${nomor('KW')}`, { size: 10, color: '#666666', align: 'center', after: 12 })
    const field = (label, value, o = {}) => {
      p.text(label, { size: 9, color: '#777777', lh: 1.2 })
      p.text(value, { size: o.size || 12.5, font: o.font || 'b', color: '#111111', lh: 1.3, after: 7 })
    }
    field('Telah terima dari', dari)
    field('Uang sejumlah', `${cap(terbilang(jumlah))} rupiah`, { font: 'bi' })
    field('Untuk pembayaran', untuk, { font: 'r' })
    p.gap(6)
    const y0 = p.y
    p.rect(p.left, y0 - 44, 230, 44, '#eef2ff', { border: '#1d2b55', bw: 1 })
    p.page.drawText(rp(jumlah), { x: p.left + 14, y: y0 - 30, size: 19, font: ctx.F.b, color: hex(ctx.rgb, '#1d2b55') })
    p.page.drawText(`${kota ? `${kota}, ` : ''}${tgl()}`, { x: p.left + W - 190, y: y0 - 12, size: 11, font: ctx.F.r, color: hex(ctx.rgb, '#111111') })
    p.page.drawText('Penerima,', { x: p.left + W - 190, y: y0 - 28, size: 10, font: ctx.F.r, color: hex(ctx.rgb, '#555555') })
    if (jumlah > 5000000) p.page.drawText('[ Tempel meterai Rp10.000 di sini ]', { x: p.left + W - 215, y: y0 - 78, size: 8.5, font: ctx.F.i, color: hex(ctx.rgb, '#999999') })
    p.page.drawLine({ start: { x: p.left + W - 190, y: y0 - 125 }, end: { x: p.left + W - 20, y: y0 - 125 }, thickness: 0.8, color: hex(ctx.rgb, '#333333') })
    p.page.drawText(penerima || '(nama penerima)', { x: p.left + W - 190, y: y0 - 138, size: 11, font: ctx.F.b, color: hex(ctx.rgb, '#111111') })
    return p.save()
  }

  function parseItems(str) {
    const items = []
    for (const raw of str.split(/\s*;\s*|\n|,\s+/).map((s) => s.trim()).filter(Boolean)) {
      const m = raw.match(/^(.+?)\s*(?:x\s*(\d+(?:[.,]\d+)?))?\s*@\s*([\d.,]+\s*[a-zA-Z]*)$/i)
      if (!m) throw bad(`Item "${raw}" tidak dikenali.\nTulis: nama x jumlah @harga, contoh: Desain logo x1 @500rb`)
      const price = parseMoney(m[3])
      if (price == null) throw bad(`Harga "${m[3]}" tidak valid.`)
      items.push({ name: m[1].trim(), qty: m[2] ? Number(m[2].replace(',', '.')) : 1, price })
    }
    if (!items.length) throw bad('Tulis minimal 1 item.')
    if (items.length > 25) throw bad('Maksimal 25 item.')
    return items
  }
  async function invoice({ klien, items, diskon, pajak, dari }) {
    const ctx = await create()
    const p = new Pen(ctx, { top: 60, left: 50, right: 50 })
    const W = p.width
    p.rect(0, p.H - 120, p.W, 120, '#1d2b55')
    p.page.drawText('INVOICE', { x: 50, y: p.H - 75, size: 34, font: ctx.F.b, color: hex(ctx.rgb, '#ffffff') })
    const due = new Date(wib().getTime() + 14 * 864e5)
    const no = nomor('INV')
    p.page.drawText(no, { x: p.W - 50 - ctx.F.r.widthOfTextAtSize(no, 11), y: p.H - 62, size: 11, font: ctx.F.r, color: hex(ctx.rgb, '#cfd8ff') })
    p.y = p.H - 150
    const half = W / 2
    const y0 = p.y
    p.text('DITAGIHKAN KEPADA', { size: 8.5, color: '#888888', width: half, lh: 1.2 })
    p.text(klien, { size: 14, font: 'b', width: half, after: 4 })
    const y1 = p.y
    p.y = y0
    p.text('DARI', { size: 8.5, color: '#888888', x: p.left + half, width: half, lh: 1.2 })
    p.text(dari || '(nama usaha Anda)', { size: 14, font: 'b', x: p.left + half, width: half, after: 4 })
    p.y = Math.min(y1, p.y)
    p.text(`Tanggal : ${tgl()}`, { size: 10, color: '#444444', lh: 1.35 })
    p.text(`Jatuh tempo : ${tgl(due)}`, { size: 10, color: '#444444', lh: 1.35, after: 14 })
    const cw = [W * 0.46, W * 0.1, W * 0.2, W * 0.24]
    p.row([{ w: cw[0], text: 'DESKRIPSI', font: 'b', color: '#ffffff' }, { w: cw[1], text: 'QTY', font: 'b', color: '#ffffff', align: 'center' }, { w: cw[2], text: 'HARGA', font: 'b', color: '#ffffff', align: 'right' }, { w: cw[3], text: 'JUMLAH', font: 'b', color: '#ffffff', align: 'right' }], { bg: '#1d2b55', size: 9.5 })
    let sub = 0
    items.forEach((it, i) => {
      const line = it.qty * it.price
      sub += line
      p.row([{ w: cw[0], text: it.name }, { w: cw[1], text: String(it.qty).replace('.', ','), align: 'center' }, { w: cw[2], text: rp(it.price), align: 'right' }, { w: cw[3], text: rp(line), align: 'right', font: 'b' }], { bg: i % 2 ? '#f4f6fc' : null, size: 10 })
    })
    p.line('#1d2b55', 1.2, 10)
    const disc = sub * (diskon / 100)
    const after = sub - disc
    const tax = after * (pajak / 100)
    const total = after + tax
    const sum = (label, val, bold) => p.row([{ w: cw[0] + cw[1], text: '' }, { w: cw[2], text: label, align: 'right', font: bold ? 'b' : 'r' }, { w: cw[3], text: val, align: 'right', font: 'b', color: bold ? '#1d2b55' : '#111111' }], { size: bold ? 12 : 10, pad: 4 })
    sum('Subtotal', rp(sub))
    if (diskon) sum(`Diskon ${diskon}%`, `- ${rp(disc)}`)
    if (pajak) sum(`PPN ${pajak}%`, rp(tax))
    sum('TOTAL', rp(total), true)
    p.gap(10)
    p.text(`Terbilang: ${cap(terbilang(total))} rupiah`, { size: 10, font: 'i', color: '#444444', after: 14 })
    p.text('Catatan pembayaran', { size: 9, font: 'b', color: '#888888', lh: 1.2 })
    p.text('Mohon lakukan pembayaran sebelum tanggal jatuh tempo. Cantumkan nomor invoice pada berita transfer.', { size: 10, color: '#444444' })
    return { buffer: await p.save(), total }
  }

  async function suratIzin({ nama, kelas, alasan, tanggal, tujuan, kota }) {
    const ctx = await create()
    const p = new Pen(ctx, { top: 70, left: 72, right: 72 })
    p.text(`${kota || '...........'}, ${tgl()}`, { align: 'right', after: 18 })
    p.text('Perihal : Permohonan Izin', { font: 'b', after: 14 })
    p.text(`Kepada Yth.\n${tujuan}\ndi tempat`, { after: 18 })
    p.text('Dengan hormat,', { after: 8 })
    p.text('Saya yang bertanda tangan di bawah ini:', { after: 6 })
    kv(p, [['Nama', nama], ['Kelas / Jabatan', kelas]], 100)
    p.text(`Dengan surat ini saya memohon izin untuk tidak dapat hadir pada ${tanggal} dikarenakan ${alasan}.`, { lh: 1.6, after: 10 })
    p.text('Demikian surat permohonan izin ini saya sampaikan. Atas perhatian dan pengertian Bapak/Ibu, saya ucapkan terima kasih.', { lh: 1.6, after: 30 })
    p.text('Hormat saya,', { x: p.left + p.width - 160, width: 160, after: 52 })
    p.text(nama, { font: 'b', x: p.left + p.width - 160, width: 160 })
    return p.save()
  }
  async function suratLamaran({ nama, posisi, perusahaan, pendidikan, skill, kota }) {
    const ctx = await create()
    const p = new Pen(ctx, { top: 64, left: 72, right: 72 })
    p.text(`${kota || '...........'}, ${tgl()}`, { align: 'right', after: 14 })
    p.text('Perihal : Lamaran Pekerjaan', { font: 'b', after: 14 })
    p.text(`Kepada Yth.\nHRD ${perusahaan}\ndi tempat`, { after: 14 })
    p.text('Dengan hormat,', { after: 8 })
    p.text(`Berdasarkan informasi lowongan yang saya ketahui, saya bermaksud mengajukan diri untuk mengisi posisi ${posisi} di ${perusahaan}. Adapun data diri saya:`, { lh: 1.55, after: 8 })
    kv(p, [['Nama', nama], ['Pendidikan', pendidikan], ['Keahlian', skill]], 90)
    p.text(`Saya memiliki ketertarikan yang besar terhadap bidang ini serta kemampuan bekerja secara mandiri maupun dalam tim. Saya berkomitmen untuk bekerja dengan disiplin, jujur, dan bertanggung jawab, serta bersedia belajar dan berkembang bersama ${perusahaan}.`, { lh: 1.55, after: 10 })
    p.text('Sebagai bahan pertimbangan, bersama surat ini saya lampirkan:', { after: 4 })
    p.text('1. Curriculum Vitae (CV)\n2. Fotokopi ijazah dan transkrip nilai terakhir\n3. Fotokopi KTP\n4. Pas foto terbaru\n5. Sertifikat pendukung (jika ada)', { lh: 1.5, after: 10 })
    p.text('Besar harapan saya untuk dapat diberi kesempatan wawancara agar dapat menjelaskan lebih lanjut mengenai kemampuan saya. Atas perhatian Bapak/Ibu, saya ucapkan terima kasih.', { lh: 1.55, after: 22 })
    p.text('Hormat saya,', { x: p.left + p.width - 160, width: 160, after: 46 })
    p.text(nama, { font: 'b', x: p.left + p.width - 160, width: 160 })
    return p.save()
  }

  async function cv({ nama, jabatan, kontak, ringkasan, skill, kerja, sekolah }) {
    const ctx = await create()
    const side = 190
    const p = new Pen(ctx, { top: 50, left: side + 28, right: 36, bottom: 50 })
    const pageStyle = (page) => page.drawRectangle({ x: 0, y: 0, width: side, height: p.H, color: hex(ctx.rgb, '#1d2b55') })
    pageStyle(p.page)
    const sp = { page: p.page }
    let sy = p.H - 60
    const sTxt = (t, size, font, color, gap = 3) => {
      const lines = pdfdoc.wrap(ctx.F[font], size, side - 44, t)
      for (const ln of lines) { sp.page.drawText(ln, { x: 22, y: sy - size, size, font: ctx.F[font], color: hex(ctx.rgb, color) }); sy -= size * 1.4 }
      sy -= gap
    }
    sTxt(nama, 20, 'b', '#ffffff', 2)
    sTxt(jabatan, 11, 'r', '#9fb0d8', 18)
    if (kontak.length) { sTxt('KONTAK', 10, 'b', '#f6d365', 4); kontak.forEach((k) => sTxt(k, 9.5, 'r', '#ffffff', 2)); sy -= 14 }
    if (skill.length) { sTxt('KEAHLIAN', 10, 'b', '#f6d365', 4); skill.forEach((k) => sTxt(`- ${k}`, 9.5, 'r', '#ffffff', 2)) }
    p.y = p.H - 56
    const head = (t) => { p.gap(6); p.text(t, { size: 12.5, font: 'b', color: '#1d2b55', lh: 1.2, after: 2 }); p.line('#1d2b55', 1.2, 8) }
    if (ringkasan) { head('PROFIL'); p.text(ringkasan, { size: 10, lh: 1.5, after: 8 }) }
    if (kerja.length) {
      head('PENGALAMAN')
      for (const k of kerja) {
        p.text(k.title, { size: 11, font: 'b', lh: 1.3 })
        if (k.meta) p.text(k.meta, { size: 9, color: '#666666', font: 'i', lh: 1.3 })
        if (k.desc) p.text(k.desc, { size: 9.5, lh: 1.45 })
        p.gap(8)
      }
    }
    if (sekolah.length) {
      head('PENDIDIKAN')
      for (const k of sekolah) {
        p.text(k.title, { size: 11, font: 'b', lh: 1.3 })
        if (k.meta) p.text(k.meta, { size: 9, color: '#666666', font: 'i', lh: 1.3 })
        if (k.desc) p.text(k.desc, { size: 9.5, lh: 1.45 })
        p.gap(8)
      }
    }
    return p.save()
  }
  function parseEntries(str) {
    return str.split(/\s*;\s*|\n/).map((s) => s.trim()).filter(Boolean).slice(0, 8).map((s) => {
      const [head, ...d] = s.split(':')
      const [role, org] = head.split('@').map((x) => x.trim())
      const m = role.match(/^(\d{4}(?:\s*[-–]\s*(?:\d{4}|sekarang|now))?)\s+(.*)$/i)
      return { title: (m ? m[2] : role).slice(0, 80), meta: [org, m ? m[1] : ''].filter(Boolean).join('  |  '), desc: d.join(':').trim() }
    })
  }
  const list = (s) => (s || '').split(/[,;]\s*/).map((x) => x.trim()).filter(Boolean).slice(0, 14)

  const specs = {
    kwitansi: { desc: 'Buat kwitansi PDF lengkap dengan terbilang otomatis', usage: '<dari siapa> | <jumlah> | <untuk pembayaran> | [nama penerima] | [kota]', example: 'Budi Santoso | 2,5jt | Pembayaran jasa desain logo | Andi | Bandung', args: true, heavy: true, run: async (c) => {
      const [dari, jml, untuk, penerima, kota] = parts(c, 3, '<dari siapa> | <jumlah> | <untuk pembayaran> | [penerima] | [kota]')
      const jumlah = parseMoney(jml)
      if (!jumlah || jumlah <= 0 || jumlah >= 1e12) throw bad('Jumlah tidak valid. Contoh: 2,5jt, 750rb, 1.500.000')
      return out(await kwitansi({ dari: dari.slice(0, 80), jumlah, untuk: untuk.slice(0, 220), penerima: (penerima || '').slice(0, 40), kota: (kota || '').slice(0, 30) }), `kwitansi-${fileName(dari)}`, `🧾 Kwitansi ${rp(jumlah)}\n_${cap(terbilang(jumlah))} rupiah_`)
    } },
    invoice: { desc: 'Buat invoice/tagihan PDF dengan tabel item, diskon, PPN, dan terbilang', usage: '<klien> | <item x jml @harga; item2 @harga> | [diskon%] | [PPN%] | [nama usahamu]', example: 'Budi | Desain logo x1 @500rb; Revisi x2 @100rb | 0 | 11 | Studio Kreatif', args: true, heavy: true, run: async (c) => {
      const [klien, its, dsk, ppn, dari] = parts(c, 2, '<klien> | <item x jml @harga; …> | [diskon%] | [PPN%] | [usahamu]')
      const diskon = Math.min(100, Math.max(0, Number(String(dsk || 0).replace(',', '.')) || 0))
      const pajak = Math.min(100, Math.max(0, Number(String(ppn || 0).replace(',', '.')) || 0))
      const r = await invoice({ klien: klien.slice(0, 60), items: parseItems(its), diskon, pajak, dari: (dari || '').slice(0, 60) })
      return out(r.buffer, `invoice-${fileName(klien)}`, `🧾 Invoice untuk ${klien}\nTotal: *${rp(r.total)}*`)
    } },
    suratizin: { desc: 'Surat izin tidak masuk (sekolah/kerja) siap cetak', usage: '<nama> | <kelas/jabatan> | <alasan> | <tanggal izin> | [ditujukan ke] | [kota]', example: 'Rina Putri | Kelas XI IPA 2 | sakit demam | Senin, 12 Oktober 2026 | Wali Kelas | Bandung', args: true, heavy: true, run: async (c) => {
      const [nama, kelas, alasan, tanggal, tujuan, kota] = parts(c, 4, '<nama> | <kelas/jabatan> | <alasan> | <tanggal> | [tujuan] | [kota]')
      return out(await suratIzin({ nama: nama.slice(0, 50), kelas: kelas.slice(0, 40), alasan: alasan.slice(0, 160), tanggal: tanggal.slice(0, 60), tujuan: tujuan || 'Bapak/Ibu Guru', kota: (kota || '').slice(0, 30) }), `surat-izin-${fileName(nama)}`, '✉️ Surat izin siap dicetak & ditandatangani.')
    } },
    suratlamaran: { desc: 'Surat lamaran kerja formal siap cetak (lengkap daftar lampiran)', usage: '<nama> | <posisi> | <perusahaan> | <pendidikan> | <keahlian> | [kota]', example: 'Rina Putri | Staf Administrasi | PT Maju Jaya | S1 Manajemen | Microsoft Office, komunikasi | Jakarta', args: true, heavy: true, run: async (c) => {
      const [nama, posisi, perusahaan, pendidikan, skill, kota] = parts(c, 5, '<nama> | <posisi> | <perusahaan> | <pendidikan> | <keahlian> | [kota]')
      return out(await suratLamaran({ nama: nama.slice(0, 50), posisi: posisi.slice(0, 60), perusahaan: perusahaan.slice(0, 60), pendidikan: pendidikan.slice(0, 80), skill: skill.slice(0, 120), kota: (kota || '').slice(0, 30) }), `surat-lamaran-${fileName(nama)}`, '📄 Surat lamaran siap dicetak. Sesuaikan isi bila perlu (ini template umum).')
    } },
    cv: { desc: 'Buat CV 1-2 halaman rapi (sidebar kontak & keahlian). Pisahkan entri dengan titik koma', usage: '<nama> | <jabatan> | <telp, email, kota> | <ringkasan> | <skill1, skill2> | <2022-2024 Posisi @ Perusahaan: tugas; …> | <2018-2022 S1 Jurusan @ Kampus>', example: 'Rina Putri | Desainer Grafis | 0812-1111-2222, rina@mail.com, Bandung | Desainer 3 tahun pengalaman branding | Photoshop, Illustrator, Figma | 2023-sekarang Desainer @ Studio Maju: membuat identitas visual klien; 2021-2023 Junior Desainer @ Agensi Kreasi: desain konten sosial media | 2017-2021 S1 DKV @ Universitas Pasundan', args: true, heavy: true, run: async (c) => {
      const [nama, jabatan, kontak, ringkasan, skill, kerja, sekolah] = parts(c, 2, '<nama> | <jabatan> | <kontak> | <ringkasan> | <skill> | <pengalaman> | <pendidikan>')
      return out(await cv({ nama: nama.slice(0, 40), jabatan: jabatan.slice(0, 50), kontak: list(kontak), ringkasan: (ringkasan || '').slice(0, 500), skill: list(skill), kerja: parseEntries(kerja || ''), sekolah: parseEntries(sekolah || '') }), `cv-${fileName(nama)}`, '📇 CV siap. Tips: isi tiap bagian lebih lengkap lewat perintah yang sama, pisahkan beberapa pengalaman dengan titik koma (;).')
    } }
  }

async function handler(m, { conn, sock, text, args, usedPrefix = '.', command = 'kwitansi' }) {
  const client = conn || sock
  const cmd = (command || '').toLowerCase()
  const spec = specs[cmd]
  if (!spec) {
    const list = Object.entries(specs).map(([k, v]) => `• \`${usedPrefix + k}\` — ${v.desc}`).join('\n')
    return m.reply(`📄 *GENERATOR DOKUMEN PDF*\n\n${list}`)
  }

  const rawBody = `${usedPrefix + cmd} ${text || (args || []).join(' ')}`.trim()
  if (spec.args && !(text || (args && args.length))) {
    return m.reply(
      `📄 *${cmd.toUpperCase()}*\n${spec.desc}\n\n` +
      `📌 *Format:*\n\`${usedPrefix + cmd} ${spec.usage}\`\n\n` +
      `💡 *Contoh:*\n\`${usedPrefix + cmd} ${spec.example}\``
    )
  }

  await m.react('⏳')
  try {
    const res = await spec.run({
      body: rawBody,
      prefix: usedPrefix,
      command: cmd,
      args: args || [],
      sender: m.sender,
      sock: client,
      msg: m
    })

    if (typeof res === 'string') {
      await m.react('✅')
      return m.reply(res)
    }
    if (res?.documents?.length) {
      for (const doc of res.documents) {
        await client.sendMessage(
          m.chat,
          {
            document: doc.buffer,
            fileName: doc.name,
            mimetype: doc.mime || 'application/pdf',
            caption: doc.caption || ''
          },
          { quoted: m }
        )
      }
    }
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ ${e.userMessage || e.message}`)
  }
}

export { pluginConfig as config, handler }
