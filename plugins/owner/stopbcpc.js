/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'stopbcpc',
  alias: ['stopbroadcastpc'],
  category: 'owner',
  description: 'Hentikan broadcast private yang sedang berjalan',
  usage: '.stopbcpc',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  if (!global.statusBcpc) {
    return m.reply('❌ No hay ninguna difusión privada en curso.')
  }
  global.stopBcpc = true
  return m.reply('⏹️ Menghentikan broadcast private...')
}

export { pluginConfig as config, handler }
