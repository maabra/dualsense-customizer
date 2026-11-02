import tracesUrl from './catalog-traces.json?url';
import {drawFf16Artwork} from './ff16-artwork';
import {drawGtaArtwork,gtaColor,gtaSurface} from './gta-artwork';

export const additionalEditions=new Set(['ff16','hogwarts','lebron','concord','fortnite','helldivers','lastofus','deathstranding','yotei-gold','yotei-black','marathon','007','gta-black','gta-white','lisa','camo','genshin','monsterhunter','gow20','iconblue']);
let traces={},tracesLoaded=false,tracesPromise;
export function catalogTracesReady(){return tracesLoaded;}
export function loadCatalogTraces(){
 if(tracesLoaded)return Promise.resolve();
 if(!tracesPromise)tracesPromise=fetch(tracesUrl).then(response=>{
  if(!response.ok)throw new Error(`Edition artwork request failed (${response.status})`);
  return response.json();
 }).then(data=>{traces=data;tracesLoaded=true;}).catch(error=>{tracesPromise=null;throw error;});
 return tracesPromise;
}
const black='#24262c',white='#e8e9e6';
export function catalogPartColor(id,group,part) {
 const control=['buttons','dpad','sticks','triggers','trim','ps','create','options','mute'].includes(group);
 if(id.startsWith('gta'))return gtaColor(id,group);
 if(id==='lastofus')return ['trim','sticks','triggers'].includes(group)?'#cbd0d7':black;
 if(id==='fortnite')return ['buttons','dpad','shell','touchpad'].includes(group)?'#56b9eb':black;
 if(id==='helldivers')return group==='touchpad'?'#2a2d32':['trim','sticks','ps','mute'].includes(group)?'#1c2229':'#24272c';
 if(id==='007')return control&&!['create','options'].includes(group)?black:'#cbb276';
 if(id==='lisa')return '#e6e5df';
 if(id==='camo')return ['shell','touchpad'].includes(group)?'#858184':'#242830';
 if(id==='marathon')return ['sticks','ps'].includes(group)?black:control?'#d8dce0':white;
 if(id==='genshin')return ['trim','sticks','triggers','ps','mute'].includes(group)?'#17586b':'#eee9df';
 if(id==='monsterhunter')return ['trim','sticks','triggers','ps','mute'].includes(group)?black:'#b70932';
 if(id==='gow20')return group==='sticks'?'#24262b':['r1','r2','options'].includes(part)?'#b6122a':group==='ps'?'#64696a':'#dce0df';
 if(id==='iconblue')return ['trim','sticks','touchpad'].includes(group)?'#1265db':['buttons','dpad','triggers'].includes(group)?'#123b9a':'#094db4';
 if(id==='yotei-gold')return group==='ps'?'#747b76':group==='mute'?'#777e79':['trim','sticks','triggers'].includes(group)?'#a3aaa4':'#eee9e1';
 if(id.startsWith('yotei'))return group==='ps'?'#616660':group==='mute'?'#858a87':['trim','sticks','triggers'].includes(group)?'#a6a8a3':'#e3e0d7';
 if(id==='gta-white')return control?'#e2dfe3':'#ececed';
 if(id==='gta-black')return '#202b2b';
 return black;
}
export function catalogEditionSurface(id,group){return id.startsWith('gta')?gtaSurface(id,group):null;}
export function createEditionReliefCanvas(artwork,id,group){
 const gta=id.startsWith('gta')&&['shell','touchpad','rear'].includes(group),astro=id.startsWith('astro')&&['shell','trim'].includes(group),yotei=id==='yotei-gold'&&['shell','touchpad','rear'].includes(group);
 if(!gta&&!astro&&!yotei)return null;
 const canvas=document.createElement('canvas');canvas.width=Math.min(2048,artwork.width);canvas.height=Math.round(canvas.width*artwork.height/artwork.width);
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 if(yotei){
  ctx.fillStyle='#808080';ctx.fillRect(0,0,w,h);
  const project=([x,y])=>group==='touchpad'?[(x+.405)/.81*w,(.642-y)/.437*h]:[(x+1)/2*w,(.65-y)/1.3*h];
  const cuts=group==='touchpad'?[[[-.4,.47],[-.12,.642]],[[-.4,.34],[.13,.642]],[[-.27,.205],[.39,.61]],[[-.02,.205],[.405,.43]]]:group==='shell'?[[[-.94,-.51],[-.78,-.32]],[[-.90,-.60],[-.82,-.16]],[[-.89,.33],[-.69,.55]],[[.73,.16],[.92,.40]],[[.78,-.16],[.98,.02]],[[.78,-.59],[.91,-.29]]]:[[[.12,.54],[.50,.37]],[[-.56,-.27],[.43,-.50]],[[-.18,-.47],[.40,-.39]]];
  // Long tapered molded cuts are independent of the flat gold print. There
  // is no random height noise or photographed shadow in this relief master.
  ctx.fillStyle='#686868';
  for(const [a,b] of cuts){
   const p=project(a),q=project(b),dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy),width=w*.0014;
   const middle=[p[0]+dx*.46,p[1]+dy*.46],nx=-dy/length*width,ny=dx/length*width;
   ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(middle[0]+nx,middle[1]+ny);ctx.lineTo(...q);ctx.lineTo(middle[0]-nx,middle[1]-ny);ctx.closePath();ctx.fill();
  }
 }
 else if(gta)drawGtaArtwork(ctx,id,group,w,h,true,traces[group==='rear'?'gta-rear-logo':'gta-relief']);
 else{
  ctx.fillStyle='#808080';ctx.fillRect(0,0,w,h);
  const p=([x,y])=>[(x+1)/2*w,(.65-y)/1.3*h];
  for(const side of [-1,1]){
   path(ctx,[[side*.48,.015],[side*.49,-.035],[side*.46,-.075]].map(p),'#686868',w*.0015);
   path(ctx,[[side*.19,-.055],[side*.147,-.105],[side*.07,-.105]].map(p),'#686868',w*.0014);
   for(const radius of [.175,.197]){
    const points=Array.from({length:19},(_,i)=>{const a=(225+i*5)*Math.PI/180;return p([side*(.317+Math.cos(a)*radius),Math.sin(a)*radius]);});
    path(ctx,points,'#686868',w*.0013);
   }
   for(const offset of [0,.012])path(ctx,[[side*(.65+offset),-.24],[side*(.675+offset),-.23],[side*(.72+offset),-.32],[side*(.79+offset),-.52],[side*(.775+offset),-.55],[side*(.82+offset),-.61]].map(p),'#686868',w*.0014);
  }
 }
 return canvas;
}
function path(ctx,points,color,width=2){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
function contour(ctx,points) {
 // Preserve the traced outline. Midpoint smoothing rounded small lettering,
 // closed brush scratches and changed the artwork at every sharp corner.
 points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
 ctx.closePath();
}

function isFactoryControlContour(points) {
 // Remove photographed hardware outlines from the vector asset itself. This
 // does not cut holes or hide artwork at render time: factory controls use the
 // supplied model/materials and edition graphics remain independent shapes.
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const width=x1-x0,height=y1-y0;
 if(width>.25||height>.25||width<.065||height<.065)return false;
 return [[-.623,.39],[-.723,.276],[-.524,.276],[-.623,.167],[.623,.423],[.77,.276],[.476,.276],[.623,.129],[-.467,.55],[.467,.55]].some(([x,y])=>Math.abs((x0+x1)/2-x)<.035&&Math.abs((y0+y1)/2-y)<.035);
}

export function drawTracedArtwork(ctx,id,group,w,h) {
 const key=group==='rear'?id+'-rear':group==='touchpad'&&traces[id+'-pad']?id+'-pad':group==='shell'&&traces[id+'-shell']?id+'-shell':id;
 if(!traces[key]||!['shell','touchpad','rear'].includes(group))return false;
 const registration=traces[key].source?traces[key]:null;
 const layers=registration?traces[registration.source]:traces[key];
 const registered=point=>{
  if(!registration)return point;
  if(registration.landmarks){
   const [x,y]=point,{landmarks,weights}=registration,n=landmarks.length;
   let dx=weights[n][0]+x*weights[n+1][0]+y*weights[n+2][0];
   let dy=weights[n][1]+x*weights[n+1][1]+y*weights[n+2][1];
   for(let i=0;i<n;i++){
    const r2=(x-landmarks[i][0])**2+(y-landmarks[i][1])**2;
    const k=.5*r2*Math.log(Math.max(r2,1e-20));dx+=k*weights[i][0];dy+=k*weights[i][1];
   }
   return [x+dx,y+dy];
  }
  const [x,y]=point,m=registration.transform,z=m[2][0]*x+m[2][1]*y+m[2][2];
  return [(m[0][0]*x+m[0][1]*y+m[0][2])/z,(m[1][0]*x+m[1][1]*y+m[1][2])/z];
 };
 const project=([x,y])=>group==='touchpad'?[(x+.405)/.81*w,(.642-y)/.437*h]:[(x+1)/2*w,(.65-y)/1.3*h];
 ctx.save();
 if(group==='rear'&&['marathon','yotei-black','yotei-gold','007','lisa','godofwar','lastofus','genshin'].includes(id))for(const side of [-1,1]) {
  const [x,y]=project([side*.82,-.6]);ctx.fillStyle=id==='genshin'?'#17586b':id==='007'?'#24262c':['godofwar','lastofus'].includes(id)?'#d9e1e4':'#92999d';ctx.beginPath();ctx.ellipse(x,y,w*.057,h*.075,side*.65,0,Math.PI*2);ctx.fill();
 }
 for(const layer of layers){
  ctx.beginPath();for(const points of layer.paths){
   if(id==='marathon'&&group==='shell'){
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    // Photograph shadows beneath the grips and the original stripe panel
    // are not print masters. The panel is rebuilt below from clean vectors.
    if(y0<-.7||(x1<-.51&&y1<.2)||(x0<-.7&&y0<-.15&&y1<.2))continue;
    if(x1-x0>.6&&y0<.2)continue;
    if(Math.abs((x0+x1)/2)>.19&&Math.abs((x0+x1)/2)<.45&&Math.abs((y0+y1)/2)<.07&&x1-x0>.15)continue;
   }
   // GT's shell print consists of the grip badges. Other dark components in
   // the source photograph are the physical controls, not edition artwork.
   if(id==='gt'&&group==='shell'){
    const xs=points.map(([x])=>x),ys=points.map(([,y])=>y);
    if(Math.max(...xs)-Math.min(...xs)>1.4&&Math.max(...ys)>.5)continue;
   }
   if(group==='shell'&&['gt','marathon','lisa','yotei-black','yotei-gold','gta-white'].includes(id)&&isFactoryControlContour(points))continue;
   contour(ctx,points.map(p=>project(registered(p))));
  }
  ctx.fillStyle=layer.color;ctx.fill('evenodd');
  if(id==='camo'&&layer.color==='#aaa6a7'){
   // The tiny controller symbols belong only to the light camouflage ink.
   // Clip them to the registered contours so they never bleed onto controls.
   ctx.save();ctx.clip('evenodd');ctx.strokeStyle='#858287';ctx.lineWidth=w*.00065;
   const step=group==='touchpad'?w*.029:w*.012;
   for(let row=0,y=0;y<h;y+=step,row++)for(let col=0,x=-(row%2)*step/2;x<w;x+=step,col++){
    const r=step*.27;ctx.beginPath();
    switch((row+col)%4){
     case 0:ctx.moveTo(x,y-r);ctx.lineTo(x+r,y+r*.8);ctx.lineTo(x-r,y+r*.8);ctx.closePath();break;
     case 1:ctx.arc(x,y,r,0,Math.PI*2);break;
     case 2:ctx.rect(x-r,y-r,r*2,r*2);break;
     default:ctx.moveTo(x-r,y-r);ctx.lineTo(x+r,y+r);ctx.moveTo(x+r,y-r);ctx.lineTo(x-r,y+r);
    }ctx.stroke();
   }ctx.restore();
  }
 }
 if(id==='marathon'&&group==='shell')drawMarathonGrip(ctx,w,h);
 ctx.restore();
 return true;
}

function drawMarathonGrip(ctx,w,h){
 const outlines=traces['marathon-grip-outline'];if(!outlines)return;
 const project=([x,y])=>[(x+1)/2*w,(.65-y)/1.3*h];
 ctx.save();ctx.beginPath();for(const layer of outlines)for(const points of layer.paths)contour(ctx,points.map(project));
 ctx.fillStyle='#b6ec24';ctx.fill();ctx.clip();
 // Continuous stripes, independent of photograph resolution and shading.
 ctx.fillStyle='#20262a';
 for(let x=-1.3;x<-.35;x+=.043){
  const points=[[x,.045],[x+.024,.045],[x+.29,-.72],[x+.266,-.72]].map(project);
  ctx.beginPath();points.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.fill();
 }
 // The diagonal label follows the inside edge of the grip graphic.
 const a=project([-.861,-.64]),b=project([-.537,.075]),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
 ctx.translate(...a);ctx.rotate(Math.atan2(dy,dx));
 ctx.fillStyle='#20262a';ctx.fillRect(0,-w*.0105,length,w*.021);
 ctx.fillStyle='#e8e9e6';ctx.font=`700 ${w*.0072}px monospace`;ctx.textBaseline='middle';
 for(let x=0;x<length;x+=w*.055)ctx.fillText('CONTRLR ·',x,0);
 ctx.restore();
 // Crisp direction marker at the head of the panel.
 ctx.save();const [lx,ly]=project([-.79,.135]);ctx.translate(lx,ly);
 ctx.fillStyle='#20262a';ctx.fillRect(0,0,w*.008,h*.047);ctx.fillRect(0,h*.036,w*.031,h*.011);ctx.restore();
}

function draw007Artwork(ctx,group,w,h){
 if(!['shell','touchpad'].includes(group))return;
 const project=([x,y])=>group==='touchpad'?[(x+.405)/.81*w,(.642-y)/.437*h]:[(x+1)/2*w,(.65-y)/1.3*h];
 const ink='#806b40',center=[0,.39792],radius=.15;
 // Printed sunburst only. The photographed shell silhouette and controls
 // must never become a second perimeter on top of the actual model.
 const rays=group==='shell'?[0,180,200,220,320,340]:[0,20,40,55,70,80,90,100,110,125,140,160,180,200,220,235,250,260,270,280,290,305,320,340];
 for(const degrees of rays){
  const a=degrees*Math.PI/180;
  path(ctx,[[center[0]+Math.cos(a)*radius,center[1]+Math.sin(a)*radius],[center[0]+Math.cos(a)*2,center[1]+Math.sin(a)*2]].map(project),ink,w*(group==='touchpad'?.00135:.00065));
 }
 if(group!=='touchpad')return;
 // Keep the distinctive reference badge, isolated from the photographed
 // shell boundary and hardware. The rays outside it are clean geometry.
 const [cx,cy]=project(center);
 ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,radius/.81*w,radius/.437*h,0,0,Math.PI*2);ctx.clip();
 drawTracedArtwork(ctx,'007','touchpad',w,h);ctx.restore();
}

