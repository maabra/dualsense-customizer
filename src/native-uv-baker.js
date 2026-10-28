import * as THREE from 'three';
import {parentPart} from './catalog';

// The supplied UV unwrap is the shared template. Bake each vector artwork and
// its independent finish map into those UV islands once, then render with the
// model's original UV coordinates. Camera movement never reprojects a decal.
export function createNativeUvBaker(renderer,root) {
 const charts=new Map(),camera=new THREE.Camera();
 const scene=new THREE.Scene();
 const material=new THREE.ShaderMaterial({
  uniforms:{source:{value:null},bounds:{value:new THREE.Vector4()},rear:{value:0}},
  vertexShader:`attribute vec2 studioArtworkUv;
    uniform vec4 bounds;uniform float rear;
    varying vec2 plateUv;varying float facing;
    void main(){plateUv=studioArtworkUv;facing=mix(normal.z,-normal.z,rear);
      vec2 target=(uv-bounds.xy)/bounds.zw;
      gl_Position=vec4(target*2.0-1.0,0.0,1.0);}`,
  fragmentShader:`uniform sampler2D source;varying vec2 plateUv;varying float facing;
    void main(){vec4 ink=texture2D(source,plateUv);
      float coverage=ink.a*smoothstep(0.45,0.82,facing);
      if(coverage<0.001)discard;
      gl_FragColor=vec4(ink.rgb*coverage,coverage);}`,
  side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,
 });
 function chartFor(part,group) {
  const key=['buttons','dpad'].includes(group)?part:group;
  if(charts.has(key))return charts.get(key);
  const meshes=[],bounds=new THREE.Vector4(Infinity,Infinity,-Infinity,-Infinity);
  root.traverse(obj=>{
   if(!obj.isMesh)return;
   const name=obj.material.name;
   if((['buttons','dpad'].includes(group)?name:parentPart(name))!==key)return;
   const uv=obj.geometry.attributes.uv,normals=obj.geometry.attributes.normal,index=obj.geometry.index;
   for(let i=0;i<(index?.count||uv.count);i++){
    const id=index?index.getX(i):i,u=uv.getX(id),v=uv.getY(id);
    if((group==='rear'?-normals.getZ(id):normals.getZ(id))<.4)continue;
    bounds.x=Math.min(bounds.x,u);bounds.y=Math.min(bounds.y,v);bounds.z=Math.max(bounds.z,u);bounds.w=Math.max(bounds.w,v);
   }
   meshes.push(new THREE.Mesh(obj.geometry,material));
  });
  if(!meshes.length)return null;
  if(!Number.isFinite(bounds.x))bounds.set(0,0,1,1);
  bounds.z=Math.max(.0001,bounds.z-bounds.x);bounds.w=Math.max(.0001,bounds.w-bounds.y);
  bounds.x-=bounds.z*.002;bounds.y-=bounds.w*.002;bounds.z*=1.004;bounds.w*=1.004;
  const chart={meshes,bounds};charts.set(key,chart);return chart;
 }
 function bake(source,chart,group) {
  const target=new THREE.WebGLRenderTarget(source.image.width,source.image.height,{depthBuffer:false,stencilBuffer:false,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
  target.texture.colorSpace=THREE.NoColorSpace;
  target.texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  material.uniforms.source.value=source;material.uniforms.bounds.value.copy(chart.bounds);material.uniforms.rear.value=group==='rear'?1:0;
  scene.clear();chart.meshes.forEach(mesh=>scene.add(mesh));
  const previous=renderer.getRenderTarget(),clear=new THREE.Color();renderer.getClearColor(clear);const alpha=renderer.getClearAlpha(),auto=renderer.autoClear;
  try{renderer.autoClear=true;renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,camera);}
  finally{renderer.setRenderTarget(previous);renderer.setClearColor(clear,alpha);renderer.autoClear=auto;}
  target.texture.userData.bakeTarget=target;target.texture.userData.uvBounds=chart.bounds.toArray();
  return target.texture;
 }
 return {
  bake(color,surface,part,group){
   const chart=chartFor(part,group);if(!chart)return null;
   const texture=bake(color,chart,group);texture.userData.surface=bake(surface,chart,group);return texture;
  },
  dispose(){charts.clear();scene.clear();material.dispose();},
 };
}

export function disposeBakedArtwork(texture){
 const finish=texture?.userData.surface;
 if(finish?.userData.bakeTarget)finish.userData.bakeTarget.dispose();else finish?.dispose();
 if(texture?.userData.bakeTarget)texture.userData.bakeTarget.dispose();else texture?.dispose();
}
