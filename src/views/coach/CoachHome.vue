<script setup lang="ts">
import { computed } from 'vue';
import {
  Activity, AlertTriangle, CalendarClock, ChevronRight, ClipboardList, Dumbbell,
  HeartPulse, Home, MessageCircle, PlayCircle, Plus, Users, Video,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { BottomNav, PageHero, ProgressBar, RiskBadge, SectionHead } from '../../components/ui';
import { DEMO_TODAY, fmtMD, fmtShort, weekdayCN } from '../../lib/date';

const store = useAppStore();
const u = computed(() => store.currentUser!);
const pending = computed(() => store.coachPending);
const students = computed(() => store.myStudents);
const pendingRecords = computed(() => store.data.exerciseRecords
  .filter((r) => students.value.some((s) => s.id === r.studentId) && !r.comments?.length)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5));
const missing = computed(() => students.value.filter((s) => !store.exerciseOf(s.id).some((r) => r.date.startsWith(DEMO_TODAY))).slice(0, 4));
const rxDue = computed(() => store.data.exerciseRxs.filter((r) => students.value.some((s) => s.id === r.studentId)).slice(0, 3));
const unread = computed(() => students.value.reduce((n, s) => n + (store.threadFor(s.id, 'coach')?.messages.filter((m) => !m.read && m.fromRole === 'student').length || 0), 0));
const navItems = [
  { key: 'c-home' as const, label: '工作台', icon: Home },
  { key: 'c-students' as const, label: '学员', icon: Users },
  { key: 'c-courses' as const, label: '课程', icon: PlayCircle },
  { key: 'c-messages' as const, label: '消息', icon: MessageCircle },
];
function studentOf(id: string) { return store.studentById(id); }
</script>

