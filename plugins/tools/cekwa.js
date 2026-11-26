/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { jidDecode } from '@rexxhayanasi/elaina-baileys'

const jidNumber = ElysiaRuntime.jidNumber;
const resolvePhone = ElysiaRuntime.resolvePhone;
const isLidJid = ElysiaRuntime.isLidJid;
const reactTo = ElysiaRuntime.reactTo;

const pluginConfig = {
    name: "cekwa",
    alias: ["wa"],
    category: "tools",
    description: "cekwa @tag / reply",
    usage: ".cekwa @tag / reply",
    example: ".cekwa @tag / reply",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const withTimeout = (p, ms = 8000) =>
      Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))])

  const readContent = (c) => {
      if (!c) return null
      if (Buffer.isBuffer(c)) return c.toString('utf-8')
      return typeof c === 'string' ? c : null
  }

  const formatTimestamp = (ts) => {
      if (!ts) return null
      const n = Number(ts)
      const d = new Date(n > 1e12 ? n : n * 1000)
      return d.toLocaleString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta'
      }) + ' WIB'
  }

  const block = (title, value) => `┏━━⟬ ${title} ⟭\n┗╼⪼ ${value}\n\n`

  async function verifiedNameQuery(sock, to, withJid, jid) {
      const res = await withTimeout(sock.query({
          tag: 'iq',
          attrs: { id: sock.generateMessageTag(), to, type: 'get', xmlns: 'w:biz' },
          content: [{
              tag: 'verified_name',
              attrs: { v: '2' },
              content: withJid ? [{ tag: 'jid', attrs: {}, content: jid }] : []
          }]
      }))
      const node = res?.content?.find?.(n => n.tag === 'verified_name')
      if (!node) return null
      const nameNode = node.content?.find?.(n => n.tag === 'name')
      return {
          level: node.attrs?.verified_level || null,
          name: readContent(nameNode?.content) || node.attrs?.name || node.attrs?.verified_name || null
      }
  }

  async function handler(m, { sock, jid, text, prefix, command, reply }) {
      const isReply = !!m.quoted
      let targetNumber = null

      if (isReply) {
          const raw = m.quoted.sender || m.quoted.senderRaw
          targetNumber = isLidJid(raw) ? await resolvePhone(sock, raw) : jidNumber(raw)
          if (!targetNumber) return reply('❌ No se pudo identificar el número del mensaje al que respondes.')
      } else {
          const mention = (m.mentionedJid || [])[0]
          if (mention) {
              targetNumber = isLidJid(mention) ? await resolvePhone(sock, mention) : jidNumber(mention)
          } else {
              const n = String(text || '').replace(/\D/g, '')
              if (n.length >= 8) targetNumber = n
          }
      }

      targetNumber = String(targetNumber || '').replace(/\D/g, '')
      if (targetNumber.length < 8) {
          return reply(`❌ Menciona a alguien, responde a su mensaje o escribe su número.\n\nEjemplo: *${prefix || '.'}${command} @mención*`)
      }
      const targetJid = `${targetNumber}@s.whatsapp.net`

      let quotedLid = null, resolvedJid = null, deviceIndex = null
      if (isReply) {
          quotedLid = m.quoted.senderRaw || m.quoted.sender
          try {
              resolvedJid = await withTimeout(sock.signalRepository?.lidMapping?.getPNForLID(quotedLid), 5000)
              const mt = String(resolvedJid || '').match(/:(\d+)@s\.whatsapp\.net$/)
              if (mt) deviceIndex = parseInt(mt[1], 10)
          } catch {}
      }

      await reactTo(sock, m, '⏳')

      try {
          const [result] = await withTimeout(sock.onWhatsApp(targetNumber))
          if (!result?.exists) {
              await reactTo(sock, m, '❌')
              return reply(`❌ El número *+${targetNumber}* no está registrado en WhatsApp.`)
          }
          const waJid = result.jid
          const nomor = jidNumber(waJid)

          const contact = sock.store?.contacts?.[waJid] || sock.store?.contacts?.[targetJid] || null
          const pushName = contact?.name || contact?.notify || null
          const platform = contact?.platform || null

          let pp = null, bio = null, ppPrivacy = false, bioPrivacy = false
          const [ppRes, statusRes] = await Promise.allSettled([
              withTimeout(sock.profilePictureUrl(waJid, 'image')),
              withTimeout(sock.fetchStatus(waJid))
          ])
          if (ppRes.status === 'fulfilled') pp = ppRes.value
          else ppPrivacy = /404|not-authorized|item-not-found/.test(String(ppRes.reason?.message || ''))
          if (statusRes.status === 'fulfilled') {
              const v = Array.isArray(statusRes.value) ? statusRes.value[0] : statusRes.value
              bio = (typeof v?.status === 'string' ? v.status : v?.status?.status) || null
          } else bioPrivacy = true

          let lastSeen = null, isOnline = false, lastSeenPrivacy = false
          try {
              await withTimeout(sock.presenceSubscribe(waJid), 3000)
              await new Promise(r => setTimeout(r, 2000))
              const presence = sock.store?.presences?.[waJid]
              if (presence) {
                  const pd = Object.values(presence)[0]
                  if (pd?.lastKnownPresence === 'available') isOnline = true
                  else if (pd?.lastSeen) lastSeen = pd.lastSeen
                  else lastSeenPrivacy = true
              } else lastSeenPrivacy = true
          } catch { lastSeenPrivacy = true }

          let isBiz = false, bizName = null, bizCat = null, bizDesc = null, bizEmail = null
          let bizWebsite = null, bizAddr = null, verifiedLevel = null

          try {
              const bp = await withTimeout(sock.getBusinessProfile(waJid))
              if (bp && Object.keys(bp).length) {
                  isBiz = true
                  bizName = bp.verified_name || bp.name || null
                  bizDesc = bp.description || null
                  bizEmail = bp.email || null
                  bizAddr = bp.address || null
                  verifiedLevel = bp.verified_level || null
                  const cats = bp.category_list?.length ? bp.category_list : bp.categories?.length ? bp.categories : null
                  bizCat = cats ? cats.map(c => c.name || c).join(', ') : (bp.category || null)
                  if (bp.website?.length) bizWebsite = Array.isArray(bp.website) ? bp.website.join(', ') : bp.website
              }
          } catch {}

          if (!isBiz) {
              for (const [to, withJid] of [[waJid, false], ['s.whatsapp.net', true]]) {
                  try {
                      const v = await verifiedNameQuery(sock, to, withJid, waJid)
                      if (v) { isBiz = true; verifiedLevel = v.level; bizName = v.name; break }
                  } catch {}
              }
          }

          if (isBiz && !bizCat && !bizEmail && !bizWebsite && !bizAddr) {
              try {
                  const res = await withTimeout(sock.query({
                      tag: 'iq',
                      attrs: { id: sock.generateMessageTag(), to: waJid, type: 'get', xmlns: 'w:biz:info' },
                      content: [{ tag: 'business_profile', attrs: { v: '116' }, content: [] }]
                  }))
                  const prof = res?.content?.find?.(n => n.tag === 'business_profile')
                  for (const child of prof?.content || []) {
                      const val = readContent(child.content)
                      if (child.tag === 'category') bizCat = val || child.attrs?.id || null
                      else if (child.tag === 'description') bizDesc = val
                      else if (child.tag === 'email') bizEmail = val
                      else if (child.tag === 'address') bizAddr = val
                      else if (child.tag === 'profile_options') bizName = bizName || child.attrs?.biz_name || null
                      else if (child.tag === 'website') {
                          bizWebsite = val || (Array.isArray(child.content)
                              ? child.content.map(w => readContent(w.content)).filter(Boolean).join(', ') || null
                              : null)
                      }
                  }
              } catch {}
          }

          const commonGroups = []
          let targetLid = null
          try {
              targetLid = await withTimeout(sock.signalRepository?.lidMapping?.getLIDForPN(waJid))
              const keys = new Set([nomor, targetLid ? jidNumber(targetLid) : null].filter(Boolean))
              const all = await withTimeout(sock.groupFetchAllParticipating(), 10000)
              for (const [gId, meta] of Object.entries(all)) {
                  const hit = meta.participants?.some(p =>
                      [p.id, p.jid, p.lid, p.phoneNumber].some(x => x && keys.has(jidNumber(x))))
                  if (hit) commonGroups.push({ id: gId, subject: meta.subject })
              }
          } catch {}

          let allDevices = [], linkedDevices = [], byIndex = null, byUSync = null
          if (isReply) {
              if (deviceIndex !== null) byIndex = deviceIndex > 0 ? 'bot' : 'human'
              try {
                  allDevices = await withTimeout(sock.getUSyncDevices([targetJid], true, false))
                  for (const d of allDevices) {
                      const idx = jidDecode(d.jid)?.device ?? 0
                      if (idx > 0) linkedDevices.push({ jid: d.jid, index: idx })
                  }
                  byUSync = linkedDevices.length ? 'bot' : allDevices.length ? 'human' : 'unknown'
              } catch { byUSync = 'unknown' }
          }

          let isForwarded = false, forwardScore = 0
          if (isReply) {
              const ci = m.quoted.contextInfo || null
              isForwarded = !!ci?.isForwarded
              forwardScore = ci?.forwardingScore || 0
          }

          let c = ''
          c += block('Número', `+${nomor}`)
          if (quotedLid) c += block('ID del participante (original)', quotedLid)
          if (resolvedJid) c += block('ID de WA asociado', resolvedJid)
          if (deviceIndex !== null) c += block('Índice de dispositivo', `:${deviceIndex} ${deviceIndex === 0 ? '(Principal)' : '(Vinculado/Bot)'}`)
          if (targetLid) c += block('LID', targetLid)
          if (pushName) c += block('Nombre visible', pushName)
          c += block('Estado en WA', 'Registrado ✅')

          c += block('Presencia',
              isOnline ? '🟢 En línea ahora'
                  : lastSeen ? `🕐 Última conexión: ${formatTimestamp(lastSeen)}`
                  : lastSeenPrivacy ? '🔒 Oculta' : '❓ Desconocida')

          c += block('Tipo de cuenta', isBiz ? 'WhatsApp Business 🏢' : 'Personal 👤')
          if (isBiz && verifiedLevel) {
              c += block('Verificación',
                  verifiedLevel === 'high' ? '✅ Verificado (check azul)'
                      : verifiedLevel === 'low' ? '☑️ Verificado parcialmente' : `Nivel: ${verifiedLevel}`)
          }
          if (bizName) c += block('Nombre del negocio', bizName)
          if (bizCat) c += block('Categoría', bizCat)
          if (bizDesc) c += block('Descripción', bizDesc)
          if (bizEmail) c += block('Email', bizEmail)
          if (bizWebsite) c += block('Website', bizWebsite)
          if (bizAddr) c += block('Dirección', bizAddr)

          c += block('Bio', bio || (bioPrivacy ? '🔒 Oculta' : 'Sin bio'))
          c += block('Foto de perfil', pp ? '✅ Disponible' : ppPrivacy ? '🔒 Oculta' : '❌ Sin foto')
          if (platform) c += block('Platform', platform)

          if (commonGroups.length) {
              let v = `${commonGroups.length} grupos\n`
              for (const g of commonGroups.slice(0, 5)) v += `   ┗╼⪼ ${g.subject}\n`
              if (commonGroups.length > 5) v += `   ┗╼⪼ +${commonGroups.length - 5} grupos más\n`
              c += `┏━━⟬ Grupos en común ⟭\n┗╼⪼ ${v}\n`
          } else {
              c += block('Grupos en común', 'Ningún grupo en común')
          }

          if (isReply) {
              if (isForwarded) c += `┏━━⟬ Reenvío ⟭\n┗╼⪼ ✅ Mensaje reenviado\n   ┗╼⪼ Veces reenviado: ${forwardScore}\n\n`
              c += block('Dispositivos totales', `${allDevices.length} dispositivos activos`)
              if (linkedDevices.length) {
                  c += `┏━━⟬ Dispositivos vinculados ⟭\n┗╼⪼ ${linkedDevices.length} dispositivos\n`
                  for (const d of linkedDevices) c += `   ┗╼⪼ Dispositivo #${d.index}\n`
                  c += '\n'
              }

              c += '┏━━⟬ Detección de bot ⟭\n'
              if (byIndex !== null) {
                  c += '┣━━⟬ 1. Device Index ⟭\n'
                  c += byIndex === 'bot'
                      ? `┃ ┗╼⪼ ⚠️ BOT (índice :${deviceIndex} = Vinculado/Bot)\n`
                      : `┃ ┗╼⪼ ✅ HUMANO (índice :${deviceIndex} = Principal)\n`
              }
              if (byUSync !== null) {
                  c += '┣━━⟬ 2. USyncDevices ⟭\n'
                  c += byUSync === 'bot' ? `┃ ┗╼⪼ ⚠️ BOT (${linkedDevices.length} dispositivos vinculados detectados)\n`
                      : byUSync === 'human' ? '┃ ┗╼⪼ ✅ HUMANO (solo teléfono principal)\n'
                      : '┃ ┗╼⪼ ❓ No se puede asegurar\n'
              }
              c += '┗━━⟬ Conclusión ⟭\n'
              const final = byIndex === 'bot' || byUSync === 'bot' ? 'bot'
                  : byIndex === 'human' && byUSync === 'human' ? 'human' : 'unknown'
              c += final === 'bot' ? '┗╼⪼ ⚠️ PROBABLEMENTE USA UN BOT\n'
                  : final === 'human' ? '┗╼⪼ ✅ PROBABLEMENTE UNA PERSONA (teléfono principal)\n'
                  : '┗╼⪼ ❓ NO SE PUEDE ASEGURAR\n'
          }

          await reactTo(sock, m, '✅')
          if (pp) await sock.sendMessage(jid, { image: { url: pp }, caption: c.trim() }, { quoted: m })
          else await reply(c.trim())
      } catch (e) {
          await reactTo(sock, m, '❌')
          await reply(`❌ Error: ${e.message}`)
      }
  }

export { pluginConfig as config, handler }
