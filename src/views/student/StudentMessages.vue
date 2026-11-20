<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import {
  Bell, ChevronLeft, ChevronRight, FileHeart, HeartPulse, Home, MessageCircle, Send,
  Stethoscope, Trophy, UserRound, CheckCheck, ClipboardList, Megaphone, AlertTriangle, Dumbbell, Leaf,
} from 'lucide-vue-next';
import { showToast } from 'vant';
import { useAppStore } from '../../store/app';
import { BottomNav, NavBar } from '../../components/ui';
import type { Message, Notice, Thread } from '../../types';
import { fmtShort } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const tab = ref<'notice' | 'chat'>('notice');
const activeThread = ref<Thread | null>(null);
const draft = ref('');
const scroller = ref<HTMLElement | null>(null);
const unread = computed(() => store.unreadCount(sid.value));
const notices = computed(() => store.noticesFor(sid.value));
const threads = computed(() => store.threadsFor(sid.value));

const noticeIcon: Record<Notice['category'], any> = {
  comment: MessageCircle, prescription: ClipboardList, system: Megaphone,
  followup: Stethoscope, alert: AlertTriangle, activity: Trophy,
};
const noticeTone: Record<Notice['category'], string> = {
  comment: 'bg-brand-50 text-brand-700', prescription: 'bg-[#EDF5FA] text-[#2C7DA0]',
  system: 'bg-black/[0.04] text-muted', followup: 'bg-[#EDF3F8] text-[#144E73]',
  alert: 'bg-coral-50 text-coral-500', activity: 'bg-amber-50 text-amber-600',
};

function openThread(t: Thread) {
  activeThread.value = t;
  store.markThreadRead(t.id);
  nextTick(() => { if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight; });
}
function send() {
  if (!activeThread.value || !draft.value.trim()) return;
  store.sendMessage(activeThread.value.id, draft.value);
  draft.value = '';
  nextTick(() => { if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight; });
}
function markRead(n: Notice) {
  if (!n.read) store.markNoticeRead(n.id);
  if (n.category === 'followup') store.setView('s-followup');
  else if (n.category === 'prescription') store.setView('s-prescription');
}
const quick = ['收到，谢谢', '今天血压已记录', '运动后有点累，正常吗？'];
const navItems = [
  { key: 's-home' as const, label: '首页', icon: Home },
  { key: 's-activity' as const, label: '活动', icon: Trophy },
  { key: 's-messages' as const, label: '消息', icon: Bell },
  { key: 's-profile' as const, label: '档案', icon: FileHeart },
];
watch(() => store.currentView, () => { if (store.currentView !== 's-messages') activeThread.value = null; });
function threadIcon(t: Thread) {
  if (t.members.some((m) => m.role === 'doctor')) return Stethoscope;
  if (t.members.some((m) => m.role === 'coach')) return Dumbbell;
  return Leaf;
}
function threadTone(t: Thread) {
  if (t.members.some((m) => m.role === 'doctor')) return 'bg-[#EDF3F8] text-[#144E73]';
  if (t.members.some((m) => m.role === 'coach')) return 'bg-coral-50 text-coral-500';
  return 'bg-[#EDF5FA] text-[#2C7DA0]';
}
function lastMsg(t: Thread) { return t.messages[t.messages.length - 1]; }
function msgUnread(t: Thread) { return t.messages.filter((m) => !m.read && m.fromRole !== 'student').length; }
function roleName(r: Message['fromRole']) {
  return r === 'doctor' ? '医师' : r === 'coach' ? '运动师' : r === 'dietitian' ? '营养师' : '系统';
}
</script>

