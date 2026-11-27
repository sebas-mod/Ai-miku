/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getFullSchedulerStatus, formatTimeRemaining, getMsUntilTime } from '../../src/lib/system/scheduler.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'cekschedule',
    alias: ['cekscheduler', 'schedulerstatus', 'schedstatus'],
    category: 'owner',
    description: 'Melihat status semua scheduler bot',
    usage: '.cekschedule',
    example: '.cekschedule',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const status = getFullSchedulerStatus();

        let text = `📊 *ESTADO DE LOS PROGRAMADORES*\n\n`;

        for (const sched of status.schedulers) {
            const statusIcon = sched.running ? '✅' : '❌';
            text += `${statusIcon} *${sched.name}*\n`;
            text += `   └ Key: \`${sched.key}\`\n`;
            text += `   └ ${sched.description}\n`;

            if (sched.lastRun && sched.lastRun !== '-' && sched.lastRun !== 'Never') {
                text += `   └ Last: ${sched.lastRun}\n`;
            }

            if (sched.stats) {
                if (sched.stats.totalResets) {
                    text += `   └ Total Resets: ${sched.stats.totalResets}\n`;
                }
                if (sched.stats.activeMessages !== undefined) {
                    text += `   └ Active: ${sched.stats.activeMessages} | Sent: ${sched.stats.totalSent}\n`;
                }
            }
            text += `\n`;
        }

        text += `━━━━━━━━━━━━━━━━━━━\n`;
        text += `✅ Activos: ${status.summary.totalActive}\n`;
        text += `❌ Inactivos: ${status.summary.totalInactive}\n\n`;

        text += `> Usa \`.stopschedule <key>\` para detener\n`;
        text += `> Usa \`.startschedule <key>\` para iniciar`;

        await m.reply(text);
    } catch (error) {
        console.error('[CekSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
