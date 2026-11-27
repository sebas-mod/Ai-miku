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

const te = MikuRuntime.te;
const loadSent = MikuRuntime.loadSent;
const saveSent = MikuRuntime.saveSent;
const loadState = MikuRuntime.loadState;
const saveState = MikuRuntime.saveState;
const getOngoingAnimeList = MikuRuntime.getOngoingAnimeList;
const startAutoCheck = MikuRuntime.startAutoCheck;
const stopAutoCheck = MikuRuntime.stopAutoCheck;
const runCheck = MikuRuntime.runCheck;
const isRunning = MikuRuntime.isRunning;

  const pluginConfig = {
      name: 'autoanimewinbu',
      alias: ["aaw"],
      category: "anime",
      description: 'Sube automáticamente anime y donghua en emisión desde winbu.net (720p Pixeldrain)',
      usage: '.autoanimewinbu <start|stop|status|cek|list|reset|addgrup|delgrup>',
      example: '.autoanimewinbu start',
      isOwner: true,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 0,
      isEnabled: true
  }

  async function run(m, { sock, args }) {
      const sub = m.text
      const state = loadState()

      switch (sub) {
          case 'start': {
              if (isRunning()) {
                  return m.reply(`⚠️ ¡AutoAnime está en funcionamiento!`)
              }

              const groups = state.groups || []
              if (groups.length === 0) {
                  return m.reply(
                      `❌ ¡Aún no hay grupo objetivo!\n\n` +
                      `> Agregar grupo primero:\n` +
                      `> \`${m.prefix}autoanimewinbu addgroup\` (en el grupo objetivo)\n` +
                      `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                  )
              }

              const interval = state.interval || 5
              startAutoCheck(sock, interval)
              saveState({ ...state, enabled: true })

              return sock.sendMessage(m.chat, {
                  text: `✅ *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀʀᴛᴇᴅ*\n\n` +
                      `> 📲 Grupo objetivo: *${groups.length}*\n` +
                      `> ⏱️ Intervalos: *${interval} minuto*\n` +
                      `> 🎞️ Filter: *Pixeldrain 720p+*\n` +
                      `> ⏰ Edad máxima: *24 horas*\n\n` +
                      `Pengecekan pertama dimulai...\n\n` +
                      `▢ ${m.prefix}autoanimewinbu status — 📊 Status\n` +
                      `▢ ${m.prefix}autoanimewinbu stop — 🛑 Stop`
              }, { quoted: m })
          }

          case 'stop': {
              stopAutoCheck()
              saveState({ ...state, enabled: false })
              return m.reply(`🛑 *AutoAnime dihentikan*`)
          }

          case 'status': {
              const sent = loadSent()
              const running = isRunning()
              const groups = state.groups || []

              let txt = `📊 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀᴛᴜs*\n\n`
              txt += `> 🔄 Status: *${running ? '🟢 ON' : '🔴 OFF'}*\n`
              txt += `> 💾 Inicio automático: *${state.enabled ? 'Sí' : 'No'}*\n`
              txt += `> 📋 Ya enviado: *${sent.size}* episodios\n`
              txt += `> ⏱️ Intervalos: *${state.interval || 5} minuto*\n`
              txt += `> 📲 Grupo objetivo: *${groups.length}*\n`

              if (groups.length > 0) {
                  txt += `\n*Grupo:*\n`
                  groups.forEach((g, i) => {
                      txt += `> ${i + 1}. \`${g}\`\n`
                  })
              }

              return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
          }

          case 'cek':
          case 'check': {
              if (!isRunning()) {
                  startAutoCheck(sock, state.interval || 5)
              }
              await m.reply('🔍 Comprobando animes nuevos...')
              try {
                  await runCheck()
                  return m.reply('✅ Comprobación completa')
              } catch (e) {
                  m.reply(te(m.prefix, m.command, m.pushName))
              }
          }

          case 'list': {
              await m.reply('📺 Obteniendo lista de animes...')
              try {
                  const list = await getOngoingAnimeList()
                  if (list.length === 0) return m.reply('❌ No se encontró ningún anime')

                  let txt = `📺 *LISTA DE ANIME MÁS RECIENTE*\n\n`
                  txt += `> Total: *${list.length}* anime\n\n`
                  list.slice(0, 15).forEach((a, i) => {
                      txt += `*${i + 1}.* ${a.title}\n`
                  })
                  if (list.length > 15) txt += `\n> ...y ${list.length - 15} más`

                  return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
              } catch (e) {
                  m.reply(te(m.prefix, m.command, m.pushName))
              }
          }

          case 'reset': {
              const sent = loadSent()
              const count = sent.size
              saveSent(new Set())
              return m.reply(`✅¡Reiniciar! *${count}*episodio eliminado del historial.\n> Todos los episodios se pueden reenviar.`)
          }

          case 'addgrup':
          case 'addgroup': {
              const rest = (typeof args === 'string' ? args : '').replace(/^(addgrup|addgroup)\s*/i, '').trim()
              let grupId = rest

              if (!grupId && m.isGroup) {
                  grupId = m.chat
              }

              if (!grupId || !grupId.includes('@g.us')) {
                  return m.reply(
                      `❌ ID grupo no válido\n\n` +
                      `> Uso dentro de un grupo, o:\n` +
                      `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                  )
              }

              const groups = state.groups || []
              if (groups.includes(grupId)) {
                  return m.reply(`⚠️ El grupo ya está en la lista de objetivos.`)
              }

              groups.push(grupId)
              saveState({ ...state, groups })
              return m.reply(`✅ Grupo \`${grupId}\` se agrega al objetivo\n> Total: *${groups.length}* grupo`)
          }

          case 'delgrup':
          case 'delgroup': {
              const rest = (typeof args === 'string' ? args : '').replace(/^(delgrup|delgroup)\s*/i, '').trim()
              let grupId = rest

              if (!grupId && m.isGroup) {
                  grupId = m.chat
              }

              const groups = state.groups || []
              const idx = groups.indexOf(grupId)
              if (idx === -1) {
                  return m.reply(`❌ Grupo no encontrado en la lista de objetivos`)
              }

              groups.splice(idx, 1)
              saveState({ ...state, groups })
              return m.reply(`✅ Grupo \`${grupId}\` eliminado del objetivo\n> Resto: *${groups.length}* grupo`)
          }

          case 'interval': {
              const rest = (typeof args === 'string' ? args : '').replace(/^interval\s*/i, '').trim()
              const mins = parseInt(rest)
              if (!mins || mins < 1 || mins > 60) {
                  return m.reply(`❌ El intervalo debe ser de 1-60 minutos.\n\n> Ejemplo: \`${m.prefix}autoanimewinbu interval 10\``)
              }

              saveState({ ...state, interval: mins })

              if (isRunning()) {
                  stopAutoCheck()
                  startAutoCheck(sock, mins)
              }

              return m.reply(`✅ Intervalo cambiado a *${mins} minuto*`)
          }

          default: {
              const running = isRunning()
              return sock.sendMessage(m.chat, {
                  text: `🎬 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ ᴡɪɴʙᴜ*\n\n` +
                      `> Status: *${running ? '🟢 ON' : '🔴 OFF'}*\n\n` +
                      `*ᴄᴏᴍᴍᴀɴᴅs:*\n` +
                      `> \`${m.prefix}aaw start\`: inicia la verificación automática\n` +
                      `> \`${m.prefix}aaw stop\` — Hentikan\n` +
                      `> \`${m.prefix}aaw status\` — Ver estado\n` +
                      `> \`${m.prefix}aaw check\` — Verificación manual ahora\n` +
                      `> \`${m.prefix}aaw list\` — Lista del anime más reciente\n` +
                      `> \`${m.prefix}aaw addgroup\` — Agregar grupo objetivo\n` +
                      `> \`${m.prefix}aaw delgroup\` — Eliminar grupo objetivo\n` +
                      `> \`${m.prefix}autoanimewinbu interval 10\` — Cambiar intervalo\n` +
                      `> \`${m.prefix}aaw reset\` — Restablecer el historial enviado\n\n` +
                      `▢ ${m.prefix}autoanimewinbu ${running ? 'stop' : 'start'} — ${running ? '🛑 Stop' : '▶️ Start'}\n` +
                      `▢ ${m.prefix}autoanimewinbu status — 📊 Status`
              }, { quoted: m })
          }
      }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
