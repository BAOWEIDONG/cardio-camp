<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { showToast } from 'vant';
import { CalendarClock, Check, ClipboardList, HeartPulse, Plus, Stethoscope, UserRound } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, RiskBadge, SectionHead } from '../../components/ui';
import { DEMO_TODAY, addDays, fmtShort } from '../../lib/date';

const store = useAppStore();
const sid = ref(store.activeStudentId);
const s = computed(() => store.studentById(sid.value)!);
const bp = computed(() => store.bpAvg(sid.value));
const fus = computed(() => store.followupsOf(sid.value));
const form = ref({
  type: '线上随访' as '入企面诊' | '线上随访' | '电话随访' | '绿色通道',
  risk: 'high' as 'low' | 'medium' | 'high' | 'very_high',
  sbp: bp.value?.sbp || 130,
  dbp: bp.value?.dbp || 80,
  hr: bp.value?.hr || 72,
  symptoms: '',
  conclusion: '',
  plan: '',
  nextDate: addDays(DEMO_TODAY, 14),
});
watch(sid, () => {
  const b = store.bpAvg(sid.value);
  form.value.sbp = b?.sbp || 130; form.value.dbp = b?.dbp || 80; form.value.hr = b?.hr || 72;
  form.value.risk = s.value.risk;
});
function submit() {
  if (!form.value.conclusion.trim() || !form.value.plan.trim()) { showToast('请填写随访结论与干预方案'); return; }
  store.addFollowup({
    studentId: sid.value, date: `${DEMO_TODAY} 09:30`, type: form.value.type,
    risk: form.value.risk, sbp: Number(form.value.sbp), dbp: Number(form.value.dbp), hr: Number(form.value.hr),
    symptoms: form.value.symptoms, conclusion: form.value.conclusion, plan: form.value.plan, nextDate: form.value.nextDate,
  });
  showToast({ message: '随访记录已归档并通知学员', position: 'bottom' });
  form.value.conclusion = ''; form.value.plan = ''; form.value.symptoms = '';
}
const types = ['线上随访', '电话随访', '入企面诊', '绿色通道'] as const;
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="随访与干预" :on-back="store.back" />
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="text-[9.5px] font-bold text-muted">选择患者</div>
        <div class="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="p in store.myStudents" :key="p.id" class="tap flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5" :class="sid === p.id ? 'border-brand-600/40 bg-brand-50' : 'border-black/[0.06] bg-white/70'" @click="sid = p.id">
            <span class="text-[10px] font-bold" :class="sid === p.id ? 'text-brand-800' : 'text-ink'">{{ p.name }}</span>
            <RiskBadge :risk="p.risk" />
          </button>
        </div>
      </div>

      <div class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF3F8] text-[#144E73]"><Stethoscope class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1">
              <div class="text-[12px] font-extrabold text-ink">{{ s.name }} · 随访记录</div>
              <div class="text-[9px] text-muted">{{ s.age }} 岁 · 7 日平均 {{ bp?.sbp }}/{{ bp?.dbp }} mmHg</div>
            </div>
          </div>

          <div class="mt-3">
            <div class="mb-1 text-[10px] font-bold text-muted">随访方式</div>
            <div class="grid grid-cols-4 gap-1.5">
              <button v-for="t in types" :key="t" class="rounded-lg border py-2 text-[9px] font-bold" :class="form.type === t ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.06] bg-white text-muted'" @click="form.type = t">{{ t }}</button>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-2">
            <div><div class="mb-1 text-[9.5px] font-bold text-muted">收缩压</div><Input v-model:value="form.sbp as any" type="number" /></div>
            <div><div class="mb-1 text-[9.5px] font-bold text-muted">舒张压</div><Input v-model:value="form.dbp as any" type="number" /></div>
            <div><div class="mb-1 text-[9.5px] font-bold text-muted">心率</div><Input v-model:value="form.hr as any" type="number" /></div>
          </div>
          <div class="mt-2"><div class="mb-1 text-[9.5px] font-bold text-muted">症状与主诉</div><Input v-model:value="form.symptoms" type="textarea" rows="2" autosize placeholder="如：偶有晨起头晕，无胸痛" /></div>
          <div class="mt-2"><div class="mb-1 text-[9.5px] font-bold text-muted">随访结论 <span class="text-coral-500">*</span></div><Input v-model:value="form.conclusion" type="textarea" rows="2" autosize placeholder="血压控制情况、风险判断、是否需要调整方案" /></div>
          <div class="mt-2"><div class="mb-1 text-[9.5px] font-bold text-muted">干预方案 <span class="text-coral-500">*</span></div><Input v-model:value="form.plan" type="textarea" rows="2" autosize placeholder="用药、运动、营养与复诊安排" /></div>
          <div class="mt-2"><div class="mb-1 text-[9.5px] font-bold text-muted">下次随访日期</div><Input v-model:value="form.nextDate" type="date" /></div>

          <div class="mt-2 flex items-center gap-1.5 rounded-xl bg-brand-50/60 px-2.5 py-2 text-[8.5px] text-brand-800">
            <Check class="h-3 w-3" /> 提交后自动归档至学员档案，并同步消息中心与随访时间线
          </div>
          <Button class="mt-3 w-full" size="lg" @click="submit">归档随访记录</Button>
        </div>
      </div>

      <div class="mt-4 px-4 pb-8">
        <SectionHead title="历史随访" :sub="`${fus.length} 条 · 按时间倒序`" />
        <div class="space-y-2">
          <div v-for="f in fus" :key="f.id" class="glass-card rounded-2xl p-3.5">
            <div class="flex items-center gap-2">
              <span class="pill" :class="f.type === '绿色通道' ? 'pill-coral' : f.type === '入企面诊' ? 'pill-blue' : f.type === '电话随访' ? 'pill-amber' : 'pill-brand'">{{ f.type }}</span>
              <span class="text-[9px] text-muted">{{ f.date.slice(0, 16) }}</span>
              <span class="ml-auto text-[9px] font-bold text-ink/60">{{ f.doctorName }}</span>
            </div>
            <div class="mt-1.5 flex items-center gap-2 text-[9px] text-muted"><HeartPulse class="h-3 w-3 text-coral-500" /> {{ f.sbp }}/{{ f.dbp }} · HR {{ f.hr }}</div>
            <div class="mt-1.5 text-[10px] leading-relaxed text-ink/80">{{ f.conclusion }}</div>
            <div class="mt-1 text-[9.5px] leading-relaxed text-muted">{{ f.plan }}</div>
            <div class="mt-1.5 flex items-center gap-1 text-[8.5px] text-muted"><CalendarClock class="h-3 w-3" /> 下次 {{ fmtShort(f.nextDate) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
