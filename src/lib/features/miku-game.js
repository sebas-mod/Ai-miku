/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../data/database.js";

if (!globalThis.__mikuGameSessions) {
  globalThis.__mikuGameSessions = new Map();
}

const gameSessions = globalThis.__mikuGameSessions;

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
    `╭─❖「 🪢 *HANGMAN — MIKU* 」\n` +
    `${HANGMAN_STAGES[Math.min(6, s.wrong)]}\n` +
    `│ 🏷️ Kategori : *${s.category}*\n` +
    `│ 🔤 Kata     : \`${masked}\`\n` +
    `│ ❤️ Vidas    : ${hearts}\n` +
    `│ 📝 Letras   : ${used}\n` +
    `╰─────────────────────❖\n` +
    `_¡Escribe 1 letra (a-z) o adivina la palabra directamente! Escribe \`.stopgame\` para detener._`
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
    `╭─❖「 💣 *BOMBA SORPRESA — MIKU* 」\n` +
    `${grid}\n` +
    `├───〔 *ESTADO* 〕\n` +
    `│ 💎 Casillas seguras : *${s.opened.size}/8*\n` +
    `│ 💰 Bote de premios  : *${s.pot.toLocaleString("es-ES")} monedas*\n` +
    `╰─────────────────────❖\n` +
    (revealAll
      ? ""
      : `_Pulsa un número del *1-9* para abrir una casilla, o escribe *ambil* para llevarte el premio._`)
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
      await m.reply("⚠️ ¡Esa casilla ya está ocupada! Elige otro número (1-9).");
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
        resultText = `🤝 *¡EMPATE!* Cada uno recibe *+500 monedas*.`;
      } else if (winner === "X") {
        db.updateKoin(s.playerX, 2500);
        db.updateExp(s.playerX, 400);
        resultText = `🏆 *¡@${s.playerX.split("@")[0]} (❌) GANA!*\n> Premio: *+2.500 monedas* y *+400 EXP*`;
      } else if (s.isAI) {
        resultText = `🤖 *¡Gana Miku AI (⭕)!* Prueba otra vez con \`.ttt\`.`;
      } else {
        db.updateKoin(s.playerO, 2500);
        db.updateExp(s.playerO, 400);
        resultText = `🏆 *¡@${s.playerO.split("@")[0]} (⭕) GANA!*\n> Premio: *+2.500 monedas* y *+400 EXP*`;
      }

      await sock.sendMessage(
        m.chat,
        {
          text:
            `╭─❖「 ❌⭕ *TIC-TAC-TOE TERMINADO* 」\n` +
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
          `├───〔 *TURNO* 〕\n` +
          `│ 🎯 Turno de: @${nextJid.split("@")[0]} (${s.turn === "X" ? "❌" : "⭕"})\n` +
          `╰─────────────────────❖\n` +
          `_¡Responde con un número del *1-9* para jugar!_`,
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
        `╭─❖「 🎯 *¡NÚMERO ADIVINADO!* 」\n` +
          `│ 👤 Ganador    : @${m.sender.split("@")[0]}\n` +
          `│ 🔢 Número     : *${s.secret}*\n` +
          `│ 🎲 Intentos   : *${s.attempts}x*\n` +
          `│ 💰 Premio     : *+${reward.toLocaleString("es-ES")} monedas* y *+350 EXP*\n` +
          `╰─────────────────────❖`,
        { mentions: [m.sender] }
      );
      return true;
    }

    const diff = Math.abs(guess - s.secret);
    const heat =
      diff <= 3
        ? "🔥 ¡Muy caliente!"
        : diff <= 10
          ? "🌡️ ¡Bastante cerca!"
          : "❄️ ¡Todavía lejos!";
    const dir = guess < s.secret ? "⬆️ *¡Demasiado bajo!*" : "⬇️ *¡Demasiado alto!*";

    if (s.attempts >= s.maxAttempts) {
      clearActiveGame(m.chat);
      await m.reply(
        `💥 *¡SE ACABARON LOS INTENTOS (${s.maxAttempts}x)!*\n> El número secreto era *${s.secret}*.`
      );
      return true;
    }

    await m.reply(
      `${dir} ${heat}\n> Intentos restantes: *${s.maxAttempts - s.attempts}x*`
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
          `🎉 *¡GENIAL! ¡PALABRA ADIVINADA!*\n` +
            `> Palabra: *${s.word.toUpperCase()}*\n` +
            `> Premio: *+2.500 monedas* y *+400 EXP* para @${m.sender.split("@")[0]}`,
          { mentions: [m.sender] }
        );
        return true;
      }
      s.wrong += 1;
    } else {
      if (s.guessed.has(lower)) {
        await m.reply(`⚠️ ¡La letra *${lower.toUpperCase()}* ya se probó!`);
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
        `🎉 *¡FELICIDADES! ¡AHORCADO COMPLETADO!*\n` +
          `> Palabra: *${s.word.toUpperCase()}*\n` +
          `> Premio: *+2.200 monedas* y *+350 EXP* para @${m.sender.split("@")[0]}`,
        { mentions: [m.sender] }
      );
      return true;
    }

    if (s.wrong >= 6) {
      clearActiveGame(m.chat);
      await m.reply(
        `💀 *¡FIN DEL JUEGO!*\n` +
          `${HANGMAN_STAGES[6]}\n` +
          `> La palabra correcta era: *${s.word.toUpperCase()}*`
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
        status = `💥 *¡BUST!* Pierdes *${s.bet.toLocaleString("es-ES")} monedas*.`;
      } else if (dScore > 21 || pScore > dScore) {
        const win = s.bet * 2;
        db.updateKoin(s.player, win);
        db.updateExp(s.player, 300);
        status = `🏆 *¡GANAS!* ¡Recibes *+${win.toLocaleString("es-ES")} monedas*!`;
      } else if (pScore === dScore) {
        db.updateKoin(s.player, s.bet);
        status = `🤝 *¡EMPATE!* Se te devuelve la apuesta de *${s.bet.toLocaleString("es-ES")} monedas*.`;
      } else {
        status = `🃏 *¡GANA EL CRUPIER!* Pierdes *${s.bet.toLocaleString("es-ES")} monedas*.`;
      }

      await m.reply(
        `╭─❖「 🃏 *BLACKJACK — RESULTADO* 」\n` +
          `│ 🤵 Crupier : ${formatHand(s.dealer)} (*${dScore}*)\n` +
          `│ 👤 Tú      : ${formatHand(s.hand)} (*${pScore}*)\n` +
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
          `│ 🤵 Crupier  : ${formatHand(s.dealer, true)}\n` +
          `│ 👤 Tú       : ${formatHand(s.hand)} (*${score}*)\n` +
          `│ 💰 Apuesta  : *${s.bet.toLocaleString("es-ES")} monedas*\n` +
          `╰─────────────────────❖\n` +
          `_Escribe *hit* (pedir carta) o *stand* (plantarse)._`
      );
      return true;
    }

    if (lower === "double" || lower === "d") {
      const user = db.getUser(s.player);
      if ((user?.koin || 0) < s.bet) {
        await m.reply("❌ ¡No tienes monedas suficientes para el Double Down!");
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
      `╭─❖「 ⚡ *¡CÁLCULO RÁPIDO CORRECTO!* 」\n` +
        `│ 👤 Ganador  : @${m.sender.split("@")[0]}\n` +
        `│ 🧮 Respuesta: *${s.answer}*\n` +
        `│ ⏱️ Tiempo   : *${elapsed} segundos*\n` +
        `│ 💰 Premio   : *+${total.toLocaleString("es-ES")} monedas* y *+300 EXP*\n` +
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
        `💰 *¡RETIRADA EXITOSA!*\n` +
          `> ¡Te llevas *+${s.pot.toLocaleString("es-ES")} monedas*!\n\n` +
          renderBombBoard(s, true)
      );
      return true;
    }

    if (!/^[1-9]$/.test(lower)) return false;
    const idx = Number(lower) - 1;
    if (s.opened.has(idx)) {
      await m.reply("⚠️ ¡Esa casilla ya está abierta! Elige otro número (1-9).");
      return true;
    }

    if (idx === s.bombIndex) {
      clearActiveGame(m.chat);
      await m.reply(
        `💥 *¡BOOM! ¡PISASTE LA BOMBA!*\n` +
          `> El bote se pierde. ¡Vuelve a intentarlo con \`.bomb\`!\n\n` +
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
        `🏆 *¡PERFECTO! ¡ABRISTE TODAS LAS CASILLAS SEGURAS!*\n` +
          `> Premio gordo: *+${jackpot.toLocaleString("es-ES")} monedas* y *+500 EXP*!\n\n` +
          renderBombBoard(s, true)
      );
      return true;
    }

    await m.reply(`💎 *¡A SALVO!* El bote sube a *${s.pot.toLocaleString("es-ES")} monedas*.\n\n${renderBombBoard(s)}`);
    return true;
  }

  return false;
}
