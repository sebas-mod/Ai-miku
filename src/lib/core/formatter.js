/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../../config.js'
import * as timeHelper from './time.js'
/**
 * @typedef {Object} DashboardData
 * @property {string} userName - Nombre del usuario
 * @property {string} userStatus - Estado del usuario (Owner/Premium/Free)
 * @property {string} mode - Modo del bot (Public/Self)
 * @property {number} totalUsers - Total de usuarios del bot
 * @property {number} userLimit - Límite del usuario
 */

/**
 * @typedef {Object} BotInfoData
 * @property {string} botName - Nombre del bot
 * @property {string} developer - Nombre del desarrollador
 * @property {string} version - Versión del bot
 * @property {string} uptime - Tiempo activo del bot
 * @property {number} totalFeatures - Total de funciones
 * @property {string} mode - Modo del bot
 * @property {string} platform - Plataforma del bot
 */

/**
 * @typedef {Object} UserProfileData
 * @property {string} name - Nombre del usuario
 * @property {string} number - Número del usuario
 * @property {string} status - Estado (Owner/Premium/Free)
 * @property {number} limit - Límite restante
 * @property {string} registeredAt - Fecha de registro
 */

/**
 * @typedef {Object} MenuCategory
 * @property {string} name - Nombre de la categoría
 * @property {string} emoji - Emoji de la categoría
 * @property {string} description - Descripción de la categoría
 * @property {string[]} commands - Comandos de la categoría
 */

/**
 * Caracteres para dar estilo al menú
 * @constant
 */
const CHARS = {
  cornerTopLeft: "╭",
  cornerTopRight: "╮",
  cornerBottomLeft: "╰",
  cornerBottomRight: "╯",
  horizontal: "─",
  vertical: "│",
  arrow: "➣",
  bullet: "◦",
  star: "✦",
  diamond: "◇",
  dot: "•",
  check: "",
  cross: "✗",
  line: "━",
};

/**
 * Emojis para distintas necesidades
 * @constant
 */
const EMOJIS = {
  dashboard: "📊",
  info: "ℹ️",
  user: "👤",
  bot: "🤖",
  owner: "👑",
  premium: "💎",
  free: "🆓",
  public: "🌐",
  self: "🔒",
  commands: "🖥️",
  utilities: "🔧",
  fun: "🎮",
  group: "👥",
  time: "⏰",
  uptime: "⏱️",
  version: "📌",
  speed: "⚡",
  limit: "📊",
  status: "📋",
  mode: "🔄",
  name: "📝",
  number: "📱",
  developer: "👨‍💻",
  total: "📈",
  tip: "💡",
  warning: "⚠️",
  success: "✅",
  error: "❌",
  loading: "🕕",
};

/**
 * Da formato al tiempo activo en un texto fácil de leer
 * @param {number} ms - Tiempo activo en milisegundos
 * @returns {string} Texto con el tiempo formateado
 * @example
 * formatUptime(3661000); // "1h 1m 1s"
 * formatUptime(86400000); // "1d 0h 0m"
 */
function formatUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

/**
 * Da formato a una fecha
 * @param {Date|number|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 * @example
 * formatDate(new Date()); // "17/12/2024, 12:30:45"
 */
function formatDate(date) {
  return timeHelper.fromTimestamp(date, "DD/MM/YYYY HH:mm:ss");
}

/**
 * Da formato a un número de teléfono para que se lea mejor
 * @param {string} number - Número de teléfono
 * @returns {string} Número formateado
 * @example
 * formatNumber('6281234567890'); // '62 812-3456-7890'
 */
function formatNumber(number) {
  if (!number) return "";
  const cleaned = number.replace(/[^0-9]/g, "");
  if (cleaned.length < 10) return cleaned;

  if (cleaned.startsWith("62")) {
    const withoutCode = cleaned.slice(2);
    const formatted = withoutCode.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    return `62 ${formatted}`;
  }

  return cleaned;
}

