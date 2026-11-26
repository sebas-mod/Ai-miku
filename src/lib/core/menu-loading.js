/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function progressBar(percent, size = 10) {
  const filled = Math.round((percent / 100) * size);
  return `${'▰'.repeat(filled)}${'▱'.repeat(Math.max(0, size - filled))}`;
}

export async function runMenuLoading(sock, chat, title = 'menu') {
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const first = await sock.sendMessage(chat, {
    text: `◉ *Menyiapkan ${title}...*\n\n${progressBar(0)} 0%`,
  });
  const key = first?.key;
  if (!key) return;

  for (const percent of steps.slice(1)) {
    await delay(320);
    await sock.sendMessage(chat, {
      text: `◉ *Menyiapkan ${title}...*\n\n${progressBar(percent)} ${percent}%`,
      edit: key,
    });
  }

  await delay(350);
  try {
    await sock.sendMessage(chat, { delete: key });
  } catch (e) {
    // Jika delete gagal di versi Baileys tertentu, biarkan pesan terakhir tetap ada.
  }
}
