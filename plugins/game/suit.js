/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
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
  description: "Main Batu-Gunting-Kertas melawan Elysia (bisa taruhan koin)",
  usage: ".suit <batu|gunting|kertas> [taruhan]",
  example: ".suit batu 1000",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

const ICON = { batu: "✊ Batu", gunting: "✌️ Gunting", kertas: "🖐️ Kertas" };
const CHOICES = ["batu", "gunting", "kertas"];

async function handler(m) {
  const args = String(m.text || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const pick = args[0];
  if (!CHOICES.includes(pick)) {
    return m.reply(
      `✊✌️🖐️ *SUIT — ELYSIA*\n` +
      `> Pilih: \`batu\`, \`gunting\`, atau \`kertas\`\n` +
      `> Contoh: \`${m.prefix}suit batu\` atau \`${m.prefix}suit gunting 1000\``
    );
  }

  const db = getDatabase();
  const user = db.getUser(m.sender) || db.setUser(m.sender);
  const bet = Math.max(0, Math.min(50000, parseInt(args[1], 10) || 0));
  if (bet > 0 && (user?.koin || 0) < bet) {
    return m.reply(`❌ Koin kamu tidak cukup! Saldo: *${(user?.koin || 0).toLocaleString("id-ID")} Koin*`);
  }

  const botPick = CHOICES[Math.floor(Math.random() * CHOICES.length)];
  const win =
    (pick === "batu" && botPick === "gunting") ||
    (pick === "gunting" && botPick === "kertas") ||
    (pick === "kertas" && botPick === "batu");
  const draw = pick === botPick;

  let resultLine = "";
  if (draw) {
    resultLine = "🤝 *SERI!* Tidak ada koin yang berkurang.";
  } else if (win) {
    const reward = bet > 0 ? bet : 500;
    db.updateKoin(m.sender, reward);
    db.updateExp(m.sender, 150);
    resultLine = `🏆 *KAMU MENANG!* Hadiah: *+${reward.toLocaleString("id-ID")} Koin* & *+150 EXP*`;
  } else {
    if (bet > 0) db.updateKoin(m.sender, -bet);
    resultLine = bet > 0
      ? `😈 *ELYSIA MENANG!* Kamu kehilangan *${bet.toLocaleString("id-ID")} Koin*.`
      : `😈 *ELYSIA MENANG!* Coba lagi ya!`;
  }

  await m.reply(
    `╭─❖「 ✊✌️🖐️ *SUIT — ELYSIA* 」\n` +
      `│ 👤 Kamu   : *${ICON[pick]}*\n` +
      `│ 🌸 Elysia : *${ICON[botPick]}*\n` +
      `╰─────────────────────❖\n` +
      `${resultLine}`
  );
}

export { pluginConfig as config, handler };
