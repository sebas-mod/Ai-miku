/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";
import FormData from "form-data";
import fetch from "node-fetch";
import { ImageUploadService } from "node-upload-images";
import mime from "mime-types";

const pluginConfig = {
  name: "gura",
  alias: ["guracanvas"],
  category: "canvas",
  description: "Bikin efek canvas gura dari fotomu",
  usage: ".gura (reply/kirim foto)",
  example: ".gura",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const API_URL = "https://api.nexray.eu.cc/canvas/gura";
const TIMEOUT = 60000;
const MAX_OUTPUT = 20 * 1024 * 1024;

function isImageBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;
  return (
    buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ||
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    buffer.subarray(0, 3).toString() === "GIF" ||
    (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") ||
    buffer.subarray(0, 2).toString() === "BM"
  );
}

async function uploadWithPixhost(buffer, filename = "gura.jpg") {
  const service = new ImageUploadService("pixhost.to");
  const result = await service.uploadFromBinary(buffer, filename);
  const url = result?.directLink || result?.directUrl || result?.url;
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    throw new Error("Pixhost tidak mengembalikan direct URL gambar");
  }
  return url;
}

async function uploadWithCatbox(buffer, filename = "gura.jpg") {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", buffer, {
    filename,
    contentType: mime.lookup(filename) || "image/jpeg",
  });

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "User-Agent": "vemzo-gura/1.1",
    },
    timeout: TIMEOUT,
  });

  const text = (await res.text()).trim();
  if (!res.ok || !/^https?:\/\//i.test(text)) {
    throw new Error(`Catbox HTTP ${res.status}: ${text.slice(0, 160)}`);
  }
  return text;
}

async function uploadImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Buffer gambar kosong");
  }

  try {
    return await uploadWithPixhost(buffer);
  } catch (pixErr) {
    console.warn("[Gura] Pixhost gagal, mencoba Catbox:", pixErr?.message || pixErr);
    return await uploadWithCatbox(buffer);
  }
}

async function getMediaBuffer(m) {
  if (m?.quoted) {
    if (typeof m.quoted.download !== "function") {
      throw new Error("Helper quoted.download tidak tersedia");
    }
    const buffer = await m.quoted.download();
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error("Reply gambar menghasilkan buffer kosong");
    }
    return buffer;
  }

  if (m?.message) {
    if (typeof m.download !== "function") {
      throw new Error("Helper m.download tidak tersedia");
    }
    const buffer = await m.download();
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error("Gambar menghasilkan buffer kosong");
    }
    return buffer;
  }

  throw new Error("Pesan gambar tidak ditemukan");
}

function getErrorText(data) {
  if (Buffer.isBuffer(data)) return data.toString("utf8").slice(0, 250);
  if (typeof data === "string") return data.slice(0, 250);
  try {
    return JSON.stringify(data).slice(0, 250);
  } catch {
    return String(data).slice(0, 250);
  }
}

async function requestGura(imageUrl) {
  const url = new URL(API_URL);
  url.searchParams.set("url", imageUrl);

  const res = await axios.get(url.toString(), {
    responseType: "arraybuffer",
    timeout: TIMEOUT,
    maxContentLength: MAX_OUTPUT,
    maxBodyLength: MAX_OUTPUT,
    validateStatus: () => true,
    headers: {
      Accept: "image/*,application/json,text/plain;q=0.8,*/*;q=0.5",
      "User-Agent": "vemzo-gura/1.1",
    },
  });

  const contentType = String(res.headers?.["content-type"] || "").toLowerCase();
  const body = Buffer.from(res.data || []);

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Nexray HTTP ${res.status}${body.length ? `: ${getErrorText(body)}` : ""}`);
  }

  if (!body.length) {
    throw new Error("Nexray mengembalikan respons kosong");
  }

  if (contentType.startsWith("image/") || isImageBuffer(body)) {
    return body;
  }

  const text = body.toString("utf8").trim();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {}

  const outputUrl =
    (typeof data === "string" && data) ||
    data?.url ||
    data?.data?.url ||
    data?.result?.url ||
    (typeof data?.result === "string" ? data.result : null);

  if (typeof outputUrl === "string" && /^https?:\/\//i.test(outputUrl)) {
    const imageRes = await axios.get(outputUrl, {
      responseType: "arraybuffer",
      timeout: TIMEOUT,
      maxContentLength: MAX_OUTPUT,
      validateStatus: () => true,
      headers: { "User-Agent": "vemzo-gura/1.1" },
    });

    const imageBuffer = Buffer.from(imageRes.data || []);
    const imageType = String(imageRes.headers?.["content-type"] || "").toLowerCase();
    if (
      imageRes.status >= 200 &&
      imageRes.status < 300 &&
      imageBuffer.length > 0 &&
      (imageType.startsWith("image/") || isImageBuffer(imageBuffer))
    ) {
      return imageBuffer;
    }
  }

  throw new Error(
    `Nexray tidak mengembalikan gambar (${contentType || "unknown"})${text ? `: ${text.slice(0, 200)}` : ""}`
  );
}

async function handler(m, { sock }) {
  const isReply = !!m?.quoted;
  const hasCurrentImage = !!m?.message && (m.type === "imageMessage" || m.mtype === "imageMessage");

  if (!isReply && !hasCurrentImage) {
    return m.reply(
      `🦈 *GURA CANVAS*\n\nKirim atau reply foto dengan perintah \`${m.prefix}gura\` untuk memberikan efek Gura!`
    );
  }

  let media;
  try {
    media = await getMediaBuffer(m);
  } catch (err) {
    console.error("[Gura] Gagal download gambar:", err);
    return m.reply("❌ Gagal membaca/download gambar. Coba kirim ulang foto atau reply foto lagi ya!");
  }

  try {
    await m.react("🕕");
  } catch {}

  try {
    const imageUrl = await uploadImage(media);
    console.log("[Gura] Input image URL:", imageUrl);

    const result = await requestGura(imageUrl);

    await sock.sendMessage(
      m.chat,
      {
        image: result,
        caption: "🦈 *RAWWWR! Gura is here!*",
      },
      { quoted: m }
    );

    try {
      await m.react("✅");
    } catch {}
  } catch (err) {
    console.error("[Gura] Error:", err);

    try {
      await m.react("❌");
    } catch {}

    const msg = String(err?.message || "");
    if (/Nexray HTTP 400/i.test(msg)) {
      return m.reply("⚠️ Server Gura menolak gambar yang dikirim. Coba kirim foto JPG/PNG lain.");
    }
    if (/Nexray HTTP 429/i.test(msg)) {
      return m.reply("⏳ Server Gura sedang membatasi request. Coba lagi sebentar lagi ya.");
    }
    if (/Nexray HTTP 5\d\d/i.test(msg)) {
      return m.reply("😔 Server pembuat Gura sedang error. Coba lagi beberapa saat lagi ya.");
    }
    if (/Pixhost|Catbox|upload/i.test(msg)) {
      return m.reply("❌ Gagal mengunggah gambar ke server pemrosesan. Coba kirim ulang foto ya.");
    }

    return m.reply("😔 *Gagal membuat Gura Canvas.*\n\nCoba lagi beberapa saat lagi ya.");
  }
}

export { pluginConfig as config, handler };
