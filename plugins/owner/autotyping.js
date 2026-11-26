/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { saluranCtx } from "../../src/lib/core/context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autotyping",
  alias: ["typing", "autoketik"],
  category: "owner",
  description: "Auto typing indicator saat menerima pesan",
  usage: ".autotyping on/off",
  example: ".autotyping on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("autoTyping") ?? config.features?.autoTyping ?? true;
    return m.reply(
      `⌨️ *Auto Typing*\n\n` +
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}autotyping on* — Aktifkan\n` +
        `> *${m.prefix}autotyping off* — Nonaktifkan\n\n` +
        `_Bot akan menampilkan indikator typing saat menerima pesan_`
    );
  }

  if (option === "on") {
    db.setting("autoTyping", true);
    const ctx = saluranCtx();
    return m.reply(
      `⌨️ *Auto Typing Aktif*\n\n` +
        `> Bot akan menampilkan indikator typing`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoTyping", false);
    return m.reply(
      `⌨️ *Auto Typing Nonaktif*\n\n` +
        `> Bot tidak akan menampilkan indikator typing`
    );
  }

  return m.reply(
    `❌ *Opsi Tidak Valid*\n\n> Gunakan *${m.prefix}autotyping on* atau *${m.prefix}autotyping off*`
  );
}

export { pluginConfig as config, handler };
