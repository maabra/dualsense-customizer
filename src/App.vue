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

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
:root{font-family:'DM Sans',sans-serif;color:#eceee7;background:#101311;font-synthesis:none;--lime:#c5f36b;--muted:#858d82;--line:#30372b;--panel:#1b201a}*{box-sizing:border-box}body{margin:0}button,a,input,select{-webkit-tap-highlight-color:transparent}button,input,select{font:inherit}button,a,select{touch-action:manipulation}button{cursor:pointer}button{color:inherit}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--lime);outline-offset:4px}a{color:inherit}header{height:88px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 42px;gap:20px}.brand{display:flex;align-items:center;gap:7px;font-size:15px;font-weight:700;letter-spacing:1.4px;text-decoration:none;white-space:nowrap}.brand-icon{color:var(--lime);font-size:38px;margin-right:7px;font-weight:400}.brand-light{font-weight:400;color:#a1a69b}.header-caption{font-size:10px;letter-spacing:2px;color:var(--muted)}.outline{background:transparent;border:1px solid #41483a;border-radius:7px;padding:11px 16px;font-size:12px}.outline:hover{border-color:var(--lime)}main{display:grid;grid-template-columns:minmax(0,1fr) 378px;min-height:760px;height:calc(100svh - 135px)}#stage{position:relative;isolation:isolate;overflow:hidden;background:radial-gradient(ellipse at 48% 55%,#323b2d 0%,#1d241c 35%,#141915 68%,#101511 100%)}#stage:after{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23fff' opacity='.035' filter='url(%23n)' d='M0 0h180v180H0z'/%3E%3C/svg%3E");pointer-events:none;z-index:-1}.intro{position:absolute;left:6%;top:6%;z-index:2;pointer-events:none}.eyebrow{font-size:9px;letter-spacing:2px;font-weight:600;color:#a4ac9a;margin:0 0 17px;display:flex;gap:8px;align-items:center}.dot{display:inline-block;width:5px;height:5px;background:var(--lime);border-radius:50%;box-shadow:0 0 12px #baf36b55}h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(38px,4.2vw,66px);line-height:1.04;letter-spacing:-3px;font-weight:500;margin:0}h1 em{font-style:normal;color:var(--lime)}.intro-copy{font-size:12px;line-height:1.8;color:#8f998a;margin-top:20px}#canvas-wrap{position:absolute;inset:0;z-index:1}canvas{display:block;width:100%;height:100%;touch-action:none;outline:none}.stage-label{position:absolute;left:6%;bottom:140px;display:flex;flex-direction:column;gap:8px;pointer-events:none;z-index:2}#build-name{font-family:'Space Grotesk',sans-serif;font-size:16px}#model-status{font-size:8px;letter-spacing:1.7px;color:#88977d}.view-controls{position:absolute;z-index:3;left:50%;transform:translateX(-50%);bottom:67px;display:flex;padding:5px;gap:3px;border:1px solid #424b36;border-radius:10px;background:#1a211bd9;backdrop-filter:blur(16px);white-space:nowrap}.view-controls button{background:none;border:0;border-radius:6px;padding:9px 13px;font-size:11px;color:#a5ae9c}.view-controls button.active{background:#343e2b;color:var(--lime)}.view-controls button:hover{color:var(--lime)}.view-controls>span{width:1px;background:var(--line);margin:6px}.gesture{position:absolute;bottom:27px;width:100%;text-align:center;font-size:10px;color:#7a8672;z-index:2;pointer-events:none}.gesture span{margin:0 10px}.stage-index{position:absolute;bottom:29px;left:6%;font-size:11px;color:var(--lime)}.stage-index span{font-size:8px;letter-spacing:1px;color:#6d7764;margin-left:10px}#panel{background:var(--panel);border-left:1px solid var(--line);display:flex;flex-direction:column;min-height:0;z-index:4}.panel-heading{padding:32px 28px 25px;display:flex;align-items:center;justify-content:space-between}.panel-heading .eyebrow{font-size:8px;margin-bottom:10px}h2{font-family:'Space Grotesk',sans-serif;font-size:29px;font-weight:500;letter-spacing:-1.3px;margin:0}h2 span{color:var(--lime)}.icon-button{background:transparent;border:1px solid #3d4536;border-radius:50%;height:32px;width:32px;font-size:21px;color:#a3ac99}.panel-scroll{padding:0 28px 20px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#48543d transparent}.section-top{display:flex;align-items:center;gap:9px;margin:0 0 16px}.step{font-size:9px;color:#8b9c79;border:1px solid #3c4833;display:grid;place-items:center;width:23px;height:23px;border-radius:50%}h3{font-size:12px;font-weight:550;margin:0}.section-top>span:last-child:not(.step){font-size:8px;letter-spacing:1px;color:#77816d;margin-left:auto}.parts{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:29px}.part{border:1px solid #343e2e;background:#20271e;border-radius:7px;padding:10px 2px 9px;display:flex;flex-direction:column;gap:8px;align-items:center;min-width:0}.part .symbol{font-size:24px;line-height:1.1;color:#a1ad95}.part .part-name{font-size:9px;white-space:nowrap;color:#a8b19f}.part.active{background:#303d21;border-color:#9ec459}.part.active .symbol,.part.active .part-name{color:var(--lime)}.tabs{display:flex;gap:2px;background:#11170f;padding:4px;border:1px solid #303a29;border-radius:7px;margin-bottom:16px}.tabs button{flex:1;padding:8px 0;font-size:11px;background:transparent;border:0;border-radius:4px;color:#8f9c83}.tabs button.active{color:#e5eddd;background:#303b28}.swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:12px 9px}.swatch{background:none;border:0;display:flex;flex-direction:column;align-items:center;gap:7px;padding:0;color:#85917b}.swatch-color{width:34px;height:34px;border-radius:50%;background:var(--swatch);border:3px solid var(--panel);outline:1px solid #424c39;position:relative}.swatch.active .swatch-color{outline:2px solid var(--lime)}.swatch.active .swatch-color:after{content:'✓';position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-size:13px;text-shadow:0 1px 3px #000}.swatch-name{font-size:8px;line-height:1.35;min-height:22px;text-align:center}.swatch.active{color:#dde8cd}#selection-info{margin-top:12px;min-height:43px;padding:12px 0;border-bottom:1px solid var(--line)}#selection-info strong{font-size:11px;font-weight:500}#selection-info p{font-size:10px;color:#8b977e;line-height:1.6;margin:6px 0 0}.edition-search{width:100%;border:1px solid #3d4835;background:#151b12;color:#e2e8dc;border-radius:6px;padding:10px 12px;font-size:11px;margin-bottom:10px}.edition-list{display:grid;gap:5px;max-height:236px;overflow:auto;scrollbar-width:thin}.edition-card{display:flex;align-items:center;text-align:left;gap:10px;border:1px solid #35402f;border-radius:6px;padding:10px;background:#20271c}.edition-card.active{border-color:#9ec459;background:#303d21}.edition-chip{width:28px;height:28px;border:1px solid #ffffff18;border-radius:7px;background:linear-gradient(135deg,var(--swatch) 60%,var(--accent) 60%)}.edition-card b{font-weight:500;font-size:11px;display:block}.edition-card small{font-size:8px;color:#8e9c80;display:block;margin-top:4px}.edition-card>span:last-child{margin-left:auto;color:#859b6e;font-size:11px}.finish-row{display:flex;align-items:center;justify-content:space-between;padding:15px 0;border-bottom:1px solid var(--line);font-size:11px;color:#a9b19f}select{background:#242d1e;color:#d6dec9;border:1px solid #3b4830;border-radius:5px;padding:6px 8px;font-size:10px;max-width:130px}.model-top{margin-top:25px}.setting{display:flex;align-items:center;justify-content:space-between;padding:9px 0;gap:8px}.setting b{font-size:11px;font-weight:500}.setting p{font-size:9px;color:#818f74;margin:5px 0}.switch{width:32px;height:18px;border:0;border-radius:12px;background:#424b39;position:relative;padding:0;flex-shrink:0}.switch:after{content:'';position:absolute;width:12px;height:12px;left:3px;top:3px;border-radius:50%;background:#a6b398;transition:transform .2s}.switch[aria-checked=true]{background:#b5df69}.switch[aria-checked=true]:after{transform:translateX(14px);background:#1e2e12}.switch:disabled{opacity:.45;cursor:wait}input[type=color]{width:30px;height:27px;border:1px solid #4b563e;padding:2px;background:transparent;border-radius:5px;cursor:pointer}.build-details{border-top:1px solid var(--line);margin-top:16px;padding-top:15px}.build-details summary{font-size:11px;color:#a8b39b;cursor:pointer;list-style:none;display:flex;justify-content:space-between}.build-details .outline{margin-top:14px;width:100%}.build-item{display:flex;justify-content:space-between;gap:15px;font-size:10px;line-height:1.7;padding:6px 0;border-bottom:1px solid #30372b}.build-item span{color:#8d9b7e}.build-item b{font-weight:400;text-align:right}.asset-note{font-size:9px;line-height:1.7;color:#7f8c72;margin:18px 0 0}.asset-note a{color:#b0bc9d;text-underline-offset:3px}.panel-footer{padding:19px 28px;border-top:1px solid var(--line);display:flex;align-items:center;gap:17px;margin-top:auto;background:#1b201a}.panel-footer button{border:0;background:var(--lime);color:#253313;font-size:18px;padding:12px 18px;border-radius:6px;display:flex;align-items:center;gap:10px}.panel-footer button span{font-size:11px;font-weight:600}.panel-footer>span{font-size:7px;letter-spacing:1.3px;color:#7f8d71}footer{height:47px;padding:0 35px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:15px;font-size:8px;letter-spacing:.8px;color:#707d66}footer a{text-decoration:none;color:#919e83}#sheet-toggle{display:none}#loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;background:#141a14db;z-index:5;font-size:12px;color:#c8d8b6}#loading.hidden{display:none}.spinner{width:18px;height:18px;border:2px solid #63754b;border-top-color:var(--lime);border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}#toast{position:fixed;bottom:30px;left:50%;transform:translate(-50%,15px);background:#d2f3a1;color:#233016;padding:12px 20px;border-radius:8px;font-size:12px;z-index:30;opacity:0;pointer-events:none;transition:.2s;max-width:90%;text-align:center}#toast.show{opacity:1;transform:translate(-50%,0)}.custom-control{display:flex;align-items:center;justify-content:space-between;font-size:12px;margin:16px 0}.upload-label{display:block;border:1px dashed #5c6e48;padding:14px;text-align:center;font-size:11px;border-radius:6px;cursor:pointer;color:#b9c7a9}.upload-label input{display:block;margin-top:10px;max-width:100%;font-size:10px}.custom-hint{font-size:10px;color:#87967a;line-height:1.6}.clear-texture{background:none;border:0;color:var(--lime);font-size:11px;padding:8px 0}.empty-search{font-size:11px;color:#a6b09b;padding:10px}#canvas-wrap.fallback{display:flex;align-items:center;justify-content:center;padding:30px;color:#bac7aa;text-align:center;font-size:13px;line-height:1.8}
@media(min-width:1500px){main{grid-template-columns:minmax(0,1fr) 410px}.panel-heading{padding-top:40px}.panel-scroll{padding-left:32px;padding-right:32px}.parts{gap:9px}.part{padding:14px 2px}.swatches{gap:18px 10px}.intro{top:7%}}
@media(max-width:1100px){header{padding:0 25px;height:72px}.header-caption{display:none}main{height:calc(100svh - 115px);grid-template-columns:minmax(0,1fr) 340px;min-height:700px}.panel-heading{padding:26px 22px}.panel-scroll{padding:0 22px 20px}.panel-footer{padding:16px 22px}.stage-index{display:none}h1{font-size:45px}.intro-copy{font-size:11px}.view-controls button{padding:9px 10px}footer{padding:0 24px;height:43px;font-size:7px}}
@media(max-width:760px){header{height:65px;padding:0 20px;gap:10px}.brand{font-size:11px;letter-spacing:1px;gap:4px}.brand-icon{font-size:30px;margin-right:5px}.outline{font-size:10px;padding:9px 11px}main{display:block;position:relative;height:calc(100svh - 65px);min-height:600px;overflow:hidden}#stage{height:62%;width:100%;transition:height .3s}.intro{top:22px;left:24px}.eyebrow{font-size:7px;letter-spacing:1.5px;margin-bottom:10px}h1{font-size:35px;letter-spacing:-1.7px}.intro-copy{display:none}.stage-label{left:24px;bottom:99px;gap:5px}#build-name{font-size:11px}#model-status{font-size:7px;letter-spacing:1px}.view-controls{bottom:36px;padding:4px;gap:2px}.view-controls button{font-size:10px;padding:8px 10px}.gesture{font-size:8px;bottom:7px;margin:0}#panel{position:absolute;top:62%;height:38%;left:0;right:0;border:1px solid #45503b;border-bottom:0;border-radius:20px 20px 0 0;transition:top .3s,height .3s;box-shadow:0 -12px 50px #0003}.panel-heading{padding:12px 22px 15px}.panel-heading .eyebrow{display:none}h2{font-size:23px}.panel-scroll{padding:0 22px 25px;overscroll-behavior:contain}.parts{grid-template-columns:repeat(4,1fr);margin-bottom:22px;gap:8px}.part{padding:10px 2px}.part .part-name{font-size:10px}.section-top{margin-bottom:12px}.panel-footer{padding:10px 22px calc(10px + env(safe-area-inset-bottom));}.panel-footer button{padding:10px 17px}.panel-footer>span{margin-left:auto}.swatches{grid-template-columns:repeat(5,1fr)}.swatch-color{height:38px;width:38px}.swatch-name{font-size:9px}#sheet-toggle{display:flex;flex-direction:column;align-items:center;flex-shrink:0;gap:8px;width:100%;border:0;background:transparent;padding:8px 20px 0}#sheet-toggle>span:first-child{width:32px;height:3px;border-radius:4px;background:#647255}.sheet-label{display:none}body.sheet-expanded #panel{top:32%;height:68%}body.sheet-expanded #stage{height:42%}body.sheet-expanded .intro{opacity:0}body.sheet-expanded .stage-label{bottom:70px}body.sheet-expanded .view-controls{bottom:12px}body.sheet-expanded .gesture{display:none}footer{display:none}#loading{font-size:11px}.edition-list{max-height:250px}.panel-scroll::-webkit-scrollbar{width:3px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}.spinner{animation:none}}
.model-error{position:absolute;inset:30% 10%;z-index:8;background:#172015ee;border:1px solid #526342;border-radius:10px;padding:25px;text-align:center;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;font-size:13px;line-height:1.7}
.mode-switch{display:flex;gap:4px;padding:4px;background:#11170f;border:1px solid #303a29;border-radius:7px;margin-bottom:15px}.mode-switch button{flex:1;border:0;border-radius:4px;background:none;color:#96a28b;padding:9px 6px;font-size:11px}.mode-switch button.active{background:#344427;color:var(--lime)}.mode-switch button span{font-size:8px;margin-left:6px;opacity:.7}.advanced-hint{font-size:10px;line-height:1.6;color:#94a185;margin:0 0 13px}.advanced-parts{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.advanced-parts .part{padding:9px 3px}.advanced-parts .symbol{font-size:19px}.advanced-parts .part-name{font-size:9px;white-space:normal;line-height:1.3;text-align:center}.mixed-note{color:var(--lime)!important;margin-bottom:10px!important}
.advanced-parts{max-height:258px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#526243 transparent;padding:4px;overscroll-behavior:contain}
@media(max-height:540px) and (min-width:761px) and (max-width:1100px){header{height:52px}main{height:calc(100svh - 52px);min-height:0;grid-template-columns:minmax(0,1fr) 310px}.intro{top:18px;left:24px}.intro h1{font-size:25px;letter-spacing:-1px}.intro .eyebrow{font-size:6px;margin-bottom:8px}.intro-copy{display:none}.stage-label{bottom:67px;left:24px}#build-name{font-size:10px}#model-status{font-size:6px}.view-controls{bottom:12px}.view-controls button{font-size:9px;padding:7px}.gesture{display:none}.panel-heading{padding:13px 18px}.panel-heading .eyebrow{display:none}h2{font-size:23px}.panel-scroll{padding:0 18px 15px}.parts{margin-bottom:18px}.part{padding:7px 1px}.part .symbol{font-size:19px}.part .part-name{font-size:8px}.panel-footer{padding:8px 18px}.panel-footer button{padding:8px 13px}.panel-footer>span{font-size:6px}footer{display:none}}

.brand-mark{width:46px;height:33px;flex-shrink:0;margin-right:8px}.stage-label{pointer-events:auto}#model-status{border:1px solid #414c39;background:#182017b3;border-radius:20px;color:#c5cfbb;padding:8px 12px;font:inherit;font-size:10px;letter-spacing:.3px;cursor:pointer}#model-status span{margin-left:12px;color:var(--lime)}#model-status:disabled{opacity:.6;cursor:wait}.mobile-gesture{display:none}.gesture>span{margin:0}.model-dialog{width:min(510px,calc(100% - 32px));max-height:calc(100svh - 32px);overflow:auto;padding:32px;border:1px solid #4e5e40;border-radius:18px;background:#1b211a;color:#edf1e6;box-shadow:0 35px 120px #0008}.model-dialog::backdrop{background:#0a0e0be8;backdrop-filter:blur(14px)}.model-dialog .brand-mark{width:66px;height:44px;margin-bottom:20px}.model-dialog h2{font-size:30px}.model-intro{font-size:12px;line-height:1.7;color:#9ca990;margin:12px 0 25px}.model-option{display:flex;gap:13px;align-items:flex-start;padding:19px 16px;border:1px solid #3b4732;border-radius:10px;margin-bottom:12px;cursor:pointer;background:#20281d}.model-option.selected{border-color:#b5dc70;background:#2b3822}.model-option input{accent-color:#c5f36b;margin:3px 0 0;flex-shrink:0}.model-option>span{display:flex;flex-direction:column;gap:10px}.model-option strong{font-weight:600;font-size:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}.model-option small{font-size:7px;letter-spacing:1px;padding:4px 6px;background:#c5f36b;color:#253313;border-radius:3px}.model-option span span{font-size:11px;color:#bdc8b2;line-height:1.6}.model-option em{font-style:normal;font-size:10px;color:#8d9e7d}.model-hint{font-size:10px;color:#93a184;line-height:1.7;margin:18px 0}.model-start{width:100%;padding:14px 18px;border:0;border-radius:7px;background:#c5f36b;color:#223213;font-weight:600;font-size:13px;display:flex;justify-content:space-between}.model-start:hover{background:#d2ff80}@media(max-width:760px){.brand-mark{width:36px;height:26px;margin-right:4px}.desktop-gesture{display:none}.mobile-gesture{display:inline}.model-dialog{padding:24px}.model-dialog h2{font-size:26px}.model-option{padding:16px 12px}.stage-label{bottom:92px}body.sheet-expanded .stage-label{bottom:61px}#model-status{font-size:8px;padding:6px 9px}}

</style>
