/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
  name: "slot",
  alias: ["slots", "spin"],
  category: "game",
  description: "Gira la máquina de tragamonedas de cristal de Miku y gana hasta 10x tu apuesta",
  usage: ".slot [apuesta]",
  example: ".slot 1000",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

const SYMBOLS = ["🌸", "💎", "⭐", "🍒", "🔔", "7️⃣"];

function pick() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

async function handler(m) {
  const db = getDatabase();
  const user = db.getUser(m.sender) || db.setUser(m.sender);
  const bet = Math.max(100, Math.min(50000, parseInt(m.text, 10) || 500));

  if ((user?.koin || 0) < bet) {
    return m.reply(`❌ ¡No tienes suficientes monedas! Tu saldo: *${(user?.koin || 0).toLocaleString("id-ID")} monedas*`);
  }

  db.updateKoin(m.sender, -bet);
  const row1 = [pick(), pick(), pick()];
  const mid = [pick(), pick(), pick()];
  const row3 = [pick(), pick(), pick()];

  let mult = 0;
  let badge = "😢 *¡Sin suerte!*";
  if (mid[0] === mid[1] && mid[1] === mid[2]) {
    if (mid[0] === "7️⃣") { mult = 10; badge = "👑 *MEGA JACKPOT 777 (10x)!*"; }
    else if (mid[0] === "💎" || mid[0] === "🌸") { mult = 6; badge = "💎 *CRYSTAL JACKPOT (6x)!*"; }
    else { mult = 4; badge = "🎉 *TRIPLE MATCH (4x)!*"; }
  } else if (mid[0] === mid[1] || mid[1] === mid[2] || mid[0] === mid[2]) {
    mult = 1.5;
    badge = "✨ *DOUBLE MATCH (1.5x)!*";
  }

  const win = Math.floor(bet * mult);
  if (win > 0) {
    db.updateKoin(m.sender, win);
    db.updateExp(m.sender, 120);
  }

  await m.reply(
    `╭─❖「 🎰 *MIKU CRYSTAL SLOT* 」\n` +
      `│     ${row1.join(" │ ")}\n` +
      `│ ▶  ${mid.join(" │ ")}  ◀\n` +
      `│     ${row3.join(" │ ")}\n` +
      `├───〔 *RESULTADO* 〕\n` +
      `│ ${badge}\n` +
      `│ 💰 Apuesta : ${bet.toLocaleString("id-ID")} monedas\n` +
      `│ 🎁 Premio  : *${win > 0 ? `+${win.toLocaleString("id-ID")}` : "0"} Monedas*\n` +
      `╰─────────────────────❖`
  );
}

export { pluginConfig as config, handler };
