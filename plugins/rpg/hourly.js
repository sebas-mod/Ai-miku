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
const config = ElysiaRuntime.config;

  const pluginConfig = {
    name: 'hourly',
    alias: [],
    category: "rpg",
    description: "Klaim hadiah per jam",
    usage: ".hourly",
    example: ".hourly",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 0,
    energi: 0,
    isEnabled: true,
  };

  function msToTime(duration) {
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const seconds = Math.floor((duration / 1000) % 60);
    return `${minutes} menit ${seconds} detik`;
  }

  async function handler(m, { sock }) {
    const db = getDatabase();
    const user = db.getUser(m.sender);
    const isPremium = config.isPremium?.(m.sender) || false;

    if (!user.rpg) user.rpg = {};

    const COOLDOWN = 3600000;
    const lastClaim = user.rpg.lastHourly || 0;
    const now = Date.now();

    if (now - lastClaim < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastClaim);
      return m.reply(`Eits, buru-buru amat kak! 😂\n\nJatah jam ini udah kamu ambil, tunggu *${msToTime(remaining)}* lagi ya baru balik ke sini! 🏃💨`);
    }

    const expReward = isPremium ? 1000 : 200;
    const moneyReward = isPremium ? 5000 : 1000;

    user.rpg.lastHourly = now;
    user.koin = (user.koin || 0) + moneyReward;

    const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);
    db.save();

    await m.react("⏰");

    let txt = `WAKTUNYA GAJIAN JAM-JAMAN! ⏰\n\n`;
    txt += `Ini dia jatah kamu:\n`;
    txt += `💸 Koin: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n\n`;
    txt += `Balik lagi 1 jam kemudian ya kak! 😘`;

    m.reply(txt);
  }

export { pluginConfig as config, handler }
