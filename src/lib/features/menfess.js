/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../../config.js";
import { getDatabase } from "../data/database.js";

// ─────────────────────────────────────────────────────────────
//  MENFESS — pesan anonim lewat chat pribadi bot
//  Data tersimpan di database/main/menfess.json
//    menfess      : { ID: { from, to, t, last, pesan, log[], kirim[], tutup?, dilapor?, terungkap? } }
//    menfessMsg   : { idPesanWA: ID }       (supaya reply pesan bot bisa dilacak ke menfess-nya)
//    menfessPair  : { "penerima|pengirim": true }   (pengirim diblok oleh penerima)
//    menfessBlock : { nomor: true }         (menolak semua menfess)
//    menfessBan   : { nomor: { t, alasan, oleh } }
//    menfessLapor : { nomor: { n, last } }  (jumlah laporan terhadap pengirim)
//  Semua kunci pakai NOMOR saja (tanpa @domain) supaya stabil.
// ─────────────────────────────────────────────────────────────

const DEFAULTS = {
  on: true,
  maxPanjang: 500,
  maxPerHari: 10,
  maxBalasPerHari: 30,
  maxPerTujuan: 3,
  jedaDetik: 15,
  biayaEnergi: 1,
  kedaluwarsaJam: 72,
  simpanHari: 14,
  laporBan: 3,
  blokirLink: true,
  blokirNomor: true,
  kataTerlarang: [],
};

const KEYS = [
  "menfess",
  "menfessMsg",
  "menfessPair",
  "menfessBlock",
  "menfessBan",
  "menfessLapor",
];

// ───────── dasar ─────────

export const cfg = () => ({ ...DEFAULTS, ...(config.menfess || {}) });

/** Nomor saja dari JID (buang domain & device suffix). */
export const numOf = (jid) =>
  String(jid || "")
    .replace(/@.+$/, "")
    .replace(/:\d+$/, "")
    .replace(/\D/g, "");

export const same = (a, b) => {
  const x = numOf(a);
  return Boolean(x) && x === numOf(b);
};

/** JID tujuan untuk mengirim pesan. Pertahankan domain @lid kalau memang begitu. */
export const toJid = (jid) => {
  const s = String(jid || "");
  const domain = s.includes("@") ? s.split("@")[1] : "s.whatsapp.net";
  return `${numOf(s)}@${domain}`;
};

export function store() {
  const db = getDatabase();
  if (!db.db.data.menfess) db.db.data.menfess = {};
  const k = db.db.data.menfess;
  for (const key of KEYS) if (!k[key] || typeof k[key] !== "object") k[key] = {};
  return k;
}

export function saveStore() {
  try {
    getDatabase().markDirty("menfess");
  } catch {}
}

/** Data user dari database Miku (dibuat kalau belum ada). */
export function userData(jid) {
  const db = getDatabase();
  return db.getUser(jid) || db.setUser(jid) || null;
}

function saveUsers() {
  try {
    getDatabase().markDirty("users");
  } catch {}
}

export function wibDay(t = Date.now()) {
  return new Date(t).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

// ───────── validasi & pencatatan ─────────

/** 08xx / 8xx / +62 8xx → 628xx. Mengembalikan string kosong kalau tidak valid. */
export function menfessNomor(input) {
  let n = String(input || "").replace(/\D/g, "");
  if (!n) return "";
  if (n.startsWith("0")) n = "62" + n.slice(1);
  else if (n.startsWith("8")) n = "62" + n;
  return n;
}

export function menfessId(k) {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 50; i++) {
    let id = "";
    for (let j = 0; j < 5; j++) id += abc[Math.floor(Math.random() * abc.length)];
    if (!k.menfess[id]) return id;
  }
  return Date.now().toString(36).slice(-5).toUpperCase();
}

