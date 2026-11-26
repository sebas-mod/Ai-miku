/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: "netflixprem",
  alias: ["nfgen", "nf-gen"],
  category: "premium",
  description: "Generate token login Netflix Premium",
  usage: ".netflixprem [jumlah 1-5]",
  example: ".netflixprem 1",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

const NF_ENDPOINT = "https://token-netflix.vercel.app/api/generate";

function makeLoginLinks(token) {
  return {
    browser: `https://www.netflix.com/login?nftoken=${token}`,
    mobile: `https://netflix.com/unsupported?nftoken=${token}`,
    tv: `https://www.netflix.com/tv?nftoken=${token}`,
  };
}

async function fetchNetflixTokens(count) {
  const res = await fetch(NF_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count, stream: false }),
  });
  if (!res.ok) throw new Error(`Server merespons HTTP ${res.status}`);
  return res.json();
}

async function handler(m) {
  const p = m.prefix || ".";
  const count = parseInt(String(m.text || "").trim().split(/\s+/)[0], 10) || 1;
  if (count < 1 || count > 5) {
    return m.reply(`⚠️ Contoh: \`${p}netflixprem 1\` (maksimal 5 token sekaligus).`);
  }

  await m.react("⏳").catch(() => {});
  await m.reply(`⏳ Sedang membuat *${count}* token Netflix Premium...`);

  let result;
  try {
    result = await fetchNetflixTokens(count);
  } catch (e) {
    await m.react("❌").catch(() => {});
    return m.reply(`❌ Gagal menghubungi server token: ${e.message}`);
  }

  const tokens = result?.data || [];
  if (!tokens.length) {
    await m.react("❌").catch(() => {});
    return m.reply(`❌ Stok token sedang kosong atau server bermasalah.`);
  }

  const okCount = tokens.filter((t) => t.success).length;
  let txt =
    `╭─── ❖ 『 🎬 *NETFLIX PREMIUM TOKEN* 』 ❖\n` +
    `│ ✧ *Status:* Aktif\n` +
    `│ ✧ *Wilayah:* Indonesia (ID)\n` +
    `│ ✧ *Berhasil:* ${okCount} / ${count}\n`;

  tokens.forEach((item, idx) => {
    if (!item.success) return;
    const links = makeLoginLinks(item.token);
    const pr = item.profile || {};
    txt +=
      `├─── *#${idx + 1} TOKEN VIP*\n` +
      `│ 🔑 \`${item.token}\`\n` +
      `│ 📧 *Email:* ${pr.email || "-"}\n` +
      `│ 💎 *Plan:* ${pr.plan || "Premium"} (${pr.connection || "UHD"})\n` +
      `│ 📅 *Expires:* ${item.expiry ? new Date(item.expiry).toLocaleString("id-ID") : "-"}\n` +
      `│ 🌐 *Browser:* ${links.browser}\n` +
      `│ 📱 *Mobile:* ${links.mobile}\n` +
      `│ 📺 *TV:* ${links.tv}\n`;
  });

  txt += `╰──────────────────────────❖\n_✦ Ai Miku • ${result.time_ms || 0}ms_`;
  await m.react("✅").catch(() => {});
  return m.reply(txt);
}

export { pluginConfig as config, handler };
