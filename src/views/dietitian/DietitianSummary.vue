<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import { Award, BarChart3, Building2, Download, HeartPulse, TrendingDown, Users } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { NavBar, ProgressBar, RiskBadge, SectionHead } from '../../components/ui';
import { DEMO_TODAY } from '../../lib/date';

const store = useAppStore();
const tab = ref<'camp' | 'org'>('camp');
const students = computed(() => store.myStudents);
const rows = computed(() => students.value.map((s) => ({ s, sum: store.summary(s.id) })));
const avg = (arr: number[]) => arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
const stats = computed(() => {
  const r = rows.value;
  return {
    total: r.length,
    high: r.filter((x) => x.s.risk === 'high' || x.s.risk === 'very_high').length,
    avgSbpDrop: avg(r.map((x) => Math.max(0, x.sum.sbpDrop || 0))),
    avgWeightDrop: avg(r.map((x) => Math.max(0, x.sum.weightDrop || 0))),
    avgEx: Math.round(avg(r.map((x) => x.sum.adherence.ex))),
    avgDiet: Math.round(avg(r.map((x) => x.sum.adherence.diet))),
    avgMed: Math.round(avg(r.map((x) => x.sum.adherence.med))),
    flowers: r.reduce((n, x) => n + x.sum.flowers, 0),
  };
});
const metricRows = computed(() => {
  const pairs = [
    { name: '收缩压', unit: 'mmHg', key: 'sbp', cur: (x: any) => x.sum.bp?.sbp },
    { name: '舒张压', unit: 'mmHg', key: 'dbp', cur: (x: any) => x.sum.bp?.dbp },
    { name: '体重', unit: 'kg', key: 'weight', cur: (x: any) => x.sum.weight },
    { name: 'BMI', unit: 'kg/m²', key: 'bmi', cur: (x: any) => x.sum.weight ? +(x.sum.weight / ((x.s.height / 100) ** 2)).toFixed(1) : null },
    { name: '腰围', unit: 'cm', key: 'waist', cur: (x: any) => store.latestWeight(x.s.id)?.waist ?? null },
  ];
  return pairs.map((p) => {
    const befores = rows.value.map((x) => store.snapshotOf(x.s.id, 'baseline')?.values[p.key]).filter((v): v is number => typeof v === 'number');
    const nows = rows.value.map((x) => p.cur(x)).filter((v): v is number => typeof v === 'number');
    return { ...p, before: avg(befores), now: avg(nows), change: nows.length && befores.length ? +(avg(nows) - avg(befores)).toFixed(1) : null, n: nows.length };
  });
});
const weekBars = [
  { l: 'W1', v: 72 }, { l: 'W2', v: 81 }, { l: 'W3', v: 88 },
];
const highlights = computed(() => [
  `纳入管理 ${stats.value.total} 人，高危/很高危占比 ${Math.round((stats.value.high / Math.max(1, stats.value.total)) * 100)}%。`,
  `开营 18 天，收缩压平均下降 ${stats.value.avgSbpDrop} mmHg，体重平均下降 ${stats.value.avgWeightDrop} kg。`,
  `运动依从 ${stats.value.avgEx}%、饮食依从 ${stats.value.avgDiet}%、用药依从 ${stats.value.avgMed}%。`,
  `累计发放小红花 ${stats.value.flowers} 朵，兑换与活动参与形成正向循环。`,
]);
function exportReport() {
  showToast({ message: '机构汇报版 PDF 生成中…（演示）', position: 'bottom' });
  setTimeout(() => window.print(), 400);
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="结营统计" :on-back="store.back">
      <template #right><button class="text-[10px] font-bold text-brand-700" @click="exportReport">导出</button></template>
    </NavBar>
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="hero-card hero-dietitian rounded-[24px] p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[9.5px] font-bold tracking-[0.16em] text-white/55">CAMP ANALYTICS</div>
              <div class="mt-1 text-[18px] font-extrabold">阶段统计 · 第 18 天</div>
              <div class="mt-1 text-[10px] text-white/70">结营前先看趋势，三期将补齐年度对比与机构汇报。</div>
            </div>
            <Award class="h-7 w-7 text-white/45" />
          </div>
          <div class="mt-3 grid grid-cols-4 gap-2">
            <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">在管</div><div class="text-[16px] font-extrabold">{{ stats.total }}</div></div>
            <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">高危</div><div class="text-[16px] font-extrabold">{{ stats.high }}</div></div>
            <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">↓SBP</div><div class="text-[16px] font-extrabold">{{ stats.avgSbpDrop }}</div></div>
            <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">↓体重</div><div class="text-[16px] font-extrabold">{{ stats.avgWeightDrop }}</div></div>
          </div>
        </div>
        <div class="seg-tabs mt-3">
          <button class="seg-tab" :class="tab === 'camp' ? 'active' : ''" @click="tab = 'camp'">营期统计</button>
          <button class="seg-tab" :class="tab === 'org' ? 'active' : ''" @click="tab = 'org'">机构汇报版</button>
        </div>
      </div>

      <div v-if="tab === 'camp'" class="mt-3 space-y-3 px-4 pb-8">
        <div class="grid grid-cols-3 gap-2">
          <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">运动依从</div><div class="text-[18px] font-extrabold text-brand-700 tabular">{{ stats.avgEx }}%</div></div>
          <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">饮食依从</div><div class="text-[18px] font-extrabold text-[#2C7DA0] tabular">{{ stats.avgDiet }}%</div></div>
          <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">用药依从</div><div class="text-[18px] font-extrabold text-ink tabular">{{ stats.avgMed }}%</div></div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="指标聚合" sub="开营 vs 当前 · 均值" />
          <div class="mt-2 overflow-hidden rounded-xl border border-black/[0.04]">
            <div class="flex items-center gap-2 bg-mist px-2.5 py-2 text-[8px] font-bold text-muted"><span class="flex-1">指标</span><span class="w-12 text-right">开营</span><span class="w-12 text-right">当前</span><span class="w-12 text-right">变化</span></div>
            <div v-for="m in metricRows" :key="m.key" class="flex items-center gap-2 border-t border-black/[0.035] px-2.5 py-2">
              <span class="flex-1 text-[9.5px] font-semibold text-ink">{{ m.name }}<span class="ml-0.5 text-[7.5px] text-muted">{{ m.unit }}</span></span>
              <span class="w-12 text-right text-[9px] text-muted tabular">{{ m.before }}</span>
              <span class="w-12 text-right text-[9.5px] font-bold text-ink tabular">{{ m.now }}</span>
              <span class="w-12 text-right text-[9px] font-bold tabular" :class="(m.change || 0) < 0 ? 'text-brand-600' : 'text-coral-500'">{{ m.change !== null ? (m.change > 0 ? '+' : '') + m.change : '—' }}</span>
            </div>
          </div>
          <div class="mt-1 text-[8px] text-muted">LDL-C、HbA1c 等实验室指标以第 6 个月复筛为准</div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="每周打卡率" sub="强化期 3 周" />
          <div class="mt-2 flex items-end gap-3 px-2">
            <div v-for="w in weekBars" :key="w.l" class="flex flex-1 flex-col items-center gap-1">
              <div class="text-[9px] font-bold text-brand-700">{{ w.v }}%</div>
              <div class="w-full rounded-t-lg bg-[linear-gradient(180deg,#4B99C8,#1F6A95)]" :style="{ height: (w.v * 0.9) + 'px' }" />
              <div class="text-[8px] text-muted">{{ w.l }}</div>
            </div>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="学员明细" :sub="`${rows.length} 人`" />
          <div v-for="x in rows" :key="x.s.id" class="mt-2 flex items-center gap-2 border-t border-black/[0.04] pt-2 first:border-0 first:pt-0">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-[9px] font-extrabold text-brand-700">{{ x.s.name.slice(0, 1) }}</span>
            <div class="min-w-0 flex-1"><div class="flex items-center gap-1"><span class="text-[10px] font-bold text-ink">{{ x.s.name }}</span><RiskBadge :risk="x.s.risk" /></div><div class="text-[8px] text-muted">血压 {{ x.sum.bp?.sbp }}/{{ x.sum.bp?.dbp }} · 体重 {{ x.sum.weight }}kg</div></div>
            <span class="text-[9px] font-bold text-brand-700">{{ x.sum.adherence.ex }}%</span>
          </div>
        </div>
      </div>

      <div v-else class="mt-3 space-y-3 px-4 pb-8">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center gap-2"><Building2 class="h-4 w-4 text-[#2C7DA0]" /><div class="text-[12px] font-extrabold text-ink">北京大学国际医院 · 机构汇报版</div></div>
          <div class="mt-1 text-[9px] text-muted">匿名聚合数据，无个人健康明细，可直接交付企业/机构</div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <div class="rounded-xl bg-mist p-3"><div class="text-[9px] text-muted">参与人数</div><div class="text-[22px] font-extrabold text-ink">{{ stats.total }}</div></div>
            <div class="rounded-xl bg-mist p-3"><div class="text-[9px] text-muted">高危占比</div><div class="text-[22px] font-extrabold text-coral-500">{{ Math.round((stats.high / Math.max(1, stats.total)) * 100) }}%</div></div>
            <div class="rounded-xl bg-mist p-3"><div class="text-[9px] text-muted">平均 ↓SBP</div><div class="text-[22px] font-extrabold text-brand-700">{{ stats.avgSbpDrop }}<span class="text-[9px] text-muted">mmHg</span></div></div>
            <div class="rounded-xl bg-mist p-3"><div class="text-[9px] text-muted">平均 ↓体重</div><div class="text-[22px] font-extrabold text-brand-700">{{ stats.avgWeightDrop }}<span class="text-[9px] text-muted">kg</span></div></div>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="本期亮点" sub="自动提炼 · 可直接放入汇报" />
          <div class="mt-2 space-y-1.5">
            <div v-for="(h, i) in highlights" :key="i" class="flex items-start gap-2 rounded-xl bg-brand-50/50 px-2.5 py-2">
              <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[8px] font-bold text-white">{{ i + 1 }}</span>
              <span class="text-[9.5px] leading-relaxed text-ink/80">{{ h }}</span>
            </div>
          </div>
        </div>
        <button class="tap flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-[11px] font-bold text-white" @click="exportReport"><Download class="h-4 w-4" /> 导出机构汇报 PDF</button>
        <div class="text-center text-[8.5px] text-muted/60">结营（2027-11）后将自动生成年度报告与人群健康趋势</div>
      </div>
    </div>
  </div>
</template>
