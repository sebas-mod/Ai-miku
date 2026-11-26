/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
const elysiaGlobal = ElysiaRuntime.elysiaGlobal;
import { createRequire } from 'module'
import { URL } from 'url'

const pluginConfig = {
    name: "getweb",
    alias: [],
    category: "tools",
    description: "getweb <url>",
    usage: ".getweb <url>",
    example: ".getweb <url>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const axios = (__m => __m.default ?? __m)((await import('axios')))
  const cheerio = (await import('cheerio'))
const fs = (__m => __m.default ?? __m)((await import('fs')))
  const path = (__m => __m.default ?? __m)((await import('path')))
const require = createRequire(import.meta.url);
  const archiver = require('archiver');

  async function handler(m, { conn, sock, text, args, usedPrefix, command, reply }) {
      const client = conn || sock || elysiaGlobal.mainSock;

      if (!args[0]) {
          return reply(`Ayang nakal~ Masukin URL-nya dong! 💋\n\n*Contoh:* \n${usedPrefix + command} https://example.com`);
      }

      let targetUrl = args[0].trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = 'https://' + targetUrl;
      }

      await reply('Uy, dame un momento... Angela está buceando y descargando todos los recursos de la web para ti 💦');

      const tmpDir = path.join(process.cwd(), 'database', 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const domainName = new URL(targetUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const zipPath = path.join(tmpDir, `${domainName}_${Date.now()}.zip`);

      try {
          const res = await axios.get(targetUrl, {
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
              },
              timeout: 20000
          });

          const html = res.data;
          const $ = cheerio.load(html);

          const output = fs.createWriteStream(zipPath);
          const archive = archiver('zip', { zlib: { level: 9 } });

          const streamPromise = new Promise((resolve, reject) => {
              output.on('close', resolve);
              archive.on('error', reject);
          });

          archive.pipe(output);

          archive.append(html, { name: 'index.html' });

          const assetUrls = new Set();
          $('link[rel="stylesheet"]').each((_, el) => {
              const href = $(el).attr('href');
              if (href) assetUrls.add(href);
          });
          $('script[src]').each((_, el) => {
              const src = $(el).attr('src');
              if (src) assetUrls.add(src);
          });
          $('img[src]').each((_, el) => {
              const src = $(el).attr('src');
              if (src) assetUrls.add(src);
          });

          for (const asset of assetUrls) {
              try {
                  const resolvedUrl = new URL(asset, targetUrl).href;
                  const assetRes = await axios.get(resolvedUrl, {
                      responseType: 'arraybuffer',
                      timeout: 8000
                  });
                  const parsed = new URL(resolvedUrl);
                  let assetPath = parsed.pathname.replace(/^\//, '');
                  if (!assetPath) assetPath = 'asset_' + Date.now();
                  archive.append(Buffer.from(assetRes.data), { name: assetPath });
              } catch {
              }
          }

          await archive.finalize();
          await streamPromise;

          const fileBuffer = fs.readFileSync(zipPath);
          const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);

          await client.sendMessage(m.chat, {
              document: fileBuffer,
              mimetype: 'application/zip',
              fileName: `${domainName}.zip`,
              caption: `💋 *Web Clone Berhasil Diserap!*\n\n🌐 *Target:* ${targetUrl}\n📦 *Ukuran:* ${fileSizeMB} MB\n\n_Semua beres buat Mas ganteng tercinta~_`
          }, { quoted: m });
      } catch (err) {
          console.error('[GETWEB ERROR]', err);
          return reply(`Ay, no se pudo descargar la web 🥺\nError: ${err.message || 'el servidor de destino está caído/520'}`);
      } finally {
          try {
              if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
          } catch {}
      }
  };

export { pluginConfig as config, handler }
