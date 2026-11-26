/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../data/database.js";

if (!globalThis.__elysiaGameSessions) {
  globalThis.__elysiaGameSessions = new Map();
}

const gameSessions = globalThis.__elysiaGameSessions;

export function getActiveGame(chatId) {
  return gameSessions.get(chatId) || null;
}

export function setActiveGame(chatId, session, timeoutMs = 120000, onTimeout = null) {
  clearActiveGame(chatId);
  const timer = setTimeout(async () => {
    const cur = gameSessions.get(chatId);
    if (!cur || cur.startedAt !== session.startedAt) return;
    gameSessions.delete(chatId);
    if (typeof onTimeout === "function") {
      await onTimeout(cur).catch(() => {});
    }
  }, timeoutMs);
  timer.unref?.();
  session.timer = timer;
  gameSessions.set(chatId, session);
  return session;
}

export function clearActiveGame(chatId) {
  const s = gameSessions.get(chatId);
  if (s?.timer) clearTimeout(s.timer);
  gameSessions.delete(chatId);
}

// --- Tic-Tac-Toe Helpers ---
const TTT_NUMS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
const TTT_WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function renderTTTBoard(board) {
  const cells = board.map((v, i) => (v === "X" ? "❌" : v === "O" ? "⭕" : TTT_NUMS[i]));
  return `${cells[0]} ${cells[1]} ${cells[2]}\n${cells[3]} ${cells[4]} ${cells[5]}\n${cells[6]} ${cells[7]} ${cells[8]}`;
}

