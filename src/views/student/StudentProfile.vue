<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Activity, ArrowLeft, Bell, ChevronRight, FileHeart, FileText, HeartPulse, Home,
  Leaf, Pill, ShieldCheck, Stethoscope, Trophy, TrendingDown, TrendingUp, Minus, Download,
} from 'lucide-vue-next';
import { showToast } from 'vant';
import { useAppStore } from '../../store/app';
import { BottomNav, GenderAvatar, NavBar, RiskBadge, SectionHead, Sparkline } from '../../components/ui';
import { fmtShort } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const ck = ref<'baseline' | 'month6' | 'closing'>('baseline');
const snapshot = computed(() => store.snapshotOf(s.value.id, ck.value));
const base = computed(() => store.snapshotOf(s.value.id, 'baseline'));
const med = computed(() => store.data.medications.find((m) => m.studentId === s.value.id));
const unread = computed(() => store.unreadCount(s.value.id));
const bpSeries = computed(() => store.bpOf(s.value.id).filter((r) => r.period === 'morning').slice(-12).map((r) => r.sbp));
const wtSeries = computed(() => store.weightOf(s.value.id).slice(-12).map((r) => r.weight));

const ckLabel = { baseline: '开营筛查', month6: '第 6 个月', closing: '结营复查' };

const grouped = computed(() => {
  const vals = snapshot.value?.values || {};
  const cats: Record<string, any[]> = {};
  for (const m of store.data.metrics) {
    const v = vals[m.key];
    if (v === undefined) continue;
    let status: 'ok' | 'high' | 'low' | 'none' = 'none';
    if (v !== null && m.refHigh !== undefined && v > m.refHigh) status = 'high';
    else if (v !== null && m.refLow !== undefined && v < m.refLow) status = 'low';
    else if (v !== null) status = 'ok';
    const bv = base.value?.values[m.key];
    const change = bv !== undefined && bv !== null && v !== null ? +(v - bv).toFixed(m.decimals ?? 0) : null;
    (cats[m.category] ||= []).push({ ...m, value: v, status, change });
  }
  return cats;
});

