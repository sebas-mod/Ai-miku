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
  name: "whackrich",
  alias: ["pukulslime"],
  category: "rich",
  description: "Golpea al slime de cristal lo más rápido posible durante 30 segundos, ¡esquiva las bombas!",
  usage: ".whackrich",
  example: ".whackrich",
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
<title>Pukul Slime — Ai Miku</title>
<style>
${buildGameBaseCss("snake")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid #22543d;border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid #22543d;touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}
.holes{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:4px;}
.h{aspect-ratio:1;border-radius:16px;background:var(--card);border:1px solid #22543d;display:flex;align-items:center;justify-content:center;font-size:34px;cursor:pointer;user-select:none;transition:.1s;}
.h:active{transform:scale(.92);border-color:var(--acc);}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">🔨</div>
    <div class="meta">
      <div class="title">Pukul Slime</div>
      <div class="sub">¡Golpea a los slime y esquiva las bombas!</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="sc">0</b><span>Puntos</span></div>
    <div class="stat"><b id="tm">30</b><span>Segundos</span></div>
    <div class="stat"><b id="hi">0</b><span>Récord</span></div>
  </div>
  <div class="holes" id="holes"></div>
  <div class="row"><button class="btn" id="sbtn" onclick="start()">▶ Empezar (30 s)</button></div>
</div></div>
<script>
function lsGet(k,d){try{return localStorage.getItem(k)??d}catch{return d}}function lsSet(k,v){try{localStorage.setItem(k,v)}catch{}}
let sc=0,tm=30,hi=+lsGet('el_whack_hi',0),items=Array(9).fill(''),t1=null,t2=null,on=false;
const sbtn=document.getElementById('sbtn');
document.getElementById('hi').textContent=hi;
function draw(){document.getElementById('holes').innerHTML=items.map((v,i)=>\`<div class="h" style="opacity:\${on?1:.45};pointer-events:\${on?'auto':'none'}" onclick="hit(\${i})">\${v}</div>\`).join('');}
function hit(i){
  if(!on)return;
  const v=items[i];if(!v)return;items[i]='';
  if(v==='🩷')sc+=10;else if(v==='🌟')sc+=30;else if(v==='💣')sc=Math.max(0,sc-20);
  document.getElementById('sc').textContent=sc;
  if(sc>hi){hi=sc;lsSet('el_whack_hi',hi);document.getElementById('hi').textContent=hi;}
  draw();
}
function spawn(){
  items=Array(9).fill('');
  const n=1+Math.floor(Math.random()*2);
  for(let k=0;k<n;k++){const i=Math.floor(Math.random()*9);const r=Math.random();items[i]=r<.18?'💣':r<.38?'🌟':'🩷';}
  draw();
}
function start(){
  if(on)return;
  clearInterval(t1);clearInterval(t2);
  on=true;sc=0;tm=30;
  sbtn.disabled=true;sbtn.style.opacity='.45';sbtn.textContent='⏳ Jugando...';
  document.getElementById('sc').textContent=0;document.getElementById('tm').textContent=30;
  spawn();t1=setInterval(spawn,700);
  t2=setInterval(()=>{
    tm--;document.getElementById('tm').textContent=tm;
    if(tm<=0){
      on=false;clearInterval(t1);clearInterval(t2);
      items=Array(9).fill('');draw();
      sbtn.disabled=false;sbtn.style.opacity='1';sbtn.textContent='↻ Jugar otra vez';
    }
  },1000);
}
draw();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Pukul Slime", "🔨", { quoted: m });
}

export { pluginConfig as config, handler };
