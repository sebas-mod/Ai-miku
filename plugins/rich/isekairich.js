/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { createRichRunner } from "../../src/lib/features/rich-engine.js";

const pluginConfig = {
  name: "isekairich",
  alias: [],
  category: "rich",
  description: 'RPG isekai estilo anime: flechas, ciudad, gremio, tienda, posada, bosque, cueva y el jefe Dragón de Fuego (progreso guardado)',
  usage: ".isekairich",
  example: ".isekairich",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const libs = {
    "htmlcard": (module, exports, require) => {
const DEFAULT_BOT_JID = "867051314767696@bot"
const KAPABILITAS = [34, 58, 29, 1, 67, 60, 55, 8]
const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("")
const randomResponseId = () => `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`

function buildRichHtmlPayload(html, title = "Card", opts = {}) {
  const q = require('./dquote').quoteOf(opts.quoted), qCtx = q && q.message ? { stanzaId: q.key.id, participant: q.key.participant || q.sender, remoteJid: q.chat, quotedMessage: q.message } : {}
  return {
    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { capabilityMetadata: { capabilities: KAPABILITAS } } },
    botForwardedMessage: { message: { richResponseMessage: {
      messageType: 1,
      submessages: [{ messageType: 2, messageText: title }],
      unifiedResponse: { data: Buffer.from(JSON.stringify({
        response_id: randomResponseId(),
        sections: [{ view_model: { primitive: { __typename: "GenAIaeacdsnwHtmlPrimitive", payload: html, trusted_sources: [] }, __typename: "GenAISingleLayoutViewModel" } }],
      })).toString("base64") },
      contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: DEFAULT_BOT_JID }, forwardOrigin: 4, ...qCtx },
    } } },
  }
}

async function sendHtmlCard(sock, m, html, title, emoji = "✨", opts = {}) {
  try {
    await sock.relayMessage(m.chat, buildRichHtmlPayload(html, title, opts), {})
    try { await sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    return true
  } catch (err) {
    console.error(`[HTMLCARD:${title}] error al enviar:`, err.message)
    await sock.sendMessage(m.chat, { text: "❌ No se pudo enviar la tarjeta. Esta función necesita la versión más reciente de WhatsApp." }, { quoted: m })
    return false
  }
}

const safeJson = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028|\u2029/g, "")
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))

const BASE_CSS = String.raw`
:root{--bg:#0f1115;--card:#181b22;--card2:#20242d;--ink:#fff;--soft:#a3aab8;--line:#2b303b;--acc:#22c55e;--acc2:#16a34a;--warn:#f59e0b;--red:#ef4444;--blue:#3b82f6;--sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{background:transparent;color:var(--ink);font-family:var(--sys);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
.stage{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:4px;}
.app{width:100%;max-width:640px;border-radius:16px;overflow:hidden;position:relative;background:linear-gradient(180deg,#232733 0%,#171a21 30%,var(--bg) 70%);box-shadow:0 18px 40px rgba(0,0,0,.55);padding:10px;}
.top{display:flex;align-items:center;gap:9px;margin-bottom:12px;}
.logo{width:30px;height:30px;border-radius:9px;background:var(--acc);flex:none;display:flex;align-items:center;justify-content:center;font-size:16px;}
.meta{min-width:0;flex:1;}
.title{font-size:14px;font-weight:800;}
.sub{font-size:10.5px;color:var(--soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;}
.chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:8px;scrollbar-width:none;}
.chips::-webkit-scrollbar{display:none;}
.chip{flex:none;border:1px solid var(--line);background:var(--card);color:var(--soft);border-radius:20px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;}
.chip.on{background:var(--acc);border-color:var(--acc);color:#04130a;}
.btn{border:0;border-radius:10px;padding:10px 12px;font-size:13px;font-weight:800;cursor:pointer;background:var(--acc);color:#04130a;}
.btn.alt{background:var(--card2);color:var(--ink);border:1px solid var(--line);}
.btn.red{background:var(--red);color:#fff;}
.inp{width:100%;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;color:var(--ink);font-size:14px;outline:none;font-family:var(--sys);}
.inp:focus{border-color:var(--acc);}
.box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;}
.row{display:flex;gap:8px;align-items:center;}
.muted{color:var(--soft);font-size:11px;}
.hide{display:none!important;}
`;

