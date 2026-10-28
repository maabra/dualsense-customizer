import traces from './catalog-traces.json';
import {drawFf16Artwork} from './ff16-artwork';
import {drawGtaArtwork,gtaColor,gtaSurface} from './gta-artwork';

export const additionalEditions=new Set(['ff16','hogwarts','lebron','concord','fortnite','helldivers','lastofus','deathstranding','yotei-gold','yotei-black','marathon','007','gta-black','gta-white','lisa','camo','genshin','monsterhunter','gow20','iconblue']);
const black='#24262c',white='#e8e9e6';
export function catalogPartColor(id,group,part) {
 const control=['buttons','dpad','sticks','triggers','trim','ps','create','options','mute'].includes(group);
 if(id.startsWith('gta'))return gtaColor(id,group);
 if(id==='lastofus')return ['trim','sticks','triggers'].includes(group)?'#cbd0d7':black;
 if(id==='fortnite')return ['buttons','dpad','shell','touchpad'].includes(group)?'#56b9eb':black;
 if(id==='007')return control?black:'#cbb276';
 if(id==='lisa')return '#e6e5df';
 if(id==='marathon')return ['sticks','ps'].includes(group)?black:control?'#d8dce0':white;
 if(id==='genshin')return ['trim','sticks','triggers','ps','mute'].includes(group)?'#17586b':'#eee9df';
 if(id==='monsterhunter')return ['trim','sticks','triggers','ps','mute'].includes(group)?black:'#b70932';
 if(id==='gow20')return group==='sticks'?'#24262b':['r1','r2','options'].includes(part)?'#b6122a':group==='ps'?'#64696a':'#dce0df';
 if(id==='iconblue')return ['trim','sticks','touchpad'].includes(group)?'#1265db':['buttons','dpad','triggers'].includes(group)?'#123b9a':'#094db4';
 if(id.startsWith('yotei'))return group==='ps'?'#616660':group==='mute'?'#858a87':['trim','sticks','triggers'].includes(group)?'#a6a8a3':'#e3e0d7';
 if(id==='gta-white')return control?'#e2dfe3':'#ececed';
 if(id==='gta-black')return '#202b2b';
 return black;
}
export function catalogEditionSurface(id,group){return id.startsWith('gta')?gtaSurface(id,group):null;}
export function createEditionReliefCanvas(artwork,id,group){
 const gta=id.startsWith('gta')&&['shell','touchpad','rear'].includes(group),astro=id.startsWith('astro')&&group==='shell';
 if(!gta&&!astro)return null;
 const canvas=document.createElement('canvas');canvas.width=Math.min(2048,artwork.width);canvas.height=Math.round(canvas.width*artwork.height/artwork.width);
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 if(gta)drawGtaArtwork(ctx,id,group,w,h,true,traces[group==='rear'?'gta-rear-logo':'gta-relief']);
 else{
  ctx.fillStyle='#808080';ctx.fillRect(0,0,w,h);
  const p=([x,y])=>[(x+1)/2*w,(.65-y)/1.3*h];
  for(const side of [-1,1]){
   for(const offset of [0,.027])path(ctx,[[side*.48,-.03],[side*.48,-.12-offset],[side*.35,-.2-offset],[side*.14,-.2-offset],[side*.09,-.15]].map(p),'#666666',w*.0012);
   for(const y of [-.115,-.15]){const [x,cy]=p([side*.46,y]);ctx.strokeStyle='#666666';ctx.lineWidth=w*.001;ctx.beginPath();ctx.arc(x,cy,w*.004,0,Math.PI*2);ctx.stroke();}
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
 const key=group==='rear'?id+'-rear':group==='touchpad'&&traces[id+'-pad']?id+'-pad':id;
 if(!traces[key]||!['shell','touchpad','rear'].includes(group))return false;
 const registration=traces[key].source?traces[key]:null;
 const layers=registration?traces[registration.source]:traces[key];
 const registered=point=>{
  if(!registration)return point;
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
 }
 ctx.restore();
 return true;
}

export function drawCatalogArtwork(ctx,id,group,w,h) {
 if(!['shell','touchpad','rear','trim'].includes(group))return;
 if(id==='ff16'&&['shell','touchpad'].includes(group)){drawFf16Artwork(ctx,group,w,h);return;}
 if(id.startsWith('gta')){
  drawGtaArtwork(ctx,id,group,w,h,false,traces[group==='rear'?'gta-rear-logo':'gta-relief']);return;
 }
 // Every other catalog edition now has reference-derived front vectors.
 // Unknown rear surfaces retain the substrate; no invented fallback artwork.
 drawTracedArtwork(ctx,id,group,w,h);
}
