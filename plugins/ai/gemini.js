/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from "fs";
import path from "path";
import https from "https";
import zlib from "zlib";
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
  name: "gemini",
  alias: ["g", "miku"],
  category: "ai",
  description: "Ngobrol dengan Gemini (sesi tersimpan, bisa lanjut dengan reply)",
  usage: ".gemini <pertanyaan>",
  example: ".gemini apa itu black hole?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const GARIS = "━━━━━━━━━━━━━━━━";
const HOME_URL = "https://gemini.google.com/";
const API_URL =
  "https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20260917.13_p0&f.sid=1147530711385426743&hl=en-US&_reqid=2011320&rt=c";
const MAKS_ID_JAWABAN = 500;
const MAKS_UKURAN_SESI = 1024 * 1024; // 1 MB: sesi yang menyentuh batas ini diganti sesi baru
const ukuranSesi = (s) => Buffer.byteLength(String(s || ""), "utf8");
const LOG_DEBUG = path.join(process.cwd(), "database", "logs", "gemini-debug.txt");

// ───────── penyimpanan (database/main/gemini.json) ─────────
// sessions : { jid: "<sesi base64>" }
// ids      : id pesan jawaban bot, dipakai supaya reply ke jawaban bisa lanjut tanpa perintah
function db() {
  const d = getDatabase();
  const g = (d.db.data.gemini ||= {});
  g.sessions ||= {};
  g.ids ||= [];
  return { g, simpan: () => d.markDirty("gemini") };
}

function ingatJawaban(id) {
  if (!id) return;
  const { g, simpan } = db();
  if (!g.ids.includes(id)) g.ids.push(id);
  if (g.ids.length > MAKS_ID_JAWABAN) g.ids.splice(0, g.ids.length - MAKS_ID_JAWABAN);
  simpan();
}

// ───────── HTTP (tangani gzip/br/deflate sendiri) ─────────
function http(url, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      { method, headers: { "accept-encoding": "gzip, deflate, br", ...headers }, maxHeaderSize: 262144 },
      (res) => {
        const potongan = [];
        res.on("data", (c) => potongan.push(c));
        res.on("end", () => {
          let buf = Buffer.concat(potongan);
          try {
            const enc = res.headers["content-encoding"];
            if (enc === "gzip") buf = zlib.gunzipSync(buf);
            else if (enc === "br") buf = zlib.brotliDecompressSync(buf);
            else if (enc === "deflate") buf = zlib.inflateSync(buf);
          } catch {}
          resolve({ status: res.statusCode, headers: res.headers, text: buf.toString("utf8") });
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function ambilCookie() {
  const res = await http(HOME_URL, { method: "HEAD" });
  const cookie = res.headers["set-cookie"]?.[0]?.split("; ")?.[0];
  if (!cookie) throw new Error("gagal mendapatkan cookie");
  return cookie;
}

function simpanDebug(alasan, isi) {
  try {
    fs.mkdirSync(path.dirname(LOG_DEBUG), { recursive: true });
    fs.writeFileSync(LOG_DEBUG, `[${new Date().toISOString()}] ${alasan}\n\n${String(isi).slice(0, 20000)}`);
  } catch {}
  console.log(`[gemini] ${alasan} -> respons mentah disimpan di ${LOG_DEBUG}`);
}

class FormatTidakDikenali extends Error {}

// Respons Gemini berupa beberapa baris JSON bersarang; ambil kandidat jawaban terakhir yang berisi teks
function bacaRespons(mentah) {
  const bersih = String(mentah).replace(/^\)\]\}'\s*/, "").trim();
  let temuan = null;
  let adaError = false;

  for (const baris of bersih.split("\n")) {
    let arr;
    try {
      arr = JSON.parse(baris);
    } catch {
      continue;
    }
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (!Array.isArray(item)) continue;
      if (item[0] === "er") adaError = true;
      if (typeof item[2] !== "string") continue;
      try {
        const isi = JSON.parse(item[2]);
        const kandidat = isi?.[4];
        if (!Array.isArray(kandidat)) continue;
        const pilih = kandidat.find((k) => typeof k?.[1]?.[0] === "string" && k[1][0]);
        if (pilih) temuan = { isi, pilih };
      } catch {}
    }
  }

  if (!temuan) {
    simpanDebug(adaError ? "Gemini membalas error (er)" : "format respons tidak dikenali", mentah);
    throw new FormatTidakDikenali(
      adaError ? "Gemini menolak request (sesi/limit/cookie)" : "format respons tidak dikenali",
    );
  }
  const { isi, pilih } = temuan;
  return { jawaban: pilih[1][0], lanjutan: [isi?.[1]?.[0], isi?.[1]?.[1], pilih[0]] };
}

const encodeSesi = (o) => Buffer.from(JSON.stringify(o)).toString("base64");
const decodeSesi = (s) => JSON.parse(Buffer.from(String(s), "base64").toString("utf8"));

function sesiValid(s) {
  try {
    const o = decodeSesi(s);
    return typeof o.cookie === "string" && Array.isArray(o.resumeArray);
  } catch {
    return false;
  }
}

async function tanyaSekali(prompt, sesiLama = "") {
  let resumeArray = [];
  let cookie;
  try {
    if (!sesiLama) throw 0;
    ({ resumeArray, cookie } = decodeSesi(sesiLama));
    if (!cookie) throw 0;
  } catch {
    resumeArray = [];
    cookie = await ambilCookie();
  }

  const body = new URLSearchParams({
    "f.req": JSON.stringify([null, JSON.stringify([[prompt], ["en-US"], resumeArray])]),
  }).toString();

  const res = await http(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "content-length": Buffer.byteLength(body),
      cookie,
    },
    body,
  });
  if (res.status !== 200) {
    simpanDebug(`HTTP ${res.status}`, res.text);
    throw new Error(`HTTP ${res.status}`);
  }

  const r = bacaRespons(res.text);
  return { jawaban: r.jawaban, sesi: encodeSesi({ cookie, resumeArray: r.lanjutan }) };
}

