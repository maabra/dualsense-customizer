<template>

 <header><a class="brand" href="./" aria-label="DualSense Studio home"><StudioLogo /> DUALSENSE<span class="brand-light">STUDIO</span></a><span class="header-caption">AN UNOFFICIAL PLAYGROUND</span><button id="share" @click="share" class="outline">↗ <span>Share build</span></button></header>
 <dialog ref="modelDialog" class="model-dialog" aria-labelledby="model-title" @cancel="!studioReady && $event.preventDefault()">
  <form @submit.prevent="startModel">
   <StudioLogo /><h2 id="model-title">Choose your model</h2><p class="model-intro">The same studio. Your level of detail.</p>
   <label v-for="model in modelOptions" :key="model.id" class="model-option" :class="{selected:chosenModel===model.id}"><input type="radio" v-model="chosenModel" :value="model.id" name="model"><span><strong>{{model.name}} <small v-if="model.id==='original'">RECOMMENDED</small></strong><span>{{model.description}}</span><em>{{model.size}}</em></span></label>
   <p class="model-hint">Every model supports all customizable parts. You can switch at any time.</p>
   <button class="model-start" type="submit" autofocus>Open studio <span>↗</span></button>
  </form>
 </dialog>
 <main>
  <section id="stage" aria-label="Interactive 3D controller preview">
   <div class="intro"><p class="eyebrow"><span class="dot"></span> YOUR CONTROLLER. YOUR RULES.</p><h1>Made to play.<br><em>Built by you.</em></h1><p class="intro-copy">Iconic parts. Unexpected combinations.<br>A DualSense that’s entirely yours.</p></div>
   <div id="canvas-wrap" ref="canvasWrap"></div>
   <div id="loading" role="status" v-if="loading"><span class="spinner"></span><span id="loading-text">{{loadingLabel}}</span></div>
   <div v-if="fatalError" class="model-error" role="alert">{{fatalError}} <button class="outline" @click="retry">Try again</button></div>
   <div class="stage-label"><button id="model-status" :disabled="loading" @click="openModelChooser">{{ studioReady ? activeModel.name : 'Choose a model' }} <span>↗</span></button></div>
   <div class="view-controls" aria-label="Camera controls"><button v-for="v in views" :key="v[0]" :class="{active: activeView===v[0]}" @click="setView(v[0])">{{v[1]}}</button><span></span><button id="rotate" :aria-pressed="rotating" :class="{active:rotating}" @click="toggleRotate" title="Auto rotate">⟳</button><button id="capture" @click="capture" title="Download preview image">↓ PNG</button></div>
   <p class="gesture"><span class="desktop-gesture">Left drag to rotate · Right drag to move · Scroll to zoom</span><span class="mobile-gesture">Drag to rotate · Two fingers to move and zoom</span></p>
  </section>
  <aside id="panel" aria-label="Controller customization">
   <button id="sheet-toggle" aria-label="Expand or collapse customization panel" :aria-expanded="expanded" @click="!suppressClick && (expanded = !expanded)" @touchstart="sheetTouchStart" @touchend="sheetTouchEnd"><span></span><span class="sheet-label">Customize your controller <b>⌄</b></span></button>
   <div class="panel-heading"><div><p class="eyebrow">THE CONFIGURATOR</p><h2>Make it yours<span>.</span></h2></div><button id="reset" @click="reset" class="icon-button" title="Reset build">↺</button></div>
   <div class="panel-scroll">
    <div class="section-top"><span class="step">01</span><h3>Choose a part</h3><span id="part-count">{{visibleParts.length}} PARTS</span></div>
    <div class="mode-switch" role="group" aria-label="Customization detail"><button :class="{active:!advanced}" :aria-pressed="!advanced" @click="setAdvanced(false)">Basic</button><button :class="{active:advanced}" :aria-pressed="advanced" @click="setAdvanced(true)">Advanced <span>25 parts</span></button></div>
    <p v-if="advanced" class="advanced-hint">Each piece gets its own color, finish, and texture. Left and right are viewed from the front.</p>
    <div id="parts" class="parts" :class="{'advanced-parts':advanced}"><button v-for="p in visibleParts" :key="p[0]" class="part" :class="{active: selectedPart===p[0]}" :aria-pressed="selectedPart===p[0]" @click="selectedPart=p[0]; expanded=true"><span class="symbol" aria-hidden="true">{{p[2]}}</span><span class="part-name">{{p[1]}}</span></button></div>
    <div class="section-top"><span class="step">02</span><h3>Find your finish</h3></div>
    <div class="tabs" role="group" aria-label="Palette category"><button v-for="t in tabs" :key="t[0]" :class="{active:tab===t[0]}" :aria-pressed="tab===t[0]" @click="tab=t[0]; expanded=true">{{t[1]}}</button></div>
    <div id="palette">
     <div v-if="tab==='standard'" class="swatches"><button v-for="c in standardColors" :key="c.id" class="swatch" :class="{active:!mixed && current.id===c.id}" :aria-pressed="!mixed && current.id===c.id" :title="c.name" @click="choose(c)"><span class="swatch-color" :style="{'--swatch':c.hex}"></span><span class="swatch-name">{{c.name}}</span></button></div>
     <template v-else-if="tab==='edition'"><input class="edition-search" v-model="search" placeholder="Find an edition…" aria-label="Search editions"><div class="edition-list"><button v-for="c in editions" :key="c.id" class="edition-card" :class="{active:!mixed && current.id===c.id}" :aria-pressed="!mixed && current.id===c.id" @click="choose(c)"><span class="edition-chip" :style="{'--swatch':c.hex,'--accent':c.accent}"></span><span><b>{{c.name}}</b><small>COLOR PREVIEW · ARTWORK NEEDED</small></span><span>{{!mixed && current.id===c.id?'✓':'↗'}}</span></button><p class="empty-search" v-if="!editions.length">No matching editions.</p></div></template>
     <div v-else><label class="custom-control">Your own color<input type="color" :value="current.hex || currentEntry?.hex || '#c5f36b'" @input="customColor($event.target.value)"></label><label class="upload-label">↑ Import a texture for {{partName.toLowerCase()}}<input type="file" accept="image/png,image/jpeg,image/webp" @change="uploadTexture"></label><p class="custom-hint">PNG, JPG or WebP · up to 20 MB. Must match this model’s UV layout. Uploaded textures stay in this session and are not included in share links.</p><button v-if="hasUpload" class="clear-texture" @click="clearTexture">Remove imported texture</button></div>
    </div>
    <div id="selection-info"><p v-if="mixed" class="mixed-note">These pieces have different settings. Choosing a finish or palette here applies it to the whole group.</p><strong>{{ mixed ? 'Mixed selections' : currentEntry?.name || 'Custom color' }} <span v-if="hasUpload">· Imported texture</span></strong><p v-if="currentEntry?.type==='edition'">Palette approximation only. Edition graphics and colored button symbols require authentic textures.</p></div>
    <div class="finish-row"><label for="finish">Surface finish</label><select id="finish" :value="mixedFinish ? 'mixed' : current.finish" @change="setFinish($event.target.value)"><option v-if="mixedFinish" value="mixed" disabled>Mixed</option><option value="original">Original</option><option value="matte">Matte</option><option value="satin">Satin</option><option value="metallic">Metallic</option><option value="gloss">Gloss</option></select></div>
    <div class="section-top model-top"><span class="step">03</span><h3>The finer details</h3></div>
    <div class="setting"><div><b>Controller model</b><p>{{activeModel.name}}</p></div><button class="outline" id="quality" :disabled="loading || !!fatalError" @click="openModelChooser">Change</button></div>
    <div class="setting"><div><b>Light bar</b><p>A little signature glow</p></div><input type="color" id="light-color" v-model="light" aria-label="Light bar color"></div>
    <details class="build-details"><summary>Your combination <span>＋</span></summary><div id="build-list"><div v-for="p in advancedParts" :key="p[0]" class="build-item"><span>{{p[1]}}</span><b>{{byId[build[p[0]].id]?.name || 'Custom color'}}</b></div></div><button id="export" @click="exportBuild" class="outline">↓ Export build JSON</button></details>
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
import { parts, advancedParts, targetsFor, parentPart, catalog, byId, defaults } from './catalog';
import { createStudio } from './renderer';
import StudioLogo from './StudioLogo.vue';

