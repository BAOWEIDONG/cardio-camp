<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import {
  Activity, AlertTriangle, CalendarClock, ChevronRight, ClipboardList, Dumbbell,
  HeartPulse, Leaf, MessageCircle, Pill, Plus, Stethoscope, Trash2, TrendingDown, X,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, GenderAvatar, Input, NavBar, RiskBadge, Sheet, Sparkline } from '../../components/ui';
import { fmtShort } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.activeStudent!);
const tab = ref<'overview' | 'metrics' | 'checkin' | 'med' | 'followup'>('overview');
const sum = computed(() => store.summary(s.value.id));
const ck = ref<'baseline' | 'month6'>('baseline');
const snap = computed(() => store.snapshotOf(s.value.id, ck.value));
const base = computed(() => store.snapshotOf(s.value.id, 'baseline'));
const med = computed(() => store.data.medications.find((m) => m.studentId === s.value.id));
const rxEx = computed(() => store.data.exerciseRxs.find((r) => r.studentId === s.value.id));
const rxNu = computed(() => store.data.nutritionRxs.find((r) => r.studentId === s.value.id));
const fus = computed(() => store.followupsOf(s.value.id));
const alerts = computed(() => store.data.alerts.filter((a) => a.studentId === s.value.id && a.status === 'open'));
const bpSeries = computed(() => store.bpOf(s.value.id).filter((r) => r.period === 'morning').slice(-10).map((r) => r.sbp));
const bpRecent = computed(() => [...store.bpOf(s.value.id)].reverse().slice(0, 5));
const exRecent = computed(() => [...store.exerciseOf(s.value.id)].reverse().slice(0, 4));
const dietRecent = computed(() => [...store.dietOf(s.value.id)].reverse().slice(0, 4));

const tabs = [
  { k: 'overview', l: '概览' }, { k: 'metrics', l: '指标' }, { k: 'checkin', l: '打卡' },
  { k: 'med', l: '用药' }, { k: 'followup', l: '随访' },
] as const;

const showComment = ref(false);
const commentTarget = ref<string>('');
const commentText = ref('');
function openComment(id: string) { commentTarget.value = id; commentText.value = ''; showComment.value = true; }
function saveComment() {
  if (!commentText.value.trim()) { showToast('请输入医师意见'); return; }
  store.addComment('bp', commentTarget.value, commentText.value);
  showComment.value = false;
  showToast('医师意见已发送');
}

const showMed = ref(false);
const medDraft = ref<{ name: string; dose: string; freq: string; note?: string }[]>([]);
function openMed() {
  medDraft.value = (med.value?.drugs || []).map((d) => ({ ...d }));
  showMed.value = true;
}
function addDrug() { medDraft.value.push({ name: '', dose: '', freq: '' }); }
function saveMed() {
  const drugs = medDraft.value.filter((d) => d.name.trim());
  if (!drugs.length) { showToast('至少保留一种药物'); return; }
  store.saveMedication(s.value.id, drugs, med.value?.note);
  showMed.value = false;
  showToast('用药方案已更新并通知学员');
}

