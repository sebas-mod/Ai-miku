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
    if (!url) throw `Ejemplo: ${usedPrefix + command} https://drive.google.com/file/d/xxxxxxxxx/view`

    const fileId = await extractGDrive(url)
    if (!fileId) throw '¡URL de Google Drive no válida!'

    try {
      const apiKey = 'AIzaSyAA9ERw-9LZVEohRYtCWka_TQc6oXmvcVU'
      const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,size,mimeType&key=${apiKey}`
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`

      const metadata = await axios.get(metaUrl)
      const { name, size, mimeType } = metadata.data

      m.reply(`Descargando archivo...\n\n• Nombre: ${name}\n• Tamaño: ${await formatSize(size)}\n• Tipo: ${mimeType}`)

      const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })

      if (res.status !== 200) {
        throw `Error al descargar el archivo: ${res.status} ${res.statusText}`
      }

      const buffer = Buffer.from(res.data, 'binary')
      const tmpPath = path.join(tmpdir(), name)
      writeFileSync(tmpPath, buffer)

      await conn.sendMessage(m.chat, {
        document: { url: tmpPath },
        fileName: name,
        mimetype: mimeType || 'application/octet-stream',
        caption: `¡Archivo descargado!\n\n• Nombre: ${name}\n• Tamaño: ${await formatSize(size)}`
      }, { quoted: m })
    } catch (err) {
      console.error(err)
      throw typeof err === 'string' ? err : `Ocurrió un error: ${err.response?.status} ${err.response?.statusText}`
    }
  }

export { pluginConfig as config, handler }
