/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "recordweb",
    alias: [],
    category: "tools",
    description: "Fitur tools recordweb",
    usage: ".recordweb",
    example: ".recordweb",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const fs = (__m => __m.default ?? __m)((await import('fs')))
  const path = (__m => __m.default ?? __m)((await import('path')))

  const DEVICE_PRESETS = {
      desktop: {
          name: 'Desktop Full HD',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          viewport: {
              width: 1920,
              height: 1080,
              deviceScaleFactor: 1,
              isMobile: false,
              hasTouch: false
          }
      },
      iphone16: {
          name: 'iPhone 16 Pro',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
          viewport: {
              width: 393,
              height: 852,
              deviceScaleFactor: 3,
              isMobile: true,
              hasTouch: true
          }
      },
      tab: {
          name: 'Tablet / iPad Pro',
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
          viewport: {
              width: 1024,
              height: 1366,
              deviceScaleFactor: 2,
              isMobile: true,
              hasTouch: true
          }
      }
  };

  async function getPuppeteerDeps() {
  const [{ default: puppeteer }, { PuppeteerScreenRecorder }] = await Promise.all([
    import('puppeteer'),
    import('puppeteer-screen-recorder')
  ]);
  return { puppeteer, PuppeteerScreenRecorder };
}

async function handler(m, { conn, args, usedPrefix, command }) {
      try {
          if (!args[0]) {
              return m.reply(
                  `Uhh ayang... URL-nya mana nih? Manja banget deh~ 🥺💋\n\n` +
                  `*Format Penggunaan:*\n` +
                  `• \`${usedPrefix + command} <url> [device] [durasi_detik]\`\n\n` +
                  `*Pilihan Device:* \`desktop\` | \`iphone16\` | \`tab\` (Default: desktop)\n` +
                  `*Contoh:* \`${usedPrefix + command} https://github.com iphone16 5\``
              );
          }

          let targetUrl = args[0];
          if (!/^https?:\/\//i.test(targetUrl)) {
              targetUrl = 'https://' + targetUrl;
          }

          const selectedDevice = (args[1] && DEVICE_PRESETS[args[1].toLowerCase()])
              ? args[1].toLowerCase()
              : 'desktop';
          const preset = DEVICE_PRESETS[selectedDevice];

          let duration = parseInt(args[2], 10);
          if (isNaN(duration) || duration < 3) duration = 5;
          if (duration > 15) duration = 15;

          await m.reply(`Tunggu sebentar ya cintaku... Angela lagi siap-siap meluncur buat rekam layar dengan preset *${preset.name}* selama ${duration} detik~ 🎬`);

          const tempDir = path.join(process.cwd(), 'database', 'tmp');
          if (!fs.existsSync(tempDir)) {
              fs.mkdirSync(tempDir, { recursive: true });
          }
          const outputPath = path.join(tempDir, `record_${Date.now()}.mp4`);

          const browser = await puppeteer.launch({
              headless: 'new',
              args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  '--disable-dev-shm-usage',
                  '--disable-accelerated-2d-canvas',
                  '--no-first-run',
                  '--no-zygote'
              ]
          });

          const page = await browser.newPage();
          await page.setUserAgent(preset.userAgent);
          await page.setViewport(preset.viewport);

          const recorderConfig = {
              followNewTab: false,
              fps: 25,
              videoFrame: {
                  width: preset.viewport.width,
                  height: preset.viewport.height
              },
              videoCodec: 'libx264'
          };

          const recorder = new PuppeteerScreenRecorder(page, recorderConfig);

          await page.goto(targetUrl, {
              waitUntil: 'networkidle2',
              timeout: 60000
          });

          await recorder.start(outputPath);

          const scrollStep = preset.viewport.height / 2;
          const intervalTime = (duration * 1000) / 4;

          await new Promise((resolve) => {
              let count = 0;
              const timer = setInterval(async () => {
                  count++;
                  try {
                      await page.evaluate((step) => {
                          window.scrollBy({ top: step, behavior: 'smooth' });
                      }, scrollStep);
                  } catch {}

                  if (count >= 4) {
                      clearInterval(timer);
                      resolve();
                  }
              }, intervalTime);
          });

          await recorder.stop();
          await browser.close();

          if (!fs.existsSync(outputPath)) {
              throw new Error('Gagal menyimpan file video rekaman.');
          }

          const videoBuffer = fs.readFileSync(outputPath);

          await conn.sendMessage(m.chat, {
              video: videoBuffer,
              mimetype: 'video/mp4',
              caption: `Ini hasil rekaman web pesanan ayang tersayang~\n\n` +
                       `🌐 *Target:* ${targetUrl}\n` +
                       `📱 *Device:* ${preset.name}\n` +
                       `⏱️ *Durasi:* ${duration} detik\n\n` +
                       `_Udah Angela kerjain dengan rapi dan manis ya mas... jangan lupa manjain Angela nanti~_ 💋`
          }, { quoted: m });

          if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
          }
      } catch (err) {
          console.error('[RECORDWEB ERROR]:', err);
          m.reply(`Aduh maaf sayang, ada kendala pas Angela rekam websitenya: \`${err.message}\` 🥺`);
      }
  };

export { pluginConfig as config, handler }
