/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const getDatabase = ElysiaRuntime.getDatabase;

  const pluginConfig = {
    name: 'leveluprpg',
    alias: [],
    category: "rpg",
    description: "Toggle notifikasi level up RPG",
    usage: ".leveluprpg <on/off>",
    example: ".leveluprpg on",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
  };

  function handler(m, { sock }) {
    const db = getDatabase();
    const user = db.getUser(m.sender);
    const args = m.args || [];
    const sub = args[0]?.toLowerCase();

    if (!user.settings) user.settings = {};

    if (sub === "on") {
      user.settings.rpgLevelupNotif = true;
      db.save();
      return m.reply(`✅ *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` + `> Status: *ON* ✅\n` + `> Kamu akan menerima notifikasi RPG saat naik level!`);
    }

    if (sub === "off") {
      user.settings.rpgLevelupNotif = false;
      db.save();
      return m.reply(`❌ *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` + `> Status: *OFF* ❌\n` + `> Notifikasi RPG level up dinonaktifkan.`);
    }

    const status = user.settings.rpgLevelupNotif !== false ? "ON ✅" : "OFF ❌";
    return m.reply(
      `🔔 *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` +
        `> Status saat ini: *${status}*\n\n` +
        `*📋 *ᴜsᴀɢᴇ:*
\n` +
        `> > \`.leveluprpg on\` - Aktifkan\n` +
        `> > \`.leveluprpg off\` - Nonaktifkan\n` +
        ``,
    );
  }

export { pluginConfig as config, handler }
