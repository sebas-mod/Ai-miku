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
  name: "suit",
  alias: ["rps", "janken"],
  category: "game",
  description: "Juega a piedra, papel o tijera contra Miku (puedes apostar monedas)",
  usage: ".suit <batu|gunting|kertas> [apuesta]",
  example: ".suit batu 1000",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

const ICON = { batu: "✊ Piedra", gunting: "✌️ Tijera", kertas: "🖐️ Papel" };
const CHOICES = ["batu", "gunting", "kertas"];

async function handler(m) {
  const args = String(m.text || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const pick = args[0];
  if (!CHOICES.includes(pick)) {
    return m.reply(
      `✊✌️🖐️ *SUIT — MIKU*\n` +
      `> Elige: \`batu\` (piedra), \`gunting\` (tijera) o \`kertas\` (papel)\n` +
      `> Ejemplo: \`${m.prefix}suit batu\` o \`${m.prefix}suit gunting 1000\``
    );
  }

  const db = getDatabase();
  const user = db.getUser(m.sender) || db.setUser(m.sender);
  const bet = Math.max(0, Math.min(50000, parseInt(args[1], 10) || 0));
  if (bet > 0 && (user?.koin || 0) < bet) {
    return m.reply(`❌ ¡No tienes suficientes monedas! Balance: *${(user?.koin || 0).toLocaleString("id-ID")} monedas*`);
  }

  const botPick = CHOICES[Math.floor(Math.random() * CHOICES.length)];
  const win =
    (pick === "batu" && botPick === "gunting") ||
    (pick === "gunting" && botPick === "kertas") ||
    (pick === "kertas" && botPick === "batu");
  const draw = pick === botPick;

  let resultLine = "";
  if (draw) {
    resultLine = "🤝 *¡EMPATE!* No se pierde ninguna moneda.";
  } else if (win) {
    const reward = bet > 0 ? bet : 500;
    db.updateKoin(m.sender, reward);
    db.updateExp(m.sender, 150);
    resultLine = `🏆 *¡HAS GANADO!* Premio: *+${reward.toLocaleString("id-ID")} monedas* y *+150 EXP*`;
  } else {
    if (bet > 0) db.updateKoin(m.sender, -bet);
    resultLine = bet > 0
      ? `😈 *¡MIKU GANA!* Has perdido *${bet.toLocaleString("id-ID")} monedas*.`
      : `😈 *¡MIKU GANA!* ¡Inténtalo otra vez!`;
  }

  await m.reply(
    `╭─❖「 ✊✌️🖐️ *SUIT — MIKU* 」\n` +
      `│ 👤 Tú     : *${ICON[pick]}*\n` +
      `│ 🌸 Miku : *${ICON[botPick]}*\n` +
      `╰─────────────────────❖\n` +
      `${resultLine}`
  );
}

export { pluginConfig as config, handler };
