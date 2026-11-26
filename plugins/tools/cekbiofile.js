/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
const elysiaLib = (name) => ElysiaRuntime.elysiaLib(name, typeof libs !== 'undefined' ? libs : null);

const pluginConfig = {
    name: "cekbiofile",
    alias: ["biofile"],
    category: "tools",
    description: "cekbiofile <reply file>",
    usage: ".cekbiofile <reply file>",
    example: ".cekbiofile <reply file>",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const fs = (__m => __m.default ?? __m)((await import('fs')))
  const { getJamPercentage, createProgressBar, checkMetaBusiness, createBioResultFile, parseNumbersFromBuffer } = (await elysiaLib('cekbio'))

  async function handler(m, { sock, conn, text, args, reply }) {
    const connection = sock || conn;
    const qmsg = m.quoted || m;
    const mime = qmsg.mimetype || qmsg.msg?.mimetype || '';

    if (!mime && !qmsg.msg?.fileName) {
      return reply('❌ ¡Responde con un archivo TXT, CSV o XLSX que contenga la lista de números!\n\n💡 *Formatos adicionales:*\n• `.cekbiofile 50` (comprueba los primeros 50 números)\n• `.cekbiofile 10 50` o `.cekbiofile 10-50` (comprueba del número 10 al 50)');
    }

    const fileName = qmsg.msg?.fileName || 'file.txt';
    const ext = fileName.toLowerCase().split('.').pop();
    if (!['txt', 'csv', 'xlsx'].includes(ext)) {
      return reply('❌ Formato de archivo no compatible. Usa TXT, CSV o XLSX.');
    }

    const sourceType = `File ${ext.toUpperCase()}`;
    let fileBuffer;
    let mediaPath;
    try {
      if (typeof connection.downloadAndSaveMediaMessage === 'function') {
        mediaPath = await connection.downloadAndSaveMediaMessage(qmsg);
        fileBuffer = fs.readFileSync(mediaPath);
      } else if (typeof connection.downloadMediaMessage === 'function') {
        fileBuffer = await connection.downloadMediaMessage(qmsg);
      } else {
        throw new Error('No se encontró el método de descarga del archivo.');
      }
    } catch (e) {
      if (mediaPath && fs.existsSync(mediaPath)) {
        try { fs.unlinkSync(mediaPath); } catch (_) {}
      }
      return reply(`❌ No se pudo descargar el archivo: ${e.message}`);
    } finally {
      if (mediaPath && fs.existsSync(mediaPath)) {
        try { fs.unlinkSync(mediaPath); } catch (_) {}
      }
    }

    const rawNumbers = await parseNumbersFromBuffer(fileBuffer, fileName);
    let validNumbers = rawNumbers.map(num => {
      let cleanNum = num.replace(/\D/g, '');
      if (cleanNum.startsWith('0')) {
        cleanNum = '62' + cleanNum.substring(1);
      } else if (cleanNum.startsWith('8')) {
        cleanNum = '62' + cleanNum;
      }
      return cleanNum;
    }).filter(num => num.length >= 10 && num.length <= 15);

    if (validNumbers.length === 0) {
      return reply('❌ No hay ningún número válido en el archivo.');
    }

    let rangeInfo = '';
    if (text) {
      const inputArg = text.trim();
      if (/^\d+-\d+$/.test(inputArg)) {
        const [start, end] = inputArg.split('-').map(Number);
        const fromIdx = Math.max(0, start - 1);
        const toIdx = Math.min(validNumbers.length, end);
        validNumbers = validNumbers.slice(fromIdx, toIdx);
        rangeInfo = ` (números ${start} - ${end})`;
      } else if (args && args.length >= 2 && !isNaN(args[0]) && !isNaN(args[1])) {
        const start = parseInt(args[0]);
        const end = parseInt(args[1]);
        const fromIdx = Math.max(0, start - 1);
        const toIdx = Math.min(validNumbers.length, end);
        validNumbers = validNumbers.slice(fromIdx, toIdx);
        rangeInfo = ` (números ${start} - ${end})`;
      } else if (!isNaN(inputArg)) {
        const maxCount = parseInt(inputArg);
        if (maxCount > 0) {
          validNumbers = validNumbers.slice(0, maxCount);
          rangeInfo = ` (máximo ${maxCount} números)`;
        }
      }
    }

    const statusMsg = await connection.sendMessage(m.chat, {
      text: `⏳ Comprobando 0/${validNumbers.length} números...\n📁 Origen: ${sourceType}`
    }, { quoted: m });

    const results = [];
    let processedCount = 0;
    const batchSize = 20;

    for (let i = 0; i < validNumbers.length; i += batchSize) {
      const batch = validNumbers.slice(i, i + batchSize);
      const batchPromises = batch.map(async (num) => {
        try {
          const jid = num + "@s.whatsapp.net";
          const [waCheck] = await connection.onWhatsApp(jid);

          if (!waCheck || !waCheck.exists) {
            return { number: num, registered: false, bio: null, setAt: null, metaBusiness: false };
          }

          let bioData = "";
          let setAt = null;
          let metaBusiness = false;

          try {
            const statusResult = await connection.fetchStatus(jid);
            let rawStatus = null;
            if (Array.isArray(statusResult) && statusResult.length > 0) {
              rawStatus = statusResult[0]?.status || statusResult[0];
            } else if (statusResult && typeof statusResult === 'object') {
              rawStatus = statusResult.status !== undefined ? statusResult.status : statusResult;
            }

            if (rawStatus && typeof rawStatus === 'object') {
              bioData = rawStatus.status !== undefined ? String(rawStatus.status) : (rawStatus.text !== undefined ? String(rawStatus.text) : "");
              if (rawStatus.setAt) {
                setAt = new Date(rawStatus.setAt);
              }
            } else if (typeof rawStatus === 'string') {
              bioData = rawStatus;
            }
          } catch (e) {
            bioData = "";
          }

          try {
            const businessCheck = await checkMetaBusiness(connection, jid);
            metaBusiness = businessCheck.isBusiness;
          } catch (e) {
            metaBusiness = false;
          }

          const jamPercentage = getJamPercentage(bioData, setAt, metaBusiness);

          return {
            number: num,
            registered: true,
            bio: bioData,
            setAt: setAt,
            metaBusiness: metaBusiness,
            jamPercentage: jamPercentage
          };
        } catch (error) {
          return { number: num, registered: false, bio: null, setAt: null, metaBusiness: false, error: true };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      processedCount += batch.length;

      const progressBar = createProgressBar(processedCount, validNumbers.length);
      try {
        await connection.sendMessage(m.chat, {
          edit: statusMsg.key,
          text: `⏳ ${progressBar} ${processedCount}/${validNumbers.length}\n📱 Sedang memproses: ${batch[0] || '...'}\n📁 Sumber: ${sourceType}`
        });
      } catch (e) {}

      if (i + batchSize < validNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const fullSourceType = `${sourceType}${rangeInfo}`;
    const filename = createBioResultFile(results, validNumbers.length, fullSourceType);

    await connection.sendMessage(m.chat, {
      document: { url: filename },
      mimetype: 'text/plain',
      fileName: `hasil_cekbio_${Date.now()}.txt`,
      caption: `📋 *RESULTADO DEL CHEQUEO DE BIOS DESDE ARCHIVO (SOLO DUEÑO)*\n\n` +
               `📊 Total: ${validNumbers.length} números\n` +
               `✅ Registrados: ${results.filter(r => r.registered).length}\n` +
               `❌ No registrados: ${results.filter(r => !r.registered).length}\n` +
               `📝 Con bio: ${results.filter(r => r.registered && r.bio && r.bio.length > 0).length}\n` +
               `🏢 Meta Business: ${results.filter(r => r.metaBusiness).length}\n` +
               `📁 Archivo: ${fileName}${rangeInfo}\n\n` +
               `🕒 ${new Date().toLocaleString('es-ES')}`
    }, { quoted: m });

    setTimeout(() => {
      try {
        if (fs.existsSync(filename)) fs.unlinkSync(filename);
      } catch (e) {}
    }, 5000);
  };

export { pluginConfig as config, handler }
