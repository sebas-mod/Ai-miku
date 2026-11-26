/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: "claude",
  alias: [],
  category: "ai",
  description: "Tanya jawab dengan Claude AI",
  usage: ".claude <pertanyaan>",
  example: ".claude jelaskan cara kerja blockchain",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const API_URL = "https://v2.api-varhad.my.id/ai/claude";
const TIMEOUT_MS = 20_000;
const ANSWER_KEYS = ["result", "answer", "response", "data", "message", "text", "content"];

async function askClaude(prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}?prompt=${encodeURIComponent(prompt)}`, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    const raw = await res.text();
    let json = null;
    try {
      json = JSON.parse(raw);
    } catch {}
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${json?.message || json?.error || raw.slice(0, 200)}`);
    }
    return json ?? raw;
  } finally {
    clearTimeout(timer);
  }
}

// Cari teks jawaban di dalam respons API yang bentuknya bisa berbeda-beda
function extractAnswer(data) {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "";
  for (const key of ANSWER_KEYS) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
    if (value && typeof value === "object") {
      const nested = extractAnswer(value);
      if (nested) return nested;
    }
  }
  return "";
}

async function handler(m, { text, prefix, command }) {
  const question = String(text || m.quoted?.text || "").trim();
  if (!question) {
    return m.reply(`*Contoh:*\n${prefix || "."}${command || "claude"} jelaskan cara kerja blockchain`);
  }

  try {
    await m.react?.("⏳");
    const answer = extractAnswer(await askClaude(question)).trim();
    if (!answer) throw new Error("API tidak mengembalikan jawaban.");
    await m.react?.("✅");
    return m.reply(answer);
  } catch (e) {
    console.error("[claude]", e);
    await m.react?.("❌");
    const reason = e?.name === "AbortError" ? "Timeout, coba lagi." : e?.message || e;
    return m.reply(`❌ Gagal: ${reason}`);
  }
}

export { pluginConfig as config, handler };
