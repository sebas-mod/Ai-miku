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
    `╭─❖「 ▲ *TOKEN DE VERCEL SIN CONFIGURAR* 」\n` +
    `│ Todavía no guardaste tu token de API de Vercel.\n` +
    `├───〔 *CÓMO CONFIGURAR EL TOKEN* 〕\n` +
    `│ 1. Abre https://vercel.com/account/tokens\n` +
    `│ 2. Crea un token nuevo (Full Account / Project scope)\n` +
    `│ 3. Escribe \`${prefix}setvercel <tu_token>\`\n` +
    `╰─────────────────────❖\n` +
    `_El token se guarda en tu cuenta (revísalo con \`${prefix}mytoken\`)._`
  );
}
