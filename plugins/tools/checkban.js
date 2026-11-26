/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const reactTo = MikuRuntime.reactTo;

const pluginConfig = {
    name: "checkban",
    alias: ["cekbanwa"],
    category: "tools",
    description: "checkban <nomor>",
    usage: ".checkban <nomor>",
    example: ".checkban <nomor>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const API_URL = 'https://apiii-xrina.my.id/tools/cekban-wa'

  async function handler(m, { sock, text, prefix, command, reply }) {
      const number = String(text || '').trim().split(/\s+/)[0]?.replace(/[^0-9]/g, '')

      if (!number) {
          return reply(`❀ ¡Escribe el número de WhatsApp que quieres comprobar!\n\n乂 Ejemplo:\n  ${prefix}${command} 6283456789011`)
      }
      if (number.length < 8 || number.length > 15) return reply('❌ ¡Formato de número no válido!')

      try {
          await reactTo(sock, m, '🔎')

          const { data: res } = await axios.get(API_URL, {
              params: { number },
              timeout: 30000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
          })

          if (!res?.status || !res?.data) {
              await reactTo(sock, m, '❌')
              return reply('❌ No se pudieron obtener los datos del número.')
          }

          const d = res.data
          const detail = d.detail || {}
          const banned = d.banned
          const exists = d.exists
          const registered = detail.registered

          const statusText = banned === true ? '🔴 BANNED'
              : banned === false ? '🟢 TIDAK BANNED'
              : String(d.status || 'Unknown').toUpperCase()
          const registeredText = registered === true ? '✅ Terdaftar' : registered === false ? '❌ Tidak terdaftar' : '❔ Tidak diketahui'
          const existsText = exists === true ? '✅ Ya' : exists === false ? '❌ Tidak' : '❔ Tidak diketahui'

          const methods = Array.isArray(detail.fallback_methods) ? detail.fallback_methods : []
          const recommended = Array.isArray(detail.recommended_method) ? detail.recommended_method : []
          const formatList = (arr) => arr.length ? arr.map((v, i) => `  ${i + 1}. ${v}`).join('\n') : '  Tidak tersedia'

          const checkedAt = detail.checked_at
              ? new Date(detail.checked_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'medium' })
              : 'Tidak tersedia'

          const teks = `
乂 *WHATSAPP BAN CHECK*

┌─「 📱 INFORMASI NOMOR 」
│ • Nomor: ${d.phone || number}
│ • Masked: ${d.masked || '-'}
│ • Status: ${statusText}
│ • Ban: ${banned === true ? 'Ya' : banned === false ? 'Tidak' : 'Unknown'}
│ • Terdaftar WA: ${existsText}
│ • Registrasi: ${registeredText}
└──────────────

┌─「 🔐 METODE LOGIN 」
│ • Total metode: ${detail.total_methods ?? 0}
│ • Database terlihat: ${detail.num_visible_dbs_methods ?? 0}
│ • Panjang kode SMS: ${detail.sms_length ?? '-'}
│ • Panjang kode voice: ${detail.voice_length ?? '-'}
│ • Flash type: ${detail.flash_type ?? '-'}
└──────────────

┌─「 📋 FALLBACK METHODS 」
${formatList(methods)}
└──────────────

┌─「 ⭐ RECOMMENDED METHODS 」
${formatList(recommended)}
└──────────────

┌─「 🕒 WAKTU PENGECEKAN 」
│ • ${checkedAt}
└──────────────

> *Arthazy </>*
`.trim()

          await sock.sendMessage(m.chat, { text: teks }, { quoted: m })
          await reactTo(sock, m, '✅')
      } catch (e) {
          console.error('[CEKBAN WA]', e)
          await reactTo(sock, m, '❌')
          return reply('❌ No se pudo comprobar el número de WhatsApp.\nPuede que la API esté caída o tardando. Inténtalo más tarde.')
      }
  }

export { pluginConfig as config, handler }
