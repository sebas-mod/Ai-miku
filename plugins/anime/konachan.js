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

const searchKonachan = MikuRuntime.searchKonachan;

  const pluginConfig = {
    name: "konachan",
    alias: [],
    category: "anime",
    description: "Cari gambar anime dari konachan",
    usage: ".konachan <tags>",
    example: ".konachan long_hair blue_eyes",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true,
  };

  async function run(m, { args, sock }) {
    if (!args[0]) {
      let txt = `🌸 *KONACHAN SEARCH* 🌸\n\n`;
      txt += `¡Hola hermana! ¿Buscas referencias interesantes de imágenes de anime? ¡Aquí lo obtuve de Konachan!\n\n`;
      txt += `*Cómo usarlo:*\n`;
      txt += `👉 \`${m.prefix}konachan <tag1> <tag2>\`\n\n`;
      txt += `*Ejemplo:*\n`;
      txt += `\`${m.prefix}konachan long_hair\`\n`;
      txt += `\`${m.prefix}konachan naruto\`\n`;
      txt += `\`${m.prefix}konachan blue_eyes smile\`\n\n`;
      txt += `*Tags populer:*\n`;
      txt += `long_hair, blue_eyes, smile, school_uniform, nekomimi`;
      return m.reply(txt);
    }

    await m.react("🕕");

    try {
      const query = args.join(" ");
      const results = await searchKonachan(query);

      if (results.error) {
        await m.react("❌");
        return m.reply(`❌ Lo siento hermana, ¡hubo un problema para encontrar la imagen!\nError: ${results.message}`);
      }

      if (!results || results.length === 0) {
        await m.react("❌");
        return m.reply(`❌ ¡Ay hermanita, no encuentro la foto! Intento cambiar la etiqueta de búsqueda. 😭\n\n*Etiquetas de ejemplo:*\n${args[0]} → intenta usar otras etiquetas como "anime", "fondo de pantalla" o algo más específico`);
      }

      const maxResults = Math.min(results.length, 20);
      const randomIdx = Math.floor(Math.random() * maxResults);
      const image = results[randomIdx];

      if (!image || !image.images || !image.images.preview) {
        await m.react("❌");
        return m.reply(`❌ ¡Vaya hermana, la imagen no se puede cargar! Intenta buscar con otras etiquetas, OK~`);
      }

      let caption = `🌸 *KONACHAN SEARCH RESULT* 🌸\n\n`;
      caption += `🔍 *Query:* ${query}\n`;
      caption += `📊 *Total encontrado:* ${results.length} imagen\n`;
      caption += `🎲 *Random ke-${randomIdx + 1}*\n\n`;
      caption += `🏷️ *Tags:*\n`;

      const tagDisplay = image.tags.slice(0, 15).join(", ");
      caption += `${tagDisplay}${image.tags.length > 15 ? '...' : ''}\n\n`;
      caption += `🔗 *Source:*\n${image.details_page || 'https://konachan.net'}\n\n`;
      caption += `💕 *Ai Miku:* Disfruta cariño~ ♡`;

      await sock.sendMessage(m.chat, {
        image: { url: image.images.preview },
        caption: caption
      }, { quoted: m });

      await m.react("✅");

    } catch (e) {
      console.error('[Konachan] Error:', e);
      await m.react("❌");
      await m.reply(`❌ ¡Lo siento hermana, error del sistema! 😭\n\nError: ${e.message}\n\nInténtalo de nuevo más tarde, cariño~ 💕`);
    }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
