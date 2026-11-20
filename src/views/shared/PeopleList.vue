<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronRight, Filter, Search, Users } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { GenderAvatar, NavBar, RiskBadge } from '../../components/ui';

const props = defineProps<{ mode: 'doctor' | 'coach' | 'dietitian' }>();
const store = useAppStore();
const keyword = ref('');
const risk = ref<'all' | 'high'>('all');
const title = computed(() => props.mode === 'doctor' ? '我的患者' : props.mode === 'coach' ? '我的学员' : '我的学员');
const detailView = computed(() => props.mode === 'doctor' ? 'd-patient' : props.mode === 'coach' ? 'c-student' : 'n-student');
const list = computed(() => store.myStudents.filter((s) =>
  (!keyword.value || s.name.includes(keyword.value)) && (risk.value === 'all' || s.risk === 'high' || s.risk === 'very_high'),
));
const highCount = computed(() => store.myStudents.filter((s) => s.risk === 'high' || s.risk === 'very_high').length);

function metric(sid: string) {
  const s = store.summary(sid);
  return {
    bp: s.bp ? `${s.bp.sbp}/${s.bp.dbp}` : '—',
    weight: s.weight ?? '—',
    adherence: props.mode === 'coach' ? s.adherence.ex : props.mode === 'dietitian' ? s.adherence.diet : s.adherence.med,
    pending: props.mode === 'coach'
      ? store.exerciseOf(sid).filter((r) => !r.comments?.length).length
      : props.mode === 'dietitian'
        ? store.dietOf(sid).filter((r) => !r.comments?.length).length
        : store.data.alerts.filter((a) => a.studentId === sid && a.status === 'open').length,
  };
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar :title="title" :on-back="store.back">
      <template #right><span class="text-[9px] text-muted">共 {{ store.myStudents.length }} 人</span></template>
    </NavBar>
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="grid grid-cols-3 gap-2">
          <div class="soft-card rounded-xl p-2.5"><div class="text-[9px] text-muted">在管</div><div class="text-[18px] font-extrabold text-ink tabular">{{ store.myStudents.length }}</div></div>
          <div class="soft-card rounded-xl p-2.5"><div class="text-[9px] text-muted">高危/很高危</div><div class="text-[18px] font-extrabold text-coral-500 tabular">{{ highCount }}</div></div>
          <div class="soft-card rounded-xl p-2.5"><div class="text-[9px] text-muted">本周打卡率</div><div class="text-[18px] font-extrabold text-brand-700 tabular">{{ Math.round(store.myStudents.reduce((n, s) => n + store.summary(s.id).adherence.ex, 0) / Math.max(1, store.myStudents.length)) }}%</div></div>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-2 px-4">
        <div class="flex flex-1 items-center gap-2 rounded-xl border border-black/[0.05] bg-white/80 px-3 py-2">
          <Search class="h-4 w-4 text-muted/50" />
          <input v-model="keyword" class="flex-1 bg-transparent text-[11px] outline-none" placeholder="搜索姓名" />
        </div>
        <button class="tap flex items-center gap-1 rounded-xl bg-white/80 px-2.5 py-2 text-[9.5px] font-bold" :class="risk === 'high' ? 'text-coral-500' : 'text-muted'" @click="risk = risk === 'all' ? 'high' : 'all'">
          <Filter class="h-3.5 w-3.5" /> 高危
        </button>
      </div>
      <div class="mt-3 space-y-2 px-4">
        <button v-for="s in list" :key="s.id" class="tap w-full rounded-2xl border border-black/[0.045] bg-white/85 p-3 text-left" @click="store.openStudent(s.id, detailView)">
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white"><GenderAvatar :gender="s.gender" /></div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[12.5px] font-extrabold text-ink">{{ s.name }}</span>
                <RiskBadge :risk="s.risk" />
                <span v-if="metric(s.id).pending" class="ml-auto pill pill-coral">{{ metric(s.id).pending }} 待处理</span>
              </div>
              <div class="mt-0.5 flex flex-wrap gap-1">
                <span v-for="t in s.riskTags.slice(0, 3)" :key="t" class="pill pill-slate">{{ t }}</span>
              </div>
            </div>
            <ChevronRight class="h-4 w-4 text-muted/30" />
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2 border-t border-black/[0.04] pt-2">
            <div><div class="text-[8px] text-muted">7 日血压</div><div class="text-[11px] font-bold text-ink tabular">{{ metric(s.id).bp }}</div></div>
            <div><div class="text-[8px] text-muted">体重</div><div class="text-[11px] font-bold text-ink tabular">{{ metric(s.id).weight }}<span class="text-[8px] font-normal text-muted">kg</span></div></div>
            <div><div class="text-[8px] text-muted">{{ mode === 'doctor' ? '用药依从' : mode === 'coach' ? '运动依从' : '饮食依从' }}</div><div class="text-[11px] font-bold tabular" :class="metric(s.id).adherence >= 80 ? 'text-brand-700' : 'text-coral-500'">{{ metric(s.id).adherence }}%</div></div>
          </div>
        </button>
        <div v-if="!list.length" class="py-16 text-center"><Users class="mx-auto h-8 w-8 text-muted/20" /><div class="mt-2 text-[11px] text-muted">没有匹配的学员</div></div>
      </div>
    </div>
  </div>
</template>
