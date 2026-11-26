/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const RedNoteDL = ElysiaRuntime.RedNoteDL;

  const pluginConfig = {
    name: "rednotedl",
    alias: [],
    category: "download",
    description: "Download video/foto dari RedNote (XiaoHongShu)",
    usage: ".rednotedl <url>",
    example: ".rednotedl https://www.xiaohongshu.com/xxx",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    const text = m.text?.trim();
    if (!text) {
      m.react("❌");
      return m.reply(
        `📕 *RedNote Downloader*\n\n` +
          `Download video atau foto dari XiaoHongShu (RedNote).\n\n` +
          `*PENGGUNAAN:*\n` +
          `> *${m.prefix}rednotedl <link>*\n\n` +
          `*CONTOH:*\n` +
          `> *${m.prefix}rednotedl https://www.xiaohongshu.com/xxx*`,
      );
    }

    m.react("🕕");

    try {
      const result = await RedNoteDL(text);

      if (!result.status) {
        m.react("☢");
        return m.reply(`❌ *RedNote Gagal*\n\n> ${result.error}`);
      }

      if (result.type === "video" && result.results?.[0]) {
        await sock.sendMedia(m.chat, result.results[0], result.title, m, {
          type: "video",
        });
      } else if (result.results?.length > 0) {
        for (let i = 0; i < Math.min(result.results.length, 5); i++) {
          await sock.sendMedia(m.chat, result.results[i], "", m, {
            type: "image",
          });
        }
        if (result.results.length > 5) {
          await m.reply(
            `_Masih ada ${result.results.length - 5} foto lagi, maksimal 5_`,
          );
        }
      }

      m.react("✅");
    } catch (e) {
      console.error(e);
      m.react("☢");
      m.reply("❌ Gagal mengambil data RedNote, coba lagi nanti");
    }
  }

export { pluginConfig as config, handler }
