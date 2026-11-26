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
import fs from 'fs';
import path from 'path';

  const pluginConfig = {
    name: 'fotorandom002',
    alias: [],
    category: "anime",
    description: 'Ai Miku random image 💗',
    usage: '.fotorandom',
    isEnabled: true,
    cooldown: 5
  }

  async function run(m, { sock }) {

  const folderPath = path.join(process.cwd(), 'assets', 'foto-random')

  if (!fs.existsSync(folderPath)) {
      return m.reply('❌ Folder Ai Miku belum ada, darling...')
  }

  const files = fs.readdirSync(folderPath)

  const images = files.filter(file =>
      file.endsWith('.jpg') ||
      file.endsWith('.jpeg') ||
      file.endsWith('.png') ||
      file.endsWith('.webp')
  )

  if (images.length === 0) {
      return m.reply('📂 Foto Ai Miku masih kosong... aku jadi kesepian 😢')
  }

  const randomFile = images[Math.floor(Math.random() * images.length)]
  const filePath = path.join(folderPath, randomFile)

  const captions = [
  "Darling… kamu manggil aku? 😈",
  "Aku cuma punya kamu loh 💕",
  "Jangan liat yang lain ya… aku cemburu 😠",
  "Ara ara~ kamu suka aku ya? 😏",
  "Aku cantik hari ini kan? 💗",
  "Kamu gak bakal ninggalin aku kan...? 🥺",
  "Kalo kamu pergi… aku marah 😈🔥"
  ]

  const randomCaption = captions[Math.floor(Math.random() * captions.length)]

  await m.react('💗')

  await sock.sendMessage(m.chat, {
  image: fs.readFileSync(filePath),
  caption: `╭━━━〔 💗 FOTO RANDOM 💗 〕━━━⬣
┃
┃ ${randomCaption}
┃
┃ 📸 File : ${randomFile}
┃ 💞 Mode : Waifu Active
┃
╰━━━━━━━━━━━━━━━━━━⬣`
  }, { quoted: m })

  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
