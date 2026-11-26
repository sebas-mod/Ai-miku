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
    name: "faktaunik",
    alias: [],
    category: "tools",
    description: "faktaunik",
    usage: ".faktaunik",
    example: ".faktaunik",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const facts = [
    'Madu murni adalah satu-satunya makanan yang tidak pernah basi, bahkan setelah ribuan tahun!',
    'Jantung paus biru berukuran sebesar mobil kecil dan detaknya terdengar hingga radius 3 kilometer. 🐋',
    'Kucing menghabiskan sekitar 70% dari hidupnya untuk tidur. ( ˘͈ ᵕ ˘͈ ) 🐱',
    'Semut tidak pernah tidur dan tidak memiliki paru-paru. 🐜',
    'Sidik jari koala sangat mirip dengan sidik jari manusia hingga sulit dibedakan di bawah mikroskop. 🐨',
    'Air panas akan membeku lebih cepat daripada air dingin (efek Mpemba). ❄️',
    'Gurita memiliki 3 jantung dan darah mereka berwarna biru. 🐙',
    'Satu sendok teh bintang neutron memiliki berat sekitar 6 miliar ton! 🌌',
    'Pisang secara botani tergolong sebagai buah beri, sedangkan stroberi bukan!',
    'Kupu-kupu merasakan makanan menggunakan kakinya. 🦋'
  ]

  async function handler(m) {
    const item = facts[Math.floor(Math.random() * facts.length)]
    await m.reply(
      `╭─── ୨୧ FAKTA UNIK ୨୧ ───╮\n` +
      `│ ૮₍˶ᵔ ᵕ ᵔ˶₎ა tahukah kamu?\n` +
      `╰─────────────────────────╯\n\n` +
      `୨ৎ *Fakta Dunia:*\n${item}\n\n` +
      `꒰ა ♡ ໒꒱ wawasan baru bersama ${global.namebot}!`
    )
  }

export { pluginConfig as config, handler }
