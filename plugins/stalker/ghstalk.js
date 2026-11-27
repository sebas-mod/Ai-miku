/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";

const pluginConfig = {
  name: "ghstalk",
  alias: ["stalkgh", "githubstalk"],
  category: "stalker",
  description: "Consulta el perfil y los repositorios populares de un usuario de GitHub",
  usage: ".ghstalk <username>",
  example: ".ghstalk torvalds",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 1, isEnabled: true,
};

async function handler(m, { sock }) {
  const username = String(m.text || "").trim().replace(/^@/, "");
  if (!username) return m.reply(`🔎 ¡Escribe el nombre de usuario de GitHub!\n> Ejemplo: \`${m.prefix}ghstalk torvalds\``);

  await m.react("🔎");
  try {
    const [{ data: u }, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { "User-Agent": "Miku-Assistant" },
        timeout: 12000,
      }),
      axios.get(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=3`, {
        headers: { "User-Agent": "Miku-Assistant" },
        timeout: 12000,
      }).catch(() => ({ data: [] })),
    ]);

    const topRepos = Array.isArray(reposRes.data) && reposRes.data.length
      ? reposRes.data.map((r, i) => `│ ${i + 1}. *${r.name}* (⭐ ${r.stargazers_count || 0})`).join("\n")
      : "│ -";

    const joined = u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "-";
    const caption =
      `╭─❖「 🐙 *GITHUB STALKER* 」\n` +
      `│ 👤 Nombre    : *${u.name || "-"}*\n` +
      `│ 🔖 Username  : \`@${u.login}\`\n` +
      `│ 📝 Bio       : ${u.bio || "-"}\n` +
      `│ 📍 Lokasi    : ${u.location || "-"}\n` +
      `│ 🏢 Company   : ${u.company || "-"}\n` +
      `├───〔 *STATISTIK* 〕\n` +
      `│ 📦 Public Repo : *${u.public_repos ?? 0}*\n` +
      `│ 👥 Followers   : *${(u.followers ?? 0).toLocaleString("id-ID")}*\n` +
      `│ 🤝 Following   : *${(u.following ?? 0).toLocaleString("id-ID")}*\n` +
      `│ 📅 Bergabung   : ${joined}\n` +
      `├───〔 *TOP REPO* 〕\n` +
      `${topRepos}\n` +
      `│ 🔗 ${u.html_url}\n` +
      `╰─────────────────────❖`;

    if (u.avatar_url) {
      await sock.sendMessage(m.chat, { image: { url: u.avatar_url }, caption }, { quoted: m });
    } else {
      await m.reply(caption);
    }
    await m.react("✅");
  } catch (err) {
    await m.react("❌");
    const msg = err?.response?.status === 404 ? `No se encontró el usuario de GitHub *${username}*.` : `No se pudieron obtener los datos de GitHub: ${err.message}`;
    await m.reply(`❌ ${msg}`);
  }
}

export { pluginConfig as config, handler };
