<script setup lang="ts">
import { computed } from 'vue';
import type { RiskLevel } from '../../types';

const props = defineProps<{ risk: RiskLevel; size?: 'sm' | 'md' }>();
const map: Record<RiskLevel, { label: string; cls: string; dot: string }> = {
  low: { label: '低危', cls: 'bg-[#eaf5fb] text-[#1a577c]', dot: 'bg-[#2c7da0]' },
  medium: { label: '中危', cls: 'bg-[#fbf3e2] text-[#96651a]', dot: 'bg-[#d99a2b]' },
  high: { label: '高危', cls: 'bg-[#fdeeea] text-[#bd4430]', dot: 'bg-[#d9553e]' },
  very_high: { label: '很高危', cls: 'bg-[#b2382b] text-white', dot: 'bg-white' },
};
const info = computed(() => map[props.risk]);
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full font-bold"
    :class="[info.cls, size === 'md' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[10px]']"
  >
    <span class="h-1 w-1 rounded-full" :class="info.dot" />
    {{ info.label }}
  </span>
</template>
