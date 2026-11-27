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
  name: "sudokurich",
  alias: ["sudoku"],
  category: "rich",
  description: "Sudoku 9x9 interactivo con comprobación automática y botón de pista",
  usage: ".sudokurich",
  example: ".sudokurich",
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
<title>Sudoku 9x9 — Ai Miku</title>
<style>
${buildGameBaseCss("puzzle")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid var(--line);touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}
.sg{display:grid;grid-template-columns:repeat(9,1fr);gap:2px;background:#3f2b5c;padding:4px;border-radius:12px;}
.sc{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;background:#181026;color:#f472b6;cursor:pointer;}
.sc.fix{background:#231638;color:#fff;}
.sc.sel{background:#4c1d57;outline:2px solid #f472b6;}
.sc.bad{color:#fb7185;background:#3b1224;}
.nums{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:9px;}
.nb{padding:8px 0;border-radius:9px;border:1px solid var(--line);background:var(--card);color:#fff;font-weight:800;font-size:14px;cursor:pointer;}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">🔢</div>
    <div class="meta">
      <div class="title">Sudoku 9x9</div>
      <div class="sub">Rellena las casillas del 1 al 9 sin repetir números</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="st">Jugar</b><span>Estado</span></div>
    <div class="stat"><b id="tm">00:00</b><span>Tiempo</span></div>
  </div>
  <div class="sg" id="sg"></div>
  <div class="nums" id="nums"></div>
  <div class="row"><button class="btn alt" onclick="hint()">💡 Pista</button><button class="btn" onclick="newGame()">↻ Nuevo</button></div>
</div></div>
<script>
const BASE="534678912672195348198342567859761423426853791713924856961537284287419635345286179";
let sol=[],cur=[],fix=[],sel=-1,sec=0,tmr=null;
function newGame(){
  const map=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-.5);
  sol=[...BASE].map(c=>map[+c-1]);
  cur=[...sol];fix=Array(81).fill(true);
  let rem=42;while(rem>0){const i=Math.floor(Math.random()*81);if(cur[i]){cur[i]=0;fix[i]=false;rem--;}}
  sel=-1;sec=0;clearInterval(tmr);
  tmr=setInterval(()=>{sec++;document.getElementById('tm').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');},1000);
  document.getElementById('st').textContent='Jugar';render();
}
function render(){
  document.getElementById('sg').innerHTML=cur.map((v,i)=>{
    const bad=v&&v!==sol[i];
    return \`<div class="sc \${fix[i]?'fix':''} \${i===sel?'sel':''} \${bad?'bad':''}" onclick="pick(\${i})">\${v||''}</div>\`;
  }).join('');
  if(cur.every((v,i)=>v===sol[i])){document.getElementById('st').textContent='¡COMPLETADO! 🎉';clearInterval(tmr);}
}
function pick(i){if(!fix[i]){sel=i;render();}}
function put(n){if(sel<0||fix[sel])return;cur[sel]=n;render();}
function hint(){const e=cur.map((v,i)=>v!==sol[i]?i:-1).filter(i=>i>=0);if(!e.length)return;const i=e[Math.floor(Math.random()*e.length)];cur[i]=sol[i];render();}
document.getElementById('nums').innerHTML=[1,2,3,4,5,6,7,8,9,0].map(n=>\`<button class="nb" onclick="put(\${n})">\${n||'⌫'}</button>\`).join('');
newGame();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Sudoku 9x9", "🔢", { quoted: m });
}

export { pluginConfig as config, handler };
