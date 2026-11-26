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
import fetch from 'node-fetch'

const sendAlbum = ElysiaRuntime.sendAlbum;

const pluginConfig = {
    name: "xhs",
    alias: [],
    category: "download",
    description: "xhs",
    usage: ".xhs",
    example: ".xhs",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function redNote(url) {
      try {
          const { data } = await axios.get(url);

          const extractMeta = (pattern) => (data.match(pattern) || [])[1]?.trim() || "";

          const noteId = extractMeta(/<meta\s+name="og:url"\s+content="(.*?)"/i).split('/').pop();
          const nickname = extractMeta(/<meta\s+name="og:title"\s+content="(.*?)"/i).split(" - ")[0];
          const title = extractMeta(/<title>(.*?)<\/title>/i);
          const description = extractMeta(/<meta\s+name="description"\s+content="(.*?)"/i);
          const keywords = extractMeta(/<meta\s+name="keywords"\s+content="(.*?)"/i);
          const duration = extractMeta(/<meta\s+name="og:videotime"\s+content="(.*?)"/i);
          const videoUrl = extractMeta(/<meta\s+name="og:video"\s+content="(.*?)"/i);
          const likes = extractMeta(/<meta\s+name="og:xhs:note_like"\s+content="(.*?)"/i);
          const comments = extractMeta(/<meta\s+name="og:xhs:note_comment"\s+content="(.*?)"/i);
          const collects = extractMeta(/<meta\s+name="og:xhs:note_collect"\s+content="(.*?)"/i);

          const images = [...data.matchAll(/<meta\s+name="og:image"\s+content="(.*?)"/gi)].map((match) => match[1]?.trim());

          return {
              metadata: {
                  noteId,
                  nickname,
                  title,
                  description,
                  keywords,
                  duration,
                  likes,
                  comments,
                  collects,
              },
              media: {
                  videoUrl,
                  images,
              },
          };
      } catch (err) {
          console.error("Failed to fetch data:", err.message);
          return null;
      }
  }

  async function handler(m, { text, conn, usedPrefix, command }) {
      if (!text) return m.reply("Mana Url Nyah!");

      if (/(?:x|twitter)\.com\//i.test(text)) {
          return m.reply(`Link itu dari X/Twitter, bukan RedNote.\nPakai: *${usedPrefix || '.'}twitter ${text.split(/\s+/)[0]}*`);
      }
      if (!/(xiaohongshu\.com|xhslink\.com)/i.test(text)) {
          return m.reply("URL harus dari xiaohongshu.com atau xhslink.com");
      }

      const result = await redNote(text.trim());
      if (!result) return m.reply("Terkadi Kesalahan Pastikan URL valid!");

      let { media } = result;

      if (!media.videoUrl && !(media.images && media.images.length)) {
          return m.reply("Media tidak ditemukan di link tersebut.");
      }

      try {
          await conn.sendMessage(m.chat, {
              sticker: { url: "https://files.catbox.moe/0ksa1n.webp" }
          }, { quoted: m });
      } catch (e) {
          console.warn("[xhs] sticker dilewati:", e.message);
      }

      if (media.videoUrl) {
          await conn.sendMessage(m.chat, { video: { url: media.videoUrl } }, { quoted: m });
      } else {
          await sendAlbum(conn, m.chat, media.images.map(img => ({ type: 'image', url: img })), { quoted: m });
      }
  };

export { pluginConfig as config, handler }