/** Mengembalikan teks error kalau isi pesan tidak boleh, atau null kalau aman. */
export function menfessIsi(pesan, c = cfg()) {
  const t = String(pesan || "").trim();
  if (!t) return "El mensaje no puede estar vacío.";
  if (t.length > c.maxPanjang) return `El mensaje es demasiado largo (máx. ${c.maxPanjang} caracteres).`;
  if (c.blokirLink && /(https?:\/\/|www\.|wa\.me|chat\.whatsapp\.com|\b[a-z0-9-]+\.(com|net|org|xyz|io|me|co|link|site|online|my\.id|id)\b)/i.test(t)) {
    return "El mensaje no puede contener enlaces.";
  }
  if (c.blokirNomor) {
    const rapat = t.replace(/[\s.\-()]/g, "");
    if (/(\+?62|0)8\d{7,12}/.test(rapat) || /\d{10,}/.test(rapat)) {
      return "El mensaje no puede contener números de teléfono.";
    }
  }
  const low = t.toLowerCase();
  for (const w of c.kataTerlarang || []) {
    if (w && low.includes(String(w).toLowerCase())) return "El mensaje contiene una palabra no permitida.";
  }
  return null;
}

function logHariIni(user) {
  const hari = wibDay();
  if (!user.menfessLog || user.menfessLog.day !== hari) {
    user.menfessLog = { day: hari, n: 0, nb: 0 };
  }
  return user.menfessLog;
}

/** Cek batas harian & jeda. Mengembalikan teks error atau null. */
export function menfessBatas(user, c = cfg()) {
  if (!user) return null;
  const l = user.menfessLog?.day === wibDay() ? user.menfessLog : { n: 0, nb: 0 };
  if ((l.n || 0) >= c.maxPerHari) {
    return `Ya alcanzaste el límite diario de mensajes anónimos (${l.n}/${c.maxPerHari}). Inténtalo mañana.`;
  }
  const sisa = Math.ceil(((user.menfessLast || 0) + c.jedaDetik * 1000 - Date.now()) / 1000);
  if (sisa > 0) return `Espera ${sisa} segundos antes de volver a enviar.`;
  return null;
}

export function menfessCatat(user, tipe) {
  if (!user) return;
  const l = logHariIni(user);
  if (tipe === "balas") l.nb = (l.nb || 0) + 1;
  else l.n = (l.n || 0) + 1;
  user.menfessLast = Date.now();
  saveUsers();
}

export function menfessAktif(d, c = cfg()) {
  if (!d || d.tutup) return false;
  return Date.now() - (d.last || d.t || 0) < c.kedaluwarsaJam * 3600 * 1000;
}

export function menfessPetakan(k, msgId, id) {
  if (msgId) k.menfessMsg[msgId] = id;
}

export function menfessFooter(prefix = ".", id = "") {
  return `_Responder anónimo: responde a este mensaje · Bloquear: ${prefix}blokmenfess · Reportar: ${prefix}lapormenfess ${id} motivo_`;
}

/** Hapus menfess lama + petakan pesan yatim supaya database tidak membengkak. */
export function menfessRapikan(k) {
  const c = cfg();
  const now = Date.now();
  const batas = now - c.simpanHari * 86400000;
  const batasLapor = now - c.simpanHari * 4 * 86400000; // laporan disimpan lebih lama sebagai bukti
  for (const [id, d] of Object.entries(k.menfess)) {
    const t = d.last || d.t || 0;
    if (t < (d.dilapor ? batasLapor : batas)) delete k.menfess[id];
  }
  const msgs = Object.keys(k.menfessMsg);
  for (const mid of msgs) if (!k.menfess[k.menfessMsg[mid]]) delete k.menfessMsg[mid];
  const sisa = Object.keys(k.menfessMsg);
  if (sisa.length > 5000) for (const mid of sisa.slice(0, sisa.length - 5000)) delete k.menfessMsg[mid];
}

/**
 * Cari menfess milik jid (sebagai pengirim atau penerima).
 *  - id        : ID 5 karakter
 *  - quotedId  : ID pesan WA yang di-reply
 *  - tanpa keduanya: yang terbaru & masih aktif (utamakan sebagai penerima)
 */
