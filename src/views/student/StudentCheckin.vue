<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import {
  Activity, AlertTriangle, Check, ChevronDown, Dumbbell, HeartPulse, ImagePlus, Info,
  Minus, Pill, Plus, Scale, Salad, Sparkles, UtensilsCrossed, X,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, SectionHead, Sheet, Sparkline } from '../../components/ui';
import { DEMO_TODAY, fmtMD, weekdayCN } from '../../lib/date';
import type { CheckinComment } from '../../types';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const tab = ref<'bp' | 'exercise' | 'diet' | 'med' | 'weight'>('bp');
const show = ref(false);
const saving = ref(false);

const tabs = [
  { key: 'bp', label: '血压', icon: HeartPulse },
  { key: 'exercise', label: '运动', icon: Dumbbell },
  { key: 'diet', label: '饮食', icon: UtensilsCrossed },
  { key: 'med', label: '用药', icon: Pill },
  { key: 'weight', label: '体重', icon: Scale },
] as const;

const latestBp = computed(() => store.latestBp(sid.value));
const bpAvg = computed(() => store.bpAvg(sid.value));
const bpSeries = computed(() => store.bpOf(sid.value).filter((r) => r.period === 'morning').slice(-12).map((r) => r.sbp));
const rxEx = computed(() => store.data.exerciseRxs.find((r) => r.studentId === sid.value));
const rxNu = computed(() => store.data.nutritionRxs.find((r) => r.studentId === sid.value));
const exList = computed(() => [...store.exerciseOf(sid.value)].reverse().slice(0, 8));
const dietList = computed(() => [...store.dietOf(sid.value)].reverse().slice(0, 9));
const bpList = computed(() => [...store.bpOf(sid.value)].reverse().slice(0, 8));
const wtList = computed(() => [...store.weightOf(sid.value)].reverse().slice(0, 8));
const medList = computed(() => [...store.medOf(sid.value)].reverse().slice(0, 8));
const done = computed(() => store.todayDone(sid.value));

// 血压表单
const bpForm = ref({ period: 'morning' as 'morning' | 'evening', sbp: 136, dbp: 84, hr: 72, takenMed: true, note: '' });
function openBp(period: 'morning' | 'evening') {
  const l = latestBp.value;
  bpForm.value = { period, sbp: l?.sbp ?? 136, dbp: l?.dbp ?? 84, hr: l?.hr ?? 72, takenMed: true, note: '' };
  show.value = true;
}
function saveBp() {
  if (!bpForm.value.sbp || !bpForm.value.dbp) { showToast('请填写完整的血压数值'); return; }
  store.addBp({ ...bpForm.value, sbp: Number(bpForm.value.sbp), dbp: Number(bpForm.value.dbp), hr: Number(bpForm.value.hr) });
  show.value = false;
  showToast({ message: '血压已记录 · 小红花 +2', position: 'bottom' });
}

// 运动
const exTypes = ['快走', '室内骑行', '太极', '八段锦', '弹力带训练', '慢跑', '游泳'];
const exForm = ref({ type: '快走', duration: 30, intensity: 3 as 1 | 2 | 3 | 4 | 5, hrAvg: 106, fatigue: 2 as 1 | 2 | 3, symptoms: [] as string[] });
const symptomOpts = ['无不适', '轻微气短', '胸闷/胸痛', '头晕', '心悸', '下肢酸痛'];
function toggleSymptom(v: string) {
  if (v === '无不适') { exForm.value.symptoms = exForm.value.symptoms.includes(v) ? [] : [v]; return; }
  exForm.value.symptoms = exForm.value.symptoms.filter((x) => x !== '无不适');
  const i = exForm.value.symptoms.indexOf(v);
  if (i >= 0) exForm.value.symptoms.splice(i, 1); else exForm.value.symptoms.push(v);
}
function calcIntensity(hr: number) {
  const max = rxEx.value?.assessment.hrmax || 160;
  const pct = hr / max;
  exForm.value.intensity = (pct < 0.55 ? 1 : pct < 0.65 ? 2 : pct < 0.75 ? 3 : pct < 0.85 ? 4 : 5) as 1 | 2 | 3 | 4 | 5;
}
function saveEx() {
  if (!exForm.value.duration) { showToast('请填写运动时长'); return; }
  if (exForm.value.symptoms.some((x) => ['胸闷/胸痛', '头晕'].includes(x))) {
    showToast({ message: '出现警示症状，建议停止运动并联系医师', position: 'bottom' });
  }
  store.addExercise({ ...exForm.value, duration: Number(exForm.value.duration), hrAvg: Number(exForm.value.hrAvg), symptoms: exForm.value.symptoms });
  show.value = false;
  showToast({ message: '运动已打卡 · 小红花 +5', position: 'bottom' });
}

