<script setup lang="ts">
import { computed, type Component } from 'vue';
import { Tabbar as VanTabbar, TabbarItem as VanTabbarItem } from 'vant';
import { useAppStore } from '../../store/app';
import type { View } from '../../types';

const props = defineProps<{
  anchor: View;
  items: { key: View; label: string; icon: Component }[];
  badge?: number;
  variant?: 'brand' | 'coral' | 'blue' | 'ink';
  badgeIndex?: number;
}>();

const store = useAppStore();
const modelValue = computed(() => {
  const i = props.items.findIndex((t) => t.key === props.anchor);
  return i < 0 ? 0 : i;
});
const cls = computed(() => ({
  'tabbar-coral': props.variant === 'coral',
  'tabbar-blue': props.variant === 'blue',
  'tabbar-ink': props.variant === 'ink',
}));
function go(key: View) {
  store.setView(key, { tab: true });
}
</script>

<template>
  <VanTabbar class="custom-tabbar print-hide" :class="cls" :model-value="modelValue" :safe-area-inset-bottom="false">
    <VanTabbarItem
      v-for="(t, i) in items"
      :key="t.key"
      :badge="badge && (badgeIndex === undefined ? i === items.length - 1 : i === badgeIndex) ? badge : undefined"
      @click="go(t.key)"
    >
      <template #icon><component :is="t.icon" class="h-[22px] w-[22px]" /></template>
      {{ t.label }}
    </VanTabbarItem>
  </VanTabbar>
</template>
