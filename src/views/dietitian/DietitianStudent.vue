<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import {
  AlertTriangle, Check, ChevronRight, Droplets, Leaf, MessageCircle, Salad, Sparkles,
  Target, UtensilsCrossed, Wheat,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, GenderAvatar, Input, NavBar, RiskBadge, Sheet, Sparkline } from '../../components/ui';
import { fmtMD } from '../../lib/date';
import type { DietRecord } from '../../types';

const store = useAppStore();
const s = computed(() => store.activeStudent!);
const tab = ref<'overview' | 'records' | 'rx' | 'assessment'>('overview');
const sum = computed(() => store.summary(s.value.id));
const rx = computed(() => store.data.nutritionRxs.find((r) => r.studentId === s.value.id));
const records = computed(() => [...store.dietOf(s.value.id)].reverse());
const pending = computed(() => records.value.filter((r) => !r.comments?.length).length);
const todayMeals = computed(() => store.dietOf(s.value.id).filter((r) => r.date.startsWith('2026-12-18')).length);
const saltLowDays = computed(() => new Set(records.value.filter((r) => r.salt === 'low').map((r) => r.date.slice(0, 10))).size);

const show = ref(false);
const target = ref<DietRecord | null>(null);
const text = ref('');
const score = ref<0 | 1 | 2>(1);
function openComment(r: DietRecord) { target.value = r; text.value = ''; score.value = 1; show.value = true; }
function save() {
  if (!target.value) return;
  if (!text.value.trim()) { showToast('请输入批注内容'); return; }
  store.addComment('diet', target.value.id, text.value, score.value);
  show.value = false;
  showToast({ message: '饮食批注已发送', position: 'bottom' });
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="学员饮食档案" :on-back="store.back">
      <template #right><button class="text-[10px] font-bold text-brand-700" @click="store.setView('n-messages')">消息</button></template>
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
            <div><div class="text-[8px] text-muted">今日餐次</div><div class="text-[13px] font-extrabold text-ink tabular">{{ todayMeals }}/3</div></div>
            <div><div class="text-[8px] text-muted">饮食依从</div><div class="text-[13px] font-extrabold tabular" :class="sum.adherence.diet >= 70 ? 'text-brand-700' : 'text-coral-500'">{{ sum.adherence.diet }}%</div></div>
            <div><div class="text-[8px] text-muted">低盐天数</div><div class="text-[13px] font-extrabold text-ink tabular">{{ saltLowDays }}</div></div>
            <div><div class="text-[8px] text-muted">BMI</div><div class="text-[13px] font-extrabold text-ink tabular">{{ s.bmi }}</div></div>
          </div>
        </div>
      </div>
      <div class="mt-3 px-4">
        <div class="seg-tabs">
          <button v-for="t in [{ k: 'overview', l: '概览' }, { k: 'records', l: '饮食记录' }, { k: 'rx', l: '处方' }, { k: 'assessment', l: '评估' }]" :key="t.k" class="seg-tab" :class="tab === t.k ? 'active' : ''" @click="tab = t.k as any">{{ t.l }}</button>
        </div>
      </div>

      <div v-if="tab === 'overview'" class="mt-3 space-y-3 px-4">
        <div class="grid grid-cols-2 gap-2">
          <div class="soft-card rounded-2xl p-3"><div class="text-[9px] text-muted">低盐餐占比</div><div class="mt-0.5 text-[22px] font-extrabold text-ink tabular">{{ Math.round((records.filter((r) => r.salt === 'low').length / Math.max(1, records.length)) * 100) }}%</div><div class="mt-1 text-[8.5px] text-muted">共 {{ records.length }} 餐</div></div>
          <div class="soft-card rounded-2xl p-3"><div class="text-[9px] text-muted">已批注</div><div class="mt-0.5 text-[22px] font-extrabold text-[#2C7DA0] tabular">{{ records.length - pending }}</div><div class="mt-1 text-[8.5px] text-muted">待批注 {{ pending }} 餐</div></div>
        </div>
        <div class="glass-card rounded-2xl p-3.5">
          <div class="text-[11.5px] font-extrabold text-ink">最近饮食</div>
          <div v-for="r in records.slice(0, 3)" :key="r.id" class="mt-2 border-t border-black/[0.04] pt-2 first:border-0 first:pt-0">
            <div class="flex items-center gap-2 text-[9px]"><span class="font-bold text-ink">{{ r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '午餐' : '晚餐' }}</span><span class="text-muted">{{ fmtMD(r.date) }}</span><span class="ml-auto pill" :class="r.salt === 'high' ? 'pill-coral' : 'pill-green'">{{ r.salt === 'high' ? '偏咸' : '低盐' }}</span></div>
            <div class="mt-0.5 line-clamp-1 text-[9.5px] text-muted">{{ r.desc }}</div>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-3">
          <div class="flex items-center gap-1 text-[10px] font-extrabold text-ink"><AlertTriangle class="h-3.5 w-3.5 text-amber-500" /> 用药与饮食</div>
          <div v-for="it in rx?.interactions" :key="it" class="mt-1 text-[9px] leading-relaxed text-amber-700/80">· {{ it }}</div>
        </div>
      </div>

      <div v-else-if="tab === 'records'" class="mt-3 space-y-2 px-4">
        <div v-for="r in records" :key="r.id" class="glass-card rounded-2xl p-3">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF5FA] text-[#2C7DA0]"><Salad class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="text-[10.5px] font-bold text-ink">{{ r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '午餐' : '晚餐' }}</span><span class="text-[8.5px] text-muted">{{ r.date.slice(5, 16) }}</span><span class="pill" :class="r.salt === 'high' ? 'pill-coral' : 'pill-green'">{{ r.salt === 'high' ? '偏咸' : r.salt === 'medium' ? '适中' : '低盐' }}</span></div>
              <div class="mt-0.5 text-[9.5px] text-ink/75">{{ r.desc }}</div>
            </div>
            <button class="rounded-full bg-brand-50 px-2 py-1 text-[8.5px] font-bold text-brand-700" @click="openComment(r)">批注</button>
          </div>
          <div v-for="c in r.comments" :key="c.id" class="mt-2 rounded-xl bg-[#EDF5FA]/70 px-2.5 py-2">
            <div class="flex items-center gap-1 text-[8.5px] font-bold text-[#2C7DA0]">{{ c.name }} 营养师<span class="ml-auto font-normal text-muted">{{ c.date.slice(5, 16) }}</span></div>
            <div class="mt-0.5 text-[9.5px] leading-relaxed text-ink/75">{{ c.text }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'rx'" class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div class="text-[11.5px] font-extrabold text-ink">饮食处方 · {{ rx?.status === 'published' ? '已发布' : '草稿' }}</div>
            <button class="rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700" @click="store.openStudent(s.id, 'n-rx')">编辑</button>
          </div>
          <div class="mt-2 rounded-xl bg-[#EDF5FA]/70 p-2.5">
            <div class="text-[9px] text-[#2C7DA0]">饮食模式</div>
            <div class="mt-0.5 text-[11px] font-bold text-[#22678A]">{{ rx?.pattern }}</div>
          </div>
          <div class="mt-2 grid grid-cols-4 gap-1.5">
            <div class="rounded-lg bg-mist p-2 text-center"><div class="text-[13px] font-extrabold">{{ rx?.targets.energy }}</div><div class="text-[7.5px] text-muted">kcal</div></div>
            <div class="rounded-lg bg-mist p-2 text-center"><div class="text-[13px] font-extrabold">&lt;5</div><div class="text-[7.5px] text-muted">g 盐</div></div>
            <div class="rounded-lg bg-mist p-2 text-center"><div class="text-[13px] font-extrabold">{{ rx?.targets.protein }}%</div><div class="text-[7.5px] text-muted">蛋白</div></div>
            <div class="rounded-lg bg-mist p-2 text-center"><div class="text-[13px] font-extrabold">{{ rx?.targets.fatPct }}%</div><div class="text-[7.5px] text-muted">脂肪</div></div>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-3">
          <div class="text-[10.5px] font-extrabold text-ink">一日食谱</div>
          <div v-for="m in rx?.sampleMenu" :key="m.meal" class="mt-1 text-[9px] leading-relaxed text-ink/70"><b class="text-brand-700">{{ m.meal }}：</b>{{ m.dishes }}</div>
        </div>
        <button class="tap flex w-full items-center justify-center gap-1 rounded-xl bg-brand-600 py-2.5 text-[11px] font-bold text-white" @click="store.openStudent(s.id, 'n-rx')">复评并调整处方</button>
      </div>

      <div v-else class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="text-[11.5px] font-extrabold text-ink">营养评估</div>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] text-muted">BMI</div><div class="text-[13px] font-extrabold text-ink">{{ rx?.assessment.bmi }}</div></div>
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] text-muted">腰围</div><div class="text-[13px] font-extrabold text-ink">{{ rx?.assessment.waist }} cm</div></div>
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] text-muted">eGFR</div><div class="text-[13px] font-extrabold text-ink">{{ rx?.assessment.egfr }} mL/min</div></div>
            <div class="rounded-xl bg-mist p-2.5"><div class="text-[9px] text-muted">每日能量</div><div class="text-[13px] font-extrabold text-ink">{{ rx?.assessment.energy }} kcal</div></div>
          </div>
          <div class="mt-2 rounded-xl bg-[#EDF5FA] px-2.5 py-2 text-[9px] leading-relaxed text-[#2C7DA0]">{{ rx?.assessment.note }}</div>
        </div>
      </div>
    </div>

    <div class="print-hide fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-black/[0.05] bg-white/92 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div class="flex gap-2">
        <button class="tap flex-1 rounded-xl bg-[#2C7DA0] py-2.5 text-[11px] font-bold text-white" @click="store.openStudent(s.id, 'n-rx')"><UtensilsCrossed class="mr-1 inline h-3.5 w-3.5" /> 开饮食处方</button>
        <button class="tap flex-1 rounded-xl border border-brand-600/20 bg-white py-2.5 text-[11px] font-bold text-brand-700" @click="store.setView('n-messages')"><MessageCircle class="mr-1 inline h-3.5 w-3.5" /> 发消息</button>
      </div>
    </div>

    <Sheet v-model:show="show" title="饮食批注" :sub="target ? `${target.meal === 'breakfast' ? '早餐' : target.meal === 'lunch' ? '午餐' : '晚餐'} · ${target.desc}` : ''">
      <div class="space-y-3">
        <div class="rounded-2xl bg-mist p-3 text-[9px] leading-relaxed text-muted">低盐低脂、DASH 结构；关注隐形盐（酱油、腐乳、腌制品）与用药相互作用。</div>
        <div>
          <div class="mb-1.5 text-[10px] font-bold text-muted">餐次评分</div>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="sc in [{ v: 2, l: '结构好' }, { v: 1, l: '尚可' }, { v: 0, l: '需调整' }]" :key="sc.v" class="rounded-xl border py-2 text-[10px] font-bold" :class="score === sc.v ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.07] text-muted'" @click="score = sc.v as any">{{ sc.l }}</button>
          </div>
        </div>
        <Input v-model:value="text" type="textarea" rows="4" autosize placeholder="如：这餐盐分偏高，腌制品和酱油减量；主食可换成杂粮。" />
        <Button class="w-full" size="lg" @click="save">发送批注</Button>
      </div>
    </Sheet>
  </div>
</template>