// 饮食
const dietForm = ref({ meal: 'breakfast' as 'breakfast' | 'lunch' | 'dinner', desc: '', salt: 'low' as 'low' | 'medium' | 'high' });
const photoAdded = ref(false);
function openDiet(meal: 'breakfast' | 'lunch' | 'dinner') {
  dietForm.value = { meal, desc: '', salt: 'low' };
  photoAdded.value = false;
  show.value = true;
}
function saveDiet() {
  if (!dietForm.value.desc.trim()) { showToast('请简单描述这餐吃了什么'); return; }
  store.addDiet({ ...dietForm.value });
  show.value = false;
  showToast({ message: '饮食已打卡 · 小红花 +3', position: 'bottom' });
}

// 用药
function markMed(period: 'morning' | 'evening', taken: boolean) {
  store.addMed({ period, taken });
  showToast(taken ? '已记录服药' : '已记录漏服，请尽快补服或咨询医师');
}
const todayMeds = computed(() => store.medOf(sid.value).filter((r) => r.date === DEMO_TODAY));

// 体重
const wtForm = ref({ weight: 78.6, bodyFat: 27.4, waist: 95 });
function openWeight() {
  const l = store.latestWeight(sid.value);
  wtForm.value = { weight: l?.weight ?? 78, bodyFat: l?.bodyFat ?? 27, waist: l?.waist ?? 95 };
  show.value = true;
}
function saveWeight() {
  if (!wtForm.value.weight) { showToast('请填写体重'); return; }
  store.addWeight({ weight: Number(wtForm.value.weight), bodyFat: Number(wtForm.value.bodyFat), waist: Number(wtForm.value.waist) });
  show.value = false;
  showToast({ message: '体重已记录 · 小红花 +2', position: 'bottom' });
}

