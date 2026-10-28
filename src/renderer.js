import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { byId, paletteColor, defaultId, targetsFor, parentPart } from './catalog';
import { transferProgress } from './loading';
import { createEditionCanvas, artworkUVs, editionPartColor } from './edition-artwork';

export function createStudio(container, report) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .01, 100);
  camera.position.set(0, .55, 4.9);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', '3D DualSense controller. Left drag to rotate, right drag to move, scroll to zoom. On touch screens use two fingers to move and zoom.');
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.panSpeed = .75;
  controls.mouseButtons = {LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
  controls.touches = {ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
  controls.minDistance = .75;
  controls.maxDistance = 24;
  controls.zoomToCursor = true;
  controls.autoRotateSpeed = .7;
  controls.target.set(0, -.05, 0);
  let inspecting=false;
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
  const emptyArtwork=new THREE.DataTexture(new Uint8Array([255,255,255,0]),1,1);emptyArtwork.needsUpdate=true;
  function artworkFor(entry,part,group) {
    if(entry?.artwork!=='recreated')return null;
    const key=entry.id+'|'+(['buttons','dpad'].includes(group)?part:group);
    if(!artworkCache.has(key)) {
      const canvas=createEditionCanvas(entry.id,part,group);
      if(!canvas){artworkCache.set(key,null);return null;}
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());artworkCache.set(key,texture);
    }
    return artworkCache.get(key);
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const viewport = new ResizeObserver(() => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w,h); camera.aspect = w / Math.max(h,1);
    // Leave breathing room for the headline and the lower camera toolbar.
    camera.setViewOffset(w,h,0,-h * (w < 600 ? .075 : .085),w,h);
    camera.updateProjectionMatrix();
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
        const material = obj.material.clone(); obj.material = material;
        obj.castShadow=true;obj.receiveShadow=true;
        material.userData.originalRoughness=material.roughness;
        material.userData.originalMetalness=material.metalness;
        const part = material.name;
        const group = parentPart(part);
        obj.geometry.setAttribute('studioArtworkUv',new THREE.BufferAttribute(artworkUVs(obj.geometry,group),2));
        material.userData.originalMap = material.map;
        material.userData.originalRoughnessMap = material.roughnessMap;
        material.userData.tint = {value:new THREE.Color('#ffffff')};
        material.userData.blend = {value:0};
        material.userData.artwork={value:emptyArtwork};material.userData.artworkEnabled={value:0};
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
          shader.vertexShader='attribute vec2 studioArtworkUv;\nvarying vec2 vEditionUV;\nvarying float vEditionFacing;\n'+shader.vertexShader;
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvEditionUV=studioArtworkUv;\nvEditionFacing=max(0.0,normal.z);');
          shader.fragmentShader = 'uniform vec3 studioTint;\nuniform float studioBlend;\nuniform sampler2D studioArtwork;\nuniform float studioArtworkEnabled;\nvarying vec2 vEditionUV;\nvarying float vEditionFacing;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
            #include <map_fragment>
            float detail = 0.72 + 0.28 * dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
            diffuseColor.rgb = mix(diffuseColor.rgb, studioTint * detail, studioBlend);
            vec4 editionArt=texture2D(studioArtwork,vEditionUV);
            float artMask=studioArtworkEnabled*editionArt.a*smoothstep(0.25,0.75,vEditionFacing);
            diffuseColor.rgb=mix(diffuseColor.rgb,editionArt.rgb*(0.9+detail*0.1),artMask);
          `);
        };
      });
      if(model) {pivot.remove(model); release(model);}
      model = next; pivot.add(model); quality = level;
      if(activeState) apply(activeState, activeLight);
      report({loading:false,quality:level});
    } catch(error) {
      const missing = error.response?.status === 404 || /\b404\b/.test(error.message || '');
      const name = {original:'Original',high:'High Definition',low:'Low Definition'}[level] || 'Controller';
      const message = missing
        ? `${name} model file was not found (404). The site may be updating. Retry or choose another model.`
        : `${name} could not be downloaded or opened. Retry, or try Low Definition for a smaller download.`;
      report({loading:false,error:message+(model?' Your current model is still available.':''),quality});
      console.error(error);
    } finally {busy = false;}
  }
  function apply(state, light = '#0072ff') {
    activeState = state; activeLight = light;
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
      const group=parentPart(part),artwork=upload?null:artworkFor(entry,part,group);
      m.userData.artwork.value=artwork||emptyArtwork;m.userData.artworkEnabled.value=artwork?1:0;
      m.map = upload || m.userData.originalMap;
      m.userData.blend.value = upload ? 0 : native ? 0 : 1;
      m.userData.tint.value.set(selection.id === 'custom' ? selection.hex || '#69aaff' : editionPartColor(entry,part,group)||paletteColor(entry,part));
      const finish = selection.finish === 'original' ? entry?.finish || 'matte' : selection.finish;
      const original=native && selection.finish==='original' && !upload;
      m.roughness = original ? m.userData.originalRoughness : {matte:.68,satin:.4,metallic:.26,gloss:.14}[finish] || .7;
      m.metalness = original ? m.userData.originalMetalness : finish === 'metallic' ? .85 : 0;
      m.roughnessMap = native && selection.finish === 'original' ? m.userData.originalRoughnessMap : null;
      m.needsUpdate = true;
    });
  }
  let transition;
  function view(name, resetDistance = false) {
    const distance = resetDistance ? 4.9 : camera.position.distanceTo(controls.target);
    controls.target.set(0,-.05,0);
    const direction = {front:new THREE.Vector3(0,.06,1),back:new THREE.Vector3(0,.06,-1),angle:new THREE.Vector3(1,.6,1.6)}[name].normalize();
    transition = {from:camera.position.clone(),to:controls.target.clone().add(direction.multiplyScalar(distance)),start:performance.now()};
    pivot.rotation.set(name === 'angle'?-.08:0,0,name==='angle'?-.09:0);
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
    controls.update(); renderer.render(scene,camera);
  }
  frame = requestAnimationFrame(loop);
  return {
    load, apply, view,
    zoom(direction) {
      transition=null;
      const offset=camera.position.clone().sub(controls.target);
      const distance=THREE.MathUtils.clamp(offset.length()*(direction==='in'?.8:1.25),controls.minDistance,controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setLength(distance));controls.update();
    },
    rotate(value) {controls.autoRotate = value && !reducedMotion;},
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
    dispose() {dead=true;cancelAnimationFrame(frame);viewport.disconnect();controls.dispose();if(model)release(model);uploads.forEach(t=>t.dispose());artworkCache.forEach(texture=>texture?.dispose());emptyArtwork.dispose();barHalos.forEach(halo=>halo.material.dispose());glowMap.dispose();environment.dispose();shadow.geometry.dispose();shadow.material.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
