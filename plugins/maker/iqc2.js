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
      name: "iqc2",
      alias: [],
      category: "maker",
      description: "Membuat Fake Quote iOS style dengan informasi baterai dan provider.",
      usage: ".iqc2 [text/reply]",
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
              return m.reply(
                  `Hola *${m.pushName}*, parece que aún no has escrito el texto.\n\n` +
                  `Usa el comando con el formato:\n` +
                  `- .iqc2 <tu texto>\n` +
                  `- O responde a un mensaje de otra persona con .iqc2`
              );
          }

          await m.react('🕕');

          const providers = ["INDOSAT", "TELKOMSEL", "XL", "TRI", "SMARTFREN", "WIFI"];
          const randomProvider = providers[Math.floor(Math.random() * providers.length)];

          const now = new Date();
          const jam = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).replace('.', ':');

          const randomBaterai = Math.floor(Math.random() * (100 - 10 + 1)) + 10;

          const apiUrl = `https://api.nexray.eu.cc/maker/v1/iqc?text=${encodeURIComponent(targetText)}&provider=${encodeURIComponent(randomProvider)}&jam=${encodeURIComponent(jam)}&baterai=${randomBaterai}`;

          await sock.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });

          await m.react('✅');
      } catch (error) {
          console.error("[IQC2 Plugin Error]", error);
          await m.react('❌');
          m.reply(`Lo siento *${m.pushName}*, hubo un error al crear la imagen de la cita. Inténtalo de nuevo en un momento.`);
      }
  }

export { pluginConfig as config, handler }