const STORAGE = 'dualsense-studio-v1';
const build = reactive(defaults());
const selectedPart = ref('shell'), tab = ref('standard'), search = ref('');
const modelOptions = [
  {id:'original',name:'Original',description:'The supplied Collada model with its original 4K textures.',size:'52 MB download · source geometry and original materials'},
  {id:'high',name:'High Definition',description:'The previous detailed GLB model with 4K textures.',size:'50 MB download'},
  {id:'low',name:'Low Definition',description:'The lightweight GLB model with 1K textures.',size:'7 MB download · faster on mobile'},
];
const light = ref('#91aaff'), quality = ref('original'), loading = ref(false), loadingLabel = ref('Loading original model…');
const activeModel=computed(()=>modelOptions.find(model=>model.id===quality.value));
const chosenModel = ref('original'), modelDialog = ref(null), studioReady = ref(false);
function openModelChooser() {chosenModel.value=quality.value;modelDialog.value?.showModal();}
function startModel() {modelDialog.value?.close();studio?.load(chosenModel.value);}
const expanded = ref(false), rotating = ref(false), activeView = ref('angle'), toastText = ref(''), fatalError = ref('');
const canvasWrap = ref(null), uploaded = reactive({});
const views = [['front','Front'],['back','Back'],['angle','Perspective']];
const tabs = [['standard','Colors'],['edition','Editions'],['custom','Custom']];
const advanced = ref(false);
const visibleParts = computed(()=>advanced.value ? advancedParts : parts);
const selectedTargets = computed(()=>targetsFor(selectedPart.value));
const current = computed(()=>build[selectedTargets.value[0]]);
const mixed = computed(()=>selectedTargets.value.some(key=>JSON.stringify(build[key])!==JSON.stringify(current.value)));
const mixedFinish = computed(()=>selectedTargets.value.some(key=>build[key].finish!==current.value.finish));
const hasUpload = computed(()=>selectedTargets.value.some(key=>uploaded[key]));
function setAdvanced(value) {
  if(value===advanced.value)return;
  const old=selectedPart.value;
  advanced.value=value;
  selectedPart.value=value ? targetsFor(old)[0] : (parts.some(p=>p[0]===parentPart(old)) ? parentPart(old) : 'buttons');
  expanded.value=true;
}
function setFinish(finish) {for(const key of selectedTargets.value)build[key]={...build[key],finish};}
function clearSelectedUploads() {studio?.clearTexture(selectedPart.value);for(const key of selectedTargets.value)delete uploaded[key];}

