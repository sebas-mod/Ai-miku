/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { spawn } from 'child_process'
import path from 'path'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'restart',
    alias: ['reset', 'reboot', 'restartbot'],
    category: 'owner',
    description: 'Restart bot process (real restart)',
    usage: '.restart',
    example: '.restart',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        await m.react('🔄')

        const startTime = Date.now()

        await sock.sendMessage(m.chat, {
            text: `🔄 *REINICIANDO EL BOT...*\n\n` +
                  `╭┈┈⬡「 📊 *INFO* 」\n` +
                  `┃ ⏰ Time: ${new Date().toLocaleTimeString('id-ID')}\n` +
                  `┃ 🔧 Method: Process Spawn\n` +
                  `┃ 📦 PID: ${process.pid}\n` +
                  `╰┈┈⬡\n\n` +
                  `> El bot se reiniciará en 2 segundos...\n` +
                  `> El proceso puede tardar de 10 a 30 segundos`
        }, { quoted: m })

        console.log('[Restart] Command triggered by:', m.sender)
        console.log('[Restart] Initiating graceful restart...')

        setTimeout(() => {
            const cwd = process.cwd()
            const isWindows = process.platform === 'win32'

            let command, args

            if (isWindows) {
                command = 'cmd.exe'
                args = ['/c', 'start', '/b', 'node', 'index.js']
            } else {
                command = 'node'
                args = ['index.js']
            }

            const child = spawn(command, args, {
                cwd: cwd,
                detached: true,
                stdio: 'ignore',
                shell: isWindows,
                env: { ...process.env, RESTARTED: 'true', RESTART_TIME: startTime.toString() }
            })

            child.unref()

            console.log('[Restart] New process spawned, exiting current process...')

            setTimeout(() => {
                process.exit(0)
            }, 500)

        }, 2000)

    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
