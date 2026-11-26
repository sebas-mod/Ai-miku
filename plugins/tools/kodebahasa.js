/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const KODE_BAHASA = ElysiaRuntime.KODE_BAHASA;
const sleep = ElysiaRuntime.sleep;

const pluginConfig = {
    name: "kodebahasa",
    alias: [],
    category: "tools",
    description: "kodebahasa",
    usage: ".kodebahasa",
    example: ".kodebahasa",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { reply }) {
      await reply(KODE_BAHASA)
      await sleep(2500)
      await reply('Kode bahasa ini dipakai untuk menentukan terjemahan dari bahasa apa ke bahasa apa. Contoh: id|en berarti dari Indonesia ke Inggris.')
  }

export { pluginConfig as config, handler }
