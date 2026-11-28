import { spawn, execSync } from 'child_process'

const pluginConfig = {
  name: 'update',
  alias: ['actualizar', 'gitpush', 'pushupdate', 'actualizarbot'],
  category: 'owner',
  description: 'Hace commit, push al repo y reinicia el bot/host.',
  usage: '.update [mensaje]',
  example: '.update fix comandos',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true
}

function sh(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

function safeSh(cmd, cwd) {
  try {
    return { ok: true, out: sh(cmd, cwd) }
  } catch (e) {
    return { ok: false, out: (e.stderr || e.stdout || e.message || String(e)).toString().trim() }
  }
}

async function handler(m, { sock }) {
  const cwd = process.cwd()
  const rawMsg = String(m.text || (Array.isArray(m.args) ? m.args.join(' ') : '') || '').trim()
  const commitMsg = rawMsg ? `sebas-MD: ${rawMsg}` : 'sebas-MD: actualización'

  await m.react('⏳').catch(() => {})

  try {
    const status = safeSh('git status --porcelain', cwd)
    if (!status.ok) {
      await m.react('❌').catch(() => {})
      return m.reply(`❌ *UPDATE FALLÓ*\n\n> No se pudo leer el estado de git.\n\`\`\`\n${status.out.slice(0, 1500)}\n\`\`\``)
    }

    const branch = safeSh('git branch --show-current', cwd).out || 'main'
    const remote = safeSh('git remote get-url origin', cwd).out || 'origin'

    const name = safeSh('git config user.name', cwd).out
    const email = safeSh('git config user.email', cwd).out
    if (!name) safeSh('git config user.name "sebas-mod"', cwd)
    if (!email) safeSh('git config user.email "sebas-mod@users.noreply.github.com"', cwd)

    let committed = false
    let pushed = false

    if (status.out) {
      const add = safeSh('git add -A', cwd)
      if (!add.ok) throw new Error(add.out || 'No se pudo hacer git add')
      const commit = safeSh(`git commit -m ${JSON.stringify(commitMsg)}`, cwd)
      if (!commit.ok) throw new Error(commit.out || 'No se pudo hacer git commit')
      committed = true
    }

    const push = safeSh(`git push origin ${branch}`, cwd)
    if (!push.ok) {
      if (/Everything up-to-date/i.test(push.out)) {
        pushed = false
      } else {
        throw new Error(push.out || 'No se pudo hacer git push')
      }
    } else {
      pushed = true
    }

    const shortHead = safeSh('git rev-parse --short HEAD', cwd).out || '-'
    const report =
      `╭━━━〔 *UPDATE / PUSH* 〕━━━╮\n` +
      `┃ ✅ *Estado:* Completado\n` +
      `┃ 📦 *Repo:* ${remote}\n` +
      `┃ 🌿 *Rama:* ${branch}\n` +
      `┃ 📝 *Commit:* ${committed ? commitMsg : 'Sin cambios nuevos'}\n` +
      `┃ 🔖 *HEAD:* ${shortHead}\n` +
      `┃ 🚀 *Push:* ${pushed ? 'sebas-MD enviado' : 'Sin cambios para push'}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      `> El push sebas-MD se realizó para actualizar. Reiniciando host/bot...`

    await sock.sendMessage(m.chat, { text: report }, { quoted: m }).catch(() => {})
    await m.react('✅').catch(() => {})

    setTimeout(() => {
      const isWindows = process.platform === 'win32'
      const command = isWindows ? 'cmd.exe' : 'node'
      const args = isWindows ? ['/c', 'start', '/b', 'node', 'index.js'] : ['index.js']

      try {
        const child = spawn(command, args, {
          cwd,
          detached: true,
          stdio: 'ignore',
          shell: isWindows,
          env: { ...process.env, RESTARTED: 'true', RESTART_REASON: 'update-push' }
        })
        child.unref()
      } catch (e) {
        console.error('[Update] Error al reiniciar:', e)
      }

      setTimeout(() => process.exit(0), 500)
    }, 2000)
  } catch (error) {
    await m.react('❌').catch(() => {})
    const msg = String(error?.message || error).slice(0, 1800)
    await m.reply(`❌ *UPDATE FALLÓ*\n\n\`\`\`\n${msg}\n\`\`\``).catch(() => {})
  }
}

export { pluginConfig as config, handler }
