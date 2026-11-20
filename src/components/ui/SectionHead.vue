<script setup lang="ts">
defineProps<{ title: string; sub?: string; icon?: unknown }>();
</script>

<template>
  <div class="mb-2.5 flex items-end justify-between gap-3 px-0.5">
    <div class="min-w-0">
      <div class="section-title">
        <slot name="icon" />
        <span class="truncate">{{ title }}</span>
      </div>
      <div v-if="sub" class="section-sub">{{ sub }}</div>
    </div>
    <slot name="action" />
  </div>
</template>
