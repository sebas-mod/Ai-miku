/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const getDatabase = ElysiaRuntime.getDatabase;
const addExpWithLevelCheck = ElysiaRuntime.addExpWithLevelCheck;

  const pluginConfig = {
    name: 'crime',
    alias: [],
    category: "rpg",
    description: "Melakukan kejahatan membobol ATM (risiko tinggi)",
    usage: ".crime",
    example: ".crime",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 300,
    energi: 1,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    const db = getDatabase();
    const user = db.getUser(m.sender);

    if (!user.rpg) user.rpg = {};

    await m.react("💣");
    await m.reply("Memasang alat peretas di ATM seberang jalan... 💣💻");
    await new Promise((r) => setTimeout(r, 2500));

    const successRate = 0.5;
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
      const stolen = Math.floor(Math.random() * 15000) + 5000;
      const expGain = Math.floor(stolen / 20);

      user.koin = (user.koin || 0) + stolen;
      await addExpWithLevelCheck(sock, m, db, user, expGain);

      db.save();

      let txt = `HACKING SUKSES!! 💻💵\n\n`;
      txt += `Mesin ATM ngeluarin duit kayak air terjun! Lu langsung kabur bawa koper penuh duit.\n\n`;
      txt += `💰 Hasil Bobol: *+Rp ${stolen.toLocaleString("id-ID")}*\n`;
      txt += `📈 EXP Kriminal: *+${expGain}*`;

      await m.reply(txt);
    } else {
      const fine = Math.floor(Math.random() * 10000) + 5000;
      const actualFine = Math.min(fine, user.koin || 0);

      user.koin = Math.max(0, (user.koin || 0) - actualFine);
      user.rpg.health = Math.max(0, (user.rpg.health || 100) - 15);

      db.save();

      let txt = `NGIIING NGIING!! ALARM BUNYI!! 🚨🚓\n\n`;
      txt += `Sialan, mesinnya error dan polisi langsung ngepung dari segala arah!\n`;
      txt += `Lu dipentung pake tongkat polisi terus dipaksa bayar denda.\n\n`;
      txt += `💸 Denda Pidana: *-Rp ${actualFine.toLocaleString("id-ID")}*\n`;
      txt += `🤕 Memar Kena Pentung: *-15 HP*`;

      await m.reply(txt);
    }
  }

export { pluginConfig as config, handler }
