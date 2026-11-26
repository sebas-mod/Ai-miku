/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getThumb, getJpegThumb } from "../core/media.js";
import {
  getRandomItem,
  createSession,
  getSession,
  endSession,
  checkAnswerAdvanced,
  getHint,
  hasActiveSession,
  setSessionTimer,
  getRemainingTime,
  formatRemainingTime,
  isSurrender,
  isReplyToGame,
  getRandomReward,
  getProgressiveHint,
} from "./game-data.js";
import { getDatabase } from "../data/database.js";
import { addExpWithLevelCheck } from "../data/level.js";
import {
  getGameContextInfo,
  sendGamePreview,
  checkFastAnswer,
} from "../core/context.js";
import config from "../../../config.js";
import fs from "fs";
import sharp from "sharp";
let fetchBuffer;
try {
  fetchBuffer = (await import("../core/utils.js")).fetchBuffer;
} catch { }

const WIN_MESSAGES = [
  "🌟 *GG WP! Otakmu encer!*",
  "✨ *KEREN ABIS! Lu emang pinter!*",
  "🎉 *MANTAPPPP! Jawaban sempurna!*",
  "💫 *EPIC! Gak ada lawan lu!*",
  "🏆 *NGERI! Otak lu kayak Google!*",
  "🔥 *LEGEND! Jawab kek gak ada beban!*",
];

const TIMEOUT_MESSAGES = [
  "⏱️ *¡Uy, se acabó el tiempo!*",
  "⏱️ *¡TIEMPO AGOTADO!*",
  "⏱️ *¡Tarde, ya no queda tiempo!*",
];

