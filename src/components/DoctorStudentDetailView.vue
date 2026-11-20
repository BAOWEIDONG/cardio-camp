<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import { Activity, CalendarClock, ChevronLeft, HeartPulse, MessageCircle, Pill, Plus, Stethoscope, TrendingDown } from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { Button, Card, Input, NavBar } from './ui';
import { metricValuesFor } from '../mock/data';
import { campDaysOf } from '../lib/camps';

const store = useAppStore();
const tab = ref<'overview' | 'bp' | 'med' | 'followup'>('overview');
const student = computed(() => store.students.find((s) => s.id === store.selectedStudentId) || store.students[0]);
const campId = computed(() => store.selectedCampId || 'camp1');
const bpRecords = computed(() => store.getStudentBpRecords(student.value.id, campId.value).slice().reverse());
const latest = computed(() => store.latestBpFor(student.value.id, campId.value));
const med = computed(() => store.getMedication(student.value.id));
const fus = computed(() => store.getDoctorFollowups(student.value.id));
const metricValues = computed(() => metricValuesFor(student.value.id, campId.value));
const metrics = computed(() => ['mc_bp_sbp', 'mc_bp_dbp', 'mc_bl_ldl', 'mc_body_weight', 'mc_bs_hba1c'].map((id) => {
  const cfg = store.metricConfigs.find((m) => m.id === id);
  const v = metricValues.value[id];
  return cfg ? { ...cfg, before: v?.beforeValue, after: v?.afterValue } : null;
}).filter(Boolean));
const avg = computed(() => {
  const arr = bpRecords.value.slice(0, 7);
  if (!arr.length) return null;
  return { sbp: Math.round(arr.reduce((n, r) => n + r.sbp, 0) / arr.length), dbp: Math.round(arr.reduce((n, r) => n + r.dbp, 0) / arr.length) };
});
const risk = computed(() => {
  const b = latest.value;
  if (!b) return '中危';
  return b.sbp >= 160 || b.dbp >= 100 ? '很高危' : b.sbp >= 140 || b.dbp >= 90 ? '高危' : b.sbp >= 130 || b.dbp >= 80 ? '中危' : '低危';
});
const riskClass = (r: string) => r === '很高危' ? 'bg-[#b2382b] text-white' : r === '高危' ? 'bg-[#fdeeea] text-[#bd4430]' : r === '中危' ? 'bg-[#fbf3e2] text-[#96651a]' : 'bg-[#eaf5fb] text-[#1a577c]';

