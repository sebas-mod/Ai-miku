/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import AdmZip from "adm-zip";
import { getVercelToken, vercelRequest, sanitizeProjectName, missingTokenReply } from "../../src/lib/features/miku-vercel.js";

const pluginConfig = {
  name: "vdeploy",
  alias: ["deployvercel", "vercel"],
  category: "vercel",
  description: "Despliega un archivo HTML o ZIP como sitio web activo en Vercel",
  usage: ".vdeploy <nombre-proyek> (reply file .html / .zip)",
  example: ".vdeploy portofolio-ku",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 10, energi: 2, isEnabled: true,
};

async function handler(m) {
  const token = getVercelToken(m.sender);
  if (!token) return m.reply(missingTokenReply(m.prefix));

  const projectName = sanitizeProjectName(m.text);
  const quoted = m.quoted || m;
  const isDoc = Boolean(quoted?.type === "documentMessage" || quoted?.mtype === "documentMessage" || quoted?.msg?.fileName);

  if (!projectName || !isDoc) {
    return m.reply(
      `╭─❖「 ▲ *VERCEL DEPLOY — MIKU* 」\n` +
      `│ Responde con un archivo *.html* o *.zip* y luego escribe:\n` +
      `│ \`${m.prefix}vdeploy nombre-de-tu-web\`\n` +
      `╰─────────────────────❖`
    );
  }

  await m.react("🕕");
  try {
    const buf = await quoted.download?.();
    if (!buf || !buf.length) throw new Error("No se pudo descargar el archivo adjunto.");

    const fileName = String(quoted?.msg?.fileName || quoted?.fileName || "index.html");
    const files = [];

    if (/\.zip$/i.test(fileName)) {
      const zip = new AdmZip(buf);
      const entries = zip.getEntries().filter((e) => !e.isDirectory);
      for (const entry of entries) {
        const cleanName = entry.entryName.replace(/^\/+/, "");
        if (!cleanName || cleanName.startsWith("__MACOSX/") || cleanName.includes("node_modules/")) continue;
        files.push({
          file: cleanName,
          data: entry.getData().toString("base64"),
          encoding: "base64",
        });
      }
      if (!files.length) throw new Error("El archivo ZIP está vacío o no es válido.");
    } else {
      const targetName = /\.html?$/i.test(fileName) ? "index.html" : fileName;
      files.push({
        file: targetName,
        data: buf.toString("base64"),
        encoding: "base64",
      });
    }

    const res = await vercelRequest(token, "POST", "/v13/deployments", {
      name: projectName,
      files,
      projectSettings: { framework: null },
      target: "production",
    });

    const url = res?.url ? `https://${res.url}` : `https://${projectName}.vercel.app`;
    await m.react("✅");
    await m.reply(
      `╭─❖「 ▲ *¡DEPLOY EN VERCEL COMPLETADO!* 」\n` +
      `│ 📦 Proyek : *${projectName}*\n` +
      `│ 📄 Files  : *${files.length} file*\n` +
      `│ 🚦 Status : \`${res?.readyState || "BUILDING"}\`\n` +
      `│ 🔗 URL    : ${url}\n` +
      `╰─────────────────────❖`
    );
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ No se pudo desplegar en Vercel: *${err.message}*`);
  }
}

export { pluginConfig as config, handler };
