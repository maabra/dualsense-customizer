// Minimal SVG-backed drawing context for exporting the same vector masters the
// app rasterizes. No photographed bitmap is embedded in these artwork files.
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const n=x=>Math.round(x*100000)/100000;
const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
export class VectorCanvas {
 width=300;height=150;
 constructor(){this.context=new VectorContext();}
 getContext(){return this.context;}
 toSVG(){const c=this.context;return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}"><defs>${c.defs.join('')}</defs>${c.elements.join('')}</svg>`;}
}
class VectorContext {
 elements=[];defs=[];stack=[];path='';state={matrix:[1,0,0,1,0,0],fillStyle:'#000',strokeStyle:'#000',lineWidth:1,font:'10px sans-serif',textAlign:'start',textBaseline:'alphabetic',lineCap:'butt',lineJoin:'miter',clip:''};
 save(){this.stack.push({...this.state,matrix:[...this.state.matrix]});}
 restore(){if(this.stack.length)this.state=this.stack.pop();}
 transform(...m){this.state.matrix=multiply(this.state.matrix,m);}
 translate(x,y){this.transform(1,0,0,1,x,y);}
 scale(x,y){this.transform(x,0,0,y,0,0);}
 rotate(a){this.transform(Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0);}
 beginPath(){this.path='';}
 moveTo(x,y){this.path+=`M${n(x)} ${n(y)}`;}
 lineTo(x,y){this.path+=`L${n(x)} ${n(y)}`;}
 quadraticCurveTo(...p){this.path+='Q'+p.map(n).join(' ');}
 bezierCurveTo(...p){this.path+='C'+p.map(n).join(' ');}
 closePath(){this.path+='Z';}
 rect(x,y,w,h){this.moveTo(x,y);this.lineTo(x+w,y);this.lineTo(x+w,y+h);this.lineTo(x,y+h);this.closePath();}
 roundRect(x,y,w,h,r){r=Math.min(r,w/2,h/2);this.moveTo(x+r,y);this.lineTo(x+w-r,y);this.quadraticCurveTo(x+w,y,x+w,y+r);this.lineTo(x+w,y+h-r);this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);this.lineTo(x+r,y+h);this.quadraticCurveTo(x,y+h,x,y+h-r);this.lineTo(x,y+r);this.quadraticCurveTo(x,y,x+r,y);this.closePath();}
 arc(x,y,r,a,b,ccw=false){this.ellipse(x,y,r,r,0,a,b,ccw);}
 ellipse(x,y,rx,ry,rotation,a,b,ccw=false){
  const point=t=>[x+rx*Math.cos(t)*Math.cos(rotation)-ry*Math.sin(t)*Math.sin(rotation),y+rx*Math.cos(t)*Math.sin(rotation)+ry*Math.sin(t)*Math.cos(rotation)];
  let delta=b-a;if(Math.abs(delta)>=Math.PI*2-.0001)delta=ccw?-Math.PI*2:Math.PI*2;else if(ccw&&delta>0)delta-=Math.PI*2;else if(!ccw&&delta<0)delta+=Math.PI*2;
  this.moveTo(...point(a));const steps=Math.max(1,Math.ceil(Math.abs(delta)/Math.PI));
  for(let i=1;i<=steps;i++){const p=point(a+delta*i/steps);this.path+=`A${n(rx)} ${n(ry)} ${n(rotation*180/Math.PI)} 0 ${ccw?0:1} ${p.map(n).join(' ')}`;}
 }
 attributes(){return `transform="matrix(${this.state.matrix.map(n).join(' ')})"${this.state.clip?` clip-path="url(#${this.state.clip})"`:''}`;}
 style(value){return typeof value==='string'?escape(value):`url(#${value.id})`;}
 fill(rule='nonzero'){this.elements.push(`<path d="${this.path}" ${this.attributes()} fill="${this.style(this.fillStyle)}" fill-rule="${rule}"/>`);}
 stroke(){this.elements.push(`<path d="${this.path}" ${this.attributes()} fill="none" stroke="${this.style(this.strokeStyle)}" stroke-width="${n(this.lineWidth)}" stroke-linecap="${this.lineCap}" stroke-linejoin="${this.lineJoin}"/>`);}
 fillRect(x,y,w,h){this.elements.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${this.attributes()} fill="${this.style(this.fillStyle)}"/>`);}
 strokeRect(x,y,w,h){this.beginPath();this.rect(x,y,w,h);this.stroke();}
 clip(rule='nonzero'){const id='clip'+this.defs.length;this.defs.push(`<clipPath id="${id}"><path d="${this.path}" transform="matrix(${this.state.matrix.map(n).join(' ')})" clip-rule="${rule}"/></clipPath>`);this.state.clip=id;}
 fillText(t,x,y){const anchor={center:'middle',right:'end',left:'start'}[this.textAlign]||'start';this.elements.push(`<text x="${n(x)}" y="${n(y)}" ${this.attributes()} style="font:${escape(this.font)}" text-anchor="${anchor}" dominant-baseline="${this.textBaseline==='middle'?'central':'alphabetic'}" fill="${this.style(this.fillStyle)}">${escape(t)}</text>`);}
 strokeText(t,x,y){const anchor={center:'middle',right:'end',left:'start'}[this.textAlign]||'start';this.elements.push(`<text x="${n(x)}" y="${n(y)}" ${this.attributes()} style="font:${escape(this.font)}" text-anchor="${anchor}" dominant-baseline="central" fill="none" stroke="${this.style(this.strokeStyle)}" stroke-width="${n(this.lineWidth)}">${escape(t)}</text>`);}
 createLinearGradient(x1,y1,x2,y2){const id='gradient'+this.defs.length,index=this.defs.length,stops=[];this.defs.push('');return {id,addColorStop:(offset,color)=>{stops.push(`<stop offset="${offset}" stop-color="${escape(color)}"/>`);this.defs[index]=`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.join('')}</linearGradient>`;}};}
}
for(const key of ['fillStyle','strokeStyle','lineWidth','font','textAlign','textBaseline','lineCap','lineJoin'])Object.defineProperty(VectorContext.prototype,key,{get(){return this.state[key]},set(value){this.state[key]=value}});
