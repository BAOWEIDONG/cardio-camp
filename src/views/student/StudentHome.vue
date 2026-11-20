<script setup lang="ts">
import { computed } from 'vue';
import {
  Activity, Bell, CalendarDays, ChevronRight, ClipboardCheck, Droplets, Dumbbell,
  Flame, Flower2, HeartPulse, Home, Leaf, MessageCircle, Pill, Salad, Scale, Stethoscope,
  Target, TrendingDown, Trophy, UtensilsCrossed, FileHeart, Siren, ArrowUpRight,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { BottomNav, GenderAvatar, PageHero, ProgressBar, RingProgress, RiskBadge, SectionHead, Sparkline } from '../../components/ui';
import { DEMO_TODAY, fmtShort, weekdayCN } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sum = computed(() => store.summary(s.value.id));
const bp = computed(() => store.bpAvg(s.value.id, 7));
const latest = computed(() => store.latestBp(s.value.id));
const weight = computed(() => store.latestWeight(s.value.id));
const team = computed(() => store.careTeam(s.value.id));
const unread = computed(() => store.unreadCount(s.value.id));
const rxEx = computed(() => store.data.exerciseRxs.find((r) => r.studentId === s.value.id));
const rxNu = computed(() => store.data.nutritionRxs.find((r) => r.studentId === s.value.id));
const activeActs = computed(() => store.data.activities.filter((a) => a.status === 'active').slice(0, 3));
const nextFu = computed(() => store.followupsOf(s.value.id)[0]);
const done = computed(() => sum.value.done);

const doneCount = computed(() => [done.value.bp, done.value.med, done.value.ex, done.value.diet].filter(Boolean).length);
const todayPct = computed(() => Math.round((doneCount.value / 4) * 100));

const bpSeries = computed(() => store.bpOf(s.value.id).filter((r) => r.period === 'morning').slice(-10).map((r) => r.sbp));
const weightSeries = computed(() => store.weightOf(s.value.id).slice(-10).map((r) => r.weight));

const tasks = computed(() => [
  { key: 'bp', label: '家庭血压', desc: done.value.bp ? '今日已记录' : '早晚各一次', icon: HeartPulse, done: done.value.bp, view: 's-checkin' as const, tone: 'text-coral-500 bg-coral-50' },
  { key: 'med', label: '按时用药', desc: done.value.med ? '今日已服药' : '晨服 / 睡前', icon: Pill, done: done.value.med, view: 's-checkin' as const, tone: 'text-[#2C7DA0] bg-[#EDF5FA]' },
  { key: 'ex', label: '运动处方', desc: done.value.ex ? '今日已完成' : '快走 30 分钟', icon: Dumbbell, done: done.value.ex, view: 's-checkin' as const, tone: 'text-brand-700 bg-brand-50' },
  { key: 'diet', label: '三餐打卡', desc: done.value.diet ? '三餐已完成' : '低盐 DASH 饮食', icon: Salad, done: done.value.diet, view: 's-checkin' as const, tone: 'text-amber-600 bg-[#fbf3e2]' },
]);

const navItems = [
  { key: 's-home' as const, label: '首页', icon: Home },
  { key: 's-activity' as const, label: '活动', icon: Trophy },
  { key: 's-messages' as const, label: '消息', icon: Bell },
  { key: 's-profile' as const, label: '档案', icon: FileHeart },
];

const latestNotice = computed(() => store.noticesFor(s.value.id).find((n) => !n.read));
</script>

<template>
  <div class="app-page flat-bg">
    <div class="page-scroll pb-[112px]">
      <!-- 顶部 -->
      <div class="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <div class="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white">
          <GenderAvatar :gender="s.gender" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[10.5px] text-muted">{{ weekdayCN(DEMO_TODAY) }} · {{ fmtShort(DEMO_TODAY) }}</div>
          <div class="truncate text-[15px] font-extrabold text-ink">早上好，{{ s.name }}</div>
        </div>
        <button class="tap relative flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm" @click="store.setView('s-messages')">
          <Bell class="h-[18px] w-[18px] text-ink/70" />
          <span v-if="unread" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[8px] font-bold text-white">{{ unread }}</span>
        </button>
      </div>

      <!-- Hero -->
      <div class="px-4">
        <PageHero
          eyebrow="CARDIO CAMP · DAY 18 / 365"
          title="今天也要稳稳的"
          sub="21 天强化期进入第 3 周，血压和运动依从都在向好。"
        >
          <template #right>
            <div class="flex flex-col items-end gap-1">
              <RiskBadge :risk="s.risk" size="md" />
              <span class="text-[9px] text-white/60">风险分层</span>
            </div>
          </template>

          <div class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <RingProgress :value="store.intensiveDay" :max="21" :size="74" :stroke="7" color="#ffffff" track="rgba(255,255,255,.18)">
              <div class="text-[20px] font-extrabold leading-none tabular">{{ store.intensiveDay }}</div>
              <div class="mt-0.5 text-[8px] text-white/65">/ 21 天</div>
            </RingProgress>
            <div class="min-w-0 flex-1">
              <div class="text-[10px] text-white/65">强化期进度</div>
              <div class="mt-0.5 text-[13px] font-bold">还有 {{ store.daysToIntensiveEnd }} 天转入长期管理</div>
              <div class="mt-2 grid grid-cols-3 gap-1.5">
                <div>
                  <div class="text-[17px] font-extrabold leading-none tabular">{{ bp?.sbp ?? '—' }}<span class="text-[9px] font-semibold text-white/60">/{{ bp?.dbp ?? '—' }}</span></div>
                  <div class="mt-1 text-[8.5px] text-white/55">7 日平均血压</div>
                </div>
                <div>
                  <div class="text-[17px] font-extrabold leading-none tabular">{{ sum.streak }}<span class="text-[9px] font-semibold text-white/60">天</span></div>
                  <div class="mt-1 text-[8.5px] text-white/55">连续达标</div>
                </div>
                <div>
                  <div class="text-[17px] font-extrabold leading-none tabular">{{ sum.flowers }}<span class="text-[9px] font-semibold text-white/60">朵</span></div>
                  <div class="mt-1 text-[8.5px] text-white/55">可用小红花</div>
                </div>
              </div>
            </div>
          </div>
        </PageHero>
      </div>

      <!-- 今日任务 -->
      <div class="mt-4 px-4">
        <SectionHead title="今日任务" :sub="`${doneCount}/4 已完成 · 完成后自动累计小红花`">
          <template #icon><ClipboardCheck class="h-4 w-4 text-brand-600" /></template>
          <template #action>
            <button class="tap flex items-center gap-0.5 text-[11px] font-bold text-brand-700" @click="store.setView('s-calendar')">
              日历 <CalendarDays class="h-3.5 w-3.5" />
            </button>
          </template>
        </SectionHead>
        <div class="grid grid-cols-2 gap-2">
          <button v-for="t in tasks" :key="t.key" class="tap soft-card flex items-center gap-2.5 rounded-2xl p-3 text-left" @click="store.setView(t.view)">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" :class="t.tone">
              <component :is="t.icon" class="h-[18px] w-[18px]" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1">
                <span class="truncate text-[12px] font-extrabold text-ink">{{ t.label }}</span>
                <span v-if="t.done" class="pill pill-green !px-1.5 !py-0 !text-[8px]">已完成</span>
              </div>
              <div class="mt-0.5 truncate text-[9.5px] text-muted">{{ t.desc }}</div>
            </div>
          </button>
        </div>
        <div class="mt-2 flex items-center gap-2 rounded-2xl border border-brand-600/10 bg-brand-50/70 px-3 py-2">
          <div class="text-[10px] font-bold text-brand-800">今日完成度</div>
          <div class="flex-1"><ProgressBar :value="todayPct" :height="5" /></div>
          <div class="text-[11px] font-extrabold text-brand-700 tabular">{{ todayPct }}%</div>
        </div>
      </div>

      <!-- 指标趋势 -->
      <div class="mt-4 px-4">
        <SectionHead title="指标趋势" sub="开营 18 天 · 家庭自测 + 入企筛查">
          <template #icon><Activity class="h-4 w-4 text-coral-500" /></template>
          <template #action>
            <button class="tap flex items-center gap-0.5 text-[11px] font-bold text-brand-700" @click="store.setView('s-profile')">
              完整档案 <ChevronRight class="h-3.5 w-3.5" />
            </button>
          </template>
        </SectionHead>
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[10.5px] text-muted">收缩压（7 日平均）</div>
              <div class="mt-1 flex items-end gap-1">
                <span class="stat-num text-[28px] text-ink">{{ bp?.sbp ?? '—' }}</span>
                <span class="mb-1 text-[10px] font-semibold text-muted">mmHg</span>
                <span v-if="sum.sbpDrop !== null" class="mb-1 ml-1 flex items-center gap-0.5 text-[10px] font-bold text-brand-600">
                  <TrendingDown class="h-3 w-3" />↓{{ sum.sbpDrop }}
                </span>
              </div>
              <div class="mt-1 text-[9.5px] text-muted">目标 <b class="text-brand-700">{{ s.targets.sbp }}</b> mmHg · 还差 {{ Math.max(0, (bp?.sbp || s.targets.sbp) - s.targets.sbp) }} mmHg</div>
            </div>
            <Sparkline :points="bpSeries" :width="118" :height="42" color="#D9553E" />
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2 border-t border-black/[0.05] pt-3">
            <div>
              <div class="text-[9px] text-muted">体重</div>
              <div class="mt-0.5 text-[15px] font-extrabold tabular">{{ weight?.weight ?? '—' }}<span class="text-[9px] text-muted">kg</span></div>
              <div class="text-[8.5px] font-semibold text-brand-600">↓{{ sum.weightDrop ?? 0 }} kg</div>
            </div>
            <div>
              <div class="text-[9px] text-muted">LDL-C</div>
              <div class="mt-0.5 text-[15px] font-extrabold tabular">4.62<span class="text-[9px] text-muted">mmol/L</span></div>
              <div class="text-[8.5px] font-semibold text-coral-500">待第 6 月复筛</div>
            </div>
            <div>
              <div class="text-[9px] text-muted">用药依从</div>
              <div class="mt-0.5 text-[15px] font-extrabold tabular">{{ sum.adherence.med }}<span class="text-[9px] text-muted">%</span></div>
              <div class="text-[8.5px] font-semibold text-brand-600">近 7 日</div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-1 rounded-xl bg-[#fdf6ef] px-2.5 py-1.5 text-[9px] text-[#8a641f]">
            <Siren class="h-3 w-3 shrink-0" /> 如出现胸闷胸痛、收缩压 ≥180 或静息心率 ≥110，请立即停止运动并联系医师。
          </div>
        </div>
      </div>

      <!-- 处方 -->
      <div class="mt-4 px-4">
        <SectionHead title="我的双处方" sub="医师评估后由运动师 / 营养师制定">
          <template #icon><Stethoscope class="h-4 w-4 text-brand-600" /></template>
          <template #action>
            <button class="tap flex items-center gap-0.5 text-[11px] font-bold text-brand-700" @click="store.setView('s-prescription')">
              查看详情 <ChevronRight class="h-3.5 w-3.5" />
            </button>
          </template>
        </SectionHead>
        <div class="space-y-2">
          <button class="tap soft-card flex w-full items-center gap-3 rounded-2xl p-3 text-left" @click="store.setView('s-prescription')">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Dumbbell class="h-5 w-5" /></div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[12.5px] font-extrabold text-ink">运动处方</span>
                <span class="pill pill-brand">已发布</span>
              </div>
              <div class="mt-0.5 truncate text-[10px] text-muted">{{ rxEx?.aerobic.mode }} · 每周 {{ rxEx?.aerobic.freq }} 次 · 每次 {{ rxEx?.aerobic.minutes }} 分钟</div>
              <div class="mt-0.5 text-[9.5px] font-semibold text-brand-700">目标心率 {{ rxEx?.aerobic.hrLow }}–{{ rxEx?.aerobic.hrHigh }} 次/分</div>
            </div>
            <ArrowUpRight class="h-4 w-4 text-muted/40" />
          </button>
          <button class="tap soft-card flex w-full items-center gap-3 rounded-2xl p-3 text-left" @click="store.setView('s-prescription')">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FA] text-[#2C7DA0]"><UtensilsCrossed class="h-5 w-5" /></div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[12.5px] font-extrabold text-ink">饮食处方</span>
                <span class="pill pill-blue">DASH</span>
              </div>
              <div class="mt-0.5 truncate text-[10px] text-muted">{{ rxNu?.targets.energy }} kcal · 食盐 <5g · 蛋白质 {{ rxNu?.targets.protein }}%</div>
              <div class="mt-0.5 text-[9.5px] font-semibold text-[#2C7DA0]">他汀用药：避免大量西柚汁</div>
            </div>
            <ArrowUpRight class="h-4 w-4 text-muted/40" />
          </button>
        </div>
      </div>

      <!-- 三师共管 -->
      <div class="mt-4 px-4">
        <SectionHead title="三师共管" sub="一个团队，对一个人负责">
          <template #icon><Stethoscope class="h-4 w-4 text-brand-600" /></template>
          <template #action>
            <button class="tap flex items-center gap-0.5 text-[11px] font-bold text-brand-700" @click="store.setView('s-followup')">
              随访记录 <ChevronRight class="h-3.5 w-3.5" />
            </button>
          </template>
        </SectionHead>
        <div class="glass-card flex rounded-2xl p-2">
          <button v-for="m in team" :key="m.id" class="tap flex flex-1 flex-col items-center gap-1 rounded-xl py-2" @click="store.setView('s-followup')">
            <div class="flex h-9 w-9 items-center justify-center rounded-full" :class="m.role === 'doctor' ? 'bg-[#EAF3F5] text-[#0F5C6B]' : m.role === 'coach' ? 'bg-coral-50 text-coral-500' : 'bg-[#EDF5FA] text-[#2C7DA0]'">
              <component :is="m.role === 'doctor' ? Stethoscope : m.role === 'coach' ? Dumbbell : Leaf" class="h-4 w-4" />
            </div>
            <div class="text-[10.5px] font-extrabold text-ink">{{ m.name }}</div>
            <div class="text-[8.5px] text-muted">{{ m.label }}</div>
          </button>
        </div>
        <div v-if="nextFu" class="mt-2 flex items-center gap-2 rounded-2xl border border-coral-200/40 bg-coral-50/70 px-3 py-2">
          <CalendarDays class="h-3.5 w-3.5 text-coral-500" />
          <div class="flex-1 text-[10px] text-coral-700">
            下次{{ nextFu.type }}：<b>{{ fmtShort(nextFu.nextDate) }}</b> · {{ nextFu.doctorName }}医师
          </div>
          <button class="text-[10px] font-bold text-coral-600" @click="store.setView('s-followup')">查看</button>
        </div>
      </div>

      <!-- 活动 -->
      <div class="mt-4 px-4">
        <SectionHead title="进行中的活动" sub="完成挑战，攒小红花换健康好物">
          <template #icon><Trophy class="h-4 w-4 text-amber-500" /></template>
          <template #action>
            <button class="tap flex items-center gap-0.5 text-[11px] font-bold text-brand-700" @click="store.setView('s-activity')">
              全部 <ChevronRight class="h-3.5 w-3.5" />
            </button>
          </template>
        </SectionHead>
        <div class="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button v-for="a in activeActs" :key="a.id" class="tap w-[172px] shrink-0 rounded-2xl border border-black/[0.05] bg-white/85 p-3 text-left" @click="store.setView('s-activity')">
            <div class="flex items-center justify-between">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Flame class="h-3.5 w-3.5" /></span>
              <span class="pill pill-amber">{{ a.progress }}/{{ a.target }}</span>
            </div>
            <div class="mt-2 line-clamp-1 text-[11px] font-extrabold text-ink">{{ a.name }}</div>
            <div class="mt-0.5 line-clamp-1 text-[9px] text-muted">{{ a.reward }}</div>
            <div class="mt-2"><ProgressBar :value="a.progress || 0" :max="a.target" tone="amber" :height="4" /></div>
          </button>
        </div>
      </div>

      <!-- 关键节点 -->
      <div class="mt-4 px-4">
        <SectionHead title="一年营期节点" sub="三次入企筛查，串起完整健康轨迹">
          <template #icon><Target class="h-4 w-4 text-brand-600" /></template>
        </SectionHead>
        <div class="glass-card rounded-2xl p-3.5">
          <div v-for="(c, i) in store.camp.checkpoints" :key="c.key" class="flex gap-2.5">
            <div class="flex flex-col items-center">
              <div class="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-extrabold" :class="c.status === 'done' ? 'bg-brand-600 text-white' : c.status === 'current' ? 'bg-coral-500 text-white' : 'bg-black/[0.05] text-muted'">
                {{ i + 1 }}
              </div>
              <div v-if="i < store.camp.checkpoints.length - 1" class="my-1 w-px flex-1 bg-black/[0.08]" />
            </div>
            <div class="flex-1 pb-3">
              <div class="flex items-center justify-between">
                <span class="text-[11.5px] font-extrabold text-ink">{{ c.label }}</span>
                <span class="text-[9.5px] text-muted">{{ fmtShort(c.date) }}</span>
              </div>
              <div class="mt-0.5 text-[9px] text-muted">{{ c.status === 'done' ? '已完成 · 三甲医院空腹报告已归档' : '待采集 · 提前 2 周提醒' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="latestNotice" class="mx-4 mt-4 flex items-start gap-2 rounded-2xl border border-brand-600/10 bg-white/70 px-3 py-2.5">
        <MessageCircle class="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        <div class="min-w-0 flex-1">
          <div class="truncate text-[10.5px] font-bold text-ink">{{ latestNotice.title }}</div>
          <div class="mt-0.5 line-clamp-2 text-[9.5px] leading-relaxed text-muted">{{ latestNotice.body }}</div>
        </div>
        <button class="text-[9.5px] font-bold text-brand-700" @click="store.setView('s-messages')">查看</button>
      </div>

      <div class="mt-5 text-center text-[9px] text-muted/50">数据更新于 {{ DEMO_TODAY }} 09:20 · 演示数据</div>
    </div>

    <BottomNav anchor="s-home" :items="navItems" :badge="unread" :badge-index="2" />
  </div>
</template>
