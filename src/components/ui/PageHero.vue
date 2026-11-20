<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'student' | 'doctor' | 'coach' | 'dietitian' | 'admin'; eyebrow?: string; title: string; sub?: string; compact?: boolean }>(), {
  variant: 'student', compact: false,
});
</script>

<template>
  <div
    class="hero-card rounded-[26px] px-4 text-white"
    :class="[
      variant === 'doctor' ? 'hero-doctor' : variant === 'coach' ? 'hero-coach' : variant === 'dietitian' ? 'hero-dietitian' : variant === 'admin' ? 'hero-admin' : '',
      compact ? 'py-3.5' : 'py-4',
    ]"
  >
    <svg class="ecg-deco" viewBox="0 0 340 46" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 30 H58 L66 30 L72 12 L78 40 L84 22 L90 30 H132 L140 30 L146 16 L152 36 L158 24 L164 30 H210 L218 30 L224 14 L230 38 L236 22 L242 30 H286 L294 30 L300 18 L306 34 L312 26 L318 30 H340"
        fill="none" stroke="white" stroke-width="1.3" stroke-linecap="round" opacity=".55" />
    </svg>
    <div class="relative">
      <div v-if="eyebrow" class="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">{{ eyebrow }}</div>
      <div class="mt-1 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-[21px] font-extrabold leading-snug tracking-tight">{{ title }}</h1>
          <p v-if="sub" class="mt-1 text-[11.5px] leading-relaxed text-white/75">{{ sub }}</p>
        </div>
        <slot name="right" />
      </div>
      <div v-if="$slots.default" class="mt-3"><slot /></div>
    </div>
  </div>
</template>