// Kalau sesi lama sudah basi, otomatis ulang dengan sesi baru
async function tanyaGemini(prompt, sesiLama = "") {
  try {
    return await tanyaSekali(prompt, sesiLama);
  } catch (e) {
    if (sesiLama && (e instanceof FormatTidakDikenali || /^HTTP (4|5)/.test(e.message))) {
      console.log("[gemini] sesi lama gagal, coba ulang dengan sesi baru");
      return await tanyaSekali(prompt, "");
    }
    throw e;
  }
}

// Ubah markdown Gemini jadi format WhatsApp
const rapikan = (t) =>
  String(t)
    .replace(/https?:\/\/(?:[\w-]+\.)?googleusercontent\.com\/\S*/gi, "")
    .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, GARIS)
    .replace(/^#{1,6}\s*(.+)$/gm, (_, h) => `*${h.replace(/\*/g, "").trim()}*`)
    .replace(/^( {4,}|\t+)[*-]\s+/gm, "    ◦ ")
    .replace(/^\s{0,3}[*-]\s+/gm, "• ")
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const menuBantuan = (p) =>
  `GEMINI\n${GARIS}\n` +
  `• ${p}gemini <pertanyaan>\n` +
  `• ${p}gemini -e [nama]  export sesi\n` +
  `• ${p}gemini -r  import sesi (reply file)\n` +
  `• ${p}gemini reset  hapus sesi\n` +
  `• reply jawaban Miku  lanjut ngobrol tanpa perintah`;

async function jalankan(m, { sock, text, prefix = ".", modeReply = false }) {
  const mentah = String(text || "").trim();
  const [awal = "", ...sisa] = mentah.split(/\s+/);
  const flag = modeReply ? "" : awal.toLowerCase();
  const user = m.sender;
  const chat = m.chat;
  const { g, simpan } = db();

  if (flag === "reset") {
    const ada = Boolean(g.sessions[user]);
    delete g.sessions[user];
    simpan();
    return m.reply(ada ? `SESI DIHAPUS\n${GARIS}\nPercakapan baru dimulai.` : "Tidak ada sesi aktif.");
  }

  if (flag === "-e") {
    if (!g.sessions[user]) return m.reply(`❌ Belum ada sesi. Tanya dulu: ${prefix}gemini <pertanyaan>`);
    const nama =
      sisa.join("-").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || `gemini-${Date.now()}`;
    const berkas = await sock.sendMessage(
      chat,
      {
        document: Buffer.from(JSON.stringify({ type: "gemini-session", name: nama, session: g.sessions[user] })),
        mimetype: "application/json",
        fileName: `${nama}.gemini.json`,
      },
      { quoted: m },
    );
    return sock.sendMessage(
      chat,
      { text: `SESI DI-EXPORT\n${GARIS}\nNama   : ${nama}\nImport : reply file di atas dengan "${prefix}gemini -r"` },
      { quoted: berkas },
    );
  }

  if (flag === "-r") {
    if (!m.quoted) return m.reply(`❌ Reply file export dengan: ${prefix}gemini -r`);
    let obj;
    try {
      obj = JSON.parse((await m.quoted.download()).toString("utf8"));
    } catch (e) {
      return m.reply(`❌ File tidak bisa dibaca: ${e.message}`);
    }
    if (obj?.type !== "gemini-session" || !sesiValid(obj.session)) return m.reply("❌ File export tidak valid");
    g.sessions[user] = obj.session;
    simpan();
    return m.reply(`SESI DI-IMPORT\n${GARIS}\nNama : ${obj.name || "-"}\nLanjutkan dengan: ${prefix}gemini <pertanyaan>`);
  }

  const prompt = mentah || m.quoted?.text || "";
  if (!prompt) return m.reply(menuBantuan(prefix));

  try {
    // Sesi lama sudah >= 1 MB (mis. hasil import): langsung pakai sesi baru.
    let sesiAktif = g.sessions[user];
    let catatan = "";
    if (sesiAktif && ukuranSesi(sesiAktif) >= MAKS_UKURAN_SESI) {
      delete g.sessions[user];
      sesiAktif = "";
      catatan = "\n\nℹ️ Sesi sebelumnya sudah mencapai 1 MB, jadi percakapan dimulai dari sesi baru.";
    }

    const { jawaban, sesi } = await tanyaGemini(prompt, sesiAktif);
    if (ukuranSesi(sesi) >= MAKS_UKURAN_SESI) {
      // Sesi menyentuh 1 MB: buang, pertanyaan berikutnya otomatis memakai sesi baru.
      delete g.sessions[user];
      catatan = "\n\nℹ️ Sesi percakapan sudah mencapai 1 MB, pertanyaan berikutnya dimulai dari sesi baru.";
    } else {
      g.sessions[user] = sesi;
    }
    simpan();
    const terkirim = await sock.sendMessage(chat, { text: rapikan(jawaban) + catatan }, { quoted: m });
    ingatJawaban(terkirim?.key?.id);
  } catch (e) {
    console.error("[gemini]", e);
    await m.reply(`❌ Gagal: ${e.message}\nCoba lagi, atau "${prefix}gemini reset" jika terus error.`);
  }
}

async function handler(m, { sock, text, prefix }) {
  return jalankan(m, { sock, text, prefix });
}

/**
 * Lanjut ngobrol tanpa perintah: reply jawaban Gemini dari bot, tulis pertanyaan baru.
 * Dipanggil dari handler.js untuk pesan non-command. Mengembalikan true kalau pesan sudah ditangani.
 */
async function replyHandler(m, { sock }) {
  try {
    const idDibalas = m.quoted?.id;
    if (!idDibalas || m.fromMe) return false;
    if (!db().g.ids.includes(idDibalas)) return false;
    const isi = String(m.body || m.text || "").trim();
    if (!isi) return false;
    await jalankan(m, { sock, text: isi, prefix: m.prefix || ".", modeReply: true });
    return true;
  } catch (e) {
    console.error("[gemini] reply handler:", e.message);
    return false;
  }
}

export { pluginConfig as config, handler, replyHandler };
