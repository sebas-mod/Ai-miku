/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const toPN = ElysiaRuntime.toPN;

const pluginConfig = {
    name: "getpp",
    alias: [],
    category: "tools",
    description: "getpp @user1 @user2 ...",
    usage: ".getpp @user1 @user2 ...",
    example: ".getpp @user1 @user2 ...",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const MAX = 10
  const num = (jid) => String(jid || '').split('@')[0]

  async function fetchPP(sock, jid) {
      const tries = [jid]
      try { const pn = await toPN(sock, jid); if (pn && pn !== jid) tries.push(pn) } catch {}
      for (const j of tries) {
          try {
              const url = await sock.profilePictureUrl(j, 'image')
              if (!url) continue
              const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
              if (!res.ok) continue
              return Buffer.from(await res.arrayBuffer())
          } catch {}
      }
      return null
  }

  async function handler(m, { sock, reply }) {
      const chat = m.chat
      let targets = [...(m.mentionedJid || [])]
      if (!targets.length && m.quoted?.sender) targets.push(m.quoted.sender)
      if (!targets.length) targets.push(m.sender)
      targets = [...new Set(targets)]

      const over = targets.length > MAX
      if (over) targets = targets.slice(0, MAX)

      const results = await Promise.all(targets.map(async (jid) => ({ jid, buf: await fetchPP(sock, jid) })))
      const ok = results.filter(r => r.buf)
      const fail = results.filter(r => !r.buf)

      if (!ok.length) {
          return reply(`❌ Tidak ada foto profil yang bisa diambil (kosong atau disembunyikan):\n${fail.map(f => '• @' + num(f.jid)).join('\n')}`)
      }

      const cap = (r) => `Foto profil @${num(r.jid)}`
      const mentions = ok.map(r => r.jid)

      if (ok.length === 1) {
          await sock.sendMessage(chat, { image: ok[0].buf, caption: cap(ok[0]), mentions }, { quoted: m })
      } else {
          try {
              await sock.sendMessage(chat, {
                  album: ok.map(r => ({ image: r.buf, caption: cap(r), mentions: [r.jid] }))
              }, { quoted: m })
          } catch (e) {
              console.error('[getpp] album gagal, kirim satu-satu:', e?.message || e)
              for (const r of ok) {
                  await sock.sendMessage(chat, { image: r.buf, caption: cap(r), mentions: [r.jid] }, { quoted: m }).catch(() => {})
              }
          }
      }

      const notes = []
      if (fail.length) notes.push(`⚠️ Tanpa foto / disembunyikan: ${fail.map(f => '@' + num(f.jid)).join(', ')}`)
      if (over) notes.push(`ℹ️ Maksimal ${MAX} orang sekali ambil.`)
      if (notes.length) await sock.sendMessage(chat, { text: notes.join('\n'), mentions: fail.map(f => f.jid) }, { quoted: m })
  }

export { pluginConfig as config, handler }
