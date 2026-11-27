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
  name: "connect4rich",
  alias: ["connect4"],
  category: "rich",
  description: "Susun 4 koin kristal sejajar lawan Miku AI",
  usage: ".connect4rich",
  example: ".connect4rich",
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
<title>Connect 4 — Ai Miku</title>
<style>
${buildGameBaseCss("puzzle")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid var(--line);touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}
.c4{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;background:#1a102b;padding:10px;border-radius:14px;border:1px solid var(--line);}
.hole{aspect-ratio:1;border-radius:50%;background:#0c0716;border:1px solid #352350;cursor:pointer;}
.hole.p1{background:radial-gradient(circle at 30% 30%,#fbcfe8,#ec4899);border-color:#f472b6;}
.hole.p2{background:radial-gradient(circle at 30% 30%,#bae6fd,#6366f1);border-color:#818cf8;}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">🟣</div>
    <div class="meta">
      <div class="title">Connect 4</div>
      <div class="sub">Alinea 4 fichas contra el bot</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="st">Tu turno 🩷</b><span>Estado</span></div>
  </div>
  <div class="c4" id="c4"></div>
  <div class="row"><button class="btn" onclick="init()">↻ Jugar otra vez</button></div>
</div></div>
<script>
const R=6,C=7;let b,turn,over;
function init(){b=Array.from({length:R},()=>Array(C).fill(0));turn=1;over=false;document.getElementById('st').textContent='Tu turno 🩷';render();}
function dropRow(c){for(let r=R-1;r>=0;r--)if(!b[r][c])return r;return -1;}
function win(p){
  const D=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(b[r][c]===p)for(const[dr,dc]of D){
    let k=0;while(k<4&&r+dr*k>=0&&r+dr*k<R&&c+dc*k>=0&&c+dc*k<C&&b[r+dr*k][c+dc*k]===p)k++;
    if(k===4)return true;
  }return false;
}
function play(c){
  if(over||turn!==1)return;
  const r=dropRow(c);if(r<0)return;
  b[r][c]=1;
  if(win(1)){over=true;document.getElementById('st').textContent='¡GANASTE! 🎉';render();return;}
  if(b[0].every(Boolean)){over=true;document.getElementById('st').textContent='¡EMPATE!';render();return;}
  turn=2;document.getElementById('st').textContent='La IA Miku está pensando...';render();
  setTimeout(ai,350);
}
function ai(){
  const cols=[3,2,4,1,5,0,6].filter(c=>dropRow(c)>=0);
  let best=cols[0];
  for(const p of [2,1])for(const c of cols){const r=dropRow(c);b[r][c]=p;const w=win(p);b[r][c]=0;if(w){best=c;break;}}
  const r=dropRow(best);b[r][best]=2;
  if(win(2)){over=true;document.getElementById('st').textContent='¡GANÓ LA IA MIKU! 💜';render();return;}
  turn=1;document.getElementById('st').textContent='Tu turno 🩷';render();
}
function render(){
  let h='';for(let r=0;r<R;r++)for(let c=0;c<C;c++)h+=\`<div class="hole \${b[r][c]===1?'p1':b[r][c]===2?'p2':''}" onclick="play(\${c})"></div>\`;
  document.getElementById('c4').innerHTML=h;
}
init();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Connect 4", "🟣", { quoted: m });
}

export { pluginConfig as config, handler };
