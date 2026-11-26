/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js"
import { getDatabase } from "../../src/lib/data/database.js"

const pluginConfig = {
    name: "rules",
    alias: ["aturanbot", "botrules", "peraturanbot"],
    category: "main",
    description: "Menampilkan rules dan aturan penggunaan bot secara lengkap",
    usage: ".rules",
    example: ".rules",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

function buildDefaultRules(botName, prefix) {
    return `📜 *PERATURAN ${botName.toUpperCase()}*

Hai! Sebelum kamu menggunakan semua fitur yang tersedia, pastikan kamu memahami dan mematuhi peraturan berikut ini ya. Peraturan ini dibuat supaya semua pengguna bisa nyaman dan bot bisa berjalan dengan lancar.

🔹 *ATURAN UMUM*

- Dilarang keras melakukan *spam command* secara berulang-ulang dalam waktu singkat. Sistem anti-spam aktif dan pelanggar bisa langsung dibanned otomatis oleh bot.
- Gunakan semua fitur bot dengan *bijak dan bertanggung jawab*. Jangan menyalahgunakan fitur untuk hal-hal yang merugikan orang lain.
- Dilarang menggunakan bot untuk menyebarkan *konten SARA, ujaran kebencian, atau konten ilegal* dalam bentuk apapun.
- *Hormati sesama pengguna* bot. Jangan menggunakan fitur untuk mengganggu, membully, atau merugikan pengguna lain.
- Jangan mengirimkan *konten NSFW* di grup tanpa persetujuan admin grup terlebih dahulu.

🔹 *ATURAN PENGGUNAAN FITUR*

- Setiap penggunaan command membutuhkan *energi*. Gunakan energi kamu dengan bijak supaya tidak cepat habis.
- Fitur *premium* hanya bisa diakses oleh pengguna yang sudah berlangganan. Ketik *${prefix}benefitpremium* untuk info lengkap.
- Jika menemukan *bug atau error*, segera laporkan ke owner bot melalui *${prefix}owner*. Jangan disalahgunakan.
- Dilarang melakukan *request fitur yang tidak masuk akal* atau memaksa owner untuk menambahkan fitur tertentu.

🔹 *KONSEKUENSI PELANGGARAN*

- Pelanggaran ringan akan mendapat *peringatan* dari admin atau owner
- Pelanggaran berat atau berulang dapat mengakibatkan *banned permanen* dari penggunaan bot
- Owner berhak memutuskan sanksi tanpa pemberitahuan terlebih dahulu

_Dengan menggunakan bot ini, kamu dianggap sudah membaca dan menyetujui seluruh peraturan di atas._`
}

async function handler(m) {
    const db = getDatabase()
    const botName = config.bot?.name || "Elysia Assistant"
    const customRules = db.setting("botRules")

    let rulesText
    if (customRules && typeof customRules === "string" && customRules.trim().length > 0) {
        rulesText = customRules
    } else if (Array.isArray(customRules) && customRules.length > 0) {
        rulesText = `📜 *PERATURAN ${botName.toUpperCase()}*\n\n`
        customRules.forEach((rule, i) => {
            rulesText += `${i + 1}. ${rule}\n`
        })
    } else {
        rulesText = buildDefaultRules(botName, m.prefix)
    }

    await m.reply(rulesText)
}

export { pluginConfig as config, handler }