function drawHelldiversPad(ctx,w,h){
 // Even, circular print dots. The old photo threshold merged these into
 // irregular blobs and baked illumination into the charcoal background.
 const pitch=w*.022,r=w*.0027;
 ctx.save();ctx.beginPath();ctx.roundRect(w*.045,h*.20,w*.91,h*.74,w*.045);ctx.clip();
 for(let row=0,y=h*.25;y<h*.94;y+=h*.039,row++){
  const t=Math.min(1,(y/h-.25)/.52),value=Math.round(65*(1-t)+17*t);
  ctx.fillStyle=`rgb(${value},${value+3},${value+7})`;
  for(let x=w*.055+(row%2)*pitch/2;x<w*.95;x+=pitch){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 }
 ctx.restore();
}

function drawConcordArtwork(ctx,group,w,h){
 if(group==='rear'){drawTracedArtwork(ctx,'concord',group,w,h);return;}
 if(!['shell','touchpad'].includes(group))return;
 const red='#c4483e',teal='#56a99f',black='#20242a';
 ctx.save();
 if(group==='touchpad'){ctx.translate(w*.405/.81,h*.642/.437);ctx.scale(w/.81,-h/.437);}
 else{ctx.translate(w/2,h*.65/1.3);ctx.scale(w/2,-h/1.3);}
 const poly=(points,color)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();};
 const line=(points,color=red,width=.0014)=>path(ctx,points,color,width);
 const hatch=(points,color,width=.0012,spacing=.008)=>{
  ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
  for(let x=-2;x<2;x+=spacing)line([[x,-.8],[x+1,.8]],color,width);
  ctx.restore();
 };
 if(group==='touchpad'){
  // Continuous orbital guides, rather than thresholded photograph fragments.
  ctx.strokeStyle=red;ctx.lineWidth=.0011;
  for(const radius of [.228,.242,.255]){ctx.beginPath();ctx.arc(0,.405,radius,.02,Math.PI-.02);ctx.stroke();}
  line([[-.39,.57],[.34,.30]],red,.001);
  line([[.39,.57],[-.34,.30]],red,.001);
  for(const side of [-1,1]){
   ctx.save();ctx.scale(side,1);
   ctx.strokeStyle=teal;ctx.lineWidth=.018;ctx.beginPath();ctx.moveTo(.022,.508);ctx.bezierCurveTo(.142,.508,.184,.479,.184,.412);ctx.bezierCurveTo(.184,.351,.233,.342,.292,.342);ctx.lineTo(.403,.342);ctx.stroke();
   ctx.lineWidth=.004;ctx.beginPath();ctx.moveTo(.026,.475);ctx.bezierCurveTo(.105,.475,.133,.449,.133,.396);ctx.bezierCurveTo(.133,.322,.203,.306,.273,.306);ctx.lineTo(.405,.306);ctx.stroke();
   poly([[.003,.642],[.008,.273],[.105,.231],[.283,.231],[.025,.292],[.020,.642]],red);
   line([[.032,.642],[.042,.326],[.405,.281]],red,.004);
   line([[.043,.642],[.054,.347],[.405,.297]],red,.002);
   ctx.restore();
  }
  for(const [x,y]of [[-.34,.49],[-.30,.56],[-.27,.43],[-.21,.59],[-.14,.57],[.17,.55],[.28,.48],[.32,.58],[.36,.45]]){
   ctx.fillStyle=red;ctx.beginPath();ctx.arc(x,y,.0024,0,Math.PI*2);ctx.fill();
  }
 }else{
  // Intentional radar marks near Triangle remain. No printed button rims.
  ctx.strokeStyle=red;ctx.lineWidth=.0012;
  for(const radius of [.091,.101]){ctx.beginPath();ctx.arc(.623,.423,radius,-.55,1.88);ctx.stroke();}
  for(let i=0;i<8;i++){const a=-.5+i*.32;line([[.623+Math.cos(a)*.105,.423+Math.sin(a)*.105],[.623+Math.cos(a)*.113,.423+Math.sin(a)*.113]],red,.0013);}
  line([[-.88,.54],[-.91,.34]],red,.0012);line([[.88,.54],[.91,.34]],red,.0012);
  line([[-.51,.55],[-.55,.47]],red,.0018);line([[.51,.55],[.55,.47]],red,.0018);
  hatch([[-.95,.19],[-.74,.225],[-.74,.185],[-.956,.145]],teal,.0024,.009);
  hatch([[-.90,.303],[-.855,.303],[-.855,.285],[-.90,.285]],teal,.0024,.009);
  hatch([[-.535,.303],[-.49,.303],[-.49,.285],[-.535,.285]],teal,.0024,.009);
  hatch([[-.535,.248],[-.49,.248],[-.49,.231],[-.535,.231]],teal,.0024,.009);
  hatch([[.548,.335],[.685,.335],[.685,.314],[.548,.314]],teal,.0024,.009);
  hatch([[.56,.235],[.91,.19],[.93,.155],[.58,.20]],teal,.0024,.009);
  poly([[-.91,.266],[-.85,.266],[-.85,.247],[-.915,.247]],red);
  poly([[-.535,.28],[-.49,.28],[-.49,.266],[-.535,.266]],red);
  poly([[.548,.295],[.696,.295],[.696,.268],[.548,.268]],red);
  poly([[.458,.183],[.535,.163],[.529,.077]],red);
  poly([[-.956,.076],[-.548,.113],[-.643,-.092],[-.956,-.236]],red);
  poly([[.552,.107],[.94,.045],[.953,-.237],[.68,-.07]],red);
  hatch([[-.95,-.294],[-.68,-.155],[-.835,-.58],[-.91,-.54]],red,.0011,.007);
  hatch([[.95,-.294],[.68,-.155],[.835,-.58],[.91,-.54]],red,.0011,.007);
  ctx.save();ctx.translate(-.798,-.08);ctx.rotate(.55);
  poly([[-.095,0],[-.025,.006],[-.008,.049],[.014,.023],[.045,.012],[.085,0],[.035,-.009],[.01,-.047],[-.005,-.018],[-.04,-.012]],black);ctx.restore();
  for(const [x,y,r]of [[.731,-.07,.011],[-.68,.057,.007],[-.934,-.174,.006]]){
   ctx.fillStyle=black;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=black;ctx.lineWidth=.0012;ctx.beginPath();ctx.arc(x,y,r+.006,0,Math.PI*2);ctx.stroke();
  }
  for(const side of [-1,1])for(const [x,y]of [[.85,.015],[.89,-.04],[.80,.03],[.88,-.15],[.75,.53],[.82,.48]]){
   ctx.fillStyle=y>.3?red:black;ctx.beginPath();ctx.arc(side*x,y,.0018,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
 if(group==='shell'){
  const label=(value,x,y)=>{ctx.fillStyle=black;ctx.font=`600 ${w*.0047}px monospace`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(value,(x+1)/2*w,(.65-y)/1.3*h);};
  label('//C-LNAR',-.66,.046);label('IV.7309  :: 17',.757,-.086);label('II.499  0-7',.757,-.102);
 }
}

export function drawCatalogArtwork(ctx,id,group,w,h) {
 if(!['shell','touchpad','rear','trim'].includes(group))return;
 if(id==='concord'){drawConcordArtwork(ctx,group,w,h);return;}
 if(id==='helldivers'&&group==='touchpad')drawHelldiversPad(ctx,w,h);
 if(id==='007'){if(group==='rear')drawTracedArtwork(ctx,id,group,w,h);else draw007Artwork(ctx,group,w,h);return;}
 if(id==='ff16'&&['shell','touchpad'].includes(group)){drawFf16Artwork(ctx,group,w,h);return;}
 if(id.startsWith('gta')){
  drawGtaArtwork(ctx,id,group,w,h,false,traces[group==='rear'?'gta-rear-logo':'gta-relief']);return;
 }
 // Every other catalog edition now has reference-derived front vectors.
 // Unknown rear surfaces retain the substrate; no invented fallback artwork.
 drawTracedArtwork(ctx,id,group,w,h);
}
