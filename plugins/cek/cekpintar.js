/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { runCekAnimation } from '../../src/lib/system/cek-engine.js'

const pluginConfig = {
  name: 'cekpintar',
  alias: ['pintar'],
  category: 'cek',
  description: 'Cek tingkat kepintaran (radar hiburan interaktif)',
  usage: '.cekpintar [@user / reply / nama]',
  example: '.cekpintar @user',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  isAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
}

const EMOJI = '📚'
const NOUN = 'kepintaran'
const KIND = 'good'
const SYMPTOM = 'Jago menjawab pertanyaan sulit maupun bikin alasan logis'
const TIP = 'Tetap rendah hati dan jangan pelit berbagi ilmu'

function resolveTarget(m, text) {
  if (m.mentionedJid?.length) {
    const jid = m.mentionedJid[0]
    return { label: `@${jid.split('@')[0]}`, mentions: [jid] }
  }
  if (m.quoted?.sender) {
    const jid = m.quoted.sender
    return { label: `@${jid.split('@')[0]}`, mentions: [jid] }
  }
  const clean = String(text || '').trim()
  if (clean) return { label: clean, mentions: [] }
  return { label: `@${m.sender.split('@')[0]}`, mentions: [m.sender] }
}

async function handler(m, { sock, text }) {
  const { label, mentions } = resolveTarget(m, text)
  const percent = Math.floor(Math.random() * 101)
  const title = pluginConfig.name.replace(/^cek/i, 'CEK ').trim()

  await runCekAnimation(m, sock, {
    title,
    emoji: EMOJI,
    noun: NOUN,
    kind: KIND,
    symptom: SYMPTOM,
    tip: TIP,
    targetLabel: label,
    mentions,
    percent,
  })
}

export { pluginConfig as config, handler }
