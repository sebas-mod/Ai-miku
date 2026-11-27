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

const pluginConfig = {
    name: "jpmupdate",
    alias: ["updatejpm", "broadcastupdate", "shareupdate"],
    category: "jpm",
    description: "Fitur jpm jpmupdate",
    usage: ".jpmupdate",
    example: ".jpmupdate",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, prefix, reply, example }) {
      if (!text) return example('v3.0 | ✨ Nueva característica:\\n- animado\\n- Documentos (use \\n para nuevas líneas)')
      if (global.__jpmRunning) return reply('❌ JPM se está ejecutando. Escriba *stopjpm* para detener.')

      let version = global.versi || 'v1.0'
      let changelog = text
      if (text.includes('|')) {
          const [v, ...rest] = text.split('|')
          version = v.trim() || version
          changelog = rest.join('|').trim()
      }
      if (!changelog) return reply('❌ El registro de cambios no puede estar vacío.')

      const groups = await jpmGroups(sock)
      if (!groups.length) return reply('❌ No hay grupos a los que acudir.')

      const tanggal = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'long', year: 'numeric' })
      const botName = global.namebot || 'Ai Miku'
      const pesan = `🚀 *UPDATE!! | ${version}*\n\n📅 *Fecha:* ${tanggal}\n\n*CHANGELOG:*\n${changelog.replace(/\\n/g, '\n')}\n\n*CATATAN TERBARU:*\n> 💡 Tipo *${prefix}menú* para ver estas funciones.\n> 📢 _Gracias por usar ${botName}_`

      const contextInfo = global.idSaluran
          ? { forwardingScore: 9999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: global.idSaluran, newsletterName: global.nameSaluran || botName, serverMessageId: 127 } }
          : undefined
      const delay = jpmCfg().delayJpm
      await reply(`*▢ JPM UPDATE*\n• Versión: ${version}\n• Objetivos: ${groups.length} grupo\n• Demora: ${delay}EM`)

      const { ok, fail } = await jpmLoop(groups, delay, g => sock.sendMessage(g.id, { text: pesan, ...(contextInfo ? { contextInfo } : {}) }))
      return reply(`*▢ JPM UPDATE SELESAI*\n• Tener éxito: ${ok} grupo\n• Fallar: ${fail} grupo`)
  }

export { pluginConfig as config, handler }
