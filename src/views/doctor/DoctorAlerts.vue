<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import { AlertTriangle, Check, ChevronRight, HeartPulse, Siren, Stethoscope, Timer } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, NavBar, RiskBadge, Sheet } from '../../components/ui';
import type { AlertItem } from '../../types';

const store = useAppStore();
const filter = ref<'open' | 'all'>('open');
const list = computed(() => store.data.alerts.filter((a) => filter.value === 'all' || a.status === 'open'));
const openCount = computed(() => store.data.alerts.filter((a) => a.status === 'open').length);
const detail = ref<AlertItem | null>(null);
const show = ref(false);
function open(a: AlertItem) { detail.value = a; show.value = true; }
function handle() {
  if (!detail.value) return;
  store.handleAlert(detail.value.id);
  show.value = false;
  showToast({ message: '已标记处理，建议同步发起随访', position: 'bottom' });
}
function toFollowup() {
  if (detail.value) store.selectedStudentId = detail.value.studentId;
  show.value = false;
  store.setView('d-followup');
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="预警中心" :on-back="store.back">
      <template #right><span class="pill pill-coral">{{ openCount }} 待处理</span></template>
    </NavBar>
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="seg-tabs">
          <button class="seg-tab" :class="filter === 'open' ? 'active' : ''" @click="filter = 'open'">待处理</button>
          <button class="seg-tab" :class="filter === 'all' ? 'active' : ''" @click="filter = 'all'">全部</button>
        </div>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <div class="rounded-xl border border-coral-200/50 bg-coral-50/70 p-2.5"><div class="text-[9px] text-coral-600">危急值</div><div class="text-[18px] font-extrabold text-coral-600 tabular">{{ store.data.alerts.filter((a) => a.level === 'high' && a.status === 'open').length }}</div></div>
          <div class="rounded-xl border border-amber-200/50 bg-amber-50/60 p-2.5"><div class="text-[9px] text-amber-700">需关注</div><div class="text-[18px] font-extrabold text-amber-700 tabular">{{ store.data.alerts.filter((a) => a.level === 'medium' && a.status === 'open').length }}</div></div>
          <div class="rounded-xl border border-black/[0.05] bg-white/70 p-2.5"><div class="text-[9px] text-muted">今日已处理</div><div class="text-[18px] font-extrabold text-ink tabular">{{ store.data.alerts.filter((a) => a.status === 'handled').length }}</div></div>
        </div>
      </div>

      <div class="mt-3 space-y-2 px-4 pb-8">
        <button v-for="a in list" :key="a.id" class="tap w-full rounded-2xl border p-3 text-left" :class="a.status === 'handled' ? 'border-black/[0.04] bg-white/60 opacity-70' : a.level === 'high' ? 'border-coral-200/60 bg-coral-50/70' : 'border-amber-200/50 bg-amber-50/50'" @click="open(a)">
          <div class="flex items-start gap-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" :class="a.level === 'high' ? 'bg-coral-500 text-white' : 'bg-amber-500 text-white'"><AlertTriangle class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="text-[11.5px] font-extrabold text-ink">{{ a.studentName }}</span><span class="pill" :class="a.level === 'high' ? 'pill-coral' : 'pill-amber'">{{ a.type }}</span><span v-if="a.status === 'handled'" class="pill pill-green ml-auto">已处理</span></div>
              <div class="mt-1 text-[13px] font-extrabold text-ink tabular">{{ a.value }}</div>
              <div class="mt-0.5 text-[8.5px] text-muted">{{ a.time.slice(5, 16) }} · {{ a.handler ? '处理人 ' + a.handler : '待处理' }}</div>
            </div>
            <ChevronRight class="mt-1 h-4 w-4 text-muted/30" />
          </div>
        </button>
      </div>
    </div>

    <Sheet v-model:show="show" title="预警详情" :sub="detail ? `${detail.studentName} · ${detail.type}` : ''">
      <div v-if="detail" class="space-y-3">
        <div class="rounded-2xl p-3" :class="detail.level === 'high' ? 'bg-coral-50' : 'bg-amber-50'">
          <div class="text-[10px] font-bold" :class="detail.level === 'high' ? 'text-coral-600' : 'text-amber-700'">触发值</div>
          <div class="mt-1 text-[20px] font-extrabold tabular" :class="detail.level === 'high' ? 'text-coral-600' : 'text-amber-700'">{{ detail.value }}</div>
          <div class="mt-1 text-[9px] text-muted">{{ detail.time }}</div>
        </div>
        <div class="rounded-2xl bg-mist p-3 text-[9.5px] leading-relaxed text-ink/75">
          处理建议：核对最近 3 次家庭自测与用药记录；必要时电话联系患者确认症状；危急值需当日安排门诊或绿色通道，并在随访记录中留痕。
        </div>
        <button class="w-full rounded-xl bg-brand-600 py-2.5 text-[11px] font-bold text-white" @click="toFollowup"><Stethoscope class="mr-1 inline h-3.5 w-3.5" /> 发起随访</button>
        <button v-if="detail.status === 'open'" class="w-full rounded-xl border border-brand-600/20 py-2.5 text-[11px] font-bold text-brand-700" @click="handle"><Check class="mr-1 inline h-3.5 w-3.5" /> 标记已处理</button>
      </div>
    </Sheet>
  </div>
</template>
