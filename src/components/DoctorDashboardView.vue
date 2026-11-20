<script setup lang="ts">
import { computed } from 'vue';
import { showToast } from 'vant';
import { AlertTriangle, CalendarClock, ChevronRight, ClipboardCheck, HeartPulse, LogOut, MessageCircle, Stethoscope, Users } from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { Button, Card } from './ui';

const store = useAppStore();
const u = computed(() => store.user!);
const patients = computed(() => store.students.slice(0, 8));
const bpOf = (id: string) => store.latestBpFor(id, store.selectedCampId || 'camp1');
const fuOf = (id: string) => store.getDoctorFollowups(id)[0];
const riskOf = (sbp: number, dbp: number) => sbp >= 160 || dbp >= 100 ? '很高危' : sbp >= 140 || dbp >= 90 ? '高危' : sbp >= 130 || dbp >= 80 ? '中危' : '低危';
const riskClass = (r: string) => r === '很高危' ? 'bg-[#b2382b] text-white' : r === '高危' ? 'bg-[#fdeeea] text-[#bd4430]' : r === '中危' ? 'bg-[#fbf3e2] text-[#96651a]' : 'bg-[#eaf5fb] text-[#1a577c]';
const stats = computed(() => ({
  patients: patients.value.length,
  followup: patients.value.filter((p) => fuOf(p.id)).length,
  alerts: patients.value.filter((p) => { const b = bpOf(p.id); return b && (b.sbp >= 160 || b.dbp >= 100); }).length,
  review: 3,
}));
const alerts = computed(() => patients.value.map((p) => ({ p, b: bpOf(p.id) })).filter((x) => x.b && (x.b.sbp >= 160 || x.b.dbp >= 100)).slice(0, 3));

function openPatient(id: string) {
  store.selectedStudentId = id;
  store.setCurrentView('doctor-student-detail');
}
function logout() { store.logout(); }
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] pb-8">
    <div class="bg-gradient-to-b from-[#EAF2F8] to-transparent px-5 pb-2 pt-5">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1F6A95] text-white shadow-lg shadow-[#1F6A95]/25"><Stethoscope class="h-6 w-6" /></div>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] text-gray-500 font-medium">北京大学国际医院 · 心内科</div>
          <div class="text-[17px] font-black text-gray-900">{{ u.name }} 医师</div>
        </div>
        <button class="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-gray-500 shadow-sm" @click="logout"><LogOut class="mr-1 inline h-3 w-3" />退出</button>
      </div>
    </div>

    <div class="px-5 pt-3 space-y-4">
      <div class="rounded-[24px] bg-gradient-to-br from-[#123B53] via-[#1A577C] to-[#1F6A95] p-4 text-white shadow-xl shadow-[#1F6A95]/20">
        <div class="text-[10px] font-bold tracking-[0.16em] text-white/55">PHYSICIAN WORKBENCH</div>
        <div class="mt-1 text-[20px] font-black">今天有 {{ stats.followup }} 位患者待随访</div>
        <div class="mt-1 text-[11px] text-white/65">入营审核、危急值预警与随访逾期，按风险优先级排列。</div>
        <div class="mt-3 grid grid-cols-3 gap-2">
          <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">在管患者</div><div class="text-[18px] font-black">{{ stats.patients }}</div></div>
          <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">待随访</div><div class="text-[18px] font-black">{{ stats.followup }}</div></div>
          <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">危急预警</div><div class="text-[18px] font-black">{{ stats.alerts }}</div></div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-2">
        <button class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="store.setCurrentView('doctor-followup')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F6A95]/10 text-[#1F6A95]"><CalendarClock class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">随访计划</span>
        </button>
        <button class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="store.setCurrentView('account-manage')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2C7DA0]/10 text-[#2C7DA0]"><Users class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">患者名单</span>
        </button>
        <button class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="showToast('入营审核：演示环境 3 份待审')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8674F]/10 text-[#E8674F]"><ClipboardCheck class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">入营审核</span>
        </button>
        <button class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="store.setCurrentView('messages')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf3e2] text-amber-600"><MessageCircle class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">消息</span>
        </button>
      </div>

      <div v-if="alerts.length">
        <div class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900"><AlertTriangle class="h-4 w-4 text-[#E8674F]" /> 危急值预警</div>
        <div class="space-y-2">
          <Card v-for="a in alerts" :key="a.p.id" class="border-0 shadow-sm p-3.5 bg-[#FDF1ED]" @click="openPatient(a.p.id)">
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8674F] text-white"><AlertTriangle class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1">
                <div class="text-[11px] font-bold text-gray-900">{{ a.p.name }} · 血压危急</div>
                <div class="text-[9px] text-gray-500">{{ a.b?.sbp }}/{{ a.b?.dbp }} mmHg · 建议当日随访</div>
              </div>
              <ChevronRight class="h-4 w-4 text-gray-400" />
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-sm font-bold text-gray-900"><Users class="h-4 w-4 text-[#1F6A95]" /> 我的患者</div>
          <button class="text-[10px] font-bold text-[#1F6A95]" @click="store.setCurrentView('account-manage')">全部</button>
        </div>
        <div class="space-y-2">
          <Card v-for="p in patients" :key="p.id" class="border-0 shadow-sm p-3.5" @click="openPatient(p.id)">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF2F8] text-[11px] font-black text-[#1F6A95]">{{ p.name.slice(0, 1) }}</div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-[12px] font-bold text-gray-900">{{ p.name }}</span>
                  <span class="rounded-full px-1.5 py-0.5 text-[8px] font-bold" :class="riskClass(riskOf(bpOf(p.id)?.sbp || 120, bpOf(p.id)?.dbp || 80))">{{ riskOf(bpOf(p.id)?.sbp || 120, bpOf(p.id)?.dbp || 80) }}</span>
                  <span class="text-[9px] text-gray-400">{{ p.age }} 岁</span>
                </div>
                <div class="mt-0.5 text-[9px] text-gray-500">{{ fuOf(p.id)?.type || '未随访' }} {{ fuOf(p.id)?.date?.slice(0, 10) || '—' }} · 下次 {{ fuOf(p.id)?.nextDate || '—' }}</div>
              </div>
              <div class="text-right">
                <div class="text-[14px] font-black text-gray-900">{{ bpOf(p.id)?.sbp || '—' }}/{{ bpOf(p.id)?.dbp || '—' }}</div>
                <div class="text-[8px] text-gray-400">最近血压</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card class="border-0 shadow-sm p-4 bg-gradient-to-br from-[#1F6A95]/5 to-white" @click="store.setCurrentView('doctor-followup')">
        <div class="flex items-center gap-2">
          <HeartPulse class="h-4 w-4 text-[#1F6A95]" />
          <div class="flex-1 text-[11px] font-bold text-gray-900">随访与干预方案</div>
          <ChevronRight class="h-4 w-4 text-gray-400" />
        </div>
        <div class="mt-1 text-[9px] text-gray-500">开营面诊 / 第 6 个月复筛 / 结营复查，随访记录全程留痕。</div>
      </Card>
    </div>
  </div>
</template>
