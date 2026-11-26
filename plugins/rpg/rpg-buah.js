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
    name: "buah",
    alias: [],
    category: "rpg",
    description: "listbuah",
    usage: ".listbuah",
    example: ".listbuah",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { usedPrefix }) {
      let user = global.db.data.users[m.sender];
      let ini_txt = `[ *GUDANG BUAH KAMU* ]\n\n`;
      ini_txt += `${user.pisang} Pisang\n`;
      ini_txt += `${user.anggur} Anggur\n`;
      ini_txt += `${user.mangga} Mangga\n`;
      ini_txt += `${user.jeruk} Jeruk\n`;
      ini_txt += `${user.apel} Apel\n\n`;
      ini_txt += `Ketik *${usedPrefix}jual* Untuk Menjual.`;
      m.reply(ini_txt);
  };

export { pluginConfig as config, handler }
