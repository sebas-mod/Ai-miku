/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: "alight",
    alias: ["amlist", "amdrive", "amlink", "ampreset", "amtiktok"],
    category: "premium",
    description: "Katalog dan pengunduh preset Alight Motion XML",
    usage: ".alight | .amlist | .ampreset <nama>",
    example: ".amlist 1",
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const BASE = 'https://am.zervida.my.id'
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'

const HEADERS = {
  'User-Agent': UA,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
  'Referer': BASE + '/',
  'Origin': BASE
}

async function fetchPresets() {
  const res = await fetch(`${BASE}/api/presets`, { headers: HEADERS })
  const data = await res.json()
  if (!data.success) throw new Error('Gagal mengambil daftar preset dari server.')
  return data.presets || []
}

async function fetchPresetPage(presetName) {
  const res = await fetch(`${BASE}/preset/${encodeURIComponent(presetName)}`, {
    headers: { ...HEADERS, Accept: 'text/html' }
  })
  if (!res.ok) throw new Error(`Preset "${presetName}" tidak ditemukan.`)
  const html = await res.text()

  const amLinkMatch = html.match(/href="(https:\/\/alight\.link\/[^"]+)"/)
  const amXmlMatch = html.match(/https:\/\/alightcreative\.com\/am\/share\/([^\s"'<>]+)/)
  const driveMatch = html.match(/https:\/\/drive\.google\.com\/file\/d\/([^/"'<>]+)\/view/)
  const tiktokMatch = html.match(/https:\/\/vt\.tiktok\.com\/[^\s"'<>]+|https:\/\/www\.tiktok\.com\/@[^\s"'<>]+/)
  const videoMatch = html.match(/src="(\/presets\/[^"]+\.mp4)"/)
  const titleMatch = html.match(/<title>([^<]+)<\/title>/)

  return {
    title: titleMatch ? titleMatch[1].replace(/\s*-\s* Preset AM.*$/i, '').trim() : presetName,
    amLink: amLinkMatch ? amLinkMatch[1] : null,
    amPkg: amXmlMatch ? amXmlMatch[0] : null,
    driveId: driveMatch ? driveMatch[1] : null,
    driveUrl: driveMatch ? `https://drive.google.com/file/d/${driveMatch[1]}/view` : null,
    tiktokUrl: tiktokMatch ? tiktokMatch[0] : null,
    previewUrl: videoMatch ? `${BASE}${videoMatch[1]}` : null
  }
}

async function convertAmLink(url) {
  const res = await fetch(`${BASE}/api/project-xml`, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Gagal mengonversi link Alight Motion.')
  return data
}

async function downloadDriveXml(urlOrId) {
  const res = await fetch(`${BASE}/api/drive-xml?url=${encodeURIComponent(urlOrId)}`, {
    headers: HEADERS
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Gagal mengambil XML dari Google Drive (${res.status}).`)
  }
  const filename = (res.headers.get('content-disposition') || '')
    .match(/filename="?([^";\n]+)"?/)?.[1] || `preset_${Date.now()}.xml`
  const buffer = Buffer.from(await res.arrayBuffer())
  return { buffer, filename }
}

async function downloadTiktokPreview(tiktokUrl) {
  const res = await fetch(`${BASE}/api/tiktok?url=${encodeURIComponent(tiktokUrl)}`, {
    headers: HEADERS
  })
  const data = await res.json()
  if (!data.success || !data.videoUrl) throw new Error(data.error || 'Gagal mengambil video TikTok.')

  const vidRes = await fetch(data.videoUrl, { headers: { 'User-Agent': UA } })
  if (!vidRes.ok) throw new Error('Gagal mengunduh stream video TikTok.')
  const buffer = Buffer.from(await vidRes.arrayBuffer())
  return { buffer, title: data.title || 'Preview TikTok' }
}

async function downloadDirectPreview(previewUrl) {
  const res = await fetch(previewUrl, { headers: HEADERS })
  if (!res.ok) throw new Error('Gagal mengunduh video preview.')
  return Buffer.from(await res.arrayBuffer())
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

async function handler(m, ctx = {}) {
  const { conn, sock } = ctx;
  const args = ctx.args || m.args || [];
  const usedPrefix = ctx.usedPrefix || m.prefix || '.';
  const command = String(ctx.command || m.command || 'alight').toLowerCase();
  const client = conn || sock
  const sub = command === 'alight' ? (args[0] || '').toLowerCase() : command
  const restArgs = command === 'alight' ? args.slice(1) : args

  if (sub === 'amlist' || sub === 'list') {
    await m.react('⏳')
    try {
      const presets = await fetchPresets()
      if (!presets.length) return m.reply('⚠️ Belum ada preset yang tersedia saat ini.')

      const page = Math.max(1, parseInt(restArgs[0]) || 1)
      const perPage = 10
      const total = presets.length
      const pages = Math.ceil(total / perPage)
      const slice = presets.slice((page - 1) * perPage, page * perPage)

      let txt = `✨ *DAFTAR PRESET ALIGHT MOTION* ✨\n`
      txt += `Halaman *${page}/${pages}* • Total *${total}* Preset\n\n`

      slice.forEach((p, i) => {
        const idx = (page - 1) * perPage + i + 1
        txt += `*${idx}. ${p.name}*\n`
        if (p.author) txt += `   ∘ Kreator : ${p.author}\n`
        if (p.tiktokUrl) txt += `   ∘ TikTok : ${p.tiktokUrl}\n`
        txt += `   ∘ Ambil : \`${usedPrefix}ampreset ${p.name}\`\n\n`
      })

      if (page < pages) {
        txt += `💡 Ketik \`${usedPrefix}amlist ${page + 1}\` untuk halaman berikutnya.`
      }

      await m.react('✅')
      return m.reply(txt.trim())
    } catch (e) {
      await m.react('❌')
      return m.reply(`❌ *Gagal:* ${e.message}`)
    }
  }

  if (sub === 'ampreset' || sub === 'preset') {
    const query = restArgs.join(' ').trim()
    if (!query) {
      return m.reply(
        `❓ *Format Penggunaan:*\n` +
        `\`${usedPrefix}ampreset <nama preset>\`\n\n` +
        `Cek daftar preset dengan \`${usedPrefix}amlist\``
      )
    }

    await m.react('⏳')
    try {
      let targetName = query
      let presetMeta = null
      try {
        const all = await fetchPresets()
        const found = all.find(
          (p) => p.name.toLowerCase() === query.toLowerCase() ||
                 p.name.toLowerCase().includes(query.toLowerCase())
        )
        if (found) {
          targetName = found.name
          presetMeta = found
        }
      } catch {}

      const info = await fetchPresetPage(targetName)

      let caption = `🎬 *PRESET ALIGHT MOTION*\n\n`
      caption += `• *Nama* : ${info.title}\n`
      if (presetMeta?.author) caption += `• *Kreator* : ${presetMeta.author}\n`
      if (info.amLink) caption += `• *AM Link* : ${info.amLink}\n`
      if (info.driveUrl) caption += `• *Google Drive* : ${info.driveUrl}\n`
      if (info.tiktokUrl) caption += `• *TikTok* : ${info.tiktokUrl}\n`

      let previewBuffer = null
      if (info.previewUrl) {
        try { previewBuffer = await downloadDirectPreview(info.previewUrl) } catch {}
      }
      if (!previewBuffer && (info.tiktokUrl || presetMeta?.tiktokUrl)) {
        try {
          const tt = await downloadTiktokPreview(info.tiktokUrl || presetMeta.tiktokUrl)
          previewBuffer = tt.buffer
        } catch {}
      }

      if (previewBuffer) {
        await client.sendMessage(m.chat, { video: previewBuffer, caption, mimetype: 'video/mp4' }, { quoted: m })
      } else {
        await m.reply(caption)
      }

      let xmlBuffer = null
      let xmlName = `${targetName.replace(/[^a-zA-Z0-9_-]/g, '_')}.xml`

      if (info.amLink || info.amPkg) {
        try {
          const conv = await convertAmLink(info.amLink || info.amPkg)
          if (conv.xml) {
            xmlBuffer = Buffer.from(conv.xml, 'utf-8')
            if (conv.title) xmlName = `${conv.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.xml`
          }
        } catch {}
      }

      if (!xmlBuffer && info.driveId) {
        try {
          const drv = await downloadDriveXml(info.driveId)
          xmlBuffer = drv.buffer
          xmlName = drv.filename
        } catch {}
      }

      if (xmlBuffer) {
        await client.sendMessage(
          m.chat,
          {
            document: xmlBuffer,
            mimetype: 'application/xml',
            fileName: xmlName,
            caption: `📄 *File XML:* ${xmlName} (${formatBytes(xmlBuffer.length)})`
          },
          { quoted: m }
        )
      }

      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      return m.reply(`❌ *Gagal:* ${e.message}`)
    }
    return
  }

  if (sub === 'amlink' || sub === 'link' || sub === 'xml') {
    const url = restArgs[0] || (m.quoted?.text || '').trim()
    if (!url || !/alight\.link|alightcreative\.com/i.test(url)) {
      return m.reply(
        `❓ *Format Penggunaan:*\n` +
        `\`${usedPrefix}amlink <url alight.link / alightcreative.com>\`\n\n` +
        `Contoh:\n\`${usedPrefix}amlink https://alight.link/xxxx\``
      )
    }

    await m.react('⏳')
    try {
      const data = await convertAmLink(url)
      if (!data.xml) throw new Error('Data XML kosong dari project ini.')

      const xmlBuffer = Buffer.from(data.xml, 'utf-8')
      const safeTitle = (data.title || 'preset_am').replace(/[^a-zA-Z0-9_-]/g, '_')
      const fileName = `${safeTitle}.xml`

      let caption = `✅ *KONVERSI ALIGHT LINK BERHASIL*\n\n`
      caption += `• *Judul* : ${data.title || '-'}\n`
      if (data.info) {
        if (data.info.amVersion) caption += `• *Versi AM* : ${data.info.amVersion}\n`
        if (data.info.fps) caption += `• *FPS* : ${data.info.fps}\n`
        if (data.info.resolution) caption += `• *Resolusi* : ${data.info.resolution}\n`
        if (data.info.totalSize) caption += `• *Ukuran Proyek* : ${formatBytes(data.info.totalSize)}\n`
      }
      caption += `• *Ukuran XML* : ${formatBytes(xmlBuffer.length)}`

      await client.sendMessage(
        m.chat,
        { document: xmlBuffer, mimetype: 'application/xml', fileName, caption },
        { quoted: m }
      )
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      return m.reply(`❌ *Gagal:* ${e.message}`)
    }
    return
  }

  if (sub === 'amdrive' || sub === 'drive') {
    const input = restArgs[0] || (m.quoted?.text || '').trim()
    if (!input) {
      return m.reply(
        `❓ *Format Penggunaan:*\n` +
        `\`${usedPrefix}amdrive <url Google Drive / File ID>\`\n\n` +
        `Contoh:\n\`${usedPrefix}amdrive https://drive.google.com/file/d/xxxx/view\``
      )
    }

    await m.react('⏳')
    try {
      const { buffer, filename } = await downloadDriveXml(input)
      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: 'application/xml',
          fileName: filename.endsWith('.xml') ? filename : `${filename}.xml`,
          caption: `📄 *GOOGLE DRIVE XML*\n• *Nama File* : ${filename}\n• *Ukuran* : ${formatBytes(buffer.length)}`
        },
        { quoted: m }
      )
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      return m.reply(`❌ *Gagal:* ${e.message}`)
    }
    return
  }

  if (sub === 'amtiktok' || sub === 'tiktok' || sub === 'tt') {
    const url = restArgs[0] || (m.quoted?.text || '').trim()
    if (!url || !/tiktok\.com/i.test(url)) {
      return m.reply(
        `❓ *Format Penggunaan:*\n` +
        `\`${usedPrefix}amtiktok <url TikTok>\``
      )
    }

    await m.react('⏳')
    try {
      const { buffer, title } = await downloadTiktokPreview(url)
      await client.sendMessage(
        m.chat,
        { video: buffer, mimetype: 'video/mp4', caption: `🎥 *${title}*` },
        { quoted: m }
      )
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      return m.reply(`❌ *Gagal:* ${e.message}`)
    }
    return
  }

  return m.reply(
    `✨ *MENU ALIGHT MOTION TOOLS* ✨\n\n` +
    `• \`${usedPrefix}amlist [hal]\` — Lihat katalog preset AM\n` +
    `• \`${usedPrefix}ampreset <nama>\` — Unduh video preview + XML preset\n` +
    `• \`${usedPrefix}amlink <url>\` — Konversi link \`alight.link\` ke XML\n` +
    `• \`${usedPrefix}amdrive <url/id>\` — Unduh file XML dari Google Drive\n` +
    `• \`${usedPrefix}amtiktok <url>\` — Unduh video preview TikTok\n\n` +
    `_Powered by Ai Miku_`
  )
}

export { pluginConfig as config, handler }
