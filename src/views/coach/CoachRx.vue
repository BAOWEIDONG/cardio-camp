<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { showToast } from 'vant';
import { Activity, Check, Dumbbell, HeartPulse, Info, ShieldAlert, Sparkles, Target } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, RiskBadge, SectionHead } from '../../components/ui';
import { DEMO_TODAY, addDays } from '../../lib/date';

const store = useAppStore();
const sid = ref(store.activeStudentId);
const s = computed(() => store.studentById(sid.value)!);
const existing = computed(() => store.data.exerciseRxs.find((r) => r.studentId === sid.value));
const form = ref({
  sixMinWalk: 450, hrmax: 160, bpRest: '136/84', ecg: '窦性心律，未见明显异常', risk: '运动风险中危，可居家自主训练',
  goal: '控制血压、改善心肺耐力',
  mode: '快走（平地）', freq: 5, minutes: 30, hrLow: 96, hrHigh: 112, rpe: '11–13（稍累，可说话）',
  rFreq: 2, rSets: 2, rReps: '10–12 次/组', rMode: '弹力带、自重训练（避免憋气）',
  flexibility: '每次运动后 5 分钟拉伸，重点下肢与肩背',
  precautions: ['避免清晨 6 点前户外运动', '运动前测血压，≥180/110 暂停', '出现胸闷、胸痛、头晕立即停止并联系医师', '不在饱餐后 1 小时内运动'],
  reviewDate: addDays(DEMO_TODAY, 7),
});
watch(sid, () => {
  const rx = existing.value;
  if (!rx) return;
  form.value = {
    ...form.value,
    sixMinWalk: rx.assessment.sixMinWalk, hrmax: rx.assessment.hrmax, bpRest: rx.assessment.bpRest,
    ecg: rx.assessment.ecg, risk: rx.assessment.risk, goal: rx.goal,
    mode: rx.aerobic.mode, freq: rx.aerobic.freq, minutes: rx.aerobic.minutes,
    hrLow: rx.aerobic.hrLow, hrHigh: rx.aerobic.hrHigh, rpe: rx.aerobic.rpe,
    rFreq: rx.resistance.freq, rSets: rx.resistance.sets, rReps: rx.resistance.reps, rMode: rx.resistance.mode,
    flexibility: rx.flexibility, precautions: [...rx.precautions], reviewDate: rx.reviewDate,
  };
}, { immediate: true });

