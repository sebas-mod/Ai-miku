/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const handleApiTool = ElysiaRuntime.handleApiTool;

const pluginConfig = {
    name: "readqr",
    alias: [],
    category: "tools",
    description: "readqr",
    usage: ".readqr",
    example: ".readqr",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const spec = {
      name: 'readqr', title: 'Baca QR Code', path: 'tools/readqr', kind: 'text', image: ['url'], fields: [] }

  let handler = (m, ctx) => handleApiTool(spec, m, ctx)

export { pluginConfig as config, handler }
