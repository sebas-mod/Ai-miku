/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import settings from "./src/settings/index.js";
import thumbnailSettings from "./src/settings/thumbnail.js";
const { thumbUrl, thumbSize } = thumbnailSettings;
import {
  attachHelpers,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
} from "./src/helper.js";

//  lee el objeto config completo hasta el final
const config = {
  owner: {
    name: "Arthazy", // Nombre del dueño
    number: ["6289677587355"], // Formato: 628xxx (sin + ni 0)
  },

  session: {
    pairingNumber: "6281930730973", // Déjalo vacío para que la terminal pida el número de WhatsApp al arrancar
    usePairingCode: true, // true = código de emparejamiento, false = código QR
    folderName: "session", // Carpeta de sesión dentro de ./storage
    compact: true, // true = las claves de sesión se agrupan por tipo (la carpeta de sesión tiene pocos archivos)
    autoClear: {
      enabled: true, // true = la caché de sesión que se puede borrar se limpia sola (el inicio de sesión y los chats siguen seguros)
      intervalMinutes: 60, // Intervalo de limpieza, en MINUTOS
    },
    backup: {
      keep: 3, // Copia MANUAL (.backupsession): cuántas copias recientes se guardan
    },
  },

  bot: {
    name: "Elysia Assistant", // Nombre del bot
    version: "2.0", // Versión del bot
    developer: "arthazyy", // Nombre del desarrollador
  },

  info: {
    website: "https://arthazyspace.my.id",
    grupwa: "https://chat.whatsapp.com/xxxx",
  },

  // La configuración de miniaturas está en ./src/settings/thumbnail.js (conectada aquí)
  thumbUrl,
  thumbSize,

  mode: "public",

  // Para cambiar el prefijo de comandos
  command: {
    prefix: ".",
  },

  vercel: {
    // consigue el token de Vercel aquí: https://vercel.com/account/tokens
    token: "", // Token de Vercel para la función de deploy (obligatorio si quieres que .deploy funcione)
  },

  energi: {
    enabled: true, // Si es true, el sistema de energía/límite funciona
    default: 99999,
    premium: -1,
    owner: -1,
  },

  // Ajustes de la función menfess (mensajes anónimos, solo por chat privado del bot)
  menfess: {
    on: true, // false = la función menfess se desactiva por completo
    maxPanjang: 800, // Máximo de caracteres por mensaje
    maxPerHari: 30, // Máximo de menfess que puede enviar un usuario al día (hora de Indonesia)
    maxBalasPerHari: 30, // Máximo de respuestas por usuario al día
    maxPerTujuan: 10, // Máximo de menfess al mismo número al día
    jedaDetik: 15, // Espera entre envíos/respuestas (segundos)
    biayaEnergi: 1, // Energía que cuesta cada menfess nuevo (0 = gratis). Premium/dueño sin costo
    kedaluwarsaJam: 72, // Un menfess ya no se puede responder si pasa este tiempo sin actividad
    simpanHari: 14, // Los menfess viejos se borran solos de la base de datos tras estos días
    laporBan: 3, // El remitente se banea de menfess tras ser reportado estas veces
    blokirLink: true, // Rechazar mensajes que contengan enlaces
    blokirNomor: true, // Rechazar mensajes que contengan números de teléfono
    kataTerlarang: [], // Lista de palabras rechazadas, ejemplo: ["palabra1", "palabra2"]
  },

  sticker: {
    packname: "Elysia Assistant || arthazy", // Nombre del paquete de stickers
    author: "arthazy", // Autor del sticker
  },

  saluran: {
    id: "120363393471527483@newsletter", // ID del canal principal de Elysia Assistant
    name: "Elysia Assistant", // Nombre del canal
    link: "https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O", // Enlace del canal (pon el enlace de tu canal)
    autoFollow: [
      "120363393471527483@newsletter",
      "120363412661006467@newsletter",
    ],
  },

  features: {
    antiCall: false, // Si es true, el bot rechaza las llamadas entrantes
    blockIfCall: false, // Si es true, el bot bloquea el número que lo llame
    autoTyping: true,
    autoRead: true,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, // Por defecto: el usuario no tiene que registrarse antes de usar el bot
    rewards: {
      energi: 300,
      exp: 3000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
  },

  database: {
    path: "./database/main",
    autoClearCache: {
      enabled: true, // true = la carpeta database/cache se limpia sola cada intervalo (la base de datos principal sigue segura)
      intervalMinutes: 60, // Intervalo de limpieza automática, en MINUTOS (igual que session.autoClear)
    },
  },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },
  errorTemplate: `uy, parece que el comando \`{prefix}{command}\` tiene un problema`,

  // Ajustes de modo desarrollo (se activan solos si NODE_ENV=development)
  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true, // Recarga en caliente de plugins (SEGURO)
    watchSrc: false, // DESACTIVADO - recargar src provoca el conflicto de conexión 440
    debugLog: false, // Mostrar trazas de error
  },

  // Partes separadas en src/settings (apikey, messages, payment, pterodactyl, etc.)
  ...settings,
};

attachHelpers(config);

const getConfig = () => config;

export default config;
export {
  config,
  getConfig,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
};
