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
    name: "warteg",
    alias: ["makanwarteg"],
    category: "rpg",
    description: "Fitur RPG warteg",
    usage: ".warteg",
    example: ".warteg",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const foods = [
  { name:'Nasi Telur', price:2000, health:10, exp:5 },
  { name:'Nasi Tempe', price:3000, health:12, exp:6 },
  { name:'Nasi Tahu', price:3000, health:12, exp:6 },
  { name:'Nasi Sayur', price:3500, health:14, exp:7 },
  { name:'Nasi Ayam', price:5000, health:18, exp:10 },
  { name:'Nasi Ikan', price:6000, health:20, exp:12 },
  { name:'Nasi Lele', price:6500, health:22, exp:13 },
  { name:'Nasi Udang', price:8000, health:28, exp:15 },
  { name:'Nasi Rendang', price:9000, health:30, exp:18 },
  { name:'Nasi Ayam Bakar', price:10000, health:35, exp:20 },
  { name:'Paket Kenyang', price:15000, health:50, exp:25 },
  { name:'Paket Sultan', price:25000, health:80, exp:40 }
  ]

  function formatNumber(num){
  if(num>=1000000)return(num/1000000).toFixed(1)+'M'
  if(num>=1000)return(num/1000).toFixed(1)+'k'
  return num.toString()
  }

  async function handler(m,{conn,args}) {
  let user = global.db.data.users[m.sender]

  if(!args[0]){
  let text=`
*${(global.namebot || 'BOT').toUpperCase()} WARTEG* ❀

Selamat datang di warteg 🍽️

Contoh:
.warteg nasi telur
.warteg paket kenyang

Daftar menu:
`.trim()

  foods.forEach((f,i)=>{
  text+=`

${i+1}. ${f.name}
💹 Harga : ${formatNumber(f.price)}
❤️ Heal : +${f.health}
Exp : +${f.exp}`
  })

  return conn.reply(m.chat,text,m)
  }

  let pilih = args.join(' ').toLowerCase()
  let food = foods.find(v=>v.name.toLowerCase()==pilih)

  if(!food) return conn.reply(m.chat,'Menu tidak ditemukan.\nCek daftar dengan *.warteg*',m)

  if(user.money < food.price)
  return conn.reply(m.chat,`Money tidak cukup.\nButuh ${formatNumber(food.price-user.money)} lagi`,m)

  user.money -= food.price

  let keracunan = Math.random() < 0.15

  if(keracunan){
  user.health -= 10

  return conn.reply(m.chat,`
🤢 Kamu makan *${food.name}*

Tapi makanannya basi...

❤️ Health -10
💸 Money -${formatNumber(food.price)}

❤️ Health sekarang : ${user.health}
`.trim(),m)
  }

  user.health += food.health
  user.exp += food.exp

  if(user.health > user.maxhealth) user.health = user.maxhealth

  conn.reply(m.chat,`
🍽️ Kamu makan *${food.name}*

❤️ Health +${food.health}
Exp +${food.exp}
💸 Money -${formatNumber(food.price)}

❤️ Health : ${user.health}
💰 Money : ${formatNumber(user.money)}
`.trim(),m)
  }

export { pluginConfig as config, handler }