<template>
  <div class="app-page flat-bg">
    <div class="page-scroll pb-[112px]">
      <div class="flex items-center gap-3 px-4 pb-3 pt-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-500 text-white"><Dumbbell class="h-5 w-5" /></div>
        <div class="min-w-0 flex-1">
          <div class="text-[10px] text-muted">{{ weekdayCN(DEMO_TODAY) }} · {{ fmtShort(DEMO_TODAY) }}</div>
          <div class="text-[15px] font-extrabold text-ink">{{ u.name }} 运动康复师</div>
          <div class="text-[9px] text-muted">心脏康复中心 · 北京大学国际医院</div>
        </div>
        <button class="tap relative flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm" @click="store.setView('c-messages')">
          <MessageCircle class="h-[18px] w-[18px] text-ink/70" />
          <span v-if="unread" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[8px] font-bold text-white">{{ unread }}</span>
        </button>
      </div>

      <div class="px-4">
        <PageHero variant="coach" eyebrow="EXERCISE REHAB WORKBENCH" :title="`今天有 ${pending.comments} 条运动待批注`" sub="批注运动记录、跟进未打卡学员、复评运动处方。">
          <template #right>
            <div class="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-center backdrop-blur min-w-[64px] whitespace-nowrap">
              <div class="text-[18px] font-extrabold leading-none">{{ students.length }}</div>
              <div class="mt-1 text-[8px] text-white/60">在管学员</div>
            </div>
          </template>
          <div class="grid grid-cols-3 gap-2">
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('c-students')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><ClipboardList class="h-3 w-3" /> 待批注</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.comments }}</div>
            </button>
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('c-students')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><Activity class="h-3 w-3" /> 今日未打卡</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.missing }}</div>
            </button>
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('c-rx')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><CalendarClock class="h-3 w-3" /> 处方复评</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.rx }}</div>
            </button>
          </div>
        </PageHero>
      </div>

      <div class="mt-3 grid grid-cols-4 gap-2 px-4">
        <button v-for="a in [
          { l: '学员列表', i: Users, v: 'c-students' as const, tone: 'bg-coral-50 text-coral-500' },
          { l: '运动处方', i: Dumbbell, v: 'c-rx' as const, tone: 'bg-brand-50 text-brand-700' },
          { l: '跟练课程', i: Video, v: 'c-courses' as const, tone: 'bg-[#EDF5FA] text-[#2C7DA0]' },
          { l: '消息', i: MessageCircle, v: 'c-messages' as const, tone: 'bg-amber-50 text-amber-600' },
        ]" :key="a.l" class="tap flex flex-col items-center gap-1.5 rounded-2xl border border-black/[0.04] bg-white/80 py-3" @click="store.setView(a.v)">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="a.tone"><component :is="a.i" class="h-4 w-4" /></span>
          <span class="text-[9.5px] font-bold text-ink">{{ a.l }}</span>
        </button>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="待批注运动" sub="近 3 天 · 逐条批注并评分">
          <template #icon><ClipboardList class="h-4 w-4 text-coral-500" /></template>
          <template #action><button class="text-[10.5px] font-bold text-brand-700" @click="store.setView('c-students')">全部</button></template>
        </SectionHead>
        <div class="space-y-2">
          <button v-for="r in pendingRecords" :key="r.id" class="tap soft-card w-full rounded-2xl p-3 text-left" @click="store.openStudent(r.studentId, 'c-student')">
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50 text-coral-500"><Dumbbell class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5"><span class="text-[11px] font-extrabold text-ink">{{ studentOf(r.studentId)?.name }}</span><RiskBadge :risk="studentOf(r.studentId)?.risk || 'medium'" /></div>
                <div class="mt-0.5 text-[9px] text-muted">{{ r.type }} · {{ r.duration }} 分钟 · 心率 {{ r.hrAvg }} · 强度 {{ r.intensity }}/5</div>
              </div>
              <span class="text-[8.5px] text-muted">{{ fmtMD(r.date) }}</span>
            </div>
            <div v-if="r.symptoms?.length" class="mt-1.5 flex gap-1"><span v-for="sy in r.symptoms" :key="sy" class="pill pill-coral">{{ sy }}</span></div>
          </button>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="今日未打卡" sub="需提醒的学员" >
          <template #icon><AlertTriangle class="h-4 w-4 text-amber-500" /></template>
        </SectionHead>
        <div class="grid grid-cols-2 gap-2">
          <button v-for="p in missing" :key="p.id" class="tap soft-card flex items-center gap-2 rounded-2xl p-2.5 text-left" @click="store.openStudent(p.id, 'c-student')">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[10px] font-extrabold text-amber-700">{{ p.name.slice(0, 1) }}</span>
            <div class="min-w-0 flex-1"><div class="text-[10.5px] font-bold text-ink">{{ p.name }}</div><div class="text-[8.5px] text-muted">今日未运动</div></div>
          </button>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="处方复评提醒" sub="评估后调整强度">
          <template #icon><CalendarClock class="h-4 w-4 text-brand-600" /></template>
        </SectionHead>
        <div class="glass-card divide-y divide-black/[0.045] overflow-hidden rounded-2xl">
          <button v-for="r in rxDue" :key="r.id" class="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left" @click="store.openStudent(r.studentId, 'c-rx')">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><HeartPulse class="h-3.5 w-3.5" /></span>
            <div class="min-w-0 flex-1"><div class="text-[10.5px] font-bold text-ink">{{ studentOf(r.studentId)?.name }}</div><div class="text-[8.5px] text-muted">{{ r.aerobic.mode }} · HR {{ r.aerobic.hrLow }}–{{ r.aerobic.hrHigh }}</div></div>
            <span class="text-[8.5px] font-bold text-coral-500">复评 {{ r.reviewDate.slice(5) }}</span>
          </button>
        </div>
      </div>
    </div>

    <BottomNav anchor="c-home" :items="navItems" :badge="unread" :badge-index="3" variant="coral" />
  </div>
</template>