const keyMetrics = computed(() => {
  const st = snap.value; if (!st) return [];
  const b = base.value?.values || {};
  const keys = ['sbp', 'dbp', 'ldl', 'tc', 'hba1c', 'weight', 'bmi', 'waist', 'imt'];
  return keys.map((k) => {
    const d = store.data.metrics.find((m) => m.key === k)!;
    const v = st.values[k];
    const before = b[k];
    const change = v !== undefined && v !== null && before !== undefined && before !== null ? +(v - before).toFixed(1) : null;
    return { ...d, v, change };
  }).filter((x) => x.v !== undefined && x.v !== null);
});
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="患者档案" :on-back="store.back">
      <template #right>
        <button class="text-[10px] font-bold text-brand-700" @click="store.setView('d-messages')">消息</button>
      </template>
    </NavBar>

    <div class="page-scroll no-tabbar pb-[92px]">
      <!-- 患者头 -->
      <div class="px-4 pt-3">
        <div class="glass-card rounded-[22px] p-3.5">
          <div class="flex items-center gap-3">
            <div class="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white"><GenderAvatar :gender="s.gender" /></div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="text-[16px] font-extrabold text-ink">{{ s.name }}</span><RiskBadge :risk="s.risk" /><span class="text-[9px] text-muted">{{ s.age }} 岁</span></div>
              <div class="mt-0.5 text-[9px] text-muted">{{ s.occupation }} · {{ s.cohort }}</div>
              <div class="mt-1 flex flex-wrap gap-1"><span v-for="t in s.riskTags" :key="t" class="pill pill-slate">{{ t }}</span></div>
            </div>
          </div>
          <div class="mt-2 grid grid-cols-4 gap-1.5 border-t border-black/[0.05] pt-2">
            <div><div class="text-[8px] text-muted">7 日血压</div><div class="text-[13px] font-extrabold tabular" :class="(sum.bp?.sbp || 0) >= 140 ? 'text-coral-500' : 'text-ink'">{{ sum.bp?.sbp }}/{{ sum.bp?.dbp }}</div></div>
            <div><div class="text-[8px] text-muted">体重</div><div class="text-[13px] font-extrabold tabular">{{ sum.weight }}<span class="text-[8px] font-normal text-muted">kg</span></div></div>
            <div><div class="text-[8px] text-muted">用药依从</div><div class="text-[13px] font-extrabold tabular text-brand-700">{{ sum.adherence.med }}%</div></div>
            <div><div class="text-[8px] text-muted">连续打卡</div><div class="text-[13px] font-extrabold tabular">{{ sum.streak }}<span class="text-[8px] font-normal text-muted">天</span></div></div>
          </div>
        </div>
        <div v-if="alerts.length" class="mt-2 flex items-center gap-2 rounded-xl border border-coral-200/60 bg-coral-50 px-3 py-2">
          <AlertTriangle class="h-3.5 w-3.5 text-coral-500" />
          <span class="text-[9.5px] font-semibold text-coral-700">{{ alerts[0].type }}：{{ alerts[0].value }}</span>
          <button class="ml-auto text-[9px] font-bold text-coral-600" @click="store.setView('d-alerts')">处理</button>
        </div>
      </div>

      <div class="mt-3 px-4">
        <div class="seg-tabs overflow-x-auto no-scrollbar">
          <button v-for="t in tabs" :key="t.k" class="seg-tab !px-1" :class="tab === t.k ? 'active' : ''" @click="tab = t.k">{{ t.l }}</button>
        </div>
      </div>

      <!-- 概览 -->
      <div v-if="tab === 'overview'" class="mt-3 space-y-3 px-4">
        <div class="grid grid-cols-2 gap-2">
          <div class="soft-card rounded-2xl p-3">
            <div class="text-[9px] text-muted">血压趋势（晨测）</div>
            <div class="mt-0.5 text-[22px] font-extrabold text-ink tabular">{{ sum.bp?.sbp }}<span class="text-[9px] text-muted">/{{ sum.bp?.dbp }}</span></div>
            <Sparkline :points="bpSeries" :width="130" :height="30" color="#D9553E" class="mt-1" />
          </div>
          <div class="soft-card rounded-2xl p-3">
            <div class="text-[9px] text-muted">较开营变化</div>
            <div class="mt-0.5 space-y-1">
              <div class="flex items-center justify-between text-[10px]"><span class="text-muted">收缩压</span><span class="font-bold text-brand-600">↓{{ Math.abs(sum.sbpDrop || 0) }}</span></div>
              <div class="flex items-center justify-between text-[10px]"><span class="text-muted">体重</span><span class="font-bold text-brand-600">↓{{ Math.abs(sum.weightDrop || 0) }} kg</span></div>
              <div class="flex items-center justify-between text-[10px]"><span class="text-muted">风险等级</span><RiskBadge :risk="s.risk" /></div>
            </div>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center gap-2 text-[11.5px] font-extrabold text-ink"><ClipboardList class="h-4 w-4 text-[#0F5C6B]" /> 最近随访结论</div>
          <div v-if="fus[0]" class="mt-1.5 text-[10px] leading-relaxed text-ink/80">{{ fus[0].conclusion }}</div>
          <div v-if="fus[0]" class="mt-1 text-[9.5px] leading-relaxed text-muted">方案：{{ fus[0].plan }}</div>
          <div v-if="fus[0]" class="mt-2 flex items-center gap-1 text-[8.5px] text-muted"><CalendarClock class="h-3 w-3" /> {{ fus[0].date.slice(0, 10) }} · {{ fus[0].doctorName }} · 下次 {{ fmtShort(fus[0].nextDate) }}</div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="glass-card rounded-2xl p-3">
            <div class="flex items-center gap-1 text-[10px] font-extrabold text-ink"><Dumbbell class="h-3.5 w-3.5 text-coral-500" /> 运动处方</div>
            <div class="mt-1 text-[9.5px] leading-relaxed text-muted">{{ rxEx?.aerobic.mode }} · 每周 {{ rxEx?.aerobic.freq }} 次 · {{ rxEx?.aerobic.minutes }} 分钟</div>
            <div class="mt-1 text-[8.5px] font-semibold text-brand-700">HR {{ rxEx?.aerobic.hrLow }}–{{ rxEx?.aerobic.hrHigh }}</div>
          </div>
          <div class="glass-card rounded-2xl p-3">
            <div class="flex items-center gap-1 text-[10px] font-extrabold text-ink"><Leaf class="h-3.5 w-3.5 text-[#2C7DA0]" /> 饮食处方</div>
            <div class="mt-1 text-[9.5px] leading-relaxed text-muted">{{ rxNu?.pattern }} · {{ rxNu?.targets.energy }} kcal</div>
            <div class="mt-1 text-[8.5px] font-semibold text-[#2C7DA0]">食盐 &lt;5g · 蛋白质 {{ rxNu?.targets.protein }}%</div>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <div class="text-[11.5px] font-extrabold text-ink">三师团队</div>
          <div v-for="m in store.careTeam(s.id)" :key="m.id" class="mt-2 flex items-center gap-2 text-[10px]">
            <span class="flex h-6 w-6 items-center justify-center rounded-full" :class="m.role === 'doctor' ? 'bg-[#EAF3F5] text-[#0F5C6B]' : m.role === 'coach' ? 'bg-coral-50 text-coral-500' : 'bg-[#EDF5FA] text-[#2C7DA0]'">
              <component :is="m.role === 'doctor' ? Stethoscope : m.role === 'coach' ? Dumbbell : Leaf" class="h-3 w-3" />
            </span>
            <span class="font-semibold text-ink">{{ m.name }}</span><span class="text-muted">{{ m.label }}</span>
            <span class="ml-auto text-[8.5px] text-muted">{{ m.phone }}</span>
          </div>
        </div>
      </div>

      <!-- 指标 -->
      <div v-else-if="tab === 'metrics'" class="mt-3 px-4">
        <div class="seg-tabs">
          <button class="seg-tab" :class="ck === 'baseline' ? 'active' : ''" @click="ck = 'baseline'">开营筛查</button>
          <button class="seg-tab" :class="ck === 'month6' ? 'active' : ''" @click="ck = 'month6'">第 6 个月</button>
        </div>
        <div v-if="!snap" class="mt-3 rounded-2xl border border-dashed border-black/[0.1] bg-white/50 py-12 text-center text-[10px] text-muted">该节点数据待采集</div>
        <div v-else class="mt-3 space-y-2">
          <div class="flex items-center gap-1.5 rounded-xl bg-brand-50/60 px-3 py-2 text-[9px] text-brand-800">
            <Activity class="h-3 w-3" /> {{ snap.note }} · {{ snap.date }}
          </div>
          <div class="glass-card overflow-hidden rounded-2xl">
            <div class="flex items-center gap-2 border-b border-black/[0.05] bg-mist px-3.5 py-2 text-[8.5px] font-bold text-muted"><span class="flex-1">指标</span><span class="w-16 text-right">本次</span><span class="w-16 text-right">较开营</span></div>
            <div v-for="m in keyMetrics" :key="m.key" class="flex items-center gap-2 border-b border-black/[0.035] px-3.5 py-2.5 last:border-0">
              <div class="flex-1"><div class="text-[10.5px] font-semibold text-ink">{{ m.name }}<span class="ml-0.5 text-[8px] text-muted">{{ m.unit }}</span></div><div class="text-[8px] text-muted">参考 {{ m.refText }}</div></div>
              <span class="w-16 text-right text-[12px] font-extrabold text-ink tabular">{{ m.v }}</span>
              <span class="w-16 text-right text-[9.5px] font-bold tabular" :class="m.change === null ? 'text-muted' : (m.direction === 'higher' ? m.change > 0 : m.change < 0) ? 'text-brand-600' : 'text-coral-500'">
                {{ m.change === null ? '—' : (m.change > 0 ? '+' : '') + m.change }}
              </span>
            </div>
          </div>
          <div v-if="snap.plaque" class="rounded-2xl bg-coral-50/60 px-3 py-2 text-[9.5px] leading-relaxed text-coral-700">超声：{{ snap.plaque }}</div>
        </div>
      </div>

      <!-- 打卡 -->
      <div v-else-if="tab === 'checkin'" class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="text-[11px] font-extrabold text-ink">最近血压</div>
          <div v-for="r in bpRecent" :key="r.id" class="mt-2 flex items-center gap-2 border-t border-black/[0.04] pt-2 first:border-0 first:pt-0">
            <HeartPulse class="h-3.5 w-3.5 text-coral-500" />
            <div class="min-w-0 flex-1"><div class="text-[10px] font-semibold text-ink">{{ r.date.slice(5, 16) }} {{ r.period === 'morning' ? '晨' : '晚' }}</div><div v-if="r.comments?.length" class="text-[8.5px] text-muted">已批注：{{ r.comments[r.comments.length - 1].text }}</div></div>
            <span class="text-[12px] font-extrabold tabular" :class="r.sbp >= 140 ? 'text-coral-500' : 'text-ink'">{{ r.sbp }}/{{ r.dbp }}</span>
            <button class="rounded-full bg-brand-50 px-2 py-1 text-[8px] font-bold text-brand-700" @click="openComment(r.id)">意见</button>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-3.5">
          <div class="text-[11px] font-extrabold text-ink">运动记录</div>
          <div v-for="r in exRecent" :key="r.id" class="mt-2 border-t border-black/[0.04] pt-2 first:border-0 first:pt-0">
            <div class="flex items-center gap-2"><Dumbbell class="h-3.5 w-3.5 text-coral-500" /><span class="text-[10px] font-semibold text-ink">{{ r.type }} · {{ r.duration }} 分钟</span><span class="ml-auto text-[8.5px] text-muted">{{ r.date.slice(5, 10) }}</span></div>
            <div v-if="r.comments?.length" class="mt-1 rounded-lg bg-brand-50/60 px-2 py-1 text-[8.5px] text-ink/70">{{ r.comments[r.comments.length - 1].name }}：{{ r.comments[r.comments.length - 1].text }}</div>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-3.5">
          <div class="text-[11px] font-extrabold text-ink">饮食记录</div>
          <div v-for="r in dietRecent" :key="r.id" class="mt-2 border-t border-black/[0.04] pt-2 first:border-0 first:pt-0">
            <div class="flex items-center gap-2"><Leaf class="h-3.5 w-3.5 text-[#2C7DA0]" /><span class="text-[10px] font-semibold text-ink">{{ r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '午餐' : '晚餐' }}</span><span class="ml-auto text-[8.5px] text-muted">{{ r.date.slice(5, 10) }}</span></div>
            <div class="mt-0.5 line-clamp-1 text-[9px] text-muted">{{ r.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 用药 -->
      <div v-else-if="tab === 'med'" class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-[11.5px] font-extrabold text-ink"><Pill class="h-4 w-4 text-[#2C7DA0]" /> 当前用药方案</div>
            <button class="rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700" @click="openMed">调整</button>
          </div>
          <div v-for="d in med?.drugs" :key="d.name" class="mt-2 rounded-xl bg-mist px-3 py-2">
            <div class="flex items-center justify-between"><span class="text-[10.5px] font-bold text-ink">{{ d.name }}</span><span class="text-[9px] text-muted">{{ d.dose }}</span></div>
            <div class="mt-0.5 text-[8.5px] text-muted">{{ d.freq }}</div>
            <div v-if="d.note" class="mt-0.5 text-[8.5px] font-semibold text-coral-600">{{ d.note }}</div>
          </div>
          <div class="mt-2 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-[9.5px] text-brand-800"><span>近 7 日依从</span><b>{{ Math.round((med?.adherence || 0) * 100) }}%</b></div>
          <div class="mt-1 text-[8.5px] text-muted">更新于 {{ med?.updatedAt }} · {{ med?.doctorName }}</div>
        </div>
      </div>

      <!-- 随访 -->
      <div v-else class="mt-3 space-y-2 px-4">
        <button class="tap flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-[11px] font-bold text-white" @click="store.setView('d-followup')"><Plus class="h-3.5 w-3.5" /> 新增随访记录</button>
        <div v-for="f in fus" :key="f.id" class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center gap-2">
            <span class="pill" :class="f.type === '绿色通道' ? 'pill-coral' : f.type === '入企面诊' ? 'pill-blue' : 'pill-brand'">{{ f.type }}</span>
            <span class="text-[9px] text-muted">{{ f.date.slice(0, 16) }}</span>
            <span class="ml-auto text-[9px] font-bold text-ink/60">{{ f.doctorName }}</span>
          </div>
          <div class="mt-1.5 text-[10px] leading-relaxed text-ink/80"><b>结论：</b>{{ f.conclusion }}</div>
          <div class="mt-1 text-[9.5px] leading-relaxed text-muted"><b>方案：</b>{{ f.plan }}</div>
          <div class="mt-1.5 flex items-center gap-1 text-[8.5px] text-muted"><CalendarClock class="h-3 w-3" /> 下次 {{ fmtShort(f.nextDate) }}</div>
        </div>
      </div>
    </div>

    <div class="print-hide fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-black/[0.05] bg-white/92 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div class="flex gap-2">
        <button class="tap flex-1 rounded-xl bg-brand-600 py-2.5 text-[11px] font-bold text-white" @click="store.setView('d-followup')"><CalendarClock class="mr-1 inline h-3.5 w-3.5" /> 发起随访</button>
        <button class="tap flex-1 rounded-xl border border-brand-600/20 bg-white py-2.5 text-[11px] font-bold text-brand-700" @click="store.setView('d-messages')"><MessageCircle class="mr-1 inline h-3.5 w-3.5" /> 发消息</button>
      </div>
    </div>

    <Sheet v-model:show="showComment" title="医师意见" sub="将同步发送给学员并留痕">
      <div class="space-y-3">
        <Input v-model:value="commentText" type="textarea" rows="4" autosize placeholder="如：血压较前下降，继续当前方案；如出现头晕/胸闷及时联系。" />
        <Button class="w-full" size="lg" @click="saveComment">发送意见</Button>
      </div>
    </Sheet>

    <Sheet v-model:show="showMed" title="调整用药方案" sub="调整后将通知学员，需复诊确认">
      <div class="space-y-2">
        <div v-for="(d, i) in medDraft" :key="i" class="rounded-xl border border-black/[0.06] bg-white p-2.5">
          <div class="flex items-center gap-2">
            <input v-model="d.name" class="min-w-0 flex-1 border-b border-black/[0.06] pb-1 text-[11px] font-bold outline-none" placeholder="药物名称" />
            <button @click="medDraft.splice(i, 1)"><Trash2 class="h-3.5 w-3.5 text-muted/50" /></button>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <input v-model="d.dose" class="rounded-lg bg-mist px-2 py-1.5 text-[10px] outline-none" placeholder="剂量，如 5mg" />
            <input v-model="d.freq" class="rounded-lg bg-mist px-2 py-1.5 text-[10px] outline-none" placeholder="频次，如 每日1次" />
          </div>
          <input v-model="d.note" class="mt-1.5 w-full rounded-lg bg-mist px-2 py-1.5 text-[10px] outline-none" placeholder="注意事项（可选）" />
        </div>
        <button class="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-black/[0.1] py-2.5 text-[10px] font-semibold text-muted" @click="addDrug"><Plus class="h-3.5 w-3.5" /> 添加药物</button>
        <Button class="w-full" size="lg" @click="saveMed">保存并通知学员</Button>
      </div>
    </Sheet>
  </div>
</template>