<template>
  <div class="app-page flat-bg">
    <template v-if="!activeThread">
      <NavBar title="消息中心" :on-back="store.back">
        <template #right>
          <button class="text-[10px] font-bold text-brand-700" @click="store.markAllNoticesRead(sid); showToast('已全部标为已读')">全部已读</button>
        </template>
      </NavBar>

      <div class="page-scroll pb-[112px]">
        <div class="px-4 pt-3">
          <div class="seg-tabs">
            <button class="seg-tab" :class="tab === 'notice' ? 'active' : ''" @click="tab = 'notice'">通知 <span v-if="store.unreadNotices(sid)" class="ml-0.5 rounded-full bg-coral-500 px-1 text-[8px] text-white">{{ store.unreadNotices(sid) }}</span></button>
            <button class="seg-tab" :class="tab === 'chat' ? 'active' : ''" @click="tab = 'chat'">沟通 <span v-if="store.unreadMessages(sid)" class="ml-0.5 rounded-full bg-coral-500 px-1 text-[8px] text-white">{{ store.unreadMessages(sid) }}</span></button>
          </div>
        </div>

        <!-- 通知 -->
        <div v-if="tab === 'notice'" class="mt-3 space-y-2 px-4">
          <button v-for="n in notices" :key="n.id" class="tap w-full rounded-2xl border bg-white/85 p-3 text-left" :class="n.read ? 'border-black/[0.045]' : 'border-brand-600/15 shadow-[0_8px_22px_-16px_rgba(8,63,57,.4)]'" @click="markRead(n)">
            <div class="flex items-start gap-2.5">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" :class="noticeTone[n.category]"><component :is="noticeIcon[n.category]" class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="truncate text-[11.5px] font-extrabold text-ink">{{ n.title }}</span>
                  <span v-if="!n.read" class="h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
                  <span class="ml-auto shrink-0 text-[8.5px] text-muted">{{ n.time.slice(5, 16) }}</span>
                </div>
                <div class="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted">{{ n.body }}</div>
              </div>
            </div>
          </button>
          <div v-if="!notices.length" class="py-16 text-center text-[11px] text-muted">暂无通知</div>
        </div>

        <!-- 沟通列表 -->
        <div v-else class="mt-3 space-y-2 px-4">
          <button v-for="t in threads" :key="t.id" class="tap flex w-full items-center gap-3 rounded-2xl border border-black/[0.045] bg-white/85 p-3.5 text-left" @click="openThread(t)">
            <div class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full" :class="threadTone(t)">
              <component :is="threadIcon(t)" class="h-5 w-5" />
              <span v-if="msgUnread(t)" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[8px] font-bold text-white">{{ msgUnread(t) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="truncate text-[12px] font-extrabold text-ink">{{ t.title }}</span>
                <span class="ml-auto shrink-0 text-[8.5px] text-muted">{{ lastMsg(t)?.time.slice(5, 16) }}</span>
              </div>
              <div class="mt-0.5 line-clamp-1 text-[10px] text-muted">
                <span v-if="lastMsg(t)?.kind === 'prescription'" class="font-semibold text-brand-700">[处方] </span>
                <span v-if="lastMsg(t)?.kind === 'record'" class="font-semibold text-[#144E73]">[随访记录] </span>
                {{ lastMsg(t)?.text }}
              </div>
            </div>
            <ChevronRight class="h-4 w-4 text-muted/30" />
          </button>
          <div class="flex items-center gap-2 rounded-2xl bg-mist px-3 py-2.5 text-[9px] leading-relaxed text-muted">
            <UserRound class="h-3.5 w-3.5 shrink-0" /> 三师共管团队在线答疑；随访与用药调整会以「随访记录」留痕，可追溯到医师与时间。
          </div>
        </div>
      </div>

      <BottomNav anchor="s-messages" :items="navItems" :badge="unread" :badge-index="2" />
    </template>

    <!-- 聊天 -->
    <template v-else>
      <div class="sticky top-0 z-40 border-b border-black/[0.04] bg-white/82 backdrop-blur-xl">
        <div class="flex items-center gap-2 px-3 py-2.5">
          <button class="tap flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04]" @click="activeThread = null"><ChevronLeft class="h-4 w-4" /></button>
          <div class="flex h-9 w-9 items-center justify-center rounded-full" :class="threadTone(activeThread)"><component :is="threadIcon(activeThread)" class="h-4 w-4" /></div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-[12.5px] font-extrabold text-ink">{{ activeThread.title }}</div>
            <div class="text-[8.5px] text-brand-600">● 在线 · 消息全程留痕</div>
          </div>
        </div>
      </div>

      <div ref="scroller" class="page-scroll no-tabbar bg-[#f4f8f6] px-3 py-3" style="height: calc(100dvh - 112px); overflow-y: auto;">
        <div class="mb-3 text-center text-[8.5px] text-muted/60">营期沟通记录将同步至随访档案，请如实描述身体状况</div>
        <div v-for="m in activeThread.messages" :key="m.id" class="mb-2.5 flex" :class="m.fromRole === 'student' ? 'justify-end' : 'justify-start'">
          <div class="max-w-[82%]">
            <div v-if="m.fromRole !== 'student'" class="mb-0.5 flex items-center gap-1 text-[8.5px] text-muted">
              <span class="font-bold text-ink/60">{{ m.fromName }}</span><span>{{ roleName(m.fromRole) }}</span>
              <span v-if="m.kind === 'record'" class="pill !px-1 !py-0 !text-[7.5px] pill-blue">随访留痕</span>
              <span v-if="m.kind === 'prescription'" class="pill !px-1 !py-0 !text-[7.5px] pill-brand">处方</span>
            </div>
            <div
              class="rounded-2xl px-3 py-2 text-[10.5px] leading-relaxed shadow-sm"
              :class="m.fromRole === 'student' ? 'rounded-br-md bg-brand-600 text-white' : m.kind === 'record' ? 'rounded-bl-md border border-[#2C7DA0]/15 bg-[#EDF5FA] text-ink' : 'rounded-bl-md bg-white text-ink'"
            >
              {{ m.text }}
            </div>
            <div class="mt-0.5 text-[7.5px] text-muted/50" :class="m.fromRole === 'student' ? 'text-right' : ''">{{ m.time.slice(5, 16) }}</div>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-black/[0.05] bg-white/92 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div class="no-scrollbar mb-1.5 flex gap-1.5 overflow-x-auto">
          <button v-for="q in quick" :key="q" class="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-semibold text-brand-700" @click="draft = q">{{ q }}</button>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="draft" class="h-9 flex-1 rounded-full border border-black/[0.07] bg-white px-3 text-[11px] outline-none focus:border-brand-600/40" placeholder="描述症状、用药或打卡问题…" @keyup.enter="send" />
          <button class="tap flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-40" :disabled="!draft.trim()" @click="send"><Send class="h-4 w-4" /></button>
        </div>
      </div>
    </template>
  </div>
</template>
