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
const memberJids = MikuRuntime.memberJids;

const pluginConfig = {
    name: "pushkontak2",
    alias: ["puskontak2", "push2"],
    category: "pushkontak",
    description: "Fitur pushkontak pushkontak2",
    usage: ".pushkontak2",
    example: ".pushkontak2",
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const randomKode = (n = 6) => Array.from({ length: n }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')

  async function handler(m, { sock, jid, text, reply, example }) {
      const [pesan, nama] = String(text || '').split('|').map(s => s.trim())
      if (!pesan || !nama) return example('¡Hola a todos!|TiendaNueva   (formato: mensaje|nombre del contacto)')

      const jobs = jpmJobs()
      if (jobs.pushRunning) return reply('❌ El envío de contactos está en marcha. Escribe *stoppush* para detenerlo.')

      const members = (await memberJids(sock, await getMeta(sock, jid, true))).filter(id => id !== m.sender)
      if (!members.length) return reply('❌ No hay miembros a los que enviar en este grupo.')

      const delay = jpmCfg().delayPushKontak
      jobs.pushRunning = true
      await reply(`*▢ ENVÍO DE CONTACTOS 2*\n• Objetivo : ${members.length} miembros\n• Nombre del contacto : ${nama}\n• Retardo : ${delay}ms\n\nDetenlo con *stoppush*`)

      let res
      try {
          res = await jpmLoop(members, delay, async to => {
              const nomor = to.split('@')[0]
              await sock.sendMessage(to, { text: `${pesan}\n\n#${randomKode()}` })
              await sock.sendMessage(to, {
                  contacts: {
                      displayName: nama,
                      contacts: [{ displayName: nama, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${nama} - ${nomor}\nTEL;type=CELL;type=VOICE;waid=${nomor}:+${nomor}\nEND:VCARD` }]
                  }
              })
          }, () => !jobs.pushRunning)
      } finally {
          jobs.pushRunning = false
      }
      return reply(`*▢ ENVÍO DE CONTACTOS 2 TERMINADO*\n• Correctos : ${res.ok} miembros\n• Fallidos : ${res.fail} miembros`)
  }

export { pluginConfig as config, handler }
