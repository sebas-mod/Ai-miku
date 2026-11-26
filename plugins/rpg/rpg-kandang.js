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
    name: "kandang",
    alias: [],
    category: "rpg",
    description: "Fitur RPG kandang",
    usage: ".kandang",
    example: ".kandang",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn }) {
      let banteng = global.db.data.users[m.sender].banteng;
      let harimau = global.db.data.users[m.sender].harimau;
      let gajah = global.db.data.users[m.sender].gajah;
      let kambing = global.db.data.users[m.sender].kambing;
      let panda = global.db.data.users[m.sender].panda;
      let buaya = global.db.data.users[m.sender].buaya;
      let kerbau = global.db.data.users[m.sender].kerbau;
      let sapi = global.db.data.users[m.sender].sapi;
      let monyet = global.db.data.users[m.sender].monyet;
      let babihutan = global.db.data.users[m.sender].babihutan;
      let babi = global.db.data.users[m.sender].babi;
      let ayam = global.db.data.users[m.sender].ayam;

      let ndy = `List Hewan Di Kandang

• Banteng: ${banteng} Ekor
• Harimau: ${harimau} Ekor
• Gajah: ${gajah} Ekor
• Kambing: ${kambing} Ekor
• Panda: ${panda} Ekor
• Buaya: ${buaya} Ekor
• Kerbau: ${kerbau} Ekor
• Sapi: ${sapi} Ekor
• Monyet: ${monyet} Ekor
• Babi Hutan: ${babihutan} Ekor
• Babi: ${babi} Ekor
• Ayam: ${ayam} Ekor

 `.trim();
      conn.reply(m.chat, ndy, m);
  };

export { pluginConfig as config, handler }