function scorePill(score?: number | null) {
  if (score === 2) return { text: '到位', cls: 'pill-green' };
  if (score === 1) return { text: '尚可', cls: 'pill-amber' };
  if (score === 0) return { text: '需调整', cls: 'pill-coral' };
  return null;
}
const roleLabel: Record<CheckinComment['role'], string> = { doctor: '医师', coach: '运动师', dietitian: '营养师' };
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="健康打卡" :on-back="store.back">
      <template #right>
        <span class="text-[10px] font-bold text-brand-700">{{ DEMO_TODAY }} · 第 {{ store.campDay }} 天</span>
      </template>
    </NavBar>

    <div class="page-scroll no-tabbar">
      <!-- 今日完成度 -->
      <div class="px-4 pt-3">
        <div class="glass-card rounded-2xl p-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] text-muted">{{ weekdayCN(DEMO_TODAY) }}</div>
              <div class="mt-0.5 text-[14px] font-extrabold text-ink">今天的健康作业</div>
            </div>
            <div class="flex items-center gap-1.5">
              <span v-for="(v, k) in { 血压: done.bp, 运动: done.ex, 饮食: done.diet, 用药: done.med }" :key="k"
                class="pill" :class="v ? 'pill-green' : 'pill-slate'">
                {{ v ? '✓' : '·' }} {{ k }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 px-4">
        <div class="seg-tabs overflow-x-auto no-scrollbar">
          <button v-for="t in tabs" :key="t.key" class="seg-tab !px-1" :class="tab === t.key ? 'active' : ''" @click="tab = t.key">
            <component :is="t.icon" class="h-3.5 w-3.5" /> {{ t.label }}
          </button>
        </div>
      </div>

      <!-- 血压 -->
      <div v-if="tab === 'bp'" class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[10px] text-muted">7 日平均 / 目标 {{ s.targets.sbp }}/80</div>
              <div class="mt-1 flex items-end gap-1">
                <span class="stat-num text-[30px] text-ink">{{ bpAvg?.sbp ?? '—' }}</span>
                <span class="mb-1 text-[11px] text-muted">/ {{ bpAvg?.dbp ?? '—' }}</span>
                <span class="mb-1 ml-1 text-[10px] font-bold" :class="(bpAvg?.sbp || 0) <= s.targets.sbp ? 'text-brand-600' : 'text-coral-500'">
                  {{ (bpAvg?.sbp || 0) <= s.targets.sbp ? '达标' : '待达标' }}
                </span>
              </div>
            </div>
            <Sparkline :points="bpSeries" :width="112" :height="40" color="#D9553E" />
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button class="tap rounded-xl border border-brand-600/15 bg-brand-50/80 px-3 py-2.5 text-left" @click="openBp('morning')">
              <div class="text-[9px] text-brand-700/70">晨起血压</div>
              <div class="mt-0.5 text-[12px] font-extrabold text-brand-800">记录 07:00–09:00</div>
              <div class="mt-0.5 text-[8.5px] text-brand-600">排尿后、服药前、坐位 5 分钟</div>
            </button>
            <button class="tap rounded-xl border border-coral-200/50 bg-coral-50/70 px-3 py-2.5 text-left" @click="openBp('evening')">
              <div class="text-[9px] text-coral-600/70">睡前血压</div>
              <div class="mt-0.5 text-[12px] font-extrabold text-coral-700">记录 20:00–22:00</div>
              <div class="mt-0.5 text-[8.5px] text-coral-500">服药后、睡前 1 小时</div>
            </button>
          </div>
        </div>

        <div class="mt-3">
          <SectionHead title="血压记录" sub="近 8 次 · 点击可查看医师批注" />
          <div class="space-y-2">
            <div v-for="r in bpList" :key="r.id" class="soft-card rounded-2xl px-3.5 py-3">
              <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg" :class="r.period === 'morning' ? 'bg-brand-50 text-brand-700' : 'bg-coral-50 text-coral-500'">
                  <HeartPulse class="h-4 w-4" />
                </span>
                <div class="min-w-0 flex-1">
                  <div class="text-[11px] font-bold text-ink">{{ fmtMD(r.date) }} · {{ r.period === 'morning' ? '晨起' : '睡前' }} <span class="text-[9px] font-normal text-muted">{{ r.date.slice(11) }}</span></div>
                  <div class="mt-0.5 text-[9px] text-muted">{{ r.takenMed ? '已服药' : '未服药' }} · 心率 {{ r.hr }} 次/分</div>
                </div>
                <div class="text-right">
                  <span class="text-[16px] font-extrabold tabular" :class="r.sbp >= 140 || r.dbp >= 90 ? 'text-coral-500' : 'text-ink'">{{ r.sbp }}/{{ r.dbp }}</span>
                  <div class="text-[8px] text-muted">mmHg</div>
                </div>
              </div>
              <div v-for="c in r.comments" :key="c.id" class="mt-2 rounded-xl bg-brand-50/60 px-2.5 py-2">
                <div class="text-[9px] font-bold text-brand-700">{{ c.name }} {{ roleLabel[c.role] }}</div>
                <div class="mt-0.5 text-[10px] leading-relaxed text-ink/75">{{ c.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 运动 -->
      <div v-else-if="tab === 'exercise'" class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] text-muted">今日运动处方</div>
              <div class="mt-0.5 text-[13px] font-extrabold text-ink">{{ rxEx?.aerobic.mode }} · {{ rxEx?.aerobic.minutes }} 分钟</div>
            </div>
            <span class="pill pill-brand">目标心率 {{ rxEx?.aerobic.hrLow }}–{{ rxEx?.aerobic.hrHigh }}</span>
          </div>
          <div class="mt-2 flex items-center gap-2 rounded-xl bg-[#fbf6e9] px-2.5 py-2 text-[9px] leading-relaxed text-[#8a641f]">
            <AlertTriangle class="h-3.5 w-3.5 shrink-0" /> 运动前测血压；≥180/110、静息心率 >110 或胸闷时暂停并联系医师。
          </div>
          <Button class="mt-3 w-full" @click="show = true"><Plus class="h-4 w-4" /> 记录今日运动</Button>
        </div>

        <div class="mt-3">
          <SectionHead title="运动记录" sub="近 8 次 · 运动师会逐条批注" />
          <div class="space-y-2">
            <div v-for="r in exList" :key="r.id" class="soft-card rounded-2xl px-3.5 py-3">
              <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50 text-coral-500"><Dumbbell class="h-4 w-4" /></span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[11.5px] font-bold text-ink">{{ r.type }}</span>
                    <span class="text-[9px] text-muted">{{ fmtMD(r.date) }} {{ r.date.slice(11) }}</span>
                    <span v-if="r.coachScore !== null && r.coachScore !== undefined" class="pill !px-1.5 !py-0 !text-[8px]" :class="scorePill(r.coachScore)?.cls">{{ scorePill(r.coachScore)?.text }}</span>
                  </div>
                  <div class="mt-0.5 flex flex-wrap gap-x-2 text-[9px] text-muted">
                    <span>{{ r.duration }} 分钟</span><span>心率 {{ r.hrAvg }}</span><span>强度 {{ r.intensity }}/5</span><span>疲劳 {{ r.fatigue }}/3</span>
                  </div>
                  <div v-if="r.symptoms?.length" class="mt-1 flex flex-wrap gap-1">
                    <span v-for="sy in r.symptoms" :key="sy" class="pill pill-coral">{{ sy }}</span>
                  </div>
                </div>
              </div>
              <div v-for="c in r.comments" :key="c.id" class="mt-2 rounded-xl bg-brand-50/60 px-2.5 py-2">
                <div class="text-[9px] font-bold text-brand-700">{{ c.name }} {{ roleLabel[c.role] }}</div>
                <div class="mt-0.5 text-[10px] leading-relaxed text-ink/75">{{ c.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 饮食 -->
      <div v-else-if="tab === 'diet'" class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] text-muted">今日饮食处方</div>
              <div class="mt-0.5 text-[13px] font-extrabold text-ink">{{ rxNu?.pattern }} · {{ rxNu?.targets.energy }} kcal</div>
            </div>
            <span class="pill pill-blue">食盐 <5g</span>
          </div>
          <div class="mt-2 flex gap-2">
            <button v-for="m in [{ k: 'breakfast', l: '早餐' }, { k: 'lunch', l: '午餐' }, { k: 'dinner', l: '晚餐' }]" :key="m.k"
              class="tap flex-1 rounded-xl border border-brand-600/12 bg-brand-50/70 py-2 text-[11px] font-bold text-brand-800" @click="openDiet(m.k as any)">
              + {{ m.l }}
            </button>
          </div>
        </div>

        <div class="mt-3">
          <SectionHead title="饮食记录" sub="近 9 条 · 营养师逐餐批注" />
          <div class="space-y-2">
            <div v-for="r in dietList" :key="r.id" class="soft-card rounded-2xl px-3.5 py-3">
              <div class="flex items-start gap-2">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF5FA] text-[#2C7DA0]"><Salad class="h-4 w-4" /></span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[11px] font-bold text-ink">{{ r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '午餐' : '晚餐' }}</span>
                    <span class="text-[9px] text-muted">{{ fmtMD(r.date) }} {{ r.date.slice(11) }}</span>
                    <span class="pill !px-1.5 !py-0 !text-[8px]" :class="r.salt === 'low' ? 'pill-green' : r.salt === 'medium' ? 'pill-amber' : 'pill-coral'">{{ r.salt === 'low' ? '低盐' : r.salt === 'medium' ? '适中' : '偏咸' }}</span>
                  </div>
                  <div class="mt-0.5 text-[10px] leading-relaxed text-ink/75">{{ r.desc }}</div>
                </div>
                <span v-if="r.dietitianScore !== null && r.dietitianScore !== undefined" class="pill" :class="scorePill(r.dietitianScore)?.cls">{{ scorePill(r.dietitianScore)?.text }}</span>
              </div>
              <div v-for="c in r.comments" :key="c.id" class="mt-2 rounded-xl bg-[#EDF5FA]/70 px-2.5 py-2">
                <div class="text-[9px] font-bold text-[#2C7DA0]">{{ c.name }} 营养师</div>
                <div class="mt-0.5 text-[10px] leading-relaxed text-ink/75">{{ c.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用药 -->
      <div v-else-if="tab === 'med'" class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] text-muted">今日用药</div>
              <div class="mt-0.5 text-[13px] font-extrabold text-ink">晨服 + 睡前</div>
            </div>
            <span class="pill pill-brand">依从 {{ store.adherence(sid).med }}%</span>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button class="tap rounded-xl border border-brand-600/15 bg-brand-50/70 p-3 text-left" @click="markMed('morning', true)">
              <div class="text-[10px] font-bold text-brand-800">晨服</div>
              <div class="mt-1 flex items-center gap-1 text-[12px] font-extrabold text-brand-700"><Check class="h-3.5 w-3.5" /> 已服药</div>
              <div class="mt-0.5 text-[8.5px] text-brand-600">氨氯地平 5mg + 阿司匹林 100mg</div>
            </button>
            <button class="tap rounded-xl border border-coral-200/40 bg-coral-50/60 p-3 text-left" @click="markMed('evening', true)">
              <div class="text-[10px] font-bold text-coral-700">睡前</div>
              <div class="mt-1 flex items-center gap-1 text-[12px] font-extrabold text-coral-600"><Check class="h-3.5 w-3.5" /> 已服药</div>
              <div class="mt-0.5 text-[8.5px] text-coral-500">阿托伐他汀 20mg</div>
            </button>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button class="rounded-lg bg-black/[0.03] py-1.5 text-[9px] font-semibold text-muted" @click="markMed('morning', false)">晨服漏服登记</button>
            <button class="rounded-lg bg-black/[0.03] py-1.5 text-[9px] font-semibold text-muted" @click="markMed('evening', false)">睡前漏服登记</button>
          </div>
          <div v-if="todayMeds.length" class="mt-2 text-[9px] text-muted">今日已登记 {{ todayMeds.length }} 次，服药 {{ todayMeds.filter((m) => m.taken).length }} 次</div>
        </div>
        <div class="mt-3 rounded-2xl border border-amber-300/30 bg-[#fbf6e9] p-3 text-[9.5px] leading-relaxed text-[#8a641f]">
          <b>用药提醒：</b>降压药不可自行停用；他汀避免与大量西柚汁同服；如出现黑便、牙龈出血、肌肉酸痛，请及时联系医师。
        </div>
        <div class="mt-3">
          <SectionHead title="用药记录" sub="近 8 次" />
          <div class="glass-card divide-y divide-black/[0.045] overflow-hidden rounded-2xl">
            <div v-for="m in medList" :key="m.id" class="flex items-center gap-2 px-3.5 py-2.5">
              <span class="flex h-6 w-6 items-center justify-center rounded-full" :class="m.taken ? 'bg-brand-50 text-brand-700' : 'bg-coral-50 text-coral-500'"><component :is="m.taken ? Check : X" class="h-3 w-3" /></span>
              <div class="flex-1 text-[10.5px] text-ink">{{ fmtMD(m.date) }} · {{ m.period === 'morning' ? '晨服' : '睡前' }}</div>
              <span class="text-[9px]" :class="m.taken ? 'text-brand-600' : 'text-coral-500'">{{ m.taken ? '已服药' : '漏服' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 体重 -->
      <div v-else class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[10px] text-muted">当前体重 / 目标 {{ s.targets.weight }} kg</div>
              <div class="mt-1 flex items-end gap-1">
                <span class="stat-num text-[30px] text-ink">{{ store.latestWeight(sid)?.weight }}</span>
                <span class="mb-1 text-[10px] text-muted">kg</span>
                <span class="mb-1 ml-1 text-[10px] font-bold text-brand-600">↓{{ store.weightChange(sid) }} kg</span>
              </div>
            </div>
            <Sparkline :points="wtList.map((r) => r.weight).reverse()" :width="110" :height="40" color="#0E7C6B" />
          </div>
          <Button class="mt-3 w-full" variant="secondary" @click="openWeight"><Plus class="h-4 w-4" /> 记录体重</Button>
        </div>
        <div class="mt-3">
          <SectionHead title="体重记录" sub="近 8 次 · 每 2 天一次" />
          <div class="glass-card divide-y divide-black/[0.045] overflow-hidden rounded-2xl">
            <div v-for="r in wtList" :key="r.id" class="flex items-center gap-2 px-3.5 py-2.5">
              <Scale class="h-3.5 w-3.5 text-brand-600" />
              <span class="flex-1 text-[10.5px] text-ink">{{ fmtMD(r.date) }}</span>
              <span class="text-[11px] font-bold text-ink tabular">{{ r.weight }} kg</span>
              <span v-if="r.bodyFat" class="text-[9px] text-muted">体脂 {{ r.bodyFat }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 血压表单 -->
    <Sheet v-model:show="show" :title="tab === 'bp' ? '记录血压' : tab === 'exercise' ? '记录运动' : tab === 'diet' ? '记录饮食' : tab === 'med' ? '用药登记' : '记录体重'" :sub="tab === 'bp' ? '坐位休息 5 分钟后测量，取两次平均值' : tab === 'exercise' ? '按运动处方完成，如实填写强度与身体反应' : ''">
      <!-- BP -->
      <div v-if="tab === 'bp'" class="space-y-3">
        <div class="seg-tabs">
          <button class="seg-tab" :class="bpForm.period === 'morning' ? 'active' : ''" @click="bpForm.period = 'morning'">晨起</button>
          <button class="seg-tab" :class="bpForm.period === 'evening' ? 'active' : ''" @click="bpForm.period = 'evening'">睡前</button>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <div class="mb-1 text-[10.5px] font-bold text-muted">收缩压 mmHg</div>
            <Input v-model:value="bpForm.sbp as any" type="number" inputmode="numeric" />
          </div>
          <div>
            <div class="mb-1 text-[10.5px] font-bold text-muted">舒张压 mmHg</div>
            <Input v-model:value="bpForm.dbp as any" type="number" inputmode="numeric" />
          </div>
        </div>
        <div>
          <div class="mb-1 text-[10.5px] font-bold text-muted">心率 次/分</div>
          <Input v-model:value="bpForm.hr as any" type="number" inputmode="numeric" />
        </div>
        <button class="flex w-full items-center justify-between rounded-xl bg-mist px-3 py-2.5" @click="bpForm.takenMed = !bpForm.takenMed">
          <span class="text-[11px] font-semibold text-ink">本次测量前已服药</span>
          <span class="flex h-5 w-9 items-center rounded-full p-0.5 transition" :class="bpForm.takenMed ? 'bg-brand-600' : 'bg-black/10'">
            <span class="h-4 w-4 rounded-full bg-white transition" :class="bpForm.takenMed ? 'translate-x-4' : ''" />
          </span>
        </button>
        <Button class="w-full" size="lg" @click="saveBp">保存血压</Button>
      </div>

      <!-- Exercise -->
      <div v-else-if="tab === 'exercise'" class="space-y-3">
        <div>
          <div class="mb-1 text-[10.5px] font-bold text-muted">运动类型</div>
          <div class="flex flex-wrap gap-1.5">
            <button v-for="t in exTypes" :key="t" class="rounded-lg border px-2.5 py-1.5 text-[10.5px] font-semibold" :class="exForm.type === t ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.07] bg-white text-muted'" @click="exForm.type = t">{{ t }}</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div><div class="mb-1 text-[10.5px] font-bold text-muted">时长（分钟）</div><Input v-model:value="exForm.duration as any" type="number" inputmode="numeric" /></div>
          <div><div class="mb-1 text-[10.5px] font-bold text-muted">平均心率</div><Input v-model:value="exForm.hrAvg as any" type="number" inputmode="numeric" @update:value="calcIntensity(Number($event))" /></div>
        </div>
        <div class="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-[9.5px] text-brand-800">
          <Sparkles class="h-3.5 w-3.5" /> 目标心率 {{ rxEx?.aerobic.hrLow }}–{{ rxEx?.aerobic.hrHigh }}，当前自动判定强度 {{ exForm.intensity }}/5
        </div>
        <div>
          <div class="mb-1 text-[10.5px] font-bold text-muted">主观疲劳度</div>
          <div class="flex gap-2">
            <button v-for="f in [1, 2, 3]" :key="f" class="flex-1 rounded-lg border py-2 text-[10px] font-semibold" :class="exForm.fatigue === f ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.07] bg-white text-muted'" @click="exForm.fatigue = f as any">{{ ['轻松', '稍累', '很累'][f - 1] }}</button>
          </div>
        </div>
        <div>
          <div class="mb-1 text-[10.5px] font-bold text-muted">身体反应</div>
          <div class="flex flex-wrap gap-1.5">
            <button v-for="o in symptomOpts" :key="o" class="rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold" :class="exForm.symptoms.includes(o) ? (['胸闷/胸痛', '头晕'].includes(o) ? 'border-coral-400/50 bg-coral-50 text-coral-700' : 'border-brand-600/40 bg-brand-50 text-brand-800') : 'border-black/[0.07] bg-white text-muted'" @click="toggleSymptom(o)">{{ o }}</button>
          </div>
        </div>
        <div class="flex items-center justify-center gap-2 rounded-xl border border-dashed border-black/[0.1] py-3 text-[10px] text-muted" @click="showToast('演示环境：照片上传已模拟')">
          <ImagePlus class="h-4 w-4" /> 上传运动照片 / 视频（可选）
        </div>
        <Button class="w-full" size="lg" @click="saveEx">提交运动打卡</Button>
      </div>

      <!-- Diet -->
      <div v-else-if="tab === 'diet'" class="space-y-3">
        <div class="seg-tabs">
          <button v-for="m in [{ k: 'breakfast', l: '早餐' }, { k: 'lunch', l: '午餐' }, { k: 'dinner', l: '晚餐' }]" :key="m.k" class="seg-tab" :class="dietForm.meal === m.k ? 'active' : ''" @click="dietForm.meal = m.k as any">{{ m.l }}</button>
        </div>
        <div>
          <div class="mb-1 text-[10.5px] font-bold text-muted">这餐吃了什么</div>
          <Input v-model:value="dietForm.desc" type="textarea" rows="3" autosize placeholder="如：杂粮饭、清蒸鲈鱼、西兰花，少油少盐" />
        </div>
        <div>
          <div class="mb-1 text-[10.5px] font-bold text-muted">咸淡程度</div>
          <div class="flex gap-2">
            <button v-for="o in [{ k: 'low', l: '低盐' }, { k: 'medium', l: '适中' }, { k: 'high', l: '偏咸' }]" :key="o.k" class="flex-1 rounded-lg border py-2 text-[10.5px] font-semibold" :class="dietForm.salt === o.k ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.07] bg-white text-muted'" @click="dietForm.salt = o.k as any">{{ o.l }}</button>
          </div>
        </div>
        <button class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/[0.1] py-3 text-[10px] text-muted" @click="photoAdded = true; showToast('演示环境：照片已添加')">
          <ImagePlus class="h-4 w-4" /> {{ photoAdded ? '照片已添加' : '拍照记录（可选）' }}
        </button>
        <div class="rounded-xl bg-[#EDF5FA] px-3 py-2 text-[9.5px] leading-relaxed text-[#2C7DA0]">
          正在服用他汀：避免西柚/柚子汁；服用阿司匹林：避免空腹饮酒。
        </div>
        <Button class="w-full" size="lg" @click="saveDiet">提交饮食打卡</Button>
      </div>

      <!-- Weight -->
      <div v-else class="space-y-3">
        <div><div class="mb-1 text-[10.5px] font-bold text-muted">体重（kg）</div><Input v-model:value="wtForm.weight as any" type="number" inputmode="decimal" /></div>
        <div class="grid grid-cols-2 gap-2.5">
          <div><div class="mb-1 text-[10.5px] font-bold text-muted">体脂率（%）</div><Input v-model:value="wtForm.bodyFat as any" type="number" inputmode="decimal" /></div>
          <div><div class="mb-1 text-[10.5px] font-bold text-muted">腰围（cm）</div><Input v-model:value="wtForm.waist as any" type="number" inputmode="decimal" /></div>
        </div>
        <Button class="w-full" size="lg" @click="saveWeight">保存体重</Button>
      </div>
    </Sheet>
  </div>
</template>
