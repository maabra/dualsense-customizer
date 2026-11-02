import referenceTraces from './reference-traces.json';
import {anniversaryPsLogo} from './anniversary-ps';
import {additionalEditions,catalogPartColor,drawCatalogArtwork,drawTracedArtwork,catalogEditionSurface} from './catalog-artwork';
// Reference-based recreations, not extracted official production maps.
// A secondary UV set projects the front artwork onto the supplied model's surfaces.
export const recreatedEditions = new Set(['anniversary','gt','wolverine-yellow','wolverine-metal','astro','astro-joyful','spiderman','godofwar',...additionalEditions]);
const neutral = '#24262c';
export function editionPartColor(entry, part, group) {
  const id=entry.id;
  if(additionalEditions.has(id))return catalogPartColor(id,group,part);
  if(id.startsWith('wolverine')) {
    if(group==='ps')return id==='wolverine-yellow'?'#e8bd29':'#b7babf';
    if(group==='trim'||group==='sticks')return id==='wolverine-yellow'?'#f5c72d':group==='sticks'?'#24262c':'#aeb1b5';
    return neutral;
  }
  if(id==='anniversary')return ['buttons','dpad','sticks','trim','triggers','ps'].includes(group)?'#606875':'#a1a4ad';
  if(id==='gt')return ['shell','touchpad'].includes(group)?'#e7ebe7':'#202226';
  if(id.startsWith('astro'))return group==='touchpad'?'#111318':group==='ps'?'#aeb4bc':group==='mute'?'#50565c':'#eef0f6';
  if(id==='spiderman')return group==='buttons'?'#d8dce1':'#17181d';
  if(id==='godofwar')return ['shell','rear'].includes(group)?'#35447c':['buttons','dpad','sticks','triggers','create','options'].includes(group)?'#252934':'#dce6ed';
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
  const cx=w/2,cy=h/2,r=w*.36;ctx.strokeStyle=color;ctx.lineWidth=w*.055;ctx.lineJoin='round';ctx.lineCap='round';
  if(part==='button-triangle') {line(ctx,[[cx,cy-r],[cx+r*.92,cy+r*.65],[cx-r*.92,cy+r*.65],[cx,cy-r]],color,w*.055);}
  else if(part==='button-square')ctx.strokeRect(cx-r*.72,cy-r*.72,r*1.44,r*1.44);
  else if(part==='button-circle'){ctx.beginPath();ctx.arc(cx,cy,r*.85,0,Math.PI*2);ctx.stroke();}
  else if(part==='button-cross'){line(ctx,[[cx-r*.72,cy-r*.72],[cx+r*.72,cy+r*.72]],color,w*.055);line(ctx,[[cx+r*.72,cy-r*.72],[cx-r*.72,cy+r*.72]],color,w*.055);}
}

function standardInk(hex){
 const rgb=hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>.55?'#858c98':'#bec5cf';
}
function faceInk(id,part){
 if(id==='anniversary')return {'button-triangle':'#45b8a5','button-circle':'#e86b74','button-cross':'#76a3df','button-square':'#d48fba'}[part];
 if(id.startsWith('wolverine'))return id==='wolverine-metal'?'#b4b4b5':'#e1b62c';
 if(id.startsWith('astro'))return '#4bacc4';
 if(id.startsWith('gta'))return id==='gta-white'?'#b18baa':'#b47d9f';
 if(id==='genshin')return '#b79e6c';
 if(id==='monsterhunter')return '#d7c9d1';
 if(id==='gow20')return '#ad2334';
 if(id==='iconblue')return '#b8e6fa';
 if(id==='yotei-gold')return '#b8953d';
 if(id==='spiderman')return '#6c747f';
 return additionalEditions.has(id)?(['lisa','marathon','yotei-black','gta-white'].includes(id)?'#747a83':'#74767e'):'#d8dce0';
}
export function createControlCanvas(hex,part,group,detail='low') {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=detail==='low'||detail.endsWith('-mobile')?512:1024;
  const ctx=canvas.getContext('2d'),w=canvas.width;
  ctx.fillStyle=hex;ctx.fillRect(0,0,w,w);
  const ink=standardInk(hex);
  if(group==='buttons')faceSymbol(ctx,part,ink,w,w);
  else{
    ctx.translate(w/2,w/2);ctx.rotate({'dpad-up':0,'dpad-right':Math.PI/2,'dpad-down':Math.PI,'dpad-left':-Math.PI/2}[part]);ctx.scale(w/256,w/256);
    polygon(ctx,[[-18,-7],[18,-7],[0,-25]],ink);
  }
  return canvas;
}

