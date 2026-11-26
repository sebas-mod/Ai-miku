/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { sendHtmlCard, buildGameBaseCss } from "../../src/lib/features/rich-engine.js";

const pluginConfig = {
  name: "mathrich",
  alias: ["hitungcepat"],
  category: "rich",
  description: "Kuis hitung cepat 60 detik dengan combo skor & rekor",
  usage: ".mathrich",
  example: ".mathrich",
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
<title>Hitung Cepat — Elysia Assistant</title>
<style>
${buildGameBaseCss("teal")}
.hud{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px;}
.stat{flex:1;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:7px 8px;text-align:center;}
.stat b{display:block;font-size:15px;color:#fff;}
.stat span{font-size:10px;color:var(--soft);}
canvas{display:block;width:100%;border-radius:13px;background:#0b0714;border:1px solid var(--line);touch-action:none;}
.row{display:flex;gap:8px;margin-top:10px;}
.row .btn{flex:1;}
.qbox{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:24px 12px;text-align:center;font-size:28px;font-weight:900;margin-bottom:10px;}
.opts{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
.opt{padding:14px;border-radius:12px;border:1px solid var(--line);background:var(--card2);color:#fff;font-size:18px;font-weight:800;cursor:pointer;}
</style>
</head>
<body>
<div class="stage"><div class="app">
  <div class="top">
    <div class="logo">🧮</div>
    <div class="meta">
      <div class="title">Hitung Cepat</div>
      <div class="sub">Jawab hitungan secepat mungkin</div>
    </div>
  </div>
  <div class="hud">
    <div class="stat"><b id="sc">0</b><span>Skor</span></div>
    <div class="stat"><b id="tm">60</b><span>Detik</span></div>
    <div class="stat"><b id="cb">x1</b><span>Combo</span></div>
  </div>
  <div class="qbox" id="q">Tekan Mulai!</div>
  <div class="opts" id="opts"></div>
  <div class="row"><button class="btn" id="sbtn" onclick="start()">▶ Mulai 60 Detik</button></div>
</div></div>
<script>
let sc=0,tm=60,cb=0,ans=0,tmr=null,on=false;
const sbtn=document.getElementById('sbtn');
function setOpts(en){document.querySelectorAll('.opt').forEach(b=>{b.disabled=!en;b.style.opacity=en?'1':'.4';});}
function gen(){
  const ops=['+','-','×'];const op=ops[Math.floor(Math.random()*ops.length)];
  let a=Math.floor(Math.random()*20)+2,b=Math.floor(Math.random()*15)+2;
  if(op==='×'){a=Math.floor(Math.random()*11)+2;b=Math.floor(Math.random()*10)+2;}
  ans=op==='+'?a+b:op==='-'?a-b:a*b;
  document.getElementById('q').textContent=\`\${a} \${op} \${b} = ?\`;
  const st=new Set([ans]);while(st.size<4)st.add(ans+Math.floor(Math.random()*13)-6);
  document.getElementById('opts').innerHTML=[...st].sort(()=>Math.random()-.5).map(v=>\`<button class="opt" onclick="pick(\${v})">\${v}</button>\`).join('');
  setOpts(on);
}
function pick(v){
  if(!on)return;
  if(v===ans){cb++;sc+=10*Math.min(5,cb);}else{cb=0;sc=Math.max(0,sc-5);}
  document.getElementById('sc').textContent=sc;document.getElementById('cb').textContent='x'+Math.max(1,Math.min(5,cb));
  gen();
}
function start(){
  if(on)return;
  clearInterval(tmr);
  on=true;sc=0;tm=60;cb=0;
  sbtn.disabled=true;sbtn.style.opacity='.45';sbtn.textContent='⏳ Sedang Bermain...';
  document.getElementById('sc').textContent=0;document.getElementById('tm').textContent=60;document.getElementById('cb').textContent='x1';
  gen();
  tmr=setInterval(()=>{
    tm--;document.getElementById('tm').textContent=tm;
    if(tm<=0){
      on=false;clearInterval(tmr);setOpts(false);
      sbtn.disabled=false;sbtn.style.opacity='1';sbtn.textContent='↻ Main Lagi';
      document.getElementById('q').textContent='Selesai! Skor: '+sc;
    }
  },1000);
}
gen();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  await sendHtmlCard(sock, m, buildHtml(), "Hitung Cepat", "🧮", { quoted: m });
}

export { pluginConfig as config, handler };
