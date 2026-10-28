<template>
 <aside id="panel" ref="panel" aria-label="Controller customization" :class="{'drawer-dragging':dragging,'drawer-collapsed':mobile&&!expanded&&!dragging}" :style="panelStyle" @touchstart="contentStart" @touchmove="contentMove" @touchend="contentEnd" @touchcancel="cancel">
  <button id="sheet-toggle" aria-label="Expand or collapse customization panel" :aria-expanded="expanded" @click="toggle" @pointerdown="handleStart" @pointermove="handleMove" @pointerup="handleEnd" @pointercancel="cancel" @keydown.up.prevent="emit('update:expanded',true)" @keydown.down.prevent="emit('update:expanded',false)">
   <span></span>
  </button>
  <slot />
 </aside>
</template>

<script setup>
import {ref,computed,watch,nextTick,onMounted,onBeforeUnmount} from 'vue';
const props=defineProps({expanded:Boolean});
const emit=defineEmits(['update:expanded','position']);
const panel=ref(null),mobile=ref(false),height=ref(0),safeBottom=ref(0),dragging=ref(false),dragTop=ref(null);
const openTop=computed(()=>Math.max(0,Math.min(height.value-180,Math.max(112,height.value*.3))));
const closedTop=computed(()=>Math.max(openTop.value,height.value-100-safeBottom.value));
const top=computed(()=>dragTop.value??(props.expanded?openTop.value:closedTop.value));
const panelStyle=computed(()=>mobile.value&&height.value?{top:top.value+'px',height:Math.max(0,height.value-top.value)+'px',transition:dragging.value?'none':undefined}:{});
let gesture=null,observer,query,ignoreClickUntil=0;
watch([top,mobile,dragging],()=>emit('position',{top:top.value,mobile:mobile.value,dragging:dragging.value}),{flush:'sync'});
function begin(y,kind){gesture={y,lastY:y,lastTime:performance.now(),velocity:0,start:top.value,kind,moved:0};}
function move(y){
 if(!gesture)return;
 const now=performance.now(),elapsed=now-gesture.lastTime;
 if(elapsed>0)gesture.velocity=(y-gesture.lastY)/elapsed;
 gesture.lastY=y;gesture.lastTime=now;gesture.moved=Math.max(gesture.moved,Math.abs(y-gesture.y));
 dragging.value=true;dragTop.value=Math.max(openTop.value,Math.min(closedTop.value,gesture.start+y-gesture.y));
}
function finish(){
 if(!gesture)return;
 const velocity=performance.now()-gesture.lastTime>120?0:gesture.velocity;
 const moved=gesture.moved>6,projected=top.value+Math.max(-2,Math.min(2,velocity))*140;
 const shouldOpen=projected<(openTop.value+closedTop.value)/2;
 gesture=null;dragging.value=false;
 if(moved){ignoreClickUntil=performance.now()+350;emit('update:expanded',shouldOpen);}
 nextTick(()=>dragTop.value=null);
}
function cancel(){gesture=null;dragging.value=false;dragTop.value=null;}
function toggle(){if(performance.now()>ignoreClickUntil)emit('update:expanded',!props.expanded);}
function handleStart(event){
 if(!mobile.value||!event.isPrimary||event.button!==0)return;
 event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);begin(event.clientY,'handle');
}
function handleMove(event){if(gesture?.kind==='handle')move(event.clientY);}
function handleEnd(event){if(gesture?.kind==='handle'){if(Math.abs(event.clientY-gesture.lastY)>.1)move(event.clientY);finish();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
function contentStart(event){
 if(!mobile.value||event.touches.length!==1||event.target.closest('button,a,input,select,textarea,label,#sheet-toggle'))return;
 const scroll=event.target.closest('.panel-scroll');
 if(scroll&&scroll.scrollTop>0)return;
 begin(event.touches[0].clientY,'content');
}
function contentMove(event){
 if(gesture?.kind!=='content'||event.touches.length!==1)return;
 const y=event.touches[0].clientY,delta=y-gesture.y;
 if(!dragging.value){
  // An open drawer keeps normal upward scrolling. A downward pull at the
  // beginning of the list hands the gesture to the drawer.
  if(Math.abs(delta)<8)return;
  if(delta<0&&props.expanded){gesture=null;return;}
 }
 if(event.cancelable)event.preventDefault();move(y);
}
function contentEnd(event){
 if(gesture?.kind!=='content')return;
 const y=event.changedTouches[0]?.clientY;
 // Touch moves can be coalesced on busy devices. The release coordinate is
 // authoritative even when the final move event did not reach the drawer.
 if(y!==undefined&&Math.abs(y-gesture.lastY)>.1)move(y);
 finish();
}
function measure(){height.value=panel.value?.parentElement.clientHeight||0;safeBottom.value=parseFloat(getComputedStyle(panel.value).getPropertyValue('--drawer-safe-bottom'))||0;}
function changeMode(){mobile.value=query.matches;cancel();measure();}
onMounted(()=>{
 query=matchMedia('(max-width:760px)');changeMode();query.addEventListener('change',changeMode);
 observer=new ResizeObserver(measure);observer.observe(panel.value.parentElement);
});
onBeforeUnmount(()=>{observer?.disconnect();query?.removeEventListener('change',changeMode);});
</script>

<style>
@media(max-width:760px){
 #panel{--drawer-safe-bottom:env(safe-area-inset-bottom,0px)}
 #panel.drawer-collapsed .panel-navigation{padding-bottom:env(safe-area-inset-bottom,0px)}
 #panel.drawer-dragging{user-select:none;will-change:top,height}
 #sheet-toggle{min-height:44px;touch-action:none;cursor:grab;padding:9px 20px 6px;justify-content:center}
 #panel.drawer-dragging #sheet-toggle{cursor:grabbing}
 #panel.drawer-collapsed .panel-scroll,#panel.drawer-collapsed .panel-footer{display:none}
 #panel .studio-nav button{min-height:48px}
 #panel .panel-navigation>#reset{width:44px;height:44px}
 #panel .tabs button,#panel .back-to-parts,#panel .panel-footer .done-button{min-height:44px}
 #panel input[type=search],#panel select{font-size:16px;min-height:44px}
 #panel select{max-width:180px}
 #panel input[type=color]{width:44px;height:40px}
 .zoom-controls button{min-width:42px;min-height:42px}
 .view-controls button{min-height:40px}
 #panel .panel-scroll{overscroll-behavior-y:contain;touch-action:pan-y}
}
@media(prefers-reduced-motion:reduce){#panel{transition:none!important}}
</style>