const currentEntry = computed(()=>byId[current.value.id]);
const partName = computed(()=>[...parts,...advancedParts].find(p=>p[0]===selectedPart.value)[1]);
const standardColors = catalog.filter(c=>c.type==='standard');
const editions = computed(()=>catalog.filter(c=>c.type==='edition' && c.name.toLowerCase().includes(search.value.toLowerCase())));
let studio, toastTimer, touchY = 0, suppressClick = false;
function notify(message) {toastText.value=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastText.value='',3500);}
function snapshot() {return {version:2,parts:JSON.parse(JSON.stringify(build)),light:light.value};}
function restore(data) {
  if(![1,2].includes(data?.version) || !data.parts || typeof data.parts!=='object') return;
  for(const [p] of advancedParts) {
    const v=data.parts[p] || (data.version===1 ? data.parts[parentPart(p)] : null);
    if(!v || (!Object.hasOwn(byId,v.id) && v.id!=='custom')) continue;
    const finish = ['original','matte','satin','metallic','gloss'].includes(v.finish)?v.finish:'original';
    build[p]={id:v.id,finish};
    if(v.id==='custom') build[p].hex=/^#[a-f\d]{6}$/i.test(v.hex)?v.hex:'#c5f36b';
  }
  if(/^#[a-f\d]{6}$/i.test(data.light)) light.value=data.light;
}
function choose(c) {clearSelectedUploads();for(const key of selectedTargets.value)build[key]={id:c.id,finish:'original'};}
function customColor(hex) {clearSelectedUploads();for(const key of selectedTargets.value)build[key]={id:'custom',hex,finish:build[key].finish};}
function reset() {
  Object.assign(build,defaults());light.value='#91aaff';
  for(const [p] of advancedParts) {studio?.clearTexture(p);delete uploaded[p];}
  setView('angle');notify('Back to the original.');
}
function randomize() {
  for(const [p] of advancedParts) {
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
  try {await studio.texture(target,file);targetsFor(target).forEach(key=>uploaded[key]=file.name);notify('Texture applied to '+[...parts,...advancedParts].find(p=>p[0]===target)[1].toLowerCase()+'.');}
  catch {notify('This texture could not be read. Try another image.');}
  event.target.value='';
}
function clearTexture() {clearSelectedUploads();}
function sheetTouchStart(event) {touchY=event.changedTouches[0].clientY;}
function sheetTouchEnd(event) {
  const delta=event.changedTouches[0].clientY-touchY;
  if(Math.abs(delta)>20) {expanded.value=delta<0;suppressClick=true;setTimeout(()=>suppressClick=false,300);}
}
function report(status) {
  if(status.loading!==undefined) loading.value=status.loading;
  const name=modelOptions.find(model=>model.id===status.level)?.name || 'controller';
  if(status.loading) loadingLabel.value=`Loading ${name}…`;
  if(status.progress!==undefined) loadingLabel.value=`Loading ${name} · ${status.progress}%`;
  if(status.quality) quality.value=status.quality;
  if(status.error) {if(!studioReady.value)fatalError.value=status.error;else notify(status.error);}
  else if(status.loading===false) {fatalError.value='';studioReady.value=true;}
}
function retry() {fatalError.value='';studio?.load(chosenModel.value);}
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
  try {studio=createStudio(canvasWrap.value,report);studio.apply(build,light.value);modelDialog.value?.showModal();}
  catch(error) {loading.value=false;fatalError.value='Your browser could not start the 3D preview. Enable WebGL or try a different browser.';console.error(error);}
});
onBeforeUnmount(()=> {studio?.dispose();clearTimeout(toastTimer);window.removeEventListener('hashchange',loadHash);document.body.classList.remove('sheet-expanded');});
</script>
