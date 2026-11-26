/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getAssetBuffer } from "../../src/lib/core/media.js";
import config from "../../config.js";

const pluginConfig = {
  name: "setreply",
  alias: ["replyvariant", "replystyle"],
  category: "owner",
  description: "Mengatur variant tampilan reply",
  usage: ".setreply <variant>",
  example: ".setreply v1",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const VARIANTS = {
  v1: {
    id: 1,
    name: "BASIC",
    desc: "",
    emoji: "✨",
  },
  v2: {
    id: 2,
    name: "PREMIUM",
    desc: "",
    emoji: "🖼️",
  },
  v3: {
    id: 3,
    name: "TITANIUM",
    desc: "",
    emoji: "📨",
  },
  v6: {
    id: 6,
    name: "SIMPLE DOCUMENT",
    desc: "Como V2 pero sin cita falsa de contacto (cita original)",
    emoji: "📄",
  },
  v7: {
    id: 7,
    name: "FAKE LOCATION",
    desc: "Texto con cita falsa de ubicación",
    emoji: "📍",
  },
  v8: {
    id: 8,
    name: "FAKE SIGNUP",
    desc: "Texto con cita falsa de registro",
    emoji: "🥠",
  },
  v10: {
    id: 10,
    name: "TAGIHAN / PAYMENT",
    desc: "Tampilan struk tagihan (Payment Request)",
    emoji: "💳",
  },
};

async function handler(m, { sock, db }) {
  const variant = String(m.text || "").trim().toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(
        `❌ *VARIANTE NO VÁLIDA*\n\nUsa: *v1, v2, v3, v6, v7, v8, v10*`
      );
      return;
    }

    db.setting("replyVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *VARIANTE DE RESPUESTA CAMBIADA*\n\n` +
        `${selected.emoji} *V${selected.id} — ${selected.name}*` +
        (selected.desc ? `\n_${selected.desc}_` : "")
    );
    return;
  }

  let current = db.setting("replyVariant") || config.ui?.replyVariant || 1;
  if (!VARIANTS[`v${current}`]) current = 1;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setreply ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "💬 Elige la variante de respuesta",
        sections: [{ title: "Lista de variantes de respuesta", rows }],
      }),
    },
  ];

  const bodys =
    `💬📨 *REPLY VARIANT*\n\n` +
    `Configura cómo responde el bot a los mensajes de los usuarios 💬✨\n` +
    `Variante activa: *V${current} — ${VARIANTS[`v${current}`]?.name || "BASIC"}* 🎯\n`;

  await sock.sendButton(
    m.chat,
    getAssetBuffer("reply"),
    bodys,
    m,
    { buttons }
  );
}

export { pluginConfig as config, handler };
