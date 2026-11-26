/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { runMenuLoading } from "../../src/lib/core/menu-loading.js";
import configOwner from "../../config.js";
import { sendElysiaNativeMenu as sendVemzoNativeMenu } from "../../src/lib/core/native-menu.js";

const pluginConfig = {
  name: "menumedia",
  alias: ["mediamenu", "listmenumedia"],
  category: "canvas",
  description: "Menu fitur media: IQC, VOS, dan VOSV2.",
  usage: ".menumedia",
  example: ".menumedia",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

function makeRows(prefix) {
  return [
    {
      title: "IQC",
      description: "Fake Quote iOS • .iqc vemzo gamink",
      id: `${prefix}iqc vemzo gamink`,
    },
    {
      title: "VOS",
      description: "Buat gambar quote dengan nama • .vos Jack,Vemzo Gamink",
      id: `${prefix}vos Jack,Vemzo Gamink`,
    },
    {
      title: "VOSV2",
      description: "Buat quote gaya Windows Media Player • .vosv2 VEMZO GAMINK",
      id: `${prefix}vosv2 VEMZO GAMINK`,
    },
  ];
}

async function sendMediaList(m, sock, prefix) {
  const rows = makeRows(prefix);
  const text =
    `╭─〔 🖼️ *VEMZO MEDIA* 〕─╮\n` +
    `│ IQC • VOS • VOSV2\n` +
    `╰────────────────╯\n\n` +
    `Pilih fitur dari tombol *LIST MENU MEDIA* di bawah.`;

  await sendVemzoNativeMenu(sock, m, {
    buttonId: "pilihan_menumedia",
    pickerTitle: "☰ LIST MENU MEDIA",
    sections: [{ title: "MEDIA VEMZO", rows }],
    contentText: text,
    footerText: "Vemzo • Media",
    address: "MENU MEDIA VEMZO",
    thumbKey: "allmenu",
  });
}

async function handler(m, { sock }) {
  await runMenuLoading(sock, m.chat, "menu media");
  const prefix = m.prefix || configOwner?.command?.prefix || ".";
  const args = (m.args || []).join(" ").trim().toLowerCase();

  if (args === "list" || args === "menu") {
    return sendMediaList(m, sock, prefix);
  }

  const text =
    `╭─〔 🖼️ *VEMZO MEDIA* 〕─╮\n` +
    `│ IQC • VOS • VOSV2\n` +
    `╰────────────────╯\n\n` +
    `Gunakan tombol *LIST MENU MEDIA* untuk melihat cara pakai dan memilih fitur.`;

  await sendVemzoNativeMenu(sock, m, {
    buttonId: "pilihan_menumedia",
    pickerTitle: "☰ LIST MENU MEDIA",
    sections: [{ title: "MEDIA VEMZO", rows: makeRows(prefix) }],
    contentText: text,
    footerText: "Vemzo • Media",
    address: "MENU MEDIA VEMZO",
    thumbKey: "allmenu",
  });

}

export { pluginConfig as config, handler };
