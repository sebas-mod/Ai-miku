/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
const mikuWrapPlugin = MikuRuntime.mikuWrapPlugin;
import axios from "axios";

  const pluginConfig = {
    name: "topanime",
    alias: ["rankanime"],
    category: "anime",
    description: "Muestra la lista de personajes de anime / waifus más populares",
    usage: ".topanime",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true,
  };

  async function run(m, { sock }) {
    await m.react("🕕");

    try {
      const response = await axios.get("https://my.izuka-api.xyz/api/anime/top-anime");
      const data = response.data;

      if (!data.status || !data.result || !data.result.result) {
        await m.react("❌");
        return m.reply(`Lo sentimos, el sistema no pudo recuperar la lista de mejores animes.`);
      }

      const list = data.result.result;

      let txt = `🏆 *TOP ANIME CHARACTERS (WAIFU LIST)* 🏆\n\n`;
      txt += `Aquí hay una lista de los personajes más populares y queridos de la actualidad:\n\n`;

      const maxItems = Math.min(list.length, 10);

      for (let i = 0; i < maxItems; i++) {
        const char = list[i];
        txt += `*${char.rank} - ${char.name}*\n`;
        txt += `- *Jepang:* ${char.japanese}\n`;
        txt += `- *Anime:* ${char.anime}\n`;
        txt += `- *Favorit:* ${char.favorites} | *Votes:* ${char.votes}\n\n`;
      }

      txt += `_Menampilkan ${maxItems} karakter teratas._`;

      await m.react("✅");

      if (list.length > 0 && list[0].image) {
        await sock.sendMessage(m.chat, { image: { url: list[0].image }, caption: txt }, { quoted: m });
      } else {
        await m.reply(txt);
      }

    } catch (error) {
      console.error("[TOPANIME Plugin Error]", error);
      await m.react("❌");
      m.reply(`Lo sentimos, se produjo un error al contactar con el servidor. Por favor inténtalo de nuevo.`);
    }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
