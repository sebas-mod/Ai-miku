import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["plugins", "src"];
const SCAN_FILES = ["index.js", "config.js"];

const EN_HIGH = [
  "please", "please wait", "try again", "not found", "no results", "no result", "access denied",
  "permission denied", "processing", "loading", "successful", "failed", "invalid", "missing",
  "unknown", "unknown error", "welcome to", "goodbye from", "are required", "is required",
  "must be", "not available", "you are", "your", "cannot", "can't", "doesn't", "don't",
  "isn't", "wasn't", "won't", "needs", "wants", "thank you", "thanks", "sorry", "hello",
  "goodbye", "please provide", "provide a", "expected", "received", "requires", "required",
  "not allowed", "already", "never", "always", "sometimes", "tomorrow", "yesterday",
  "select", "choose", "click", "enter a", "wait a", "try to", "help me", "allow", "denied",
];
const EN_WEAK = [
  "the", "and", "or", "but", "if", "then", "when", "where", "what", "who", "how", "why",
  "is", "are", "was", "were", "be", "been", "have", "had", "do", "does", "did", "will",
  "would", "can", "could", "should", "may", "might", "must", "not", "we", "our", "they",
  "their", "she", "it", "its", "this", "that", "these", "those", "there", "here",
  "with", "without", "for", "from", "into", "about", "after", "before", "over", "under",
  "like", "just", "only", "very", "too", "also", "still", "again", "get", "got", "make",
  "made", "use", "used", "using", "give", "take", "send", "sent", "find", "found", "try",
  "wait", "success", "fail", "empty", "exists", "available", "created", "deleted", "updated",
  "added", "removed", "started", "stopped", "finished", "completed", "done", "ready", "open",
  "close", "back", "next", "previous", "first", "last", "new", "old", "good", "bad", "best",
  "better", "more", "less", "many", "some", "any", "every", "one", "two", "three", "minute",
  "hour", "day", "week", "month", "year", "today", "now", "yes", "bye", "help", "need",
  "want", "found",
];
const ID_HIGH = [
  "yang", "dengan", "untuk", "tidak", "adalah", "saya", "kamu", "anda", "mereka", "kita",
  "dari", "pada", "jika", "kalau", "karena", "sebelum", "setelah", "sedang", "akan", "sudah",
  "belum", "sangat", "sekali", "silakan", "silahkan", "maaf", "tolong", "harap", "berhasil",
  "gagal", "sukses", "ditemukan", "tidak ditemukan", "masukkan", "ketik", "pilih", "kembali",
  "menunggu", "terdeteksi", "dihapus", "diblokir", "ditambahkan", "tersedia", "diterima",
  "ditolak", "dibatalkan", "terhubung", "terputus", "dimulai", "berhenti", "dibutuhkan",
  "bahwa", "sehingga", "antara", "dalam", "sekarang", "nanti", "kemarin", "besok", "pencarian",
  "terima kasih", "diperbarui", "disimpan", "dikirim", "ditampilkan", "terakhir", "berjalan",
];
const ID_WEAK = [
  "dan", "ini", "itu", "dia", "lagi", "waktu", "menit", "detik", "jam", "hari", "minggu",
  "bulan", "tahun", "uang", "poin", "koin", "pengguna", "beli", "harga", "selesai", "mulai",
  "tunggu", "maka", "yaitu", "seperti", "luar", "atas", "bawah", "depan", "belakang",
  "samping", "kiri", "kanan", "tengah", "pagi", "siang", "sore", "malam", "daftar", "ulang",
  "terima", "ditutup", "dibuka", "diubah", "dihitung", "dikenakan", "sebentar", "satu",
  "mengembalikan", "halaman", "bisu",
];
const SPANISH = [
  "el", "la", "los", "las", "un", "una", "que", "con", "por", "para", "del", "en", "es",
  "son", "está", "están", "este", "esta", "estos", "estas", "tu", "tus", "su", "sus", "no",
  "sí", "pero", "como", "cuando", "donde", "hay", "me", "te", "se", "le", "lo", "más", "muy",
  "ya", "aún", "todavía", "también", "porque", "usted", "tú", "nosotros", "nuestro", "nuestra",
  "gracias", "hola", "adiós", "ayuda", "envía", "envia", "descarga", "puede", "puedes", "eres",
  "soy", "somos", "tiene", "tienen", "hacer", "decir", "ver", "dar", "ir", "ser", "estar",
];

