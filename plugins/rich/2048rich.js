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
  name: "2048rich",
  alias: ["game2048"],
  category: "rich",
  description: "Une las fichas de cristal hasta 2048 deslizando o con las flechas",
  usage: ".2048rich",
  example: ".2048rich",
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
<title>Juego 2048 — Ai Miku</title>
<style>
${buildGameBaseCss("amber")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid var(--line);touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#17120d;padding:10px;border-radius:14px;border:1px solid var(--line);touch-action:none;}
.cell{aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:19px;background:#1e1430;color:#fff;}
.dpad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:210px;margin:10px auto 0;}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">✨</div>
    <div class="meta">
      <div class="title">Juego 2048</div>
      <div class="sub">Desliza o pulsa una dirección para unir los números</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="sc">0</b><span>Puntos</span></div>
    <div class="stat"><b id="hi">0</b><span>Récord</span></div>
  </div>
  <div class="grid" id="grid"></div>
  <div class="dpad">
    <div></div><button class="btn alt" onclick="mv(0)">▲</button><div></div>
    <button class="btn alt" onclick="mv(3)">◀</button><button class="btn" onclick="init()">↻</button><button class="btn alt" onclick="mv(1)">▶</button>
    <div></div><button class="btn alt" onclick="mv(2)">▼</button><div></div>
  </div>
</div></div>
<script>
const COL={0:'#1e1430',2:'#3b2358',4:'#582874',8:'#832d8d',16:'#b83280',32:'#db2777',64:'#ec4899',128:'#f472b6',256:'#a855f7',512:'#8b5cf6',1024:'#6366f1',2048:'#fbbf24'};
function lsGet(k,d){try{return localStorage.getItem(k)??d}catch{return d}}function lsSet(k,v){try{localStorage.setItem(k,v)}catch{}}
let b,sc,hi=+lsGet('el_2048_hi',0);
document.getElementById('hi').textContent=hi;
function add(){const e=[];for(let i=0;i<16;i++)if(!b[i])e.push(i);if(e.length)b[e[Math.floor(Math.random()*e.length)]]=Math.random()<.9?2:4;}
function slide(a){let f=a.filter(Boolean);for(let i=0;i<f.length-1;i++)if(f[i]===f[i+1]){f[i]*=2;sc+=f[i];f[i+1]=0;}f=f.filter(Boolean);while(f.length<4)f.push(0);return f;}
function mv(d){
  const prev=b.join(',');
  for(let i=0;i<4;i++){
    let r=[];
    for(let j=0;j<4;j++)r.push(d===0?b[j*4+i]:d===2?b[(3-j)*4+i]:d===3?b[i*4+j]:b[i*4+(3-j)]);
    r=slide(r);
    for(let j=0;j<4;j++){const idx=d===0?j*4+i:d===2?(3-j)*4+i:d===3?i*4+j:i*4+(3-j);b[idx]=r[j];}
  }
  if(b.join(',')!==prev){add();render();}
}
function render(){
  document.getElementById('sc').textContent=sc;
  if(sc>hi){hi=sc;lsSet('el_2048_hi',hi);document.getElementById('hi').textContent=hi;}
  document.getElementById('grid').innerHTML=b.map(v=>\`<div class="cell" style="background:\${COL[v]||'#fbbf24'};color:\${v>=2048?'#120c1c':'#fff'}">\${v||''}</div>\`).join('');
}
function init(){b=Array(16).fill(0);sc=0;add();add();render();}
let sx=0,sy=0;const g=document.getElementById('grid');
g.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;});
g.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.hypot(dx,dy)<18)return;if(Math.abs(dx)>Math.abs(dy))mv(dx>0?1:3);else mv(dy>0?2:0);});
init();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Game 2048", "✨", { quoted: m });
}

export { pluginConfig as config, handler };
