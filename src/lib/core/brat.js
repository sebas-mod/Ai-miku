/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { createCanvas } from "@napi-rs/canvas";

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth || !line) line = test;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Gambar teks gaya "brat": teks rata tengah, ukuran font menyesuaikan area.
 * @returns {Promise<Buffer>} PNG
 */
export async function drawBrat({
  text = "",
  bgColor = "#ffffff",
  textColor = "#000000",
  width = 512,
  height = 512,
  maxWidth = 450,
  maxHeight = 450,
  centerX = width / 2,
  centerY = height / 2,
  maxFontSize = 130,
  fontDecrement = 5,
  lineHeightMult = 1.1,
  fontFamily = "Arial Narrow, Arial, sans-serif",
} = {}) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const step = Math.max(1, fontDecrement);
  let size = maxFontSize;
  let lines = [];
  for (; size >= 10; size -= step) {
    ctx.font = `${size}px ${fontFamily}`;
    lines = wrapLines(ctx, text, maxWidth);
    const tooWide = lines.some((l) => ctx.measureText(l).width > maxWidth);
    if (!tooWide && lines.length * size * lineHeightMult <= maxHeight) break;
  }
  ctx.font = `${Math.max(size, 10)}px ${fontFamily}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lineHeight = Math.max(size, 10) * lineHeightMult;
  const top = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, centerX, top + i * lineHeight));
  return canvas.toBuffer("image/png");
}

export default { drawBrat };
