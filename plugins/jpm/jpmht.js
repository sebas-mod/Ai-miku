/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const jpmGroups = MikuRuntime.jpmGroups;
const jpmCfg = MikuRuntime.jpmCfg;
const jpmLoop = MikuRuntime.jpmLoop;
const getMedia = MikuRuntime.getMedia;
const mediaContent = MikuRuntime.mediaContent;
const tagList = MikuRuntime.tagList;

const pluginConfig = {
    name: "jpmht",
    alias: [],
    category: "jpm",
    description: "Fitur jpm jpmht",
    usage: ".jpmht",
    example: ".jpmht",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, reply, example }) {
      const media = await getMedia(m, ['image', 'video', 'document', 'audio'])
      const caption = text || media?.caption || m.quoted?.text || ''
      if (!caption && !media) return example('mensajes (o enviar/responder fotos, videos, documentos, audio)')

      const groups = await jpmGroups(sock)
      const cfg = jpmCfg()
      const delay = cfg.delayJpmTag
      const tipe = media ? media.kind.toUpperCase() + (caption ? ' + Texto' : '') : 'Texto (Ocultar etiqueta)'
      await reply(`*▢ ENVIANDO JPM HIDETAG*\n• Grupo total: ${groups.length}\n• Tipo: ${tipe}\n• Retardo: ${delay}ms`)

      const { ok, fail } = await jpmLoop(groups, delay, g => {
          const { mentions } = tagList(g)
          return sock.sendMessage(g.id, media ? mediaContent(media, caption, mentions) : { text: caption, mentions })
      })

      return reply(`*▢ JPM HIDETAG TERMINADO*\n• Correctos: ${ok} grupo\n• Fallidos: ${fail} grupo`)
  }

export { pluginConfig as config, handler }
