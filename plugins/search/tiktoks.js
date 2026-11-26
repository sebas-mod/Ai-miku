/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";

const pluginConfig = {
  name: "tiktoks",
  alias: ["ttsearch", "tiktoksearch"],
  category: "search",
  description: "Cari dan kirim video TikTok berdasarkan kata kunci",
  usage: ".tiktoksearch <kata kunci>",
  example: ".tiktoksearch stecu stecu 20 detik",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pickArray = (d) => {
  for (const c of [
    d?.data?.videos,
    d?.data?.result,
    d?.data,
    d?.result?.videos,
    d?.result?.data,
    d?.result,
    d?.videos,
    d?.results,
  ]) {
    if (Array.isArray(c) && c.length) return c;
  }
  return [];
};

const normalizeVideo = (v) => {
  if (!v || typeof v !== "object") return null;
  const play =
    v.play ||
    v.no_watermark ||
    v.nowm ||
    v.noWatermark ||
    v.hdplay ||
    v.video ||
    v.videoUrl ||
    v.video_url ||
    v.wmplay ||
    (typeof v.url === "string" && /\.(mp4|m3u8)|tikwm|tiktokcdn|byteoversea/i.test(v.url) ? v.url : null);
  if (!play || typeof play !== "string") return null;

  const author = typeof v.author === "object" && v.author ? v.author : {};
  const uniqueId =
    author.unique_id ||
    author.username ||
    author.uniqueId ||
    v.username ||
    v.unique_id ||
    "";
  const nickname =
    author.nickname || author.name || v.nickname || uniqueId || "-";
  const videoId = v.video_id || v.id || v.aweme_id || "";

  return {
    title: v.title || v.desc || v.description || "Tanpa Judul",
    author: { nickname, unique_id: uniqueId },
    duration: Number(v.duration || 0),
    digg_count: Number(
      v.digg_count ?? v.likes ?? v.like_count ?? v.stats?.diggCount ?? 0
    ),
    comment_count: Number(
      v.comment_count ?? v.comments ?? v.stats?.commentCount ?? 0
    ),
    share_count: Number(
      v.share_count ?? v.shares ?? v.stats?.shareCount ?? 0
    ),
    play_count: Number(
      v.play_count ?? v.views ?? v.stats?.playCount ?? 0
    ),
    video_id: videoId,
    play: play.startsWith("http") ? play : `https://www.tikwm.com${play}`,
  };
};

// Provider 1: TikWM via got-scraping (bypass Cloudflare 403 TLS fingerprint)
async function searchTikwmGotScraping(query) {
  const mod = await import("got-scraping").catch(() => null);
  const gotScraping = mod?.gotScraping || mod?.default?.gotScraping || mod?.default;
  if (typeof gotScraping !== "function") {
    throw new Error("got-scraping tidak tersedia");
  }

  for (const host of ["https://www.tikwm.com", "https://tikwm.com"]) {
    try {
      const res = await gotScraping.post(`${host}/api/feed/search`, {
        form: { keywords: query, count: "10", cursor: "0", web: "1", hd: "1" },
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          Origin: host,
          Referer: `${host}/`,
          "X-Requested-With": "XMLHttpRequest",
        },
        timeout: { request: 20000 },
        responseType: "json",
      });
      const data = res.body;
      if (data?.code === -1 && /1 request\/second/i.test(data?.msg || "")) {
        await sleep(1500);
        continue;
      }
      const list = pickArray(data).map(normalizeVideo).filter(Boolean);
      if (list.length) return list;
    } catch {}
  }
  throw new Error("TikWM (TLS) kosong");
}

