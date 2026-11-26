/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { stopSchedulerByName, getFullSchedulerStatus } from '../../src/lib/system/scheduler.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: 'Menghentikan scheduler tertentu atau semua',
    usage: '.stopschedule <nama|all>',
    example: '.stopschedule limitreset',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    try {
        const target = args[0]?.toLowerCase();

        if (!target) {
            const helpText = `🛑 *sᴛᴏᴘ sᴄʜᴇᴅᴜʟᴇʀ*

*Usage:*
\`.stopschedule <nama>\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checker
• \`messages\` - Scheduled Messages
• \`all\` - Semua scheduler

*Example:*
\`.stopschedule limitreset\`
\`.stopschedule all\``;

            await m.reply(helpText);
            return;
        }

        const result = stopSchedulerByName(target);

        if (result.stopped) {
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *${result.name}*
> Status: ❌ Dihentikan

_Gunakan \`.startschedule ${target}\` untuk mengaktifkan kembali_`);
        } else {
            await m.reply(`❌ Scheduler tidak ditemukan atau sudah nonaktif

Gunakan \`.stopschedule\` untuk melihat daftar scheduler`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
