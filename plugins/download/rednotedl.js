/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const RedNoteDL = MikuRuntime.RedNoteDL;

  const pluginConfig = {
    name: "rednotedl",
    alias: [],
    category: "download",
    description: "Descarga videos/fotos de RedNote (XiaoHongShu)",
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
          `Descarga videos o fotos de XiaoHongShu (RedNote).\n\n` +
          `*USO:*\n` +
          `> *${m.prefix}rednotedl <link>*\n\n` +
          `*EJEMPLO:*\n` +
          `> *${m.prefix}rednotedl https://www.xiaohongshu.com/xxx*`,
      );
    }

    m.react("🕕");

    try {
      const result = await RedNoteDL(text);

      if (!result.status) {
        m.react("☢");
        return m.reply(`❌ *RedNote falló*\n\n> ${result.error}`);
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
            `_Quedan ${result.results.length - 5} fotos más, máximo 5_`,
          );
        }
      }

      m.react("✅");
    } catch (e) {
      console.error(e);
      m.react("☢");
      m.reply("❌ Error al obtener los datos de RedNote, inténtalo más tarde");
    }
  }

export { pluginConfig as config, handler }
