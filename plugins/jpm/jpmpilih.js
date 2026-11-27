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

const pluginConfig = {
    name: "jpmpilih",
    alias: [],
    category: "jpm",
    description: "Fitur jpm jpmpilih",
    usage: ".jpmpilih",
    example: ".jpmpilih",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const TTL = 10 * 60 * 1000
  const sessions = () => (global.__jpmPilih ||= {})

  async function handler(m, { sock, sender, jid, command, text, reply, isOwner }) {
      if (command === 'jpmpilih') {
          const groups = await jpmGroups(sock)
          if (!groups.length) return reply('❌ Bot no está en ningún grupo.')

          sessions()[sender] = { step: 'nomor', chat: jid, groups: groups.map(g => ({ id: g.id, name: g.subject || g.id })), at: Date.now() }
          const rows = groups.map((g, i) => `*${i + 1}.* ${g.subject || g.id}`).join('\n')
          return reply(`*▢ ELEGIR GRUPO DE JPM*\n• Totales: ${groups.length} grupo\n• Número de grupo de respuesta, separados por dos puntos/coma. Ejemplo: *1.2.3* o *1,2,3*\n• Escriba *cancelar* para cancelar\n\n${rows}`)
      }

      if (!isOwner) return false
      const st = sessions()[sender]
      if (!st || st.chat !== jid) return false
      if (Date.now() - st.at > TTL) { delete sessions()[sender]; return false }

      const input = (text || '').trim()
      if (/^(batal|cancel)$/i.test(input)) {
          delete sessions()[sender]
          return reply('✅ JPM selecciona cancelar.')
      }

      if (st.step === 'nomor') {
          if (!/^[\d\s.,]+$/.test(input)) return false
          const picked = [...new Set(input.split(/[.,\s]+/).map(v => parseInt(v) - 1))]
              .filter(i => i >= 0 && i < st.groups.length)
              .map(i => st.groups[i])
          if (!picked.length) return reply('❌ Número no válido. Intentar otra vez.')

          sessions()[sender] = { ...st, step: 'pesan', picked, at: Date.now() }
          const names = picked.map((g, i) => `*${i + 1}.* ${g.name}`).join('\n')
          return reply(`*▢ GRUP DIPILIH*\n• Totales: ${picked.length} grupo(s)\n\n${names}\n\n📝 Ahora envía el mensaje que deseas difundir (texto o foto/video con subtítulo):`)
      }

      if (st.step === 'pesan') {
          delete sessions()[sender]
          const media = await getMedia(m)
          const delay = jpmCfg().delayJpm
          await reply(`*▢ JPM DIMULAI*\n• Objetivos: ${st.picked.length} grupo\n• Retardo: ${delay}ms`)

          const { ok, fail } = await jpmLoop(st.picked, delay, g =>
              sock.sendMessage(g.id, media ? mediaContent(media, input) : { text: input }))

          return reply(`*▢ JPM TERMINADO*\n• Correctos: ${ok} grupo\n• Fallidos: ${fail} grupo`)
      }

      return false
  }

  handler.customPrefix = /^[\s\S]+/

export { pluginConfig as config, handler }
