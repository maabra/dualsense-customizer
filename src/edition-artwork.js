// Hand-drawn recreations from official product references, not extracted official maps.
// A secondary UV set projects the front artwork onto the supplied model's surfaces.
export const recreatedEditions = new Set(['anniversary','gt','wolverine-yellow','wolverine-metal','astro','astro-joyful','spiderman','godofwar']);
const neutral = '#24262c';
export function editionPartColor(entry, part, group) {
  const id=entry.id;
  if(id.startsWith('wolverine')) {
    if(group==='trim'||group==='sticks')return id==='wolverine-yellow'?'#f5c72d':group==='sticks'?'#24262c':'#aeb1b5';
    return neutral;
  }
  if(id==='anniversary')return ['buttons','sticks','trim','triggers','ps'].includes(group)?'#626366':'#b5b5ae';
  if(id==='gt')return ['shell','rear','touchpad'].includes(group)?'#e7ebe7':'#202226';
  if(id.startsWith('astro'))return group==='touchpad'?'#111927':['sticks','triggers','buttons','trim'].includes(group)?'#1673dc':'#e8edf1';
  if(id==='spiderman')return group==='buttons'?'#d8dce1':'#17181d';
  if(id==='godofwar')return ['touchpad','shell','rear'].includes(group)?'#dce6ed':'#263f5a';
  return null;
}

function rng(seed=43) {return()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};}
function polygon(ctx,points,fill) {ctx.fillStyle=fill;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function line(ctx,points,color,width=3) {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function text(ctx,value,x,y,size,color,weight='600',align='center') {ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.font=`${weight} ${size}px Arial,sans-serif`;ctx.fillText(value,x,y);}
function slashes(ctx,w,h,color) {
  const random=rng(31);
  for(let i=0;i<3;i++) {
    const sx=w*(.03+i*.19),sy=h*(.82+i*.14),ex=w*(.4+i*.25),ey=h*(-.04+i*.18);
    const dx=ex-sx,dy=ey-sy,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len,half=w*(i===1?.066:.041);
    const points=[];
    for(let k=0;k<=25;k++) {const t=k/25,edge=Math.sin(Math.PI*t)*half*(.35+random()*.95);points.push([sx+dx*t+nx*edge,sy+dy*t+ny*edge]);}
    for(let k=25;k>=0;k--) {const t=k/25,edge=Math.sin(Math.PI*t)*half*(.35+random()*.95);points.push([sx+dx*t-nx*edge,sy+dy*t-ny*edge]);}
    polygon(ctx,points,color);
    for(let k=0;k<14;k++){const t=random();line(ctx,[[sx+dx*t+nx*half*1.25,sy+dy*t+ny*half*1.25],[sx+dx*(t+.06)+nx*half,sy+dy*(t+.06)+ny*half]],color,.8+random()*2);}
  }
}
function carbon(ctx,w,h) {
  ctx.fillStyle='#171a1e';ctx.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=12)for(let x=0;x<w;x+=24) {
    const odd=((x/24+y/12)%2)===0;ctx.fillStyle=odd?'#32363b':'#202429';ctx.fillRect(x,y,22,10);
    ctx.fillStyle=odd?'#40454b':'#2b3036';ctx.fillRect(x+1,y+1,20,1);
  }
}
function gtMark(ctx,x,y,scale=1) {
  ctx.save();ctx.translate(x,y);ctx.transform(1,0,-.22,1,0,0);
  text(ctx,'GT',0,0,54*scale,'#21252a','900');ctx.restore();
  text(ctx,'GRAN TURISMO',x,y+30*scale,13*scale,'#26292c','700');
  text(ctx,'THE REAL DRIVING SIMULATOR',x,y+45*scale,6*scale,'#26292c','500');
}
function spider(ctx,x,y,scale,color) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,0,7,20,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(0,-24,5,7,0,0,Math.PI*2);ctx.fill();
  for(const side of [-1,1])for(let i=0;i<4;i++) {
    const start=-18+i*12,end=-68+i*43;
    polygon(ctx,[[side*4,start],[side*33,start-14],[side*(47-i*3),end],[side*(40-i*3),end+2],[side*25,start-5],[side*4,start+5]],color);
  }
  ctx.restore();
}
function faceSymbol(ctx,part,color,w,h) {
  const cx=w/2,cy=h/2,r=w*.26;ctx.strokeStyle=color;ctx.lineWidth=w*.045;ctx.lineJoin='miter';
  if(part==='button-triangle') {line(ctx,[[cx,cy-r],[cx+r*.92,cy+r*.65],[cx-r*.92,cy+r*.65],[cx,cy-r]],color,w*.045);}
  else if(part==='button-square')ctx.strokeRect(cx-r*.72,cy-r*.72,r*1.44,r*1.44);
  else if(part==='button-circle'){ctx.beginPath();ctx.arc(cx,cy,r*.85,0,Math.PI*2);ctx.stroke();}
  else if(part==='button-cross'){line(ctx,[[cx-r*.72,cy-r*.72],[cx+r*.72,cy+r*.72]],color,w*.045);line(ctx,[[cx+r*.72,cy-r*.72],[cx-r*.72,cy+r*.72]],color,w*.045);}
}

