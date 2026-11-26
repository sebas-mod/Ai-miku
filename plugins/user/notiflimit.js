/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
    name: "notiflimit",
    alias: ["notifenergi"],
    category: "owner",
    description: "Mengaktifkan atau mematikan notifikasi potong limit secara global.",
    usage: ".notiflimit",
    example: ".notiflimit",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 0,
    energi: 0,
    isEnabled: true,
};

async function handler(m, { sock }) {
    const db = getDatabase();

    const currentStatus = db.setting("notiflimit") ?? false;
    db.setting("notiflimit", !currentStatus);

    const newStatus = db.setting("notiflimit") ? "AKTIF ✅" : "MATI ❌";

    await m.reply(`*NOTIFIKASI LIMIT (GLOBAL)*\n\nStatus saat ini: *${newStatus}*\n\n> Ketika aktif, bot akan selalu memberitahu sisa limit SEMUA PENGGUNA setiap kali ada pemotongan saat menggunakan fitur bot.`);
}

export { pluginConfig as config, handler };
