/**
 * Modos de bot por grupo (helpers compartidos).
 * Los usaba plugins/group/botmode.js; al eliminar ese plugin duplicado
 * quedan aquí para que otros plugins (por ejemplo addowner) sigan funcionando.
 */

const MODES = {
  md: {
    name: "Multi-Device",
    desc: "Modo por defecto con todas las funciones estándar",
    allowedCategories: null,
    excludeCategories: ["pushkontak", "store"],
  },
  all: {
    name: "All Features",
    desc: "Se puede acceder a todas las funciones de todos los modos",
    allowedCategories: null,
    excludeCategories: null,
  },
  pushkontak: {
    name: "Envío de contactos",
    desc: "Modo especial para enviar contactos a los miembros",
    allowedCategories: ["owner", "main", "group", "sticker", "pushkontak"],
    excludeCategories: null,
  },
  store: {
    name: "Store/Toko",
    desc: "Modo especial para tienda manual",
    allowedCategories: ["main", "group", "sticker", "owner", "store"],
    excludeCategories: null,
  },
  otp: {
    name: "OTP Service",
    desc: "Modo de servicio OTP automático",
    allowedCategories: ["main", "group", "sticker", "owner", "otp"],
    excludeCategories: null,
  },
};

function getGroupMode(chatJid, db) {
  const globalMode = db.setting("botMode") || "all";
  if (!chatJid?.endsWith("@g.us")) return globalMode;
  const groupData = db.getGroup(chatJid) || {};
  return groupData.botMode || globalMode;
}

function getModeCategories(mode) {
  const modeConfig = MODES[mode] || MODES.md;
  return {
    allowed: modeConfig.allowedCategories,
    excluded: modeConfig.excludeCategories,
  };
}

function filterCategoriesByMode(categories, mode) {
  const modeConfig = MODES[mode] || MODES.md;

  if (modeConfig.allowedCategories) {
    return categories.filter((cat) =>
      modeConfig.allowedCategories.includes(cat.toLowerCase()),
    );
  }

  if (modeConfig.excludeCategories) {
    return categories.filter(
      (cat) => !modeConfig.excludeCategories.includes(cat.toLowerCase()),
    );
  }

  return categories;
}

export { MODES, getGroupMode, getModeCategories, filterCategoriesByMode };
