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
import fs from 'fs'
import axios from 'axios'
import os, { tmpdir } from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'

const TeraBoxDL = MikuRuntime.TeraBoxDL;

  const exec = promisify(execFile);

  const pluginConfig = {
    name: "terabox",
    alias: [],
    category: "download",
    description: "Descarga videos/archivos de TeraBox",
    usage: ".terabox <url>",
    example: ".terabox https://terabox.com/s/xxx",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 2,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    const text = m.text?.trim();
    if (!text) {
      m.react("❌");
      return m.reply(
        `📦 *TeraBox Downloader*\n\n` +
          `Descarga videos o archivos de TeraBox.\n\n` +
          `*USO:*\n` +
          `> *${m.prefix}terabox <link>*\n\n` +
          `*EJEMPLO:*\n` +
          `> *${m.prefix}terabox https://terabox.com/s/xxx*\n\n` +
          `_Archivo enviado como documento, puede tardar un poco_`,
      );
    }

    m.react("🕕");

    try {
      const result = await TeraBoxDL(text);

      if (!result.status) {
        m.react("☢");
        return m.reply(`❌ *TeraBox falló*\n\n> ${result.error}`);
      }

      let caption =
        `📦 *TeraBox*\n\n` +
        `> 📌 ${result.file_name}\n` +
        `> 📏 Size: ${result.file_size}\n` +
        `> ⏱️ Duración: ${result.duration}`;

      if (result.thumbnail) {
        await sock.sendMedia(m.chat, result.thumbnail, caption, m, {
          type: "image",
        });
      }

      if (result.stream_url && result.stream_url.endsWith(".m3u8")) {
        const tmpFile = path.join(os.tmpdir(), `tb_${Date.now()}.mp4`);

        await exec(
          "ffmpeg",
          [
            "-y",
            "-i",
            result.stream_url,
            "-c",
            "copy",
            "-bsf:a",
            "aac_adtstoasc",
            tmpFile,
          ],
          { timeout: 120000 },
        );

        const buffer = fs.readFileSync(tmpFile);
        fs.unlinkSync(tmpFile);

        await sock.sendMessage(
          m.chat,
          {
            document: buffer,
            mimetype: "video/mp4",
            fileName:
              (result.file_name || "video").replace(/[<>:"/\\|?*]/g, "") + ".mp4",
            caption,
          },
          { quoted: m },
        );
      } else if (result.download_url) {
        const res = await axios.get(result.download_url, {
          responseType: "arraybuffer",
          timeout: 120000,
          maxContentLength: 200 * 1024 * 1024,
        });

        const ext = result.extension || ".mp4";
        const fileName =
          (result.file_name || "file").replace(/[<>:"/\\|?*]/g, "") + ext;

        await sock.sendMessage(
          m.chat,
          {
            document: Buffer.from(res.data),
            mimetype: "application/zip",
            fileName,
            caption,
          },
          { quoted: m },
        );
      }

      m.react("✅");
    } catch (e) {
      console.error(e);
      m.react("☢");
      m.reply("❌ Error al obtener los datos de TeraBox, inténtalo más tarde");
    }
  }

export { pluginConfig as config, handler }