export function menfessCari(k, jid, { id = "", quotedId = "" } = {}) {
  const ikut = (d) => d && (same(d.from, jid) || same(d.to, jid));
  if (id) {
    const d = k.menfess[String(id).toUpperCase()];
    return ikut(d) ? { id: String(id).toUpperCase(), d } : null;
  }
  if (quotedId) {
    const tid = k.menfessMsg[quotedId];
    const d = tid && k.menfess[tid];
    if (ikut(d)) return { id: tid, d };
  }
  const c = cfg();
  const aktif = Object.entries(k.menfess)
    .filter(([, d]) => ikut(d) && menfessAktif(d, c))
    .sort((a, b) => (b[1].last || b[1].t) - (a[1].last || a[1].t));
  const masuk = aktif.find(([, d]) => same(d.to, jid));
  const pick = masuk || aktif[0];
  return pick ? { id: pick[0], d: pick[1] } : null;
}

// ───────── aksi ─────────

/** Kirim balasan anonim di dalam satu menfess (penerima → pengirim, atau pengirim → penerima). */
export async function menfessBalas(sock, { jid, user, id, d, pesan, prefix = "." }) {
  const c = cfg();
  const k = store();
  if (!c.on) return { ok: false, msg: "La función de mensajes anónimos está desactivada." };
  if (d.tutup) return { ok: false, msg: "Ese mensaje anónimo fue retirado y ya no se puede responder." };
  if (!menfessAktif(d, c)) {
    return { ok: false, msg: `El mensaje anónimo #${id} caducó (más de ${c.kedaluwarsaJam} horas sin actividad).` };
  }
  const ban = k.menfessBan[numOf(jid)];
  if (ban) return { ok: false, msg: "🚫 Tienes prohibido usar los mensajes anónimos." + (ban.alasan ? `\nMotivo: ${ban.alasan}` : "") };

  const salah = menfessIsi(pesan, c);
  if (salah) return { ok: false, msg: salah };

  const l = user?.menfessLog?.day === wibDay() ? user.menfessLog : { nb: 0 };
  if ((l.nb || 0) >= c.maxBalasPerHari) {
    return { ok: false, msg: `Ya alcanzaste el límite diario de respuestas anónimas (${l.nb}/${c.maxBalasPerHari}).` };
  }
  const sisa = Math.ceil(((user?.menfessLast || 0) + c.jedaDetik * 1000 - Date.now()) / 1000);
  if (sisa > 0) return { ok: false, msg: `Espera ${sisa} segundos antes de responder.` };

  const penerima = same(d.to, jid);
  const tujuan = penerima ? d.from : d.to;
  if (!penerima && (k.menfessBlock[numOf(d.to)] || k.menfessPair[`${numOf(d.to)}|${numOf(d.from)}`])) {
    return { ok: false, msg: "El destinatario no acepta mensajes anónimos." };
  }

  const teks = penerima
    ? `💬 *RESPUESTA ANÓNIMA* · #${id}\n\nEl destinatario respondió a tu mensaje:\n\n“${pesan}”\n\n_Responde a este mensaje para seguir la conversación._`
    : `💌 *ANÓNIMO* · #${id}\n\n*${user?.menfessNama || "Alguien"}* responde:\n\n“${pesan}”\n\n${menfessFooter(prefix, id)}`;

  let sent;
  try {
    sent = await sock.sendMessage(toJid(tujuan), { text: teks });
  } catch {
    return { ok: false, msg: "No se pudo enviar: no se puede contactar con la otra persona." };
  }

  const now = Date.now();
  d.log = d.log || [{ by: "a", t: d.t, pesan: d.pesan }];
  d.log.push({ by: penerima ? "b" : "a", t: now, pesan });
  if (d.log.length > 50) d.log = d.log.slice(-50);
  d.last = now;
  if (!penerima && sent?.key?.id) {
    d.kirim = d.kirim || [];
    d.kirim.push(sent.key.id);
  }
  menfessPetakan(k, sent?.key?.id, id);
  saveStore();
  menfessCatat(user, "balas");
  return { ok: true, msg: `✅ Respuesta enviada de forma anónima ${penerima ? "al remitente" : "al destinatario"} (anónimo #${id}).` };
}

