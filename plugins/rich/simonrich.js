/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { sendHtmlCard, buildGameBaseCss } from "../../src/lib/features/rich-engine.js";

const pluginConfig = {
  name: "simonrich",
  alias: ["simon"],
  category: "rich",
  description: "Sigue la secuencia de luces de cristal, cada vez más larga en cada nivel",
  usage: ".simonrich",
  example: ".simonrich",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

function buildHtml() {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>Recuerda el patrón de colores — Ai Miku</title>
<style>
${buildGameBaseCss("studio")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid var(--line);touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}
.pads{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:6px 0;}
.pad{aspect-ratio:1.15;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;opacity:.55;transition:.15s;border:2px solid transparent;}
.p0{background:#db2777;}.p1{background:#7e22ce;}.p2{background:#2563eb;}.p3{background:#d97706;}
.pad.lit{opacity:1;transform:scale(1.03);border-color:#fff;box-shadow:0 0 22px rgba(255,255,255,.5);}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">💡</div>
    <div class="meta">
      <div class="title">Recuerda el patrón de colores</div>
      <div class="sub">Ingat lalu ulangi urutan warnanya</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="lv">0</b><span>Nivel</span></div>
    <div class="stat"><b id="hi">0</b><span>Récord</span></div>
    <div class="stat"><b id="st">Siap</b><span>Status</span></div>
  </div>
  <div class="pads">
    <div class="pad p0" id="p0" onclick="tap(0)">🌸</div>
    <div class="pad p1" id="p1" onclick="tap(1)">🔮</div>
    <div class="pad p2" id="p2" onclick="tap(2)">💎</div>
    <div class="pad p3" id="p3" onclick="tap(3)">⭐</div>
  </div>
  <div class="row"><button class="btn" id="sbtn" onclick="start()">▶ Empezar</button></div>
</div></div>
<script>
function lsGet(k,d){try{return localStorage.getItem(k)??d}catch{return d}}function lsSet(k,v){try{localStorage.setItem(k,v)}catch{}}
let seq=[],idx=0,lock=true,on=false,hi=+lsGet('el_simon_hi',0);
const sbtn=document.getElementById('sbtn');
function setPads(en){
  [0,1,2,3].forEach(i=>{
    const p=document.getElementById('p'+i);
    p.style.pointerEvents=en?'auto':'none';
    p.style.opacity=en?'1':'.45';
  });
}
setPads(false);
document.getElementById('hi').textContent=hi;
const flash=(i,ms=360)=>new Promise(r=>{
  const el=document.getElementById('p'+i);
  const prevOp=el.style.opacity;
  el.style.opacity='1';
  el.classList.add('lit');
  setTimeout(()=>{
    el.classList.remove('lit');
    el.style.opacity=prevOp;
    setTimeout(r,140);
  },ms);
});
async function nextRound(){
  lock=true;setPads(false);idx=0;seq.push(Math.floor(Math.random()*4));
  document.getElementById('lv').textContent=seq.length;
  document.getElementById('st').textContent='Lihat...';
  for(const c of seq)await flash(c);
  document.getElementById('st').textContent='Giliranmu!';
  lock=false;setPads(true);
}
async function tap(i){
  if(lock||!on)return;
  await flash(i,180);
  if(i!==seq[idx]){
    lock=true;on=false;setPads(false);
    document.getElementById('st').textContent='¡Fallaste! 💀';
    sbtn.disabled=false;sbtn.style.opacity='1';sbtn.textContent='↻ Jugar otra vez';
    return;
  }
  idx++;
  if(idx===seq.length){
    lock=true;setPads(false);
    if(seq.length>hi){hi=seq.length;lsSet('el_simon_hi',hi);document.getElementById('hi').textContent=hi;}
    setTimeout(nextRound,450);
  }
}
function start(){
  if(on)return;
  on=true;sbtn.disabled=true;sbtn.style.opacity='.45';sbtn.textContent='🎮 Jugando...';
  seq=[];nextRound();
}
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Recuerda el patrón de colores", "💡", { quoted: m });
}

export { pluginConfig as config, handler };
