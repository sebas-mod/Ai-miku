/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getAssetBuffer } from "../../src/lib/core/media.js";
import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
const pluginConfig = {
  name: "setgoodbyetype",
  alias: ["goodbyetype", "goodbyevariant", "goodbyestyle"],
  category: "owner",
  description: "Mengatur variant tampilan goodbye message",
  usage: ".setgoodbyetype",
  example: ".setgoodbyetype",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};
const VARIANTS = {
  1: {
    name: "Canvas Image",
    desc: "Imagen canvas con foto de perfil",
    emoji: "🎨",
  },
  2: {
    name: "Carousel Cards",
    desc: "Tarjetas carrusel interactivas con botones",
    emoji: "🃏",
  },
  3: {
    name: "Text Only",
    desc: "Mensaje de texto minimalista sin imagen",
    emoji: "📝",
  },
  4: { name: "Group", desc: "ContextInfo group style", emoji: "👥" },
  5: { name: "Simple", desc: "Texto simple + foto de perfil", emoji: "✨" },
  6: { name: "Video", desc: "Envía un vídeo de despedida", emoji: "🎥" },
  7: { name: "Interactive Quoted", desc: "Mensaje interactivo con cita falsa", emoji: "💬" },
};
async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();
  const current = db.setting("goodbyeType") || 1;
  if (variant && /^v?[1-7]$/.test(variant)) {
    const id = parseInt(variant.replace("v", ""));
    db.setting("goodbyeType", id);
    await db.save();
    await m.reply(
      `✅ *TIPO DE DESPEDIDA CAMBIADO*\n\n` +
        `${VARIANTS[id].emoji} *V${id} — ${VARIANTS[id].name}*\n` +
        `_${VARIANTS[id].desc}_`,
    );
    return;
  }
  const rows = [];
  for (const [id, val] of Object.entries(VARIANTS)) {
    const mark = parseInt(id) === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} V${id}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setgoodbyetype v${id}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "👋 Elige el tipo de despedida",
        sections: [{ title: "Lista de tipos de despedida", rows }],
      }),
    },
  ];
  const bodyText =
    `👋🚪 *GOODBYE TYPE*\n\n` +
    `Configura el mensaje de despedida cuando un miembro sale del grupo 🚶💨\n` +
    `Tipo activo: *V${current} — ${VARIANTS[current].name}* 🎯\n\n` +
    `*PENJELASAN TIPE:*\n\n` +
    `- *V1 Canvas Image* 🎨 — El bot crea una imagen con la foto de perfil y el nombre del miembro que sale, y la envía como imagen\n\n` +
    `- *V2 Carousel Cards* 🃏 — Muestra tarjetas carrusel deslizables con botones de acción, ideal para una vista moderna\n\n` +
    `- *V3 Text Only* 📝 — Mensaje de texto sin imágenes, ligero y minimalista\n\n` +
    `- *V4 Group* 👥 — Usa contextInfo estilo reenvío de grupo, con etiqueta de newsletter\n\n` +
    `- *V5 Simple* ✨ — Texto sencillo con la foto de perfil del miembro que sale; discreto pero informativo\n\n` +
    `- *V6 Video* 🎥 — Envía un vídeo de despedida estético con texto automático para el miembro\n\n` +
    `- *V7 Interactive Quoted* 💬 — Envía un mensaje interactivo con cita falsa de la persona que sale\n\n` +
    `> Elige el tipo de despedida en el botón de abajo 👇`;
  await sock.sendButton(
    m.chat,
    getAssetBuffer("goodbye"),
    bodyText,
    m,
    { buttons },
  );
}
export { pluginConfig as config, handler };
