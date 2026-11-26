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
import config from "../../config.js";
import { AIRich } from "../../src/lib/core/builder.js";

const pluginConfig = {
  name: "getplugin",
  alias: ["gp", "getcode", "plugincode", "sourcecode"],
  category: "owner",
  description: "Dapatkan source code plugin",
  usage: ".getplugin <nama plugin>",
  example: ".getplugin menu",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function searchPlugin(name, pluginsDir) {
  const categories = fs.readdirSync(pluginsDir).filter((f) => {
    return fs.statSync(path.join(pluginsDir, f)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(pluginsDir, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "").toLowerCase();
      if (baseName === name.toLowerCase()) {
        return {
          path: path.join(categoryPath, file),
          category,
          file,
        };
      }
    }
  }

  for (const category of categories) {
    const categoryPath = path.join(pluginsDir, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const aliasMatch = content.match(/alias:\s*\[([^\]]+)\]/);
        if (aliasMatch) {
          const aliases = aliasMatch[1].match(/['"`]([^'"`]+)['"`]/g);
          if (aliases) {
            const cleanAliases = aliases.map((a) =>
              a.replace(/['"`]/g, "").toLowerCase(),
            );
            if (cleanAliases.includes(name.toLowerCase())) {
              return {
                path: filePath,
                category,
                file,
              };
            }
          }
        }
      } catch {}
    }
  }

  return null;
}

function getSimilarPlugins(name, pluginsDir) {
  const results = [];
  const categories = fs.readdirSync(pluginsDir).filter((f) => {
    return fs.statSync(path.join(pluginsDir, f)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(pluginsDir, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "").toLowerCase();
      if (
        baseName.includes(name.toLowerCase()) ||
        name.toLowerCase().includes(baseName)
      ) {
        results.push(`${category}/${file}`);
      }
    }
  }

  return results.slice(0, 5);
}

async function handler(m, { sock }) {
  if (!config.isOwner(m.sender)) {
    return m.reply("❌ *Owner Only!*");
  }

  const pluginName = m.args?.[0]?.trim();

  if (!pluginName) {
    return m.reply(
      `📦 *ɢᴇᴛ ᴘʟᴜɢɪɴ*\n\n` +
        `> Dapatkan source code plugin\n\n` +
        `╭┈┈⬡「 📋 *ғᴏʀᴍᴀᴛ* 」\n` +
        `┃ .getplugin <nama>\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `*Contoh:*\n` +
        `> .getplugin menu\n` +
        `> .getplugin audiosticker\n` +
        `> .getplugin convert/audiosticker`,
    );
  }

  const pluginsDir = path.join(process.cwd(), "plugins");

  let pluginInfo = null;

  if (pluginName.includes("/")) {
    const [category, file] = pluginName.split("/");
    const filePath = path.join(
      pluginsDir,
      category,
      file.endsWith(".js") ? file : `${file}.js`,
    );
    if (fs.existsSync(filePath)) {
      pluginInfo = {
        path: filePath,
        category,
        file: file.endsWith(".js") ? file : `${file}.js`,
      };
    }
  } else {
    pluginInfo = searchPlugin(pluginName, pluginsDir);
  }

  if (!pluginInfo) {
    const similar = getSimilarPlugins(pluginName, pluginsDir);
    let text = `❌ *ᴘʟᴜɢɪɴ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n`;
    text += `> Plugin \`${pluginName}\` tidak ditemukan\n\n`;

    if (similar.length > 0) {
      text += `*Mungkin maksud kamu:*\n`;
      similar.forEach((s) => {
        text += `> - \`${s}\`\n`;
      });
    }

    return m.reply(text);
  }

  const codeBuffer = fs.readFileSync(pluginInfo.path);
  const codeText = codeBuffer.toString("utf-8");

  if (codeText.length > 4000) {
    return await sock.sendMessage(
      m.chat,
      {
        document: codeBuffer,
        mimetype: "application/javascript",
        fileName: pluginInfo.file,
        caption:
          `📦 *GET PLUGIN*\n` +
          `• *File:* \`${pluginInfo.category}/${pluginInfo.file}\`\n` +
          `• *Ukuran:* ${(codeBuffer.length / 1024).toFixed(1)} KB`,
      },
      { quoted: m },
    );
  }

  try {
    await new AIRich(sock)
      .addText(
        `📦 *GET PLUGIN*\n- File : ${pluginInfo.file}\n- Category : ${pluginInfo.category}\n\n`,
      )
      .addCode("javascript", codeText)
      .send(m.chat);
  } catch {
    await m.reply(
      `📦 *${pluginInfo.category}/${pluginInfo.file}*\n\n\`\`\`js\n${codeText}\n\`\`\``,
    );
  }
}

export { pluginConfig as config, handler };
