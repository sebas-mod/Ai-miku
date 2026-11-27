/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "setch",
    alias: [],
    category: "channel",
    description: "setch <link saluran> | off",
    usage: ".setch <link saluran> | off",
    example: ".setch <link saluran> | off",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const saveDB = MikuRuntime.saveDB;

export class ChannelError extends Error {}

export function parseRef(input) {
    const s = String(input || '').trim()
    let m = s.match(/whatsapp\.com\/channel\/([A-Za-z0-9_-]+)(?:\/(\d+))?/i)
    if (m) return { type: 'invite', code: m[1], serverId: m[2] || null }
    m = s.match(/^(\d{8,25})@newsletter$/i)
    if (m) return { type: 'jid', jid: `${m[1]}@newsletter` }
    return null
}

export function need(sock, ...fns) {
    const missing = fns.filter((f) => typeof sock[f] !== 'function')
    if (missing.length) throw new ChannelError(`La versión Baileys en bot aún no tiene una función de canal (${missing.join(', ')}). Actualice primero el paquete baileys.`)
}

const textOf = (v) => (v && typeof v === 'object' ? v.text ?? '' : v ?? '')

export function normalize(md) {
    const vm = md.viewer_metadata || {}
    return {
        id: md.id,
        name: String(textOf(md.name) || textOf(md.thread_metadata?.name) || '-'),
        desc: String(textOf(md.description) || textOf(md.thread_metadata?.description) || ''),
        invite: md.invite || md.thread_metadata?.invite || '',
        subs: Number(md.subscribers ?? md.thread_metadata?.subscribers_count ?? 0) || 0,
        verified: /verified/i.test(String(md.verification || md.thread_metadata?.verification || '')),
        created: Number(md.creation_time ?? md.thread_metadata?.creation_time ?? 0) || 0,
        role: String(vm.role || vm.view_role || '').toUpperCase(),
        state: String(md.state?.type ?? md.state ?? '')
    }
}

export async function metadata(sock, ref) {
    need(sock, 'newsletterMetadata')
    const md = ref.type === 'jid' ? await sock.newsletterMetadata('jid', ref.jid) : await sock.newsletterMetadata('invite', ref.code)
    if (!md || !md.id) throw new ChannelError('Canal no encontrado. Consulta el enlace o ID.')
    return normalize(md)
}

export const isAdminRole = (role) => role === 'OWNER' || role === 'ADMIN'
export const link = (invite) => (invite ? `https://whatsapp.com/channel/${invite}` : '')

export const getCurrent = () => global.db?.channelKit?.current || null
export function setCurrent(c) {
    global.db.channelKit ||= {}
    global.db.channelKit.current = c
    try { saveDB(global.db) } catch {}
}

export async function pickTarget(sock, rawText, prefix = '.') {
    const raw = String(rawText || '')
    const m = raw.match(/^\s*(\S+)\s*([\s\S]*)$/)
    if (m && parseRef(m[1])) {
        const ref = parseRef(m[1])
        const md = await metadata(sock, ref)
        return { id: md.id, name: md.name, role: md.role, rest: m[2].trim(), serverId: ref.serverId, md }
    }
    const cur = getCurrent()
    if (!cur) throw new ChannelError(`Aún no hay ningún canal de destino. Configúrelo primero de la siguiente manera: ${prefix}setch <enlace de canal>\n(o escriba el enlace del canal al comienzo de este comando)`)
    return { id: cur.id, name: cur.name, role: cur.role || '', rest: raw.trim(), serverId: null, md: null }
}

export function assertCanPost(t) {
    if (t.role && !isAdminRole(t.role)) throw new ChannelError(`Solo cuenta bot "${t.role.toLowerCase()}" en el canal *${t.name}*, no administrador/propietario, por lo que no puedo publicar.\nHaga que el canal número bot sea administrador y luego repita.setch.`)
}

export function explain(err) {
    const m = String((err && (err.message || err)) || 'error desconocido')
    if (err instanceof ChannelError) return m
    if (/not-authorized|forbidden|\b40[13]\b|unauthorized/i.test(m)) return 'La cuenta bot no tiene permiso en este canal (debe ser propietario/administrador del canal).'
    if (/\b404\b|not-found|item-not-found/i.test(m)) return 'Canal o mensaje no encontrado. Consulta el enlace/ID.'
    if (/time(d)? ?out/i.test(m)) return 'WhatsApp no responde (tiempo de espera). Inténtalo de nuevo en un momento.'
    return m
}

async function handler(m, { sock, text, prefix, reply }) {
    const p = prefix || '.'
    const arg = String(text || '').trim()
    const cur = getCurrent()

    if (!arg) {
        return reply(
            `📌 *SALURAN TUJUAN*\n\n` +
            (cur ? `Nombre: ${cur.name}\nID: ${cur.id}\nRol bot: ${cur.role ? cur.role.toLowerCase() : 'desconocido'}` : 'Aún no configurado') +
            `\n\n📖 *CARA PAKAI*\n${p}setch <enlace de canal>\n${p}setch off  (eliminar)\nDespués: ${p}swch, ${p}playch, ${p}chname, etc.\n\n💡 El número bot debe ser el administrador/propietario del canal para poder publicar.`
        )
    }
    if (['off', 'hapus', 'reset'].includes(arg.toLowerCase())) {
        setCurrent(null)
        return reply('Saluran bawaan dihapus.')
    }

    const ref = parseRef(arg)
    if (!ref) return reply(`No es un enlace/canal ID.\nEjemplo: ${p}setch https://whatsapp.com/channel/0029VaXXXXXXXXXX`)
    try {
        const md = await metadata(sock, ref)
        setCurrent({ id: md.id, name: md.name, role: md.role })
        const warn = md.role && !isAdminRole(md.role) ? `\n⚠️ Solo cuenta bot "${md.role.toLowerCase()}" en este canal. Primero conviértelo en administrador para que puedas publicar.` : ''
        return reply(`✅ Saluran bawaan: *${md.name}*\nPengikut: ${md.subs.toLocaleString('id-ID')}${md.role ? `\nPeran bot: ${md.role.toLowerCase()}` : ''}${warn}`)
    } catch (err) {
        console.log('[CH] setch:', err.message)
        return reply(`❌ ${explain(err)}`)
    }
}

export { pluginConfig as config, handler }
