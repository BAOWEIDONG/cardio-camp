<script setup lang="ts">
import { computed } from 'vue';
const props = withDefaults(defineProps<{
  points: number[]; width?: number; height?: number; color?: string; fill?: boolean; strokeWidth?: number;
}>(), { width: 120, height: 36, color: '#0E7C6B', fill: true, strokeWidth: 2 });

const geometry = computed(() => {
  const arr = props.points.filter((n) => Number.isFinite(n));
  if (arr.length < 2) return { line: '', area: '', last: null as null | { x: number; y: number } };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const span = max - min || 1;
  const pad = props.strokeWidth + 1;
  const w = props.width;
  const h = props.height;
  const coords = arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return { x, y };
  });
  const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${h} L${coords[0].x.toFixed(1)},${h} Z`;
  return { line, area, last: coords[coords.length - 1] };
});
const uid = `spark-${Math.random().toString(36).slice(2, 8)}`;
</script>

<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="overflow-visible">
    <defs>
      <linearGradient :id="uid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.24" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="fill && geometry.area" :d="geometry.area" :fill="`url(#${uid})`" />
    <path v-if="geometry.line" :d="geometry.line" fill="none" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
    <circle v-if="geometry.last" :cx="geometry.last.x" :cy="geometry.last.y" r="2.4" :fill="color" stroke="#fff" stroke-width="1.6" />
  </svg>
</template>
