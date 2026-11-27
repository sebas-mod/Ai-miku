/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";
import config from "../../../config.js";
import { MikuRuntime } from "../system/bridge.js";

const VERCEL_API = "https://api.vercel.com";

export function getVercelToken(sender) {
  try {
    const own = MikuRuntime.allOwn?.(sender);
    if (own?.vercel?.token) return own.vercel.token;
  } catch {}
  return config?.apikey?.vercel || process.env.VERCEL_TOKEN || "";
}

export function setVercelToken(sender, token) {
  if (typeof MikuRuntime.setOwn === "function") {
    MikuRuntime.setOwn(sender, "vercel", {
      token,
      updatedAt: Date.now(),
    });
    return true;
  }
  return false;
}

export async function vercelRequest(token, method, endpoint, data = undefined, params = undefined) {
  const res = await axios({
    method,
    url: `${VERCEL_API}${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data,
    params,
    timeout: 30000,
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    const errMsg =
      res.data?.error?.message ||
      res.data?.message ||
      `HTTP ${res.status}`;
    throw new Error(errMsg);
  }
  return res.data;
}

export function sanitizeProjectName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function missingTokenReply(prefix = ".") {
  return (
    `╭─❖「 ▲ *TOKEN VERCEL BELUM DISET* 」\n` +
    `│ Kamu belum menyimpan Vercel API Token.\n` +
    `├───〔 *CARA SET TOKEN* 〕\n` +
    `│ 1. Buka https://vercel.com/account/tokens\n` +
    `│ 2. Buat token baru (Full Account / Project scope)\n` +
    `│ 3. Ketik \`${prefix}setvercel <token_kamu>\`\n` +
    `╰─────────────────────❖\n` +
    `_Token tersimpan pribadi di akunmu (cek via \`${prefix}mytoken\`)._`
  );
}