module.exports = { buildRichHtmlPayload, sendHtmlCard, safeJson, escapeHtml, BASE_CSS }
    },
    "dquote": (module, exports, require) => {
const quoteOf = (q) => { try { return q && q.key && q.message && q.chat ? q : null } catch { return null } }
module.exports = { quoteOf, apply: (o) => o, enabled: () => false }
    },
    "cards/isekairpg": (module, exports, require) => {
    const NB = () => String(global.namebot || 'Ai Miku').replace(/[<>&'"`$\\]/g, '')
    const { BASE_CSS, safeJson } = require("../htmlcard");

    const BODY = String.raw`
    <style>
    __BASECSS__
    .hr{display:flex;justify-content:space-between;font-size:11px;color:var(--soft);margin-bottom:3px;font-weight:700}
    .b{height:6px;background:#0b0e14;border-radius:4px;margin-bottom:3px;overflow:hidden}.b i{display:block;height:100%}
    .scr{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:#000;margin-top:6px}
    #cv{width:100%;display:block}
    .ov{position:absolute;inset:0;background:rgba(10,12,20,.95);padding:10px;overflow:auto;display:flex;flex-direction:column;gap:6px}
    .ot{font-weight:800;font-size:14px}.ob{font-size:12px;line-height:1.5;color:#dfe5f1}
    .og{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:auto}.og .btn{font-size:12px;padding:9px 6px}
    .en{font-size:52px;text-align:center}.mut{font-size:11px;color:var(--soft)}
    .bl{background:var(--card);border-radius:8px;padding:6px 8px;font-size:11px;min-height:48px}
    .log{font-size:11px;color:var(--soft);min-height:40px;margin:6px 2px}
    .pad{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
    .dp{display:grid;grid-template-columns:repeat(3,50px);grid-template-rows:repeat(3,50px);gap:4px}
    .dp button,.ab button{border:1px solid var(--line);background:var(--card2);color:var(--ink);border-radius:14px;font-size:18px;font-weight:800;touch-action:manipulation;user-select:none;-webkit-user-select:none}
    .dp button:active,.ab button:active{background:var(--acc);color:#04130a}
    .u{grid-area:1/2}.l{grid-area:2/1}.r{grid-area:2/3}.d{grid-area:3/2}
    .ab{display:flex;gap:10px}.ab button{width:62px;height:62px;border-radius:50%;font-size:15px}
    </style>
    <div class="stage"><div class="app">
     <div class="top"><div class="logo">⚔️</div><div class="meta"><div class="title">${NB()} Isekai Live</div><div class="sub" id="sub">Otro mundo te espera</div></div></div>
     <div id="hud"></div>
     <div class="scr"><canvas id="cv"></canvas><div id="ov" class="ov hide"></div></div>
     <div class="log" id="log"></div>
     <div class="pad">
      <div class="dp"><button class="u" data-d="u">▲</button><button class="l" data-d="l">◀</button><button class="r" data-d="r">▶</button><button class="d" data-d="d">▼</button></div>
      <div class="ab"><button id="bB">☰</button><button id="bA">A</button></div>
     </div>
    </div></div>
    <script>
    (function(){
    var CFG=__CFG__,$=function(i){return document.getElementById(i)};
    var TS=30,VW=11,VH=9,cv=$('cv'),c=cv.getContext('2d');cv.width=VW*TS;cv.height=VH*TS;
    var RND=function(a,b){return a+Math.floor(Math.random()*(b-a+1))};
    var esc=function(s){return String(s).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})};
    function seeded(s){return function(){s=(s*1664525+1013904223)%4294967296;return s/4294967296}}
    function grid(w,h,f){var g=[];for(var y=0;y<h;y++){g.push([]);for(var x=0;x<w;x++)g[y].push(f)}return g}
    function rect(g,x,y,w,h,t){for(var j=y;j<y+h;j++)for(var i=x;i<x+w;i++)g[j][i]=t}
    function border(g){var h=g.length,w=g[0].length;for(var x=0;x<w;x++){g[0][x]='#';g[h-1][x]='#'}for(var y=0;y<h;y++){g[y][0]='#';g[y][w-1]='#'}}
    /* ---------- DUNIA ---------- */
    var MAPS={};
    (function(){
     var t=grid(20,14,'.');border(t);rect(t,2,2,4,2,'G');rect(t,8,2,4,2,'S');rect(t,14,2,4,2,'I');rect(t,2,8,3,2,'~');rect(t,1,5,18,1,',');rect(t,9,5,2,8,',');rect(t,9,13,2,1,'D');
     MAPS.kota={g:t,name:'Ciudad ${NB()}',enc:0,d:{to:'hutan',x:10,y:1},npcs:[{x:6,y:7,e:'🧝‍♀️',id:'mira'},{x:14,y:8,e:'👴',id:'zeus'},{x:16,y:10,e:'🐱',id:'cat'}]};
     var f=grid(22,20,'f'),r=seeded(7);
     for(var y=1;y<19;y++)for(var x=1;x<21;x++)if(r()<.17&&(x<9||x>12))f[y][x]='#';
     rect(f,3,8,3,3,'~');border(f);rect(f,10,0,2,1,'D');rect(f,10,19,2,1,'C');
     MAPS.hutan={g:f,name:'Bosque de los Susurros',enc:.2,pool:['slime','slime','gob','wolf'],d:{to:'kota',x:9,y:12},npcs:[]};
     var q=grid(14,12,'c'),r2=seeded(21);
     for(var y2=1;y2<11;y2++)for(var x2=1;x2<13;x2++)if(r2()<.12&&(x2<5||x2>8))q[y2][x2]='#';
     border(q);rect(q,6,1,2,1,'X');rect(q,6,11,2,1,'D');
     MAPS.gua={g:q,name:'Cueva del Dragón de Fuego',enc:.25,pool:['orc','bat','orc'],d:{to:'hutan',x:10,y:18},npcs:[],rock:1};
    })();
    var TILE={'.':['#3b7d4a',''],'f':['#2f6a3c',''],',':['#b09a64',''],'#':['#1f4d2b','🌲'],'~':['#2b6cb0','🌊'],'G':['#6b4f2a','🏰'],'S':['#6b4f2a','🏪'],'I':['#6b4f2a','🏨'],'D':['#6d28d9',''],'C':['#111827','🕳️'],'c':['#374151',''],'X':['#7f1d1d','🐉']};
    var WALK={'.':1,'f':1,',':1,'c':1};
    /* ---------- DATA ---------- */
    var CLS={hero:{n:'Héroe',e:'🦸',hp:120,mp:20,atk:14,def:8,g:[18,3,3,1.6],sk:['Tajo de Luz',8,1.9,0]},
     mage:{n:'Maga',e:'🧙‍♀️',hp:80,mp:60,atk:10,def:5,g:[11,9,2.6,1],sk:['Meteor ${NB()}',12,2.8,1]},
     arch:{n:'Arquero',e:'🧝',hp:96,mp:36,atk:12,def:6,g:[14,5,2.8,1.2],sk:['Flecha Doble',7,2.2,0]}};
    var WP=[{n:'Hoja de Madera',a:0,p:0},{n:'Hoja de Hierro',a:6,p:150},{n:'Hoja de Acero',a:14,p:600},{n:'Hoja ${NB()}',a:28,p:2200}];
    var AR=[{n:'Ropa raída',d:0,p:0},{n:'Túnica de cuero',d:4,p:120},{n:'Armadura de hierro',d:10,p:500},{n:'Armadura de dragón',d:22,p:2000}];
    var IT={pot:['🧪','Potion','+60 HP',50],eth:['💧','Ether','+30 MP',70],eli:['🍷','Elixir Anggur','HP y MP al máximo',250]};
    var EN={slime:{n:'Slime',e:'🟢',hp:34,atk:8,def:1,x:14,g:9},gob:{n:'Goblin',e:'👺',hp:52,atk:12,def:3,x:24,g:16},wolf:{n:'Lobo Negro',e:'🐺',hp:70,atk:16,def:4,x:36,g:24},
     orc:{n:'Orc',e:'👹',hp:130,atk:26,def:9,x:80,g:50},bat:{n:'Murciélago Demoníaco',e:'🦇',hp:95,atk:30,def:6,x:70,g:45},naga:{n:'Dragón de Fuego',e:'🐉',hp:520,atk:58,def:14,x:500,g:600,boss:1}};
    var QD=[{n:'Elimina 3 Slimes',t:'slime',k:3,g:70,x:35},{n:'Derrota 3 Goblins',t:'gob',k:3,g:140,x:70},{n:'Caza 3 Lobos Negros',t:'wolf',k:3,g:240,x:130},{n:'Elimina 4 Orcos',t:'orc',k:4,g:650,x:320},{n:'Derrota al Dragón de Fuego',t:'naga',k:1,g:2500,x:1200,once:1}];
    var RANK=['F','E','D','C','B','A','S'],RT=[0,1,3,6,10,15,22];
    /* ---------- STATE ---------- */
    var P=null,mem=null,KEY='isekai_rpg_v1',face=[0,1],isOpen=false,acts=[],logs=[];
    function load(){try{var s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}return mem}
    function save(){mem=P;try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}}
    function K(){return CLS[P.cls]}
    function mhp(){return Math.round(K().hp+K().g[0]*(P.lv-1))}
    function mmp(){return Math.round(K().mp+K().g[1]*(P.lv-1))}
    function atk(){return Math.round(K().atk+K().g[2]*(P.lv-1))+WP[P.w].a}
    function def(){return Math.round(K().def+K().g[3]*(P.lv-1))+AR[P.a].d}
    function need(){return Math.round(30*P.lv+8*P.lv*P.lv)}
    function rank(){var r=0;for(var i=0;i<RT.length;i++)if(P.done>=RT[i])r=i;return RANK[r]}
    function bar(v,m,col){return '<div class="b"><i style="width:'+Math.max(0,Math.min(100,Math.round(v/m*100)))+'%;background:'+col+'"></i></div>'}
    function say(t){logs.push(t);if(logs.length>3)logs.shift();$('log').innerHTML=logs.map(esc).join('<br>')}
    function hud(){
     if(!P){$('hud').innerHTML='';return}
     $('hud').innerHTML='<div class="hr"><span>'+K().e+' Lv.'+P.lv+' · Rank '+rank()+'</span><span>HP '+P.hp+'/'+mhp()+'</span><span>MP '+P.mp+'/'+mmp()+'</span><span>💰'+P.gold+'</span></div>'+bar(P.hp,mhp(),'#ef4444')+bar(P.mp,mmp(),'#3b82f6')+bar(P.exp,need(),'#eab308');
     $('sub').textContent=CFG.nama+' · '+MAPS[P.map].name;
    }
    /* ---------- OVERLAY ---------- */
    var ov=$('ov');
    function open(title,body,btns){acts=[];var h='<div class="ot">'+title+'</div><div class="ob">'+body+'</div><div class="og">';(btns||[]).forEach(function(b){acts.push(b.f);h+='<button class="btn '+(b.c===undefined?'alt':b.c)+'" data-i="'+(acts.length-1)+'">'+b.l+'</button>'});ov.innerHTML=h+'</div>';ov.classList.remove('hide');isOpen=true}
    function close(){ov.classList.add('hide');isOpen=false;acts=[];hud();draw()}
    ov.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var f=acts[+b.getAttribute('data-i')];if(f)f()});
    var BACK={l:'Cerrar',f:function(){close()}};
    /* ---------- GAMBAR ---------- */
    function draw(){
     if(!P)return;var M=MAPS[P.map],g=M.g,ox=Math.max(0,Math.min(g[0].length-VW,P.x-5)),oy=Math.max(0,Math.min(g.length-VH,P.y-4));
     c.textAlign='center';c.textBaseline='middle';c.font='20px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
     for(var vy=0;vy<VH;vy++)for(var vx=0;vx<VW;vx++){
      var ch=g[oy+vy][ox+vx],t=TILE[ch]||TILE['.'],px=vx*TS,py=vy*TS;
      c.fillStyle=t[0];c.fillRect(px,py,TS,TS);
      if((ox+vx+oy+vy)%2===0&&WALK[ch]){c.fillStyle='rgba(255,255,255,.04)';c.fillRect(px,py,TS,TS)}
      var em=t[1];if(ch==='#'&&M.rock)em='🪨';if(em)c.fillText(em,px+TS/2,py+TS/2+1);
     }
     M.npcs.forEach(function(n){var vx=n.x-ox,vy=n.y-oy;if(vx>=0&&vx<VW&&vy>=0&&vy<VH)c.fillText(n.e,vx*TS+TS/2,vy*TS+TS/2+1)});
     var sx=(P.x-ox)*TS+TS/2,sy=(P.y-oy)*TS+TS/2;
     c.fillStyle='rgba(250,204,21,.28)';c.beginPath();c.arc(sx,sy,13,0,7);c.fill();c.fillText(K().e,sx,sy+1);
    }
    /* ---------- GERAK & INTERAKSI ---------- */
    function npcAt(x,y){var l=MAPS[P.map].npcs;for(var i=0;i<l.length;i++)if(l[i].x===x&&l[i].y===y)return l[i];return null}
    function step(dx,dy){
     if(!P||isOpen)return;face=[dx,dy];var M=MAPS[P.map],nx=P.x+dx,ny=P.y+dy;
     if(ny<0||nx<0||ny>=M.g.length||nx>=M.g[0].length)return;
     var n=npcAt(nx,ny);if(n)return talk(n);
     var ch=M.g[ny][nx];
     if(WALK[ch]){P.x=nx;P.y=ny;draw();if(M.enc&&Math.random()<M.enc){var pl=M.pool;battle(pl[RND(0,pl.length-1)])}}
     else touch(ch);
    }
    function act(){
     if(!P||isOpen)return;var nx=P.x+face[0],ny=P.y+face[1],M=MAPS[P.map];
     if(ny<0||nx<0||ny>=M.g.length||nx>=M.g[0].length)return;
     var n=npcAt(nx,ny);if(n)return talk(n);
     var ch=M.g[ny][nx];if(WALK[ch])say('Aquí no hay nada.');else touch(ch);
    }
    function travel(to,x,y,msg){P.map=to;P.x=x;P.y=y;save();draw();hud();say(msg||('Llegaste a '+MAPS[to].name+'.'))}
    function touch(ch){
     var M=MAPS[P.map];
     if(ch==='G')return guild();if(ch==='S')return shop();if(ch==='I')return inn();
     if(ch==='D')return travel(M.d.to,M.d.x,M.d.y);
     if(ch==='C'){if(P.lv<6)return say('Un aura de dragón sale de la cueva. Necesitas Nv.6 para entrar.');return travel('gua',6,10,'Entras en la Cueva del Dragón de Fuego. Un calor sofocante te golpea...')}
     if(ch==='X')return open('🐉 Dragón de Fuego','El Dragón se alza de la pila de oro. ¿Listo para pelear?',[{l:'¡Pelear!',c:'red',f:function(){battle('naga')}},{l:'Retroceder',f:close}]);
     if(ch==='#')say(M.rock?'Pared fría de la cueva.':'Un gran árbol bloquea el camino.');
     if(ch==='~')say('El agua es demasiado profunda para cruzarla.');
    }
    var HINT=['El bosque del sur está lleno de Slimes y Goblins. ¡Entrena primero!','La cueva al final del bosque requiere nivel 6. El Dragón de Fuego guarda su tesoro dentro.','Compra una armadura en la tienda antes de pelear contra el Orco.','Las misiones del Gremio dan oro y EXP. ¡Hazlas todas!','La poción es barata, desmayarse sale caro.'];
    function talk(n){
     if(n.id==='mira')return open('🧝‍♀️ Mira, Elfa Guardiana','"'+HINT[RND(0,HINT.length-1)]+'"',[BACK]);
     if(n.id==='zeus')return open('👴 Abuelo Zeus','"Antes fui un héroe como tú. Ahora el Dragón de Fuego custodia la Gema ${NB()} en el fondo de la cueva. Derrótalo y tu nombre será eterno."'+(P.boss?'<br><br><b>Ya lo lograste, muchacho. El mundo te lo agradece.</b>':''),[BACK]);
     var g=Math.random()<.3?RND(2,12):0;P.gold+=g;if(g)save();
     open('🐱 Gato del Gremio',g?'¡Miau~! El gato dejó caer '+g+' de oro de su bolsillo.':'Miau~ (ronronea pidiendo cariño).',[BACK]);
    }
    /* ---------- GUILD / TOKO / PENGINAPAN ---------- */
    function guild(){
     var body='<b>Rank '+rank()+'</b> · Misión completada: '+P.done+'<br>',btns=[];
     QD.forEach(function(q,i){
      var s=P.q[i],txt='• '+q.n+' (+'+q.g+'g, +'+q.x+' EXP)';
      if(s===1)txt+=' — '+P.qp[i]+'/'+q.k;if(s===2)txt+=' — <b>¡completada!</b>';if(s===3)txt+=' — terminada';
      body+=txt+'<br>';
      if(s===0)btns.push({l:'Aceptar: '+q.n.split(' ')[0]+' '+q.t,f:function(){P.q[i]=1;P.qp[i]=0;save();say('Misión aceptada: '+q.n);guild()}});
      if(s===2)btns.push({l:'Entregar: '+q.n.split(' ')[0]+' '+q.t,c:'',f:function(){P.gold+=q.g;P.exp+=q.x;P.done++;P.q[i]=q.once?3:0;var up=lvl();save();say('Recompensa: +'+q.g+'g, +'+q.x+' EXP'+(up?' · ¡SUBISTE DE NIVEL! Nv.'+P.lv:''));guild()}});
     });
     btns.push(BACK);open('🏰 Gremio de Aventureros',body,btns);
    }
    function shop(msg){
     var btns=[],body='💰 Oro: <b>'+P.gold+'</b><br>'+(msg?'<i>'+msg+'</i><br>':'')+'Arma: '+WP[P.w].n+' (+'+WP[P.w].a+' ATK)<br>Armor: '+AR[P.a].n+' (+'+AR[P.a].d+' DEF)';
     Object.keys(IT).forEach(function(k){var it=IT[k];btns.push({l:it[0]+' '+it[1]+' '+it[3]+'g ('+P.inv[k]+')',f:function(){if(P.gold<it[3])return shop('Oro insuficiente.');P.gold-=it[3];P.inv[k]++;save();hud();shop('Compraste '+it[1]+'.')}})});
     var w=WP[P.w+1],a=AR[P.a+1];
     if(w)btns.push({l:'⚔️ '+w.n+' '+w.p+'g',f:function(){if(P.gold<w.p)return shop('Oro insuficiente.');P.gold-=w.p;P.w++;save();hud();shop('¡Equipaste '+w.n+'!')}});
     if(a)btns.push({l:'🛡️ '+a.n+' '+a.p+'g',f:function(){if(P.gold<a.p)return shop('Oro insuficiente.');P.gold-=a.p;P.a++;save();hud();shop('¡Equipaste '+a.n+'!')}});
     btns.push(BACK);open('🏪 Tienda de Mimi',body,btns);
    }
    function inn(){
     var cost=20+P.lv*3;
     open('🏨 Posada de la Uva','Descanso completo (recuperas HP y MP) y se guarda el progreso.<br>Coste: <b>'+cost+'</b> gold.',[{l:'Hospedarte',c:'',f:function(){if(P.gold<cost){say('Oro insuficiente.');return close()}P.gold-=cost;P.hp=mhp();P.mp=mmp();save();say('Duermes profundamente. HP y MP restaurados.');close()}},BACK]);
    }
    /* ---------- ITEM & MENU ---------- */
    function useItem(k){
     if(P.inv[k]<1)return 'No tienes ese objeto.';
     if(k==='pot'){if(P.hp>=mhp())return 'La HP ya está al máximo.';P.hp=Math.min(mhp(),P.hp+60);}
     else if(k==='eth'){if(P.mp>=mmp())return 'El MP ya está al máximo.';P.mp=Math.min(mmp(),P.mp+30);}
     else{P.hp=mhp();P.mp=mmp();}
     P.inv[k]--;save();return 'Usaste '+IT[k][1]+'.';
    }
    function bag(msg){
     var btns=[];Object.keys(IT).forEach(function(k){if(P.inv[k]>0)btns.push({l:IT[k][0]+' '+IT[k][1]+' x'+P.inv[k],f:function(){bag(useItem(k))}})});
     btns.push({l:'Volver',f:menu});open('🎒 Mochila',(msg?'<i>'+msg+'</i><br>':'')+'HP '+P.hp+'/'+mhp()+' · MP '+P.mp+'/'+mmp()+'<br>'+(btns.length>1?'Elige un objeto para usarlo.':'Mochila vacía.'),btns);
    }
    function status(){
     open('📜 Status '+esc(CFG.nama),K().e+' '+K().n+' Lv.'+P.lv+' (Rank '+rank()+')<br>EXP '+P.exp+'/'+need()+'<br>HP '+P.hp+'/'+mhp()+' · MP '+P.mp+'/'+mmp()+'<br>ATK '+atk()+' · DEF '+def()+'<br>Arma: '+WP[P.w].n+'<br>Armor: '+AR[P.a].n+'<br>Skill: '+K().sk[0]+' ('+K().sk[1]+' MP)<br>Monstruos derrotados: '+P.kills+(P.boss?'<br>🏆 Asesino del Dragón de Fuego':''),[{l:'Volver',f:menu}]);
    }
    function menu(){
     if(!P)return;
     open('☰ Menú',MAPS[P.map].name,[{l:'📜 Status',f:status},{l:'🎒 Mochila',f:function(){bag()}},{l:'💾 Guardar',f:function(){save();say('Progreso guardado.');close()}},{l:'♻️ Reiniciar partida',c:'red',f:function(){open('¿Reiniciar desde cero?','Se borrará todo el progreso.',[{l:'Sí, borrar',c:'red',f:function(){P=null;mem=null;try{localStorage.removeItem(KEY)}catch(e){}intro()}},{l:'Cancelar',f:menu}])}},BACK]);
    }
    /* ---------- LEVEL & PERTEMPURAN ---------- */
    function lvl(){var up=0;while(P.exp>=need()){P.exp-=need();P.lv++;up=1}if(up){P.hp=Math.min(mhp(),P.hp+Math.round(mhp()*.35));P.mp=Math.min(mmp(),P.mp+Math.round(mmp()*.35))}return up}
    function battle(id){
     var e={},b=EN[id];for(var k in b)e[k]=b[k];e.m=e.hp;var lg=['Aparece: '+e.n+'!'];
     function hit(a,d){return Math.max(1,Math.round(a*RND(90,112)/100-d*.6))}
     function view(){
      var sk=K().sk;
      open(e.e+' '+esc(e.n),'<div class="en">'+e.e+'</div><div class="mut">'+esc(e.n)+' '+Math.max(0,e.hp)+'/'+e.m+'</div>'+bar(e.hp,e.m,'#ef4444')+'<div class="mut">Tú · HP '+P.hp+'/'+mhp()+' · MP '+P.mp+'/'+mmp()+'</div>'+bar(P.hp,mhp(),'#22c55e')+'<div class="bl">'+lg.slice(-4).join('<br>')+'</div>',
      [{l:'⚔️ Atacar',c:'',f:function(){turn('atk')}},{l:''+sk[0]+' ('+sk[1]+')',f:function(){turn('sk')}},{l:'🧪 Item',f:items},{l:'🏃 Huir',c:'red',f:function(){turn('run')}}]);
     }
     function items(){
      var btns=[];Object.keys(IT).forEach(function(k){if(P.inv[k]>0)btns.push({l:IT[k][0]+' '+IT[k][1]+' x'+P.inv[k],f:function(){var r=useItem(k);lg.push(r);if(r.indexOf('Usaste')===0)return enemy();view()}})});
      btns.push({l:'Volver',f:view});open('🧪 Item','Elige un objeto (usar uno consume el turno).',btns);
     }
     function enemy(){
      var d=Math.max(1,Math.round(e.atk*RND(88,112)/100-def()*.5));P.hp-=d;lg.push(e.n+' ataca: '+d+' de daño');
      if(P.hp<=0)return lose();view();
     }
     function turn(kd){
      if(kd==='run'){if(e.boss){lg.push('¡No puedes huir del jefe!');return view()}if(Math.random()<.6){say('Escapaste de '+e.n+'.');return close()}lg.push('¡No lograste huir!')}
      else if(kd==='sk'){var s=K().sk;if(P.mp<s[1]){lg.push('¡MP insuficiente!');return view()}P.mp-=s[1];var d=hit(atk()*s[2],s[3]?0:e.def);lg.push('¡'+s[0]+'! '+d+' de daño');e.hp-=d}
      else{var cr=Math.random()<(P.cls==='arch'?.2:.1),d2=hit(atk()*(cr?1.7:1),e.def);lg.push((cr?'¡CRÍTICO! ':'')+'Ataque: '+d2+' de daño');e.hp-=d2}
      if(e.hp<=0)return win();enemy();
     }
     function win(){
      var gg=e.g+RND(0,Math.floor(e.g/3)),t=['¡Victoria! +'+e.x+' EXP, +'+gg+' gold'];P.exp+=e.x;P.gold+=gg;P.kills++;
      QD.forEach(function(q,i){if(P.q[i]===1&&q.t===id&&P.qp[i]<q.k){P.qp[i]++;if(P.qp[i]>=q.k){P.q[i]=2;t.push('Misión completada: '+q.n+' — ¡repórtalo al Gremio!')}}});
      if(lvl())t.push('¡SUBISTE DE NIVEL! Ahora eres nivel '+P.lv);
      if(Math.random()<.15){P.inv.pot++;t.push('Obtienes 1 Poción')}
      if(e.boss){P.boss=1;t.push('🏆 ¡El Dragón de Fuego ha caído! ¡Eres un héroe ${NB()}!')}
      save();open('🎉 ¡Victoria!',t.join('<br>'),[{l:'Continuar',c:'',f:close}]);
     }
     function lose(){
      P.gold=Math.floor(P.gold*.8);P.hp=Math.ceil(mhp()/2);P.mp=Math.ceil(mmp()/2);P.map='kota';P.x=9;P.y=6;save();
      open('💀 Derrota','Te desmayaste... y despertaste en la Ciudad ${NB()}. Perdiste el 20% de tu oro.',[{l:'Despertar',f:close}]);
     }
     view();
    }
    /* ---------- AWAL CERITA ---------- */
    function intro(){
     hud();c.fillStyle='#0f1115';c.fillRect(0,0,cv.width,cv.height);
     function pick(k){P={cls:k,lv:1,exp:0,hp:0,mp:0,gold:100,w:0,a:0,inv:{pot:3,eth:1,eli:0},map:'kota',x:9,y:6,q:[0,0,0,0,0],qp:[0,0,0,0,0],done:0,kills:0,boss:0};P.hp=mhp();P.mp=mmp();save();close();say('¡Bienvenido al mundo ${NB()}, '+CFG.nama+'! Visita el Gremio en el noroeste de la ciudad.')}
     open('Llamado a otro mundo','Una luz dorada te envuelve... El dios ${NB()} invoca a <b>'+esc(CFG.nama)+'</b> como nuevo héroe. Elige tu camino:',
     Object.keys(CLS).map(function(k){var x=CLS[k];return {l:x.e+' '+x.n+'<br><small>HP '+x.hp+' · ATK '+x.atk+'</small>',c:'',f:function(){pick(k)}}}));
    }
    /* ---------- KONTROL ---------- */
    var DIR={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]},tm=null;
    function stop(){clearInterval(tm);tm=null}
    Array.prototype.forEach.call(document.querySelectorAll('[data-d]'),function(b){
     var d=DIR[b.getAttribute('data-d')];
     b.addEventListener('pointerdown',function(e){e.preventDefault();stop();step(d[0],d[1]);tm=setInterval(function(){step(d[0],d[1])},170)});
     ['pointerup','pointerleave','pointercancel'].forEach(function(ev){b.addEventListener(ev,stop)});
    });
    $('bA').addEventListener('click',act);
    $('bB').addEventListener('click',function(){if(!P)return;if(isOpen)close();else menu()});
    document.addEventListener('keydown',function(e){
     var k=e.key,m={ArrowUp:'u',w:'u',ArrowDown:'d',s:'d',ArrowLeft:'l',a:'l',ArrowRight:'r',d:'r'}[k];
     if(m){e.preventDefault();step(DIR[m][0],DIR[m][1])}else if(k==='z'||k==='Enter'||k===' '){e.preventDefault();act()}else if(k==='x'||k==='Escape'){if(P){if(isOpen)close();else menu()}}
    });
    P=load();
    if(P){hud();draw();say('¡Bienvenido de nuevo, '+CFG.nama+'!')}else intro();
    })();
    </script>
    `;

    function buildIsekaiRpgHtml({ playerName = "Aventurero" } = {}) {
      return BODY.replace("__BASECSS__", () => BASE_CSS).replace("__CFG__", () => safeJson({ nama: String(playerName).slice(0, 24) }));
    }

    module.exports = { buildIsekaiRpgHtml };
        }
}

const feature = (module, exports, require) => {
const { buildIsekaiRpgHtml } = require('../../lib/cards/isekairpg')
const { sendHtmlCard } = require('../../lib/htmlcard')

module.exports = {
  name: 'isekairich',
  alias: [],
  category: 'rich',
  desc: 'RPG isekai estilo anime: flechas, ciudad, gremio, tienda, posada, bosque, cueva y el jefe Dragón de Fuego (progreso guardado)',
  run: async ({ sock, m, pushname }) => {
    const html = buildIsekaiRpgHtml({ playerName: pushname || String(m.sender).split('@')[0] })
    await sendHtmlCard(sock, m, html, (global.namebot || 'Ai Miku') + ' Isekai Live', '⚔️')
  },
}
    }

const handler = createRichRunner(libs, feature);

export { pluginConfig as config, handler };
