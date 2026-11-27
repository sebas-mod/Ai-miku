/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const ytdl = MikuRuntime.ytdl;

  const pluginConfig = {
    name: "ytmp4",
    alias: ["ytm4", "videoyt"],
    category: "download",
    description: "Download video YouTube",
    usage: ".ytmp4 <url>",
    example: ".ytmp4 https://youtube.com/watch?v=xxx",
    cooldown: 20,
    energi: 2,
    isEnabled: true,
  };

  async function getVideoDownloadUrl(url) {
    try {
      const { data } = await axios.get(
        `https://my.izuka-api.xyz/api/downloader/ytmp4?url=${encodeURIComponent(url)}`
      );

      if (data?.status && data?.result?.video_normal) {
        const videos = data.result.video_normal.filter(v => v.ext === "mp4");
        if (videos.length > 0) {
          videos.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
          if (videos[0] && videos[0].url) {
            return videos[0].url;
          }
        }
      }
    } catch (e) {
      console.error("[YTMP4 Izuka API Error]", e.message);
    }

    const fallback = await ytdl(url, "mp4");
    if (fallback?.status && fallback?.dl) {
      return fallback.dl;
    }

    throw new Error(fallback?.mess || "Error al obtener la URL de descarga del video");
  }

  async function handler(m, { sock }) {
    const url = m.text?.trim();
    if (!url)
      return m.reply(`Ejemplo: ${m.prefix}ytmp4 https://youtube.com/watch?v=xxx`);
    if (!url.includes("youtube.com") && !url.includes("youtu.be"))
      return m.reply("❌ La URL debe ser de YouTube");

    m.react("🕕");

    try {
      const downloadUrl = await getVideoDownloadUrl(url);

      await sock.sendMedia(m.chat, downloadUrl, null, m, {
        type: "video",
      });
      m.react("✅");
    } catch (err) {
      console.error("[YTMP4]", err);
      m.react("❌");
      m.reply("Error al descargar el vídeo.");
    }
  }

export { pluginConfig as config, handler }
