/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { createHash } from "crypto";

/** Convert a local audio asset to Opus so WhatsApp sends it as a Voice Note. */
export async function convertToVoiceNote(audioPath) {
  if (typeof audioPath !== "string" || !audioPath.trim()) {
    throw new Error("Path audio VN tidak valid");
  }

  const isUrl = /^https?:\/\//i.test(audioPath.trim());
  const inputPath = isUrl ? audioPath.trim() : path.resolve(audioPath);
  if (!isUrl && (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isFile())) {
    throw new Error(`File audio tidak ditemukan: ${inputPath}`);
  }

  // Hash the source so a changed sound automatically gets a fresh VN cache.
  const sourceHash = createHash("sha256")
    .update(isUrl ? inputPath : fs.readFileSync(inputPath))
    .digest("hex")
    .slice(0, 16);
  const tempDir = path.resolve(process.cwd(), "temp");
  const outputPath = path.join(tempDir, `vn-${sourceHash}.ogg`);
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
    return outputPath;
  }

  fs.mkdirSync(tempDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", inputPath,
      "-vn",
      "-c:a", "libopus",
      "-b:a", "256k",
      "-vbr", "on",
      "-compression_level", "10",
      "-ac", "2",
      "-ar", "48000",
      "-application", "voip",
      outputPath,
    ], { stdio: ["ignore", "ignore", "pipe"] });

    let errorText = "";
    ffmpeg.stderr.on("data", (chunk) => { errorText += chunk.toString(); });
    ffmpeg.once("error", (error) => {
      reject(new Error(`Gagal menjalankan FFmpeg: ${error.message}`));
    });
    ffmpeg.once("close", (code) => {
      if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
        resolve(outputPath);
      } else {
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
        reject(new Error(`Konversi VN gagal${errorText ? `: ${errorText.trim()}` : ""}`));
      }
    });
  });
}
