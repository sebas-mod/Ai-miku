/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from "fs";
import path from "path";

const pluginConfig = {
  name: "ls",
  alias: ["dir", "listfile"],
  category: "owner",
  description: "Melihat daftar folder dan file di direktori bot (Owner Only)",
  usage: ".ls [path] atau ls [path]",
  example: ".ls plugins/user",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildLsOutput(rawTarget = "") {
  const relInput = String(rawTarget || "").trim() || ".";
  const baseDir = process.cwd();
  const targetPath = path.resolve(baseDir, relInput);

  if (!fs.existsSync(targetPath)) {
    return `❌ Path tidak ditemukan: \`${relInput}\``;
  }

  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) {
    return (
      `📄 *FILE INFO*\n\n` +
      `• Nama: \`${path.basename(targetPath)}\`\n` +
      `• Path: \`${path.relative(baseDir, targetPath) || "."}\`\n` +
      `• Ukuran: *${formatBytes(stat.size)}*`
    );
  }

  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  const folders = [];
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push(entry.name);
    } else {
      let size = 0;
      try {
        size = fs.statSync(path.join(targetPath, entry.name)).size;
      } catch {}
      files.push({ name: entry.name, size });
    }
  }

  folders.sort((a, b) => a.localeCompare(b));
  files.sort((a, b) => a.name.localeCompare(b.name));

  const displayRel = path.relative(baseDir, targetPath) || ".";
  const lines = [
    `📂 *LIST DIRECTORY:* \`${displayRel}\``,
    `📁 Folder: *${folders.length}* | 📄 File: *${files.length}*`,
    "",
  ];

  for (const f of folders) {
    lines.push(`📁 ${f}/`);
  }
  for (const f of files) {
    lines.push(`📄 ${f.name} (${formatBytes(f.size)})`);
  }

  const out = lines.join("\n");
  return out.length > 3900 ? out.slice(0, 3900) + "\n... (terpotong)" : out;
}

async function handler(m) {
  const target = (m.text || m.args?.join(" ") || "").trim();
  return m.reply(buildLsOutput(target));
}

export { pluginConfig as config, handler, buildLsOutput };
