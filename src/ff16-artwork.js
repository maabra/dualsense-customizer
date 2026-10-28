// Reference coordinates follow Sony's frontal product plate. The repeated
// geometric etching is drawn as continuous vector strokes, rather than a
// thresholded photograph whose subpixel lines disintegrate into flecks.
const gold='#b99a75',blue='#79b5c9';
function stroke(ctx,points,close=false){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(close)ctx.closePath();ctx.stroke();}
function ring(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();}
function polygon(ctx,x,y,r,sides,angle=0){stroke(ctx,Array.from({length:sides},(_,i)=>[x+Math.cos(angle+i*Math.PI*2/sides)*r,y+Math.sin(angle+i*Math.PI*2/sides)*r]),true);}
function crystal(ctx,x,y,r,rotation=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
 polygon(ctx,0,0,r,6,Math.PI/6);polygon(ctx,0,0,r*.64,6,Math.PI/6);
 for(let i=0;i<6;i++){
  const a=Math.PI/6+i*Math.PI/3,b=a+Math.PI/3;
  stroke(ctx,[[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(b)*r*.64,Math.sin(b)*r*.64],[Math.cos(a+Math.PI)*r,Math.sin(a+Math.PI)*r]]);
 }
 polygon(ctx,0,0,r*.78,3,-Math.PI/2);polygon(ctx,0,0,r*.78,3,Math.PI/2);
 ctx.restore();
}
function grip(ctx){
 ctx.strokeStyle=gold;ctx.lineWidth=.7;
 // Closely spaced curved rails and their beaded edge.
 for(let i=0;i<8;i++){
  ctx.beginPath();ctx.moveTo(153+i*2.35,422);
  ctx.bezierCurveTo(164+i*2.35,473,185+i*2.2,524,224+i*1.8,565);ctx.stroke();
 }
 for(let i=0;i<31;i++){
  const t=i/30,x=151+68*t*t,y=463+119*t;
  ring(ctx,x,y,1.6);
  stroke(ctx,[[x-3,y+1],[124+5*t,y+20+63*t]]);
  for(let j=1;j<5;j++)ring(ctx,x-4-(x-124)*j/5,y+1+(19+63*t)*j/5,.42);
 }
 // Upper triangular lattice, small diamond terminals and inner border.
 stroke(ctx,[[173,423],[262,508],[237,557],[173,423]],true);
 stroke(ctx,[[179,430],[255,508],[237,546],[179,430]],true);
 const a=[183,450],b=[249,511],c=[237,538];
 for(let i=0;i<=5;i++){
  const t=i/5;
  stroke(ctx,[[a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t],[b[0]+(c[0]-b[0])*t,b[1]+(c[1]-b[1])*t]]);
  stroke(ctx,[[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],[a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t]]);
 }
 for(let i=0;i<16;i++){const t=i/15;polygon(ctx,179+70*t,430+69*t,2.3,4,0);}
 for(let i=0;i<7;i++){
  ctx.beginPath();ctx.moveTo(124,610+i*3);
  ctx.bezierCurveTo(140,637+i*3,161,657+i*3,188,679+i*3);ctx.stroke();
 }
}
export function drawFf16Artwork(ctx,group,w,h){
 if(!['shell','touchpad'].includes(group))return;
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 if(group==='shell'){
  ctx.scale(w/800,h/520);ctx.translate(-100,-233);
  grip(ctx);ctx.translate(1000,0);ctx.scale(-1,1);grip(ctx);
 }else{
  // Fit to the physical pad boundary, including its unprinted black margin.
  ctx.scale(w/320,h/164);ctx.translate(-340,-246);
  ctx.strokeStyle=gold;ctx.lineWidth=.72;
  // The central crystal seal: concentric circles, six overlapping petals,
  // rotated square frames and the fine horizontal edge hatching.
  for(const r of [12,22,34,47,56,64,69])ring(ctx,500,339,r);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;ring(ctx,500+Math.cos(a)*23,339+Math.sin(a)*23,23);}
  polygon(ctx,500,339,79,4,Math.PI/4);polygon(ctx,500,339,72,4,0);
  polygon(ctx,500,339,66,6,Math.PI/6);polygon(ctx,500,339,57,3,-Math.PI/2);
  for(let y=279;y<=401;y+=4){
   const edge=400-Math.sin((y-279)/122*Math.PI)*20;
   stroke(ctx,[[356,y],[edge,y]]);stroke(ctx,[[1000-edge,y],[644,y]]);
   for(let x=359;x<edge;x+=5)ring(ctx,x,y-1,.38);
  }
  stroke(ctx,[[356,278],[644,278]]);stroke(ctx,[[368,402],[632,402]]);
  ctx.strokeStyle=blue;ctx.lineWidth=.85;
  for(const side of [-1,1]){
   crystal(ctx,500+side*86,300,23,side*.35);
   crystal(ctx,500+side*94,340,17,-side*.12);
   crystal(ctx,500+side*86,378,23,-side*.35);
   crystal(ctx,500+side*65,274,16,side*.25);
   crystal(ctx,500+side*65,406,16,-side*.25);
  }
 }
 ctx.restore();
}
