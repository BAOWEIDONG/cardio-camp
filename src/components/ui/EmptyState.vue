<script setup lang="ts">
defineProps<{ title?: string; sub?: string }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
      <slot name="icon"><span class="text-2xl">🌿</span></slot>
    </div>
    <div class="mt-3 text-[13px] font-bold text-ink">{{ title || '暂无记录' }}</div>
    <div class="mt-1 text-[11px] leading-relaxed text-muted">{{ sub || '完成打卡后这里会自动生成记录' }}</div>
    <slot />
  </div>
</template>
