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
    name: "cekbio",
    alias: ["bio"],
    category: "tools",
    description: "cekbio <nomor>",
    usage: ".cekbio <nomor>",
    example: ".cekbio <nomor>",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const fs = (__m => __m.default ?? __m)((await import('fs')))
  const { getJamPercentage, createProgressBar, checkMetaBusiness, createBioResultFile } = (await elysiaLib('cekbio'))

  async function handler(m, { sock, conn, text, reply }) {
    const connection = sock || conn;

    if (!text) {
      return reply('❌ Format salah!\n\n*ᴄᴏɴᴛᴏʜ:*\n.cekbio 628123456789 628987654321');
    }

    const rawNumbers = text.split(/[\s,\n]+/).filter(num => num.trim().length > 0);
    const validNumbers = rawNumbers.map(num => {
      let cleanNum = num.replace(/\D/g, '');
      if (cleanNum.startsWith('0')) {
        cleanNum = '62' + cleanNum.substring(1);
      } else if (cleanNum.startsWith('8')) {
        cleanNum = '62' + cleanNum;
      }
      return cleanNum;
    }).filter(num => num.length >= 10 && num.length <= 15);

    if (validNumbers.length === 0) {
      return reply('❌ Tidak ada nomor yang valid untuk dicek.');
    }

    const statusMsg = await connection.sendMessage(m.chat, {
      text: `⏳ Memulai pengecekan 0/${validNumbers.length} nomor...\n📁 Sumber: Input Teks`
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
          text: `⏳ ${progressBar} ${processedCount}/${validNumbers.length}\n📱 Sedang memproses: ${batch[0] || '...'}\n📁 Sumber: Input Teks`
        });
      } catch (e) {}

      if (i + batchSize < validNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const filename = createBioResultFile(results, validNumbers.length, 'Input Teks');

    await connection.sendMessage(m.chat, {
      document: { url: filename },
      mimetype: 'text/plain',
      fileName: `hasil_cekbio_${Date.now()}.txt`,
      caption: `📋 *HASIL CEK BIO WHATSAPP (OWNER ONLY)*\n\n` +
               `📊 Total: ${validNumbers.length} nomor\n` +
               `✅ Terdaftar: ${results.filter(r => r.registered).length}\n` +
               `❌ Tidak terdaftar: ${results.filter(r => !r.registered).length}\n` +
               `📝 Dengan bio: ${results.filter(r => r.registered && r.bio && r.bio.length > 0).length}\n` +
               `🏢 Meta Business: ${results.filter(r => r.metaBusiness).length}\n\n` +
               `🕒 ${new Date().toLocaleString('id-ID')}`
    }, { quoted: m });

    setTimeout(() => {
      try {
        if (fs.existsSync(filename)) fs.unlinkSync(filename);
      } catch (e) {}
    }, 5000);
  };

export { pluginConfig as config, handler }
