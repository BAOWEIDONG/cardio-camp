<script setup lang="ts">
import { computed } from 'vue';
const props = withDefaults(defineProps<{ value: number; max?: number; tone?: 'brand' | 'coral' | 'amber'; height?: number }>(), {
  max: 100, tone: 'brand', height: 6,
});
const pct = computed(() => Math.max(0, Math.min(100, (props.value / props.max) * 100)));
</script>

<template>
  <div class="bar-track" :style="{ height: height + 'px' }">
    <div class="bar-fill" :class="{ 'bar-fill-coral': tone === 'coral', 'bar-fill-amber': tone === 'amber' }" :style="{ width: pct + '%' }" />
  </div>
</template>
