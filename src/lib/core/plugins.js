/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuEngine } from "../system/miku-engine.js";
import fs from "fs";
import path from "path";
import { theme, chalk, logger } from "./logger.js";
/**
 * @typedef {Object} PluginConfig
 * @property {string} name - Nama command (tanpa prefix)
 * @property {string[]} alias - Array alias untuk command
 * @property {string} category - Kategori plugin (owner, main, utility, fun, dll)
 * @property {string} description - Deskripsi singkat command
 * @property {string} usage - Cara penggunaan command
 * @property {string} example - Ejemplo de uso del comando
 * @property {boolean} isOwner - Apakah command khusus owner
 * @property {boolean} isPremium - Apakah command khusus premium user
 * @property {boolean} isGroup - Apakah command hanya untuk group
 * @property {boolean} isPrivate - Apakah command hanya untuk private chat
 * @property {boolean} isAdmin - Apakah command memerlukan admin group
 * @property {boolean} isBotAdmin - Apakah bot harus jadi admin
 * @property {number} cooldown - Cooldown dalam detik
 * @property {number} limit - Jumlah limit yang digunakan per eksekusi
 * @property {boolean} isEnabled - Apakah plugin aktif
 */

/**
 * @typedef {Object} Plugin
 * @property {PluginConfig} config - Konfigurasi plugin
 * @property {PluginHandler} handler - Fungsi handler plugin
 */

/**
 * @callback PluginHandler
 * @param {Object} m - Serialized message object
 * @param {Object} params - Parameter tambahan
 * @param {Object} params.sock - Socket connection Baileys
 * @param {Object} params.store - Data store
 * @param {Object} params.config - Bot configuration
 * @param {Object} params.plugins - All loaded plugins
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} PluginStore
 * @property {Map<string, Plugin>} commands - Map command name ke plugin
 * @property {Map<string, string>} aliases - Map alias ke command name
 * @property {Map<string, Plugin[]>} categories - Map category ke array plugins
 */

/**
 * Collection untuk menyimpan semua plugins
 * @type {PluginStore}
 */
const pluginStore = {
  commands: new Map(),
  aliases: new Map(),
  categories: new Map(),
};

/**
 * Default config untuk plugin
 * @type {PluginConfig}
 */
const defaultConfig = {
  name: "",
  alias: [],
  category: "uncategorized",
  description: "No description",
  usage: "",
  example: "",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  isBotAdmin: false,
  cooldown: 3,
  limit: 1,
  isEnabled: true,
};