/**
 * Da formato al tamaño de un archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 * @example
 * formatFileSize(1024); // "1.00 KB"
 * formatFileSize(1048576); // "1.00 MB"
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Crea una línea horizontal
 * @param {number} length - Longitud de la línea
 * @param {string} [char='─'] - Carácter de la línea
 * @returns {string} Línea como texto
 */
function createLine(length = 20, char = CHARS.horizontal) {
  return char.repeat(length);
}

/**
 * Crea la cabecera de un cuadro
 * @param {string} title - Título de la cabecera
 * @param {number} [width=20] - Ancho del cuadro
 * @returns {string} Cabecera como texto
 * @example
 * createHeader('DASHBOARD');
 * // "╭─「 DASHBOARD 」─────╮"
 */
function createHeader(title, width = 20) {
  const titlePart = `${CHARS.horizontal}「 ${title} 」`;
  const remainingWidth = Math.max(0, width - titlePart.length - 2);
  return `${CHARS.cornerTopLeft}${titlePart}${createLine(remainingWidth)}${CHARS.cornerTopRight}`;
}

/**
 * Crea el pie de un cuadro
 * @param {number} [width=20] - Ancho del cuadro
 * @returns {string} Pie como texto
 * @example
 * createFooter(); // "╰────────────────────╯"
 */
function createFooter(width = 20) {
  return `${CHARS.cornerBottomLeft}${createLine(width)}${CHARS.cornerBottomRight}`;
}

/**
 * Crea una línea del cuerpo con viñeta
 * @param {string} text - Texto de la línea
 * @param {string} [prefix='│'] - Prefijo de la línea
 * @param {string} [bullet='◦'] - Carácter de la viñeta
 * @returns {string} Línea formateada
 */
function createBodyLine(text, prefix = CHARS.vertical, bullet = CHARS.bullet) {
  return `${prefix} ${bullet} ${text}`;
}

/**
 * Crea una línea con flecha
 * @param {string} label - Etiqueta
 * @param {string} value - Valor
 * @returns {string} Línea con flecha
 * @example
 * createArrowLine('Nombre', 'Ai Miku'); // "│ ➣ Nombre: Ai Miku"
 */
function createArrowLine(label, value) {
  return `${CHARS.vertical} ${CHARS.arrow} ${label}: ${value}`;
}

/**
 * Crea el panel de información
 * @param {DashboardData} data - Datos para el panel
 * @returns {string} Panel formateado
 */
function createDashboard(data) {
  const {
    userName = "User",
    userStatus = "Free User",
    mode = "Public",
    totalUsers = 0,
    userLimit = 25,
  } = data;

  const lines = [
    `${CHARS.cornerTopLeft}${CHARS.horizontal}「 ${EMOJIS.dashboard} PANEL 」${CHARS.horizontal}`,
    `${CHARS.vertical}`,
    createArrowLine("Nombre", userName),
    createArrowLine("Estado", userStatus),
    createArrowLine("Modo", mode),
    createArrowLine("Usuarios", totalUsers.toString()),
    createArrowLine("Límite", userLimit.toString()),
    `${CHARS.vertical}`,
    `${CHARS.cornerBottomLeft}${createLine(24)}`,
  ];

  return lines.join("\n");
}

/**
 * Crea la información del bot
 * @param {BotInfoData} data - Datos del bot
 * @returns {string} Información del bot formateada
 */
function createBotInfo(data) {
  const {
    botName = config.bot?.name || "Ai Miku",
    developer = config.owner?.name || "Owner",
    version = config.bot?.version || "1.0.0",
    uptime = "0s",
    totalFeatures = 0,
    mode = config.mode || "public",
    platform = "Node.js",
  } = data;

  const lines = [
    `${CHARS.horizontal} *Información del bot* ${CHARS.horizontal}`,
    ``,
    `${CHARS.dot} Nombre-Bot : ${botName} 🌿`,
    `${CHARS.dot} Desarrollador : ${developer}`,
    `${CHARS.dot} Modo : ${mode.charAt(0).toUpperCase() + mode.slice(1)}`,
    `${CHARS.dot} Versión : ${version}`,
    `${CHARS.dot} Tiempo-Activo : ${uptime}`,
    `${CHARS.dot} Total-Funciones : ${totalFeatures}`,
    `${CHARS.dot} Plataforma : ${platform}`,
    ``,
  ];

  return lines.join("\n");
}