// Provider 2: TikWM via axios
async function searchTikwmAxios(query) {
  const form = new URLSearchParams({
    keywords: query,
    count: "10",
    cursor: "0",
    web: "1",
  });
  for (const host of ["https://www.tikwm.com", "https://tikwm.com"]) {
    const res = await axios.post(`${host}/api/feed/search`, form.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json, text/javascript, */*; q=0.01",
        Origin: host,
        Referer: `${host}/`,
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": UA,
      },
      timeout: 20000,
    });
    if (res.data?.code === -1 && /1 request\/second/i.test(res.data?.msg || "")) {
      await sleep(1500);
      continue;
    }
    const list = pickArray(res.data).map(normalizeVideo).filter(Boolean);
    if (list.length) return list;
  }
  throw new Error("TikWM (axios) kosong");
}

// Provider 3+: Public fallback APIs
const FALLBACK_ENDPOINTS = [
  "https://api.siputzx.my.id/api/s/tiktok?query={q}",
  "https://api.nexray.web.id/search/tiktok?q={q}",
  "https://api.agatz.xyz/api/tiktoksearch?message={q}",
  "https://api.deline.web.id/search/tiktok?q={q}",
];

async function searchVideos(query) {
  const errs = [];

  for (const [name, fn] of [
    ["TikWM-TLS", () => searchTikwmGotScraping(query)],
    ["TikWM", () => searchTikwmAxios(query)],
  ]) {
    try {
      const list = await fn();
      if (list.length) return list;
    } catch (e) {
      errs.push(`${name}: ${e.message}`);
    }
  }

  for (const tpl of FALLBACK_ENDPOINTS) {
    const url = tpl.replace("{q}", encodeURIComponent(query));
    const host = new URL(url).host;
    try {
      const res = await axios.get(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        timeout: 20000,
      });
      const list = pickArray(res.data).map(normalizeVideo).filter(Boolean);
      if (list.length) return list;
      errs.push(`${host}: hasil kosong`);
    } catch (e) {
      errs.push(`${host}: ${e.message}`);
    }
  }

  throw new Error(errs.slice(0, 3).join(" | "));
}

async function fetchVideoBuffer(videoUrl) {
  const isTikwm = /tikwm\.com/i.test(videoUrl);
  const res = await axios.get(videoUrl, {
    responseType: "arraybuffer",
    timeout: 45000,
    maxContentLength: 60 * 1024 * 1024,
    headers: {
      "User-Agent": UA,
      Referer: isTikwm ? "https://www.tikwm.com/" : "https://www.tiktok.com/",
    },
  });
  const buf = Buffer.from(res.data);
  if (buf.length < 1024) throw new Error("File video tidak valid");
  return buf;
}

async function handler(m, ctx = {}) {
  const client = ctx.sock || ctx.conn;
  const p = ctx.usedPrefix || m.prefix || ".";
  const cmd = ctx.command || m.command || "tiktoksearch";
  const query = String(ctx.text ?? m.text ?? "").trim();

  if (!query) {
    return m.reply(
      `╭─── ❖ 『 🔍 *TIKTOK SEARCH* 』 ❖\n` +
        `│ ✦ Masukkan kata kunci pencarian video TikTok!\n` +
        `│ 📌 *Contoh:* \`${p}${cmd} stecu stecu 20 detik\`\n` +
        `╰──────────────────────────❖`
    );
  }

  await client
    .sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
    .catch(() => {});

  try {
    const videos = await searchVideos(query);
    if (!videos.length) {
      await client
        .sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        .catch(() => {});
      return m.reply(`❌ Tidak ditemukan video TikTok untuk kata kunci \`${query}\`.`);
    }

    const video = videos[Math.floor(Math.random() * Math.min(videos.length, 6))];
    const directLink = video.video_id
      ? `https://www.tiktok.com/@${video.author.unique_id || "_"}/video/${video.video_id}`
      : "-";

    const caption =
      `╭─── ❖ 『 🎵 *TIKTOK SEARCH* 』 ❖\n` +
      `│ 📝 *Judul:* ${video.title}\n` +
      `│ 👤 *Author:* ${video.author.nickname}${video.author.unique_id ? ` (@${video.author.unique_id})` : ""}\n` +
      `│ ⏱️ *Durasi:* ${video.duration} detik\n` +
      `│ ❤️ *Likes:* ${video.digg_count.toLocaleString("id-ID")}\n` +
      `│ 💬 *Komentar:* ${video.comment_count.toLocaleString("id-ID")}\n` +
      `│ 🔁 *Share:* ${video.share_count.toLocaleString("id-ID")}\n` +
      `│ 👀 *Views:* ${video.play_count.toLocaleString("id-ID")}\n` +
      (directLink !== "-" ? `│ 🔗 *Link:* ${directLink}\n` : "") +
      `╰──────────────────────────❖\n` +
      `_✦ Elysia Assistant • TikTok Search_`;

    let videoPayload;
    try {
      const buf = await fetchVideoBuffer(video.play);
      videoPayload = { video: buf, caption, mimetype: "video/mp4" };
    } catch {
      videoPayload = { video: { url: video.play }, caption, mimetype: "video/mp4" };
    }

    await client.sendMessage(m.chat, videoPayload, { quoted: m });
    await client
      .sendMessage(m.chat, { react: { text: "✅", key: m.key } })
      .catch(() => {});
  } catch (err) {
    console.error("[TIKTOK SEARCH ERROR]:", err);
    await client
      .sendMessage(m.chat, { react: { text: "❌", key: m.key } })
      .catch(() => {});
    await m.reply(
      `❌ *TikTok Search gagal*\n> ${err.message || "Semua server sedang sibuk, coba lagi sebentar."}`
    );
  }
}

export { pluginConfig as config, handler };
