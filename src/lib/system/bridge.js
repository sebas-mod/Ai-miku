/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
/**
 * ╭──────────────────────────────────────────────❖
 * │ ✦ Elysia Assistant — System Bridge
 * │ ✦ Location   : src/lib/system/bridge.js
 * │ ✦ Architect  : Arthazy
 * ╰──────────────────────────────────────────────❖
 */
import _elysiaConfig from '../../../config.js'
import { ElysiaEngine } from './elysia-engine.js'
import { ElysiaRpgKernel } from './rpg-kernel.js'
import { ElysiaGuildKernel } from './social-kernel.js'
import { ElysiaMediaKernel } from './media-scraper.js'

export const ElysiaRuntime = Object.assign(
  { config: _elysiaConfig },
  ElysiaEngine,
  ElysiaRpgKernel,
  ElysiaGuildKernel,
  ElysiaMediaKernel
)

export const bridge = ElysiaRuntime

export {
  _elysiaConfig,
  ElysiaEngine,
  ElysiaRpgKernel,
  ElysiaGuildKernel,
  ElysiaMediaKernel
}

export default ElysiaRuntime