const zone = computed(() => ({ low: Math.round(form.value.hrmax * 0.6), high: Math.round(form.value.hrmax * 0.7) }));
function publish() {
  if (!form.value.goal.trim() || !form.value.minutes) { showToast('请填写处方目标与运动时长'); return; }
  store.publishExerciseRx({
    id: existing.value?.id || `rx_ex_${sid.value}`,
    studentId: sid.value, campId: 'camp1', coachId: store.currentUser!.id, coachName: store.currentUser!.name,
    date: DEMO_TODAY, status: 'published', goal: form.value.goal,
    assessment: { sixMinWalk: Number(form.value.sixMinWalk), hrmax: Number(form.value.hrmax), bpRest: form.value.bpRest, ecg: form.value.ecg, risk: form.value.risk },
    aerobic: { mode: form.value.mode, freq: Number(form.value.freq), minutes: Number(form.value.minutes), hrLow: Number(form.value.hrLow), hrHigh: Number(form.value.hrHigh), rpe: form.value.rpe },
    resistance: { freq: Number(form.value.rFreq), sets: Number(form.value.rSets), reps: form.value.rReps, mode: form.value.rMode },
    flexibility: form.value.flexibility, precautions: form.value.precautions, reviewDate: form.value.reviewDate,
  });
  showToast({ message: '运动处方已发布，学员端可见', position: 'bottom' });
}
const allPrecautions = ['避免清晨 6 点前户外运动', '运动前测血压，≥180/110 暂停', '出现胸闷、胸痛、头晕立即停止并联系医师', '不在饱餐后 1 小时内运动', '避免憋气动作（Valsalva）', '高温高湿天气改为室内运动'];
function toggleP(p: string) {
  const i = form.value.precautions.indexOf(p);
  if (i >= 0) form.value.precautions.splice(i, 1); else form.value.precautions.push(p);
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="运动处方" :on-back="store.back" />
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="text-[9.5px] font-bold text-muted">选择学员</div>
        <div class="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="p in store.myStudents" :key="p.id" class="tap flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5" :class="sid === p.id ? 'border-coral-400/50 bg-coral-50' : 'border-black/[0.06] bg-white/70'" @click="sid = p.id">
            <span class="text-[10px] font-bold" :class="sid === p.id ? 'text-coral-700' : 'text-ink'">{{ p.name }}</span>
            <RiskBadge :risk="p.risk" />
          </button>
        </div>
      </div>

      <div class="mt-3 px-4">
        <div class="hero-card hero-coach rounded-[24px] p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[9.5px] font-bold tracking-[0.16em] text-white/55">EXERCISE PRESCRIPTION</div>
              <div class="mt-1 text-[18px] font-extrabold">{{ s.name }} · 个体化运动处方</div>
              <div class="mt-1 text-[10px] text-white/70">基于 6 分钟步行、心电图与静息血压评估</div>
            </div>
            <span class="pill pill-white">{{ existing?.status === 'published' ? '已发布' : '待发布' }}</span>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">6 分钟步行</div><div class="text-[14px] font-extrabold">{{ form.sixMinWalk }} m</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">最大心率</div><div class="text-[14px] font-extrabold">{{ form.hrmax }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">建议区间</div><div class="text-[14px] font-extrabold">{{ zone.low }}–{{ zone.high }}</div></div>
          </div>
        </div>
      </div>

      <div class="mt-3 space-y-3 px-4 pb-8">
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="运动评估" sub="开营评估数据 · 可修改" />
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div><div class="mb-1 text-[9px] font-bold text-muted">6 分钟步行（m）</div><Input v-model:value="form.sixMinWalk as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">最大心率</div><Input v-model:value="form.hrmax as any" type="number" /></div>
          </div>
          <div class="mt-2"><div class="mb-1 text-[9px] font-bold text-muted">静息血压</div><Input v-model:value="form.bpRest" /></div>
          <div class="mt-2"><div class="mb-1 text-[9px] font-bold text-muted">心电图结论</div><Input v-model:value="form.ecg" type="textarea" rows="2" autosize /></div>
          <div class="mt-2"><div class="mb-1 text-[9px] font-bold text-muted">风险结论</div><Input v-model:value="form.risk" type="textarea" rows="2" autosize /></div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="处方目标" sub="与医师随访结论保持一致" />
          <div class="mt-2"><Input v-model:value="form.goal" type="textarea" rows="2" autosize /></div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="有氧运动" sub="FITT 原则" />
          <div class="mt-2"><div class="mb-1 text-[9px] font-bold text-muted">运动方式</div><Input v-model:value="form.mode" /></div>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div><div class="mb-1 text-[9px] font-bold text-muted">每周次数</div><Input v-model:value="form.freq as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">每次分钟</div><Input v-model:value="form.minutes as any" type="number" /></div>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div><div class="mb-1 text-[9px] font-bold text-muted">目标心率下限</div><Input v-model:value="form.hrLow as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">目标心率上限</div><Input v-model:value="form.hrHigh as any" type="number" /></div>
          </div>
          <div class="mt-1 flex items-center gap-1 text-[8.5px] text-brand-700"><Sparkles class="h-3 w-3" /> 按最大心率 60–70% 推荐：{{ zone.low }}–{{ zone.high }} 次/分</div>
          <div class="mt-2"><div class="mb-1 text-[9px] font-bold text-muted">主观强度 RPE</div><Input v-model:value="form.rpe" /></div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="抗阻与柔韧" sub="避免憋气，注意血压反应" />
          <div class="mt-2 grid grid-cols-3 gap-2">
            <div><div class="mb-1 text-[9px] font-bold text-muted">每周</div><Input v-model:value="form.rFreq as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">组数</div><Input v-model:value="form.rSets as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">次数</div><Input v-model:value="form.rReps" /></div>
          </div>
          <div class="mt-2"><Input v-model:value="form.rMode" /></div>
          <div class="mt-2"><div class="mb-1 text-[9px] font-bold text-muted">柔韧放松</div><Input v-model:value="form.flexibility" type="textarea" rows="2" autosize /></div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="禁忌与暂停条件" sub="发布后学员端同步展示" />
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="p in allPrecautions" :key="p" class="rounded-lg border px-2 py-1.5 text-left text-[9px] font-semibold leading-snug" :class="form.precautions.includes(p) ? 'border-coral-400/50 bg-coral-50 text-coral-700' : 'border-black/[0.06] bg-white text-muted'" @click="toggleP(p)">
              <Check v-if="form.precautions.includes(p)" class="mr-0.5 inline h-2.5 w-2.5" />{{ p }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-2xl border border-black/[0.05] bg-white/75 px-3.5 py-3">
          <span class="text-[10px] text-muted">下次复评</span>
          <Input v-model:value="form.reviewDate" type="date" class="!h-8 !w-[130px]" />
        </div>

        <Button class="w-full" size="lg" @click="publish"><Check class="h-4 w-4" /> 发布运动处方</Button>
        <div class="flex items-center justify-center gap-1 text-[8.5px] text-muted/60"><ShieldAlert class="h-3 w-3" /> 处方发布前请确认医师已完成风险分层</div>
      </div>
    </div>
  </div>
</template>
