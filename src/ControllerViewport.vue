<template><div id="canvas-wrap" ref="container"></div></template>

<script setup>
import {ref,onBeforeUnmount} from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { byId, paletteColor, defaultId, targetsFor, parentPart } from './catalog';
import { transferProgress } from './loading';
import {createSurfaceCanvas} from './surface-artwork';
import {createNativeUvBaker,disposeBakedArtwork} from './native-uv-baker';
import {additionalEditions,catalogTracesReady,createEditionReliefCanvas,loadCatalogTraces} from './catalog-artwork';
import { createEditionCanvas, createControlCanvas, artworkUVs, editionPartColor, editionSurface } from './edition-artwork';

const container=ref(null),emit=defineEmits(['status']);
let api;
function initialize(){
  if(!api)api=createStudio(container.value,status=>emit('status',status));
  return api;
}
defineExpose({initialize});
onBeforeUnmount(()=>api?.dispose());

function createStudio(container, report) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .01, 100);
  camera.position.set(0, .55, 4.9);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.transmissionResolutionScale=matchMedia('(max-width:760px)').matches ? .5 : 1;
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.shadowMap.autoUpdate = false;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', '3D DualSense controller. Left drag to rotate, right drag to move, scroll to zoom. On touch screens use two fingers to move and zoom.');
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.panSpeed = .75;
  controls.zoomSpeed = 1.5;
  controls.mouseButtons = {LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
  controls.touches = {ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
  controls.minDistance = .75;
  controls.maxDistance = 24;
  controls.zoomToCursor = false;
  controls.autoRotateSpeed = .7;
  controls.target.set(0, -.05, 0);
  // OrbitControls boosts ctrl+wheel (trackpad pinch) by 10x; normalize all wheel input here.
  function handleWheel(event) {
    if(!controls.enabled||!controls.enableZoom)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    transition=null;
    const delta=THREE.MathUtils.clamp(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?100:1),-120,120);
    const offset=camera.position.clone().sub(controls.target);
    const distance=THREE.MathUtils.clamp(offset.length()*Math.exp(delta*.0008),controls.minDistance,controls.maxDistance);
    camera.position.copy(controls.target).add(offset.setLength(distance));
    controls.update();
    needsRender=true;
  }
  renderer.domElement.addEventListener('wheel',handleWheel,{passive:false,capture:true});
  let inspecting=false,needsRender=true;
  controls.addEventListener('change',()=>{
    const distance=camera.position.distanceTo(controls.target),next=distance<3.6||distance>6.5;
    if(next!==inspecting){inspecting=next;report({inspecting});}
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  // Large photographic softboxes give plastic broad highlights and metal crisp reflections.
  const room = new THREE.Scene();
  const enclosure = new THREE.Mesh(new THREE.BoxGeometry(20,16,20),new THREE.MeshBasicMaterial({color:0x15171b,side:THREE.BackSide}));
  room.add(enclosure);
  function softbox(x,y,z,w,h,color,intensity) {
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity)}));
    panel.position.set(x,y,z);panel.lookAt(0,0,0);room.add(panel);
  }
  softbox(-3,4,4,4,5,0xf4f7ff,5);
  softbox(4,1,3,1.5,5,0xddeaff,3);
  softbox(0,4,-3,5,1.5,0xffffff,5);
  softbox(-4,-1,0,1,3,0xffffff,1.2);
  const environment = pmrem.fromScene(room, .025);
  scene.environment = environment.texture;
  scene.environmentIntensity = .8;
  room.traverse(obj=>{if(obj.isMesh){obj.geometry.dispose();obj.material.dispose();}});pmrem.dispose();
  RectAreaLightUniformsLib.init();
  function area(x,y,z,w,h,color,intensity) {
    const light=new THREE.RectAreaLight(color,intensity,w,h);light.position.set(x,y,z);light.lookAt(0,0,0);scene.add(light);
  }
  area(-3,4,4,4,5,0xf4f7ff,4);
  area(4,1,3,2,4,0xddeaff,1.8);
  area(0,4,-3,4,2,0xffffff,4);
  scene.add(new THREE.HemisphereLight(0xdce7f2,0x171c28,.45));
  const key = new THREE.DirectionalLight(0xf5f8ff,1.1);key.position.set(-3,6,3);
  const mobile=container.clientWidth<700;
  key.castShadow=true;key.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);key.shadow.camera.left=-2.2;key.shadow.camera.right=2.2;
  key.shadow.camera.top=2.2;key.shadow.camera.bottom=-2.2;key.shadow.camera.near=.1;key.shadow.camera.far=15;
  key.shadow.normalBias=.008;key.shadow.bias=-.0001;key.shadow.radius=mobile?6:10;key.shadow.blurSamples=mobile?8:16;scene.add(key);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.2,depthWrite:false}));
  shadow.receiveShadow=true;
  shadow.rotation.x = -Math.PI/2; shadow.position.set(0,-.79,0); scene.add(shadow);
  const pivot = new THREE.Group(); pivot.rotation.set(-.12, -.16, -.09); scene.add(pivot);
  // Local light spill follows the controller and is naturally occluded from the rear.
  const barLights=[];
  for(const x of [-.405,.405]) {
    const lamp=new THREE.PointLight(0x0072ff,.045,.65,2);lamp.position.set(x,.42,.36);pivot.add(lamp);barLights.push(lamp);
  }
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
  const glowContext=glowCanvas.getContext('2d');const glowGradient=glowContext.createRadialGradient(32,32,0,32,32,32);
  glowGradient.addColorStop(0,'rgba(255,255,255,.7)');glowGradient.addColorStop(.25,'rgba(255,255,255,.25)');glowGradient.addColorStop(1,'rgba(255,255,255,0)');
  glowContext.fillStyle=glowGradient;glowContext.fillRect(0,0,64,64);
  const glowMap=new THREE.CanvasTexture(glowCanvas),barHalos=[];
  for(const side of [-1,1])for(const y of [.29,.4,.51]) {
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color:0x0072ff,blending:THREE.AdditiveBlending,transparent:true,opacity:.16,depthWrite:false,toneMapped:false}));
    halo.position.set(side*(.35+(y-.29)*.24),y,.325);halo.scale.set(.15,.21,1);pivot.add(halo);barHalos.push(halo);
  }
  const loader = new GLTFLoader();
  let model, frame, dead = false, activeState, activeLight, busy = false, quality = 'low';
  const uploads = new Map();
  const artworkCache=new Map();
  let uvBaker,catalogTracesLoad=null;
  const emptyArtwork=new THREE.DataTexture(new Uint8Array([255,255,255,0]),1,1);emptyArtwork.needsUpdate=true;
  function loadSelectedCatalogArtwork(state){
    if(catalogTracesReady()||catalogTracesLoad||!Object.values(state).some(selection=>additionalEditions.has(selection.id)))return;
    catalogTracesLoad=loadCatalogTraces().then(()=>{
      catalogTracesLoad=null;
      if(!dead&&activeState)apply(activeState,activeLight);
    }).catch(error=>{
      catalogTracesLoad=null;
      report({error:'Edition artwork could not be loaded. Check your connection and try again.'});
      console.error(error);
    });
  }
  function artworkFor(entry,part,group) {
    if(!entry||entry.artwork!=='recreated'&&!['buttons','dpad'].includes(group))return null;
    if(additionalEditions.has(entry.id)&&!catalogTracesReady())return null;
    const key=quality+'|'+entry.id+'|'+(['buttons','dpad'].includes(group)?part:group);
    if(!artworkCache.has(key)) {
      const detail=quality!=='low'&&mobile?quality+'-mobile':quality;
      const canvas=entry.artwork==='recreated'?createEditionCanvas(entry.id,part,group,detail):createControlCanvas(entry.hex,part,group,detail);
      if(!canvas){artworkCache.set(key,null);return null;}
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const surface=new THREE.CanvasTexture(createSurfaceCanvas(canvas,entry.id,group));surface.colorSpace=THREE.NoColorSpace;surface.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());texture.userData.surface=surface;
      const reliefCanvas=createEditionReliefCanvas(canvas,entry.id,group);
      const relief=reliefCanvas?new THREE.CanvasTexture(reliefCanvas):null;
      if(relief)relief.colorSpace=THREE.NoColorSpace;
      texture.userData.followCurves=group==='shell'||entry.id.startsWith('gta');surface.userData.followCurves=texture.userData.followCurves;
      if(relief)relief.userData.followCurves=true;
      texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
      const baked=uvBaker?.bake(texture,surface,part,group,relief);
      if(baked){texture.dispose();surface.dispose();relief?.dispose();artworkCache.set(key,baked);}else {texture.userData.relief=relief;artworkCache.set(key,texture);}
    }
    return artworkCache.get(key);
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const viewport = new ResizeObserver(() => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w,h); camera.aspect = w / Math.max(h,1);
    // Keep the full controller in a tall portrait preview without changing
    // the user's zoom distance as the drawer resizes it.
    camera.fov=Math.min(75,THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(33)/2)/Math.min(camera.aspect,1))));
    renderer.transmissionResolutionScale=w<600 ? .5 : 1;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    needsRender=true;
  });
  viewport.observe(container);

  function release(root) {
    const textures = new Set();
    root.traverse(obj => { if(obj.isMesh) { obj.geometry.dispose(); for(const m of Array.isArray(obj.material)?obj.material:[obj.material]) { for(const v of Object.values(m)) if(v?.isTexture && ![...uploads.values()].includes(v)) textures.add(v); m.dispose(); } } });
    textures.forEach(t=>t.dispose());
  }
  async function load(level) {
    if (busy || (model && level === quality)) return;
    busy = true; report({loading:true,level});
    let lastProgress=0;
    try {
      // Anchor assets to the JS module, not a potentially stale page URL.
      const modelUrl = new URL(/* @vite-ignore */ `../models/dualsense-${level}.glb`, import.meta.url);
      const progress = event => {
        const progress=transferProgress(event.loaded,event.total,lastProgress);
        if(progress!==null) {lastProgress=progress;report({progress,level});}
      };
      const gltf = await loader.loadAsync(modelUrl.href, progress);
      report({phase:'preparing',level});
      if(dead) {release(gltf.scene); return;}
      const next = gltf.scene;
      next.traverse(obj => {
        if(!obj.isMesh) return;
        const material = new THREE.MeshPhysicalMaterial();
        THREE.MeshStandardMaterial.prototype.copy.call(material,obj.material);
        // StandardMaterial.copy resets defines. Restore PHYSICAL so clear
        // polymer transmission and IOR use the full physical shader.
        material.defines={STANDARD:'',PHYSICAL:''};obj.material = material;
        obj.castShadow=true;obj.receiveShadow=true;
        material.userData.originalRoughness=material.roughness;
        material.userData.originalMetalness=material.metalness;
        material.userData.originalNormalScale=material.normalScale.clone();
        const part = material.name;
        const group = parentPart(part);
        obj.geometry.setAttribute('studioArtworkUv',new THREE.BufferAttribute(artworkUVs(obj.geometry,group),2));
        material.userData.originalMap = material.map;
        material.userData.originalRoughnessMap = material.roughnessMap;
        material.userData.tint = {value:new THREE.Color('#ffffff')};
        material.userData.blend = {value:0};
        material.userData.artwork={value:emptyArtwork};material.userData.artworkEnabled={value:0};
        material.userData.surface={value:emptyArtwork};material.userData.surfaceEnabled={value:0};
        material.userData.uvBounds={value:new THREE.Vector4(0,0,1,1)};
        material.userData.relief={value:emptyArtwork};material.userData.reliefScale={value:0};
        material.userData.printOverride={value:new THREE.Vector2(-1,-1)};
        // Facing direction changes generated shader source. Three's default key
        // only sees the callback text, so closures need distinct program keys.
        material.customProgramCacheKey=()=>part==='light'?'studio-led-v2':group==='rear'?'studio-rear-surface-v2':'studio-front-surface-v2';
        // Clear button caps need their original alpha to reveal the symbols below.
        material.transparent = ['buttons','dpad','details'].includes(group);
        material.depthWrite = !['buttons','dpad'].includes(group);
        if(['buttons','dpad'].includes(group)) {
          obj.castShadow=false;
          const index=obj.geometry.index, positions=obj.geometry.attributes.position;
          let depth=0;
          for(let i=0;i<index.count;i++)depth+=positions.getZ(index.getX(i));
          // Render internal button faces before the clear caps in front of them.
          obj.renderOrder=10+depth/index.count;
          material.side=THREE.FrontSide;
        }
        if(part !== 'light') {material.emissive.set(0); material.emissiveMap = null;}
        else {material.map=null;material.emissiveMap=null;material.toneMapped=false;material.roughness=.35;}
        material.onBeforeCompile = shader => {
          if(part==='light') {
            shader.vertexShader='varying vec3 vBarPosition;\n'+shader.vertexShader;
            shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBarPosition = position;');
            shader.fragmentShader='varying vec3 vBarPosition;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
              float ledMask = smoothstep(0.32, 0.36, abs(vBarPosition.x));
              totalEmissiveRadiance *= ledMask;
              diffuseColor.rgb = mix(vec3(0.015), diffuseColor.rgb, ledMask);
            `);
            return;
          }
          shader.uniforms.studioTint = material.userData.tint;
          shader.uniforms.studioBlend = material.userData.blend;
          shader.uniforms.studioArtwork=material.userData.artwork;shader.uniforms.studioArtworkEnabled=material.userData.artworkEnabled;
          shader.uniforms.studioUvBounds=material.userData.uvBounds;
          shader.vertexShader='uniform vec4 studioUvBounds;\nvarying vec2 vEditionUV;\nvarying float vEditionFacing;\n'+shader.vertexShader;
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvEditionUV=(uv-studioUvBounds.xy)/studioUvBounds.zw;\nvEditionFacing=max(0.0,${group==='rear'?'-normal.z':'normal.z'});`);
          shader.fragmentShader = 'uniform vec3 studioTint;\nuniform float studioBlend;\nuniform sampler2D studioArtwork;\nuniform float studioArtworkEnabled;\nvarying vec2 vEditionUV;\nvarying float vEditionFacing;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
            #include <map_fragment>
            ${['buttons','dpad'].includes(group)?'diffuseColor.a=1.0;':''}
            float detail = 0.72 + 0.28 * dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
            diffuseColor.rgb = mix(diffuseColor.rgb, studioTint * detail, studioBlend);
            vec4 editionArt=texture2D(studioArtwork,vEditionUV);
            editionArt.rgb/=max(editionArt.a,0.0001);
            float artMask=studioArtworkEnabled*editionArt.a;
            diffuseColor.rgb=mix(diffuseColor.rgb,editionArt.rgb*(0.9+detail*0.1),artMask);
          `);
          // Explicit data maps keep metallic ink and clearcoat separate from albedo.
          shader.uniforms.studioSurface=material.userData.surface;
          shader.uniforms.studioSurfaceEnabled=material.userData.surfaceEnabled;
          shader.uniforms.studioPrintOverride=material.userData.printOverride;
          shader.fragmentShader='uniform sampler2D studioSurface;\nuniform float studioSurfaceEnabled;\nuniform vec2 studioPrintOverride;\n'+shader.fragmentShader;
          shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
            vec4 surfaceTexel=texture2D(studioSurface,vEditionUV);
            vec3 editionSurface=surfaceTexel.rgb/max(surfaceTexel.a,0.0001);
            float printedRegion=step(0.45,editionSurface.b);
            float finishFacing=studioArtworkEnabled*editionArt.a;
            float finishMask=finishFacing*max(studioSurfaceEnabled,printedRegion);
            float printRough=editionSurface.r;
            float printMetal=editionSurface.g;
            if(studioPrintOverride.x>=0.0){
              printRough=mix(printRough,studioPrintOverride.x,printedRegion);
              printMetal=mix(printMetal,studioPrintOverride.y,printedRegion);
            }
            roughnessFactor=mix(roughnessFactor,printRough,finishMask);
          `);
          shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
            metalnessFactor=mix(metalnessFactor,printMetal,finishMask);
          `);
          shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_fragment>',`#include <lights_physical_fragment>
            #ifdef USE_CLEARCOAT
              float editionCoat=clamp((editionSurface.b-printedRegion*0.5)/0.45,0.0,1.0);
              material.clearcoat=mix(material.clearcoat,editionCoat,finishMask);
            #endif
          `);
          shader.uniforms.studioRelief=material.userData.relief;shader.uniforms.studioReliefScale=material.userData.reliefScale;
          shader.fragmentShader=`uniform sampler2D studioRelief;uniform float studioReliefScale;
            float studioHeight(vec2 uv){vec4 value=texture2D(studioRelief,uv);return value.a>0.5?value.r/value.a:0.5;}
          `+shader.fragmentShader;
          shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
            if(studioReliefScale>0.0){
              vec2 uvDx=dFdx(vEditionUV),uvDy=dFdy(vEditionUV);float height=studioHeight(vEditionUV);
              vec2 dh=vec2(studioHeight(vEditionUV+uvDx)-height,studioHeight(vEditionUV+uvDy)-height)*studioReliefScale;
              vec3 dx=normalize(dFdx(-vViewPosition)),dy=normalize(dFdy(-vViewPosition));
              vec3 rx=cross(dy,normal),ry=cross(normal,dx);float determinant=dot(dx,rx)*faceDirection;
              normal=normalize(abs(determinant)*normal-sign(determinant)*(dh.x*rx+dh.y*ry));
            }
          `);
        };
      });
      // Identify the outer clear caps so button artwork can render on the inserts below.
      const buttonLayers=new Map();
      next.traverse(obj=>{
        if(!obj.isMesh||!['buttons','dpad'].includes(parentPart(obj.material.name)))return;
        const index=obj.geometry.index,p=obj.geometry.attributes.position;
        let z=0;const count=index?.count||p.count;
        for(let i=0;i<count;i++){
          const vertex=index?index.getX(i):i;
          z+=p.getZ(vertex);
        }
        const layers=buttonLayers.get(obj.material.name)||[];
        layers.push({obj,z:z/count});buttonLayers.set(obj.material.name,layers);
      });
      for(const [part,layers] of buttonLayers){
        const far=Math.max(...layers.map(layer=>layer.z)),near=Math.min(...layers.map(layer=>layer.z));
        for(const {obj,z} of layers){
          obj.material.userData.clearCap=layers.length>1&&far-near>.0005&&z>(far+near)/2;
          obj.renderOrder=obj.material.userData.clearCap?20:10;
        }
      }
      if(model) {pivot.remove(model); release(model);}
      uvBaker?.dispose();artworkCache.forEach(disposeBakedArtwork);artworkCache.clear();
      model = next;pivot.add(model);renderer.shadowMap.needsUpdate=true;quality = level;uvBaker=createNativeUvBaker(renderer,model);
      if(activeState) apply(activeState, activeLight);
      report({loading:false,quality:level});
    } catch(error) {
      const missing = error.response?.status === 404 || /\b404\b/.test(error.message || '');
      const name = {original:'Original',low:'Low Definition'}[level] || 'Controller';
      const message = missing
        ? `${name} model file was not found (404). The site may be updating. Retry or choose another model.`
        : `${name} could not be downloaded or opened. Retry, or try Low Definition for a smaller download.`;
      report({loading:false,error:message+(model?' Your current model is still available.':''),quality});
      console.error(error);
    } finally {busy = false;}
  }
  function apply(state, light = '#0072ff') {
    activeState = state;activeLight = light;needsRender=true;
    loadSelectedCatalogArtwork(state);
    barLights.forEach(lamp=>lamp.color.set(light));barHalos.forEach(halo=>halo.material.color.set(light));
    model?.traverse(obj => {
      if(!obj.isMesh) return;
      const m = obj.material, part = m.name;
      if(part === 'light') {m.emissive.set(light);m.emissiveIntensity=1.5;m.color.set('#03050a');return;}
      if(!state[part]) return;
      const selection = state[part]; const entry = byId[selection.id];
      if(!entry && selection.id !== 'custom') return;
      const native = selection.id === defaultId(part);
      const upload = uploads.get(part);
      const group=parentPart(part),appearance=entry||{id:'custom:'+selection.hex,hex:selection.hex||'#69aaff',type:'standard'};
      const artwork=upload?null:artworkFor(appearance,part,group);
      m.userData.artwork.value=artwork||emptyArtwork;m.userData.artworkEnabled.value=artwork?1:0;
      m.userData.surface.value=artwork?.userData.surface||emptyArtwork;
      m.userData.relief.value=artwork?.userData.relief||emptyArtwork;
      m.userData.reliefScale.value=artwork?.userData.relief?(group==='touchpad'?.005:.009):0;
      m.userData.uvBounds.value.fromArray(artwork?.userData.uvBounds||[0,0,1,1]);
      m.userData.surfaceEnabled.value=artwork&&selection.finish==='original'?1:0;
      m.map = upload || m.userData.originalMap;
      m.userData.blend.value = upload||native||(group==='ps'&&selection.id==='anniversary') ? 0 : 1;
      m.userData.tint.value.set(selection.id === 'custom' ? selection.hex || '#69aaff' : editionPartColor(entry,part,group)||paletteColor(entry,part));
      const finish = selection.finish === 'original' ? entry?.finish || 'matte' : selection.finish;
      const original=native && selection.finish==='original' && !upload;
      m.roughness = original ? m.userData.originalRoughness : {matte:.68,satin:.4,metallic:.26,gloss:.14}[finish] || .7;
      m.metalness = original ? m.userData.originalMetalness : finish === 'metallic' ? .85 : 0;
      const surface=selection.finish==='original'&&!upload?editionSurface(entry?.id,group):null;
      m.clearcoat=surface?.clearcoat||(finish==='gloss'?.55:0);
      if(artwork)m.clearcoat=Math.max(m.clearcoat,.001);
      m.clearcoatRoughness=.25;
      if(surface){m.roughness=surface.roughness;m.metalness=surface.metalness;}
      const printFinish={matte:[.8,0],satin:[.4,0],metallic:[.23,.8],gloss:[.14,0]}[selection.printFinish];
      m.userData.printOverride.value.set(...(printFinish||[-1,-1]));
      const coated=selection.finish==='original'&&['shell','trim','rear','touchpad'].includes(group);
      m.iridescence=coated?(entry?.id.startsWith('gta')?(group==='trim'?.75:.32):entry?.id==='lisa'?.35:0):0;
      m.iridescenceIOR=1.3;m.iridescenceThicknessRange=[140,360];
      const chromaId=selection.id==='lisa'?'pearl':selection.id;
      const chroma=['pearl','indigo','teal'].includes(chromaId)&&selection.finish==='original'&&!upload;
      m.normalScale.copy(m.userData.originalNormalScale);
      if(chroma){
        const polished=['shell','rear','trim'].includes(group);
        if(polished){
          m.roughness=.13;m.metalness=chromaId==='pearl'?.18:.4;
          m.clearcoat=1;m.clearcoatRoughness=.065;
          m.iridescence=chromaId==='pearl'?.55:.85;
          m.iridescenceIOR=1.35;
          m.iridescenceThicknessRange={pearl:[240,360],indigo:[320,480],teal:[180,300]}[chromaId];
          m.normalScale.multiplyScalar(.3);
        }else{
          m.metalness=0;m.roughness=group==='sticks'?.88:group==='touchpad'?.36:.23;
          m.clearcoat=group==='sticks'?0:.3;m.clearcoatRoughness=.14;
        }
      }
      m.roughnessMap = native && selection.finish === 'original' ? m.userData.originalRoughnessMap : null;
      if(group==='buttons'||group==='dpad'){
        m.transparent=false;m.opacity=1;m.depthWrite=true;
        if(m.userData.clearCap){
          // Smooth clear polymer, with symbols and color on the insert below.
          // Transmission uses the opaque insert pass instead of alpha sorting.
          m.map=null;m.color.set('#ffffff');m.roughnessMap=null;m.metalnessMap=null;
          m.userData.tint.value.set('#ffffff');m.userData.blend.value=0;
          m.userData.artworkEnabled.value=0;m.userData.surfaceEnabled.value=0;
          m.transmission=1;m.thickness=.014;m.ior=1.49;
          m.attenuationColor.set('#f4f8ff');m.attenuationDistance=.6;
          m.roughness={matte:.5,satin:.2,gloss:.02,metallic:.1}[selection.finish]||.035;
          m.metalness=0;m.clearcoat=1;m.clearcoatRoughness=.025;m.iridescence=0;
          m.normalScale.copy(m.userData.originalNormalScale).multiplyScalar(.04);
        }else{m.transmission=0;}
      }
      m.needsUpdate = true;
    });
    // Keep only textures referenced by the current mix: high-resolution maps are expensive
    // on mobile, and switching editions must not retain every previous set.
    const used=new Set();model?.traverse(obj=>{if(obj.isMesh)used.add(obj.material.userData.artwork?.value);});
    for(const [key,texture] of artworkCache)if(!used.has(texture)){disposeBakedArtwork(texture);artworkCache.delete(key);}
  }
  let transition;
  function view(name, resetDistance = false) {
    needsRender=true;
    const distance = resetDistance ? 4.9 : camera.position.distanceTo(controls.target);
    controls.target.set(0,-.05,0);
    const direction = {front:new THREE.Vector3(0,.06,1),back:new THREE.Vector3(0,.06,-1),angle:new THREE.Vector3(1,.6,1.6)}[name].normalize();
    transition = {from:camera.position.clone(),to:controls.target.clone().add(direction.multiplyScalar(distance)),start:performance.now()};
    pivot.rotation.set(name === 'angle'?-.08:0,0,name==='angle'?-.09:0);
    renderer.shadowMap.needsUpdate=true;
  }
  controls.addEventListener('start',()=>{transition=null;});
  function loop(now) {
    frame = requestAnimationFrame(loop);
    if(document.hidden) return;
    if(transition) {
      const t = reducedMotion ? 1 : Math.min((now-transition.start)/600,1);
      camera.position.lerpVectors(transition.from,transition.to,1-(1-t)**3);
      if(t===1) transition=null;
    }
    const changed=controls.update();
    if(needsRender||changed||transition||controls.autoRotate){renderer.render(scene,camera);needsRender=false;}
  }
  frame = requestAnimationFrame(loop);
  return {
    load, apply, view,
    zoom(direction) {
      transition=null;needsRender=true;
      const offset=camera.position.clone().sub(controls.target);
      const distance=THREE.MathUtils.clamp(offset.length()*(direction==='in'?.8:1.25),controls.minDistance,controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setLength(distance));controls.update();
    },
    rotate(value) {controls.autoRotate = value && !reducedMotion;needsRender=true;},
    async texture(part,file) {
      const url = URL.createObjectURL(file);
      try {
        const texture = await new THREE.TextureLoader().loadAsync(url);
        texture.colorSpace = THREE.SRGBColorSpace; texture.flipY=false;
        const oldTextures = new Set(targetsFor(part).map(key=>uploads.get(key)).filter(Boolean));
        for(const key of targetsFor(part)) uploads.set(key,texture);
        oldTextures.forEach(old=>{if(![...uploads.values()].includes(old))old.dispose();});
        if(activeState) apply(activeState,activeLight);
      } finally {URL.revokeObjectURL(url);}
    },
    clearTexture(part) {const old=new Set(targetsFor(part).map(key=>uploads.get(key)).filter(Boolean));targetsFor(part).forEach(key=>uploads.delete(key));old.forEach(t=>{if(![...uploads.values()].includes(t))t.dispose();});if(activeState) apply(activeState,activeLight);},
    hasTexture(part) {return targetsFor(part).some(key=>uploads.has(key));},
    capture() {renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
    dispose() {dead=true;cancelAnimationFrame(frame);viewport.disconnect();renderer.domElement.removeEventListener('wheel',handleWheel,true);controls.dispose();if(model)release(model);uploads.forEach(t=>t.dispose());artworkCache.forEach(disposeBakedArtwork);uvBaker?.dispose();emptyArtwork.dispose();barHalos.forEach(halo=>halo.material.dispose());glowMap.dispose();environment.dispose();shadow.geometry.dispose();shadow.material.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
</script>
