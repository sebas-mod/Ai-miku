/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getVercelToken, vercelRequest, sanitizeProjectName, missingTokenReply } from "../../src/lib/features/miku-vercel.js";

const pluginConfig = {
  name: "vdeployments",
  alias: ["vstatus", "vercelstatus"],
  category: "vercel",
  description: "Consulta el historial y el estado del último despliegue del proyecto en Vercel",
  usage: ".vstatus [nombre-proyek]",
  example: ".vstatus portofolio-ku",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const token = getVercelToken(m.sender);
  if (!token) return m.reply(missingTokenReply(m.prefix));

  const project = sanitizeProjectName(m.text);
  await m.react("🕕");
  try {
    const params = { limit: 6 };
    if (project) params.app = project;
    const data = await vercelRequest(token, "GET", "/v6/deployments", undefined, params);
    const list = Array.isArray(data?.deployments) ? data.deployments : [];
    if (!list.length) {
      await m.react("✅");
      return m.reply("📭 No se encontró ningún historial de despliegues.");
    }

    const badge = { READY: "🟢", BUILDING: "🟡", ERROR: "🔴", CANCELED: "⚪" };
    const rows = list.map((d, i) => {
      const icon = badge[d.state] || "🔵";
      const time = d.created ? new Date(d.created).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "short" }) : "-";
      return `│ ${i + 1}. ${icon} *${d.name}* [\`${d.state}\`]\n│    🕒 ${time} — https://${d.url}`;
    });

    await m.react("✅");
    await m.reply(
      `╭─❖「 ▲ *STATUS DEPLOYMENT VERCEL* 」\n` +
      `${rows.join("\n")}\n` +
      `╰─────────────────────❖`
    );
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ No se pudo comprobar el despliegue en Vercel: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
