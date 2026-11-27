/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: "ringkas",
    alias: [],
    category: "convert",
    description: "ringkas <texto / responde a un mensaje>",
    usage: ".ringkas <texto / responde a un mensaje>",
    example: ".ringkas <texto / responde a un mensaje>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function summarizeText(content) {
  const prompt =
    `Resuma el siguiente texto en indonesio en puntos centrales claros, concisos y fáciles de entender:\n\n${content}`
  const endpoints = [
    `https://v2.api-varhad.my.id/ai/claude?text=${encodeURIComponent(prompt)}`,
    `https://api.nexray.eu.cc/ai/gemini?text=${encodeURIComponent(prompt)}`,
    `https://apiii-xrina.vercel.app/ai/gemini?text=${encodeURIComponent(prompt)}`
  ]
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep)
      const j = await r.json().catch(() => null)
      const ans = j?.result || j?.data?.response || j?.data || j?.response
      if (typeof ans === "string" && ans.trim()) return ans.trim()
    } catch {}
  }
  throw new Error("Actualmente no se puede acceder al resumidor del servicio AI.")
}

async function handler(m, { conn, sock, text, args, usedPrefix = ".", command = "ringkas" }) {
  const client = conn || sock
  let input = (text || (args || []).join(" ") || m.quoted?.text || m.quoted?.body || "").trim()

  if (!input && m.quoted) {
    try {
      const buf = typeof m.quoted.download === "function"
        ? await m.quoted.download()
        : await client?.downloadMediaMessage?.(m.quoted)
      if (buf && buf.length) {
        input = buf.toString("utf8").slice(0, 15000)
      }
    } catch {}
  }

  if (!input || input.length < 30) {
    return m.reply(
      `📑 *RESUMEN DE TEXTO AUTOMÁTICO*\n\n` +
      `Envíe o responda textos/artículos largos que desee resumir.\n` +
      `Ejemplo: \`${usedPrefix + command} <texto largo>\``
    )
  }

  await m.react("⏳")
  try {
    const summary = await summarizeText(input.slice(0, 12000))
    await m.react("✅")
    return m.reply(`📑 *RINGKASAN INTI*\n\n${summary}\n\n_Ai Miku_`)
  } catch (e) {
    await m.react("❌")
    return m.reply(`❌ *No se pudo resumir el texto:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
