/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const jpmCfg = MikuRuntime.jpmCfg;
const jpmSetCfg = MikuRuntime.jpmSetCfg;

const pluginConfig = {
    name: "setjeda",
    alias: ["setdelay", "jeda"],
    category: "pushkontak",
    description: "Fitur pushkontak setjeda",
    usage: ".setjeda",
    example: ".setjeda",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { text, prefix, reply }) {
      const [target, raw] = String(text || '').trim().split(/\s+/)
      const cfg = jpmCfg()

      if (!target || !raw) {
          return reply(
              `*▢ SET JEDA*\n` +
              `• Jeda push : ${cfg.delayPushKontak}ms\n` +
              `• Jeda jpm : ${cfg.delayJpm}ms\n\n` +
              `Ejemplo:\n${prefix}setjeda push 5000\n${prefix}setjeda jpm 6000\n\n1 segundo = 1000ms`
          )
      }

      const key = { push: 'delayPushKontak', jpm: 'delayJpm' }[target.toLowerCase()]
      if (!key) return reply('❌ Opciones: *push* o *jpm*')

      const ms = parseInt(raw)
      if (isNaN(ms) || ms < 1000) return reply('❌ Escribe un número mínimo de 1000 (1 segundo).')
      if (ms > 60000) return reply('❌ Máximo 60000 (1 minuto).')

      jpmSetCfg(key, ms)
      return reply(`*▢ INTERVALO DE ${target.toUpperCase()} CAMBIADO*\n• Intervalo : ${ms}ms (${ms / 1000} segundos)`)
  }

export { pluginConfig as config, handler }
