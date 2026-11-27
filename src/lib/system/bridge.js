/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
/**
 * ╭──────────────────────────────────────────────❖
 * │ ✦ Ai Miku — System Bridge
 * │ ✦ Location   : src/lib/system/bridge.js
 * │ ✦ Architect  : Arthazy
 * ╰──────────────────────────────────────────────❖
 */
import _mikuConfig from '../../../config.js'
import { MikuEngine } from './miku-engine.js'
import { MikuGuildKernel } from './social-kernel.js'
import { MikuMediaKernel } from './media-scraper.js'

export const MikuRuntime = Object.assign(
  { config: _mikuConfig },
  MikuEngine,
  MikuGuildKernel,
  MikuMediaKernel
)

export const bridge = MikuRuntime

export {
  _mikuConfig,
  MikuEngine,
  MikuGuildKernel,
  MikuMediaKernel
}

export default MikuRuntime
