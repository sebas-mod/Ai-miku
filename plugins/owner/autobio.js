/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autobio",
  alias: ["autostatus"],
  category: "owner",
  description: "Mengatur pembaruan bio WhatsApp bot secara otomatis",
  usage: ".autobio on/off\n.autobio <teks>",
  example: ".autobio on\n.autobio Bot by Owner | 🕒 {clock} | ⏳ {runtime}",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, db }) {
  const arg = m.text?.trim();

  if (!arg) {
    const status = db.setting("autobio_status") || false;
    const text = db.setting("autobio_text") || "Bot aktif | 🕒 {clock} | ⏳ {runtime}";
    const intervalMs = db.setting("autobio_interval") || 60000;

    return m.reply(
      `📝 *AUTO BIO SETTINGS*\n\n` +
      `> Status: *${status ? "Aktif ✅" : "Nonaktif ❌"}*\n` +
      `> Interval: *${intervalMs / 1000} detik*\n` +
      `> Teks Bio: ${text}\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}autobio on/off* — Activa/desactiva la función\n` +
      `- *${m.prefix}autobio ganti_setiap <waktu>* — Ajusta el intervalo. Ejemplo: \`.autobio ganti_setiap 30 detik\` o \`1 hora\`\n` +
      `- *${m.prefix}autobio <teks>* — Mengatur teks bio\n\n` +
      `*PLACEHOLDERS DISPONIBLES:*\n` +
      `- \`{clock}\` — Muestra la hora actual\n` +
      `- \`{runtime}\` — Menampilkan lama bot menyala\n` +
      `- \`{botname}\` — Muestra el nombre del bot desde config\n` +
      `- \`{version}\` — Menampilkan versi bot`
    );
  }

  const option = arg.toLowerCase();

  if (option === "on") {
    db.setting("autobio_status", true);
    await m.react("✅");
    try {
      const { startAutoBioChecker } = await import("../../src/lib/system/scheduler.js");
      startAutoBioChecker(sock);
    } catch (e) {}
    return m.reply(`✅ *AUTO BIO DIAKTIFKAN*\n\nLa bio del bot de WhatsApp ahora se actualizará automáticamente cada minuto.`);
  }

  if (option === "off") {
    db.setting("autobio_status", false);
    await m.react("❌");
    return m.reply(`❌ *AUTO-BIO DESACTIVADO*\n\nLa bio del bot de WhatsApp ya no se actualizará.`);
  }

  if (option.startsWith("ganti_setiap")) {
    const timeStr = arg.replace(/ganti_setiap/i, "").trim().toLowerCase();
    if (!timeStr) {
      return m.reply("❌ *Formato incorrecto*\n\nEjemplo: `.autobio ganti_setiap 30 detik` o `1 hora`");
    }

    let ms = 0;
    const value = parseInt(timeStr);
    if (isNaN(value)) {
      return m.reply("❌ *Format Salah*\n\nEscribe un número válido. Ejemplo: `.autobio ganti_setiap 30 detik`");
    }

    if (timeStr.includes("d") || timeStr.includes("detik")) ms = value * 1000;
    else if (timeStr.includes("m") || timeStr.includes("menit")) ms = value * 60000;
    else if (timeStr.includes("j") || timeStr.includes("jam")) ms = value * 3600000;
    else ms = value * 60000; // default to minutes

    if (ms < 10000) {
      return m.reply("❌ *Error*\n\nEl intervalo mínimo es de 10 segundos para evitar el spam del servidor de WhatsApp.");
    }

    db.setting("autobio_interval", ms);
    await m.react("✅");

    // Restart scheduler
    try {
      const { startAutoBioChecker } = await import("../../src/lib/system/scheduler.js");
      startAutoBioChecker(sock);
    } catch (e) {}

    return m.reply(`✅ *Interval Diubah*\n\nLa bio se actualizará automáticamente cada *${value} ${timeStr.replace(/[0-9\s]/g, "")}* (o ${ms / 1000} segundos).`);
  }

  db.setting("autobio_text", arg);
  await m.react("✅");

  // Restart scheduler to apply new text immediately
  try {
    const { startAutoBioChecker } = await import("../../src/lib/system/scheduler.js");
    startAutoBioChecker(sock);
  } catch (e) {}

  return m.reply(
    `✅ *TEKS BIO DIUBAH*\n\n` +
    `El nuevo formato de autobio se ha guardado:\n` +
    `> ${arg}`
  );
}

export { pluginConfig as config, handler };
