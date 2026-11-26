/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { getTimeGreeting } from "../../src/lib/core/formatter.js";
const pluginConfig = {
  name: "daily",
  alias: ["claim", "harian", "bonus"],
  category: "user",
  description: "Claim hadiah harian (Exp dan Potion)",
  usage: ".daily",
  example: ".daily",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.cooldowns) user.cooldowns = {};
  const lastDaily = user.cooldowns.daily || 0;
  const now = Date.now();

  if (now - lastDaily < DAILY_COOLDOWN) {
    const remaining = lastDaily + DAILY_COOLDOWN - now;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return m.reply(
      `🕕 *ᴄᴏᴏʟᴅᴏᴡɴ*\n\n> Kamu sudah klaim hari ini.\n> Tunggu: *${hours} jam ${minutes} menit* lagi.`,
    );
  }

  const expReward = Math.floor(Math.random() * 5000) + 1000;
  const potionReward = Math.floor(Math.random() * 3) + 1;

  if (!user.rpg) user.rpg = {};
  db.updateExp(m.sender, expReward);

  if (!user.inventory) user.inventory = {};
  user.inventory.potion = (user.inventory.potion || 0) + potionReward;

  user.cooldowns.daily = now;
  db.save();

  const greeting = getTimeGreeting();

  let txt = `🎉 *ᴅᴀɪʟʏ ᴄʟᴀɪᴍ sᴜᴋsᴇs*\n`;
  txt += `> ${greeting}, @${m.sender.split("@")[0]}\n\n`;
  txt += `╭┈┈⬡「 🎁 *ʀᴇᴡᴀʀᴅs* 」\n`;
  txt += `┃ 🚄 Exp: *+${expReward}*\n`;
  txt += `┃ 🥤 Potion: *+${potionReward}*\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `> Jangan lupa claim lagi besok!`;

  await m.reply(txt, { mentions: [m.sender] });
}

export { pluginConfig as config, handler };
