<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import {
  Activity, AlertTriangle, CalendarClock, ChevronRight, Dumbbell, HeartPulse, MessageCircle,
  Plus, ShieldAlert, Target, TrendingUp,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, GenderAvatar, Input, NavBar, RiskBadge, Sheet, Sparkline } from '../../components/ui';
import { fmtMD } from '../../lib/date';
import type { ExerciseRecord } from '../../types';

const store = useAppStore();
const s = computed(() => store.activeStudent!);
const tab = ref<'overview' | 'records' | 'rx' | 'assessment'>('overview');
const sum = computed(() => store.summary(s.value.id));
const rx = computed(() => store.data.exerciseRxs.find((r) => r.studentId === s.value.id));
const records = computed(() => [...store.exerciseOf(s.value.id)].reverse());
const pending = computed(() => records.value.filter((r) => !r.comments?.length).length);
const hrSeries = computed(() => records.value.slice(0, 10).map((r) => r.hrAvg).reverse());
const weekDone = computed(() => {
  const from = records.value[0]?.date ? records.value.filter((r) => r.date >= '2026-12-12') : [];
  return new Set(from.map((r) => r.date.slice(0, 10))).size;
});

const show = ref(false);
const target = ref<ExerciseRecord | null>(null);
const text = ref('');
const score = ref<0 | 1 | 2>(1);
function openComment(r: ExerciseRecord) { target.value = r; text.value = ''; score.value = 1; show.value = true; }
function save() {
  if (!target.value) return;
  if (!text.value.trim()) { showToast('请输入批注内容'); return; }
  store.addComment('exercise', target.value.id, text.value, score.value);
  show.value = false;
  showToast({ message: '批注已发送 · 学员可在消息与记录中查看', position: 'bottom' });
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="学员运动档案" :on-back="store.back">
      <template #right><button class="text-[10px] font-bold text-brand-700" @click="store.setView('c-messages')">消息</button></template>
    </NavBar>
    <div class="page-scroll no-tabbar pb-[88px]">
      <div class="px-4 pt-3">
        <div class="glass-card rounded-[22px] p-3.5">
          <div class="flex items-center gap-3">
            <div class="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white"><GenderAvatar :gender="s.gender" /></div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="text-[16px] font-extrabold text-ink">{{ s.name }}</span><RiskBadge :risk="s.risk" /><span class="text-[9px] text-muted">{{ s.age }} 岁</span></div>
              <div class="mt-0.5 text-[9px] text-muted">{{ s.riskTags.join(' / ') }}</div>
            </div>
            <span v-if="pending" class="pill pill-coral">{{ pending }} 待批注</span>
          </div>
          <div class="mt-2 grid grid-cols-4 gap-1.5 border-t border-black/[0.05] pt-2">
            <div><div class="text-[8px] text-muted">本周运动</div><div class="text-[13px] font-extrabold text-ink tabular">{{ weekDone }}<span class="text-[8px] font-normal text-muted">天</span></div></div>
            <div><div class="text-[8px] text-muted">运动依从</div><div class="text-[13px] font-extrabold tabular" :class="sum.adherence.ex >= 70 ? 'text-brand-700' : 'text-coral-500'">{{ sum.adherence.ex }}%</div></div>
            <div><div class="text-[8px] text-muted">6 分钟步行</div><div class="text-[13px] font-extrabold text-ink tabular">{{ rx?.assessment.sixMinWalk }}<span class="text-[8px] font-normal text-muted">m</span></div></div>
            <div><div class="text-[8px] text-muted">静息血压</div><div class="text-[11px] font-extrabold text-ink tabular">{{ sum.bp?.sbp }}/{{ sum.bp?.dbp }}</div></div>
          </div>
        </div>
      </div>
      <div class="mt-3 px-4">
        <div class="seg-tabs">
          <button v-for="t in [{ k: 'overview', l: '概览' }, { k: 'records', l: '运动记录' }, { k: 'rx', l: '处方' }, { k: 'assessment', l: '评估' }]" :key="t.k" class="seg-tab" :class="tab === t.k ? 'active' : ''" @click="tab = t.k as any">{{ t.l }}</button>
        </div>
      </div>

      <div v-if="tab === 'overview'" class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-start justify-between">
            <div><div class="text-[9px] text-muted">运动心率趋势</div><div class="mt-0.5 text-[22px] font-extrabold text-ink tabular">{{ records[0]?.hrAvg }}<span class="text-[9px] text-muted">次/分</span></div></div>
            <Sparkline :points="hrSeries" :width="130" :height="34" color="#D9553E" />
          </div>
          <div class="mt-2 flex items-center gap-1.5 rounded-xl bg-[#fbf6e9] px-2.5 py-1.5 text-[9px] text-[#8a641f]"><AlertTriangle class="h-3 w-3" /> {{ rx?.assessment.risk }}</div>
        </div>
        <div class="glass-card rounded-2xl p-3">
          <div class="flex items-center gap-1 text-[11px] font-extrabold text-ink"><Target class="h-4 w-4 text-coral-500" /> 处方目标</div>
          <div class="mt-1 text-[10px] leading-relaxed text-ink/75">{{ rx?.goal }}</div>
        </div>
        <div class="glass-card rounded-2xl p-3">
          <div class="text-[11px] font-extrabold text-ink">最近批注</div>
          <div v-for="r in records.filter((x) => x.comments?.length).slice(0, 3)" :key="r.id" class="mt-2 border-t border-black/[0.04] pt-2">
            <div class="text-[8.5px] text-muted">{{ fmtMD(r.date) }} · {{ r.type }}</div>
            <div class="mt-0.5 text-[9.5px] leading-relaxed text-ink/75">{{ r.comments![0].text }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'records'" class="mt-3 space-y-2 px-4">
        <div v-for="r in records" :key="r.id" class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50 text-coral-500"><Dumbbell class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="text-[11px] font-extrabold text-ink">{{ r.type }}</span><span class="text-[8.5px] text-muted">{{ r.date.slice(5, 16) }}</span></div>
              <div class="mt-0.5 flex flex-wrap gap-x-2 text-[8.5px] text-muted"><span>{{ r.duration }} 分钟</span><span>HR {{ r.hrAvg }}</span><span>强度 {{ r.intensity }}/5</span><span>疲劳 {{ r.fatigue }}/3</span></div>
            </div>
            <button class="rounded-full bg-brand-50 px-2 py-1 text-[8.5px] font-bold text-brand-700" @click="openComment(r)">批注</button>
          </div>
          <div v-if="r.symptoms?.length" class="mt-1.5 flex gap-1"><span v-for="sy in r.symptoms" :key="sy" class="pill pill-coral">{{ sy }}</span></div>
          <div v-for="c in r.comments" :key="c.id" class="mt-2 rounded-xl bg-brand-50/60 px-2.5 py-2">
            <div class="flex items-center gap-1 text-[8.5px] font-bold text-brand-700">{{ c.name }} 运动师 <span class="ml-auto font-normal text-muted">{{ c.date.slice(5, 16) }}</span></div>
            <div class="mt-0.5 text-[9.5px] leading-relaxed text-ink/75">{{ c.text }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'rx'" class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div class="text-[11.5px] font-extrabold text-ink">运动处方 · {{ rx?.status === 'published' ? '已发布' : '草稿' }}</div>
            <button class="rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700" @click="store.openStudent(s.id, 'c-rx')">编辑</button>
          </div>
          <div class="mt-2 rounded-xl bg-brand-50/60 p-2.5">
            <div class="text-[9px] text-brand-600">有氧运动</div>
            <div class="mt-0.5 text-[11px] font-bold text-brand-800">{{ rx?.aerobic.mode }} · 每周 {{ rx?.aerobic.freq }} 次 · {{ rx?.aerobic.minutes }} 分钟</div>
            <div class="mt-0.5 text-[9px] text-brand-700">目标心率 {{ rx?.aerobic.hrLow }}–{{ rx?.aerobic.hrHigh }} · RPE {{ rx?.aerobic.rpe }}</div>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] font-bold text-ink">抗阻</div><div class="mt-0.5 text-[9px] text-muted">每周 {{ rx?.resistance.freq }} 次 · {{ rx?.resistance.sets }} 组 × {{ rx?.resistance.reps }}</div></div>
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] font-bold text-ink">柔韧</div><div class="mt-0.5 text-[9px] text-muted">{{ rx?.flexibility }}</div></div>
          </div>
        </div>
        <div class="rounded-2xl border border-coral-200/50 bg-coral-50/60 p-3">
          <div class="flex items-center gap-1 text-[10px] font-extrabold text-coral-700"><ShieldAlert class="h-3.5 w-3.5" /> 禁忌与暂停</div>
          <div v-for="p in rx?.precautions" :key="p" class="mt-0.5 text-[9px] leading-relaxed text-coral-700/80">· {{ p }}</div>
        </div>
        <button class="tap flex w-full items-center justify-center gap-1 rounded-xl bg-brand-600 py-2.5 text-[11px] font-bold text-white" @click="store.openStudent(s.id, 'c-rx')"><Plus class="h-3.5 w-3.5" /> 复评并调整处方</button>
      </div>

      <div v-else class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="text-[11.5px] font-extrabold text-ink">运动评估结果</div>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] text-muted">6 分钟步行</div><div class="text-[13px] font-extrabold text-ink">{{ rx?.assessment.sixMinWalk }} m</div></div>
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] text-muted">最大心率</div><div class="text-[13px] font-extrabold text-ink">{{ rx?.assessment.hrmax }} 次/分</div></div>
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] text-muted">静息血压</div><div class="text-[13px] font-extrabold text-ink">{{ rx?.assessment.bpRest }}</div></div>
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] text-muted">心电图</div><div class="text-[9px] font-semibold leading-snug text-ink">{{ rx?.assessment.ecg }}</div></div>
          </div>
          <div class="mt-2 rounded-xl bg-[#fbf6e9] px-2.5 py-2 text-[9px] leading-relaxed text-[#8a641f]"><b>风险结论：</b>{{ rx?.assessment.risk }}</div>
        </div>
      </div>
    </div>

    <div class="print-hide fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-black/[0.05] bg-white/92 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div class="flex gap-2">
        <button class="tap flex-1 rounded-xl bg-coral-500 py-2.5 text-[11px] font-bold text-white" @click="store.openStudent(s.id, 'c-rx')"><Dumbbell class="mr-1 inline h-3.5 w-3.5" /> 开运动处方</button>
        <button class="tap flex-1 rounded-xl border border-brand-600/20 bg-white py-2.5 text-[11px] font-bold text-brand-700" @click="store.setView('c-messages')"><MessageCircle class="mr-1 inline h-3.5 w-3.5" /> 发消息</button>
      </div>
    </div>

    <Sheet v-model:show="show" title="运动批注" :sub="target ? `${target.type} · ${target.duration} 分钟 · 心率 ${target.hrAvg}` : ''">
      <div class="space-y-3">
        <div class="rounded-2xl bg-mist p-3 text-[9.5px] leading-relaxed text-muted">
          目标心率 {{ rx?.aerobic.hrLow }}–{{ rx?.aerobic.hrHigh }}；学员本次强度 {{ target?.intensity }}/5、疲劳 {{ target?.fatigue }}/3。
        </div>
        <div>
          <div class="mb-1.5 text-[10px] font-bold text-muted">达标评分</div>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="sc in [{ v: 2, l: '到位' }, { v: 1, l: '尚可' }, { v: 0, l: '需调整' }]" :key="sc.v" class="rounded-xl border py-2 text-[10px] font-bold" :class="score === sc.v ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.07] text-muted'" @click="score = sc.v as any">{{ sc.l }}</button>
          </div>
        </div>
        <Input v-model:value="text" type="textarea" rows="4" autosize placeholder="如：心率控制良好，下次可延长 5 分钟；注意运动前测血压。" />
        <Button class="w-full" size="lg" @click="save">发送批注</Button>
      </div>
    </Sheet>
  </div>
</template>
