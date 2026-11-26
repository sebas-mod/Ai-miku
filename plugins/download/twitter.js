/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "twitter",
    alias: [],
    category: "download",
    description: "twitter",
    usage: ".twitter",
    example: ".twitter",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, text, usedPrefix, command }) {
      try {
          if (!text) {
              return m.reply(`*Contoh: ${usedPrefix + command} https://x.com/...*`);
          }

          await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

          const body = new URLSearchParams({
              q: text,
              lang: 'id',
              cftoken: ''
          });

          const res = await fetch('https://savetwitter.net/api/ajaxSearch', {
              method: 'POST',
              headers: {
                  'User-Agent': 'Mozilla/5.0',
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'X-Requested-With': 'XMLHttpRequest',
                  'Origin': 'https://savetwitter.net',
                  'Referer': 'https://savetwitter.net/id3'
              },
              body
          });

          const json = await res.json();
          const html = json?.data;

          if (!html) {
              return m.reply('*Gagal mengambil data video 🍂*');
          }

          const title = html.match(/<h3>(.*?)<\/h3>/)?.[1]?.trim() || 'Twitter Video';
          const duration = html.match(/<p>(\d+:\d+)<\/p>/)?.[1] || '-';
          const thumbnail = html.match(/<img src="([^"]+)"/)?.[1];

          const mp4 = [...html.matchAll(/href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)".*?MP4\s*\(([^)]+)\)/g)]
              .map(v => ({
                  quality: v[2],
                  url: v[1]
              }));

          if (!mp4.length) {
              return m.reply('*Video tidak ditemukan 🍂*');
          }

          const best = mp4[0];

          let caption = `*🐦 Twitter Downloader*\n\n`;
          caption += `*📌 Judul:* ${title}\n`;
          caption += `*⏱️ Durasi:* ${duration}\n`;
          caption += `*🎞️ Kualitas:* ${best.quality}\n`;

          const vres = await fetch(best.url, {
              headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://savetwitter.net/' }
          });
          if (!vres.ok) throw new Error(`Gagal unduh video (HTTP ${vres.status})`);
          const videoBuffer = Buffer.from(await vres.arrayBuffer());
          if (!videoBuffer.length) throw new Error('File video kosong');

          let thumb
          try {
              if (thumbnail) {
                  const tres = await fetch(thumbnail)
                  if (tres.ok) thumb = Buffer.from(await tres.arrayBuffer())
              }
          } catch {}

          const content = { video: videoBuffer, mimetype: 'video/mp4', caption }
          if (thumb) content.jpegThumbnail = thumb

          await conn.sendMessage(m.chat, content, { quoted: m });
      } catch (e) {
          await m.reply(`*Terjadi kesalahan saat memproses video 🍂*\n\n${e.message}`);
      } finally {
          await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
      }
  };

export { pluginConfig as config, handler }
