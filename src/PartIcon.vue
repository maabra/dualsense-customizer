<template><span class="part-icon" :class="{'part-icon-pair':cells.length===2,'part-icon-quad':cells.length>2}" aria-hidden="true"><span v-for="cell in cells" :key="cell" class="icon-cell" :style="{'background-image':`url(${atlas})`,'background-position':`${cell%5*25}% ${Math.floor(cell/5)*25}%`}"></span></span></template>
<script setup>
import { computed } from 'vue';
import { advancedParts, targetsFor } from './catalog';
const props=defineProps({part:{type:String,required:true}});
const atlas=new URL(/* @vite-ignore */ '../icons/dualsense-parts-atlas-v1.png',import.meta.url).href;
const cells=computed(()=>targetsFor(props.part).map(key=>advancedParts.findIndex(p=>p[0]===key)).filter(index=>index>=0));
</script>
<style scoped>
.part-icon{display:grid;width:42px;height:38px;flex-shrink:0}.icon-cell{display:block;min-width:0;min-height:0;background-repeat:no-repeat;background-size:500% 500%;filter:drop-shadow(0 1px 2px #0008)}.part-icon-pair{grid-template-columns:1fr 1fr;width:48px}.part-icon-quad{grid-template:1fr 1fr/1fr 1fr}.part-icon-pair .icon-cell{background-size:500% 500%}.part-icon-quad .icon-cell{background-size:500% 500%}
</style>
