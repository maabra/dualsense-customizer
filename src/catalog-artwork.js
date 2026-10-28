import traces from './catalog-traces.json';

export const additionalEditions=new Set(['ff16','hogwarts','lebron','concord','fortnite','helldivers','lastofus','deathstranding','yotei-gold','yotei-black','marathon','007','gta-black','gta-white','lisa','camo']);
const black='#24262c',white='#e8e9e6';
export function catalogPartColor(id,group) {
 const control=['buttons','dpad','sticks','triggers','trim','ps','create','options','mute'].includes(group);
 if(id==='lastofus')return ['trim','sticks'].includes(group)?'#cbd0d7':black;
 if(id==='fortnite')return ['buttons','dpad','shell','touchpad'].includes(group)?'#56b9eb':black;
 if(id==='007')return control?black:'#cbb276';
 if(id==='lisa')return '#e6e5df';
 if(id==='marathon')return ['sticks','ps'].includes(group)?black:control?'#d8dce0':white;
 if(id.startsWith('yotei'))return ['trim','sticks','triggers'].includes(group)?'#a6a8a3':id==='yotei-gold'?'#d7c6a6':'#e3e0d7';
 if(id==='gta-white')return control?'#e2dfe3':'#ececed';
 if(id==='gta-black')return '#202b2b';
 return black;
}
function path(ctx,points,color,width=2){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
function fill(ctx,points,color){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();}
function label(ctx,t,x,y,size,color,font='Arial'){ctx.fillStyle=color;ctx.font=`600 ${size}px ${font}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y);}
function star(ctx,x,y,r,color){fill(ctx,Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2;return[x+Math.cos(a)*r*(i%2?.4:1),y+Math.sin(a)*r*(i%2?.4:1)];}),color);}
function skull(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,r,r*.8,0,0,Math.PI*2);ctx.fill();ctx.fillRect(x-r*.5,y,r,r*.85);for(const side of [-1,1]){ctx.fillStyle=black;ctx.beginPath();ctx.ellipse(x+side*r*.38,y,r*.2,r*.22,0,0,Math.PI*2);ctx.fill();}ctx.fillStyle=black;ctx.fillRect(x-r*.05,y+r*.35,r*.1,r*.35);}

export function drawTracedArtwork(ctx,id,group,w,h) {
 const key=group==='rear'?id+'-rear':['spiderman','lastofus','helldivers'].includes(id)&&group==='touchpad'?id+'-pad':id;
 if(!traces[key]||!['shell','touchpad','rear'].includes(group))return false;
 const project=([x,y])=>group==='touchpad'?[(x+.405)/.81*w,(.642-y)/.437*h]:[(x+1)/2*w,(.65-y)/1.3*h];
 if(group==='rear'&&['marathon','yotei-black','007','lisa'].includes(id))for(const side of [-1,1]) {
  const [x,y]=project([side*.82,-.6]);ctx.fillStyle=id==='007'?'#24262c':'#92999d';ctx.beginPath();ctx.ellipse(x,y,w*.057,h*.075,side*.65,0,Math.PI*2);ctx.fill();
 }
 for(const layer of traces[key]){
  ctx.beginPath();for(const points of layer.paths){points.map(project).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
  ctx.fillStyle=layer.color;ctx.fill('evenodd');
 }
 return true;
}

export function drawCatalogArtwork(ctx,id,group,w,h) {
 const touch=group==='touchpad',shell=group==='shell';
 if(!touch&&!shell&&group!=='rear'&&group!=='trim')return;
 const project=([x,y])=>touch?[(x+.405)/.81*w,(.642-y)/.437*h]:[(x+1)/2*w,(.65-y)/1.3*h];
 if(id.startsWith('gta')&&group==='trim') {
  const gradient=ctx.createLinearGradient(0,h*.3,0,h*.75);gradient.addColorStop(0,'#007cb9');gradient.addColorStop(.55,'#364c99');gradient.addColorStop(1,'#593261');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);return;
 }
 if(drawTracedArtwork(ctx,id,group,w,h))return;
 if(group==='rear') {
  if(id==='concord')label(ctx,'CONCORD',w*.5,h*.33,w*.045,'#d18256');
  if(id.startsWith('yotei')){ctx.strokeStyle='#925249';ctx.lineWidth=w*.002;ctx.strokeRect(w*.46,h*.28,w*.08,h*.11);label(ctx,'△ ○',w*.5,h*.315,w*.015,'#925249');label(ctx,'× □',w*.5,h*.355,w*.015,'#925249');}
  return;
 }
 if(id==='hogwarts') {
  const gold='#b39d66';
  if(touch){
   const towers=[[.19,.42,.065],[.3,.25,.07],[.43,.33,.05],[.56,.14,.08],[.71,.31,.065],[.82,.44,.04]];
   for(const [x,y,sw] of towers){ctx.fillStyle=gold;ctx.fillRect(w*(x-sw/2),h*(y+.12),w*sw,h*(.73-y));fill(ctx,[[w*(x-sw*.8),h*(y+.12)],[w*x,h*y],[w*(x+sw*.8),h*(y+.12)]],gold);}
   ctx.fillStyle=gold;ctx.fillRect(w*.17,h*.68,w*.68,h*.14);
   for(let x=.2;x<.84;x+=.035){ctx.fillStyle=black;ctx.fillRect(w*x,h*.7,w*.008,h*.045);}
  }
  if(shell)for(const side of [-1,1])for(let i=0;i<9;i++){const p=[];for(let k=0;k<50;k++){const t=k/49;p.push(project([side*(.63+Math.sin(t*4+i*.23)*(.16-i*.008)),.14-t*.67]));}path(ctx,p,gold,w*.0008);}
 }
 if(id==='concord') {
  const bands=['#a74426','#d77248','#e0b3a3','#4b9d9b'];
  for(let i=0;i<bands.length;i++){
   if(touch)fill(ctx,[[w*.5,h*.6],[w*(.05+i*.06),0],[w*(.12+i*.06),0]],bands[i]);
   if(shell)for(const side of [-1,1])path(ctx,[[side*.92,-.57],[side*.81,-.04],[side*.4,.3],[side*.18,.58]].map(project),bands[i],w*.012);
  }
  if(touch){ctx.fillStyle='#e0d7c9';ctx.beginPath();ctx.arc(w*.5,h*.6,h*.035,0,Math.PI*2);ctx.fill();}
 }
 if(id==='lebron') {
  if(touch){ctx.save();ctx.translate(w*.5,h*.47);ctx.rotate(-.12);label(ctx,'NOTHING IS GIVEN.',0,-h*.24,h*.095,'#dc67c4','cursive');label(ctx,'EVERYTHING',0,-h*.02,h*.14,'#f5f4ed','cursive');label(ctx,'IS EARNED.',0,h*.17,h*.14,'#f5f4ed','cursive');path(ctx,[[-w*.29,h*.3],[w*.28,h*.26]],'#39bde5',h*.017);ctx.restore();path(ctx,[[w*.7,h*.15],[w*.73,h*.05],[w*.77,h*.14],[w*.81,h*.04],[w*.84,h*.17]],'#edd64a',h*.012);}
  if(shell)for(const side of [-1,1]){const [x,y]=project([side*.75,-.3]);star(ctx,x,y,w*.023,'#e6d445');label(ctx,side<0?'BUILD':'CHOSEN',x,y-h*.13,h*.025,'#eee','cursive');label(ctx,side<0?'RISE':'ONE',x,y-h*.09,h*.026,'#eee','cursive');path(ctx,[[x-w*.04,y+h*.06],[x+w*.04,y+h*.04]],'#e263ba',w*.003);}
 }
 if(id==='helldivers') {
  if(touch){skull(ctx,w*.5,h*.47,h*.12,'#ced0cf');path(ctx,[[0,h*.97],[w,h*.97]],'#d5bd37',h*.02);}
  if(shell)for(const side of [-1,1]){fill(ctx,[[side*.85,-.55],[side*.73,-.13],[side*.57,-.02],[side*.66,-.37]].map(project),'#bfa52d');for(let i=0;i<15;i++)path(ctx,[[side*(.72+i*.004),-.17-i*.012],[side*(.87+i*.004),-.25-i*.012]].map(project),'#686a6b',w*.001);}
 }
 if(id==='lastofus') {
  const ink='#b7bdc5';
  if(touch){path(ctx,[[w*.42,h*.27],[w*.5,h*.44],[w*.57,h*.23],[w*.5,h*.6],[w*.4,h*.66],[w*.5,h*.48],[w*.62,h*.67]],ink,w*.012);}
  if(shell)for(let i=0;i<34;i++){const x=(i%7)/6*1.7-.85,y=Math.floor(i/7)*.21-.47;const [px,py]=project([x,y]);ctx.save();ctx.translate(px,py);ctx.rotate(i*.7);path(ctx,[[-w*.008,0],[0,-h*.015],[w*.009,0],[0,h*.013],[-w*.008,0]],'#353940',w*.0015);ctx.restore();}
 }
 if(id==='fortnite') {
  if(touch){label(ctx,'FORTNITE',w*.5,h*.48,h*.27,'#222a35','Impact');label(ctx,'FORTNITE',w*.49,h*.46,h*.25,'#f3dc32','Impact');}
  if(shell){
   // Simplified Peely and Fishstick motifs; not an exact illustration trace.
   const [fx,fy]=project([-.76,-.27]);ctx.save();ctx.translate(fx,fy);ctx.fillStyle='#ed9b44';ctx.beginPath();ctx.ellipse(0,0,w*.04,h*.06,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#66bdcc';ctx.fillRect(-w*.035,h*.035,w*.07,h*.11);for(const side of [-1,1]){ctx.fillStyle=white;ctx.beginPath();ctx.arc(side*w*.026,-h*.005,w*.013,0,Math.PI*2);ctx.fill();ctx.fillStyle=black;ctx.beginPath();ctx.arc(side*w*.026,-h*.005,w*.005,0,Math.PI*2);ctx.fill();}ctx.restore();
   const [px,py]=project([.76,-.3]);path(ctx,[[px-w*.018,py-h*.1],[px+w*.025,py],[px+w*.01,py+h*.1]],'#edd83b',w*.065);for(const side of [-1,1]){ctx.fillStyle=black;ctx.beginPath();ctx.arc(px+side*w*.012,py,w*.004,0,Math.PI*2);ctx.fill();}
   for(let i=0;i<35;i++){const [x,y]=project([Math.sin(i*17)*.9,Math.cos(i*13)*.6]);path(ctx,[[x-w*.006,y],[x,y-h*.01],[x+w*.006,y],[x,y+h*.01],[x-w*.006,y]],'#3189b3',w*.001);}
  }
 }
 if(id==='yotei-gold') {
  if(shell)for(const side of [-1,1])for(let i=0;i<4;i++)path(ctx,[[side*.2,.64],[side*.32,.4],[side*.57,.25],[side*.49,.05],[side*.7,-.16],[side*.65,-.34],[side*.82,-.62]].map(([x,y])=>project([x+i*.015,y+i*.008])),'#ae8240',w*(i?.001:.003));
  if(touch){const ink='#443b32';ctx.fillStyle=ink;ctx.beginPath();ctx.arc(w*.51,h*.3,h*.045,0,Math.PI*2);ctx.fill();fill(ctx,[[w*.49,h*.35],[w*.55,h*.35],[w*.61,h*.77],[w*.43,h*.77]],ink);path(ctx,[[w*.51,h*.4],[w*.33,h*.3],[w*.26,h*.1]],ink,w*.012);path(ctx,[[w*.5,h*.5],[w*.71,h*.3]],ink,w*.008);}
 }
 if(id.startsWith('gta')) {
  const light=id==='gta-white',pink=light?'#db8bac':'#d068a8';
  if(touch){const gradient=ctx.createLinearGradient(0,0,0,h);gradient.addColorStop(0,light?'#a4c7d9':'#3c3565');gradient.addColorStop(1,pink);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);label(ctx,'VI',w*.5,h*.5,h*.78,light?'#eee3d4':'#dba3c1','Georgia');}
  if(shell)for(const side of [-1,1]){const [x,y]=project([side*.8,-.22]);path(ctx,[[x,y+h*.22],[x-w*.02,y]],light?'#7da5aa':'#655277',w*.004);for(let i=0;i<7;i++){const angle=i/6*Math.PI;path(ctx,[[x-w*.02,y],[x+Math.cos(angle)*w*.11,y-Math.sin(angle)*h*.075],[x+Math.cos(angle)*w*.14,y+h*.03]],pink,w*.002);}}
 }
}
