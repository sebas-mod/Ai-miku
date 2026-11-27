/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { startSchedulerByName, getFullSchedulerStatus } from '../../src/lib/system/scheduler.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'startschedule',
    alias: ['startscheduler', 'schedstart', 'resumeschedule'],
    category: 'owner',
    description: 'Reinicia un programador concreto o todos',
    usage: '.startschedule <nombre|all>',
    example: '.startschedule limitreset',
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
            const helpText = `▶️ *INICIAR PROGRAMADOR*

*Uso:*
\`.startschedule <nombre>\`

*Programadores disponibles:*
• \`limitreset\` - Reinicio de límite diario
• \`groupschedule\` - Programación de grupos
• \`sewa\` - Verificación de alquiler
• \`messages\` - Mensajes programados
• \`all\` - Todos los programadores

*Example:*
\`.startschedule limitreset\`
\`.startschedule all\``;

            await m.reply(helpText);
            return;
        }

        const result = startSchedulerByName(target, sock);

        if (result.started) {
            await m.reply(`▶️ *PROGRAMADOR INICIADO*

> Scheduler: *${result.name}*
> Estado: ✅ Activo

_El programador se ha reiniciado_`);
        } else {
            await m.reply(`❌ Programador no encontrado o ya activo

Usa \`.startschedule\` para ver la lista de programadores`);
        }
    } catch (error) {
        console.error('[StartSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
