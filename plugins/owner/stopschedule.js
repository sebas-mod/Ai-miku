/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
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
    description: 'Detiene un programador concreto o todos',
    usage: '.stopschedule <nombre|all>',
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
            const helpText = `🛑 *DETENER PROGRAMADOR*

*Usage:*
\`.stopschedule <nombre>\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checker
• \`messages\` - Scheduled Messages
• \`all\` - Todos los programadores

*Example:*
\`.stopschedule limitreset\`
\`.stopschedule all\``;

            await m.reply(helpText);
            return;
        }

        const result = stopSchedulerByName(target);

        if (result.stopped) {
            await m.reply(`🛑 *PROGRAMADOR DETENIDO*

> Scheduler: *${result.name}*
> Status: ❌ Dihentikan

_Usa \`.startschedule ${target}\` para volver a activarlo_`);
        } else {
            await m.reply(`❌ Programador no encontrado o ya inactivo

Usa \`.stopschedule\` para ver la lista de programadores`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
