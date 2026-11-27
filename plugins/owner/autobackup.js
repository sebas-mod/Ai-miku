/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { enableAutoBackup, disableAutoBackup, getBackupStatus, triggerManualBackup, formatInterval } from '../../src/lib/system/auto-backup.js'
import * as timeHelper from '../../src/lib/core/time.js'
import config from '../../config.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
  name: "autobackup",
  alias: ["backup", "ab"],
  category: "owner",
  description: "Kelola sistem auto backup",
  usage: ".autobackup <on/off/status/now> [interval]",
  example: ".autobackup on 5h",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim().split(/\s+/) || [];
  const action = args[0]?.toLowerCase();

  if (!action) {
    const status = getBackupStatus();
    const ownerNum = config.owner?.number?.[0] || "Sin configurar";

    let txt = `🗂️ *SISTEMA DE COPIA AUTOMÁTICA*\n\n`;
    txt += `╭┈┈⬡「 📊 *ESTADO* 」\n`;
    txt += `┃ 🔘 Estado: ${status.enabled ? "✅ *ON*" : "❌ *OFF*"}\n`;
    txt += `┃ ⏱️ Interval: ${status.interval}\n`;
    txt += `┃ 📅 Last Backup: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD MMMM YYYY HH:mm:ss") : "-"}\n`;
    txt += `┃ #️⃣ Total: ${status.backupCount} backup\n`;
    txt += `┃ 📤 Enviado a: ${ownerNum}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    txt += `*CÓMO USAR:*\n`;
    txt += `> \`${m.prefix}autobackup on <interval>\`\n`;
    txt += `> \`${m.prefix}autobackup off\`\n`;
    txt += `> \`${m.prefix}autobackup status\`\n`;
    txt += `> \`${m.prefix}autobackup now\`\n\n`;

    txt += `*FORMATO DE INTERVALO:*\n`;
    txt += `> • \`5m\` = 5 minutos\n`;
    txt += `> • \`1h\` = 1 hora\n`;
    txt += `> • \`6h\` = 6 horas\n`;
    txt += `> • \`1d\` = 1 día\n\n`;

    txt += `*EJEMPLO:*\n`;
    txt += `> \`${m.prefix}autobackup on 6h\` - copia cada 6 horas`;

    return m.reply(txt);
  }

  switch (action) {
    case "on":
    case "enable":
    case "start": {
      const interval = args[1];

      if (!interval) {
        return m.reply(
          `⚠️ *INTERVALO NECESARIO*\n\n` +
            `> \`${m.prefix}autobackup on <interval>\`\n\n` +
            `*EJEMPLO:*\n` +
            `> \`${m.prefix}autobackup on 30m\` - cada 30 minutos\n` +
            `> \`${m.prefix}autobackup on 6h\` - cada 6 horas\n` +
            `> \`${m.prefix}autobackup on 1d\` - cada 1 día`,
        );
      }

      const result = enableAutoBackup(interval, sock);

      if (!result.success) {
        return m.reply(`❌ *ERROR*\n\n> ${result.error}`);
      }

      const ownerNum = config.owner?.number?.[0] || "Owner #1";

      await m.react("✅");
      return m.reply(
        `✅ *COPIA AUTOMÁTICA ACTIVADA*\n\n` +
          `╭┈┈⬡「 ⚙️ *AJUSTES* 」\n` +
          `┃ ⏱️ Interval: ${result.interval}\n` +
          `┃ 📤 Enviado a: ${ownerNum}\n` +
          `┃ 📦 Exclude: node_modules, .git, storages, dll\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          ` > La primera copia se enviará en ${result.interval}`,
      );
    }

    case "off":
    case "disable":
    case "stop": {
      disableAutoBackup();

      await m.react("✅");
      return m.reply(
        `❌ *COPIA AUTOMÁTICA DESACTIVADA*\n\n` +
          `> La copia automática se ha detenido.\n` +
          `> Usa \`${m.prefix}autobackup on <interval>\` para volver a activarla.`,
      );
    }

    case "status":
    case "info": {
      const status = getBackupStatus();
      const ownerNum = config.owner?.number?.[0] || "Sin configurar";

      let txt = `🗂️ *ESTADO DE LA COPIA AUTOMÁTICA*\n\n`;
      txt += `╭┈┈⬡「 📊 *INFO* 」\n`;
      txt += `┃ 🔘 Enabled: ${status.enabled ? "✅ Sí" : "❌ No"}\n`;
      txt += `┃ ⏱️ Interval: ${status.interval}\n`;
      txt += `┃ 🔄 Running: ${status.isRunning ? "✅ Sí" : "❌ No"}\n`;
      txt += `┃ 📅 Last: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD MMMM YYYY HH:mm:ss") : "-"}\n`;
      txt += `┃ #️⃣ Total: ${status.backupCount} backup\n`;
      txt += `┃ 📤 Target: ${ownerNum}\n`;
      txt += `╰┈┈┈┈┈┈┈┈⬡`;

      return m.reply(txt);
    }

    case "now":
    case "manual":
    case "trigger": {
      await m.react("🕕");
      await m.reply(
        `🕕 *CREANDO COPIA...*\n\n> Espera, se está creando la copia...`,
      );

      try {
        await triggerManualBackup(sock);
        await m.react("✅");
        return m.reply(
          `✅ *COPIA COMPLETADA*\n\n> ¡Copia enviada al propietario!`,
        );
      } catch (error) {
        await m.react('☢');
        await m.reply(te(m.prefix, m.command, m.pushName));
      }
    }

    default:
      return m.reply(
        `⚠️ *ACCIÓN NO VÁLIDA*\n\n` +
          `> Elige: \`on\`, \`off\`, \`status\` o \`now\`\n` +
          `> Ejemplo: \`${m.prefix}autobackup on 6h\``,
      );
  }
}

export { pluginConfig as config, handler }
