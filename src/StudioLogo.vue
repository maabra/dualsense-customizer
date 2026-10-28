<template>
  <svg class="brand-mark" viewBox="0 0 100 66" fill="none" aria-hidden="true">
    <defs><clipPath :id="clipId"><path d="M28 12C18 12 13 18 10 29L4 50C1 62 11 66 19 58L31 46H69L81 58C89 66 99 62 96 50L90 29C87 18 82 12 72 12H64L59 8H41L36 12Z"/></clipPath></defs>
    <g :clip-path="`url(#${clipId})`">
      <path fill="#c5f36b" d="M0 0H40L14 70H0Z"/>
      <path fill="#74d9e8" d="M40 0H62L36 70H14Z"/>
      <path fill="#ad9af0" d="M62 0H84L58 70H36Z"/>
      <path fill="#f18da8" d="M84 0H105V70H58Z"/>
      <path stroke="#101311" stroke-width="4" d="M40 0 14 70M62 0 36 70M84 0 58 70"/>
      <path stroke="#101311" stroke-width="3" stroke-linecap="round" d="M23 26V38M17 32H29"/>
      <circle cx="77" cy="27" r="2" fill="#101311"/><circle cx="83" cy="33" r="2" fill="#101311"/><circle cx="71" cy="33" r="2" fill="#101311"/><circle cx="77" cy="39" r="2" fill="#101311"/>
    </g>
  </svg>
</template>
<script setup>
import { useId } from 'vue';
const clipId=useId();
</script>