// Dot centers and radii registered from the Joyful controller reference.
const joyfulEyeDots=[[[0.29704,0.3562,0.00769],[0.3206,0.356,0.00779],[0.34337,0.3561,0.00769],[0.64511,0.356,0.00788],[0.66863,0.356,0.00779],[0.69138,0.3563,0.00769],[0.2747,0.35969,0.0062],[0.36606,0.36,0.00632],[0.62267,0.36032,0.00608],[0.71411,0.36,0.0062],[0.25068,0.39914,0.00868],[0.27412,0.39905,0.00965],[0.29715,0.39951,0.0098],[0.32061,0.39924,0.00965],[0.34341,0.39954,0.0095],[0.36656,0.39902,0.00851],[0.38991,0.39902,0.00851],[0.59846,0.39914,0.00868],[0.62217,0.39914,0.00868],[0.64542,0.39934,0.0095],[0.66834,0.39917,0.00965],[0.69181,0.39926,0.0098],[0.71511,0.39905,0.00965],[0.73815,0.39856,0.0086],[0.22737,0.442,0.00877],[0.25042,0.44282,0.0095],[0.27374,0.44258,0.00957],[0.29728,0.44279,0.00965],[0.32035,0.44256,0.00973],[0.34345,0.44256,0.00973],[0.36652,0.44279,0.00965],[0.39002,0.44279,0.00965],[0.41272,0.442,0.00877],[0.57585,0.44227,0.00868],[0.5989,0.44288,0.00973],[0.62216,0.44279,0.00965],[0.64532,0.44254,0.00965],[0.66824,0.4425,0.00973],[0.69174,0.44279,0.00965],[0.71474,0.44256,0.00973],[0.738,0.44258,0.0098],[0.76164,0.4424,0.0086],[0.22749,0.48525,0.0095],[0.27384,0.48521,0.00965],[0.29731,0.48548,0.00957],[0.32056,0.48503,0.00957],[0.34323,0.48503,0.00957],[0.59885,0.48569,0.00934],[0.64523,0.48516,0.00957],[0.66821,0.48548,0.00957],[0.69171,0.48548,0.00957],[0.71496,0.48503,0.00957],[0.76143,0.48527,0.00965],[0.20684,0.48758,0.0075],[0.25048,0.48552,0.00926],[0.36668,0.486,0.00926],[0.38979,0.486,0.00926],[0.41309,0.48571,0.00851],[0.43292,0.4885,0.00596],[0.55568,0.48833,0.00596],[0.57578,0.48504,0.0086],[0.62204,0.4855,0.0091],[0.73801,0.48533,0.00918],[0.78184,0.4875,0.00769],[0.2042,0.528,0.00842],[0.22737,0.52832,0.0086],[0.25066,0.52824,0.00851],[0.27398,0.52851,0.00759],[0.29714,0.52851,0.00759],[0.32033,0.52832,0.0075],[0.34337,0.5281,0.00769],[0.36681,0.5283,0.00769],[0.39009,0.528,0.00816],[0.41315,0.52856,0.0086],[0.43645,0.52885,0.00834],[0.55223,0.5286,0.00834],[0.57579,0.52842,0.00842],[0.59861,0.52833,0.00851],[0.62205,0.52832,0.0075],[0.64547,0.528,0.00769],[0.66853,0.5283,0.00769],[0.69138,0.5283,0.00769],[0.71491,0.52841,0.00759],[0.73828,0.52858,0.00842],[0.76144,0.52824,0.00851],[0.78448,0.528,0.00834],[0.20458,0.5712,0.00769],[0.22698,0.56768,0.00608],[0.25,0.562,0.00344],[0.39116,0.562,0.00344],[0.41387,0.56814,0.00643],[0.43642,0.572,0.0075],[0.55216,0.5717,0.00769],[0.57497,0.568,0.00643],[0.59746,0.56222,0.00365],[0.73922,0.562,0.00344],[0.76162,0.56814,0.00643],[0.78464,0.5712,0.00769]],[[0.27299,0.22667,0.00211],[0.2742,0.27108,0.00438],[0.29698,0.27227,0.00471],[0.32112,0.27314,0.00322],[0.34329,0.27143,0.00455],[0.36638,0.272,0.00438],[0.3908,0.275,0.00421],[0.59794,0.27333,0.00365],[0.62123,0.27125,0.00486],[0.64423,0.27138,0.00438],[0.66721,0.275,0.00421],[0.69145,0.27333,0.00421],[0.71454,0.27127,0.00403],[0.66715,0.31244,0.00632],[0.27543,0.31307,0.00666],[0.29754,0.31371,0.00719],[0.32143,0.31343,0.00643],[0.34421,0.31337,0.00719],[0.367,0.31358,0.0075],[0.39116,0.314,0.00596],[0.41151,0.31341,0.00501],[0.57774,0.31143,0.00455],[0.59806,0.314,0.00596],[0.62161,0.31371,0.00719],[0.64383,0.31365,0.00709],[0.69199,0.31416,0.0074],[0.71336,0.31329,0.00643],[0.34728,0.34982,0.0057],[0.66709,0.36259,0.00709],[0.20474,0.3555,0.00486],[0.25192,0.35443,0.00643],[0.30542,0.356,0.00322],[0.4133,0.35528,0.00759],[0.43558,0.35471,0.00643],[0.553,0.35526,0.00632],[0.57532,0.35508,0.00759],[0.68382,0.36117,0.00596],[0.78437,0.35537,0.0053],[0.22716,0.35467,0.00471],[0.76167,0.35617,0.00596],[0.43683,0.3975,0.00688],[0.55213,0.39914,0.0074],[0.5751,0.39843,0.00825],[0.20504,0.4,0.0057],[0.22675,0.39842,0.00698],[0.46092,0.40187,0.00471],[0.52993,0.40178,0.00516],[0.76185,0.398,0.00688],[0.78448,0.4,0.00557],[0.17744,0.40267,0.00211],[0.77514,0.41867,0.00211],[0.43691,0.44145,0.00807],[0.46097,0.44178,0.0073],[0.52949,0.44078,0.00779],[0.55226,0.44118,0.00807],[0.17726,0.4402,0.00544],[0.20433,0.44248,0.00788],[0.7847,0.44133,0.00759],[0.81281,0.43943,0.00322],[0.58728,0.466,0.00243],[0.79029,0.48191,0.00583],[0.80706,0.48305,0.0075],[0.52907,0.48428,0.00797],[0.21552,0.53524,0.00557],[0.51221,0.528,0.00298],[0.16954,0.52933,0.00211],[0.2265,0.56714,0.00868],[0.19969,0.56772,0.00655],[0.25026,0.56988,0.00851],[0.27414,0.5687,0.00769],[0.29748,0.57017,0.00719],[0.45975,0.56973,0.0074],[0.52816,0.5692,0.00666],[0.64475,0.56973,0.0074],[0.6688,0.5705,0.00769],[0.76264,0.57247,0.00868],[0.18003,0.56853,0.00471],[0.31912,0.57105,0.00788],[0.3437,0.5707,0.00769],[0.36731,0.57218,0.00807],[0.62196,0.57106,0.00709],[0.80838,0.5687,0.00583],[0.69612,0.592,0.00211],[0.20535,0.61325,0.00688],[0.22793,0.61322,0.00825],[0.25162,0.61183,0.00842],[0.2749,0.61444,0.00516],[0.32561,0.61167,0.00421],[0.3444,0.61472,0.00608],[0.36894,0.61505,0.00557],[0.39098,0.6127,0.00825],[0.41425,0.6143,0.00834],[0.43561,0.61425,0.00842],[0.46029,0.6134,0.00769],[0.5292,0.61362,0.00788],[0.5528,0.614,0.00807],[0.57512,0.61388,0.00851],[0.59889,0.61369,0.00877],[0.62141,0.615,0.00596],[0.64483,0.61536,0.00608],[0.66629,0.61162,0.00688],[0.69031,0.61478,0.00583],[0.71364,0.61391,0.00583],[0.73672,0.61224,0.00851],[0.7611,0.61328,0.00834],[0.7825,0.61295,0.0075],[0.29582,0.61481,0.00632],[0.31537,0.612,0.00211],[0.20495,0.65657,0.00557],[0.24801,0.64923,0.00438],[0.29203,0.646,0.00243],[0.39134,0.65548,0.00677],[0.41275,0.65484,0.00677],[0.43625,0.65632,0.0075],[0.55148,0.656,0.0062],[0.57588,0.65531,0.00655],[0.59707,0.65467,0.00596],[0.73623,0.65222,0.00516],[0.76272,0.6551,0.00677],[0.78357,0.65646,0.0062],[0.22613,0.65585,0.00632],[0.2579,0.65867,0.00211],[0.61782,0.66133,0.00211],[0.22306,0.696,0.00243],[0.39296,0.69667,0.00421],[0.41029,0.6995,0.00344],[0.44058,0.69886,0.00322],[0.54978,0.7028,0.00385],[0.5783,0.69467,0.00211],[0.2333,0.712,0.00243],[0.57543,0.708,0.00211]]];
function drawAstroArtwork(ctx,id,group,w,h){
 if(group==='touchpad'){
  if(id==='astro-joyful'){
   for(const [index,color]of [[1,'#151746'],[0,'#06a4db']]){
    ctx.fillStyle=color;
    for(const [x,y,r]of joyfulEyeDots[index]){ctx.beginPath();ctx.arc(x*w,y*h,r*w,0,Math.PI*2);ctx.fill();}
   }
  }else{
   // The first edition uses the same face plate with round open eyes.
   for(const cx of [.325,.675])for(let row=-8;row<=8;row++)for(let col=-8;col<=8;col++){
    const x=col*.0225,y=row*.041;if((x/.145)**2+(y/.265)**2>1)continue;
    ctx.fillStyle=(x/.121)**2+(y/.223)**2<1?'#06a4db':'#151746';
    ctx.beginPath();ctx.arc((cx+x)*w,(.46+y)*h,w*.0073,0,Math.PI*2);ctx.fill();
   }
  }
  return;
 }
 if(group!=='shell')return;
 // One continuous, curved blue inlay per grip. The white shell is left
 // uninterrupted around the controls; no flat-ended lower-grip rectangles.
 ctx.save();ctx.translate(w/2,h*.65/1.3);ctx.scale(w/2,-h/1.3);
 for(const side of [-1,1]){
  ctx.save();ctx.scale(side,1);ctx.fillStyle='#0953cf';
  ctx.beginPath();ctx.moveTo(.858,.317);
  ctx.bezierCurveTo(.852,.189,.835,.104,.782,.017);
  ctx.bezierCurveTo(.740,-.042,.701,-.074,.700,-.171);
  ctx.bezierCurveTo(.696,-.304,.768,-.474,.826,-.593);
  ctx.bezierCurveTo(.842,-.626,.899,-.584,.930,-.508);
  ctx.bezierCurveTo(.970,-.411,.978,-.224,.962,-.103);
  ctx.bezierCurveTo(.946,.065,.901,.235,.858,.317);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#0953cf';ctx.lineWidth=.0024;ctx.beginPath();ctx.moveTo(.858,.317);ctx.bezierCurveTo(.848,.41,.825,.51,.804,.58);ctx.stroke();
  ctx.restore();
 }
 ctx.restore();
}

