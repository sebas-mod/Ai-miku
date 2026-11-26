/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { getActiveGame, setActiveGame, createDeck, handScore, formatHand } from "../../src/lib/features/miku-game.js";

const pluginConfig = {
  name: "blackjack",
  alias: ["bj"],
  category: "game",
  description: "Main kartu Blackjack 21 (hit / stand / double) dengan taruhan koin",
  usage: ".blackjack [taruhan]",
  example: ".bj 1000",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ Masih ada game *${active.type}* yang aktif di chat ini! Ketik \`${m.prefix}stopgame\` untuk berhenti.`);

  const db = getDatabase();
  const user = db.getUser(m.sender) || db.setUser(m.sender);
  const bet = Math.max(100, Math.min(50000, parseInt(m.text, 10) || 1000));

  if ((user?.koin || 0) < bet) {
    return m.reply(`❌ Koin kamu tidak cukup! Saldo: *${(user?.koin || 0).toLocaleString("id-ID")} Koin*`);
  }

  db.updateKoin(m.sender, -bet);
  const deck = createDeck();
  const hand = [deck.pop(), deck.pop()];
  const dealer = [deck.pop(), deck.pop()];
  const score = handScore(hand);

  if (score === 21) {
    const win = Math.floor(bet * 2.5);
    db.updateKoin(m.sender, win);
    db.updateExp(m.sender, 400);
    return m.reply(
      `╭─❖「 🃏 *NATURAL BLACKJACK 21!* 」\n` +
        `│ 🤵 Dealer : ${formatHand(dealer)} (*${handScore(dealer)}*)\n` +
        `│ 👤 Kamu   : ${formatHand(hand)} (*21*)\n` +
        `╰─────────────────────❖\n` +
        `🎉 *JACKPOT!* Kamu menang *+${win.toLocaleString("id-ID")} Koin*!`
    );
  }

  const session = {
    type: "blackjack",
    startedAt: Date.now(),
    player: m.sender,
    bet,
    deck,
    hand,
    dealer,
  };

  setActiveGame(m.chat, session, 90000, async (cur) => {
    db.updateKoin(cur.player, cur.bet);
    await sock.sendMessage(m.chat, { text: `⏰ Sesi *Blackjack* timeout. Taruhan *${cur.bet.toLocaleString("id-ID")} Koin* dikembalikan.` });
  });

  await m.reply(
    `╭─❖「 🃏 *BLACKJACK — MIKU* 」\n` +
      `│ 🤵 Dealer : ${formatHand(dealer, true)}\n` +
      `│ 👤 Kamu   : ${formatHand(hand)} (*${score}*)\n` +
      `│ 💰 Taruhan: *${bet.toLocaleString("id-ID")} Koin*\n` +
      `╰─────────────────────❖\n` +
      `_Ketik *hit* (tambah kartu), *stand* (berhenti), atau *double* (gandakan taruhan)._`
  );
}

export { pluginConfig as config, handler };
