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
import * as cheerio from 'cheerio'

const pluginConfig = {
    name: "yt5so",
    alias: [],
    category: "download",
    description: "yt5so",
    usage: ".yt5so",
    example: ".yt5so",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function yt5sIo(url) {
      try {
          const form = new URLSearchParams();
          form.append("q", url);
          form.append("vt", "home");

          const response = await axios.post('https://yt5s.io/api/ajaxSearch', form, {
              headers: {
                  "Accept": "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                  "Content-Type": "application/x-www-form-urlencoded",
              },
          });

          if (response.data.status === "ok") {
              const $ = cheerio.load(response.data.data);

              if (/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i.test(url)) {
                  const videoQualities = [];
                  $('table tbody tr').each((index, element) => {
                      const quality = $(element).find('.video-quality').text().trim();
                      const downloadLink = $(element).find('a.download-link-fb').attr("href");
                      if (quality && downloadLink) {
                          videoQualities.push({ quality, downloadLink });
                      }
                  });

                  const hdVideo = videoQualities.find(v => v.quality.toLowerCase().includes('hd'));
                  const sdVideo = videoQualities.find(v => v.quality.toLowerCase().includes('sd'));
                  const videoUrl = hdVideo ? hdVideo.downloadLink : sdVideo ? sdVideo.downloadLink : null;

                  if (!videoUrl) throw new Error("No hay enlace de descarga disponible.");
                  return { videoUrl };
              } else if (/^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel)\/.+/i.test(url)) {
                  const videoUrl = $('a[title="Download Video"]').attr("href");
                  if (!videoUrl) throw new Error("No hay enlace de descarga disponible.");
                  return { videoUrl };
              } else {
                  throw new Error("URL no válida. Envía una URL de Facebook o Instagram.");
              }
          } else {
              throw new Error("Error al obtener el video: " + response.data.message);
          }
      } catch (error) {
          throw error;
      }
  }

  async function handler(m, { conn, text }) {
      try {
          if (!text) throw "Envía una URL de Facebook o Instagram.";

          const result = await yt5sIo(text);

          if (result.videoUrl) {
              await conn.sendMessage(m.chat, { video: { url: result.videoUrl }, mimetype: 'video/mp4' }, { quoted: m });
          } else {
              throw "Error al descargar ";
          }
      } catch (error) {
          await conn.sendMessage(m.chat, { text: `Error: ${error.message || error}` }, { quoted: m });
      }
  };

export { pluginConfig as config, handler }
