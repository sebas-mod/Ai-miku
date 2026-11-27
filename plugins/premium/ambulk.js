/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";

const pluginConfig = {
  name: "ambulk",
  alias: ["ambulkprem"],
  category: "premium",
  description: "Klaim otomatis akun Alight Motion Premium menggunakan temp-mail",
  usage: ".ambulk [jumlah]",
  example: ".ambulk 1",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

const MAIL_API = "https://tempmail-donz.vercel.app/api";
const MAIL_WEB = "https://tempmail-donz.vercel.app";
const CLAIM_API = "https://am.noxxyrorr.biz.id/api";

const MAX_BATCH = 3;
const POLL_MAX = 20;
const POLL_WAIT = 3000;
const BATCH_GAP = 2000;

const client = axios.create({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
  },
  timeout: 30000,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const activeJobs = new Set();

async function createTempEmail() {
  const { data } = await client.post(`${MAIL_API}/create`, {});
  if (!data?.success || !data?.email) {
    throw new Error("No se pudo crear un correo electrónico temporal");
  }
  return { email: data.email, token: data.token };
}

async function requestMagicLink(email) {
  const { data } = await client.post(`${CLAIM_API}/send-link`, { email });
  if (!data?.success) {
    throw new Error(data?.message || "No se pudo enviar el enlace mágico");
  }
  return data;
}

async function pollMagicLink(email) {
  const encoded = encodeURIComponent(email);
  for (let i = 1; i <= POLL_MAX; i++) {
    try {
      const { data } = await client.get(`${MAIL_API}/inbox/${encoded}`);
      if (Array.isArray(data) && data.length > 0) {
        for (const mail of data) {
          const html = mail.body_html || "";
          const match = html.match(
            /href=['"]([^'"]+alight-creative\.firebaseapp\.com[^'"]+)['"]/i
          );
          if (match) {
            return { magicLink: match[1], subject: mail.subject, from: mail.from };
          }
        }
      }
    } catch {}
    await sleep(POLL_WAIT);
  }
  throw new Error("El enlace mágico no llega (tiempo de espera)");
}

async function verifyMagicLink(email, magicLink) {
  const { data } = await client.post(`${CLAIM_API}/verify-link`, {
    email,
    magicLink,
  });
  if (!data?.success || !data?.ok) {
    throw new Error(data?.message || "Error en la verificación del enlace");
  }
  return data;
}

async function claimSingleAccount() {
  const res = { status: false };
  try {
    const { email } = await createTempEmail();
    res.email = email;
    res.inbox = `${MAIL_WEB}/${email}`;

    await requestMagicLink(email);
    const mail = await pollMagicLink(email);
    const verified = await verifyMagicLink(email, mail.magicLink);

    res.status = true;
    res.uid = verified.data?.uid;
    res.orderId = verified.data?.orderId;
    res.tier = verified.data?.tier;
    res.validUntil = verified.data?.validUntil;
  } catch (err) {
    res.error = err.response?.data?.message || err.message;
  }
  return res;
}

async function handler(m) {
  const p = m.prefix || ".";
  const cmd = m.command || "ambulk";
  const raw = String(m.text || "").trim();
  const count = raw ? parseInt(raw, 10) : 1;

  if (!Number.isInteger(count) || count < 1) {
    return m.reply(
      `╭─── ❖ 『 💎 *AMBULK — RECLAMO AUTOMÁTICO AM* 』 ❖\n` +
        `│ 📌 *Formato:* \`${p}${cmd} [cantidad]\`\n` +
        `│ ✨ *Ejemplo:* \`${p}${cmd} 1\` o \`${p}${cmd} 2\`\n` +
        `│ ℹ️ Máximo *${MAX_BATCH} cuentas* por proceso (±1 minutos/cuenta)\n` +
        `╰──────────────────────────❖`
    );
  }

  if (count > MAX_BATCH) {
    return m.reply(`⚠️Máximo*${MAX_BATCH} cuenta* por comando.`);
  }
  if (activeJobs.has(m.sender)) {
    return m.reply("⏳ El proceso anterior aún está en ejecución, primero espera hasta que finalice.");
  }

  activeJobs.add(m.sender);
  await m.react("⏳").catch(() => {});

  try {
    await m.reply(`⏳ Procesamiento *${count}* Alight Motion cuenta Premium, espere...`);

    const results = [];
    for (let i = 1; i <= count; i++) {
      results.push(await claimSingleAccount());
      if (i < count) await sleep(BATCH_GAP);
    }

    const okCount = results.filter((r) => r.status).length;
    const failCount = results.length - okCount;

    const lines = [
      `╭─── ❖ 『 💎 *MIKU TOMA EL RESULTADO* 』 ❖`,
      `│ 📊 *Total:* ${results.length} | ✅ *Éxito:* ${okCount} | ❌ *Error:* ${failCount}`,
    ];

    results.forEach((r, idx) => {
      lines.push(`├─── *#${idx + 1}* ${r.status ? "✅ ÉXITO" : "❌ FALLÓ"}`);
      if (r.email) lines.push(`│ 📧 *Email:* \`${r.email}\``);
      if (r.status) {
        if (r.tier) lines.push(`│ 🏷️ *Tier:* ${r.tier}`);
        if (r.validUntil) lines.push(`│ 📅 *Berlaku:* ${r.validUntil}`);
        if (r.uid) lines.push(`│ 🆔 *UID:* ${r.uid}`);
        if (r.orderId) lines.push(`│ 🧾 *Order:* ${r.orderId}`);
      } else {
        lines.push(`│ ⚠️ *Error:* ${r.error || "Desconocido"}`);
      }
      if (r.inbox) lines.push(`│ 📥 *Inbox:* ${r.inbox}`);
    });
    lines.push(`╰──────────────────────────❖`);

    await m.reply(lines.join("\n"));
    await m.react(okCount ? "✅" : "❌").catch(() => {});
  } catch (e) {
    await m.react("❌").catch(() => {});
    await m.reply(`❌ No se pudo procesar AMBulk: ${e.message}`);
  } finally {
    activeJobs.delete(m.sender);
  }
}

export { pluginConfig as config, handler };
