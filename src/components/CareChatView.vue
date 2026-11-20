<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { ChevronLeft, ChevronRight, Dumbbell, Leaf, MessageCircle, Send, Stethoscope } from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { NavBar } from './ui';
import type { ChatThread } from '../types';

const store = useAppStore();
const role = computed(() => store.user?.role || 'student');
const isStudent = computed(() => role.value === 'student');

const staffPatients = computed(() => {
  if (!store.user) return [];
  if (role.value === 'doctor') return store.getDoctorPatients(store.user.id);
  return store.students.slice(0, 10);
});
// 进入页面时一次性补齐会话，避免在 computed 里写状态导致循环
if (store.user && !isStudent.value) {
  const staffRole = role.value as 'doctor' | 'coach' | 'dietitian';
  staffPatients.value.forEach((s) => store.ensureChatThread(s.id, staffRole));
}
const threads = computed(() => {
  if (!store.user) return [];
  if (isStudent.value) return store.chatThreadsForStudent(store.user.id);
  return store.chatThreads.filter((t) => t.staffRole === role.value && staffPatients.value.some((s) => s.id === t.studentId));
});

const active = ref<ChatThread | null>(null);
const draft = ref('');
const scroller = ref<HTMLElement | null>(null);

function lastMsg(t: ChatThread) { return t.messages[t.messages.length - 1]; }
function unreadOf(t: ChatThread) {
  return t.messages.filter((m) => !m.read && m.fromRole !== role.value).length;
}
function staffName(t: ChatThread) {
  return t.title.split(' · ')[0];
}
function studentOf(t: ChatThread) {
  return store.students.find((s) => s.id === t.studentId);
}
function iconOf(t: ChatThread) {
  return t.staffRole === 'doctor' ? Stethoscope : t.staffRole === 'coach' ? Dumbbell : Leaf;
}
function toneOf(t: ChatThread) {
  return t.staffRole === 'doctor' ? 'bg-[#1F6A95]/10 text-[#1F6A95]' : t.staffRole === 'coach' ? 'bg-[#E8674F]/10 text-[#E8674F]' : 'bg-[#2C7DA0]/10 text-[#2C7DA0]';
}
function open(t: ChatThread) {
  active.value = t;
  store.markChatThreadRead(t.id);
  nextTick(() => { if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight; });
}
function close() { active.value = null; }
function send() {
  if (!active.value || !draft.value.trim()) return;
  store.sendChatMessage(active.value.id, draft.value);
  draft.value = '';
  nextTick(() => { if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight; });
}
const quick: Record<string, string[]> = {
  student: ['收到，谢谢', '今天血压已记录', '运动后有点累，正常吗？'],
  doctor: ['请把最近血压记录发我', '先按原方案用药，不要自行调整', '建议尽快到院复诊，我帮您安排加号'],
  coach: ['今天运动强度控制在靶心率内', '出现胸闷请立即停止并联系医师', '明天开始加一次弹力带训练'],
  dietitian: ['这餐盐分偏高，注意隐形盐', '主食换成杂粮，蛋白质要够', '他汀期间避免西柚汁'],
};
function titleOf(t: ChatThread) {
  return isStudent.value ? t.title : (studentOf(t)?.name || '学员') + ' · 在线沟通';
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA]">
    <NavBar title="在线沟通" :on-back="store.goBack" />

    <div v-if="!active" class="px-4 pt-3 space-y-2">
      <div class="rounded-2xl bg-[#1F6A95]/5 border border-[#1F6A95]/10 px-3.5 py-2.5 text-[9px] leading-relaxed text-[#1A577C]">
        {{ isStudent ? '与医师、营养师、运动师在线沟通；随访与用药调整会同步留痕到健康档案。' : '与学员在线沟通；涉及用药调整请在随访记录中留档，避免仅口头沟通。' }}
      </div>

      <button v-for="t in threads" :key="t.id" class="w-full rounded-2xl bg-white p-3.5 shadow-sm text-left active:scale-[0.98] transition" @click="open(t)">
        <div class="flex items-center gap-2.5">
          <div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full" :class="toneOf(t)">
            <component :is="iconOf(t)" class="h-4.5 w-4.5" />
            <span v-if="unreadOf(t)" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">{{ unreadOf(t) }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="truncate text-[12px] font-bold text-gray-900">{{ isStudent ? t.title : studentOf(t)?.name }}</span>
              <span v-if="isStudent" class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[8px] font-bold text-gray-500">{{ t.staffRole === 'doctor' ? '医师' : t.staffRole === 'coach' ? '运动师' : '营养师' }}</span>
              <span class="ml-auto text-[8.5px] text-gray-400">{{ lastMsg(t)?.time.slice(5, 16) }}</span>
            </div>
            <div class="mt-0.5 line-clamp-1 text-[10px] text-gray-500">{{ lastMsg(t)?.text || '点击发起首次沟通' }}</div>
          </div>
          <ChevronRight class="h-4 w-4 shrink-0 text-gray-300" />
        </div>
      </button>

      <div v-if="!threads.length" class="py-16 text-center text-[11px] text-gray-400">暂无可沟通的学员</div>
    </div>

    <template v-else>
      <div class="sticky top-14 z-30 flex items-center gap-2 border-b border-gray-100 bg-white/90 px-3 py-2.5 backdrop-blur">
        <button class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100" @click="close"><ChevronLeft class="h-4 w-4" /></button>
        <div class="flex h-9 w-9 items-center justify-center rounded-full" :class="toneOf(active)"><component :is="iconOf(active)" class="h-4 w-4" /></div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-[12px] font-bold text-gray-900">{{ titleOf(active) }}</div>
          <div class="text-[8.5px] text-[#1F6A95]">● 在线 · 消息全程留痕</div>
        </div>
      </div>

      <div ref="scroller" class="h-[calc(100dvh-150px)] overflow-y-auto bg-[#F4F7FA] px-3 py-3">
        <div class="mb-3 text-center text-[8.5px] text-gray-400">沟通记录会同步到随访档案，请如实描述身体状况</div>
        <div v-for="m in active.messages" :key="m.id" class="mb-2.5 flex" :class="m.fromRole === role ? 'justify-end' : 'justify-start'">
          <div class="max-w-[82%]">
            <div class="mb-0.5 text-[8.5px] text-gray-400" :class="m.fromRole === role ? 'text-right' : ''">
              <span class="font-bold text-gray-600">{{ m.fromName }}</span>
              <span class="ml-1">{{ m.fromRole === 'doctor' ? '医师' : m.fromRole === 'coach' ? '运动师' : m.fromRole === 'dietitian' ? '营养师' : '学员' }}</span>
            </div>
            <div class="rounded-2xl px-3 py-2 text-[10.5px] leading-relaxed shadow-sm" :class="m.fromRole === role ? 'rounded-br-md bg-[#1F6A95] text-white' : 'rounded-bl-md bg-white text-gray-900'">
              {{ m.text }}
            </div>
            <div class="mt-0.5 text-[7.5px] text-gray-400" :class="m.fromRole === role ? 'text-right' : ''">{{ m.time.slice(5, 16) }}</div>
          </div>
        </div>
        <div v-if="!active.messages.length" class="py-16 text-center text-[10px] text-gray-400">还没有沟通记录，发送第一条消息开始随访</div>
      </div>

      <div class="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-gray-100 bg-white/95 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div class="mb-1.5 flex gap-1.5 overflow-x-auto">
          <button v-for="q in quick[role]" :key="q" class="shrink-0 rounded-full bg-[#1F6A95]/8 px-2.5 py-1 text-[9px] font-semibold text-[#1F6A95]" @click="draft = q">{{ q }}</button>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="draft" class="h-9 flex-1 rounded-full border border-gray-200 bg-white px-3 text-[11px] outline-none focus:border-[#1F6A95]/40" placeholder="描述症状、用药或打卡问题…" @keyup.enter="send" />
          <button class="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F6A95] text-white disabled:opacity-40" :disabled="!draft.trim()" @click="send"><Send class="h-4 w-4" /></button>
        </div>
      </div>
    </template>
  </div>
</template>