function boundary(word) {
  return { word, re: new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(word)}(?![\\p{L}\\p{N}_])`, "giu") };
}
const RE = {
  enHigh: EN_HIGH.map(boundary),
  enWeak: EN_WEAK.map(boundary),
  idHigh: ID_HIGH.map(boundary),
  idWeak: ID_WEAK.map(boundary),
  es: SPANISH.map(boundary),
};

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matches(text, patterns) {
  const found = new Set();
  for (const { word, re } of patterns) {
    re.lastIndex = 0;
    if (re.test(text)) found.add(word);
  }
  return [...found];
}

const VISIBLE_KEYS = new Set([
  "description", "usage", "example", "caption", "text", "title", "label", "message",
  "content", "footer", "placeholder", "wait", "success", "error", "reply", "body",
  "mensaje", "respuesta", "descripcion", "titulo", "contenido", "value",
]);
const INTERNAL_KEYS = new Set([
  "name", "alias", "command", "tags", "category", "prefix", "usedPrefix", "method", "url",
  "path", "file", "fileName", "filename", "mime", "mimetype", "type", "headers", "header",
  "env", "model", "provider", "runtime", "agent", "workspacePath", "locale", "lang",
  "encoding", "format", "event", "id", "jid", "endpoint", "apikey", "apiKey", "token",
  "key", "color", "font", "className", "class", "selector", "mode", "status", "action",
  "eventName", "source", "target", "hook", "scope", "tag", "day", "time", "studio",
  "season", "language", "country", "code", "value2", "value3",
]);

function isRegexStart(before) {
  const prev = before.replace(/\s+$/, "").slice(-1);
  return !prev || !/[\w$)\]]/.test(prev);
}

function decodeEscape(c) {
  const map = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", "0": "\0" };
  return Object.hasOwn(map, c) ? map[c] : c;
}

function scanStrings(source) {
  const result = [];
  let i = 0;
  let line = 1;
  const len = source.length;

  while (i < len) {
    const ch = source[i];
    if (ch === "\n") { line++; i++; continue; }
    if (ch === "/" && source[i + 1] === "/") {
      while (i < len && source[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      i += 2;
      while (i < len) {
        if (source[i] === "\n") line++;
        if (source[i] === "*" && source[i + 1] === "/") { i += 2; break; }
        i++;
      }
      continue;
    }
    if (ch === "/" && isRegexStart(source.slice(Math.max(0, i - 60), i))) {
      i++;
      let inClass = false;
      while (i < len) {
        const c = source[i];
        if (c === "\\") { i += 2; continue; }
        if (c === "\n") line++;
        if (c === "[") inClass = true;
        if (c === "]") inClass = false;
        if (c === "/" && !inClass) {
          i++;
          while (i < len && /[a-z]/i.test(source[i])) i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (ch !== '"' && ch !== "'" && ch !== "`") { i++; continue; }

    const quote = ch;
    const start = i;
    const startLine = line;
    i++;
    let raw = "";

    while (i < len) {
      const c = source[i];
      if (c === "\\") {
        raw += decodeEscape(source[i + 1] ?? "");
        if (source[i + 1] === "\n") line++;
        i += 2;
        continue;
      }
      if (quote === "`" && c === "$" && source[i + 1] === "{") {
        let depth = 1;
        i += 2;
        raw += " ";
        while (i < len && depth > 0) {
          const d = source[i];
          if (d === "{") depth++;
          else if (d === "}") depth--;
          else if (d === '"' || d === "'" || d === "`") {
            const q = d;
            i++;
            while (i < len) {
              if (source[i] === "\\") { i += 2; continue; }
              if (source[i] === q) { i++; break; }
              i++;
            }
            continue;
          }
          i++;
        }
        continue;
      }
      if (c === "\n") {
        line++;
        if (quote !== "`") break;
      }
      if (c === quote) { i++; break; }
      raw += c;
      i++;
    }

    result.push({ raw, line: startLine, start, end: i, before: source.slice(Math.max(0, start - 360), start), after: source.slice(i, i + 360) });
  }
  return result;
}

