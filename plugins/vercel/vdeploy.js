/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import AdmZip from "adm-zip";
import { getVercelToken, vercelRequest, sanitizeProjectName, missingTokenReply } from "../../src/lib/features/elysia-vercel.js";

const pluginConfig = {
  name: "vdeploy",
  alias: ["deployvercel", "vercel"],
  category: "vercel",
  description: "Deploy file HTML atau ZIP langsung menjadi website aktif di Vercel",
  usage: ".vdeploy <nama-proyek> (reply file .html / .zip)",
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
      `╭─❖「 ▲ *VERCEL DEPLOY — ELYSIA* 」\n` +
      `│ Reply file *.html* atau *.zip* lalu ketik:\n` +
      `│ \`${m.prefix}vdeploy nama-web-kamu\`\n` +
      `╰─────────────────────❖`
    );
  }

  await m.react("🕕");
  try {
    const buf = await quoted.download?.();
    if (!buf || !buf.length) throw new Error("Gagal mengunduh file lampiran.");

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
      if (!files.length) throw new Error("File ZIP kosong atau tidak valid.");
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
      `╭─❖「 ▲ *DEPLOY VERCEL BERHASIL!* 」\n` +
      `│ 📦 Proyek : *${projectName}*\n` +
      `│ 📄 Files  : *${files.length} file*\n` +
      `│ 🚦 Status : \`${res?.readyState || "BUILDING"}\`\n` +
      `│ 🔗 URL    : ${url}\n` +
      `╰─────────────────────❖`
    );
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ Gagal deploy ke Vercel: *${err.message}*`);
  }
}

export { pluginConfig as config, handler };