/** Laporkan menfess yang melecehkan / spam ke owner. Pengirim diban otomatis setelah beberapa laporan. */
export async function menfessLapor(sock, { jid, id, d, alasan = "" }) {
  const c = cfg();
  const k = store();
  if (d.dilapor) return { ok: false, msg: "Este mensaje anónimo ya fue reportado." };

  const dari = numOf(d.from);
  const rec = k.menfessLapor[dari] || { n: 0, last: 0 };
  rec.n += 1;
  rec.last = Date.now();
  k.menfessLapor[dari] = rec;
  d.dilapor = true;
  d.alasanLapor = alasan || "-";

  let diban = false;
  if (c.laporBan > 0 && rec.n >= c.laporBan && !k.menfessBan[dari]) {
    k.menfessBan[dari] = { t: Date.now(), alasan: `Reportado ${rec.n} veces`, oleh: "sistem" };
    diban = true;
  }
  saveStore();

  const info =
    `🚨 *LAPORAN MENFESS* #${id}\n\n` +
    `Reportado por: ${numOf(jid)}\nRemitente   : ${dari}\nMotivo      : ${alasan || "-"}\n` +
    `Total de reportes al remitente: ${rec.n}${diban ? " (baneado automáticamente)" : ""}\n\n` +
    `Ver el contenido: ${config.command?.prefix || "."}cekmenfess ${id}`;
  const owners = Array.isArray(config.owner?.number) ? config.owner.number : [];
  for (const o of owners) {
    const n = numOf(o);
    if (n) await sock.sendMessage(`${n}@s.whatsapp.net`, { text: info }).catch(() => {});
  }
  return { ok: true, msg: "Reporte enviado al dueño. Gracias por avisar." };
}

/**
 * Balas tanpa perintah: reply pesan menfess dari bot di chat pribadi, tulis balasanmu, selesai.
 * Dipanggil dari handler.js untuk pesan non-command. Mengembalikan true kalau pesan sudah ditangani.
 */
export async function menfessReplyHandler(m, { sock }) {
  try {
    if (m.isGroup || m.fromMe) return false;
    const qid = m.quoted?.id || m.quoted?.key?.id;
    if (!qid) return false;
    const k = store();
    const tid = k.menfessMsg[qid];
    const d = tid && k.menfess[tid];
    if (!d) return false;
    if (!same(d.from, m.sender) && !same(d.to, m.sender)) return false;
    if (!cfg().on) return false;
    const pesan = String(m.body || m.text || "").trim();
    if (!pesan) return false;
    const r = await menfessBalas(sock, {
      jid: m.sender,
      user: userData(m.sender),
      id: tid,
      d,
      pesan,
      prefix: m.prefix || config.command?.prefix || ".",
    });
    await m.reply(r.msg);
    return true;
  } catch (e) {
    console.error("[menfess] reply handler:", e.message);
    return false;
  }
}

/**
 * Bayar energi untuk aksi menfess. Owner/partner/premium & energi tak terbatas gratis.
 * Mengembalikan { biaya, bayar, kurang }.
 */
export function menfessBiaya(m, c = cfg()) {
  const db = getDatabase();
  const biaya = Number(c.biayaEnergi) || 0;
  const aktif = db.setting("energi") !== undefined ? db.setting("energi") : config.energi?.enabled !== false;
  const user = db.getUser(m.sender);
  const bebas = !aktif || m.isOwner || m.isPartner || m.isPremium || user?.energi === -1;
  const bayar = biaya > 0 && !bebas;
  return { biaya, bayar, kurang: bayar && (Number(user?.energi) || 0) < biaya };
}

export function menfessBayar(m, biaya) {
  try {
    getDatabase().updateEnergi(m.sender, -biaya);
  } catch {}
}