export function createEditionCanvas(id,part,group) {
  if(!recreatedEditions.has(id)||!['shell','touchpad','trim','buttons','dpad','ps'].includes(group))return null;
  // Controls use local UVs; all shell and trim halves share a continuous front layout.
  const touch=group==='touchpad',button=group==='buttons'||group==='dpad'||part==='ps';
  const canvas=document.createElement('canvas');canvas.width=button?256:touch?1024:1536;canvas.height=button?256:touch?552:998;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const metal=id==='wolverine-metal',wolverine=id.startsWith('wolverine');
  let base='#b5b5ae';
  if(wolverine)base=group==='trim'?(metal?'#b6b9bd':'#f5c72d'):neutral;
  if(id==='gt')base=['trim','buttons','dpad'].includes(group)?'#1e2226':'#ecede9';
  if(id.startsWith('astro'))base=touch?'#111927':button?'#1772da':'#eef1f4';
  if(id==='spiderman')base=group==='buttons'?'#dfe2e8':'#17181d';
  if(id==='godofwar')base=touch||group==='shell'?'#dee8ef':'#293f57';
  if(id==='anniversary'&&['buttons','ps','trim'].includes(group))base='#626366';
  ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
  if(group==='buttons') {
    let ink=wolverine?(metal?'#b4b4b5':'#e1b62c'):id.startsWith('astro')?'#e9f2ff':id==='spiderman'?'#6c747f':'#d8dce0';
    if(id==='anniversary')ink={'button-triangle':'#45b8a5','button-circle':'#e86b74','button-cross':'#76a3df','button-square':'#d48fba'}[part];
    faceSymbol(ctx,part,ink,w,h);return canvas;
  }
  if(group==='dpad') {
    if(wolverine) {
      ctx.save();ctx.translate(w/2,h/2);ctx.rotate({'dpad-up':0,'dpad-right':Math.PI/2,'dpad-down':Math.PI,'dpad-left':-Math.PI/2}[part]);
      polygon(ctx,[[-18,-7],[18,-7],[0,-25]],metal?'#b8b9bb':'#e5bd35');ctx.restore();
    }
    return canvas;
  }
  if(part==='ps')return null;
  if(wolverine) {
    const ink=metal?'#c9cacc':'#f7cb33';
    if(touch)slashes(ctx,w,h,ink);
    if(group==='shell') {
      const random=rng(122);
      ctx.save();ctx.beginPath();ctx.rect(0,0,w*.28,h*.31);ctx.rect(w*.8,h*.43,w*.2,h*.48);ctx.clip();
      for(let i=0;i<150;i++) {const x=random()*w,y=random()*h;line(ctx,[[x,y],[x+w*.12,y-h*.14]],i%2?'#44464b':'#33353b',1+random()*3);}
      ctx.restore();ctx.save();ctx.beginPath();ctx.rect(w*.02,h*.2,w*.31,h*.66);ctx.clip();
      ctx.translate(w*.055,h*.23);slashes(ctx,w*.38,h*.56,ink);ctx.restore();
    }
  }
  if(id==='gt') {
    if(group==='trim')carbon(ctx,w,h);
    if(touch) {
      ctx.fillStyle='#1b1f23';ctx.fillRect(w*.36,0,w*.28,h);ctx.fillStyle='#eceeea';ctx.fillRect(w*.49,0,w*.018,h);
      text(ctx,'E',w*.82,h*.18,h*.1,'#c93042');ctx.strokeStyle='#c93042';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w*.82,h*.18,h*.065,0,Math.PI*2);ctx.stroke();
      polygon(ctx,[[w*.85,h*.33],[w*.89,h*.23],[w*.93,h*.33]],'#286db5');
      for(const x of [.13,.87]){ctx.strokeStyle='#777e80';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(w*x,h*.81,w*.022,h*.085,0,0,Math.PI*2);ctx.stroke();}
    }
    if(group==='shell') {
      gtMark(ctx,w*.162,h*.45,.8);
      ctx.strokeStyle='#202428';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(w*.15,h*.6,w*.055,h*.085,0,0,Math.PI*2);ctx.stroke();
      text(ctx,'30',w*.15,h*.6,h*.12,'#121619','900');
      text(ctx,'POLYPHONY',w*.15,h*.71,h*.014,'#303438');text(ctx,'DIGITAL',w*.15,h*.731,h*.018,'#303438','700');
      ctx.save();ctx.translate(w*.85,h*.61);ctx.rotate(-.26);ctx.strokeStyle='#24282b';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,w*.035,h*.065,0,0,Math.PI*2);ctx.stroke();text(ctx,'GT',0,0,h*.055,'#202429','900');ctx.restore();
      ctx.save();ctx.translate(w*.81,h*.75);ctx.rotate(1.2);text(ctx,'THE DRIVE OF YOUR LIFE',0,0,h*.014,'#23272b','700');ctx.restore();
    }
  }
  if(id.startsWith('astro')) {
    if(touch) {
      ctx.fillStyle='#55c7fb';
      if(id==='astro-joyful') {for(const x of [.32,.68])line(ctx,[[w*(x-.075),h*.55],[w*x,h*.39],[w*(x+.075),h*.55]],'#5ed3ff',w*.035);}
      else for(const x of [.33,.67]){ctx.beginPath();ctx.roundRect(w*x-w*.045,h*.27,w*.09,h*.44,w*.04);ctx.fill();}
    }
    if(group==='shell') {
      for(const side of [-1,1]){
        const x=side<0?w*.07:w*.82;
        polygon(ctx,[[x,h*.54],[x+w*.13,h*.6],[x+w*.12,h],[x-w*.025,h]],'#1774d8');
        line(ctx,[[x+w*.08,h*.17],[x+w*.11,h*.29],[x+w*.08,h*.37],[x+w*.12,h*.5]],'#8aafcb',2);
        line(ctx,[[x+w*.03,h*.23],[x+w*.04,h*.31],[x+w*.075,h*.34]],'#b8cddc',2);
      }
    }
  }
  if(id==='spiderman') {
    if(touch)spider(ctx,w*.5,h*.48,h*.004,'#f1f1f3');
    if(group==='shell') {
      ctx.fillStyle='#bd2038';ctx.fillRect(w*.73,0,w*.27,h);
      const random=rng(882);ctx.save();ctx.beginPath();ctx.rect(w*.62,0,w*.38,h);ctx.clip();
      for(let i=0;i<48;i++) {
        const y=random()*h,x=w*(.67+random()*.14),length=w*(.08+random()*.19);
        ctx.strokeStyle='#111318';ctx.lineWidth=3+random()*13;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+length*.25,y-h*.035,x+length*.8,y+h*.04,x+length,y-h*.1);ctx.stroke();
      }
      ctx.restore();
    }
  }
  if(id==='godofwar') {
    if(group==='shell') {
      for(const side of [-1,1]){const x=side<0?0:w*.82;polygon(ctx,[[x,h*.48],[x+w*.18,h*.57],[x+w*.18,h],[x,h]],'#29476a');}
    }
    if(touch) {
      ctx.strokeStyle='#809bb4';ctx.lineWidth=3;ctx.beginPath();ctx.arc(w*.5,h*.48,h*.34,0,Math.PI*2);ctx.stroke();
      polygon(ctx,[[w*.29,h*.62],[w*.28,h*.36],[w*.35,h*.2],[w*.38,h*.34],[w*.43,h*.27],[w*.46,h*.39],[w*.53,h*.43],[w*.49,h*.54],[w*.39,h*.5],[w*.37,h*.65]],'#486786');
      polygon(ctx,[[w*.55,h*.65],[w*.53,h*.37],[w*.58,h*.31],[w*.62,h*.34],[w*.64,h*.27],[w*.7,h*.35],[w*.72,h*.44],[w*.7,h*.58]],'#486786');
      ctx.fillStyle='#e2ecf3';ctx.beginPath();ctx.arc(w*.62,h*.4,4,0,Math.PI*2);ctx.fill();
    }
  }
  if(id==='anniversary'&&group==='shell')text(ctx,'30ᵗʰ',w*.83,h*.68,h*.023,'#85857f','600');
  return canvas;
}

export function artworkUVs(geometry,group) {
  const positions=geometry.attributes.position,index=geometry.index;
  let x0=-1,x1=1,y0=-.65,y1=.65;
  if(group==='touchpad'){x0=-.405;x1=.405;y0=.205;y1=.642;}
  else if(group==='buttons'||group==='dpad') {
    x0=y0=Infinity;x1=y1=-Infinity;
    for(let i=0;i<index.count;i++){const id=index.getX(i),x=positions.getX(id),y=positions.getY(id);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  }
  const uv=new Float32Array(positions.count*2);
  for(let i=0;i<positions.count;i++){uv[i*2]=(positions.getX(i)-x0)/(x1-x0);uv[i*2+1]=(positions.getY(i)-y0)/(y1-y0);}
  return uv;
}
