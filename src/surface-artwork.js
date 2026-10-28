import {editionSurface} from './edition-artwork';

// Linear data, not sRGB: R = roughness, G = metalness,
// B = clearcoat * .45 + printed-region flag * .5. Opaque pixels avoid losing
// substrate RGB to canvas alpha premultiplication. Keep masks separate so ink
// can retain different finishes even when the user changes the base finish.
export function createSurfaceCanvas(artwork,id,group) {
 const canvas=document.createElement('canvas');
 // Fine metallic etching needs enough finish texels to match its albedo.
 // Retain the lighter memory budget on mobile and Low Definition.
 canvas.width=Math.min(artwork.width>=4096?2048:1024,artwork.width);canvas.height=Math.round(canvas.width*artwork.height/artwork.width);
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(artwork,0,0,canvas.width,canvas.height);
 const image=ctx.getImageData(0,0,canvas.width,canvas.height),pixels=image.data;
 const base=editionSurface(id,group)||{roughness:['buttons','dpad'].includes(group)?.32:.6,metalness:0,clearcoat:0};
 for(let i=0;i<pixels.length;i+=4){
  const r=pixels[i]/255,g=pixels[i+1]/255,b=pixels[i+2]/255;
  const hi=Math.max(r,g,b),lo=Math.min(r,g,b),chroma=hi-lo;
  let rough=base.roughness,metal=base.metalness,coat=base.clearcoat,ink=0;
  if(['shell','touchpad','trim','rear'].includes(group)) {
   if(id.startsWith('wolverine')) {
    const silver=chroma<.12&&hi>.25,yellow=r>.55&&g>.42&&b<.42;
    if(silver){rough=.23;metal=.8;coat=.16;ink=1;}
    else if(yellow){rough=.38;metal=0;coat=.12;ink=1;}
   }else if(['ff16','hogwarts','yotei-gold','genshin'].includes(id)) {
    if(r>.29&&r>b*1.15&&g>b*1.08){
     const profile={ff16:[.38,.48,.1],hogwarts:[.32,.6,.1],'yotei-gold':[.32,.62,.12],genshin:[.4,.4,.08]}[id];
     [rough,metal,coat]=profile;ink=1;
    }
   }else if(id==='lastofus') {
    if((hi>.18||hi<.12)&&group!=='trim'){rough=.18;metal=0;coat=.4;ink=1;}
   }else if(id==='spiderman') {
    if(r>g*1.5&&r>.3){rough=.35;coat=.25;ink=1;}
    else if(lo>.55){rough=.42;coat=.12;ink=1;}
   }else if(id==='godofwar'&&group==='touchpad'&&b>r*1.25){rough=.43;coat=.08;ink=1;}
   else if(id.startsWith('astro')&&b>r*1.3&&b>g*1.1&&b>.4){rough=.18;coat=.7;ink=1;}
   else if(id==='helldivers'&&r>.5&&g>.4&&b<.35){rough=.45;coat=.05;ink=1;}
   else if(id==='helldivers'&&hi<.12){rough=.76;coat=0;ink=1;}
   else if(id==='monsterhunter'&&chroma<.12&&hi>.35){rough=.33;metal=.55;coat=.15;ink=1;}
   else if(id==='monsterhunter'&&r<.69&&r>g*1.5){rough=.2;coat=.5;ink=1;}
   else if(id==='gow20'&&r>g*1.7&&r>.35){rough=.45;coat=.08;ink=1;}
   else if(id==='iconblue'&&group==='touchpad'&&r>.065&&r<.11&&g<.34&&b<.78){rough=.18;coat=.45;ink=1;}
   else if(id==='marathon'&&g>.6&&r>.35&&b<.4){rough=.3;coat=.2;ink=1;}
   else if(id==='marathon'&&hi<.35){rough=.47;coat=.06;ink=1;}
   else if(id==='deathstranding'&&r>.6&&g>.3&&b<.45){rough=.4;coat=.1;ink=1;}
   else if(id==='gt'&&hi<.3){rough=.37;coat=.2;ink=1;}
   else if(id==='lisa'&&hi<.5){rough=.6;coat=.04;ink=1;}
   else if(id==='lisa'&&hi<.75&&chroma<.12){rough=.4;metal=.45;coat=.08;ink=1;}
   else if(id==='yotei-black'&&hi<.5){rough=.78;coat=0;ink=1;}
   else if(id==='concord'&&chroma>.15){rough=.46;coat=.08;ink=1;}
   else if(id==='lebron'&&(hi>.45||chroma>.2)){rough=.45;coat=.1;ink=1;}
  }
  pixels[i]=Math.round(rough*255);pixels[i+1]=Math.round(metal*255);pixels[i+2]=Math.round((coat*.45+ink*.5)*255);pixels[i+3]=255;
 }
 ctx.putImageData(image,0,0);return canvas;
}