function statusText(st: string) {
  if (st === 'high') return '偏高';
  if (st === 'low') return '偏低';
  if (st === 'ok') return '正常';
  return '—';
}
function statusClass(st: string) {
  if (st === 'high') return 'text-coral-500 bg-coral-50';
  if (st === 'low') return 'text-[#2C7DA0] bg-[#EDF5FA]';
  if (st === 'ok') return 'text-brand-700 bg-brand-50';
  return 'text-muted bg-black/[0.04]';
}
const navItems = [
  { key: 's-home' as const, label: '首页', icon: Home },
  { key: 's-activity' as const, label: '活动', icon: Trophy },
  { key: 's-messages' as const, label: '消息', icon: Bell },
  { key: 's-profile' as const, label: '档案', icon: FileHeart },
];
const reports = [
  { name: '空腹抽血化验单', date: '2026-12-01', type: 'PDF', done: true },
  { name: '12 导联心电图', date: '2026-12-01', type: '图片', done: true },
  { name: '颈动脉超声报告', date: '2026-12-01', type: 'PDF', done: true },
  { name: '疾病确诊病历', date: '2026-12-01', type: '扫描件', done: true },
];
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="健康档案" :on-back="store.back" />
    <div class="page-scroll pb-[112px]">
      <!-- 个人信息 -->
      <div class="px-4 pt-3">
        <div class="glass-card rounded-[24px] p-4">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white">
              <GenderAvatar :gender="s.gender" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-[17px] font-extrabold text-ink">{{ s.name }}</span>
                <RiskBadge :risk="s.risk" />
              </div>
              <div class="mt-0.5 text-[10.5px] text-muted">{{ s.gender === 'male' ? '男' : '女' }} · {{ s.age }} 岁 · {{ s.occupation }}</div>
              <div class="mt-1 flex flex-wrap gap-1">
                <span v-for="t in s.riskTags" :key="t" class="pill pill-slate">{{ t }}</span>
              </div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-4 gap-2 border-t border-black/[0.05] pt-3">
            <div><div class="text-[9px] text-muted">身高</div><div class="mt-0.5 text-[14px] font-extrabold tabular">{{ s.height }}<span class="text-[8px] text-muted">cm</span></div></div>
            <div><div class="text-[9px] text-muted">体重</div><div class="mt-0.5 text-[14px] font-extrabold tabular">{{ store.latestWeight(s.id)?.weight }}<span class="text-[8px] text-muted">kg</span></div></div>
            <div><div class="text-[9px] text-muted">BMI</div><div class="mt-0.5 text-[14px] font-extrabold tabular">{{ ((store.latestWeight(s.id)?.weight || s.weight) / ((s.height / 100) ** 2)).toFixed(1) }}</div></div>
            <div><div class="text-[9px] text-muted">腰围</div><div class="mt-0.5 text-[14px] font-extrabold tabular">{{ s.waist }}<span class="text-[8px] text-muted">cm</span></div></div>
          </div>
        </div>
      </div>

      <!-- 趋势 -->
      <div class="mt-4 px-4">
        <SectionHead title="家庭自测趋势" sub="开营至今 · 近 12 次记录">
          <template #icon><Activity class="h-4 w-4 text-coral-500" /></template>
        </SectionHead>
        <div class="grid grid-cols-2 gap-2">
          <div class="soft-card rounded-2xl p-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-muted">收缩压</span>
              <span class="pill pill-coral">mmHg</span>
            </div>
            <div class="mt-1 text-[23px] font-extrabold tabular text-ink">{{ store.bpAvg(s.id)?.sbp }}<span class="text-[9px] text-muted">/{{ store.bpAvg(s.id)?.dbp }}</span></div>
            <Sparkline :points="bpSeries" :width="130" :height="34" color="#D9553E" class="mt-1" />
          </div>
          <div class="soft-card rounded-2xl p-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-muted">体重</span>
              <span class="pill pill-brand">kg</span>
            </div>
            <div class="mt-1 text-[23px] font-extrabold tabular text-ink">{{ store.latestWeight(s.id)?.weight }}</div>
            <Sparkline :points="wtSeries" :width="130" :height="34" color="#1F6A95" class="mt-1" />
          </div>
        </div>
      </div>

      <!-- 筛查节点 -->
      <div class="mt-4 px-4">
        <SectionHead title="三次入企筛查" sub="开营 / 第 6 个月 / 结营">
          <template #icon><FileHeart class="h-4 w-4 text-brand-600" /></template>
        </SectionHead>
        <div class="seg-tabs">
          <button v-for="(label, key) in ckLabel" :key="key" class="seg-tab" :class="ck === key ? 'active' : ''" @click="ck = key as any">
            {{ label }}
          </button>
        </div>

        <div v-if="!snapshot" class="mt-3 rounded-2xl border border-dashed border-black/[0.1] bg-white/60 px-4 py-8 text-center">
          <div class="text-[12px] font-bold text-ink">该节点数据待采集</div>
          <div class="mt-1 text-[10px] text-muted">{{ ck === 'month6' ? '2027-05-20 入企复筛后自动归档' : '2027-11-25 结营复查后自动归档' }}</div>
        </div>

        <div v-else class="mt-3 space-y-2">
          <div class="flex items-center gap-2 rounded-xl bg-brand-50/70 px-3 py-2 text-[10px] text-brand-800">
            <ShieldCheck class="h-3.5 w-3.5" /> {{ snapshot.note }} · {{ fmtShort(snapshot.date) }}
          </div>
          <div v-for="(rows, cat) in grouped" :key="cat" class="glass-card overflow-hidden rounded-2xl">
            <div class="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2">
              <span class="text-[11.5px] font-extrabold text-ink">{{ cat }}</span>
              <span class="text-[9px] text-muted">{{ rows.length }} 项</span>
            </div>
            <div v-for="m in rows" :key="m.key" class="flex items-center gap-2 border-b border-black/[0.035] px-3.5 py-2.5 last:border-0">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] font-semibold text-ink">{{ m.name }}</span>
                  <span class="text-[8.5px] text-muted/70">{{ m.refText }}</span>
                </div>
                <div class="mt-0.5 flex items-center gap-1 text-[8.5px] text-muted">
                  <span v-if="m.change !== null && m.change !== 0" class="flex items-center gap-0.5" :class="(m.direction === 'higher' ? m.change > 0 : m.change < 0) ? 'text-brand-600' : 'text-coral-500'">
                    <component :is="m.change > 0 ? TrendingUp : TrendingDown" class="h-2.5 w-2.5" />
                    较开营 {{ m.change > 0 ? '+' : '' }}{{ m.change }}
                  </span>
                  <span v-else-if="ck === 'baseline'" class="text-muted/60">开营基线</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[14px] font-extrabold tabular text-ink">{{ m.value }}</span>
                <span class="ml-0.5 text-[8.5px] text-muted">{{ m.unit }}</span>
              </div>
              <span class="pill !px-1.5 !py-0.5 !text-[8.5px]" :class="statusClass(m.status)">{{ statusText(m.status) }}</span>
            </div>
          </div>
          <div v-if="snapshot.plaque" class="rounded-2xl border border-coral-200/40 bg-coral-50/60 px-3.5 py-3">
            <div class="text-[10px] font-bold text-coral-700">颈动脉超声结论</div>
            <div class="mt-0.5 text-[10.5px] leading-relaxed text-coral-700/80">{{ snapshot.plaque }}</div>
          </div>
        </div>
      </div>

      <!-- 用药 -->
      <div class="mt-4 px-4">
        <SectionHead title="长期用药" sub="医师开具 · 不可自行停药">
          <template #icon><Pill class="h-4 w-4 text-[#2C7DA0]" /></template>
          <template #action>
            <button class="text-[10.5px] font-bold text-brand-700" @click="store.setView('s-followup')">用药指导</button>
          </template>
        </SectionHead>
        <div class="glass-card rounded-2xl p-3.5">
          <div v-for="d in med?.drugs" :key="d.name" class="flex items-start gap-2.5 border-b border-black/[0.05] py-2 first:pt-0 last:border-0 last:pb-0">
            <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EDF5FA] text-[#2C7DA0]"><Pill class="h-3.5 w-3.5" /></span>
            <div class="min-w-0 flex-1">
              <div class="text-[11.5px] font-bold text-ink">{{ d.name }} <span class="text-[10px] font-semibold text-muted">{{ d.dose }}</span></div>
              <div class="mt-0.5 text-[9.5px] text-muted">{{ d.freq }}</div>
              <div v-if="d.note" class="mt-0.5 text-[9px] font-semibold text-coral-600">{{ d.note }}</div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2">
            <Activity class="h-3.5 w-3.5 text-brand-700" />
            <span class="text-[10px] text-brand-800">近 7 日用药依从 <b>{{ store.adherence(s.id).med }}%</b></span>
            <span class="ml-auto text-[9px] text-brand-600">更新于 {{ med?.updatedAt.slice(0, 10) }}</span>
          </div>
        </div>
      </div>

      <!-- 材料 -->
      <div class="mt-4 px-4">
        <SectionHead title="入营材料" sub="三甲医院报告 · 仅医师可查看原文">
          <template #icon><FileText class="h-4 w-4 text-brand-600" /></template>
          <template #action>
            <button class="text-[10.5px] font-bold text-brand-700" @click="showToast('演示环境：材料预览暂未开放')">全部材料</button>
          </template>
        </SectionHead>
        <div class="glass-card divide-y divide-black/[0.045] overflow-hidden rounded-2xl">
          <div v-for="r in reports" :key="r.name" class="flex items-center gap-2.5 px-3.5 py-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-[9px] font-extrabold text-brand-700">{{ r.type }}</span>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] font-semibold text-ink">{{ r.name }}</div>
              <div class="text-[9px] text-muted">{{ r.date }} · 已归档</div>
            </div>
            <ChevronRight class="h-3.5 w-3.5 text-muted/40" />
          </div>
        </div>
      </div>

      <!-- 快捷 -->
      <div class="mt-4 grid grid-cols-3 gap-2 px-4">
        <button class="tap soft-card flex flex-col items-center gap-1 rounded-2xl p-2.5" @click="store.setView('s-report')">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><FileHeart class="h-4 w-4" /></span>
          <span class="text-[9.5px] font-extrabold text-ink">营期报告</span>
        </button>
        <button class="tap soft-card flex flex-col items-center gap-1 rounded-2xl p-2.5" @click="store.setView('s-journey')">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Activity class="h-4 w-4" /></span>
          <span class="text-[9.5px] font-extrabold text-ink">个人历程</span>
        </button>
        <button class="tap soft-card flex flex-col items-center gap-1 rounded-2xl p-2.5" @click="store.setView('s-prescription')">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF5FA] text-[#2C7DA0]"><Leaf class="h-4 w-4" /></span>
          <span class="text-[9.5px] font-extrabold text-ink">双处方</span>
        </button>
      </div>

      <div class="mt-5 flex items-center justify-center gap-1 text-[9px] text-muted/50">
        <ShieldCheck class="h-3 w-3" /> 健康数据仅限本项目授权人员按最小必要原则查看
      </div>
    </div>

    <BottomNav anchor="s-profile" :items="navItems" :badge="unread" :badge-index="2" />
  </div>
</template>
