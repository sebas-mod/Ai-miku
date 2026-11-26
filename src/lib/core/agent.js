/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { Agent, setGlobalDispatcher } from 'undici'
import { cpus } from 'os'
const cpuCount = cpus().length

function initializeAgent() {
    setGlobalDispatcher(
        new Agent({
            connections: Math.max(5, cpuCount * 2),
            pipelining: 1,
            keepAliveTimeout: 5_000,
            keepAliveMaxTimeout: 60_000,
            connectTimeout: 10_000,
            bodyTimeout: 30_000,
            headersTimeout: 30_000,
            maxRedirections: 3
        })
    )
}

export { initializeAgent }
