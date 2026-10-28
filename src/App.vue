<template>

 <header><a class="brand" href="./" aria-label="DualSense Studio home"><span class="brand-icon">✳</span> DUALSENSE<span class="brand-light">STUDIO</span></a><span class="header-caption">AN UNOFFICIAL PLAYGROUND</span><button id="share" @click="share" class="outline">↗ <span>Share build</span></button></header>
 <main>
  <section id="stage" aria-label="Interactive 3D controller preview">
   <div class="intro"><p class="eyebrow"><span class="dot"></span> YOUR CONTROLLER. YOUR RULES.</p><h1>Made to play.<br><em>Built by you.</em></h1><p class="intro-copy">Iconic parts. Unexpected combinations.<br>A DualSense that’s entirely yours.</p></div>
   <div id="canvas-wrap" ref="canvasWrap"></div>
   <div id="loading" role="status" v-if="loading"><span class="spinner"></span><span id="loading-text">{{loadingLabel}}</span></div>
   <div v-if="fatalError" class="model-error" role="alert">{{fatalError}} <button class="outline" @click="retry">Try again</button></div>
   <div class="stage-label"><span id="build-name">{{ buildName }}</span><span id="model-status">3D STUDIO / {{ quality === 'high' ? 'HIGH DETAIL' : 'LOW POLY' }}</span></div>
   <div class="view-controls" aria-label="Camera controls"><button v-for="v in views" :key="v[0]" :class="{active: activeView===v[0]}" @click="setView(v[0])">{{v[1]}}</button><span></span><button id="rotate" :aria-pressed="rotating" :class="{active:rotating}" @click="toggleRotate" title="Auto rotate">⟳</button><button id="capture" @click="capture" title="Download preview image">↓ PNG</button></div>
   <p class="gesture">↔ Drag to orbit <span>·</span> Scroll or pinch to zoom</p>
   <div class="stage-index">01 <span>/ INFINITE POSSIBILITIES</span></div>
  </section>
  <aside id="panel" aria-label="Controller customization">
   <button id="sheet-toggle" aria-label="Expand or collapse customization panel" :aria-expanded="expanded" @click="!suppressClick && (expanded = !expanded)" @touchstart="sheetTouchStart" @touchend="sheetTouchEnd"><span></span><span class="sheet-label">Customize your controller <b>⌄</b></span></button>
   <div class="panel-heading"><div><p class="eyebrow">THE CONFIGURATOR</p><h2>Make it yours<span>.</span></h2></div><button id="reset" @click="reset" class="icon-button" title="Reset build">↺</button></div>
   <div class="panel-scroll">
    <div class="section-top"><span class="step">01</span><h3>Choose a part</h3><span id="part-count">8 PARTS</span></div>
    <div id="parts" class="parts"><button v-for="p in parts" :key="p[0]" class="part" :class="{active: selectedPart===p[0]}" :aria-pressed="selectedPart===p[0]" @click="selectedPart=p[0]; expanded=true"><span class="symbol" aria-hidden="true">{{p[2]}}</span><span class="part-name">{{p[1]}}</span></button></div>
    <div class="section-top"><span class="step">02</span><h3>Find your finish</h3></div>
    <div class="tabs" role="group" aria-label="Palette category"><button v-for="t in tabs" :key="t[0]" :class="{active:tab===t[0]}" :aria-pressed="tab===t[0]" @click="tab=t[0]; expanded=true">{{t[1]}}</button></div>
    <div id="palette">
     <div v-if="tab==='standard'" class="swatches"><button v-for="c in standardColors" :key="c.id" class="swatch" :class="{active:current.id===c.id}" :aria-pressed="current.id===c.id" :title="c.name" @click="choose(c)"><span class="swatch-color" :style="{'--swatch':c.hex}"></span><span class="swatch-name">{{c.name}}</span></button></div>
     <template v-else-if="tab==='edition'"><input class="edition-search" v-model="search" placeholder="Find an edition…" aria-label="Search editions"><div class="edition-list"><button v-for="c in editions" :key="c.id" class="edition-card" :class="{active:current.id===c.id}" :aria-pressed="current.id===c.id" @click="choose(c)"><span class="edition-chip" :style="{'--swatch':c.hex,'--accent':c.accent}"></span><span><b>{{c.name}}</b><small>COLOR PREVIEW · ARTWORK NEEDED</small></span><span>{{current.id===c.id?'✓':'↗'}}</span></button><p class="empty-search" v-if="!editions.length">No matching editions.</p></div></template>
     <div v-else><label class="custom-control">Your own color<input type="color" :value="current.hex || currentEntry?.hex || '#c5f36b'" @input="customColor($event.target.value)"></label><label class="upload-label">↑ Import a texture for {{partName.toLowerCase()}}<input type="file" accept="image/png,image/jpeg,image/webp" @change="uploadTexture"></label><p class="custom-hint">PNG, JPG or WebP · up to 20 MB. Must match this model’s UV layout. Uploaded textures stay in this session and are not included in share links.</p><button v-if="uploaded[selectedPart]" class="clear-texture" @click="clearTexture">Remove imported texture</button></div>
    </div>
    <div id="selection-info"><strong>{{ currentEntry?.name || 'Custom color' }} <span v-if="uploaded[selectedPart]">· Imported texture</span></strong><p v-if="currentEntry?.type==='edition'">Palette approximation only. Edition graphics and colored button symbols require authentic textures.</p></div>
    <div class="finish-row"><label for="finish">Surface finish</label><select id="finish" v-model="current.finish"><option value="original">Original</option><option value="matte">Matte</option><option value="satin">Satin</option><option value="metallic">Metallic</option><option value="gloss">Gloss</option></select></div>
    <div class="section-top model-top"><span class="step">03</span><h3>The finer details</h3></div>
    <div class="setting"><div><b>High detail model</b><p>Upgrade geometry · 48 MB download</p></div><button class="switch" id="quality" role="switch" :aria-checked="quality==='high'" :disabled="loading || !!fatalError" @click="toggleQuality" aria-label="High detail model"></button></div>
    <div class="setting"><div><b>Light bar</b><p>A little signature glow</p></div><input type="color" id="light-color" v-model="light" aria-label="Light bar color"></div>
    <details class="build-details"><summary>Your combination <span>＋</span></summary><div id="build-list"><div v-for="p in parts" :key="p[0]" class="build-item"><span>{{p[1]}}</span><b>{{byId[build[p[0]].id]?.name || 'Custom color'}}</b></div></div><button id="export" @click="exportBuild" class="outline">↓ Export build JSON</button></details>
    <p class="asset-note">Edition colors are approximations. Authentic artwork needs UV-matched textures. <a href="./ASSETS.md" target="_blank">Asset guide ↗</a></p>
   </div>
   <div class="panel-footer"><button id="randomize" @click="randomize">⤨ <span>Surprise me</span></button><span>MIX. MATCH. MAKE.</span></div>
  </aside>
 </main>
 <footer><span>DESIGNED FOR YOUR NEXT OBSESSION.</span><span>Unofficial fan project · <a href="https://sketchfab.com/3d-models/playstation-5-dualsense-878c1f882808477ab81c2fe86d5a3936" target="_blank" rel="noreferrer">3D model: AHarmlessPotato / CC BY 4.0 ↗</a></span></footer>
 <div id="toast" role="status" :class="{show:toastText}">{{toastText}}</div>

