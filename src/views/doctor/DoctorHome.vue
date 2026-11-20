<script setup lang="ts">
import { computed } from 'vue';
import {
  Activity, AlertTriangle, CalendarClock, ChevronRight, ClipboardCheck, FileHeart,
  HeartPulse, Home, MessageCircle, Pill, Siren, Stethoscope, Users, Video, ArrowUpRight,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { BottomNav, PageHero, ProgressBar, RiskBadge, SectionHead, Sparkline } from '../../components/ui';
import { DEMO_TODAY, fmtShort, weekdayCN } from '../../lib/date';

const store = useAppStore();
const u = computed(() => store.currentUser!);
const pending = computed(() => store.doctorPending);
const openAlerts = computed(() => store.data.alerts.filter((a) => a.status === 'open'));
const patients = computed(() => store.myStudents);
const dueList = computed(() => patients.value
  .map((s) => ({ s, fu: store.followupsOf(s.id)[0] }))
  .filter((x) => x.fu)
  .sort((a, b) => a.fu!.nextDate.localeCompare(b.fu!.nextDate))
  .slice(0, 4));
const ecgPatients = computed(() => patients.value.filter((s) => s.risk === 'very_high' || s.risk === 'high').slice(0, 2));

const navItems = [
  { key: 'd-home' as const, label: '工作台', icon: Home },
  { key: 'd-patients' as const, label: '患者', icon: Users },
  { key: 'd-alerts' as const, label: '预警', icon: Siren },
  { key: 'd-messages' as const, label: '消息', icon: MessageCircle },
];
const unread = computed(() => patients.value.reduce((n, s) => n + (store.threadFor(s.id, 'doctor')?.messages.filter((m) => !m.read && m.fromRole === 'student').length || 0), 0));
function mini(sid: string) { return store.bpOf(sid).filter((r) => r.period === 'morning').slice(-8).map((r) => r.sbp); }
</script>

<template>
  <div class="app-page flat-bg">
    <div class="page-scroll pb-[112px]">
      <div class="flex items-center gap-3 px-4 pb-3 pt-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F5C6B] text-white"><Stethoscope class="h-5 w-5" /></div>
        <div class="min-w-0 flex-1">
          <div class="text-[10px] text-muted">{{ weekdayCN(DEMO_TODAY) }} · {{ fmtShort(DEMO_TODAY) }}</div>
          <div class="text-[15px] font-extrabold text-ink">{{ u.name }} 主任医师</div>
          <div class="text-[9px] text-muted">心内科 · 北京大学国际医院</div>
        </div>
        <button class="tap relative flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm" @click="store.setView('d-messages')">
          <MessageCircle class="h-[18px] w-[18px] text-ink/70" />
          <span v-if="unread" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[8px] font-bold text-white">{{ unread }}</span>
        </button>
      </div>

      <div class="px-4">
        <PageHero variant="doctor" eyebrow="PHYSICIAN WORKBENCH" :title="`今天有 ${dueList.length} 位患者待随访`" sub="入营审核、危急值预警与随访逾期，按风险优先级排列。">
          <template #right>
            <div class="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-center backdrop-blur min-w-[64px] whitespace-nowrap">
              <div class="text-[18px] font-extrabold leading-none">{{ patients.length }}</div>
              <div class="mt-1 text-[8px] text-white/60">在管患者</div>
            </div>
          </template>
          <div class="grid grid-cols-3 gap-2">
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('d-followup')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><CalendarClock class="h-3 w-3" /> 待随访</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.due }}</div>
            </button>
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('d-alerts')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><AlertTriangle class="h-3 w-3" /> 预警</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.alerts }}</div>
            </button>
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('d-review')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><ClipboardCheck class="h-3 w-3" /> 待审核</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.review }}</div>
            </button>
          </div>
        </PageHero>
      </div>

      <!-- 快捷 -->
      <div class="mt-3 grid grid-cols-4 gap-2 px-4">
        <button v-for="a in [
          { l: '患者列表', i: Users, v: 'd-patients' as const, tone: 'bg-[#EAF3F5] text-[#0F5C6B]' },
          { l: '随访计划', i: CalendarClock, v: 'd-followup' as const, tone: 'bg-brand-50 text-brand-700' },
          { l: '预警中心', i: Siren, v: 'd-alerts' as const, tone: 'bg-coral-50 text-coral-500' },
          { l: '入营审核', i: ClipboardCheck, v: 'd-review' as const, tone: 'bg-amber-50 text-amber-600' },
        ]" :key="a.l" class="tap flex flex-col items-center gap-1.5 rounded-2xl border border-black/[0.04] bg-white/80 py-3" @click="store.setView(a.v)">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="a.tone"><component :is="a.i" class="h-4 w-4" /></span>
          <span class="text-[9.5px] font-bold text-ink">{{ a.l }}</span>
        </button>
      </div>

      <!-- 待随访 -->
      <div class="mt-4 px-4">
        <SectionHead title="待随访患者" sub="按计划日期排序 · 逾期标红">
          <template #icon><CalendarClock class="h-4 w-4 text-[#0F5C6B]" /></template>
          <template #action><button class="text-[10.5px] font-bold text-brand-700" @click="store.setView('d-followup')">全部</button></template>
        </SectionHead>
        <div class="space-y-2">
          <button v-for="d in dueList" :key="d.s.id" class="tap soft-card w-full rounded-2xl p-3 text-left" @click="store.openStudent(d.s.id, 'd-patient')">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3F5] text-[10px] font-extrabold text-[#0F5C6B]">{{ d.s.name.slice(0, 1) }}</div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5"><span class="text-[12px] font-extrabold text-ink">{{ d.s.name }}</span><RiskBadge :risk="d.s.risk" /></div>
                <div class="mt-0.5 text-[9px] text-muted">上次{{ d.fu?.type }} {{ fmtShort(d.fu?.date || '') }} · 下次 {{ fmtShort(d.fu?.nextDate || '') }}</div>
              </div>
              <span class="pill" :class="(d.fu?.nextDate || '') < DEMO_TODAY ? 'pill-coral' : 'pill-amber'">{{ (d.fu?.nextDate || '') < DEMO_TODAY ? '已逾期' : '近期' }}</span>
            </div>
            <div class="mt-2 flex items-center gap-2 border-t border-black/[0.04] pt-2">
              <span class="text-[9px] text-muted">血压 {{ d.fu?.sbp }}/{{ d.fu?.dbp }}</span>
              <span class="text-[9px] text-muted">心率 {{ d.fu?.hr }}</span>
              <span class="ml-auto text-[9px] font-bold text-brand-700">查看档案 ›</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 预警 -->
      <div class="mt-4 px-4">
        <SectionHead title="实时预警" sub="危急值优先 · 需当日处理">
          <template #icon><Siren class="h-4 w-4 text-coral-500" /></template>
          <template #action><button class="text-[10.5px] font-bold text-coral-500" @click="store.setView('d-alerts')">全部 {{ openAlerts.length }}</button></template>
        </SectionHead>
        <div class="space-y-1.5">
          <button v-for="a in openAlerts.slice(0, 3)" :key="a.id" class="tap flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left" :class="a.level === 'high' ? 'border-coral-200/60 bg-coral-50/70' : 'border-amber-200/50 bg-amber-50/50'" @click="store.setView('d-alerts')">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg" :class="a.level === 'high' ? 'bg-coral-500 text-white' : 'bg-amber-500 text-white'"><AlertTriangle class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1">
              <div class="text-[10.5px] font-bold text-ink">{{ a.studentName }} · {{ a.type }}</div>
              <div class="text-[9px] text-muted">{{ a.value }} · {{ a.time.slice(5, 16) }}</div>
            </div>
            <ChevronRight class="h-3.5 w-3.5 text-muted/40" />
          </button>
        </div>
      </div>

      <!-- 心电监测 -->
      <div class="mt-4 px-4">
        <SectionHead title="72 小时心电监测" sub="入营评估期 · 异常自动预警">
          <template #icon><Activity class="h-4 w-4 text-[#0F5C6B]" /></template>
        </SectionHead>
        <div class="glass-card rounded-2xl p-3.5">
          <div v-for="p in ecgPatients" :key="p.id" class="border-b border-black/[0.04] py-2 first:pt-0 last:border-0 last:pb-0">
            <div class="flex items-center gap-2">
              <span class="text-[10.5px] font-bold text-ink">{{ p.name }}</span>
              <RiskBadge :risk="p.risk" />
              <span class="ml-auto text-[8.5px] text-muted">佩戴 {{ p.id === 's2' ? 46 : 22 }} 小时</span>
            </div>
            <div class="mt-1 flex items-center gap-2">
              <svg viewBox="0 0 180 24" class="h-6 flex-1 text-[#0F5C6B]" preserveAspectRatio="none">
                <path d="M0 12 H30 L34 12 L38 4 L42 20 L46 9 L50 12 H78 L82 12 L86 6 L90 18 L94 10 L98 12 H128 L132 12 L136 5 L140 19 L144 9 L148 12 H180" fill="none" stroke="currentColor" stroke-width="1.2" />
              </svg>
              <span class="text-[8px] font-bold" :class="p.id === 's2' ? 'text-coral-500' : 'text-brand-600'">{{ p.id === 's2' ? '偶发房早 12 次' : '未见异常' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 风险分布 -->
      <div class="mt-4 px-4">
        <SectionHead title="在管患者风险分层" sub="高危以上占比 66%" />
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex gap-1.5">
            <div v-for="r in [
              { l: '低危', n: patients.filter((p) => p.risk === 'low').length, c: 'bg-[#2FA36B]' },
              { l: '中危', n: patients.filter((p) => p.risk === 'medium').length, c: 'bg-[#D99A2B]' },
              { l: '高危', n: patients.filter((p) => p.risk === 'high').length, c: 'bg-[#D9553E]' },
              { l: '很高危', n: patients.filter((p) => p.risk === 'very_high').length, c: 'bg-[#B2382B]' },
            ]" :key="r.l" class="flex-1">
              <div class="h-1.5 rounded-full" :class="r.c" :style="{ opacity: r.n ? 1 : 0.2 }" />
              <div class="mt-1 text-center text-[8.5px] text-muted">{{ r.l }} {{ r.n }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 px-4 pb-4">
        <button class="tap flex w-full items-center gap-2.5 rounded-2xl border border-[#0F5C6B]/15 bg-[#EAF3F5]/70 px-3.5 py-3 text-left" @click="store.setView('d-review')">
          <ClipboardCheck class="h-4 w-4 text-[#0F5C6B]" />
          <div class="flex-1 text-[10px] text-[#0F5C6B]"><b>3 份入营材料待审核</b> · 含 1 份动态心电异常</div>
          <ArrowUpRight class="h-4 w-4 text-[#0F5C6B]/50" />
        </button>
      </div>
    </div>

    <BottomNav anchor="d-home" :items="navItems" :badge="unread" :badge-index="3" variant="ink" />
  </div>
</template>
