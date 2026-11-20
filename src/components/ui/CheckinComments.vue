<script setup lang="ts">
import type { CheckinComment } from '../../types';

defineProps<{ comments: CheckinComment[] }>();

const ROLE_META: Record<CheckinComment['role'], { label: string; cls: string; bar: string }> = {
  dietitian: { label: '营养师', cls: 'bg-[#2C7DA0]/10 text-[#2C7DA0]', bar: 'border-[#2C7DA0]' },
  coach: { label: '运动师', cls: 'bg-[#E8674F]/10 text-[#E8674F]', bar: 'border-[#E8674F]' },
  doctor: { label: '医师', cls: 'bg-[#1F6A95]/10 text-[#1F6A95]', bar: 'border-[#1F6A95]' },
};
</script>

<template>
  <div v-if="comments.length > 0" class="space-y-2.5">
    <div v-for="c in comments" :key="c.id" :class="['border-l-2 pl-2.5', ROLE_META[c.role].bar]">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded-full', ROLE_META[c.role].cls]">{{ ROLE_META[c.role].label }}</span>
        <span class="text-xs font-bold text-gray-800">{{ c.name }}</span>
        <span v-if="c.date" class="text-[10px] text-gray-400">· {{ c.date }}</span>
      </div>
      <p class="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap">{{ c.text }}</p>
    </div>
  </div>
</template>