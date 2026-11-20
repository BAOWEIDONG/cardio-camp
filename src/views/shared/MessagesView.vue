<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { ChevronLeft, ChevronRight, MessageCircle, Search, Send, Stethoscope, UserRound } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { GenderAvatar, NavBar, RiskBadge } from '../../components/ui';
import type { Student, Thread } from '../../types';

const store = useAppStore();
const roleKey = computed(() => (store.currentUser?.role === 'doctor' ? 'doctor' : store.currentUser?.role === 'coach' ? 'coach' : 'dietitian') as 'doctor' | 'coach' | 'dietitian');
const roleLabel = computed(() => roleKey.value === 'doctor' ? '医师' : roleKey.value === 'coach' ? '运动师' : '营养师');
const list = computed(() => store.myStudents);
const keyword = ref('');
const filtered = computed(() => list.value.filter((s) => !keyword.value || s.name.includes(keyword.value)));
const active = ref<Student | null>(null);
const thread = ref<Thread | null>(null);
const draft = ref('');
const scroller = ref<HTMLElement | null>(null);

function lastOf(sid: string) {
  const t = store.threadFor(sid, roleKey.value);
  return t?.messages[t.messages.length - 1];
}
function unreadOf(sid: string) {
  const t = store.threadFor(sid, roleKey.value);
  return t?.messages.filter((m) => !m.read && m.fromRole === 'student').length || 0;
}
function open(s: Student) {
  active.value = s;
  const t = store.ensureThread(s.id, roleKey.value);
  thread.value = t;
  store.markThreadRead(t.id);
  nextTick(() => scrollBottom());
}
function close() { active.value = null; thread.value = null; }
function scrollBottom() { if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight; }
function send() {
  if (!thread.value || !draft.value.trim()) return;
  store.sendMessage(thread.value.id, draft.value);
  draft.value = '';
  nextTick(() => setTimeout(scrollBottom, 1000));
}
const quick: Record<string, string[]> = {
  doctor: ['请把最近的血压记录发我', '先按原方案用药，不要自行调整', '建议尽快到院复诊，我帮您安排加号'],
  coach: ['今天运动强度控制在目标心率内', '出现胸闷请立即停止并联系医师', '明天开始加一次弹力带训练'],
  dietitian: ['这餐盐分偏高，注意隐形盐', '主食换成杂粮，蛋白质要够', '他汀期间避免西柚汁'],
};
onMounted(() => { /* 首次进入不自动选中，保留列表 */ });
</script>

