/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Sistem koin untuk biaya command sudah dinonaktifkan.
// File ini tetap mempertahankan ekspor lama agar modul lain tidak error.
export function getFeatureCost() { return 0; }
export function isUnlimitedKoin() { return false; }
export function formatKoin(value) {
  if (value === -1 || value === Infinity) return "∞";
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "∞";
  return num.toLocaleString("id-ID");
}
export function getKoinDisplay() { return "Desactivado"; }
export function isFreeCommand() { return true; }
const CASE_COMMANDS = new Set([
  "cping", "cspeed", "clatency", "lcase", "caselist", "allcase",
  "listallcase", "lplugin", "pluginlist", "allplugin", "listallplugin",
]);
export function isCaseCommand(command) {
  return CASE_COMMANDS.has(String(command || "").toLowerCase());
}
export function checkFeatureCost() {
  return { allowed: true, unlimited: false, free: true, remaining: 0, cost: 0 };
}
export function chargeFeature() {
  return { charged: false, unlimited: false, remaining: 0, cost: 0, insufficient: false };
}
