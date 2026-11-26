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
  name: "snakerich",
  alias: ["ularkristal"],
  category: "rich",
  description: "Game ular neon khas Miku dengan kontrol swipe/D-pad & rekor skor",
  usage: ".snakerich",
  example: ".snakerich",
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
<title>Snake Classic — Ai Miku</title>
<style>
${buildGameBaseCss("snake")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid var(--line);touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}
.dpad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:210px;margin:10px auto 0;}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">🐍</div>
    <div class="meta">
      <div class="title">Snake Classic</div>
      <div class="sub">Swipe / tekan arah untuk main</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="sc">0</b><span>Skor</span></div>
    <div class="stat"><b id="hi">0</b><span>Rekor</span></div>
    <div class="stat"><b id="lv">1</b><span>Level</span></div>
  </div>
  <canvas id="cv" width="320" height="320"></canvas>
  <div class="dpad">
    <div></div><button class="btn alt" onclick="setDir(0,-1)">▲</button><div></div>
    <button class="btn alt" onclick="setDir(-1,0)">◀</button><button class="btn" onclick="reset()">↻</button><button class="btn alt" onclick="setDir(1,0)">▶</button>
    <div></div><button class="btn alt" onclick="setDir(0,1)">▼</button><div></div>
  </div>
</div></div>
<script>
function lsGet(k,d){try{return localStorage.getItem(k)??d}catch{return d}}function lsSet(k,v){try{localStorage.setItem(k,v)}catch{}}
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'),G=16,S=cv.width/G;
let snake,dir,ndir,food,bonus,score,best=+lsGet('el_snake_hi',0),dead,t=null;
document.getElementById('hi').textContent=best;
function spawn(){let p;do{p={x:Math.floor(Math.random()*G),y:Math.floor(Math.random()*G)}}while(snake.some(s=>s.x===p.x&&s.y===p.y));return p;}
function setDir(x,y){if(dir.x===-x&&dir.y===-y)return;ndir={x,y};}
function reset(){snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}];dir={x:1,y:0};ndir={x:1,y:0};food=spawn();bonus=null;score=0;dead=false;upd();draw();loop();}
function upd(){document.getElementById('sc').textContent=score;if(score>best){best=score;lsSet('el_snake_hi',best);document.getElementById('hi').textContent=best;}document.getElementById('lv').textContent=1+Math.floor(score/50);}
function draw(){
  ctx.fillStyle='#06130b';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.strokeStyle='rgba(34,197,94,.08)';for(let i=0;i<=G;i++){ctx.beginPath();ctx.moveTo(i*S,0);ctx.lineTo(i*S,cv.height);ctx.moveTo(0,i*S);ctx.lineTo(cv.width,i*S);ctx.stroke();}
  ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(food.x*S+S/2,food.y*S+S/2,S*.36,0,Math.PI*2);ctx.fill();
  if(bonus){ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(bonus.x*S+S/2,bonus.y*S+S/2,S*.4,0,Math.PI*2);ctx.fill();}
  snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#4ade80':'#16a34a';ctx.fillRect(s.x*S+2,s.y*S+2,S-4,S-4);});
  if(dead){ctx.fillStyle='rgba(6,19,11,.82)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',160,150);ctx.fillStyle='#ef4444';ctx.font='14px sans-serif';ctx.fillText('Tap tombol ↻ untuk main lagi',160,180);}
}
function step(){
  if(dead)return;
  dir=ndir;
  const h={x:(snake[0].x+dir.x+G)%G,y:(snake[0].y+dir.y+G)%G};
  if(snake.some(s=>s.x===h.x&&s.y===h.y)){dead=true;draw();return;}
  snake.unshift(h);
  if(h.x===food.x&&h.y===food.y){score+=10;food=spawn();if(score%40===0)bonus=spawn();upd();}
  else if(bonus&&h.x===bonus.x&&h.y===bonus.y){score+=30;bonus=null;upd();}
  else snake.pop();
  draw();loop();
}
function loop(){clearTimeout(t);t=setTimeout(step,Math.max(70,155-Math.floor(score/50)*12));}
let sx=0,sy=0;
cv.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;});
cv.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>Math.abs(dy))setDir(dx>0?1:-1,0);else setDir(0,dy>0?1:-1);});
reset();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Snake Classic", "🐍", { quoted: m });
}

export { pluginConfig as config, handler };
