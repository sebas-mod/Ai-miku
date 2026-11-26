/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getRandomItem } from '../../src/lib/features/game-data.js'
const pluginConfig = {
    name: 'dare',
    alias: ['dareq', 'tantang'],
    category: 'fun',
    description: 'Random tantangan dare',
    usage: '.dare',
    example: '.dare',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const challenge = getRandomItem('dare.json');

    if (!challenge) {
        await m.reply('❌ Data tidak tersedia!');
        return;
    }

    await m.reply(`\`\`\`${challenge}\`\`\``);
}

export { pluginConfig as config, handler }
