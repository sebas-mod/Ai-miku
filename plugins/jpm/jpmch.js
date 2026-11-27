/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { getBinaryNodeChild } from '@rexxhayanasi/elaina-baileys'

const jpmCfg = MikuRuntime.jpmCfg;
const jpmLoop = MikuRuntime.jpmLoop;
const getMedia = MikuRuntime.getMedia;
const mediaContent = MikuRuntime.mediaContent;

const pluginConfig = {
    name: "jpmch",
    alias: ["jpmchannel"],
    category: "jpm",
    description: "Fitur jpm jpmch",
    usage: ".jpmch",
    example: ".jpmch",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function fetchSubscribedChannels(sock) {
      const data = {}
      try {
          const result = await sock.query({
              tag: 'iq',
              attrs: { id: sock.generateMessageTag(), type: 'get', xmlns: 'w:mex', to: '@s.whatsapp.net' },
              content: [{
                  tag: 'query',
                  attrs: { query_id: '6388546374527196' },
                  content: new TextEncoder().encode(JSON.stringify({ variables: {} }))
              }]
          })
          const child = getBinaryNodeChild(result, 'result')
          if (!child?.content) return data
          const parsed = JSON.parse(child.content.toString())
          const list = parsed?.data?.xwa2_newsletter_subscribed || parsed?.data?.newsletter_subscribed || parsed?.data?.subscribed || []
          for (const ch of list) {
              if (ch.id) data[ch.id] = { id: ch.id, name: ch.thread_metadata?.name?.text || ch.name || 'Unknown' }
          }
      } catch (e) { console.error('[JPMCH]', e?.message || e) }
      return data
  }

  async function handler(m, { sock, text, reply, example }) {
      const media = await getMedia(m)
      if (!text && !media) return example('mensajes a todos los canales (o responder a fotos/videos + subtítulos)')
      if (global.__jpmRunning) return reply('❌ JPM se está ejecutando. Escriba *stopjpm* para detener.')

      const channels = Object.values(await fetchSubscribedChannels(sock))
      if (!channels.length) return reply('❌ No se encontraron canales / bot no ha seguido ningún canal.')

      const delay = jpmCfg().delayJpm
      await reply(`*▢ JPM CHANNEL*\n• Objetivos: ${channels.length} canales\n• Tipo: ${media ? 'Media + Texto' : 'Texto'}\n• Retardo: ${delay}ms\n\nPara con *stopjpm*`)

      const { ok, fail } = await jpmLoop(channels, delay, ch =>
          sock.sendMessage(ch.id, media ? mediaContent(media, text) : { text }))
      return reply(`*▢ JPM CANAL TERMINADO*\n• Correctos: ${ok} canales\n• Fallidos: ${fail} canales`)
  }

export { pluginConfig as config, handler }