const SURRENDER_MESSAGES = [
  "🏳️ *Y bueno, se rindió...*",
  "🏳️ *¡SE RINDIÓ!*",
  "🏳️ *Vaya, qué pena que se rindiera...*",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GAME_WIN_COOLDOWN = 90 * 1000;

function formatGameCooldown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds} detik`;
  return `${minutes} menit ${seconds} detik`;
}

class elysiaGames {
  constructor() {
    this.registry = new Map();
  }

  register(gameType, cfg) {
    const defaults = {
      dataFile: `${gameType}.json`,
      questionField: "soal",
      answerField: "jawaban",
      emoji: "🎮",
      title: gameType.toUpperCase(),
      description: `Game ${gameType}`,
      timeout: 60000,
      cooldown: 5,
      hasImage: false,
      imageField: "img",
      alias: [],
      hintCount: 2,
    };
    this.registry.set(gameType, { ...defaults, ...cfg, gameType });
  }

  get(gameType) {
    return this.registry.get(gameType);
  }

  createHandler(gameType) {
    const cfg = this.registry.get(gameType);
    if (!cfg) throw new Error(`Game "${gameType}" not registered`);

    const handler = async (m, { sock }) => {
      const chatId = m.chat;

      // Cooldown kemenangan berlaku per-user untuk SEMUA game berbasis elysiaGames.
      // Jadi setelah berhasil menjawab, user harus menunggu 90 detik sebelum
      // memulai game lagi, termasuk saat pindah grup/private chat.
      const db = getDatabase();
      const user = db.getUser(m.sender);
      const lastGameWin = user?.cooldowns?.gameWin || 0;
      const remainingCooldown = GAME_WIN_COOLDOWN - (Date.now() - lastGameWin);
      if (remainingCooldown > 0) {
        return m.reply(
          `⏳ *ESPERA PARA JUGAR*\n\n> Acabas de ganar una partida.\n> Espera *${formatGameCooldown(remainingCooldown)}* antes de volver a jugar.`
        );
      }

      if (hasActiveSession(chatId)) {
        const session = getSession(chatId);
        if (session && session.gameType === gameType) {
          const remaining = getRemainingTime(chatId);
          const answer = session.question[cfg.answerField];
          let text = `⚠️ *¡Ey, hay una partida en curso, respóndela primero!*\n\n`;
          if (cfg.questionField && session.question[cfg.questionField]) {
            text += `\`\`\`${session.question[cfg.questionField]}\`\`\`\n\n`;
          }
          text += `💡 Hint: *${getHint(answer, cfg.hintCount)}*\n`;
          text += `⏱️ Queda: *${formatRemainingTime(remaining)}*\n\n`;
          text += `_Responde directamente o escribe "nyerah"\nCada fallo añade una pista_`;
          await sock.sendPreview(
            m.chat,
            {
              caption: text,
                      title: cfg.title,
              description: cfg.description,
              jpegThumbnail: await getJpegThumb("allmenu"),
              previewType: 0,
            },
          );
          return;
        }
      }

      const question = getRandomItem(cfg.dataFile);
      if (!question) {
        await m.reply(
          "❌ *ᴅᴀᴛᴏs ɴᴏ ᴅɪsᴘᴏɴɪʙʟᴇs*\n\n> ¡No hay datos del juego!",
        );
        return;
      }

      const answer = question[cfg.answerField];
      let sentMsg;

      if (cfg.hasImage && fetchBuffer) {
        let imageBuffer;
        try {
          imageBuffer = await fetchBuffer(question[cfg.imageField]);
        } catch {
          await m.reply("❌ *ɢᴀɢᴀʟ ᴍᴇᴍᴜᴀᴛ ɢᴀᴍʙᴀʀ*\n\n> Coba lagi nanti!");
          return;
        }

        let caption = `${cfg.emoji} *${cfg.title}*\n\n`;
        if (cfg.questionField && question[cfg.questionField]) {
          caption += `> ${question[cfg.questionField]}\n`;
        }
        caption += `💡 Hint: *${getHint(answer, cfg.hintCount)}*\n`;
        caption += `⏱️ Waktu: *${cfg.timeout / 1000} detik*\n`;
        caption += `🎁 Hadiah: *Limit dan EXP (random)*\n\n`;
        caption += `_Jawab langsung atau ketik "nyerah"\nSetiap salah, hint akan bertambah_`;

        sentMsg = await sock.sendMessage(
          chatId,
          {
            image: imageBuffer,
            caption,
            contextInfo: getGameContextInfo(),
          },
          { quoted: m },
        );
      } else {
        let text = `${cfg.emoji} *${cfg.title}*\n\n`;
        if (cfg.questionField && question[cfg.questionField]) {
          text += `\`\`\`${question[cfg.questionField]}\`\`\`\n\n`;
        }
        text += `💡 Hint: *${getHint(answer, cfg.hintCount)}*\n`;
        text += `⏱️ Waktu: *${cfg.timeout / 1000} detik*\n`;
        text += `🎁 Hadiah: *Limit dan EXP (random)*\n\n`;
        text += `_Jawab langsung atau ketik "nyerah"\nSetiap salah, hint akan bertambah_`;

        sentMsg = await sendGamePreview(
          sock,
          chatId,
          text,
          `${cfg.emoji} ${cfg.title}`,
          "Jawab pertanyaan!",
          { quoted: m },
        );
      }

      createSession(chatId, gameType, question, sentMsg.key, cfg.timeout);

      setSessionTimer(chatId, async () => {
        let text = `${pick(TIMEOUT_MESSAGES)}\n\n`;
        text += `Respuesta: *${answer}*\n\n`;
        text += `_Nadie acertó esta vez~_`;
        await m.reply(text);
      });
    };

    const answerHandler = async (m, sock) => {
      const chatId = m.chat;
      const session = getSession(chatId);

      if (!session || session.gameType !== gameType) return false;

      const userAnswer = (m.body || "").trim();
      if (!userAnswer || userAnswer.startsWith(".")) return false;

      if (isSurrender(userAnswer)) {
        endSession(chatId);
        const answer = session.question[cfg.answerField];
        let text = `${pick(SURRENDER_MESSAGES)}\n\n`;
        text += `Respuesta: *${answer}*\n\n`;
        text += `_@${m.sender.split("@")[0]} se rinde_`;
        await m.reply(text, { mentions: [m.sender] });
        return true;
      }

      if (!isReplyToGame(m, session)) return false;

      session.attempts++;

      const answer = session.question[cfg.answerField];
      const result = checkAnswerAdvanced(answer, userAnswer);

      if (result.status === "correct") {
        endSession(chatId);

        const db = getDatabase();
        const user = db.getUser(m.sender);

        // Mulai cooldown hanya setelah jawaban BENAR.
        // Disimpan ke database agar tetap berlaku walau user pindah chat.
        if (user) {
          if (!user.cooldowns) user.cooldowns = {};
          user.cooldowns.gameWin = Date.now();
        }

        let totalLimit = 0;
        let totalExp = 0;

        if (cfg.rewards === false || cfg.rewards === null) {
          // umm, maaf yak, kalau sc ini banyak kurangnya
        } else if (cfg.rewards) {
          totalLimit = cfg.rewards.limit || cfg.rewards.energi || 0;
          totalExp = cfg.rewards.exp || 0;
        } else {
          const reward = getRandomReward();
          totalLimit = reward.limit;
          totalExp = reward.exp;
        }

        let bonusText = "";

        const fastResult = checkFastAnswer(session);
        if (
          fastResult.isFast &&
          cfg.rewards !== false &&
          cfg.rewards !== null
        ) {
          totalLimit += fastResult.bonus.limit;
          totalExp += fastResult.bonus.exp;
          bonusText = `\n\n${fastResult.praise}\n⚡ *BONUS RÁPIDO:* +${fastResult.bonus.limit} límite\n⏱️ Tiempo: *${(fastResult.elapsed / 1000).toFixed(1)}s*`;
        }

        if (totalLimit > 0) db.updateEnergi(m.sender, totalLimit);

        if (totalExp > 0) {
          if (!user.rpg) user.rpg = {};
          await addExpWithLevelCheck(sock, m, db, user, totalExp);
        }
        db.save();

        let text = `${pick(WIN_MESSAGES)}\n\n`;
        text += `Respuesta: *${answer}*\n`;
        text += `Ganador: *@${m.sender.split("@")[0]}*\n`;
        text += `Intentos: *${session.attempts}x*\n\n`;

        if (totalLimit > 0 || totalExp > 0) {
          let parts = [];
          if (totalLimit > 0) parts.push(`+${totalLimit} Limit`);
          if (totalExp > 0) parts.push(`+${totalExp} EXP`);
          text += `🎁 ${parts.join(", ")}`;
        }
        text += bonusText;

        await m.reply(text, { mentions: [m.sender] });
        return true;
      }

      if (result.status === "close") {
        const remaining = getRemainingTime(chatId);
        const percent = Math.round(result.similarity * 100);
        await m.react("🔥");
        await m.reply(
          `🔥 *Hampir!* Jawabanmu *${percent}%* mirip!\n_Sisa waktu: *${formatRemainingTime(remaining)}*_`,
        );
        return false;
      }

      const remaining = getRemainingTime(chatId);
      if (remaining > 0 && session.attempts < 10) {
        await m.react("❌");
        const hint = getProgressiveHint(answer, session.attempts);
        await m.reply(
          `❌ Belum bener! Hint: *${hint}*\n_Sisa: *${formatRemainingTime(remaining)}*_`,
        );
      }

      return false;
    };

    return { handler, answerHandler };
  }

  createPlugin(gameType, overrides = {}) {
    const cfg = this.registry.get(gameType);
    if (!cfg) throw new Error(`Game "${gameType}" not registered`);

    const { handler, answerHandler } = this.createHandler(gameType);

    return {
      config: {
        name: gameType,
        alias: cfg.alias,
        category: "game",
        description: cfg.description,
        usage: `.${gameType}`,
        example: `.${gameType}`,
        isOwner: false,
        isPremium: false,
        isGroup: false,
        isPrivate: false,
        cooldown: cfg.cooldown,
        energi: 0,
        isEnabled: true,
        ...overrides,
      },
      handler,
      answerHandler,
    };
  }
}

const games = new elysiaGames();

export { elysiaGames, games };