function checkTTTWinner(board) {
  for (const [a, b, c] of TTT_WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "DRAW" : null;
}

function bestAIMove(board) {
  // Win or block first, then center/corner
  for (const mark of ["O", "X"]) {
    for (const [a, b, c] of TTT_WINS) {
      const line = [board[a], board[b], board[c]];
      if (line.filter((x) => x === mark).length === 2 && line.includes(null)) {
        return [a, b, c][line.indexOf(null)];
      }
    }
  }
  if (!board[4]) return 4;
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const open = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  return open[Math.floor(Math.random() * open.length)];
}

// --- Hangman Helpers ---
const HANGMAN_STAGES = [
  "```\n  +---+\n  |   |\n      |\n      |\n      |\n=========\n```",
  "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n=========\n```",
  "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n=========\n```",
  "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n=========\n```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n=========\n```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n=========\n```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n=========\n```",
];

export function renderHangman(s) {
  const masked = [...s.word]
    .map((ch) => (ch === " " ? "  " : s.guessed.has(ch) ? ch.toUpperCase() : "_"))
    .join(" ");
  const hearts = "❤️".repeat(Math.max(0, 6 - s.wrong)) + "🖤".repeat(Math.min(6, s.wrong));
  const used = [...s.guessed].map((c) => c.toUpperCase()).join(", ") || "-";
  return (
    `╭─❖「 🪢 *HANGMAN — ELYSIA* 」\n` +
    `${HANGMAN_STAGES[Math.min(6, s.wrong)]}\n` +
    `│ 🏷️ Kategori : *${s.category}*\n` +
    `│ 🔤 Kata     : \`${masked}\`\n` +
    `│ ❤️ Nyawa    : ${hearts}\n` +
    `│ 📝 Huruf    : ${used}\n` +
    `╰─────────────────────❖\n` +
    `_Ketik 1 huruf (a-z) atau tebak langsung katanya! Ketik \`.stopgame\` untuk berhenti._`
  );
}

// --- Blackjack Helpers ---
const SUITS = ["♠️", "♥️", "♦️", "♣️"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) deck.push({ rank, suit });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function handScore(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === "A") {
      total += 11;
      aces += 1;
    } else if (["K", "Q", "J"].includes(c.rank)) {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

export function formatHand(cards, hideSecond = false) {
  return cards
    .map((c, idx) => (hideSecond && idx === 1 ? "🂠" : `${c.rank}${c.suit}`))
    .join("  ");
}

// --- Bomb Sweep Helpers ---
export function renderBombBoard(s, revealAll = false) {
  const nums = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
  const cells = [];
  for (let i = 0; i < 9; i++) {
    if (revealAll && i === s.bombIndex) cells.push("💣");
    else if (s.opened.has(i)) cells.push("💎");
    else cells.push(nums[i]);
  }
  const grid = `${cells[0]} ${cells[1]} ${cells[2]}\n${cells[3]} ${cells[4]} ${cells[5]}\n${cells[6]} ${cells[7]} ${cells[8]}`;
  return (
    `╭─❖「 💣 *TEBAK BOM — ELYSIA* 」\n` +
    `${grid}\n` +
    `├───〔 *STATUS* 〕\n` +
    `│ 💎 Kotak Aman : *${s.opened.size}/8*\n` +
    `│ 💰 Pot Hadiah : *${s.pot.toLocaleString("id-ID")} Koin*\n` +
    `╰─────────────────────❖\n` +
    (revealAll
      ? ""
      : `_Pilih angka *1-9* untuk buka kotak, atau ketik *ambil* untuk amankan hadiah!_`)
  );
}

// --- Unified Incoming Message Handler for Active Games ---
export async function handleActiveGameInput(m, sock) {
  const s = gameSessions.get(m.chat);
  if (!s || m.fromMe) return false;

  const raw = String(m.body || m.text || "").trim();
  if (!raw || /^[./!#]/.test(raw)) return false;

  const lower = raw.toLowerCase();
  const db = getDatabase();

  // 1. TIC-TAC-TOE
  if (s.type === "tictactoe") {
    if (!/^[1-9]$/.test(lower)) return false;
    const turnPlayer = s.turn === "X" ? s.playerX : s.playerO;
    if (m.sender !== turnPlayer) return false;

    const idx = Number(lower) - 1;
    if (s.board[idx]) {
      await m.reply("⚠️ Kotak itu sudah terisi! Pilih angka lain (1-9).");
      return true;
    }

    s.board[idx] = s.turn;
    let winner = checkTTTWinner(s.board);

    if (!winner && s.isAI && s.turn === "X") {
      const aiIdx = bestAIMove(s.board);
      if (aiIdx !== undefined && aiIdx >= 0) {
        s.board[aiIdx] = "O";
        winner = checkTTTWinner(s.board);
      }
    } else if (!winner && !s.isAI) {
      s.turn = s.turn === "X" ? "O" : "X";
    }

    if (winner) {
      clearActiveGame(m.chat);
      let resultText = "";
      const mentions = [s.playerX, ...(s.isAI ? [] : [s.playerO])];

      if (winner === "DRAW") {
        db.updateKoin(s.playerX, 500);
        if (!s.isAI) db.updateKoin(s.playerO, 500);
        resultText = `🤝 *SERI!* Masing-masing mendapat *+500 Koin*.`;
      } else if (winner === "X") {
        db.updateKoin(s.playerX, 2500);
        db.updateExp(s.playerX, 400);
        resultText = `🏆 *@${s.playerX.split("@")[0]} (❌) MENANG!*\n> Hadiah: *+2.500 Koin* & *+400 EXP*`;
      } else if (s.isAI) {
        resultText = `🤖 *Elysia AI (⭕) MENANG!* Coba lagi dengan \`.ttt\`.`;
      } else {
        db.updateKoin(s.playerO, 2500);
        db.updateExp(s.playerO, 400);
        resultText = `🏆 *@${s.playerO.split("@")[0]} (⭕) MENANG!*\n> Hadiah: *+2.500 Koin* & *+400 EXP*`;
      }

      await sock.sendMessage(
        m.chat,
        {
          text:
            `╭─❖「 ❌⭕ *TIC-TAC-TOE SELESAI* 」\n` +
            `${renderTTTBoard(s.board)}\n` +
            `╰─────────────────────❖\n` +
            `${resultText}`,
          mentions,
        },
        { quoted: m }
      );
      return true;
    }

    const nextJid = s.turn === "X" ? s.playerX : s.playerO;
    await sock.sendMessage(
      m.chat,
      {
        text:
          `╭─❖「 ❌⭕ *TIC-TAC-TOE* 」\n` +
          `${renderTTTBoard(s.board)}\n` +
          `├───〔 *GILIRAN* 〕\n` +
          `│ 🎯 Giliran: @${nextJid.split("@")[0]} (${s.turn === "X" ? "❌" : "⭕"})\n` +
          `╰─────────────────────❖\n` +
          `_Balas angka *1-9* untuk melangkah!_`,
        mentions: [nextJid],
      },
      { quoted: m }
    );
    return true;
  }

  // 2. TEBAK ANGKA
  if (s.type === "tebakangka") {
    if (!/^\d{1,3}$/.test(lower)) return false;
    const guess = Number(lower);
    if (guess < 1 || guess > 100) return false;

    s.attempts += 1;
    if (guess === s.secret) {
      clearActiveGame(m.chat);
      const reward = Math.max(1000, 5000 - (s.attempts - 1) * 400);
      db.updateKoin(m.sender, reward);
      db.updateExp(m.sender, 350);
      await m.reply(
        `╭─❖「 🎯 *TEBAK ANGKA BERHASIL!* 」\n` +
          `│ 👤 Pemenang  : @${m.sender.split("@")[0]}\n` +
          `│ 🔢 Angka     : *${s.secret}*\n` +
          `│ 🎲 Percobaan : *${s.attempts}x*\n` +
          `│ 💰 Hadiah    : *+${reward.toLocaleString("id-ID")} Koin* & *+350 EXP*\n` +
          `╰─────────────────────❖`,
        { mentions: [m.sender] }
      );
      return true;
    }

    const diff = Math.abs(guess - s.secret);
    const heat =
      diff <= 3
        ? "🔥 Sangat panas!"
        : diff <= 10
          ? "🌡️ Lumayan dekat!"
          : "❄️ Masih jauh!";
    const dir = guess < s.secret ? "⬆️ *Terlalu kecil!*" : "⬇️ *Terlalu besar!*";

    if (s.attempts >= s.maxAttempts) {
      clearActiveGame(m.chat);
      await m.reply(
        `💥 *KESEMPATAN HABIS (${s.maxAttempts}x)!*\n> Angka rahasianya adalah *${s.secret}*.`
      );
      return true;
    }

    await m.reply(
      `${dir} ${heat}\n> Sisa percobaan: *${s.maxAttempts - s.attempts}x*`
    );
    return true;
  }

  // 3. HANGMAN
  if (s.type === "hangman") {
    if (!/^[a-z\s]{1,30}$/.test(lower)) return false;

    // Tebak langsung 1 kata penuh
    if (lower.length > 1) {
      if (lower === s.word) {
        clearActiveGame(m.chat);
        db.updateKoin(m.sender, 2500);
        db.updateExp(m.sender, 400);
        await m.reply(
          `🎉 *HEBAT! KATA TERTEBAK!*\n` +
            `> Kata: *${s.word.toUpperCase()}*\n` +
            `> Hadiah: *+2.500 Koin* & *+400 EXP* untuk @${m.sender.split("@")[0]}`,
          { mentions: [m.sender] }
        );
        return true;
      }
      s.wrong += 1;
    } else {
      if (s.guessed.has(lower)) {
        await m.reply(`⚠️ Huruf *${lower.toUpperCase()}* sudah pernah dicoba!`);
        return true;
      }
      s.guessed.add(lower);
      if (!s.word.includes(lower)) s.wrong += 1;
    }

    const won = [...s.word].every((ch) => ch === " " || s.guessed.has(ch));
    if (won) {
      clearActiveGame(m.chat);
      db.updateKoin(m.sender, 2200);
      db.updateExp(m.sender, 350);
      await m.reply(
        `🎉 *SELAMAT! HANGMAN BERHASIL DISELESAIKAN!*\n` +
          `> Kata: *${s.word.toUpperCase()}*\n` +
          `> Hadiah: *+2.200 Koin* & *+350 EXP* untuk @${m.sender.split("@")[0]}`,
        { mentions: [m.sender] }
      );
      return true;
    }

    if (s.wrong >= 6) {
      clearActiveGame(m.chat);
      await m.reply(
        `💀 *GAME OVER!*\n` +
          `${HANGMAN_STAGES[6]}\n` +
          `> Kata yang benar adalah: *${s.word.toUpperCase()}*`
      );
      return true;
    }

    await m.reply(renderHangman(s));
    return true;
  }

  // 4. BLACKJACK
  if (s.type === "blackjack") {
    if (m.sender !== s.player) return false;
    if (!/^(hit|stand|double|h|s|d)$/.test(lower)) return false;

    const finishBJ = async () => {
      while (handScore(s.dealer) < 17) {
        s.dealer.push(s.deck.pop());
      }
      clearActiveGame(m.chat);
      const pScore = handScore(s.hand);
      const dScore = handScore(s.dealer);

      let status = "";
      if (pScore > 21) {
        status = `💥 *BUST!* Kamu kalah *${s.bet.toLocaleString("id-ID")} Koin*.`;
      } else if (dScore > 21 || pScore > dScore) {
        const win = s.bet * 2;
        db.updateKoin(s.player, win);
        db.updateExp(s.player, 300);
        status = `🏆 *MENANG!* Kamu menerima *+${win.toLocaleString("id-ID")} Koin*!`;
      } else if (pScore === dScore) {
        db.updateKoin(s.player, s.bet);
        status = `🤝 *PUSH (SERI)!* Taruhan *${s.bet.toLocaleString("id-ID")} Koin* dikembalikan.`;
      } else {
        status = `🃏 *DEALER MENANG!* Kamu kalah *${s.bet.toLocaleString("id-ID")} Koin*.`;
      }

      await m.reply(
        `╭─❖「 🃏 *BLACKJACK — HASIL* 」\n` +
          `│ 🤵 Dealer : ${formatHand(s.dealer)} (*${dScore}*)\n` +
          `│ 👤 Kamu   : ${formatHand(s.hand)} (*${pScore}*)\n` +
          `╰─────────────────────❖\n` +
          `${status}`
      );
    };

    if (lower === "hit" || lower === "h") {
      s.hand.push(s.deck.pop());
      const score = handScore(s.hand);
      if (score >= 21) {
        await finishBJ();
        return true;
      }
      await m.reply(
        `╭─❖「 🃏 *BLACKJACK* 」\n` +
          `│ 🤵 Dealer : ${formatHand(s.dealer, true)}\n` +
          `│ 👤 Kamu   : ${formatHand(s.hand)} (*${score}*)\n` +
          `│ 💰 Taruhan: *${s.bet.toLocaleString("id-ID")} Koin*\n` +
          `╰─────────────────────❖\n` +
          `_Ketik *hit* (tambah kartu) atau *stand* (berhenti)._`
      );
      return true;
    }

    if (lower === "double" || lower === "d") {
      const user = db.getUser(s.player);
      if ((user?.koin || 0) < s.bet) {
        await m.reply("❌ Koin kamu tidak cukup untuk Double Down!");
        return true;
      }
      db.updateKoin(s.player, -s.bet);
      s.bet *= 2;
      s.hand.push(s.deck.pop());
      await finishBJ();
      return true;
    }

    await finishBJ();
    return true;
  }

  // 5. MATH QUIZ
  if (s.type === "mathquiz") {
    if (!/^-?\d+$/.test(lower)) return false;
    const val = Number(lower);
    if (val !== s.answer) return false;

    clearActiveGame(m.chat);
    const elapsed = ((Date.now() - s.startedAt) / 1000).toFixed(1);
    const speedBonus = elapsed <= 5 ? 1000 : elapsed <= 10 ? 500 : 0;
    const total = s.rewardKoin + speedBonus;
    db.updateKoin(m.sender, total);
    db.updateExp(m.sender, 300);

    await m.reply(
      `╭─❖「 ⚡ *HITUNG CEPAT BENAR!* 」\n` +
        `│ 👤 Pemenang : @${m.sender.split("@")[0]}\n` +
        `│ 🧮 Jawaban  : *${s.answer}*\n` +
        `│ ⏱️ Waktu    : *${elapsed} detik*\n` +
        `│ 💰 Hadiah   : *+${total.toLocaleString("id-ID")} Koin* & *+300 EXP*\n` +
        `╰─────────────────────❖`,
      { mentions: [m.sender] }
    );
    return true;
  }

  // 6. TEBAK BOM
  if (s.type === "bomb") {
    if (m.sender !== s.player) return false;
    if (/^(ambil|cashout|stop)$/.test(lower)) {
      clearActiveGame(m.chat);
      if (s.pot > 0) {
        db.updateKoin(s.player, s.pot);
        db.updateExp(s.player, 200);
      }
      await m.reply(
        `💰 *CASH OUT BERHASIL!*\n` +
          `> Kamu mengamankan *+${s.pot.toLocaleString("id-ID")} Koin*!\n\n` +
          renderBombBoard(s, true)
      );
      return true;
    }

    if (!/^[1-9]$/.test(lower)) return false;
    const idx = Number(lower) - 1;
    if (s.opened.has(idx)) {
      await m.reply("⚠️ Kotak itu sudah dibuka! Pilih angka lain (1-9).");
      return true;
    }

    if (idx === s.bombIndex) {
      clearActiveGame(m.chat);
      await m.reply(
        `💥 *BOOM!! KAMU KENA BOM!*\n` +
          `> Pot hadiah hangus. Coba lagi dengan \`.bomb\`!\n\n` +
          renderBombBoard(s, true)
      );
      return true;
    }

    s.opened.add(idx);
    s.pot += 600 * s.opened.size;

    if (s.opened.size >= 8) {
      clearActiveGame(m.chat);
      const jackpot = s.pot + 2000;
      db.updateKoin(s.player, jackpot);
      db.updateExp(s.player, 500);
      await m.reply(
        `🏆 *PERFECT CLEAR! SEMUA KOTAK AMAN TERBUKA!*\n` +
          `> Hadiah Jackpot: *+${jackpot.toLocaleString("id-ID")} Koin* & *+500 EXP*!\n\n` +
          renderBombBoard(s, true)
      );
      return true;
    }

    await m.reply(`💎 *AMAN!* Pot naik jadi *${s.pot.toLocaleString("id-ID")} Koin*.\n\n${renderBombBoard(s)}`);
    return true;
  }

  return false;
}
