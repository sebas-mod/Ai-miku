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
  name: "vdomain",
  alias: ["verceldomain"],
  category: "vercel",
  description: "Consulta o añade un dominio personalizado al proyecto de Vercel",
  usage: ".vdomain <proyecto> [dominio-nuevo]",
  example: ".vdomain webku | .vdomain webku contoh.my.id",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const token = getVercelToken(m.sender);
  if (!token) return m.reply(missingTokenReply(m.prefix));

  const [rawProj, newDomain] = String(m.text || "").trim().split(/\s+/).filter(Boolean);
  const proj = sanitizeProjectName(rawProj);
  if (!proj) {
    return m.reply(`🌐 ¡Escribe el nombre del proyecto de Vercel!\n> Ver dominio: \`${m.prefix}vdomain <proyecto>\`\n> Añadir dominio: \`${m.prefix}vdomain <proyecto> <dominio.com>\``);
  }

  await m.react("🕕");
  try {
    if (newDomain) {
      const res = await vercelRequest(token, "POST", `/v10/projects/${encodeURIComponent(proj)}/domains`, { name: newDomain });
      await m.react("✅");
      return m.reply(
        `╭─❖「 🌐 *DOMINIO AÑADIDO* 」\n` +
        `│ 📦 Proyek : *${proj}*\n` +
        `│ 🔗 Domain : *${res?.name || newDomain}*\n` +
        `│ ✅ Status : ${res?.verified ? "Verificado" : "Esperando configuración DNS"}\n` +
        `╰─────────────────────❖`
      );
    }

    const data = await vercelRequest(token, "GET", `/v9/projects/${encodeURIComponent(proj)}/domains`);
    const domains = Array.isArray(data?.domains) ? data.domains : [];
    if (!domains.length) {
      await m.react("✅");
      return m.reply(`🌐 El proyecto *${proj}* todavía no tiene dominios registrados.`);
    }

    const lines = domains.map((d, i) => `│ ${i + 1}. ${d.verified ? "✅" : "⏳"} *${d.name}*`);
    await m.react("✅");
    await m.reply(
      `╭─❖「 🌐 *DOMAIN PROYEK: ${proj}* 」\n` +
      `${lines.join("\n")}\n` +
      `╰─────────────────────❖`
    );
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ No se pudo procesar el dominio de Vercel: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
