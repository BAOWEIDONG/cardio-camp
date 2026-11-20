<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: 'brand' | 'coral' | 'amber' | 'slate' | 'blue';
  delta?: string;
  good?: boolean;
}>();
</script>

<template>
  <div class="soft-card rounded-2xl px-3.5 py-3">
    <div class="flex items-start justify-between gap-1">
      <div class="text-[11px] font-semibold text-muted">{{ label }}</div>
      <slot name="icon" />
    </div>
    <div class="mt-1.5 flex items-baseline gap-1">
      <span
        class="stat-num text-[25px]"
        :class="{
          'text-brand-700': tone === 'brand' || !tone,
          'text-coral-500': tone === 'coral',
          'text-amber-600': tone === 'amber',
          'text-slate-700': tone === 'slate',
          'text-[#2C7DA0]': tone === 'blue',
        }"
      >{{ value }}</span>
      <span v-if="unit" class="text-[10.5px] font-semibold text-muted">{{ unit }}</span>
    </div>
    <div class="mt-1 flex items-center gap-1.5">
      <span v-if="delta" class="text-[10.5px] font-bold" :class="good ? 'text-brand-600' : 'text-coral-500'">{{ delta }}</span>
      <span v-if="hint" class="text-[10px] text-muted/80">{{ hint }}</span>
    </div>
  </div>
</template>
