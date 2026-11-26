/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { createHash, randomBytes } from "node:crypto";

const pluginConfig = {
  name: "viuprem",
  alias: ["viu"],
  category: "premium",
  description: "Generate akun VIU Premium gratis berdasarkan Device ID",
  usage: ".viuprem [device_id]",
  example: ".viuprem",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36";
const VIU_ENDPOINT = "https://viu.interflazz.my.id/?action=account";
const TIMEOUT_MS = 20000;

function makeDeviceId(seed = null) {
  if (seed) {
    return createHash("md5").update(String(seed)).digest("hex");
  }
  return randomBytes(16).toString("hex");
}

async function fetchViuAccount(deviceId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(VIU_ENDPOINT, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        "Content-Type": "application/json",
        Origin: "https://viu.interflazz.my.id",
        Referer: "https://viu.interflazz.my.id/",
      },
      body: JSON.stringify({ device_id: deviceId }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Request timeout setelah ${TIMEOUT_MS}ms`);
    }
    throw new Error(`Koneksi gagal: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respon server bukan JSON valid.");
  }

  if (!data.success) {
    throw new Error(data.message || "Gagal mengambil akun VIU.");
  }

  return {
    message: data.message ?? "OK",
    is_new: Boolean(data.is_new),
    device_id: data.device_id ?? deviceId,
    email: data.account?.email ?? "-",
    password: data.account?.password ?? "-",
    fetched_at: new Date().toISOString(),
  };
}

async function handler(m) {
  const p = m.prefix || ".";
  const raw = String(m.text || m.quoted?.text || m.quoted?.body || "").trim();

  if (/^(help|\?|-h|--help)$/i.test(raw)) {
    return m.reply(
      `╭─── ❖ 『 🎬 *VIU PREMIUM ACCOUNT* 』 ❖\n` +
        `│ ✧ \`${p}viuprem\` — Generate akun baru (Device ID acak)\n` +
        `│ ✧ \`${p}viuprem <device_id>\` — Login ulang pakai Device ID tersimpan\n` +
        `╰──────────────────────────❖`
    );
  }

  let deviceId = "";
  const flagMatch = raw.match(/(?:--device|-d)\s+([a-f0-9]{32})/i);
  if (flagMatch) {
    deviceId = flagMatch[1].toLowerCase();
  } else {
    const idMatch = raw.match(/\b([a-f0-9]{32})\b/i);
    if (idMatch) deviceId = idMatch[1].toLowerCase();
  }

  if (!deviceId) {
    deviceId = raw ? makeDeviceId(raw) : makeDeviceId();
  }

  await m.react("⏳").catch(() => {});
  try {
    const acc = await fetchViuAccount(deviceId);
    const status = acc.is_new ? "🆕 Akun Baru" : "♻️ Akun Existing";
    const timeFmt = new Date(acc.fetched_at).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });

    await m.react("✅").catch(() => {});
    return m.reply(
      `╭─── ❖ 『 🎬 *VIU PREMIUM ACCOUNT* 』 ❖\n` +
        `│ 📧 *Email:* \`${acc.email}\`\n` +
        `│ 🔑 *Password:* \`${acc.password}\`\n` +
        `│ 🆔 *Device ID:* \`${acc.device_id}\`\n` +
        `│ 🏷️ *Status:* ${status}\n` +
        `│ 🕒 *Waktu:* ${timeFmt}\n` +
        `╰──────────────────────────❖\n` +
        `_✦ Simpan Device ID kamu untuk mengambil ulang akun yang sama di viu.com (jangan ubah password)._`
    );
  } catch (err) {
    await m.react("❌").catch(() => {});
    return m.reply(`❌ *Gagal mengambil akun VIU:* ${err.message}`);
  }
}

export { pluginConfig as config, handler };
