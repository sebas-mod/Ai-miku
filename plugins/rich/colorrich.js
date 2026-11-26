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
  name: "colorrich",
  alias: ["tebakwarna"],
  category: "rich",
  description: "Tes refleks otak: pilih WARNA TINTA teksnya, bukan tulisan katanya!",
  usage: ".colorrich",
  example: ".colorrich",
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
<title>Tebak Warna — Ai Miku</title>
<style>
${buildGameBaseCss("studio")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid var(--line);touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}
.wbox{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:28px 10px;text-align:center;font-size:28px;font-weight:900;margin-bottom:10px;}
.cgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
.cbtn{padding:13px;border-radius:12px;border:0;color:#fff;font-size:14px;font-weight:800;cursor:pointer;}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">🎨</div>
    <div class="meta">
      <div class="title">Tebak Warna</div>
      <div class="sub">Pilih warna tulisan, bukan katanya!</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="sc">0</b><span>Skor</span></div>
    <div class="stat"><b id="tm">30</b><span>Detik</span></div>
    <div class="stat"><b id="hi">0</b><span>Rekor</span></div>
  </div>
  <div class="wbox" id="wb">PILIH WARNA TINTA!</div>
  <div class="cgrid" id="cg"></div>
  <div class="row"><button class="btn" id="sbtn" onclick="start()">▶ Mulai 30 Detik</button></div>
</div></div>
<script>
function lsGet(k,d){try{return localStorage.getItem(k)??d}catch{return d}}function lsSet(k,v){try{localStorage.setItem(k,v)}catch{}}
const COLS=[{n:'MERAH',c:'#ef4444'},{n:'BIRU',c:'#3b82f6'},{n:'HIJAU',c:'#10b981'},{n:'KUNING',c:'#f59e0b'}];
let sc=0,tm=30,hi=+lsGet('el_col_hi',0),ans=0,on=false,tmr=null;
const sbtn=document.getElementById('sbtn');
document.getElementById('hi').textContent=hi;
document.getElementById('cg').innerHTML=COLS.map((x,i)=>\`<button class="cbtn" style="background:\${x.c}" onclick="pick(\${i})">\${x.n}</button>\`).join('');
function setBtns(en){document.querySelectorAll('.cbtn').forEach(b=>{b.disabled=!en;b.style.opacity=en?'1':'.4';});}
function next(){
  const wi=Math.floor(Math.random()*4),ci=Math.floor(Math.random()*4);
  ans=ci;const w=document.getElementById('word');w.textContent=COLS[wi].n;w.style.color=COLS[ci].c;
}
function upd(){document.getElementById('sc').textContent=sc;document.getElementById('tm').textContent=tm;if(sc>hi){hi=sc;lsSet('el_col_hi',hi);document.getElementById('hi').textContent=hi;}}
function pick(i){if(!on)return;if(i===ans)sc+=10;else sc=Math.max(0,sc-5);upd();next();}
function start(){
  if(on)return;
  clearInterval(tmr);
  on=true;sc=0;tm=30;
  sbtn.disabled=true;sbtn.style.opacity='.45';sbtn.textContent='⏳ Sedang Bermain...';
  upd();setBtns(true);next();
  tmr=setInterval(()=>{
    tm--;upd();
    if(tm<=0){
      on=false;clearInterval(tmr);setBtns(false);
      sbtn.disabled=false;sbtn.style.opacity='1';sbtn.textContent='↻ Main Lagi';
      const w=document.getElementById('word');w.textContent='SELESAI! '+sc;w.style.color='#fff';
    }
  },1000);
}
upd();setBtns(false);
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Tebak Warna", "🎨", { quoted: m });
}

export { pluginConfig as config, handler };
