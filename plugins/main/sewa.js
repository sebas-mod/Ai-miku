/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { getAssetBuffer, getThumbUrl } from "../../src/lib/core/media.js";
import { saluranCtx } from "../../src/lib/core/context.js";

const pluginConfig = {
  name: "sewa",
  alias: ["hargasewa", "listsewabot", "buybot"],
  category: "main",
  description: "Muestra la lista de precios de alquiler del bot para grupos y los planes premium",
  usage: ".sewa",
  example: ".sewa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

// Cambia aquí la lista de planes y precios según lo que necesites
const SEWA_PACKAGES = [
  { label: "7 días (semanal)", price: "Rp 5.000", badge: "" },
  { label: "15 días", price: "Rp 10.000", badge: "" },
  { label: "30 días (1 mes)", price: "Rp 15.000", badge: "🔥 Más vendido" },
  { label: "60 días (2 meses)", price: "Rp 25.000", badge: "💎 Ahorro" },
  { label: "Permanente", price: "Rp 45.000", badge: "👑 VIP" },
];

const PREMIUM_PACKAGES = [
  { label: "Premium 15 días", price: "Rp 5.000" },
  { label: "Premium 30 días", price: "Rp 10.000" },
  { label: "Premium permanente", price: "Rp 25.000" },
];

async function handler(m, { sock }) {
  const botName = config.bot?.name || "Ai Miku";
  const ownerName = config.owner?.name || "Arthazy";
  const ownerNum = String(config.owner?.number?.[0] || "6289677587355").replace(
    /[^0-9]/g,
    ""
  );
  const p = m.prefix || ".";

  const sewaLines = SEWA_PACKAGES.map(
    (item) =>
      `│ ✧ *${item.label}* — *${item.price}*${item.badge ? ` _(${item.badge})_` : ""}`
  ).join("\n");

  const premLines = PREMIUM_PACKAGES.map(
    (item) => `│ ✧ *${item.label}* — *${item.price}*`
  ).join("\n");

  const activeMethods = (config.donasi?.payment || [])
    .filter((pm) => pm.number && !pm.number.includes("xxxx"))
    .map((pm) => `${pm.name} (${pm.number}${pm.holder ? ` a nombre de ${pm.holder}` : ""})`);

  const paymentLine =
    activeMethods.length > 0
      ? activeMethods.join(" • ") + (config.donasi?.qris ? " • QRIS" : "")
      : "DANA • GoPay • OVO • QRIS";

  const caption =
    `╭─── ❖ 『 💎 *PRECIOS DE ALQUILER DEL BOT* 』 ❖\n` +
    `│ ✦ ¡Ten a *${botName}* en tu grupo!\n` +
    `│ ✦ Activo 24/7, respuestas rápidas y más de 1.000 funciones listas.\n` +
    `├─── ❖ 『 🏰 *PLANES DE ALQUILER POR GRUPO* 』 ❖\n` +
    `${sewaLines}\n` +
    `├─── ❖ 『 ⭐ *PLANES PREMIUM DE USUARIO* 』 ❖\n` +
    `${premLines}\n` +
    `├─── ❖ 『 ✨ *VENTAJAS DEL ALQUILER* 』 ❖\n` +
    `│ ✧ Bot activo 24 horas en el grupo (respuesta rápida)\n` +
    `│ ✧ Funciones completas: IA, RPG, Juegos, Descargas, Stickers\n` +
    `│ ✧ Gestión del grupo: Bienvenida, Antilink, Antispam, Tagall\n` +
    `│ ✧ Garantía de servicio durante todo el alquiler\n` +
    `├─── ❖ 『 💳 *PAGOS Y PEDIDOS* 』 ❖\n` +
    `│ ✧ *Método:* ${paymentLine}\n` +
    `│ ✧ *Dueño:* ${ownerName} (wa.me/${ownerNum})\n` +
    `│ ✧ *Cómo pedir:* habla con el dueño o escribe \`${p}owner\`\n` +
    `╰──────────────────────────❖\n` +
    `_✦ Consulta cuánto te queda de alquiler con \`${p}checksewa\`._`;

  const imageBuffer = getAssetBuffer("sewa");
  const thumbUrl = getThumbUrl("sewa");

  try {
    if (imageBuffer) {
      await sock.sendMessage(
        m.chat,
        {
          image: imageBuffer,
          caption,
          contextInfo: saluranCtx(),
        },
        { quoted: m }
      );
      return;
    }

    if (thumbUrl) {
      await sock.sendMessage(
        m.chat,
        {
          image: { url: thumbUrl },
          caption,
          contextInfo: saluranCtx(),
        },
        { quoted: m }
      );
      return;
    }
  } catch {
    // Si falla el envío de la imagen, se manda solo el texto
  }

  await m.reply(caption);
}

export { pluginConfig as config, handler };