export function createEditionCanvas(id,part,group,detail='low') {
  if(!recreatedEditions.has(id)||!['shell','rear','touchpad','trim','buttons','dpad','ps'].includes(group))return null;
  // Controls use local UVs; all shell and trim halves share a continuous front layout.
  const touch=group==='touchpad',button=group==='buttons'||group==='dpad'||part==='ps';
  const canvas=document.createElement('canvas');canvas.width=button?512:touch?1536:2048;canvas.height=button?512:Math.round(canvas.width*(touch?552/1024:998/1536));
  if(detail!=='low'){
    const mobile=detail.endsWith('-mobile');
    canvas.width=button?(mobile?512:1024):(mobile?2048:4096);
    canvas.height=button?canvas.width:Math.round(canvas.width*(touch?552/1024:998/1536));
  }
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const metal=id==='wolverine-metal',wolverine=id.startsWith('wolverine');
  let base='#b5b5ae';
  if(wolverine)base=group==='trim'?(metal?'#b6b9bd':'#f5c72d'):neutral;
  if(id==='gt')base=['trim','rear','buttons','dpad'].includes(group)?'#1e2226':'#ecede9';
  if(id.startsWith('astro'))base=touch?'#111318':'#eef0f6';
  if(id==='spiderman')base=group==='buttons'?'#dfe2e8':'#17181d';
  if(id==='godofwar')base=['shell','rear'].includes(group)?'#35447c':['buttons','dpad'].includes(group)?'#252934':'#dee8ef';
  if(id==='anniversary')base=['buttons','dpad','ps','trim'].includes(group)?'#606875':'#a1a4ad';
  if(additionalEditions.has(id))base=catalogPartColor(id,group,part);
  // Keep the Anniversary PS emblem transparent so the model's substrate remains visible.
  if(group!=='ps'||id!=='anniversary'){ctx.fillStyle=base;ctx.fillRect(0,0,w,h);}
  if(group==='buttons') {
    faceSymbol(ctx,part,faceInk(id,part),w,h);return canvas;
  }
  if(group==='dpad') {
    if(wolverine) {
      ctx.save();ctx.translate(w/2,h/2);ctx.rotate({'dpad-up':0,'dpad-right':Math.PI/2,'dpad-down':Math.PI,'dpad-left':-Math.PI/2}[part]);ctx.scale(w/256,h/256);
      polygon(ctx,[[-18,-7],[18,-7],[0,-25]],metal?'#b8b9bb':'#e5bd35');ctx.restore();
    }
    if(id.startsWith('astro')) {
      const angle={'dpad-up':0,'dpad-right':Math.PI/2,'dpad-down':Math.PI,'dpad-left':-Math.PI/2}[part];
      ctx.save();ctx.translate(w/2,h/2);ctx.rotate(angle);ctx.scale(w/256,h/256);polygon(ctx,[[-15,-9],[15,-9],[0,-26]],'#4bacc4');ctx.restore();
    }
    if(!wolverine&&!id.startsWith('astro')) {
      ctx.save();ctx.translate(w/2,h/2);ctx.rotate({'dpad-up':0,'dpad-right':Math.PI/2,'dpad-down':Math.PI,'dpad-left':-Math.PI/2}[part]);ctx.scale(w/256,h/256);
      polygon(ctx,[[-18,-7],[18,-7],[0,-25]],id==='genshin'?'#b79e6c':id==='iconblue'?'#b8e6fa':id==='monsterhunter'?'#d7c9d1':id==='gow20'?'#ad2334':id==='yotei-gold'?'#b8953d':id.startsWith('gta')?(id==='gta-white'?'#b8a4bb':'#b285a3'):id==='fortnite'?'#60869c':'#90949c');ctx.restore();
    }
    return canvas;
  }
  if(part==='ps') {
    if(id!=='anniversary')return null;
    anniversaryPsLogo(ctx,w,h);return canvas;
  }
  if(id.startsWith('astro')&&['shell','touchpad','trim'].includes(group)){drawAstroArtwork(ctx,id,group,w,h);return canvas;}
  if(id==='gt'&&touch) {
    // Rebuild the pad's simple printed geometry as clean vectors. Photograph
    // thresholds lose the red ink and turn the hood fasteners into noisy blobs.
    ctx.fillStyle='#222529';ctx.fillRect(w*.325,0,w*.16,h);ctx.fillRect(w*.516,0,w*.16,h);
    ctx.strokeStyle='#c92b40';ctx.lineWidth=w*.0035;ctx.beginPath();ctx.ellipse(w*.819,h*.206,w*.0435,h*.0806,0,0,Math.PI*2);ctx.stroke();
    text(ctx,'E',w*.819,h*.206,h*.125,'#c92b40','700');
    polygon(ctx,[[w*.838,h*.345],[w*.893,h*.219],[w*.931,h*.359]],'#286eb2');
    polygon(ctx,[[w*.895,h*.24],[w*.875,h*.31],[w*.894,h*.305],[w*.883,h*.35],[w*.914,h*.285],[w*.897,h*.295]],'#ca293c');
    for(const x of [.18,.82]) {
      ctx.save();ctx.translate(w*x,h*.79);ctx.scale(w,h);
      ctx.beginPath();ctx.moveTo(-.027,-.105);ctx.bezierCurveTo(-.029,-.165,.029,-.165,.027,-.105);ctx.lineTo(.038,.08);ctx.bezierCurveTo(.041,.16,-.041,.16,-.038,.08);ctx.closePath();
      ctx.fillStyle='#777d80';ctx.fill();ctx.strokeStyle='#32383b';ctx.lineWidth=.003;ctx.stroke();
      ctx.beginPath();ctx.moveTo(-.014,-.09);ctx.bezierCurveTo(-.014,-.13,.014,-.13,.014,-.09);ctx.lineTo(.02,.06);ctx.bezierCurveTo(.021,.12,-.021,.12,-.02,.06);ctx.closePath();ctx.stroke();
      ctx.beginPath();ctx.ellipse(0,.055,.02,.033,0,0,Math.PI);ctx.stroke();
      ctx.fillStyle='#343a3d';for(const side of [-1,1])for(const y of [-.085,.015,.10]){ctx.beginPath();ctx.ellipse(side*.027,y,.003,.0055,0,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    return canvas;
  }
  if(additionalEditions.has(id)) {drawCatalogArtwork(ctx,id,group,w,h);return canvas;}
  if(!id.startsWith('astro')&&drawTracedArtwork(ctx,id,group,w,h))return canvas;
  if(group==='rear') {
    // Factory lettering already exists in the original texture/normal set.
    // A second planar label would duplicate it and stretch across the top bevel.
    if(wolverine)for(const side of [-1,1]) {
      ctx.save();if(side>0){ctx.translate(w,0);ctx.scale(-1,1);}
      polygon(ctx,[[0,h*.69],[w*.21,h*.72],[w*.27,h],[0,h]],metal?'#b7babf':'#e8bd29');ctx.restore();
    }
    if(id==='gt') {
      ctx.save();ctx.translate(w*.5,h*.32);ctx.transform(1,0,-.22,1,0,0);
      text(ctx,'GT',0,0,w*.045,'#b1b5ba','900');ctx.restore();
    }
    // Keep unknown regulatory text and serial numbers out of the recreation.
    if(id.startsWith('astro')) {
      ctx.fillStyle='#b2bbc5';ctx.beginPath();ctx.roundRect(w*.455,h*.27,w*.09,h*.09,w*.018);ctx.fill();
      ctx.strokeStyle='#b2bbc5';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.5,h*.27);ctx.lineTo(w*.5,h*.24);ctx.stroke();
      ctx.fillStyle=base;for(const x of [.482,.518]){ctx.beginPath();ctx.arc(w*x,h*.31,w*.008,0,Math.PI*2);ctx.fill();}
    }
    return canvas;
  }
  if(wolverine) {
    const ink=metal?'#c9cacc':'#f7cb33';
    if(touch||group==='shell') {
      const project=([x,y])=>touch?[(x+.405)/.81*w,(.642-y)/.437*h]:[(x+1)/2*w,(.65-y)/1.3*h];
      ctx.save();
      for(const path of referenceTraces.scratches)polygon(ctx,path.map(project),'#55565b');
      for(const path of referenceTraces.claws)polygon(ctx,path.map(project),ink);
      ctx.restore();
      if(group==='shell') {
        // Create/Options legends sit on the shell, above their separate buttons.
        for(let i=-1;i<=1;i++)line(ctx,[project([.452,.565+i*.011]),project([.482,.565+i*.011])],ink,w*.0014);
        for(const a of [-.7,0,.7])line(ctx,[project([-.467+Math.sin(a)*.034,.565+Math.cos(a)*.016]),project([-.467+Math.sin(a)*.045,.565+Math.cos(a)*.031])],ink,w*.0014);
      }
      return canvas;
    }
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
  return canvas;
}

export function artworkUVs(geometry,group) {
  const positions=geometry.attributes.position,index=geometry.index;
  let x0=-1,x1=1,y0=-.65,y1=.65;
  if(group==='touchpad'){x0=-.405;x1=.405;y0=.205;y1=.642;}
  else if(group==='buttons'||group==='dpad'||group==='ps') {
    x0=y0=Infinity;x1=y1=-Infinity;
    for(let i=0;i<index.count;i++){const id=index.getX(i),x=positions.getX(id),y=positions.getY(id);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  }
  const uv=new Float32Array(positions.count*2);
  for(let i=0;i<positions.count;i++){const u=(positions.getX(i)-x0)/(x1-x0);uv[i*2]=group==='rear'?1-u:u;uv[i*2+1]=(positions.getY(i)-y0)/(y1-y0);}
  return uv;
}

// Rubber, printed paint and molded plastic should not share one finish.
export function editionSurface(id,group) {
  if(!recreatedEditions.has(id))return null;
  const catalogSurface=catalogEditionSurface(id,group);if(catalogSurface)return catalogSurface;
  if(group==='sticks')return {roughness:.88,metalness:0,clearcoat:0};
  if(group==='buttons'||group==='dpad')return {roughness:.25,metalness:0,clearcoat:.35};
  if(id==='007'&&['shell','rear'].includes(group))return {roughness:.34,metalness:.72,clearcoat:.18};
  if(id==='yotei-gold')return {roughness:group==='rear'?.72:group==='trim'?.52:.56,metalness:0,clearcoat:.04};
  if(id==='lisa'&&['shell','trim','rear'].includes(group))return {roughness:.13,metalness:.18,clearcoat:1};
  if(id==='lastofus'&&['shell','trim','rear'].includes(group))return {roughness:.92,metalness:0,clearcoat:0};
  if(id==='monsterhunter'&&['shell','rear'].includes(group))return {roughness:.32,metalness:.45,clearcoat:.4};
  if(id==='genshin')return {roughness:.53,metalness:0,clearcoat:.06};
  if(id==='gow20')return {roughness:.64,metalness:0,clearcoat:.02};
  if(id==='iconblue')return {roughness:group==='trim'?.45:.63,metalness:0,clearcoat:.05};
  if(group==='rear')return {roughness:.72,metalness:0,clearcoat:0};
  if(id.startsWith('astro'))return {roughness:group==='rear'?.68:group==='touchpad'?.34:group==='trim'?.48:.42,metalness:0,clearcoat:group==='rear'?.03:.15};
  if(group==='touchpad')return {roughness:.56,metalness:0,clearcoat:.08};
  if(id==='concord')return {roughness:.7,metalness:0,clearcoat:.02};
  if(id==='lebron')return {roughness:.68,metalness:0,clearcoat:.03};
  if(id==='ff16')return {roughness:group==='touchpad'?.59:group==='triggers'?.38:group==='ps'?.3:['create','options'].includes(group)?.42:.53,metalness:0,clearcoat:.035};
  if(['hogwarts','deathstranding'].includes(id))return {roughness:.67,metalness:0,clearcoat:.02};
  if(id==='helldivers')return {roughness:group==='rear'?.72:.62,metalness:0,clearcoat:.025};
  if(id.startsWith('yotei'))return {roughness:.7,metalness:0,clearcoat:0};
  if(id==='anniversary')return {roughness:.68,metalness:0,clearcoat:.025};
  if(id==='camo')return {roughness:.75,metalness:0,clearcoat:0};
  if(id==='marathon')return {roughness:.62,metalness:0,clearcoat:.03};
  if(id==='wolverine-metal'&&group==='trim')return {roughness:.34,metalness:.7,clearcoat:.15};
  return {roughness:.53,metalness:0,clearcoat:.12};
}