</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { parts, catalog, byId, defaults } from './catalog';
import { createStudio } from './renderer';

const STORAGE = 'dualsense-studio-v1';
const build = reactive(defaults());
const selectedPart = ref('shell'), tab = ref('standard'), search = ref('');
const light = ref('#91aaff'), quality = ref('low'), loading = ref(true), loadingLabel = ref('Loading lightweight model…');
const expanded = ref(false), rotating = ref(false), activeView = ref('angle'), toastText = ref(''), fatalError = ref('');
const canvasWrap = ref(null), uploaded = reactive({});
const views = [['front','Front'],['back','Back'],['angle','Perspective']];
const tabs = [['standard','Colors'],['edition','Editions'],['custom','Custom']];
const current = computed(()=>build[selectedPart.value]);
const currentEntry = computed(()=>byId[current.value.id]);
const partName = computed(()=>parts.find(p=>p[0]===selectedPart.value)[1]);
const standardColors = catalog.filter(c=>c.type==='standard');
const editions = computed(()=>catalog.filter(c=>c.type==='edition' && c.name.toLowerCase().includes(search.value.toLowerCase())));
const buildName = computed(()=> {
  const ids = new Set(parts.map(([p])=>build[p].id));
  const original = defaults();
  return parts.every(([p])=>build[p].id===original[p].id) ? 'Classic White' : ids.size===1 ? byId[build.shell.id]?.name || 'Custom build' : 'Your signature mix';
});
let studio, toastTimer, touchY = 0, suppressClick = false;
function notify(message) {toastText.value=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastText.value='',3500);}
function snapshot() {return {version:1,parts:JSON.parse(JSON.stringify(build)),light:light.value};}
function restore(data) {
  if(data?.version!==1 || !data.parts || typeof data.parts!=='object') return;
  for(const [p] of parts) {
    const v=data.parts[p];
    if(!v || (!byId[v.id] && v.id!=='custom')) continue;
    const finish = ['original','matte','satin','metallic','gloss'].includes(v.finish)?v.finish:'original';
    build[p]={id:v.id,finish};
    if(v.id==='custom') build[p].hex=/^#[a-f\d]{6}$/i.test(v.hex)?v.hex:'#c5f36b';
  }
  if(/^#[a-f\d]{6}$/i.test(data.light)) light.value=data.light;
}
function choose(c) {studio?.clearTexture(selectedPart.value);delete uploaded[selectedPart.value];build[selectedPart.value]={id:c.id,finish:'original'};}
function customColor(hex) {build[selectedPart.value]={id:'custom',hex,finish:current.value.finish};}
function reset() {
  Object.assign(build,defaults());light.value='#91aaff';
  for(const [p] of parts) {studio?.clearTexture(p);delete uploaded[p];}
  setView('angle');notify('Back to the original.');
}
function randomize() {
  for(const [p] of parts) {
    studio?.clearTexture(p);delete uploaded[p];
    build[p]={id:catalog[Math.floor(Math.random()*catalog.length)].id,finish:'original'};
  }
  notify('A new combination. All yours.');
}
function setView(view) {activeView.value=view;studio?.view(view);}
function toggleRotate() {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) {notify('Auto rotation is off to respect reduced motion.');return;}
  rotating.value=!rotating.value;studio?.rotate(rotating.value);
}
function download(data,name) {const a=document.createElement('a');a.href=data;a.download=name;a.click();}
function capture() {if(studio&&!loading.value&&!fatalError.value) download(studio.capture(),'dualsense-studio.png');else notify('Wait for the controller to load.');}
function exportBuild() {
  const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}));
  download(url,'dualsense-build.json');setTimeout(()=>URL.revokeObjectURL(url),1000);
  if(Object.keys(uploaded).length) notify('Build exported. Imported texture files are not included.');
}
async function share() {
  const url=new URL(location.href);url.hash='build='+encodeURIComponent(JSON.stringify(snapshot()));
  try {await navigator.clipboard.writeText(url.href);notify(Object.keys(uploaded).length?'Link copied. Imported textures are not included.':'Build link copied.');}
  catch {location.hash=url.hash;notify('Build saved in the address bar. Copy the URL to share.');}
}
async function uploadTexture(event) {
  const file=event.target.files[0];if(!file)return;
  const target=selectedPart.value;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024) {notify('Choose a PNG, JPG or WebP under 20 MB.');event.target.value='';return;}
  if(!studio) {notify('The 3D preview is unavailable.');return;}
  try {await studio.texture(target,file);uploaded[target]=file.name;notify('Texture applied to '+parts.find(p=>p[0]===target)[1].toLowerCase()+'.');}
  catch {notify('This texture could not be read. Try another image.');}
  event.target.value='';
}
function clearTexture() {studio?.clearTexture(selectedPart.value);delete uploaded[selectedPart.value];}
function toggleQuality() {studio?.load(quality.value==='low'?'high':'low');}
function sheetTouchStart(event) {touchY=event.changedTouches[0].clientY;}
function sheetTouchEnd(event) {
  const delta=event.changedTouches[0].clientY-touchY;
  if(Math.abs(delta)>20) {expanded.value=delta<0;suppressClick=true;setTimeout(()=>suppressClick=false,300);}
}
function report(status) {
  if(status.loading!==undefined) loading.value=status.loading;
  if(status.loading) loadingLabel.value=status.level==='high'?'Loading high detail model…':'Loading lightweight model…';
  if(status.progress!==undefined) loadingLabel.value=`Loading ${status.level==='high'?'high detail':'lightweight'} model · ${status.progress}%`;
  if(status.quality) quality.value=status.quality;
  if(status.error) {if(!studioReady)fatalError.value=status.error;else notify(status.error);}
  else if(status.loading===false) {fatalError.value='';studioReady=true;}
}
let studioReady=false;
function retry() {fatalError.value='';studio?.load('low');}
watch([build,light],()=> {
  studio?.apply(build,light.value);
  try {localStorage.setItem(STORAGE,JSON.stringify(snapshot()));}catch{}
},{deep:true});
watch(expanded,value=>document.body.classList.toggle('sheet-expanded',value));
function loadHash() {
  if(!location.hash.startsWith('#build='))return false;
  try {restore(JSON.parse(decodeURIComponent(location.hash.slice(7))));return true;}catch{return false;}
}
onMounted(()=> {
  if(!loadHash()) {try {restore(JSON.parse(localStorage.getItem(STORAGE)));}catch{}}
  window.addEventListener('hashchange',loadHash);
  try {studio=createStudio(canvasWrap.value,report);studio.apply(build,light.value);studio.load('low');}
  catch(error) {loading.value=false;fatalError.value='Your browser could not start the 3D preview. Enable WebGL or try a different browser.';console.error(error);}
});
onBeforeUnmount(()=> {studio?.dispose();clearTimeout(toastTimer);window.removeEventListener('hashchange',loadHash);document.body.classList.remove('sheet-expanded');});
</script>