<template>
  <div class="app-page flat-bg">
    <template v-if="!active">
      <NavBar :title="`${roleLabel}消息`" :on-back="store.back">
        <template #right><span class="text-[9px] text-muted">{{ list.length }} 位学员</span></template>
      </NavBar>
      <div class="page-scroll no-tabbar">
        <div class="px-4 pt-3">
          <div class="flex items-center gap-2 rounded-xl border border-black/[0.05] bg-white/80 px-3 py-2">
            <Search class="h-4 w-4 text-muted/50" />
            <input v-model="keyword" class="flex-1 bg-transparent text-[11px] outline-none" placeholder="搜索学员姓名" />
          </div>
        </div>
        <div class="mt-3 space-y-2 px-4">
          <button v-for="s in filtered" :key="s.id" class="tap flex w-full items-center gap-3 rounded-2xl border border-black/[0.045] bg-white/85 p-3 text-left" @click="open(s)">
            <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
              <GenderAvatar :gender="s.gender" />
              <span v-if="unreadOf(s.id)" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[8px] font-bold text-white">{{ unreadOf(s.id) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[12px] font-extrabold text-ink">{{ s.name }}</span>
                <RiskBadge :risk="s.risk" />
                <span class="ml-auto text-[8.5px] text-muted">{{ lastOf(s.id)?.time.slice(5, 16) || '暂无消息' }}</span>
              </div>
              <div class="mt-0.5 line-clamp-1 text-[9.5px] text-muted">
                <template v-if="lastOf(s.id)">
                  <span v-if="lastOf(s.id)?.fromRole === 'student'" class="font-semibold text-ink/60">学员：</span>
                  {{ lastOf(s.id)?.text }}
                </template>
                <template v-else>点击发起首次沟通</template>
              </div>
            </div>
            <ChevronRight class="h-4 w-4 text-muted/30" />
          </button>
          <div class="flex items-start gap-2 rounded-2xl bg-mist px-3 py-2.5 text-[9px] leading-relaxed text-muted">
            <MessageCircle class="mt-0.5 h-3.5 w-3.5 shrink-0" /> 沟通记录与随访记录互通；涉及用药调整请在随访记录中留痕，避免仅口头沟通。
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="sticky top-0 z-40 border-b border-black/[0.04] bg-white/82 backdrop-blur-xl">
        <div class="flex items-center gap-2 px-3 py-2.5">
          <button class="tap flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04]" @click="close"><ChevronLeft class="h-4 w-4" /></button>
          <div class="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white"><GenderAvatar :gender="active.gender" /></div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5"><span class="text-[12.5px] font-extrabold text-ink">{{ active.name }}</span><RiskBadge :risk="active.risk" /></div>
            <div class="text-[8.5px] text-muted">{{ active.age }} 岁 · {{ active.riskTags.join(' / ') }}</div>
          </div>
          <button class="rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700" @click="close(); store.openStudent(active.id, roleKey === 'doctor' ? 'd-patient' : roleKey === 'coach' ? 'c-student' : 'n-student')">档案</button>
        </div>
      </div>

      <div ref="scroller" class="page-scroll no-tabbar bg-[#f4f8f6] px-3 py-3" style="height: calc(100dvh - 108px); overflow-y: auto;">
        <div class="mb-3 text-center text-[8.5px] text-muted/60">沟通仅限营期健康管理，紧急情况请引导学员拨打 120</div>
        <div v-for="m in thread?.messages" :key="m.id" class="mb-2.5 flex" :class="m.fromRole === 'student' ? 'justify-start' : 'justify-end'">
          <div class="max-w-[82%]">
            <div v-if="m.fromRole === 'student'" class="mb-0.5 flex items-center gap-1 text-[8.5px] text-muted"><span class="font-bold text-ink/60">{{ m.fromName }}</span><span>学员</span></div>
            <div v-else class="mb-0.5 flex items-center justify-end gap-1 text-[8.5px] text-muted">
              <span v-if="m.kind === 'record'" class="pill !px-1 !py-0 !text-[7.5px] pill-blue">随访留痕</span>
              <span v-if="m.kind === 'prescription'" class="pill !px-1 !py-0 !text-[7.5px] pill-brand">处方</span>
              <span class="font-bold text-ink/60">{{ m.fromName }}</span>
            </div>
            <div class="rounded-2xl px-3 py-2 text-[10.5px] leading-relaxed shadow-sm" :class="m.fromRole === 'student' ? 'rounded-bl-md bg-white text-ink' : 'rounded-br-md bg-brand-600 text-white'">
              {{ m.text }}
            </div>
            <div class="mt-0.5 text-[7.5px] text-muted/50" :class="m.fromRole === 'student' ? '' : 'text-right'">{{ m.time.slice(5, 16) }}</div>
          </div>
        </div>
        <div v-if="!thread?.messages.length" class="py-16 text-center text-[10px] text-muted">还没有沟通记录，发送第一条消息开始随访</div>
      </div>

      <div class="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-black/[0.05] bg-white/92 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div class="no-scrollbar mb-1.5 flex gap-1.5 overflow-x-auto">
          <button v-for="q in quick[roleKey]" :key="q" class="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-semibold text-brand-700" @click="draft = q">{{ q }}</button>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="draft" class="h-9 flex-1 rounded-full border border-black/[0.07] bg-white px-3 text-[11px] outline-none focus:border-brand-600/40" placeholder="输入回复，建议同步记录到随访…" @keyup.enter="send" />
          <button class="tap flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-40" :disabled="!draft.trim()" @click="send"><Send class="h-4 w-4" /></button>
        </div>
      </div>
    </template>
  </div>
</template>
