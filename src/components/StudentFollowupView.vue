<script setup lang="ts">
import { computed } from 'vue';
import { AlertTriangle, CalendarClock, HeartPulse, MessageCircle, Pill, Stethoscope } from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { NavBar, Card } from './ui';

const store = useAppStore();
const sid = computed(() => store.user?.id || '');
const followups = computed(() => store.getDoctorFollowups(sid.value));
const med = computed(() => store.getMedication(sid.value));
const latest = computed(() => followups.value[0]);
const next = computed(() => latest.value?.nextDate || '—');
const doctor = computed(() => ({ name: latest.value?.doctorName || '李建国', title: '心内科主任医师' }));
const typeTone = (t: string) => t === '绿色通道' ? 'bg-[#fdeeea] text-[#bd4430]' : t === '入企面诊' ? 'bg-[#1F6A95]/10 text-[#1F6A95]' : 'bg-[#2C7DA0]/10 text-[#2C7DA0]';
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] pb-8">
    <NavBar title="随访与用药" :on-back="store.goBack" />
    <div class="px-4 pt-3 space-y-3">
      <Card class="border-0 shadow-sm bg-gradient-to-br from-[#123B53] to-[#1F6A95] text-white p-4">
        <div class="text-[9px] font-bold tracking-[0.16em] text-white/50">NEXT FOLLOW-UP</div>
        <div class="mt-1 text-[17px] font-black">{{ latest?.type || '待安排' }} · {{ doctor.name }}医师</div>
        <div class="mt-1.5 flex items-center gap-1.5 text-[10px] text-white/70"><CalendarClock class="h-3.5 w-3.5" /> 下次 {{ next }}</div>
        <div class="mt-3 flex gap-2">
          <button class="flex-1 rounded-xl bg-white/15 py-2 text-[10px] font-bold text-white" @click="store.setCurrentView('care-chat')"><MessageCircle class="mr-1 inline h-3.5 w-3.5" /> 联系医师</button>
          <button class="flex-1 rounded-xl bg-white/15 py-2 text-[10px] font-bold text-white" @click="store.setCurrentView('bp-checkin')"><HeartPulse class="mr-1 inline h-3.5 w-3.5" /> 记录血压</button>
        </div>
      </Card>

      <Card class="border-0 shadow-sm p-3.5">
        <div class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F6A95]/10 text-[#1F6A95]"><Stethoscope class="h-4 w-4" /></span>
          <div class="min-w-0 flex-1">
            <div class="text-[11px] font-bold text-gray-900">{{ doctor.name }} <span class="text-[9px] font-normal text-gray-400">{{ doctor.title }}</span></div>
            <div class="text-[8.5px] text-gray-400">主管医师 · 负责随访、用药与风险分层</div>
          </div>
          <button class="rounded-full bg-[#1F6A95]/10 px-2.5 py-1 text-[9px] font-bold text-[#1F6A95]" @click="store.setCurrentView('care-chat')">发消息</button>
        </div>
      </Card>

      <div>
        <div class="mb-2 text-sm font-bold text-gray-900">随访记录</div>
        <div class="space-y-2">
          <Card v-for="f in followups" :key="f.id" class="border-0 shadow-sm p-3.5">
            <div class="flex items-center gap-2">
              <span class="rounded-full px-2 py-0.5 text-[8px] font-bold" :class="typeTone(f.type)">{{ f.type }}</span>
              <span class="text-[9px] text-gray-400">{{ f.date.slice(0, 16) }}</span>
              <span class="ml-auto text-[9px] font-bold text-gray-500">{{ f.doctorName }} 医师</span>
            </div>
            <div class="mt-1.5 flex items-center gap-1.5 text-[9px] text-gray-500"><HeartPulse class="h-3 w-3 text-[#E8674F]" /> {{ f.sbp }}/{{ f.dbp }} mmHg · 心率 {{ f.hr }} 次/分</div>
            <div class="mt-1.5 text-[10px] leading-relaxed text-gray-700"><b>结论：</b>{{ f.conclusion }}</div>
            <div class="mt-1 text-[9.5px] leading-relaxed text-gray-500"><b>方案：</b>{{ f.plan }}</div>
            <div class="mt-1.5 flex items-center gap-1 text-[8.5px] text-gray-400"><CalendarClock class="h-3 w-3" /> 下次 {{ f.nextDate }}</div>
          </Card>
          <div v-if="!followups.length" class="py-12 text-center text-[11px] text-gray-400">暂无随访记录</div>
        </div>
      </div>

      <div>
        <div class="mb-2 text-sm font-bold text-gray-900">用药方案</div>
        <Card class="border-0 shadow-sm p-3.5">
          <div class="flex items-center gap-2 text-[10.5px] font-bold text-gray-900"><Pill class="h-4 w-4 text-[#2C7DA0]" /> 当前用药 <span class="ml-auto text-[9px] font-normal text-gray-400">依从 {{ Math.round((med?.adherence || 0) * 100) }}%</span></div>
          <div v-for="d in med?.drugs" :key="d.name" class="mt-2 rounded-xl bg-gray-50 px-2.5 py-2">
            <div class="flex items-center justify-between"><span class="text-[10px] font-bold text-gray-900">{{ d.name }}</span><span class="text-[8.5px] text-gray-500">{{ d.dose }}</span></div>
            <div class="text-[8.5px] text-gray-500 mt-0.5">{{ d.freq }}</div>
            <div v-if="d.note" class="text-[8.5px] text-[#E8674F] mt-0.5">{{ d.note }}</div>
          </div>
          <div class="mt-2 text-[8.5px] text-gray-400">{{ med?.note || '用药调整需经医师复诊，不可自行停药' }}</div>
        </Card>
      </div>

      <div class="flex items-start gap-2 rounded-2xl bg-[#fdf6ef] px-3 py-2.5 text-[9px] leading-relaxed text-[#8a641f]">
        <AlertTriangle class="mt-0.5 h-3.5 w-3.5 shrink-0" /> 如出现持续胸痛、呼吸困难、意识障碍或血压 ≥180/110 伴头痛呕吐，请立即拨打 120 或前往急诊，不要等待线上回复。
      </div>
    </div>
  </div>
</template>
