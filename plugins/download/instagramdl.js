/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const sendAlbum = MikuRuntime.sendAlbum;
const igDownloadAuto = MikuRuntime.igDownloadAuto;
const JHICog = MikuRuntime.JHICog;

  const pluginConfig = {
    name: "instagramdl",
    alias: [],
    category: "download",
    description: "Download video/foto Instagram (URL, story, posts, reels, highlights)",
    usage: ".instagramdl <url | username [mode]>",
    example: ".instagramdl https://www.instagram.com/reel/xxx",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true,
  };

  const IG_REGEX = /instagram\.com\/(p|reel|reels|stories|tv)\//i;
  const MODES = ['profile', 'posts', 'reels', 'stories', 'highlights', 'highlightstories'];
  const MAX_ITEMS = 10;

  async function sendMedia(sock, m, kind, url, caption) {
    const content = kind === "video" ? { video: { url }, caption } : { image: { url }, caption };
    await sock.sendMessage(m.chat, content, { quoted: m });
  }

  async function handler(m, { sock }) {
    const raw = (m.text || '').trim();

    if (!raw) {
      return m.reply(
        `📸 *INSTAGRAM DESCARGADOR*\n\n` +
          `> \`${m.prefix}instagramdl <url>\`\n` +
          `> \`${m.prefix}instagramdl <nombre de usuario> [modo]\`\n\n` +
          `*EJEMPLO:*\n` +
          `> \`${m.prefix}instagramdl https://www.instagram.com/reel/xxx\`\n` +
          `> \`${m.prefix}instagramdl jkt48.fiony stories\`\n\n` +
          `*MODO:* ${MODES.join(', ')}`,
      );
    }

    await m.react("🕕");

    try {
      if (/instagram\.com/i.test(raw)) {
        if (!IG_REGEX.test(raw)) {
          await m.react("❌");
          return m.reply(`❌ URL no válida. Usa un enlace de Instagram (reel/post/story).`);
        }

        const result = await igDownloadAuto(raw, 'fastdl');
        const isStory = raw.includes("/stories/");
        let caption = `📸 *Instagram ${isStory ? "Story" : "Downloader"}*\n\n`;
        if (result.author && result.author !== "unknown") caption += `👤 *Author*: @${result.author}\n`;
        if (result.caption) caption += `📝 *Caption*:\n${result.caption}\n`;
        caption = caption.trim();

        if (result.media.length > 1) {
          await sendAlbum(sock, m.chat, result.media.map((it, i) => ({
            type: it.type === "Video" ? "video" : "image",
            url: it.url,
            caption: i === 0 ? caption : ''
          })), { quoted: m });
          await m.react("✅");
          return;
        }

        for (const item of result.media) {
          await sendMedia(sock, m, item.type === "Video" ? "video" : "image", item.url, caption);
          caption = "";
        }
        await m.react("✅");
        return;
      }

      const [uname, modeRaw, extraId] = raw.split(/\s+/);
      const mode = (modeRaw || 'stories').toLowerCase();
      if (!MODES.includes(mode)) {
        await m.react("❌");
        return m.reply(`❌ Modo desconocido.\n\n*Modos:* ${MODES.join(', ')}`);
      }

      const res = await JHICog(mode, uname, extraId);
      if (!res.status) throw new Error(res.error || 'Error al obtener los datos');

      const items = res.data.items || [];
      if (!items.length) {
        await m.react("❌");
        return m.reply(`❌ No hay ${mode} para @${res.data.username}.`);
      }

      if (mode === 'profile') {
        const p = items[0];
        const cap = `👤 *@${p.username}*\n` +
          `📛 ${p.full_name || '-'}\n` +
          `📝 ${p.bio || '-'}\n\n` +
          `📸 Post: ${p.posts}\n👥 Followers: ${p.followers}\n➡️ Following: ${p.following}`;
        if (p.profile_pic_hd || p.profile_pic) await sendMedia(sock, m, "image", p.profile_pic_hd || p.profile_pic, cap);
        else await m.reply(cap);
        await m.react("✅");
        return;
      }

      if (mode === 'highlights') {
        const list = items.map((h, i) => `${i + 1}. *${h.title || '-'}*\n   ID: \`${h.id}\``).join('\n');
        await m.reply(`✨ *Highlights @${res.data.username}*\n\n${list}\n\n> Obtén contenido: \`${m.prefix}instagramdl ${res.data.username} highlightstories <ID>\``);
        await m.react("✅");
        return;
      }

      const flat = [];
      let count = 0;
      for (const it of items) {
        if (count >= MAX_ITEMS) break;
        for (const g of [it, ...(it.carousel || [])]) {
          const vid = g.video_hd_url || g.video_url;
          const img = g.image_hd_url || g.image_url;
          if (vid) flat.push({ type: 'video', url: vid, caption: g.caption || '' });
          else if (img) flat.push({ type: 'image', url: img, caption: g.caption || '' });
        }
        count++;
      }
      if (!flat.length) throw new Error('No hay contenido para enviar');
      flat[0].caption = `📸 *Instagram ${mode}* @${res.data.username}\n📦 Total: ${items.length}${items.length > MAX_ITEMS ? ` (enviados ${MAX_ITEMS})` : ''}`;
      await sendAlbum(sock, m.chat, flat, { quoted: m });
      await m.react("✅");
    } catch (err) {
      await m.react("❌");
      return m.reply(`❌ *ERROR AL DESCARGAR*\n\n> ${err.message}`);
    }
  }

export { pluginConfig as config, handler }
