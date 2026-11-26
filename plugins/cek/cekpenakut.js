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
  name: 'cekpenakut',
  alias: ["penakut"],
  category: 'cek',
  description: 'Cek tingkat kepenakutan (radar hiburan interaktif)',
  usage: '.cekpenakut [@user / reply / nama]',
  example: '.cekpenakut @user',
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

const EMOJI = '👻'
const NOUN = 'kepenakutan'
const KIND = 'bad'
const SYMPTOM = 'Ke kamar mandi jam 1 malam aja harus ditemenin satu RT'
const TIP = 'Tenang, setan juga males gangguin orang yang lagi bokek'

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
