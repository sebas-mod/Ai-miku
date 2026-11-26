/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'
import fs from 'fs'
import https from 'https'
import http from 'http'
import FormData from 'form-data'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const te = ElysiaRuntime.te;

  const pluginConfig = {
      name: "iqc",
      alias: [],
      category: "maker",
      description: "Membuat Fake Quote iOS style secara instan.",
      usage: ".iqc [text/reply]",
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 5,
      energi: 2,
      isEnabled: true,
  };

  async function handler(m, { sock, text }) {
      try {
          const targetText = text || (m.quoted && m.quoted.text ? m.quoted.text : "");

          if (!targetText) {
              let help = `💬 *FUNCIÓN DE CITA FALSA DE iOS*\n\n`
              help += `Sirve para crear imágenes de citas elegantes al estilo iOS muy rápido.\n\n`
              help += `*Cómo usar:*\n`
              help += `- Escribe *${m.prefix}iqc <tu texto>*\n`
              help += `- O responde a un mensaje de texto de otra persona con *${m.prefix}iqc*\n\n`
              help += `_¡Ese mensaje se convertirá automáticamente en una cita genial!_`
              return m.reply(help)
          }

          await m.react('🕕');

          const apiUrl = `https://my.izuka-api.xyz/api/canvas/iqc?text=${encodeURIComponent(targetText)}`

          await sock.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });

          await m.react('✅');
      } catch (error) {
          console.error("[IQC Plugin Error]", error)
          await m.react('❌')
          m.reply(`Lo siento, hubo un error al crear la imagen de la cita. Inténtalo de nuevo en un momento.`)
      }
  }

export { pluginConfig as config, handler }