function looksLikeCode(text) {
  const t = text.trim();
  if (/Mozilla\/|AppleWebKit|Gecko|Chrome\/|Safari\/|Chromium|Not\.A\/Brand/i.test(t)) return true;
  if (/^([.#]|[a-z]+\s*\{)/.test(t) && /[:(){}[\]]/.test(t)) return true;
  if (/\b(?:xmlns|doctype|viewBox|stroke-width|user-select|justify-content|linear-gradient|__BASECSS__|display\s*:|padding\s*:)\b/i.test(t)) return true;
  if (/<\/?[a-z][\s>]/i.test(t) && /[<>]/.test(t)) return true;
  if (/^\s*<<\s*\//.test(t)) return true;
  if (/\bif\s+__name__|def\s+\w+\s*\(|None:|=>/.test(t)) return true;
  if (/^[a-z]+\s*:/.test(t) && /\b(?:css|json|yaml)\b/i.test(t)) return true;
  if (/^(?:ffmpeg|wmic|curl|wget)\s/.test(t)) return true;
  if (/^\s*[qQ]\s+\d/.test(t)) return true;
  if (/^[.`>]*[a-z][\w-]*\s+(?:on|off|open|close|add|del|hapus|set|get)\b/i.test(t) && /[<>|`]/.test(t)) return true;
  if (/^[.>]\s*[a-z][\w-]*\b/i.test(t) && /[<>[\]|]/.test(t)) return true;
  return false;
}

function looksTechnical(text) {
  const t = text.trim();
  if (!t) return true;
  if (/^[\s\d\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(t)) return true;
  if (/^[a-zA-Z0-9_.~:/?#\[\]@!$&'()*+,;=%-]+$/.test(t) && !/\s/.test(t)) return true;
  if (/https?:\/\/|www\.|@g\.us|@s\.whatsapp\.net|@lid\b/i.test(t) && !/[a-z]{4,}\s+[a-z]{4,}/i.test(t)) return true;
  if (/^[.#]+[\w-]+$/.test(t)) return true;
  return false;
}

function isDataListEntry(source, token) {
  const around = source.slice(Math.max(0, token.start - 600), token.start) + source.slice(token.end, token.end + 600);
  const entries = around.split("\n").filter((l) => /^\s*["'][^"'\n]{2,80}["'],?\s*$/.test(l));
  return entries.length >= 4;
}

function keyFromBefore(before) {
  const line = before.split("\n").pop() ?? "";
  const q = line.match(/["']([\w$-]+)["']\s*:\s*$/);
  if (q) return q[1];
  const m = line.match(/([\w$]+)\s*[:=]\s*$/);
  return m ? m[1] : null;
}

function excludedContext(before, key) {
  if (/\b(?:console|logger|log|debug)\s*\.\s*\w+\s*\([\s\S]*$/i.test(before)) return true;
  if (/\b(?:logger|log|debug|simpanDebug)\s*\([\s\S]*$/i.test(before)) return true;
  const last = before.split("\n").pop() ?? "";
  if (/\b(?:from|import|require|export)\b/.test(last)) return true;
  if (/\bcase\s+$/.test(before)) return true;
  if (/\.(?:includes|startsWith|endsWith|match|test|split)\(\s*$/.test(before)) return true;
  if (key && INTERNAL_KEYS.has(key) && !VISIBLE_KEYS.has(key)) return true;
  return false;
}

function properNounTitle(text, key) {
  if (key !== "title") return false;
  const words = text.trim().split(/\s+/);
  if (words.length < 2 || words.length > 6) return false;
  const capitalized = words.filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w)).length;
  return capitalized >= 2 && !/[.!?¿¡]/.test(text);
}

function collectFiles() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    const stack = [abs];
    while (stack.length) {
      const cur = stack.pop();
      for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
        const full = path.join(cur, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else if (entry.isFile() && entry.name.endsWith(".js")) files.push(full);
      }
    }
  }
  for (const name of SCAN_FILES) {
    const full = path.join(ROOT, name);
    if (fs.existsSync(full)) files.push(full);
  }
  return files.sort();
}

function loadAllowList(file) {
  if (!file) return new Set();
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.error(`No se encontró la lista de excepciones: ${abs}`);
    process.exit(2);
  }
  const data = JSON.parse(fs.readFileSync(abs, "utf8"));
  const items = Array.isArray(data) ? data : data.allow ?? [];
  return new Set(items.map((x) => (typeof x === "string" ? x : `${x.file}:${x.line}`)));
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const quiet = args.includes("--quiet");
const strict = args.includes("--strict");
const defaultAllowList = path.join(ROOT, "test", "i18n-allowlist.json");
const allowArg = args.find((a) => a.startsWith("--allow-list=")) ?? (fs.existsSync(defaultAllowList) ? `--allow-list=${defaultAllowList}` : null);
const allowList = loadAllowList(allowArg ? allowArg.slice("--allow-list=".length) : null);

const confirmed = [];
const review = [];
let filesScanned = 0;

for (const file of collectFiles()) {
  filesScanned++;
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const source = fs.readFileSync(file, "utf8");
  for (const token of scanStrings(source)) {
    const text = token.raw;
    const isMessageConfig = /^src\/settings\/message/.test(rel);
    const enHigh = matches(text, RE.enHigh);
    const idHigh = matches(text, RE.idHigh);
    if (!isMessageConfig && (looksTechnical(text) || looksLikeCode(text))) continue;
    const key = keyFromBefore(token.before);
    if (excludedContext(token.before, key)) continue;

    const enWeak = matches(text, RE.enWeak);
    const idWeak = matches(text, RE.idWeak);
    const es = matches(text, RE.es);
    const high = [...enHigh, ...idHigh];
    const weak = [...enWeak, ...idWeak];
    if (!high.length && !weak.length) continue;
    if (es.length >= 2 && !high.length) continue;
    const looksLikeMessage = /[!?¿¡*]|\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(text);
    if (!isMessageConfig && isDataListEntry(source, token) && !looksLikeMessage && es.length < 2) continue;
    if (properNounTitle(text, key) && !looksLikeMessage && es.length < 2) continue;

    const idTag = `${rel}:${token.line}`;
    if (allowList.has(idTag) || allowList.has(`${idTag}:${text}`)) continue;

    const lang = idHigh.length || idWeak.length ? (enHigh.length || enWeak.length ? "en+id" : "id") : "en";
    const entry = {
      file: rel,
      line: token.line,
      lang,
      text: text.replace(/\s+/g, " ").trim().slice(0, 220),
      signals: [...new Set([...high, ...weak])].slice(0, 10),
    };
    if (high.length || (enWeak.length >= 2 && !es.length) || (idWeak.length >= 2 && !es.length)) {
      confirmed.push(entry);
    } else {
      review.push(entry);
    }
  }
}

const byLanguage = (list) => list.reduce((acc, f) => {
  acc[f.lang] = (acc[f.lang] ?? 0) + 1;
  return acc;
}, {});
const summary = {
  filesScanned,
  confirmed: confirmed.length,
  review: review.length,
  confirmedByLanguage: byLanguage(confirmed),
};

function printList(title, list) {
  if (!list.length) return;
  console.log(`\n${title} (${list.length})`);
  for (const f of list) {
    console.log(`${f.file}:${f.line}  [${f.lang}]  ${f.text}`);
    if (!quiet) console.log(`    señales: ${f.signals.join(", ")}`);
  }
}

if (asJson) {
  console.log(JSON.stringify({ summary, confirmed, review }, null, 2));
} else {
  if (!quiet) {
    console.log(`Archivos escaneados: ${summary.filesScanned}`);
    console.log(`Confirmados: ${summary.confirmed} | Revisar: ${summary.review}`);
    console.log(`Por idioma: ${JSON.stringify(summary.confirmedByLanguage)}`);
  }
  printList("PENDIENTE DE TRADUCIR", confirmed);
  if (!quiet) printList("REVISAR (señal débil)", review);
}

if (confirmed.length || (strict && review.length)) process.exit(1);
