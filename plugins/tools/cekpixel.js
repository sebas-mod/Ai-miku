/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "cekpixel",
    alias: ["pixel"],
    category: "tools",
    description: "cekpixel",
    usage: ".cekpixel",
    example: ".cekpixel",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const sharp = (__m => __m.default ?? __m)((await import('sharp')))

  const formatBytes = (bytes, decimals = 2) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  async function handler(m, { usedPrefix, command, reply }) {
      const q = m.quoted ? m.quoted : m;
      const mime = (q.msg || q).mimetype || q.mtype || '';

      if (!/image/.test(mime)) {
          return reply(`Envía o responde a una imagen con el texto *${usedPrefix + command}*`);
      }

      try {
          const media = await q.download();
          if (!media || !Buffer.isBuffer(media)) {
              return reply('❌ No se pudo descargar la imagen.');
          }

          const metadata = await sharp(media).metadata();

          const width = metadata.width || 0;
          const height = metadata.height || 0;
          const totalPixels = (width * height).toLocaleString('id-ID');
          const aspect = width && height ? (width / height).toFixed(2) : '-';
          const format = (metadata.format || 'unknown').toUpperCase();
          const size = media.length ? formatBytes(media.length) : '-';
          const space = metadata.space || 'sRGB';
          const channels = metadata.channels || 3;

          const teks = `🖼️ *IMAGE PIXEL IDENTIFIER*\n\n` +
              `• 📐 *Lebar (Width):* ${width} px\n` +
              `• 📏 *Tinggi (Height):* ${height} px\n` +
              `• 🔍 *Total Pixel:* ${totalPixels} Pixels\n` +
              `• 🖼️ *Aspect Ratio:* ${aspect} (${width}:${height})\n` +
              `• 📦 *Formato de imagen:* ${format}\n` +
              `• 💾 *Ukuran File:* ${size}\n` +
              `• 🎨 *Color Space:* ${space} (${channels} Channels)\n\n` +
              `_¡Resolución de la imagen identificada!_`;

          reply(teks);
      } catch (err) {
          console.error('[cekpixel error]:', err);
          reply(`❌ No se pudieron leer los píxeles de la imagen: ${err.message || err}`);
      }
  };

  handler.category = 'tools';

export { pluginConfig as config, handler }
