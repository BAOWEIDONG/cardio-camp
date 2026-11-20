<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { showToast } from 'vant';
import { CalendarClock, Check, HeartPulse, Stethoscope } from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { Button, Card, Input, NavBar } from './ui';

const store = useAppStore();
const sid = ref(store.selectedStudentId || store.students[0]?.id || 's1');
const student = computed(() => store.students.find((s) => s.id === sid.value) || store.students[0]);
const campId = computed(() => store.selectedCampId || 'camp1');
const records = computed(() => store.getDoctorFollowups(sid.value));
const patientOptions = computed(() => store.students.slice(0, 10));
const latest = computed(() => store.latestBpFor(sid.value, campId.value));
const nextDate = (offset: number) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const form = ref({
  type: '线上随访' as '入企面诊' | '线上随访' | '电话随访' | '绿色通道',
  sbp: latest.value?.sbp || 136, dbp: latest.value?.dbp || 84, hr: latest.value?.hr || 72,
  symptoms: '', conclusion: '', plan: '', nextDate: nextDate(7),
});
watch(sid, () => {
  form.value.sbp = latest.value?.sbp || 136;
  form.value.dbp = latest.value?.dbp || 84;
  form.value.hr = latest.value?.hr || 72;
});
function submit() {
  if (!form.value.conclusion.trim() || !form.value.plan.trim()) { showToast('请填写随访结论与干预方案'); return; }
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  store.addDoctorFollowup({
    id: `fu_${Date.now()}`, studentId: sid.value, campId: campId.value,
    doctorId: store.user?.id || 'dr1', doctorName: store.user?.name || '医师',
    date: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`,
    type: form.value.type,
    risk: (latest.value?.sbp || 0) >= 160 ? '很高危' : (latest.value?.sbp || 0) >= 140 ? '高危' : '中危',
    sbp: Number(form.value.sbp), dbp: Number(form.value.dbp), hr: Number(form.value.hr),
    symptoms: form.value.symptoms, conclusion: form.value.conclusion, plan: form.value.plan, nextDate: form.value.nextDate,
  });
  showToast({ message: '随访记录已归档', position: 'bottom' });
  form.value.conclusion = ''; form.value.plan = ''; form.value.symptoms = '';
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] pb-8">
    <NavBar title="随访与干预" :on-back="store.goBack" />
    <div class="px-4 pt-3 space-y-3">
      <div>
        <div class="text-[10px] font-bold text-gray-500 mb-1.5">选择患者</div>
        <div class="flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="p in patientOptions" :key="p.id" class="shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-bold" :class="sid === p.id ? 'border-[#1F6A95]/40 bg-[#1F6A95]/5 text-[#1F6A95]' : 'border-gray-100 bg-white text-gray-600'" @click="sid = p.id">{{ p.name }}</button>
        </div>
      </div>

      <Card class="border-0 shadow-sm p-4">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F6A95]/10 text-[#1F6A95]"><Stethoscope class="h-4 w-4" /></span>
          <div class="min-w-0 flex-1">
            <div class="text-[12px] font-bold text-gray-900">{{ student.name }} · 随访记录</div>
            <div class="text-[9px] text-gray-500">{{ student.age }} 岁 · 最近血压 {{ latest?.sbp || '—' }}/{{ latest?.dbp || '—' }} mmHg</div>
          </div>
        </div>
        <div class="mt-3">
          <div class="text-[9px] font-bold text-gray-500 mb-1">随访方式</div>
          <div class="grid grid-cols-4 gap-1.5">
            <button v-for="t in ['线上随访', '电话随访', '入企面诊', '绿色通道']" :key="t" class="rounded-lg border py-2 text-[9px] font-bold" :class="form.type === t ? 'border-[#1F6A95]/40 bg-[#1F6A95]/5 text-[#1F6A95]' : 'border-gray-100 text-gray-500'" @click="form.type = t as any">{{ t }}</button>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2">
          <div><div class="text-[9px] font-bold text-gray-500 mb-1">收缩压</div><Input v-model:value="form.sbp as any" type="number" /></div>
          <div><div class="text-[9px] font-bold text-gray-500 mb-1">舒张压</div><Input v-model:value="form.dbp as any" type="number" /></div>
          <div><div class="text-[9px] font-bold text-gray-500 mb-1">心率</div><Input v-model:value="form.hr as any" type="number" /></div>
        </div>
        <div class="mt-2"><div class="text-[9px] font-bold text-gray-500 mb-1">症状与主诉</div><Input v-model:value="form.symptoms" type="textarea" rows="2" autosize placeholder="如：偶有晨起头晕，无胸痛" /></div>
        <div class="mt-2"><div class="text-[9px] font-bold text-gray-500 mb-1">随访结论 *</div><Input v-model:value="form.conclusion" type="textarea" rows="2" autosize placeholder="血压控制情况、风险判断、是否需要调整方案" /></div>
        <div class="mt-2"><div class="text-[9px] font-bold text-gray-500 mb-1">干预方案 *</div><Input v-model:value="form.plan" type="textarea" rows="2" autosize placeholder="用药、运动、营养与复诊安排" /></div>
        <div class="mt-2"><div class="text-[9px] font-bold text-gray-500 mb-1">下次随访日期</div><Input v-model:value="form.nextDate" type="date" /></div>
        <div class="mt-2 flex items-center gap-1.5 rounded-xl bg-[#1F6A95]/5 px-2.5 py-2 text-[8.5px] text-[#1F6A95]"><Check class="h-3 w-3" /> 提交后自动归档至学员档案，并同步消息中心</div>
        <Button class="w-full mt-3" size="lg" @click="submit">归档随访记录</Button>
      </Card>

      <div>
        <div class="mb-2 text-sm font-bold text-gray-900">历史随访</div>
        <div class="space-y-2">
          <Card v-for="f in records" :key="f.id" class="border-0 shadow-sm p-3.5">
            <div class="flex items-center gap-2">
              <span class="rounded-full px-2 py-0.5 text-[8px] font-bold" :class="f.type === '绿色通道' ? 'bg-[#fdeeea] text-[#bd4430]' : 'bg-[#1F6A95]/10 text-[#1F6A95]'">{{ f.type }}</span>
              <span class="text-[9px] text-gray-400">{{ f.date.slice(0, 16) }}</span>
              <span class="ml-auto text-[9px] text-gray-500">{{ f.doctorName }}</span>
            </div>
            <div class="mt-1.5 flex items-center gap-1 text-[9px] text-gray-500"><HeartPulse class="h-3 w-3 text-[#E8674F]" /> {{ f.sbp }}/{{ f.dbp }} · HR {{ f.hr }}</div>
            <div class="mt-1.5 text-[10px] text-gray-700 leading-relaxed">{{ f.conclusion }}</div>
            <div class="mt-1 text-[9.5px] text-gray-500 leading-relaxed">{{ f.plan }}</div>
            <div class="mt-1.5 flex items-center gap-1 text-[8.5px] text-gray-400"><CalendarClock class="h-3 w-3" /> 下次 {{ f.nextDate }}</div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
