/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
const mikuLib = (name) => MikuRuntime.mikuLib(name, typeof libs !== 'undefined' ? libs : null);
const mikuGlobal = MikuRuntime.mikuGlobal;

const libs = {
    "googleimage": async ({ mikuLib }) => {
      const axios = (__m => __m.default ?? __m)((await import('axios')))
      const cheerio = (await import('cheerio'))

      async function googleImageSearch(query) {
        try {
          const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`
          const { data } = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
          })
          const results = []
          const regex = /\["(https:\/\/[^"]+)",\d+,\d+\]/g
          let match
          while ((match = regex.exec(data)) !== null) {
            const imgUrl = match[1]
            if (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.png') || imgUrl.endsWith('.jpeg')) {
              results.push({ url: imgUrl, title: query })
            }
          }
          if (results.length === 0) {
            const $ = cheerio.load(data)
            $('img').each((i, el) => {
              const src = $(el).attr('src')
              if (src && src.startsWith('http')) {
                results.push({ url: src, title: query })
              }
            })
          }
          return results
        } catch {
          return []
        }
      }

      const __default = { googleImageSearch }
      return { googleImageSearch, default: __default }
    }
}

const pluginConfig = {
    name: "gimage",
    alias: ["carigambar", "gimg"],
    category: "search",
    description: "gimage <query>",
    usage: ".gimage <query>",
    example: ".gimage <query>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const { googleImageSearch } = (await mikuLib('googleimage'))

  async function handler(m, { conn, sock, text, usedPrefix, command, reply }) {
      const client = conn || sock || mikuGlobal.mainSock || mikuGlobal.conn;

      if (!text) {
          return reply(
              `🔍 *Google Image Search*\n\n` +
              `Ketik kata kunci gambar yang ingin dicari, sayang~\n\n` +
              `*Contoh:* \`${usedPrefix + command} kucing persia\`\n` +
              `*Contoh:* \`${usedPrefix + command} cyber city wallpaper\``
          );
      }

      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      try {
          const results = await googleImageSearch(text.trim());

          if (!results || results.length === 0) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
              return reply(`❌ Gambar tidak ditemukan untuk pencarian *"${text}"*, coba kata kunci lain ya sayang~`);
          }

          const firstItem = results[0];
          await client.sendMessage(m.chat, {
              image: { url: firstItem.url },
              caption: `*Google Image Search*\n\n🔍 *Query:* ${text}\n🖼️ *Judul:* ${firstItem.title}\n🌐 *Sumber:* ${firstItem.source}`
          }, { quoted: m });
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
          console.error('[GOOGLE IMAGE SEARCH ERROR]:', err);
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return reply(`❌ Terjadi kesalahan saat mencari gambar: ${err.message}`);
      }
  };

export { pluginConfig as config, handler }