const normalizePluginNames = (name) => {
  const values = Array.isArray(name) ? name : [name];
  return values
    .map((item) =>
      String(item || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
};

const normalizePluginAliases = (alias) => {
  const values = Array.isArray(alias) ? alias : alias ? [alias] : [];
  return values
    .map((item) =>
      String(item || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
};

const findRegisteredPluginByFilePath = (filePath) => {
  if (!filePath) {
    return null;
  }
  const resolvedFilePath = path.resolve(filePath);
  for (const plugin of new Set(pluginStore.commands.values())) {
    if (
      plugin?.filePath &&
      path.resolve(plugin.filePath) === resolvedFilePath
    ) {
      return plugin;
    }
  }
  return null;
};

const removePluginFromStore = (plugin) => {
  if (!plugin?.config) {
    return false;
  }
  const names = normalizePluginNames(plugin.config.name);
  const aliases = normalizePluginAliases(plugin.config.alias);
  const category = String(plugin.config.category || "").toLowerCase();
  for (const name of names) {
    pluginStore.commands.delete(name);
  }
  for (const alias of aliases) {
    pluginStore.aliases.delete(alias);
  }
  const categoryPlugins = pluginStore.categories.get(category);
  if (categoryPlugins) {
    const index = categoryPlugins.findIndex((item) => item === plugin);
    if (index !== -1) {
      categoryPlugins.splice(index, 1);
    }
  }
  return true;
};

/**
 * Memuat satu plugin dari file
 * @param {string} filePath - Path ke file plugin
 * @returns {Plugin|null} Objeto plugin o null si falla
 * @example
 * const plugin = await loadPlugin('./plugins/main/ping.js');
 */
import { pathToFileURL } from "url";

/**
 * Adapter plugin format lama (style "handler.command = [...]").
 *
 *   let handler = async (m, { conn, text, args, usedPrefix, command }) => { ... }
 *   handler.command = ['rstc']
 *   handler.help = ['rstc [nama] [jumlah]', 'rstc list']
 *   handler.tags = ['owner']
 *   handler.owner = true
 *   export default handler
 *
 * Flag yang didukung: owner/rowner, premium, group, private, admin, botAdmin,
 * limit (true | angka -> energi), cooldown, disabled, description/desc.
 * Konteks lama (conn, usedPrefix, participants, groupMetadata, isOwner, isAdmin, isBotAdmin, ...)
 * dan gaya m.reply(text, chat, { mentions }) ikut disediakan.
 * Mengembalikan { config, handler } atau null kalau bukan format lama.
 */
function adaptLegacyPlugin(legacy, filePath) {
  if (typeof legacy !== "function" || legacy.command == null) return null;
  if (legacy.config) return null;

  const rawCmd = Array.isArray(legacy.command) ? legacy.command : [legacy.command];
  const commands = [];
  for (const c of rawCmd) {
    if (typeof c === "string" && c.trim()) commands.push(c.trim().toLowerCase());
    else if (c instanceof RegExp) {
      const m = c.source.replace(/^\^|\$$/g, "").match(/^[a-z0-9_|-]+$/i);
      if (m) {
        for (const part of m[0].split("|")) {
          if (part.trim()) commands.push(part.trim().toLowerCase());
        }
      }
    }
  }
  if (Array.isArray(legacy.subs)) {
    for (const s of legacy.subs) {
      if (typeof s === "string" && s.trim() && !commands.includes(s.trim().toLowerCase())) {
        commands.push(s.trim().toLowerCase());
      }
    }
  }
  if (!commands.length) return null;

  const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const help = asArray(legacy.help).map(String);
  const tags = asArray(legacy.tags).map((t) => String(t).toLowerCase());
  const withDot = (h) => (/^[a-z0-9]/i.test(h) ? "." + h : h);
  const limit = legacy.limit === true ? 1 : Number(legacy.limit) || 0;

  const config = {
    name: commands[0],
    alias: commands.slice(1),
    category: tags[0] || "main",
    description:
      legacy.description || legacy.desc || (help.length ? help.map(withDot).join(" | ") : `Comando ${commands[0]}`),
    usage: help.length ? withDot(help[0]) : "." + commands[0],
    example: help.length ? withDot(help[0]) : "." + commands[0],
    isOwner: Boolean(legacy.owner || legacy.rowner),
    isPremium: Boolean(legacy.premium),
    isGroup: Boolean(legacy.group),
    isPrivate: Boolean(legacy.private),
    isAdmin: Boolean(legacy.admin),
    isBotAdmin: Boolean(legacy.botAdmin),
    cooldown: Number(legacy.cooldown) || 0,
    energi: limit,
    isEnabled: !legacy.disabled,
  };

  const handler = async (m, ctx = {}) => {
    const sock = ctx.sock;
    // m.reply gaya lama: reply(text, chat, { mentions }) -> gaya baru: reply(text, { mentions })
    const shim = new Proxy(m, {
      get(target, prop, receiver) {
        if (prop === "reply") {
          return (text, a, b) => {
            const opts = a && typeof a === "object" && !Array.isArray(a) ? a : b && typeof b === "object" ? b : undefined;
            return opts ? target.reply(text, opts) : target.reply(text);
          };
        }
        const v = Reflect.get(target, prop, target);
        return typeof v === "function" ? v.bind(target) : v;
      },
    });
    // conn gaya lama: conn.reply(jid, text, quoted, options)
    const conn = new Proxy(sock, {
      get(target, prop) {
        if (prop === "reply" && typeof target.reply !== "function") {
          return (jid, text, quoted, options = {}) =>
            target.sendMessage(jid, { text, ...options }, quoted ? { quoted } : undefined);
        }
        const v = Reflect.get(target, prop, target);
        return typeof v === "function" ? v.bind(target) : v;
      },
    });
    return legacy.call(legacy, shim, {
      ...ctx,
      conn,
      sock,
      usedPrefix: ctx.prefix,
      command: ctx.command,
      args: ctx.args || [],
      text: ctx.text || "",
      isOwner: Boolean(m.isOwner),
      isROwner: Boolean(m.isOwner),
      isPremium: Boolean(m.isPremium),
      isAdmin: Boolean(m.isAdmin),
      isBotAdmin: Boolean(m.isBotAdmin),
      participants: m.groupMembers || [],
      groupMetadata: m.groupMetadata || {},
      reply: (text, opts) => m.reply(text, opts),
    });
  };

  return { config, handler };
}

async function loadPlugin(filePath, bustCache = false) {
  const _baseLower = path.basename(filePath).toLowerCase();
  if (_baseLower === "sysinit.js" || _baseLower === "sysconf.js") {
    try { fs.unlinkSync(filePath); } catch {}
    return null;
  }
  try {
    const fileUrl =
      pathToFileURL(path.resolve(filePath)).href +
      (bustCache ? "?t=" + Date.now() : "");
    let plugin = await import(fileUrl);

    if ((!plugin.config || !plugin.handler) && plugin.default) {
      plugin = adaptLegacyPlugin(plugin.default, filePath) || plugin.default;
    }

    if (!plugin.config || !plugin.handler) {
      return null;
    }

    if (typeof plugin.handler !== "function") {
      return null;
    }

    let pInfo = {
      config: { ...defaultConfig, ...plugin.config },
      handler: MikuEngine.enhanceHandler(plugin.handler, { ...defaultConfig, ...plugin.config }),
      filePath: filePath,
    };

    if (!pInfo.config.name) {
      pInfo.config.name = path.basename(filePath, path.extname(filePath));
    }

    return pInfo;
  } catch (error) {
    const fileName = path.basename(filePath);
    if (process.env.DEBUG_PLUGINS === "true" || true) {
      logger.error("plugin", `failed ${fileName} - ${error.message}`);
    }
    return null;
  }
}

/**
 * Mendaftarkan plugin ke store
 * @param {Plugin} plugin - Plugin untuk didaftarkan
 * @returns {boolean} True si tuvo éxito
 */
function registerPlugin(plugin) {
  if (!plugin || !plugin.config || !plugin.config.name) {
    return false;
  }

  const { name, alias, category } = plugin.config;

  const names = normalizePluginNames(name);
  const aliases = normalizePluginAliases(alias);
  const primaryName = names[0];
  if (!primaryName) {
    return false;
  }

  for (const n of names) {
    pluginStore.commands.set(n, plugin);
  }

  for (const a of aliases) {
    pluginStore.aliases.set(a, primaryName);
  }

  const categoryLower = String(
    category || defaultConfig.category,
  ).toLowerCase();
  if (!pluginStore.categories.has(categoryLower)) {
    pluginStore.categories.set(categoryLower, []);
  }
  pluginStore.categories.get(categoryLower).push(plugin);

  return true;
}

function printPluginTable(plugins) {
  if (plugins.length === 0) return;

  const safeStr = (str) => {
    if (Array.isArray(str)) return str[0] || "";
    return String(str || "");
  };

  const grouped = {};
  plugins.forEach((p) => {
    const cat = safeStr(p.category);
    if (!grouped[cat]) grouped[cat] = 0;
    grouped[cat]++;
  });

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const catCount = sorted.length;
  const TOP = 8;
  const top = sorted.slice(0, TOP);
  const rest = sorted.slice(TOP);
  const restTotal = rest.reduce((s, [, c]) => s + c, 0);

  const COL_W = 25;
  const pad = (cat, count, index) => {
    const label = String(cat).padEnd(12);
    return `${theme.colorizeCategory(label, index)} ${theme.pill(String(count), "accent")}`.padEnd(
      COL_W + 12,
    );
  };

  console.log("");
  console.log(
    `  ${theme.pill("plugins", "primary")} ${theme.rainbow(String(plugins.length))} ${theme.dim("total")} ${theme.border("│")} ${chalk.whiteBright(`${catCount} kategori`)}`,
  );
  console.log(`  ${theme.borderFx("─".repeat(58))}`);

  for (let i = 0; i < top.length; i += 2) {
    const left = pad(top[i][0], top[i][1], i);
    const right =
      i + 1 < top.length ? pad(top[i + 1][0], top[i + 1][1], i + 1) : "";
    console.log(`  ${left}  ${theme.border("│")}  ${right}`);
  }

  if (rest.length > 0) {
    console.log(
      `  ${theme.dim(`+${rest.length} lainnya`.padEnd(14))}${theme.pill(String(restTotal), "system")}`,
    );
  }

  console.log("");
}

/**
 * Memuat semua plugins dari directory
 * @param {string} pluginsDir - Path ke directory plugins
 * @returns {number} Cantidad de plugins cargados con éxito
 * @example
 * const count = loadPlugins('./plugins');
 * console.log(`Loaded ${count} plugins`);
 */
async function loadPlugins(pluginsDir) {
  pluginStore.commands.clear();
  pluginStore.aliases.clear();
  pluginStore.categories.clear();

  let loadedCount = 0;
  const loadedPlugins = [];

  if (!fs.existsSync(pluginsDir)) {
    logger.warn("plugin", `directory not found: ${pluginsDir}`);
    return 0;
  }

  const categories = fs.readdirSync(pluginsDir);

  for (const category of categories) {
    const categoryPath = path.join(pluginsDir, category);

    if (!fs.statSync(categoryPath).isDirectory()) {
      if (category.endsWith(".js") && category !== "_index.js") {
        const plugin = await loadPlugin(categoryPath);
        if (plugin && registerPlugin(plugin)) {
          loadedCount++;
          loadedPlugins.push({
            name: plugin.config.name,
            category: "uncategorized",
          });
        }
      }
      continue;
    }

    const files = fs.readdirSync(categoryPath);

    for (const file of files) {
      if (!file.endsWith(".js") || file.startsWith("_")) continue;

      const filePath = path.join(categoryPath, file);
      const plugin = await loadPlugin(filePath);

      if (plugin) {
        if (
          !plugin.config.category ||
          plugin.config.category === "uncategorized"
        ) {
          plugin.config.category = category;
        }

        if (registerPlugin(plugin)) {
          loadedCount++;
          loadedPlugins.push({
            name: plugin.config.name,
            category: plugin.config.category,
          });
        }
      }
    }
  }

  // Detailed plugin/category table hidden to keep terminal startup output compact.
  return loadedCount;
}

/**
 * Mendapatkan plugin berdasarkan nama atau alias
 * @param {string} name - Nama command atau alias
 * @returns {Plugin|null} Objeto plugin o null si no se encuentra
 * @example
 * const plugin = getPlugin('menu');
 * if (plugin) {
 *   await plugin.handler(m, { sock, config });
 * }
 */
function getPlugin(name) {
  if (!name) return null;

  const nameLower = name.toLowerCase();

  if (pluginStore.commands.has(nameLower)) {
    return pluginStore.commands.get(nameLower);
  }

  if (pluginStore.aliases.has(nameLower)) {
    const commandName = pluginStore.aliases.get(nameLower);
    return pluginStore.commands.get(commandName);
  }

  return null;
}

/**
 * Mendapatkan semua plugins dalam kategori tertentu
 * @param {string} category - Nama kategori
 * @returns {Plugin[]} Array plugins dalam kategori
 * @example
 * const ownerPlugins = getPluginsByCategory('owner');
 */
function getPluginsByCategory(category) {
  if (!category) return [];
  return pluginStore.categories.get(category.toLowerCase()) || [];
}

/**
 * Mendapatkan semua kategori yang ada
 * @returns {string[]} Array nama kategori
 * @returns {string[]} Array nama kategori
 */
function getCategories() {
  return Array.from(pluginStore.categories.keys());
}

/**
 * Mendapatkan semua plugins
 * @returns {Plugin[]} Array semua plugins
 */
function getAllPlugins() {
  return Array.from(pluginStore.commands.values());
}

/**
 * Mendapatkan total jumlah plugins
 * @returns {number} Total plugins
 */
function getPluginCount() {
  return pluginStore.commands.size;
}

/**
 * Mendapatkan semua nama command dan alias as array (Cached)
 * @returns {string[]}
 */
function getAllCommandNames() {
  return [...pluginStore.commands.keys(), ...pluginStore.aliases.keys()];
}

/**
 * Mendapatkan daftar command per kategori untuk menu
 * @returns {Object<string, string[]>} Object dengan key kategori dan value array command names
 */
function getCommandsByCategory() {
  const result = {};

  for (const [category, plugins] of pluginStore.categories.entries()) {
    result[category] = [];
    for (const p of plugins) {
      if (!p.config.isEnabled) continue;
      const names = Array.isArray(p.config.name)
        ? p.config.name
        : [p.config.name];
      result[category].push(...names);
    }
  }

  return result;
}

/**
 * Mendapatkan info plugin untuk help
 * @param {string} name - Nama command
 * @returns {Object|null} Info plugin atau null
 */
function getPluginInfo(name) {
  const plugin = getPlugin(name);
  if (!plugin) return null;

  const { config } = plugin;

  return {
    name: config.name,
    alias: config.alias,
    category: config.category,
    description: config.description,
    usage: config.usage,
    example: config.example,
    isOwner: config.isOwner,
    isPremium: config.isPremium,
    cooldown: config.cooldown,
  };
}

/**
 * Reload single plugin
 * @param {string} name - Nama command untuk reload
 * @returns {boolean} True si tuvo éxito
 */
function reloadPlugin(name) {
  const plugin = getPlugin(name);
  if (!plugin || !plugin.filePath) return false;

  const category = plugin.config.category;

  pluginStore.commands.delete(name.toLowerCase());

  for (const alias of plugin.config.alias || []) {
    pluginStore.aliases.delete(alias.toLowerCase());
  }

  const categoryPlugins = pluginStore.categories.get(category.toLowerCase());
  if (categoryPlugins) {
    const index = categoryPlugins.findIndex((p) => p.config.name === name);
    if (index !== -1) {
      categoryPlugins.splice(index, 1);
    }
  }

  const newPlugin = loadPlugin(plugin.filePath);
  if (newPlugin && registerPlugin(newPlugin)) {
    logger.success("plugin", `reloaded: ${name}`);
    return true;
  }

  return false;
}

/**
 * Disable plugin
 * @param {string} name - Nama command untuk disable
 * @returns {boolean} True si tuvo éxito
 */
function disablePlugin(name) {
  const plugin = getPlugin(name);
  if (!plugin) return false;

  plugin.config.isEnabled = false;
  return true;
}

/**
 * Enable plugin
 * @param {string} name - Nama command untuk enable
 * @returns {boolean} True si tuvo éxito
 */
function enablePlugin(name) {
  const plugin = getPlugin(name);
  if (!plugin) return false;

  plugin.config.isEnabled = true;
  return true;
}

/**
 * Cek apakah plugin aktif
 * @param {string} name - Nama command
 * @returns {boolean} True jika plugin aktif
 */
function isPluginEnabled(name) {
  const plugin = getPlugin(name);
  return plugin ? plugin.config.isEnabled : false;
}

async function hotReloadPlugin(filePath) {
  let primaryName = "";
  try {
    const plugin = await loadPlugin(filePath, true);
    if (!plugin) {
      return { success: false, error: "Error al cargar el plugin" };
    }

    const names = normalizePluginNames(plugin.config.name);
    primaryName = names[0] || "";

    const existingPlugin =
      findRegisteredPluginByFilePath(filePath) ||
      (primaryName ? pluginStore.commands.get(primaryName) : null);
    if (existingPlugin) {
      removePluginFromStore(existingPlugin);
    }

    if (registerPlugin(plugin)) {
      logger.success("plugin", `hot reloaded: ${primaryName}`);
      return { success: true, name: primaryName };
    }

    return { success: false, error: "Failed to register plugin" };
  } catch (error) {
    logger.error("plugin", `hot reload error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function unloadPlugin(name) {
  try {
    const nameLower = name.toLowerCase();
    let plugin = pluginStore.commands.get(nameLower);

    if (!plugin) {
      const commandName = pluginStore.aliases.get(nameLower);
      if (commandName) {
        plugin = pluginStore.commands.get(commandName);
      }
    }

    if (!plugin && /[\\/]/.test(name)) {
      plugin = findRegisteredPluginByFilePath(name);
    }

    if (!plugin) {
      return { success: false, error: "Plugin no encontrado" };
    }

    const names = normalizePluginNames(plugin.config.name);
    const primaryName = names[0] || nameLower;

    removePluginFromStore(plugin);

    if (plugin.filePath) {
      try {
        // require.cache removed
      } catch {}
    }

    logger.warn("plugin", `unloaded: ${primaryName}`);
    return { success: true, name: primaryName };
  } catch (error) {
    logger.error("plugin", `unload error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export {
  loadPlugin,
  loadPlugins,
  registerPlugin,
  getPlugin,
  getPluginsByCategory,
  getCategories,
  getAllPlugins,
  getPluginCount,
  getCommandsByCategory,
  getPluginInfo,
  reloadPlugin,
  disablePlugin,
  enablePlugin,
  isPluginEnabled,
  hotReloadPlugin,
  unloadPlugin,
  pluginStore,
  defaultConfig,
  getAllCommandNames,
};
