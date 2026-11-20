<script setup lang="ts">
import { computed } from 'vue';
import { showToast } from 'vant';
import {
  Activity, Award, Download, Dumbbell, Flame, Flower2, HeartPulse, Image, Scale, Sparkles,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { NavBar, PageHero, SectionHead, Sparkline } from '../../components/ui';
import { addDays, DEMO_TODAY, fmtMD } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const sum = computed(() => store.summary(sid.value));
const bpSeries = computed(() => store.bpOf(sid.value).filter((r) => r.period === 'morning').map((r) => r.sbp));
const wtSeries = computed(() => store.weightOf(sid.value).map((r) => r.weight));
const checkinDays = computed(() => {
  const set = new Set<string>();
  [...store.bpOf(sid.value), ...store.exerciseOf(sid.value), ...store.dietOf(sid.value)].forEach((r) => set.add(r.date.slice(0, 10)));
  return set.size;
});
const days = computed(() => {
  const out: { date: string; level: number }[] = [];
  for (let i = 0; i < store.campDay; i++) {
    const date = addDays(store.camp.startDate, i);
    const bp = store.bpOf(sid.value).filter((r) => r.date.startsWith(date)).length;
    const ex = store.exerciseOf(sid.value).filter((r) => r.date.startsWith(date)).length;
    const diet = store.dietOf(sid.value).filter((r) => r.date.startsWith(date)).length;
    const med = store.medOf(sid.value).filter((r) => r.date === date && r.taken).length;
    const level = [bp > 0, ex > 0, diet >= 2, med > 0].filter(Boolean).length;
    out.push({ date, level });
  }
  return out;
});
const weeks = computed(() => [
  { label: '第 1 周', from: 0, to: 7 },
  { label: '第 2 周', from: 7, to: 14 },
  { label: '第 3 周', from: 14, to: store.campDay },
].map((w) => {
  const seg = days.value.slice(w.from, w.to);
  const active = seg.filter((d) => d.level >= 3).length;
  return { ...w, rate: Math.round((active / Math.max(1, seg.length)) * 100) };
}));
const exerciseBreakdown = computed(() => {
  const map: Record<string, number> = {};
  store.exerciseOf(sid.value).forEach((r) => (map[r.type] = (map[r.type] || 0) + 1));
  const max = Math.max(1, ...Object.values(map));
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n, pct: Math.round((n / max) * 100) }));
});
const achievements = computed(() => [
  { icon: '压', name: '血压记录 30 次', got: store.bpOf(sid.value).length >= 20 },
  { icon: '走', name: '连续运动 7 天', got: sum.value.streak >= 7 },
  { icon: '盐', name: '低盐饮食 14 天', got: store.dietOf(sid.value).filter((r) => r.salt === 'low').length >= 14 },
  { icon: '药', name: '用药依从 90%', got: sum.value.adherence.med >= 90 },
  { icon: '勤', name: '21 天全勤', got: checkinDays.value >= 21 },
  { icon: '标', name: '血压达标 7 天', got: (sum.value.bp?.sbp || 999) <= 130 },
]);
function exportImage() {
  showToast({ message: '个人历程长图已生成，可长按保存（演示）', position: 'bottom' });
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="个人历程" :on-back="store.back">
      <template #right><button class="text-[10px] font-bold text-brand-700" @click="exportImage">长图</button></template>
    </NavBar>
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <PageHero eyebrow="MY HEALTH JOURNEY" :title="`${s.name}的第 ${store.campDay} 天`" sub="把每一天的血压、运动、饮食和用药连起来，就是看得见的改变。">
          <div class="grid grid-cols-4 gap-2">
            <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">打卡天</div><div class="text-[16px] font-extrabold">{{ checkinDays }}</div></div>
            <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">↓SBP</div><div class="text-[16px] font-extrabold">{{ Math.abs(sum.sbpDrop || 0) }}</div></div>
            <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">↓体重</div><div class="text-[16px] font-extrabold">{{ Math.abs(sum.weightDrop || 0) }}</div></div>
            <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">小红花</div><div class="text-[16px] font-extrabold">{{ sum.flowers }}</div></div>
          </div>
        </PageHero>
      </div>

      <!-- 打卡热力图 -->
      <div class="mt-4 px-4">
        <SectionHead title="打卡热力图" sub="颜色越深，当天完成项越多" />
        <div class="glass-card rounded-2xl p-3.5">
          <div class="grid grid-cols-9 gap-1.5">
            <div v-for="d in days" :key="d.date" class="aspect-square rounded-[5px]" :class="d.level === 0 ? 'bg-black/[0.05]' : d.level === 1 ? 'bg-brand-200' : d.level === 2 ? 'bg-brand-300' : d.level === 3 ? 'bg-brand-500' : 'bg-brand-700'" :title="`${d.date} · ${d.level}/4`" />
          </div>
          <div class="mt-2 flex items-center justify-between text-[8px] text-muted">
            <span>{{ fmtMD(store.camp.startDate) }}</span>
            <span class="flex items-center gap-1">少 <i class="h-2 w-2 rounded-sm bg-brand-100" /><i class="h-2 w-2 rounded-sm bg-brand-300" /><i class="h-2 w-2 rounded-sm bg-brand-500" /><i class="h-2 w-2 rounded-sm bg-brand-700" /> 多</span>
            <span>{{ fmtMD(DEMO_TODAY) }}</span>
          </div>
        </div>
      </div>

      <!-- 趋势 -->
      <div class="mt-4 px-4">
        <SectionHead title="关键趋势" sub="血压 / 体重" />
        <div class="grid grid-cols-2 gap-2">
          <div class="soft-card rounded-2xl p-3">
            <div class="flex items-center justify-between"><span class="text-[10px] font-bold text-muted">收缩压</span><HeartPulse class="h-3.5 w-3.5 text-coral-500" /></div>
            <div class="mt-1 text-[22px] font-extrabold text-ink tabular">{{ sum.bp?.sbp }}<span class="text-[9px] text-muted">/{{ sum.bp?.dbp }}</span></div>
            <Sparkline :points="bpSeries" :width="130" :height="34" color="#D9553E" class="mt-1" />
          </div>
          <div class="soft-card rounded-2xl p-3">
            <div class="flex items-center justify-between"><span class="text-[10px] font-bold text-muted">体重</span><Scale class="h-3.5 w-3.5 text-brand-600" /></div>
            <div class="mt-1 text-[22px] font-extrabold text-ink tabular">{{ sum.weight }}<span class="text-[9px] text-muted">kg</span></div>
            <Sparkline :points="wtSeries" :width="130" :height="34" color="#1F6A95" class="mt-1" />
          </div>
        </div>
      </div>

      <!-- 每周完成率 -->
      <div class="mt-4 px-4">
        <SectionHead title="每周完成率" sub="强化期 3 周" />
        <div class="glass-card rounded-2xl p-3.5">
          <div v-for="w in weeks" :key="w.label" class="mb-2 last:mb-0">
            <div class="flex items-center justify-between text-[9.5px]"><span class="font-semibold text-ink">{{ w.label }}</span><span class="font-bold text-brand-700">{{ w.rate }}%</span></div>
            <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.05]"><div class="h-full rounded-full bg-[linear-gradient(90deg,#4B99C8,#1F6A95)]" :style="{ width: w.rate + '%' }" /></div>
          </div>
        </div>
      </div>

      <!-- 运动结构 -->
      <div class="mt-4 px-4">
        <SectionHead title="运动结构" sub="按类型统计次数" />
        <div class="glass-card rounded-2xl p-3.5">
          <div v-for="e in exerciseBreakdown" :key="e.name" class="mt-2 first:mt-0">
            <div class="flex items-center justify-between text-[9.5px]"><span class="font-semibold text-ink">{{ e.name }}</span><span class="text-muted">{{ e.n }} 次</span></div>
            <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.05]"><div class="h-full rounded-full bg-coral-400" :style="{ width: e.pct + '%' }" /></div>
          </div>
        </div>
      </div>

      <!-- 成就 -->
      <div class="mt-4 px-4">
        <SectionHead title="阶段成就" sub="二期将上线完整勋章体系" />
        <div class="grid grid-cols-3 gap-2">
          <div v-for="a in achievements" :key="a.name" class="rounded-2xl border p-2.5 text-center" :class="a.got ? 'border-amber-200/60 bg-amber-50/60' : 'border-black/[0.04] bg-white/50 opacity-55'">
            <div class="text-[17px] font-extrabold text-amber-700">{{ a.icon }}</div>
            <div class="mt-1 text-[9px] font-bold text-ink">{{ a.name }}</div>
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-2 px-4 pb-8">
        <button class="tap flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-[11px] font-bold text-white" @click="exportImage"><Image class="h-4 w-4" /> 生成长图</button>
        <button class="tap flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-600/20 bg-white py-3 text-[11px] font-bold text-brand-700" @click="store.setView('s-report')"><Download class="h-4 w-4" /> 营期报告</button>
      </div>
    </div>
  </div>
</template>
