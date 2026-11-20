<script setup lang="ts">
import { computed } from 'vue';
const props = withDefaults(defineProps<{
  value: number; max?: number; size?: number; stroke?: number; color?: string; track?: string;
}>(), { max: 100, size: 92, stroke: 8, color: '#0E7C6B', track: 'rgba(14,124,107,.12)' });
const r = computed(() => (props.size - props.stroke) / 2);
const c = computed(() => 2 * Math.PI * r.value);
const pct = computed(() => Math.max(0, Math.min(1, props.value / props.max)));
</script>

<template>
  <div class="relative inline-flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="-rotate-90">
      <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke="track" :stroke-width="stroke" />
      <circle
        :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke="color" :stroke-width="stroke"
        stroke-linecap="round" :stroke-dasharray="c" :stroke-dashoffset="c * (1 - pct)"
        style="transition: stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <slot />
    </div>
  </div>
</template>
