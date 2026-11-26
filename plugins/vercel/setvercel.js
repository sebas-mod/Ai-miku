/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { setVercelToken, vercelRequest } from "../../src/lib/features/miku-vercel.js";

const pluginConfig = {
  name: "setvercel",
  alias: ["vercelset", "verceltoken"],
  category: "vercel",
  description: "Simpan dan verifikasi Vercel API Token milikmu",
  usage: ".setvercel <token>",
  example: ".setvercel xxxxxxxxxxxxxxxxxxxx",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const token = String(m.text || "").trim();
  if (!token) {
    return m.reply(
      `▲ *SET VERCEL TOKEN*\n` +
      `> Ambil token di: https://vercel.com/account/tokens\n` +
      `> Luego escribe: \`${m.prefix}setvercel <tu_token>\`\n` +
      `_Se recomienda enviarlo en el chat privado para que el token esté seguro._`
    );
  }

  await m.react("🕕");
  try {
    const data = await vercelRequest(token, "GET", "/v2/user");
    const u = data?.user || {};
    setVercelToken(m.sender, token);
    await m.react("✅");
    await m.reply(
      `╭─❖「 ▲ *VERCEL TOKEN TERVERIFIKASI* 」\n` +
      `│ 👤 Akun  : *${u.name || u.username || "-"}*\n` +
      `│ 📧 Email : ${u.email || "-"}\n` +
      `│ ✅ Status: Tersimpan ke akunmu (\`.mytoken\`)\n` +
      `╰─────────────────────❖`
    );
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ Token de Vercel no válido: *${err.message}*`);
  }
}

export { pluginConfig as config, handler };
