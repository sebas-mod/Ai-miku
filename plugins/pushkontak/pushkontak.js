/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const getMeta = MikuRuntime.getMeta;
const jpmCfg = MikuRuntime.jpmCfg;
const jpmJobs = MikuRuntime.jpmJobs;
const jpmLoop = MikuRuntime.jpmLoop;
const getMedia = MikuRuntime.getMedia;
const mediaContent = MikuRuntime.mediaContent;
const memberJids = MikuRuntime.memberJids;
const pushKode = MikuRuntime.pushKode;
const sendVcf = MikuRuntime.sendVcf;

const pluginConfig = {
    name: "pushkontak",
    alias: ["puskontak"],
    category: "pushkontak",
    description: "Fitur pushkontak pushkontak",
    usage: ".pushkontak",
    example: ".pushkontak",
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, jid, text, reply, example }) {
      const media = await getMedia(m)
      if (!text && !media) return example('mensaje que quieres enviar a los miembros (o responde a una foto/vídeo + texto)')

      const jobs = jpmJobs()
      if (jobs.pushRunning) return reply('❌ El envío de contactos está en marcha. Escribe *stoppush* para detenerlo.')

      const meta = await getMeta(sock, jid, true)
      const members = await memberJids(sock, meta)
      if (!members.length) return reply('❌ No hay miembros a los que enviar en este grupo.')

      const delay = jpmCfg().delayPushKontak
      jobs.pushRunning = true
      await reply(`*▢ ENVÍO DE CONTACTOS*\n• Objetivo : ${members.length} miembros\n• Retardo : ${delay}ms\n• Autoguardado : VCF\n\nDetenlo con *stoppush*`)

      const saved = []
      let result
      try {
          result = await jpmLoop(members, delay, async to => {
              const caption = `${text || ''}\n\n#${pushKode()}`.trim()
              await sock.sendMessage(to, media ? mediaContent(media, caption) : { text: caption })
              saved.push(to)
          }, () => !jobs.pushRunning)
      } finally {
          jobs.pushRunning = false
      }

      if (saved.length) {
          const nama = String(meta.subject || 'Grupo').replace(/\s+/g, '_')
          await sendVcf(sock, m.sender, saved, {
              fileName: `Contacto_${nama}_${saved.length}`,
              caption: `*▢ AUTOGUARDADO DE CONTACTOS*\n• Total : ${saved.length} contactos\n• Grupo : ${meta.subject || '-'}\n\nImporta este archivo en tu móvil para guardar todos los contactos.`
          }).catch(e => console.error('[PUSHKONTAK] error al enviar el VCF:', e?.message || e))
      }

      return reply(`*▢ ENVÍO DE CONTACTOS TERMINADO*\n• Correctos : ${result.ok} miembros\n• Fallidos : ${result.fail} miembros\n• Guardados : ${saved.length} contactos (VCF)`)
  }

export { pluginConfig as config, handler }