const showComment = ref(false);
const commentTarget = ref('');
const commentText = ref('');
function openComment(id: string) { commentTarget.value = id; commentText.value = ''; showComment.value = true; }
function saveComment() {
  if (!commentText.value.trim()) { showToast('请输入医师意见'); return; }
  const rec = store.bpRecords.find((r) => r.id === commentTarget.value);
  if (rec) {
    const c = { id: `c_${Date.now()}`, role: 'doctor' as const, name: store.user?.name || '医师', text: commentText.value, date: new Date().toISOString().slice(0, 19).replace('T', ' ') };
    store.updateBpRecord(rec.id, {
      comments: [...(rec.comments || []), c],
      doctorComment: c.text, doctorName: c.name, doctorCommentDate: c.date,
    });
  }
  showComment.value = false;
  showToast({ message: '医师意见已发送', position: 'bottom' });
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] pb-24">
    <NavBar title="患者档案" :on-back="store.goBack" />
    <div class="px-4 pt-3 space-y-3">
      <Card class="border-0 shadow-sm p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF2F8] text-[14px] font-black text-[#1F6A95]">{{ student.name.slice(0, 1) }}</div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="text-[16px] font-black text-gray-900">{{ student.name }}</span>
              <span class="rounded-full px-1.5 py-0.5 text-[9px] font-bold" :class="riskClass(risk)">{{ risk }}</span>
              <span class="text-[9px] text-gray-400">{{ student.age }} 岁</span>
            </div>
            <div class="mt-0.5 text-[9px] text-gray-500">{{ student.gender === 'male' ? '男' : '女' }} · {{ store.camps.find((c) => c.id === campId)?.name }} · 营期 {{ campDaysOf(store.camps.find((c) => c.id === campId)) }} 天</div>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-4 gap-1.5 border-t border-gray-100 pt-2">
          <div><div class="text-[8px] text-gray-400">7 日血压</div><div class="text-[13px] font-black text-gray-900">{{ avg?.sbp || '—' }}/{{ avg?.dbp || '—' }}</div></div>
          <div><div class="text-[8px] text-gray-400">最近血压</div><div class="text-[13px] font-black" :class="(latest?.sbp || 0) >= 140 ? 'text-[#E8674F]' : 'text-gray-900'">{{ latest?.sbp || '—' }}/{{ latest?.dbp || '—' }}</div></div>
          <div><div class="text-[8px] text-gray-400">用药依从</div><div class="text-[13px] font-black text-[#1F6A95]">{{ Math.round((med?.adherence || 0) * 100) }}%</div></div>
          <div><div class="text-[8px] text-gray-400">随访</div><div class="text-[13px] font-black text-gray-900">{{ fus.length }} 次</div></div>
        </div>
      </Card>

      <div class="flex gap-1.5 rounded-2xl bg-white p-1 shadow-sm">
        <button v-for="t in [{ k: 'overview', l: '概览' }, { k: 'bp', l: '血压' }, { k: 'med', l: '用药' }, { k: 'followup', l: '随访' }]" :key="t.k" class="flex-1 rounded-xl py-2 text-[11px] font-bold transition" :class="tab === t.k ? 'bg-[#1F6A95] text-white shadow' : 'text-gray-500'" @click="tab = t.k as any">{{ t.l }}</button>
      </div>

      <div v-if="tab === 'overview'" class="space-y-3">
        <Card class="border-0 shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] text-gray-400">最近一次血压</div>
              <div class="mt-0.5 text-[26px] font-black text-gray-900 tracking-tight">{{ latest?.sbp || '—' }}<span class="text-[12px] text-gray-400">/{{ latest?.dbp || '—' }}</span></div>
              <div class="text-[9px] text-gray-400 mt-0.5">{{ latest?.date?.slice(0, 16) }} · {{ latest?.period === 'morning' ? '晨起' : '睡前' }}</div>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-full bg-[#1F6A95]/10 text-[#1F6A95]"><HeartPulse class="h-5 w-5" /></div>
          </div>
        </Card>
        <Card class="border-0 shadow-sm p-4">
          <div class="text-[11px] font-bold text-gray-900 mb-2">关键指标（开营 vs 结营）</div>
          <div v-for="m in metrics" :key="m!.id" class="flex items-center gap-2 border-t border-gray-50 py-2 first:border-0 first:pt-0">
            <span class="flex-1 text-[10px] text-gray-600">{{ m!.name }}</span>
            <span class="text-[10px] text-gray-400">{{ m!.before ?? '—' }}</span>
            <TrendingDown class="h-3 w-3 text-[#1F6A95]" />
            <span class="text-[11px] font-bold text-gray-900">{{ m!.after ?? '待复筛' }}</span>
            <span class="text-[8px] text-gray-400">{{ m!.unit }}</span>
          </div>
        </Card>
        <Card class="border-0 shadow-sm p-4" @click="tab = 'followup'">
          <div class="flex items-center gap-2">
            <Stethoscope class="h-4 w-4 text-[#1F6A95]" />
            <div class="flex-1 text-[11px] font-bold text-gray-900">最近随访结论</div>
            <span class="text-[9px] text-gray-400">{{ fus[0]?.date?.slice(0, 10) }}</span>
          </div>
          <div class="mt-1.5 text-[10px] leading-relaxed text-gray-600">{{ fus[0]?.conclusion || '暂无随访记录' }}</div>
          <div class="mt-1 text-[9px] leading-relaxed text-gray-500">方案：{{ fus[0]?.plan }}</div>
        </Card>
      </div>

      <div v-else-if="tab === 'bp'" class="space-y-2">
        <Card v-for="r in bpRecords.slice(0, 12)" :key="r.id" class="border-0 shadow-sm p-3.5">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg" :class="r.period === 'morning' ? 'bg-[#1F6A95]/10 text-[#1F6A95]' : 'bg-[#E8674F]/10 text-[#E8674F]'"><HeartPulse class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1">
              <div class="text-[10.5px] font-bold text-gray-900">{{ r.date.slice(5, 16) }} · {{ r.period === 'morning' ? '晨起' : '睡前' }}</div>
              <div class="text-[8.5px] text-gray-400">{{ r.takenMed ? '已服药' : '未服药' }} · 心率 {{ r.hr }}</div>
            </div>
            <span class="text-[15px] font-black" :class="r.sbp >= 140 ? 'text-[#E8674F]' : 'text-gray-900'">{{ r.sbp }}/{{ r.dbp }}</span>
            <button class="rounded-full bg-[#1F6A95]/10 px-2 py-1 text-[8px] font-bold text-[#1F6A95]" @click="openComment(r.id)">意见</button>
          </div>
          <div v-for="c in r.comments" :key="c.id" class="mt-2 rounded-lg bg-[#1F6A95]/5 px-2.5 py-2">
            <div class="text-[8.5px] font-bold text-[#1F6A95]">{{ c.name }} 医师</div>
            <div class="text-[9.5px] text-gray-700 mt-0.5 leading-relaxed">{{ c.text }}</div>
          </div>
        </Card>
      </div>

      <div v-else-if="tab === 'med'" class="space-y-3">
        <Card class="border-0 shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-[11px] font-bold text-gray-900"><Pill class="h-4 w-4 text-[#2C7DA0]" /> 当前用药方案</div>
            <span class="rounded-full bg-[#2C7DA0]/10 px-2 py-1 text-[9px] font-bold text-[#2C7DA0]">依从 {{ Math.round((med?.adherence || 0) * 100) }}%</span>
          </div>
          <div v-for="d in med?.drugs" :key="d.name" class="mt-2 rounded-xl bg-gray-50 px-3 py-2">
            <div class="flex items-center justify-between"><span class="text-[10.5px] font-bold text-gray-900">{{ d.name }}</span><span class="text-[9px] text-gray-500">{{ d.dose }}</span></div>
            <div class="text-[8.5px] text-gray-500 mt-0.5">{{ d.freq }}</div>
            <div v-if="d.note" class="text-[8.5px] text-[#E8674F] mt-0.5">{{ d.note }}</div>
          </div>
          <div class="mt-2 text-[8px] text-gray-400">更新于 {{ med?.updatedAt }} · {{ med?.doctorName }}</div>
        </Card>
        <Button class="w-full" variant="secondary" @click="showToast('用药调整需复诊确认（演示）')"><Plus class="h-4 w-4" /> 调整用药</Button>
      </div>

      <div v-else class="space-y-2">
        <Button class="w-full" @click="store.setCurrentView('doctor-followup')"><Plus class="h-4 w-4" /> 新增随访记录</Button>
        <Card v-for="f in fus" :key="f.id" class="border-0 shadow-sm p-3.5">
          <div class="flex items-center gap-2">
            <span class="rounded-full px-2 py-0.5 text-[8px] font-bold" :class="f.type === '绿色通道' ? 'bg-[#fdeeea] text-[#bd4430]' : 'bg-[#1F6A95]/10 text-[#1F6A95]'">{{ f.type }}</span>
            <span class="text-[9px] text-gray-400">{{ f.date.slice(0, 16) }}</span>
            <span class="ml-auto text-[9px] font-bold text-gray-500">{{ f.doctorName }}</span>
          </div>
          <div class="mt-1.5 text-[10px] text-gray-700 leading-relaxed"><b>结论：</b>{{ f.conclusion }}</div>
          <div class="mt-1 text-[9.5px] text-gray-500 leading-relaxed"><b>方案：</b>{{ f.plan }}</div>
          <div class="mt-1.5 flex items-center gap-1 text-[8.5px] text-gray-400"><CalendarClock class="h-3 w-3" /> 下次 {{ f.nextDate }}</div>
        </Card>
      </div>
    </div>

    <div class="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-gray-100 bg-white/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div class="flex gap-2">
        <button class="flex-1 rounded-xl bg-[#1F6A95] py-2.5 text-[11px] font-bold text-white" @click="store.setCurrentView('doctor-followup')"><CalendarClock class="mr-1 inline h-3.5 w-3.5" /> 发起随访</button>
        <button class="flex-1 rounded-xl border border-[#1F6A95]/20 py-2.5 text-[11px] font-bold text-[#1F6A95]" @click="store.setCurrentView('messages')"><MessageCircle class="mr-1 inline h-3.5 w-3.5" /> 发消息</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showComment" class="fixed inset-0 z-[999] flex items-end bg-black/40" @click.self="showComment = false">
        <div class="w-full rounded-t-3xl bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
          <div class="text-[15px] font-black text-gray-900">医师意见</div>
          <div class="text-[10px] text-gray-400 mt-0.5">将同步发送给学员并留痕</div>
          <div class="mt-3"><Input v-model:value="commentText" type="textarea" rows="4" autosize placeholder="如：血压较前下降，继续当前方案；如出现头晕/胸闷及时联系。" /></div>
          <Button class="w-full mt-3" size="lg" @click="saveComment">发送意见</Button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
