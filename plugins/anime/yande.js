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
import axios from 'axios'

  const API = 'https://yande.re/post.json'

  async function randomYande() {
    const { data } = await axios.get(API, {
      params: {
        tags: 'order:random',
        limit: 1
      }
    })
    return data[0]
  }

  async function searchYande(tags) {
    const { data } = await axios.get(API, {
      params: { tags, limit: 5 }
    })
    return data
  }

  async function getById(id) {
    const { data } = await axios.get(API, {
      params: { tags: `id:${id}` }
    })
    return data[0]
  }

  async function sendImage(conn, m, img) {
    await conn.sendMessage(m.chat, {
      image: { url: img.file_url },
      caption:
  `Tamaño: ${img.width}x${img.height}
Calificaciones: ${img.rating}
ID: ${img.id}

▢.yande aleatorio — Otra vez

RYO YAMADA - MD`,
    }, { quoted: m })
  }

  const pluginConfig = {
    name: "yande",
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

  async function run(m, { sock, args }) {
      const conn = sock;
    try {

      if (!args[0]) {
        const img = await randomYande()
        return sendImage(conn, m, img)
      }

      if (args[0] === 'random') {
        const img = await randomYande()
        return sendImage(conn, m, img)
      }

      if (args[0] === 'id') {
        if (!args[1]) return m.reply('Escribe el ID')
        const img = await getById(args[1])
        return sendImage(conn, m, img)
      }

      const query = args.join('_')
      m.reply('Buscando fondos de pantalla...')

      const results = await searchYande(query)
      if (!results.length) return m.reply('Extraviado')

      for (let img of results) {
        await sendImage(conn, m, img)
      }

    } catch (e) {
      console.log(e)
      m.reply('No se pudo recuperar el fondo de pantalla')
    }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