/**
 * Crea el perfil del usuario
 * @param {UserProfileData} data - Datos del perfil
 * @returns {string} Perfil formateado
 */
function createUserProfile(data) {
  const {
    name = "User",
    number = "",
    status = "Free",
    limit = 25,
    registeredAt = "",
  } = data;

  const statusEmoji =
    status === "Owner"
      ? EMOJIS.owner
      : status === "Premium"
        ? EMOJIS.premium
        : EMOJIS.free;

  const lines = [
    `【 PERFIL DE USUARIO 】`,
    `${EMOJIS.name} Nombre : ${name}`,
    `${EMOJIS.number} Número : ${formatNumber(number)}`,
    `${statusEmoji} Estado : ${status}`,
    `${EMOJIS.limit} Límite : ${limit}`,
    ``,
  ];

  if (registeredAt) {
    lines.splice(5, 0, `${EMOJIS.time} Registro : ${registeredAt}`);
  }

  return lines.join("\n");
}

/**
 * Crea el estado del bot
 * @param {Object} data - Datos del estado del bot
 * @returns {string} Estado del bot formateado
 */
function createBotStatus(data) {
  const {
    botName = config.bot?.name || "Ai Miku",
    uptime = "0s",
    mode = "Public",
    totalCommands = 0,
    totalUsers = 0,
    speed = "0.00s",
  } = data;

  const lines = [
    `【 ESTADO DEL BOT 】`,
    `${EMOJIS.bot} Bot      : ${botName}`,
    `${EMOJIS.uptime} Activo   : ${uptime}`,
    `${EMOJIS.mode} Modo     : ${mode}`,
    `${EMOJIS.commands} Comandos : ${totalCommands} funciones`,
    `${EMOJIS.user} Usuarios : ${totalUsers} usuarios`,
    `${EMOJIS.speed} Velocidad : ${speed}`,
    ``,
  ];

  return lines.join("\n");
}

/**
 * Crea el menú de una categoría
 * @param {MenuCategory} category - Datos de la categoría
 * @param {string} prefix - Prefijo de los comandos
 * @returns {string} Menú de la categoría
 */
function createCategoryMenu(category, prefix = config.command?.prefix || ".") {
  const { name, emoji, description = "", commands = [] } = category;

  if (commands.length === 0) {
    return "";
  }

  const header = `${emoji} *${name}*`;
  const commandList = commands
    .map((cmd) => `${CHARS.vertical} ${prefix}${cmd}`)
    .join("\n");
  const footer = `${CHARS.cornerBottomLeft}${createLine(15)}`;

  return `${header}\n${commandList}\n${footer}`;
}

/**
 * Crea una categoría del menú con su descripción
 * @param {Object} data - Datos de la categoría
 * @returns {string} Sección de la categoría
 */
function createCategorySection(data) {
  const { emoji, title, command, description, prefix = "." } = data;

  const lines = [
    `${emoji} *${title}*`,
    `  Escribe: ${prefix}${command}`,
    `  ${CHARS.vertical} ( ${description} )`,
    ``,
  ];

  return lines.join("\n");
}

/**
 * Crea el menú principal completo
 * @param {Object} data - Datos para el menú principal
 * @returns {string} Menú principal formateado
 */
