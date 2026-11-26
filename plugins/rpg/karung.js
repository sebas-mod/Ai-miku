/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "karung",
    alias: [],
    category: "rpg",
    description: "karung",
    usage: ".karung",
    example: ".karung",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m) {
    let user = global.db.data.users[m.sender]
    if (!user) return

    user.botol = user.botol || 0
    user.kardus = user.kardus || 0
    user.kaleng = user.kaleng || 0
    user.gelas = user.gelas || 0
    user.plastik = user.plastik || 0

    let isi = [
      ['botol', '🧴 Botol'],
      ['kardus', '📦 Kardus'],
      ['kaleng', '🥫 Kaleng'],
      ['gelas', '🥛 Gelas'],
      ['plastik', '🛍️ Plastik']
    ]
    .map(([k, label]) => user[k] > 0 ? `${label}: ${user[k]}` : null)
    .filter(Boolean)
    .join('\n')

    let teks = isi
      ? `📮 *ISI KARUNG KAMU*\n\n${isi}`
      : '📮 Karung kamu masih kosong!'

    m.reply(teks)
  }

export { pluginConfig as config, handler }
