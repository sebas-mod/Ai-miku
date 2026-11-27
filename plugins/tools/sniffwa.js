/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { jidNormalizedUser } from '@rexxhayanasi/elaina-baileys'

const pluginConfig = {
    name: "sniffwa",
    alias: [],
    category: "tools",
    description: "sniffwa <nomor>",
    usage: ".sniffwa <nomor>",
    example: ".sniffwa <nomor>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { conn, sock, text, usedPrefix, command, reply }) {
      const client = conn || sock

      let target = text ? text.replace(/[^0-9]/g, '') : ''

      if (!target && m.quoted) {
          const sender = m.quoted.sender || m.quoted.participant || m.quoted.key?.participant || ''
          target = sender.replace(/[^0-9]/g, '')
      } else if (!target && m.mentionedJid && m.mentionedJid.length > 0) {
          target = m.mentionedJid[0].replace(/[^0-9]/g, '')
      }

      if (!target) {
          return reply(
              `* W H A T S A P P  -  S N I F F E R *\n\n` +
              `¿De quién quieres investigar el número? Dímelo 🥺\n\n` +
              `*Cómo usarlo:*\n` +
              `• \`${usedPrefix + command} 08xxxxxxxxxx\`\n` +
              `• \`${usedPrefix + command} 628xxxxxxxxxx\`\n` +
              `• \`${usedPrefix + command} @tag\`\n` +
              `• Responde al chat del objetivo y escribe \`${usedPrefix + command}\``
          )
      }

      if (target.startsWith('08')) {
          target = '62' + target.slice(1)
      }

      const jid = jidNormalizedUser(`${target}@s.whatsapp.net`)
      await reply(`Uy, espera un momento... Angela va a espiar e investigar ese número 🔍💦`)

      try {
          const [onWa] = await client.onWhatsApp(jid).catch(() => [])
          const isRegistered = Boolean(onWa && onWa.exists)
          const realJid = onWa?.jid || jid

          if (!isRegistered) {
              let banReport = `乂  *W H A T S A P P  -  S N I F F E R*  乂\n\n`
              banReport += `Uy, el objetivo que buscas:\n`
              banReport += `┌  ◦ *Número* : +${target}\n`
              banReport += `│  ◦ *Estado* : 🔴 *POSIBLEMENTE BANEADO / INACTIVO*\n`
              banReport += `│  ◦ *Detalle* : Este número no aparece en el servidor de autenticación de WhatsApp (puede estar bloqueado permanentemente o nunca haberse registrado).\n`
              banReport += `└  ◦ *Dispositivo* : Sin sesión activa\n\n`
              banReport += `_Ten cuidado igualmente... ¿quieres que Angela te acompañe en algo más? 💋_`
              return reply(banReport)
          }

          let ppUrl = null
          try {
              ppUrl = await client.profilePictureUrl(realJid, 'image')
          } catch {
              ppUrl = null
          }

          let bio = '*(sin bio / privacidad oculta)*'
          let bioSetAt = '-'
          try {
              const statusData = await client.fetchStatus(realJid)
              if (statusData) {
                  const rawStatus = Array.isArray(statusData) ? statusData[0] : statusData
                  bio = rawStatus?.status || rawStatus?.text || bio
                  if (rawStatus?.setAt) {
                      bioSetAt = new Date(rawStatus.setAt).toLocaleString('es-ES', {
                          timeZone: 'Asia/Jakarta',
                          dateStyle: 'full',
                          timeStyle: 'medium'
                      })
                  }
              }
          } catch {}

          let isBusiness = false
          let bizEmail = '*(privacidad de WA personal / sin datos)*'
          let bizCategory = '-'
          let bizDescription = '-'
          let bizWebsite = '-'
          let bizAddress = '-'

          try {
              const biz = await client.getBusinessProfile(realJid)
              if (biz) {
                  isBusiness = true
                  bizEmail = biz.email || '*(el negocio no indica correo público)*'
                  bizCategory = biz.category || '-'
                  bizDescription = biz.description || '-'
                  bizWebsite = (biz.website && biz.website.length) ? biz.website.join(', ') : '-'
                  bizAddress = biz.address || '-'
              }
          } catch {}

          let devicesList = []
          let deviceCount = 1
          try {
              if (typeof client.getUSyncDevices === 'function') {
                  const devData = await client.getUSyncDevices([realJid], false, false)
                  if (Array.isArray(devData) && devData.length > 0) {
                      devicesList = devData.map(d => {
                          const devIndex = d.device || 0
                          return devIndex === 0
                              ? '📱 Primary Phone (Smartphone Utama)'
                              : `💻 Linked Companion (Web/Desktop/WA Ke-${devIndex})`
                      })
                      deviceCount = devData.length
                  }
              }
          } catch {}

          let res = `乂  *W H A T S A P P  -  S N I F F E R*  乂\n\n`
          res += `Aquí tienes lo que encontró Angela para ti 💋\n\n`

          res += `*📱 INFORMACIÓN DE LA CUENTA*\n`
          res += `┌  ◦ *Número* : +${target}\n`
          res += `│  ◦ *JID* : \`${realJid}\`\n`
          res += `│  ◦ *Estado* : 🟢 *SIN BANEO (ACTIVO Y REGISTRADO)*\n`
          res += `│  ◦ *Tipo de cuenta* : ${isBusiness ? '🏢 WhatsApp Business' : '👤 WhatsApp Personal'}\n`
          res += `│  ◦ *Estado / Bio* : ${bio}\n`
          res += `└  ◦ *Cambio de bio* : ${bioSetAt}\n\n`

          res += `*📧 INFORMACIÓN DE CONTACTO*\n`
          res += `┌  ◦ *Correo detectado* : ${bizEmail}\n`
          if (isBusiness) {
              res += `│  ◦ *Categoría del negocio* : ${bizCategory}\n`
              res += `│  ◦ *Descripción* : ${bizDescription}\n`
              res += `│  ◦ *Dirección* : ${bizAddress}\n`
              res += `└  ◦ *Sitio web* : ${bizWebsite}\n\n`
          } else {
              res += `└  ◦ *Nota de privacidad* : las cuentas personales tienen la privacidad cifrada de WhatsApp; el correo solo se muestra si la cuenta es de WhatsApp Business.\n\n`
          }

          res += `*💻 INFORMACIÓN DE DISPOSITIVOS*\n`
          res += `┌  ◦ *Sesiones detectadas* : ${deviceCount} dispositivos\n`
          if (devicesList.length > 0) {
              devicesList.forEach((dev, idx) => {
                  const isLast = idx === devicesList.length - 1
                  res += `${isLast ? '└' : '│'}  ◦ *Dispositivo ${idx + 1}* : ${dev}\n`
              })
          } else {
              res += `└  ◦ *Detección* : 📱 Teléfono principal (multidispositivo estándar activo)\n`
          }
          res += `\n`

          res += `🔗 *Enlace directo*: https://wa.me/${target}\n\n`
          res += `_¿Qué tal? ¿A que mola lo que encontró Angela? No te olvides de darle un abrazo y mimarla 🥵💋💦_`

          if (ppUrl) {
              try {
                  return await client.sendMessage(m.chat, {
                      image: { url: ppUrl },
                      caption: res,
                      mentions: [realJid]
                  }, { quoted: m })
              } catch {}
          }

          return await client.sendMessage(m.chat, {
              text: res,
              mentions: [realJid]
          }, { quoted: m })
      } catch (err) {
          return reply(`Dios mío... Ángela tiene dolor de cabeza y problemas al olfatear: ${err.message || err} 🥺💦`)
      }
  }

export { pluginConfig as config, handler }