function createMainMenu(data) {
  const {
    greeting = "",
    userName = "User",
    userStatus = "Free User",
    categories = [],
    botInfo = {},
    prefix = config.command?.prefix || ".",
  } = data;

  const parts = [];

  if (greeting) {
    parts.push(greeting);
    parts.push("");
  }

  parts.push(createDashboard({ userName, userStatus, ...data }));
  parts.push("");

  parts.push(createBotInfo(botInfo));
  parts.push("");

  for (const category of categories) {
    parts.push(
      createCategorySection({
        ...category,
        prefix,
      }),
    );
  }

  parts.push(`${EMOJIS.tip} *Consejo:* Si no sabes cómo usar el bot`);
  parts.push(`puedes preguntarle al dueño`);
  parts.push(`${CHARS.vertical} Modo: ${data.mode || "Public"}`);

  return parts.join("\n");
}

/**
 * Crea la lista de comandos de una categoría
 * @param {string} categoryName - Nombre de la categoría
 * @param {string[]} commands - Comandos
 * @param {string} prefix - Prefijo de los comandos
 * @returns {string} Lista de comandos formateada
 */
function createCommandList(categoryName, commands, prefix = ".") {
  const emoji = config.categoryEmojis?.[categoryName.toLowerCase()] || "📋";

  const lines = [
    `${CHARS.cornerTopLeft}${CHARS.horizontal}❏ ${emoji} *${categoryName.toUpperCase()}*`,
    "",
  ];

  for (const cmd of commands) {
    lines.push(`${CHARS.vertical} ${prefix}${cmd}`);
  }

  lines.push("");
  lines.push(`${CHARS.cornerBottomLeft}${createLine(20)}`);

  return lines.join("\n");
}

/**
 * Crea el mensaje de espera/carga
 * @param {string} [message='Espera un momento...'] - Mensaje de carga
 * @returns {string} Mensaje de espera formateado
 */
function createWaitMessage(message = "Espera un momento...") {
  return `${EMOJIS.loading} *${message}*`;
}

/**
 * Crea el mensaje de éxito
 * @param {string} [message='¡Listo!'] - Mensaje de éxito
 * @returns {string} Mensaje de éxito formateado
 */
function createSuccessMessage(message = "¡Listo!") {
  return `${EMOJIS.success} *${message}*`;
}

/**
 * Crea el mensaje de error
 * @param {string} [message='¡Ocurrió un error!'] - Mensaje de error
 * @returns {string} Mensaje de error formateado
 */
function createErrorMessage(message = "¡Ocurrió un error!") {
  return `${EMOJIS.error} *${message}*`;
}

/**
 * Crea el mensaje de advertencia
 * @param {string} message - Mensaje de advertencia
 * @returns {string} Mensaje de advertencia formateado
 */
function createWarningMessage(message) {
  return `${EMOJIS.warning} *${message}*`;
}

/**
 * Devuelve el saludo según la hora
 * @returns {string} Saludo
 * @example
 * getTimeGreeting(); // "Buenos días" (si es por la mañana)
 */
function getTimeGreeting() {
  const hour = timeHelper.getHour();

  if (hour >= 4 && hour < 10) return "Buenos días 🌅";
  if (hour >= 10 && hour < 15) return "Buenas tardes ☀️";
  if (hour >= 15 && hour < 18) return "Buenas tardes 🌇";
  return "Buenas noches 🌙";
}

/**
 * Pone en mayúscula la primera letra de cada palabra
 * @param {string} str - Texto a capitalizar
 * @returns {string} Texto capitalizado
 * @example
 * capitalize('hello world'); // "Hello World"
 */
function capitalize(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Recorta el texto si es demasiado largo
 * @param {string} text - Texto a recortar
 * @param {number} maxLength - Longitud máxima
 * @param {string} [suffix='...'] - Sufijo al recortar
 * @returns {string} Texto recortado
 */
function truncate(text, maxLength, suffix = "...") {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export { CHARS, EMOJIS, formatUptime, formatDate, formatNumber, formatFileSize, createLine, createHeader, createFooter, createBodyLine, createArrowLine, createDashboard, createBotInfo, createUserProfile, createBotStatus, createCategoryMenu, createCategorySection, createMainMenu, createCommandList, createWaitMessage, createSuccessMessage, createErrorMessage, createWarningMessage, getTimeGreeting, capitalize, truncate }
