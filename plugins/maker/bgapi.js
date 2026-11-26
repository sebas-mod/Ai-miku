/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage } from '@napi-rs/canvas';

const pluginConfig = {
    name: "bgapi",
    alias: [],
    category: "maker",
    description: "bgapi",
    usage: ".bgapi",
    example: ".bgapi",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const BACKGROUND_URL = 'https://raw.githubusercontent.com/sahrilcode/cdn3/main/uploads/648fda-1791629493946.jpg';

  async function removeBgNet(buffer) {
  	const blob = new Blob([buffer], { type: 'image/png' });
  	const form = new FormData();
  	form.append('image', blob, 'image.png');
  	form.append('format', 'png');
  	form.append('model', 'v1');

  	const res = await fetch('https://api2.pixelcut.app/image/matte/v1', {
  		method: 'POST',
  		headers: {
  			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  			'x-client-version': 'web:pixa.com:4a5b0af2'
  		},
  		body: form
  	});

  	if (!res.ok) throw new Error(`Status ${res.status}`);
	return Buffer.from(await res.arrayBuffer());
  }

  async function handler(m, { sock, qmsg, mime, reply, usedPrefix, command }) {
  	const isMedia = /image|sticker/.test(mime || '');

  	if (!isMedia) {
  		return reply(`❌ *Cómo usar:*\nEnvía o responde con una imagen/sticker con *${usedPrefix + command}*`);
  	}

  	await sock.sendMessage(m.chat, { react: { text: '🕒', key: m.key } }).catch(() => null);

  	let mediaBuffer;
  	try {
  		mediaBuffer = await qmsg.download();
  	} catch (_) {}

  	if (!mediaBuffer) {
  		await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
  		return reply('❌ No se pudo descargar la imagen/sticker.');
  	}

  	let transparentBuffer;
  	try {
  		transparentBuffer = await removeBgNet(mediaBuffer);
  	} catch (err) {
  		transparentBuffer = mediaBuffer;
  	}

  	let targetImg;
  	let bgImg;
  	try {
  		targetImg = await loadImage(transparentBuffer);
  		bgImg = await loadImage(BACKGROUND_URL);
  	} catch (e) {
  		await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
  		return reply('❌ No se pudo cargar la imagen/fondo.');
  	}

  	const canvasWidth = bgImg.width;
  	const canvasHeight = bgImg.height;

  	const canvas = createCanvas(canvasWidth, canvasHeight);
  	const ctx = canvas.getContext('2d');

  	ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

  	let scale;
  	const isPortrait = targetImg.height > targetImg.width;

  	if (isPortrait) {
  		scale = canvasHeight / targetImg.height;
  	} else {
  		scale = (canvasWidth * 0.75) / targetImg.width;
  	}

  	let fgWidth = targetImg.width * scale;
  	let fgHeight = targetImg.height * scale;

  	if (fgWidth > canvasWidth * 0.85) {
  		scale = (canvasWidth * 0.85) / targetImg.width;
  		fgWidth = targetImg.width * scale;
  		fgHeight = targetImg.height * scale;
  	}

  	let fgX = canvasWidth - fgWidth;
  	let fgY = canvasHeight - fgHeight;

  	ctx.drawImage(targetImg, fgX, fgY, fgWidth, fgHeight);

  	const buffer = canvas.toBuffer('image/png');

  	await sock.sendMessage(m.chat, { image: buffer }, { quoted: m });
  	await sock.sendMessage(m.chat, { react: { text: '💥', key: m.key } }).catch(() => null);
  };

export { pluginConfig as config, handler }
