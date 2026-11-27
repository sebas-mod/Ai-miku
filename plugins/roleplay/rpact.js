/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: "rpact",
  alias: ["rplist"],
  category: "roleplay",
  description: "Daftar lengkap aksi interaksi Roleplay Miku",
  usage: ".rpact",
  example: ".rpact",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const p = m.prefix || ".";
  await m.reply(
    `╭─❖「 🎭 *MIKU ROLEPLAY ACTIONS* 」\n` +
      `│ 🤗 \`${p}hug @user\` — Peluk hangat\n` +
      `│ 🥰 \`${p}pat @user\` — Acaricia la cabeza\n` +
      `│ 💋 \`${p}kiss @user\` — Cium manis\n` +
      `│ 🫶 \`${p}cuddle @user\` — Manja bareng\n` +
      `│ 👉 \`${p}poke @user\` — Colek jahil\n` +
      `│ 🔨 \`${p}bonk @user\` — Getok becanda\n` +
      `│ 👋 \`${p}slap @user\` — Tampar dramatis\n` +
      `│ 🦷 \`${p}bite @user\` — Gigit gemas\n` +
      `│ 💃 \`${p}dance [@user]\` — Joget ceria\n` +
      `│ 😊 \`${p}blush [@user]\` — Malu-malu\n` +
      `├───〔 *PROFIL RP* 〕\n` +
      `│ 🪪 \`${p}rpprofile\`  |  💭 \`${p}rpmood <teks>\`\n` +
      `╰─────────────────────❖`
  );
}

export { pluginConfig as config, handler };
