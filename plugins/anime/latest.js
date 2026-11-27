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
import fetch from 'node-fetch'

  const pluginConfig = {
    name: "animelatest",
    alias: [],
    category: "anime",
    usage: "",
    example: "",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 1,
    isEnabled: true,
  };

  async function run(m, { sock }) {
      const conn = sock;
    try {
      const res = await fetch('https://api.sansekai.my.id/api/anime/latest')
      const data = await res.json()

      if (!data.length) throw 'Anime no encontrado.'

      let teks = `🎌 *ANIME TERBARU*\n\n`

      data.forEach((anime, i) => {
        teks += `*${i + 1}. ${anime.judul}*\n`
        teks += `📺 Episode : ${anime.lastch}\n`
        teks += `🕒 Update  : ${anime.lastup}\n`
        teks += `🔗 Link    : https://sansekai.my.id/anime/${anime.url}\n\n`
      })

      await conn.sendFile(
        m.chat,
        data[0].cover,
        'anime.jpg',
        teks,
        m
      )

    } catch (e) {
      m.reply('❌ No se pudieron recuperar los datos del anime más recientes')
    }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
