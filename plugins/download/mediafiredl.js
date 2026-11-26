/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const te = ElysiaRuntime.te;
const mediafire = ElysiaRuntime.mediafire;

  const pluginConfig = {
    name: "mediafiredl",
    alias: [],
    category: "download",
    description: "Download file dari MediaFire",
    usage: ".mediafiredl <url>",
    example: ".mediafiredl https://www.mediafire.com/file/xxx",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true,
  };

  function getFileName(result) {
    const directName = result?.meta?.title?.trim();
    const urlName = decodeURIComponent(
      result?.download?.link_download?.split("/").pop()?.split("?")[0] || "",
    );
    const extension = urlName.includes(".") ? `.${urlName.split(".").pop()}` : "";
    if (directName && extension && !directName.includes("."))
      return `${directName}${extension}`;
    return directName || urlName || `mediafire_${Date.now()}${extension}`;
  }

  async function handler(m, { sock }) {
    const url = m.text?.trim();

    if (!url) {
      return m.reply(
        `⚠️ *CÓMO USAR*\n\n` +
          `> \`${m.prefix}mediafiredl <url>\`\n\n` +
          `> Ejemplo:\n` +
          `> \`${m.prefix}mediafiredl https://www.mediafire.com/file/xxx\``,
      );
    }

    if (!url.match(/mediafire\.com/i)) {
      return m.reply(`❌ *URL no válida. Usa un enlace de MediaFire.*`);
    }
    await m.react("🕕");

    try {
      const result = await mediafire(url);
      await sock.sendMessage(
        m.chat,
        {
          document: { url: result.download.link_download },
          fileName: getFileName(result),
          mimetype: result.download.mimetype,
          contextInfo: {
            forwardingScore: 99,
            isForwarded: true,
          },
        },
        { quoted: m },
      );
    } catch (err) {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
