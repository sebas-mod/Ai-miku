/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
const elysiaWrapPlugin = ElysiaRuntime.elysiaWrapPlugin;

  const pluginConfig = {
      name: 'rekom-anime',
      alias: ["rekomanime"],
      category: "anime",
      description: 'Rekomendasi anime random',
      usage: '.rekom-anime',
      example: '.rekom-anime',
      cooldown: 5,
      energi: 0,
      isEnabled: true
  }

  async function run(m) {

  const list = [

  "Attack on Titan",
  "Death Note",
  "Fullmetal Alchemist Brotherhood",
  "Steins Gate",
  "Code Geass",
  "Hunter x Hunter",
  "Demon Slayer",
  "Jujutsu Kaisen",
  "Tokyo Ghoul",
  "One Punch Man",
  "Mob Psycho 100",
  "Vinland Saga",
  "Chainsaw Man",
  "Your Lie in April",
  "Clannad After Story",
  "Toradora",
  "Horimiya",
  "Elysia Assistant-sama Love is War",
  "My Dress Up Darling",
  "Angel Beats",

  "No Game No Life",
  "Re Zero",
  "Sword Art Online",
  "Overlord",
  "Konosuba",
  "Tensei Slime",
  "Mushoku Tensei",
  "Log Horizon",
  "Shield Hero",
  "Dr Stone",

  "Made in Abyss",
  "Erased",
  "Parasyte",
  "Akame ga Kill",
  "Black Clover",
  "Blue Exorcist",
  "Noragami",
  "Fire Force",
  "Soul Eater",
  "Haikyuu",

  "Kuroko no Basket",
  "Blue Lock",
  "Yuri on Ice",
  "Sk8 the Infinity",
  "Free",
  "Initial D",
  "Megalo Box",
  "Ping Pong the Animation",
  "Run With The Wind",

  "Neon Genesis Evangelion",
  "Gurren Lagann",
  "86 Eighty Six",
  "Darling in the Franxx",
  "Aldnoah Zero",
  "Eureka Seven",
  "Gundam Iron Blooded Orphans",
  "SSSS Gridman",
  "Macross Frontier",

  "Bocchi the Rock",
  "Carole and Tuesday",
  "Vivy Fluorite Eye Song",
  "Zombieland Saga",
  "K-On",
  "Sound Euphonium",
  "Beck",
  "Nana",
  "Given",

  "Monster",
  "Berserk",
  "Fate Zero",
  "Fate Stay Night",
  "Fate Apocrypha",
  "Akudama Drive",
  "Cyberpunk Edgerunners",
  "Odd Taxi",
  "Great Pretender",
  "Bungo Stray Dogs",

  "Dorohedoro",
  "Heavenly Delusion",
  "Summertime Rendering",
  "Golden Kamuy",
  "Dororo",
  "Kabaneri of the Iron Fortress",
  "Seraph of the End",
  "The Promised Neverland",
  "Classroom of the Elite",
  "Tomodachi Game"

  ]

  const anime = list[Math.floor(Math.random()*list.length)]

  let text

  if (anime === "Darling in the Franxx") {

  m.react("😍")

  text =
  `╭━━━〔 💗 ANIME FAVORIT 💗 〕━━⬣
┃
┃ EH?! DARLING!! 😳
┃
┃ Elysia Assistant sangat merekomendasikan
┃ anime ini!!
┃
┃ 📺 Judul :
┃ ${anime}
┃
┃ Ini anime tentang
┃ *Elysia Assistant* loh!! 💕
┃
┃ Darling wajib nonton!!
┃ SERIUS!! 😆✨
┃
┃ Nanti bilang ya
┃ Elysia Assistant paling lucu 😏
┃
╰━━━━━━━━━━━━━━━━⬣`

  } else {

  m.react("✨")

  text =
  `╭━━━〔 🎌 REKOMENDASI ANIME 🎌 〕━━⬣
┃
┃ Elysia Assistant punya
┃ rekomendasi anime nih~
┃
┃ 📺 Judul :
┃ ${anime}
┃
┃ Coba tonton ini ya
┃ darling 😋
┃
╰━━━━━━━━━━━━━━━━⬣`

  }

  m.reply(text)

  }

  const handler = elysiaWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
