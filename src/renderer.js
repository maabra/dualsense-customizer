import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { byId, paletteColor } from './catalog';

export function createStudio(container, report) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .01, 100);
  camera.position.set(0, .55, 4.9);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', '3D DualSense controller. Drag to rotate and pinch or scroll to zoom.');
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.4;
  controls.maxDistance = 7;
  controls.autoRotateSpeed = .7;
  controls.target.set(0, -.05, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xf4ffde, 0x242d20, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3.5); key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc0ed84, 2); rim.position.set(4, 1, -2); scene.add(rim);
  // A soft procedural studio shadow, not controller artwork.
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d'); const gradient = ctx.createRadialGradient(64,64,2,64,64,64);
  gradient.addColorStop(0,'rgba(0,0,0,.5)'); gradient.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,128,128);
  const shadowMap = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.5,1.05), new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false}));
  shadow.rotation.x = -Math.PI/2; shadow.position.set(0,-.86,0); scene.add(shadow);
  const pivot = new THREE.Group(); pivot.rotation.set(-.12, -.16, -.09); scene.add(pivot);
  const loader = new GLTFLoader();
  let model, frame, dead = false, activeState, activeLight, busy = false, quality = 'low';
  const uploads = new Map();
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
    try {
      const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/dualsense-${level}.glb`, event => {
        if(event.total) report({progress:Math.round(event.loaded/event.total*100),level});
      });
      if(dead) {release(gltf.scene); return;}
      const next = gltf.scene;
      next.traverse(obj => {
        if(!obj.isMesh) return;
        const material = obj.material.clone(); obj.material = material;
        const part = material.name;
        material.userData.originalMap = material.map;
        material.userData.originalRoughnessMap = material.roughnessMap;
        material.userData.tint = {value:new THREE.Color('#ffffff')};
        material.userData.blend = {value:0};
        // Clear button caps need their original alpha to reveal the symbols below.
        material.transparent = ['buttons','dpad','details'].includes(part);
        material.depthWrite = !['buttons','dpad'].includes(part);
        if(['buttons','dpad'].includes(part)) {
          const index=obj.geometry.index, positions=obj.geometry.attributes.position;
          let depth=0;
          for(let i=0;i<index.count;i++)depth+=positions.getZ(index.getX(i));
          // Render internal button faces before the clear caps in front of them.
          obj.renderOrder=10+depth/index.count;
          material.side=THREE.FrontSide;
        }
        if(part !== 'light') {material.emissive.set(0); material.emissiveMap = null;}
        material.onBeforeCompile = shader => {
          shader.uniforms.studioTint = material.userData.tint;
          shader.uniforms.studioBlend = material.userData.blend;
          shader.fragmentShader = 'uniform vec3 studioTint;\nuniform float studioBlend;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
            #include <map_fragment>
            float detail = 0.72 + 0.28 * dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
            diffuseColor.rgb = mix(diffuseColor.rgb, studioTint * detail, studioBlend);
          `);
        };
      });
      if(model) {pivot.remove(model); release(model);}
      model = next; pivot.add(model); quality = level;
      if(activeState) apply(activeState, activeLight);
      report({loading:false,quality:level});
    } catch(error) {
      report({loading:false,error:model ? 'Could not load the detail model. Your current model is still available.' : 'Could not load the controller. Check your connection and reload.',quality});
      console.error(error);
    } finally {busy = false;}
  }
  function apply(state, light = '#91aaff') {
    activeState = state; activeLight = light;
    model?.traverse(obj => {
      if(!obj.isMesh) return;
      const m = obj.material, part = m.name;
      if(part === 'light') {m.emissive.set(light);m.emissiveIntensity=2;m.color.set(light);return;}
      if(!state[part]) return;
      const selection = state[part]; const entry = byId[selection.id];
      if(!entry && selection.id !== 'custom') return;
      const native = selection.id === (['trim','sticks','triggers'].includes(part)?'black':'white');
      const upload = uploads.get(part);
      m.map = upload || m.userData.originalMap;
      m.userData.blend.value = upload ? 0 : native ? 0 : 1;
      m.userData.tint.value.set(selection.id === 'custom' ? selection.hex || '#c5f36b' : paletteColor(entry,part));
      const finish = selection.finish === 'original' ? entry?.finish || 'matte' : selection.finish;
      m.roughness = {matte:.85,satin:.45,metallic:.3,gloss:.16}[finish] || .7;
      m.metalness = finish === 'metallic' ? .75 : .05;
      m.roughnessMap = native && selection.finish === 'original' ? m.userData.originalRoughnessMap : null;
      m.needsUpdate = true;
    });
  }
  let transition;
  function view(name) {
    const distance = camera.position.distanceTo(controls.target);
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
    rotate(value) {controls.autoRotate = value && !reducedMotion;},
    async texture(part,file) {
      const url = URL.createObjectURL(file);
      try {
        const texture = await new THREE.TextureLoader().loadAsync(url);
        texture.colorSpace = THREE.SRGBColorSpace; texture.flipY=false;
        const old = uploads.get(part); uploads.set(part,texture);old?.dispose();
        if(activeState) apply(activeState,activeLight);
      } finally {URL.revokeObjectURL(url);}
    },
    clearTexture(part) {uploads.get(part)?.dispose();uploads.delete(part);if(activeState) apply(activeState,activeLight);},
    hasTexture(part) {return uploads.has(part);},
    capture() {renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
    dispose() {dead=true;cancelAnimationFrame(frame);viewport.disconnect();controls.dispose();if(model)release(model);uploads.forEach(t=>t.dispose());environment.dispose();shadow.geometry.dispose();shadow.material.dispose();shadowMap.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
