/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const te = ElysiaRuntime.te;
const config = ElysiaRuntime.config;
const ImageUploadService = ElysiaRuntime.ImageUploadService;

  const pluginConfig = {
    name: "fake-tweet",
    alias: ["ftweet", "tweetfake"],
    category: "maker",
    description: "Buat tweet palsu untuk hiburan",
    usage: ".fake-tweet | nama | username | teks",
    example:
      ".fake-tweet | Penguin Torvalds | linux_enjoyer | Just setting up my twttr",
    cooldown: 15,
    energi: 1,
    isEnabled: true,
  };

  const API = "https://api.obscuraworks.org/api/maker/tweet";
  const KEY = config.APIkey.obscura;

  async function handler(m, { sock }) {
    const raw = m.text?.trim();
    if (!raw || !raw.includes("|")) {
      return m.reply(
        `🐦 *TUIT FALSO*\n\n` +
          `- Crea tuits falsos para entretenerte 😂\n` +
          `- |Separa el formato con ||\n\n` +
          `- Puedes responder a una imagen` +
          `\`${m.prefix}fake-tweet | Nombre | Usuario || Texto del tweet\``,
      );
    }

    const parts = raw.split("|").map((s) => s.trim());
    if (parts.length < 4) {
      return m.reply(
        `🐦 *FORMATO INCOMPLETO*\n\n` + `- Necesita: Nombre | Usuario | Texto del tweet`,
      );
    }

    m.react("🕕");

    try {
      const avatar =
        m.isImage || m.quoted?.isImage
          ? await uploadPhoto(m)
          : await sock?.profilePictureUrl?.(m.sender, "image") || "https://img1.pixhost.to/images/10801/670256545_upload.jpg"

      const body = {
        text: parts[3],
        avatar,
        name: parts[1],
        username: parts[2],
        theme: "dim",
        verified: "true",
        retweets: "0",
        likes: "0",
        client: "Twitter for iPhone",
      };

      const r = await fetch(API, {
        method: "POST",
        headers: {
          Accept: "application/json, image/*, audio/*, video/*",
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const buf = Buffer.from(await r.arrayBuffer());

      m.react("✅");
      await sock.sendMedia(m.chat, buf, null, m, { type: "image" });
    } catch (e) {
      console.log(e);
      m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  async function uploadPhoto(m) {
    try {
      const service = new ImageUploadService("pixhost.to");
      const b = m.quoted?.isMedia
        ? await m.quoted.download()
        : await m.download();
      let { directLink } = await service.uploadFromBinary(b, "img.jpg");
      return directLink;
    } catch {}
  }

export { pluginConfig as config, handler }
