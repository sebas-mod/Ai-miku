/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import path from 'path'
import fs, { writeFileSync } from 'fs'
import axios from 'axios'
import os, { tmpdir } from 'os'

const pluginConfig = {
    name: "drivedl",
    alias: [],
    category: "download",
    description: "drivedl",
    usage: ".drivedl",
    example: ".drivedl",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { args, usedPrefix, command, conn }) {
    const url = args[0]
    if (!url) throw `Contoh: ${usedPrefix + command} https://drive.google.com/file/d/xxxxxxxxx/view`

    const fileId = await extractGDrive(url)
    if (!fileId) throw 'URL Google Drive tidak valid!'

    try {
      const apiKey = 'AIzaSyAA9ERw-9LZVEohRYtCWka_TQc6oXmvcVU'
      const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,size,mimeType&key=${apiKey}`
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`

      const metadata = await axios.get(metaUrl)
      const { name, size, mimeType } = metadata.data

      m.reply(`Mendownload file...\n\n• Nama: ${name}\n• Ukuran: ${await formatSize(size)}\n• Tipe: ${mimeType}`)

      const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })

      if (res.status !== 200) {
        throw `Gagal mengunduh file: ${res.status} ${res.statusText}`
      }

      const buffer = Buffer.from(res.data, 'binary')
      const tmpPath = path.join(tmpdir(), name)
      writeFileSync(tmpPath, buffer)

      await conn.sendMessage(m.chat, {
        document: { url: tmpPath },
        fileName: name,
        mimetype: mimeType || 'application/octet-stream',
        caption: `File berhasil diunduh!\n\n• Nama: ${name}\n• Ukuran: ${await formatSize(size)}`
      }, { quoted: m })
    } catch (err) {
      console.error(err)
      throw typeof err === 'string' ? err : `Terjadi kesalahan: ${err.response?.status} ${err.response?.statusText}`
    }
  }

export { pluginConfig as config, handler }
