/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { execFile } from 'node:child_process'

const pluginConfig = {
    name: "stabilize",
    alias: [],
    category: "tools",
    description: "Fitur tools stabilize",
    usage: ".stabilize",
    example: ".stabilize",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const fs = (__m => __m.default ?? __m)((await import('node:fs')))
  const path = (__m => __m.default ?? __m)((await import('node:path')))
  const os = (__m => __m.default ?? __m)((await import('node:os')))
  const crypto = (__m => __m.default ?? __m)((await import('node:crypto')))
const { promisify } = (await import('node:util'))

  const execFileAsync = promisify(execFile);

  const formatBytes = (bytes, decimals = 2) => {
      if (!bytes || bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
      const sec = Math.floor(seconds || 0);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      if (h > 0) return `${h} jam ${m} mnt ${s} dtk`;
      if (m > 0) return `${m} mnt ${s} dtk`;
      return `${s} detik`;
  };

  async function handler(m, { sock, conn, args, text, usedPrefix, command, reply }) {
      const client = sock || conn;
      const q = m.quoted ? m.quoted : m;
      const mime = (q.msg || q).mimetype || q.mtype || '';

      if (!/video|gif/.test(mime)) {
          return reply(
              `🎬 *VIDEO STABILIZER (NATURAL GIMBAL)*\n\n` +
              `Balas atau kirim video/GIF dengan caption:\n` +
              `• \`${usedPrefix + command}\`\n\n` +
              `⚙️ *Pilihan Mode:*\n` +
              `• \`${usedPrefix + command} low\` (Halus/ringan, pertahankan gerak alami)\n` +
              `• \`${usedPrefix + command} normal\` (Sedang / default gimbal natural)\n` +
              `• \`${usedPrefix + command} high\` (Kuat, untuk video lari/goyang kencang)\n` +
              `• \`${usedPrefix + command} tripod\` (Mode kamera diam / static view)\n` +
              `• \`${usedPrefix + command} <angka>\` (Custom smoothing 3–30, contoh: \`${usedPrefix + command} 12\`)\n\n` +
              `_Menggunakan gaussian smoothing natural tanpa distorsi agar video tidak aneh/mabuk._ 🌿`
          );
      }

      let presetName = 'Natural (Normal)';
      let shakiness = 5;
      let accuracy = 15;
      let smoothing = 10;
      let maxshift = 25;
      let maxangle = 0.03;
      let zoom = 2;
      let isTripod = false;

      const opt = (text || '').trim().toLowerCase();
      if (opt === 'low' || opt === 'rendah' || opt === 'ringan' || opt === 'soft') {
          presetName = 'Halus (Low)';
          shakiness = 4;
          smoothing = 6;
          maxshift = 15;
          maxangle = 0.02;
          zoom = 1;
      } else if (opt === 'high' || opt === 'tinggi' || opt === 'kuat' || opt === 'hard') {
          presetName = 'Kuat (High)';
          shakiness = 7;
          smoothing = 16;
          maxshift = 35;
          maxangle = 0.04;
          zoom = 4;
      } else if (opt === 'tripod' || opt === 'statis' || opt === 'diam') {
          presetName = 'Tripod (Virtual Fix)';
          isTripod = true;
          zoom = 3;
      } else if (/^\d+$/.test(opt)) {
          const num = parseInt(opt, 10);
          smoothing = Math.min(30, Math.max(3, num));
          presetName = `Custom (Smoothing ${smoothing})`;
          maxshift = Math.min(40, smoothing * 2.5);
          maxangle = 0.035;
          zoom = Math.min(6, Math.max(1, Math.round(smoothing / 4)));
      }

      reply(global.mess?.wait || '⏳ _Sedang mengunduh dan menstabilkan video secara natural... Mohon tunggu._ 🪄');

      const id = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const tmpDir = os.tmpdir();
      const tmpIn = path.join(tmpDir, `stab_in_${id}.mp4`);
      const trfFile = path.join(tmpDir, `stab_trf_${id}.trf`);
      const tmpOut = path.join(tmpDir, `stab_out_${id}.mp4`);

      try {
          let media;
          if (typeof q.download === 'function') {
              media = await q.download();
          } else if (typeof client?.downloadMediaMessage === 'function') {
              media = await client.downloadMediaMessage(q);
          }

          if (!media || !Buffer.isBuffer(media)) {
              return reply('❌ Gagal mendownload media video. Pastikan video dapat diputar.');
          }

          if (media.length > 50 * 1024 * 1024) {
              return reply('❌ Ukuran video terlalu besar! Maksimal ukuran adalah 50 MB.');
          }

          await fs.promises.writeFile(tmpIn, media);

          let duration = 0;
          try {
              const probeRes = await execFileAsync('ffprobe', [
                  '-v', 'quiet',
                  '-print_format', 'json',
                  '-show_format',
                  '-show_streams',
                  tmpIn
              ]);
              const probeData = JSON.parse(probeRes.stdout || '{}');
              duration = parseFloat(
                  probeData.format?.duration ||
                  (probeData.streams || []).find(s => s.codec_type === 'video')?.duration ||
                  0
              );

              if (duration > 120) {
                  return reply(`❌ Durasi video terlalu panjang (${formatDuration(duration)})!\nMaksimal durasi yang diizinkan adalah 120 detik (2 menit).`);
              }
          } catch (e) {
              console.warn('[STABILIZE PROBE WARN]', e?.message || e);
          }

          await execFileAsync('ffmpeg', [
              '-y',
              '-loglevel', 'error',
              '-i', tmpIn,
              '-vf', `vidstabdetect=stepsize=6:shakiness=${shakiness}:accuracy=${accuracy}:result=${trfFile}`,
              '-f', 'null',
              '-'
          ], { maxBuffer: 10 * 1024 * 1024 });

          if (!fs.existsSync(trfFile)) {
              throw new Error('Gagal menganalisis guncangan video (Pass 1).');
          }

          const transformFilter = isTripod
              ? `vidstabtransform=input=${trfFile}:tripod=1:crop=keep:optzoom=0:zoom=${zoom}:interpol=bilinear`
              : `vidstabtransform=input=${trfFile}:smoothing=${smoothing}:optalgo=gauss:maxshift=${maxshift}:maxangle=${maxangle}:crop=keep:optzoom=0:zoom=${zoom}:interpol=bilinear`;

          await execFileAsync('ffmpeg', [
              '-y',
              '-loglevel', 'error',
              '-i', tmpIn,
              '-vf', transformFilter,
              '-c:v', 'libx264',
              '-preset', 'fast',
              '-crf', '22',
              '-pix_fmt', 'yuv420p',
              '-c:a', 'aac',
              '-b:a', '128k',
              tmpOut
          ], { maxBuffer: 10 * 1024 * 1024 });

          if (!fs.existsSync(tmpOut) || fs.statSync(tmpOut).size === 0) {
              throw new Error('Hasil video stabilisasi kosong atau tidak terbentuk.');
          }

          const outBuffer = await fs.promises.readFile(tmpOut);
          const sizeBefore = formatBytes(media.length);
          const sizeAfter = formatBytes(outBuffer.length);
          const durText = duration > 0 ? ` (${duration.toFixed(1)}s)` : '';

          const caption = `🎬 *VIDEO STABILIZER SUCCESS*\n\n` +
              `• ⚙️ *Mode:* \`${presetName}\`\n` +
              `• 🔄 *Smoothing:* \`${isTripod ? 'Tripod' : smoothing}\`\n` +
              `• 📐 *Zoom Pangkas:* \`${zoom}%\`\n` +
              `• ⏱️ *Durasi:* \`${formatDuration(duration)}${durText}\`\n` +
              `• 📦 *Ukuran:* \`${sizeBefore} ➔ ${sizeAfter}\`\n` +
              `• 🛠️ *Metode:* \`Natural Gaussian (No Distortion)\`\n\n` +
              `_Video lebih stabil dan bebas dari efek goyang mabuk/zoom aneh!_ 🌿`;

          await client.sendMessage(
              m.chat,
              {
                  video: outBuffer,
                  mimetype: 'video/mp4',
                  caption
              },
              { quoted: m }
          );
      } catch (err) {
          console.error('[STABILIZE ERROR]', err);
          reply(`❌ Gagal menstabilkan video: ${err?.message || err}`);
      } finally {
          const cleanup = async (filePath) => {
              if (filePath && fs.existsSync(filePath)) {
                  await fs.promises.unlink(filePath).catch(() => null);
              }
          };
          await cleanup(tmpIn);
          await cleanup(trfFile);
          await cleanup(tmpOut);
      }
  };

  handler.category = 'tools';

export { pluginConfig as config, handler }
