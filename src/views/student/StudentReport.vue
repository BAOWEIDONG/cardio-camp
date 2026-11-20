<script setup lang="ts">
import { computed } from 'vue';
import { showToast } from 'vant';
import {
  Activity, Award, CalendarCheck, ChevronLeft, Download, Dumbbell, FileHeart, Flower2,
  HeartPulse, Image, Quote, Share2, ShieldCheck, Stethoscope, Target, TrendingDown, UtensilsCrossed,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { NavBar, ProgressBar, RiskBadge, Sparkline } from '../../components/ui';
import { DEMO_TODAY, fmtShort } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const base = computed(() => store.snapshotOf(sid.value, 'baseline'));
const avg = computed(() => store.bpAvg(sid.value, 7));
const weight = computed(() => store.latestWeight(sid.value));
const ex = computed(() => store.exerciseOf(sid.value));
const diet = computed(() => store.dietOf(sid.value));
const totalMin = computed(() => ex.value.reduce((n, r) => n + r.duration, 0));
const latestFu = computed(() => store.followupsOf(sid.value)[0]);
const sum = computed(() => store.summary(sid.value));
const bpSeries = computed(() => store.bpOf(sid.value).filter((r) => r.period === 'morning').map((r) => r.sbp));
const checkinDays = computed(() => {
  const set = new Set<string>();
  [...store.bpOf(sid.value), ...ex.value, ...diet.value].forEach((r) => set.add(r.date.slice(0, 10)));
  return set.size;
});
const dietComments = computed(() => diet.value.filter((r) => r.comments?.length).length);
const exerciseComments = computed(() => ex.value.filter((r) => r.comments?.length).length);

const metrics = computed(() => {
  const b = base.value?.values || {};
  const cur: Record<string, number | null> = {
    sbp: avg.value?.sbp ?? null,
    dbp: avg.value?.dbp ?? null,
    weight: weight.value?.weight ?? null,
    bmi: weight.value ? +(weight.value.weight / ((s.value.height / 100) ** 2)).toFixed(1) : null,
    waist: weight.value?.waist ?? null,
    bodyFat: weight.value?.bodyFat ?? null,
  };
  const rows = [
    { key: 'sbp', name: '收缩压', unit: 'mmHg', better: 'down' },
    { key: 'dbp', name: '舒张压', unit: 'mmHg', better: 'down' },
    { key: 'weight', name: '体重', unit: 'kg', better: 'down' },
    { key: 'bmi', name: 'BMI', unit: 'kg/m²', better: 'down' },
    { key: 'waist', name: '腰围', unit: 'cm', better: 'down' },
  ];
  return rows.map((r) => {
    const before = b[r.key] as number | undefined;
    const now = cur[r.key];
    const change = before !== undefined && now !== null ? +(now - before).toFixed(1) : null;
    return { ...r, before: before ?? null, now, change, good: change !== null && change < 0 };
  }).filter((r) => r.before !== null || r.now !== null);
});

const achievements = computed(() => [
  { icon: '压', name: '血压记录 30 次', got: true },
  { icon: '走', name: '连续运动 7 天', got: true },
  { icon: '盐', name: '低盐饮食 14 天', got: true },
  { icon: '药', name: '用药依从 90%', got: sum.value.adherence.med >= 90 },
  { icon: '勤', name: '21 天全勤', got: false },
  { icon: '标', name: '血压达标 7 天', got: false },
]);

function exportPdf() {
  showToast({ message: '正在生成 PDF…', position: 'bottom' });
  setTimeout(() => window.print(), 400);
}
function exportImage() {
  showToast({ message: '长图已生成，可长按保存（演示）', position: 'bottom' });
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="个人营期报告" :on-back="store.back">
      <template #right>
        <button class="text-[10px] font-bold text-brand-700" @click="exportImage">长图</button>
      </template>
    </NavBar>

    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <!-- 报告头 -->
        <div class="hero-card rounded-[24px] p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[9.5px] font-bold tracking-[0.16em] text-white/55">STAGE HEALTH REPORT</div>
              <div class="mt-1 text-[20px] font-extrabold">{{ s.name }}的健康阶段报告</div>
              <div class="mt-1 text-[10px] text-white/65">{{ store.camp.name }} · 开营第 {{ store.campDay }} 天 · {{ DEMO_TODAY }}</div>
            </div>
            <RiskBadge :risk="s.risk" size="md" />
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2">
              <div class="text-[8.5px] text-white/55">收缩压变化</div>
              <div class="mt-0.5 text-[16px] font-extrabold">{{ sum.sbpDrop !== null && sum.sbpDrop > 0 ? '↓' : '' }}{{ Math.abs(sum.sbpDrop || 0) }}<span class="text-[8px] font-normal text-white/60"> mmHg</span></div>
            </div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2">
              <div class="text-[8.5px] text-white/55">体重变化</div>
              <div class="mt-0.5 text-[16px] font-extrabold">↓{{ Math.abs(sum.weightDrop || 0) }}<span class="text-[8px] font-normal text-white/60"> kg</span></div>
            </div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2">
              <div class="text-[8.5px] text-white/55">打卡天数</div>
              <div class="mt-0.5 text-[16px] font-extrabold">{{ checkinDays }}<span class="text-[8px] font-normal text-white/60"> 天</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 医师结论 -->
      <div class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF3F5] text-[#0F5C6B]"><Stethoscope class="h-4 w-4" /></span>
            <div>
              <div class="text-[11.5px] font-extrabold text-ink">医师结论</div>
              <div class="text-[8.5px] text-muted">{{ latestFu?.doctorName }} 主任医师 · {{ latestFu?.date.slice(0, 10) }} · {{ latestFu?.type }}</div>
            </div>
            <Quote class="ml-auto h-5 w-5 text-brand-600/20" />
          </div>
          <div class="mt-2 text-[10.5px] leading-relaxed text-ink/80">{{ latestFu?.conclusion }}</div>
          <div class="mt-2 rounded-xl bg-brand-50/60 px-2.5 py-2 text-[9.5px] leading-relaxed text-brand-800/80">
            <b>干预方案：</b>{{ latestFu?.plan }}
          </div>
        </div>
      </div>

      <!-- 指标 -->
      <div class="mt-3 px-4">
        <div class="section-title mb-2"><HeartPulse class="h-4 w-4 text-coral-500" /> 关键指标变化 <span class="text-[9px] font-normal text-muted">开营 vs 当前</span></div>
        <div class="glass-card overflow-hidden rounded-2xl">
          <div class="flex items-center gap-2 border-b border-black/[0.05] bg-mist px-3.5 py-2 text-[8.5px] font-bold text-muted">
            <span class="flex-1">指标</span><span class="w-14 text-right">开营</span><span class="w-14 text-right">当前</span><span class="w-16 text-right">变化</span>
          </div>
          <div v-for="m in metrics" :key="m.key" class="flex items-center gap-2 border-b border-black/[0.035] px-3.5 py-2.5 last:border-0">
            <span class="flex-1 text-[10.5px] font-semibold text-ink">{{ m.name }}<span class="ml-0.5 text-[8px] text-muted">{{ m.unit }}</span></span>
            <span class="w-14 text-right text-[10px] text-muted tabular">{{ m.before ?? '—' }}</span>
            <span class="w-14 text-right text-[11px] font-bold text-ink tabular">{{ m.now ?? '—' }}</span>
            <span class="w-16 text-right text-[10px] font-bold tabular" :class="m.good ? 'text-brand-600' : m.change ? 'text-coral-500' : 'text-muted'">
              {{ m.change !== null ? (m.change > 0 ? '+' : '') + m.change : '—' }}
            </span>
          </div>
        </div>
        <div class="mt-2 rounded-2xl bg-white/70 p-3">
          <div class="flex items-center justify-between text-[9.5px] text-muted"><span>收缩压趋势（家庭晨测）</span><span>近 {{ bpSeries.length }} 次</span></div>
          <Sparkline :points="bpSeries" :width="310" :height="54" color="#D9553E" class="mt-1 w-full" />
        </div>
      </div>

      <!-- 依从性 -->
      <div class="mt-3 px-4">
        <div class="section-title mb-2"><Activity class="h-4 w-4 text-brand-600" /> 运动与饮食依从</div>
        <div class="grid grid-cols-2 gap-2">
          <div class="soft-card rounded-2xl p-3">
            <div class="flex items-center gap-1 text-[10px] font-bold text-ink"><Dumbbell class="h-3.5 w-3.5 text-coral-500" /> 运动</div>
            <div class="mt-1 text-[20px] font-extrabold text-ink tabular">{{ totalMin }}<span class="text-[9px] text-muted">分钟</span></div>
            <div class="mt-0.5 text-[8.5px] text-muted">共 {{ ex.length }} 次 · 待批注 {{ ex.length - exerciseComments }} 次</div>
            <ProgressBar class="mt-1.5" :value="sum.adherence.ex" :max="100" tone="coral" :height="4" />
          </div>
          <div class="soft-card rounded-2xl p-3">
            <div class="flex items-center gap-1 text-[10px] font-bold text-ink"><UtensilsCrossed class="h-3.5 w-3.5 text-[#2C7DA0]" /> 饮食</div>
            <div class="mt-1 text-[20px] font-extrabold text-ink tabular">{{ diet.length }}<span class="text-[9px] text-muted">餐</span></div>
            <div class="mt-0.5 text-[8.5px] text-muted">已批注 {{ dietComments }} 餐 · 低盐依从 {{ sum.adherence.diet }}%</div>
            <ProgressBar class="mt-1.5" :value="sum.adherence.diet" :max="100" tone="brand" :height="4" />
          </div>
        </div>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <div class="rounded-xl bg-white/70 p-2.5 text-center"><div class="text-[17px] font-extrabold text-brand-700 tabular">{{ store.streak(sid) }}</div><div class="text-[8px] text-muted">连续天数</div></div>
          <div class="rounded-xl bg-white/70 p-2.5 text-center"><div class="text-[17px] font-extrabold text-ink tabular">{{ sum.adherence.med }}%</div><div class="text-[8px] text-muted">用药依从</div></div>
          <div class="rounded-xl bg-white/70 p-2.5 text-center"><div class="text-[17px] font-extrabold text-coral-500 tabular">{{ sum.flowers }}</div><div class="text-[8px] text-muted">获得小红花</div></div>
        </div>
      </div>

      <!-- 成就 -->
      <div class="mt-3 px-4">
        <div class="section-title mb-2"><Award class="h-4 w-4 text-amber-500" /> 阶段成就</div>
        <div class="grid grid-cols-3 gap-2">
          <div v-for="a in achievements" :key="a.name" class="rounded-2xl border p-2.5 text-center" :class="a.got ? 'border-amber-200/60 bg-amber-50/60' : 'border-black/[0.04] bg-white/50 opacity-55'">
            <div class="text-[17px] font-extrabold text-amber-700">{{ a.icon }}</div>
            <div class="mt-1 text-[9px] font-bold text-ink">{{ a.name }}</div>
          </div>
        </div>
      </div>

      <!-- 导出 -->
      <div class="mt-4 flex gap-2 px-4">
        <button class="tap flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-[11px] font-bold text-white" @click="exportPdf"><Download class="h-4 w-4" /> 导出 PDF</button>
        <button class="tap flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-600/20 bg-white py-3 text-[11px] font-bold text-brand-700" @click="exportImage"><Image class="h-4 w-4" /> 生成微信长图</button>
      </div>

      <div class="mt-4 px-4 pb-8">
        <div class="flex items-start gap-1.5 rounded-xl bg-white/60 px-3 py-2 text-[8.5px] leading-relaxed text-muted/70">
          <ShieldCheck class="mt-0.5 h-3 w-3 shrink-0" />
          本报告基于营期打卡与三次入企筛查数据自动生成，仅用于健康管理沟通，不构成诊断证明。第 6 个月与结营复筛后报告将自动更新。
        </div>
      </div>
    </div>
  </div>
</template>
