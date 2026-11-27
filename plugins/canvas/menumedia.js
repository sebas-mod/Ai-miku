/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { runMenuLoading } from "../../src/lib/core/menu-loading.js";
import configOwner from "../../config.js";
import { sendMikuNativeMenu as sendVemzoNativeMenu } from "../../src/lib/core/native-menu.js";

const pluginConfig = {
  name: "menumedia",
  alias: ["mediamenu", "listmenumedia"],
  category: "canvas",
  description: "Menú de funciones multimedia: IQC, VOS y VOSV2.",
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
      description: "Crea una imagen de cita con nombre • .vos Jack,Vemzo Gamink",
      id: `${prefix}vos Jack,Vemzo Gamink`,
    },
    {
      title: "VOSV2",
      description: "Crea una cita con estilo Windows Media Player • .vosv2 VEMZO GAMINK",
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
    `Seleccione una función de los botones *LIST MENU MEDIA* que aparecen a continuación.`;

  await sendVemzoNativeMenu(sock, m, {
    buttonId: "pilihan_menumedia",
    pickerTitle: "☰ LISTA DEL MENÚ MULTIMEDIA",
    sections: [{ title: "MEDIOS VEMZO", rows }],
    contentText: text,
    footerText: "Vemzo • Medios",
    address: "MENÚ MULTIMEDIA VEMZO",
    thumbKey: "allmenu",
  });
}

async function handler(m, { sock }) {
  await runMenuLoading(sock, m.chat, "menú multimedia");
  const prefix = m.prefix || configOwner?.command?.prefix || ".";
  const args = (m.args || []).join(" ").trim().toLowerCase();

  if (args === "list" || args === "menu") {
    return sendMediaList(m, sock, prefix);
  }

  const text =
    `╭─〔 🖼️ *VEMZO MEDIA* 〕─╮\n` +
    `│ IQC • VOS • VOSV2\n` +
    `╰────────────────╯\n\n` +
    `Utilice los botones *LIST MENU MEDIA* para ver como usar y seleccionar funciones.`;

  await sendVemzoNativeMenu(sock, m, {
    buttonId: "pilihan_menumedia",
    pickerTitle: "☰ LISTA DEL MENÚ MULTIMEDIA",
    sections: [{ title: "MEDIOS VEMZO", rows: makeRows(prefix) }],
    contentText: text,
    footerText: "Vemzo • Medios",
    address: "MENÚ MULTIMEDIA VEMZO",
    thumbKey: "allmenu",
  });

}

export { pluginConfig as config, handler };
