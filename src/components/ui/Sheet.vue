<script setup lang="ts">
import { Popup as VanPopup } from 'vant';
defineProps<{ show: boolean; title?: string; sub?: string; height?: string }>();
const emit = defineEmits<{ (e: 'update:show', v: boolean): void }>();
</script>

<template>
  <VanPopup
    :show="show" position="bottom" round closeable teleport="body" class="custom-popup"
    :style="{ height: height || 'auto' }" :safe-area-inset-bottom="true"
    @update:show="emit('update:show', $event)"
  >
    <div class="flex max-h-[82dvh] flex-col">
      <div class="px-5 pb-2 pt-5">
        <div class="text-[16px] font-extrabold text-ink">{{ title }}</div>
        <div v-if="sub" class="mt-0.5 text-[11.5px] text-muted">{{ sub }}</div>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-6 no-scrollbar"><slot /></div>
    </div>
  </VanPopup>
</template>
