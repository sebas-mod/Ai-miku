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
  description: "Lista completa de acciones de rol de Miku",
  usage: ".rpact",
  example: ".rpact",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m) {
  const p = m.prefix || ".";
  await m.reply(
    `╭─❖「 🎭 *MIKU ROLEPLAY ACTIONS* 」\n` +
      `│ 🤗 \`${p}hug @user\` — Abrazo cálido\n` +
      `│ 🥰 \`${p}pat @user\` — Acaricia la cabeza\n` +
      `│ 💋 \`${p}kiss @user\` — Beso dulce\n` +
      `│ 🫶 \`${p}cuddle @user\` — Manja bareng\n` +
      `│ 👉 \`${p}poke @user\` — Colek jahil\n` +
      `│ 🔨 \`${p}bonk @user\` — Getok becanda\n` +
      `│ 👋 \`${p}slap @user\` — Tampar dramatis\n` +
      `│ 🦷 \`${p}bite @user\` — Gigit gemas\n` +
      `│ 💃 \`${p}dance [@user]\` — Joget ceria\n` +
      `│ 😊 \`${p}blush [@user]\` — Malu-malu\n` +
      `├───〔 *PROFIL RP* 〕\n` +
      `│ 🪪 \`${p}rpprofile\`  |  💭 \`${p}rpmood <texto>\`\n` +
      `╰─────────────────────❖`
  );
}

export { pluginConfig as config, handler };
