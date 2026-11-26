/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";
import { runMenuLoading } from "../../src/lib/core/menu-loading.js";
import { Button } from "../../src/lib/core/builder.js";

const SC_THUMB_URL = "https://cdn.zass.in/MN4N0k9J0E.jpeg";
const WEB_URL = "https://arthazyspace.my.id";

const pluginConfig = {
  name: "sc",
  alias: ["script"],
  category: "main",
  description: "Enlace del script del bot Elysia Assistant",
  usage: ".sc",
  example: ".sc",
  isPremium: false,
  isOwner: false,
  isBanned: false,
  isAdmin: false,
  cooldown: 10,
  energi: 0,
  isBotAdmin: false,
  isEnabled: true,
};

async function handler(m, { sock }) {
  await runMenuLoading(sock, m.chat, "script de Elysia Assistant");

  const caption =
    `🔥 *SC Elysia Assistant* 🔥\n\n` +
    `¡Aquí está! Pulsa el botón de abajo para ver el script / canal de Elysia Assistant.\n\n` +
    `╭─〔 *Elysia Assistant* 〕\n` +
    `│ 👤 Usuario : @${String(m.sender || "").split("@")[0]}\n` +
    `│ ⚡ Estado  : En línea\n` +
    `╰───────────────`;

  const scThumb = await axios
    .get(SC_THUMB_URL, { responseType: "arraybuffer", timeout: 10000 })
    .then((r) => Buffer.from(r.data))
    .catch(() => null);

  const btn = new Button(sock)
    .setBody(caption)
    .setFooter("script - elysia assistant")
    .setContextInfo({
      mentionedJid: m.sender ? [m.sender] : [],
    })
    .addUrl("obtener script", WEB_URL, false, {
      merchant_url: WEB_URL,
    });

  if (scThumb) {
    btn.setImage(scThumb);
  }

  return await btn.send(m.chat, { quoted: m.raw || m });
}

export { pluginConfig as config, handler };
