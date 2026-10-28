// One mold/layout for both GTA variants; separate substrate and coating colors.
export function gtaColor(id,group) {
 const light=id==='gta-white';
 if(group==='sticks')return light?'#e5e7e7':'#202324';
 if(['buttons','dpad','triggers','create','options','mute'].includes(group))return light?'#e5e7e7':'#212728';
 if(group==='trim')return '#3b4f9a';
 return light?'#eceeed':'#192822';
}
export function gtaSurface(id,group) {
 if(group==='sticks')return {roughness:.88,metalness:0,clearcoat:0};
 if(['buttons','dpad'].includes(group))return {roughness:.23,metalness:0,clearcoat:.5};
 if(group==='trim')return {roughness:.22,metalness:.25,clearcoat:.8};
 return {roughness:group==='touchpad'?.4:.32,metalness:.12,clearcoat:.65};
}
function polygon(ctx,points,fill){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function contours(ctx,layers,project,color){
 ctx.fillStyle=color;
 for(const layer of layers){ctx.beginPath();for(const points of layer.paths){
  const p=points.map(project);if(!p.length)continue;const last=p.at(-1);ctx.moveTo((last[0]+p[0][0])/2,(last[1]+p[0][1])/2);
  p.forEach((q,i)=>{const next=p[(i+1)%p.length];ctx.quadraticCurveTo(q[0],q[1],(q[0]+next[0])/2,(q[1]+next[1])/2);});ctx.closePath();
 }ctx.fill('evenodd');}
}
export function drawGtaArtwork(ctx,id,group,w,h,relief=false,reference=[]) {
 const light=id==='gta-white',touch=group==='touchpad';
 const base=relief?'#808080':gtaColor(id,group);ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 if(group==='trim'){
  if(relief)return;
  const gradient=ctx.createLinearGradient(0,h*.31,0,h*.72);
  gradient.addColorStop(0,'#009cc7');gradient.addColorStop(.43,'#2853a0');gradient.addColorStop(1,'#784083');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);return;
 }
 if(group==='shell'||touch){
  const project=([x,y])=>touch?[(x+.405)/.81*w,(.642-y)/.437*h]:[(x+1)/2*w,(.65-y)/1.3*h];
  // Shared reference-derived molded detail, not bright painted palm trees.
  contours(ctx,reference,project,relief?'#555555':touch?(light?'#d0d4d3':'#41504a'):(light?'#e5e8e6':'#1e2e27'));
  return;
 }
 if(group==='rear'){
  if(!relief)for(const side of [-1,1]){ctx.fillStyle='#69366f';ctx.beginPath();ctx.ellipse(w*(.5+side*.41),h*.965,w*.057,h*.075,side*.65,0,Math.PI*2);ctx.fill();}
  contours(ctx,reference,([x,y])=>[(x+1)/2*w,(.65-y)/1.3*h],relief?'#555555':light?'#d6dad7':'#26372f');
 }
}
