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
  name: "pongrich",
  alias: ["pingpongrich"],
  category: "rich",
  description: "Duel ping-pong kristal lawan AI (pertama mencapai 7 poin menang)",
  usage: ".pongrich",
  example: ".pongrich",
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
<title>Ping Pong AI — Ai Miku</title>
<style>
${buildGameBaseCss("arcade")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#070f1d;border:1px solid var(--line);touch-action:none;}
.ctrl{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;margin-top:10px;}
.cbtn{
  border:1px solid var(--line);border-radius:12px;padding:13px 10px;
  background:var(--card2);color:#fff;font-size:16px;font-weight:800;
  cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none;
}
.cbtn:active,.cbtn.on{background:var(--acc);color:#041524;border-color:var(--acc);}
.rbtn{
  border:0;border-radius:12px;padding:13px 14px;
  background:linear-gradient(135deg,var(--acc),var(--acc2));color:#041524;
  font-size:14px;font-weight:800;cursor:pointer;
}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">🏓</div>
    <div class="meta">
      <div class="title">Ping Pong AI</div>
      <div class="sub">Pulsa ◀ ▶ o desliza la pantalla; el primero en llegar a 7 gana</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="p1">0</b><span>Tú</span></div>
    <div class="stat"><b id="p2">0</b><span>Miku AI</span></div>
  </div>
  <canvas id="cv" width="320" height="340"></canvas>
  <div class="ctrl">
    <button class="cbtn" id="btnL" type="button">◀ Kiri</button>
    <button class="rbtn" id="btnRst" type="button" onclick="reset()">↻</button>
    <button class="cbtn" id="btnR" type="button">Kanan ▶</button>
  </div>
</div></div>
<script>
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'),W=320,H=340;
const btnL=document.getElementById('btnL'),btnR=document.getElementById('btnR');
let px=120,ax=120,bx=160,by=170,vx=3.0,vy=3.6,s1=0,s2=0,over=false;
let moveDir=0;

function serve(d){bx=W/2;by=H/2;vx=(Math.random()>.5?1:-1)*3.0;vy=d*3.6;}
function reset(){s1=0;s2=0;over=false;px=120;ax=120;moveDir=0;serve(1);upd();}
function upd(){document.getElementById('p1').textContent=s1;document.getElementById('p2').textContent=s2;}
function moveTo(x){const r=cv.getBoundingClientRect();px=Math.max(0,Math.min(W-80,(x-r.left)*(W/r.width)-40));}

function bindHold(btn,dir){
  const start=e=>{e.preventDefault();moveDir=dir;btn.classList.add('on');px=Math.max(0,Math.min(W-80,px+dir*10));};
  const stop=e=>{if(e)e.preventDefault();if(moveDir===dir)moveDir=0;btn.classList.remove('on');};
  btn.addEventListener('pointerdown',start,{passive:false});
  btn.addEventListener('pointerup',stop,{passive:false});
  btn.addEventListener('pointercancel',stop,{passive:false});
  btn.addEventListener('pointerleave',stop,{passive:false});
  btn.addEventListener('touchstart',start,{passive:false});
  btn.addEventListener('touchend',stop,{passive:false});
  btn.addEventListener('touchcancel',stop,{passive:false});
}
bindHold(btnL,-1);
bindHold(btnR,1);

document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')moveDir=-1;if(e.key==='ArrowRight')moveDir=1;});
document.addEventListener('keyup',e=>{if((e.key==='ArrowLeft'&&moveDir===-1)||(e.key==='ArrowRight'&&moveDir===1))moveDir=0;});
cv.addEventListener('touchmove',e=>{e.preventDefault();moveTo(e.touches[0].clientX);},{passive:false});
cv.addEventListener('mousemove',e=>moveTo(e.clientX));

function tick(){
  if(!over){
    if(moveDir!==0){px=Math.max(0,Math.min(W-80,px+moveDir*6));}
    bx+=vx;by+=vy;
    if(bx<8||bx>W-8){vx*=-1;bx=Math.max(8,Math.min(W-8,bx));}
    ax+=(bx-40-ax)*0.085;ax=Math.max(0,Math.min(W-80,ax));
    if(by>H-26&&by<H-12&&bx>px-4&&bx<px+84&&vy>0){
      vy=-Math.min(7.2,Math.abs(vy)*1.03);
      vx=Math.max(-5.5,Math.min(5.5,vx+((bx-(px+40))/40)*1.5));
    }
    if(by<26&&by>12&&bx>ax-4&&bx<ax+84&&vy<0){
      vy=Math.min(7.2,Math.abs(vy)*1.03);
      vx=Math.max(-5.5,Math.min(5.5,vx+((bx-(ax+40))/40)*1.3));
    }
    if(by>H){s2++;upd();if(s2>=7)over=true;else serve(-1);}
    if(by<0){s1++;upd();if(s1>=7)over=true;else serve(1);}
  }
  ctx.fillStyle='#070f1d';ctx.fillRect(0,0,W,H);
  ctx.setLineDash([6,6]);ctx.strokeStyle='rgba(56,189,248,.25)';ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#f43f5e';ctx.fillRect(ax,14,80,10);
  ctx.fillStyle='#38bdf8';ctx.fillRect(px,H-24,80,10);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx,by,7,0,Math.PI*2);ctx.fill();
  if(over){
    ctx.fillStyle='rgba(7,15,29,.82)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.textAlign='center';
    ctx.fillText(s1>=7?'¡GANASTE! 🎉':'¡GANÓ LA IA MIKU!',W/2,H/2-6);
    ctx.fillStyle='#38bdf8';ctx.font='13px sans-serif';
    ctx.fillText('Pulsa ↻ para jugar otra vez',W/2,H/2+20);
  }
  requestAnimationFrame(tick);
}
reset();tick();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Ping Pong AI", "🏓", { quoted: m });
}

export { pluginConfig as config, handler };
