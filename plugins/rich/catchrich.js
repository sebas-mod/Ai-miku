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
  name: "catchrich",
  alias: ["tangkapbintang"],
  category: "rich",
  description: "¡Atrapa las estrellas de sakura que caen y esquiva los meteoros oscuros!",
  usage: ".catchrich",
  example: ".catchrich",
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
<title>Atrapa Estrellas — Ai Miku</title>
<style>
${buildGameBaseCss("sky")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid var(--line);touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}

</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">🌠</div>
    <div class="meta">
      <div class="title">Atrapa Estrellas</div>
      <div class="sub">¡Mueve la cesta y esquiva las bombas!</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="sc">0</b><span>Puntos</span></div>
    <div class="stat"><b id="hp">❤️❤️❤️</b><span>Vidas</span></div>
    <div class="stat"><b id="hi">0</b><span>Récord</span></div>
  </div>
  <canvas id="cv" width="320" height="360"></canvas>
  <div class="row"><button class="btn" id="sbtn" onclick="startGame()">▶ Empezar</button></div>
</div></div>
<script>
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'),W=320,H=360;
function lsGet(k,d){try{return localStorage.getItem(k)??d}catch{return d}}function lsSet(k,v){try{localStorage.setItem(k,v)}catch{}}
let px=125,items=[],sc=0,hp=3,hi=+lsGet('el_catch_hi',0),fr=0,on=false;
const sbtn=document.getElementById('sbtn');
document.getElementById('hi').textContent=hi;
function drawIdle(){ctx.fillStyle='#070d1f';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#38bdf8';ctx.fillRect(px,cv.height-22,56,10);ctx.fillStyle='#fff';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('Toca ▶ Empezar para jugar',cv.width/2,cv.height/2);}
function startGame(){if(on)return;on=true;items=[];sc=0;hp=3;fr=0;sbtn.disabled=true;sbtn.style.opacity='.45';sbtn.textContent='🎮 Jugando...';upd();tick();}
function upd(){document.getElementById('sc').textContent=sc;document.getElementById('hp').textContent='❤️'.repeat(Math.max(0,hp))||'💀';if(sc>hi){hi=sc;lsSet('el_catch_hi',hi);document.getElementById('hi').textContent=hi;}}
function moveTo(x){const r=cv.getBoundingClientRect();px=Math.max(0,Math.min(W-70,(x-r.left)*(W/r.width)-35));}
cv.addEventListener('touchmove',e=>{e.preventDefault();moveTo(e.touches[0].clientX);},{passive:false});
cv.addEventListener('mousemove',e=>moveTo(e.clientX));
function tick(){
  ctx.fillStyle='#070d1f';ctx.fillRect(0,0,W,H);
  if(hp>0){
    fr++;if(fr%34===0)items.push({x:20+Math.random()*(W-40),y:-10,vy:2.4+sc/180,bad:Math.random()<.28});
    items.forEach(it=>{it.y+=it.vy;});
    items=items.filter(it=>{
      if(it.y>H-32&&it.y<H-10&&it.x>px&&it.x<px+70){if(it.bad)hp--;else sc+=10;upd();return false;}
      return it.y<H+10;
    });
  }
  ctx.fillStyle='#38bdf8';ctx.fillRect(px,H-24,70,12);
  ctx.font='20px sans-serif';ctx.textAlign='center';
  items.forEach(it=>ctx.fillText(it.bad?'☄️':'🌸',it.x,it.y));
  if(hp<=0){ctx.fillStyle='rgba(12,7,22,.8)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.fillText('FIN DEL JUEGO • '+sc,W/2,H/2);}
  requestAnimationFrame(tick);
}
upd();drawIdle();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Atrapa la Estrella", "🌠", { quoted: m });
}

export { pluginConfig as config, handler };
