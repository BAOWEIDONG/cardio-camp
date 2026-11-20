<script setup lang="ts">
import { computed } from 'vue';
import {
  CalendarDays, ChevronRight, Dumbbell, HeartPulse, Pill, Scale, Salad, Sparkles,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { NavBar, PageHero, SectionHead } from '../../components/ui';
import { DEMO_TODAY, fmtMD } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const done = computed(() => store.todayDone(sid.value));
const doneCount = computed(() => [done.value.bp, done.value.med, done.value.ex, done.value.diet].filter(Boolean).length);
const bp = computed(() => store.latestBp(sid.value));
const weight = computed(() => store.latestWeight(sid.value));
const todayMeals = computed(() => store.dietOf(sid.value).filter((r) => r.date.startsWith(DEMO_TODAY)).length);

const cards = computed(() => [
  { key: 'bp', title: '血压打卡', desc: done.value.bp ? '今日已记录' : '早晚各一次', value: bp.value ? `${bp.value.sbp}/${bp.value.dbp}` : '—', unit: 'mmHg', icon: HeartPulse, tone: 'bg-coral-50 text-coral-500', view: 's-bp' as const, ok: done.value.bp },
  { key: 'exercise', title: '运动打卡', desc: done.value.ex ? '今日已完成' : '按运动处方完成', value: String(store.exerciseOf(sid.value).filter((r) => r.date.startsWith(DEMO_TODAY)).reduce((n, r) => n + r.duration, 0)), unit: '分钟', icon: Dumbbell, tone: 'bg-brand-50 text-brand-700', view: 's-exercise' as const, ok: done.value.ex },
  { key: 'diet', title: '饮食打卡', desc: done.value.diet ? '三餐已完成' : `今日 ${todayMeals.value}/3 餐`, value: `${todayMeals.value}/3`, unit: '餐', icon: Salad, tone: 'bg-[#fbf3e2] text-amber-600', view: 's-diet' as const, ok: done.value.diet },
  { key: 'med', title: '用药打卡', desc: done.value.med ? '今日已服药' : '晨服 + 睡前', value: `${store.adherence(sid.value).med}%`, unit: '依从', icon: Pill, tone: 'bg-[#EDF5FA] text-[#2C7DA0]', view: 's-med' as const, ok: done.value.med },
  { key: 'weight', title: '体重打卡', desc: '每 2 天一次', value: String(weight.value?.weight ?? '—'), unit: 'kg', icon: Scale, tone: 'bg-brand-50 text-brand-700', view: 's-weight' as const, ok: false },
]);
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="健康打卡" :on-back="store.back">
      <template #right>
        <button class="flex items-center gap-1 text-[10px] font-bold text-brand-700" @click="store.setView('s-calendar')"><CalendarDays class="h-3.5 w-3.5" /> 日历</button>
      </template>
    </NavBar>
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <PageHero compact eyebrow="DAILY CHECK-IN" title="今天的健康作业" :sub="`${fmtMD(DEMO_TODAY)} · 强化期第 ${store.intensiveDay} 天`">
          <div class="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <div class="flex items-center justify-between text-[10px] text-white/65"><span>今日完成度</span><span>{{ doneCount }}/4</span></div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20"><div class="h-full rounded-full bg-white transition-all" :style="{ width: doneCount * 25 + '%' }" /></div>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-[9px] text-white/55">连续打卡 {{ store.streak(sid) }} 天</span>
              <span class="flex items-center gap-1 text-[9px] text-white/70"><Sparkles class="h-3 w-3" /> 完成打卡自动累计小红花</span>
            </div>
          </div>
        </PageHero>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="选择打卡项目" sub="每项独立记录，医师/运动师/营养师分别批注" />
        <div class="space-y-2">
          <button v-for="c in cards" :key="c.key" class="tap soft-card flex w-full items-center gap-3 rounded-2xl p-3.5 text-left" @click="store.setView(c.view)">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" :class="c.tone"><component :is="c.icon" class="h-5 w-5" /></span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="text-[12.5px] font-extrabold text-ink">{{ c.title }}</span><span v-if="c.ok" class="pill pill-green">已完成</span></div>
              <div class="mt-0.5 text-[9.5px] text-muted">{{ c.desc }}</div>
            </div>
            <div class="text-right">
              <div class="text-[16px] font-extrabold text-ink tabular">{{ c.value }}</div>
              <div class="text-[8px] text-muted">{{ c.unit }}</div>
            </div>
            <ChevronRight class="h-4 w-4 shrink-0 text-muted/30" />
          </button>
        </div>
      </div>

      <div class="mx-4 mt-4 rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3.5 py-3 text-[9px] leading-relaxed text-brand-800/80">
        <b>打卡规则：</b>血压建议晨起排尿后、服药前测量；运动前先测血压，≥180/110 暂停；饮食按 DASH 低盐低脂记录；用药需如实登记漏服。补录不计入连续天数。
      </div>
    </div>
  </div>
</template>
