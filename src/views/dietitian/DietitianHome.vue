<script setup lang="ts">
import { computed } from 'vue';
import {
  Activity, AlertTriangle, Award, ChevronRight, ClipboardList, Flower2, Gift, Home,
  Leaf, MessageCircle, Package, Salad, Settings2, Users, UtensilsCrossed,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { BottomNav, PageHero, ProgressBar, RiskBadge, SectionHead } from '../../components/ui';
import { DEMO_TODAY, fmtMD, fmtShort, weekdayCN } from '../../lib/date';

const store = useAppStore();
const u = computed(() => store.currentUser!);
const pending = computed(() => store.dietitianPending);
const students = computed(() => store.myStudents);
const pendingRecords = computed(() => store.data.dietRecords
  .filter((r) => students.value.some((s) => s.id === r.studentId) && !r.comments?.length)
  .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5));
const missing = computed(() => students.value.filter((s) => store.dietOf(s.id).filter((r) => r.date.startsWith(DEMO_TODAY)).length < 3).slice(0, 4));
const unread = computed(() => students.value.reduce((n, s) => n + (store.threadFor(s.id, 'dietitian')?.messages.filter((m) => !m.read && m.fromRole === 'student').length || 0), 0));
const nutritionRisk = computed(() => students.value.filter((s) => s.risk === 'very_high' || s.bmi >= 28).slice(0, 3));

const navItems = [
  { key: 'n-home' as const, label: '工作台', icon: Home },
  { key: 'n-students' as const, label: '学员', icon: Users },
  { key: 'n-messages' as const, label: '消息', icon: MessageCircle },
  { key: 'n-accounts' as const, label: '配置', icon: Settings2 },
];
function studentOf(id: string) { return store.studentById(id); }
</script>

<template>
  <div class="app-page flat-bg">
    <div class="page-scroll pb-[112px]">
      <div class="flex items-center gap-3 px-4 pb-3 pt-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2C7DA0] text-white"><Leaf class="h-5 w-5" /></div>
        <div class="min-w-0 flex-1">
          <div class="text-[10px] text-muted">{{ weekdayCN(DEMO_TODAY) }} · {{ fmtShort(DEMO_TODAY) }}</div>
          <div class="text-[15px] font-extrabold text-ink">{{ u.name }} 注册营养师</div>
          <div class="text-[9px] text-muted">临床营养科 · 北京大学国际医院</div>
        </div>
        <button class="tap relative flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm" @click="store.setView('n-messages')">
          <MessageCircle class="h-[18px] w-[18px] text-ink/70" />
          <span v-if="unread" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[8px] font-bold text-white">{{ unread }}</span>
        </button>
      </div>

      <div class="px-4">
        <PageHero variant="dietitian" eyebrow="NUTRITION WORKBENCH" :title="`今天有 ${pending.comments} 条饮食待批注`" sub="低盐、低脂、控糖，同时避开用药与食物的相互作用。">
          <template #right>
            <div class="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-center backdrop-blur min-w-[64px] whitespace-nowrap">
              <div class="text-[18px] font-extrabold leading-none">{{ students.length }}</div>
              <div class="mt-1 text-[8px] text-white/60">在管学员</div>
            </div>
          </template>
          <div class="grid grid-cols-3 gap-2">
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('n-students')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><ClipboardList class="h-3 w-3" /> 待批注</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.comments }}</div>
            </button>
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('n-students')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><Salad class="h-3 w-3" /> 三餐未齐</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.missing }}</div>
            </button>
            <button class="tap rounded-xl bg-white/10 px-2.5 py-2 text-left backdrop-blur" @click="store.setView('n-rx')">
              <div class="flex items-center gap-1 text-[9px] text-white/60"><UtensilsCrossed class="h-3 w-3" /> 处方复评</div>
              <div class="mt-1 text-[19px] font-extrabold leading-none">{{ pending.rx }}</div>
            </button>
          </div>
        </PageHero>
      </div>

      <div class="mt-3 grid grid-cols-4 gap-2 px-4">
        <button v-for="a in [
          { l: '学员列表', i: Users, v: 'n-students' as const, tone: 'bg-[#EDF5FA] text-[#2C7DA0]' },
          { l: '饮食处方', i: Salad, v: 'n-rx' as const, tone: 'bg-brand-50 text-brand-700' },
          { l: '发放中心', i: Package, v: 'n-fulfillment' as const, tone: 'bg-amber-50 text-amber-600' },
          { l: '结营统计', i: Award, v: 'n-summary' as const, tone: 'bg-coral-50 text-coral-500' },
        ]" :key="a.l" class="tap flex flex-col items-center gap-1.5 rounded-2xl border border-black/[0.04] bg-white/80 py-3" @click="store.setView(a.v)">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="a.tone"><component :is="a.i" class="h-4 w-4" /></span>
          <span class="text-[9.5px] font-bold text-ink">{{ a.l }}</span>
        </button>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="待批注饮食" sub="近 2 天 · 按餐次评分">
          <template #icon><Salad class="h-4 w-4 text-[#2C7DA0]" /></template>
          <template #action><button class="text-[10.5px] font-bold text-brand-700" @click="store.setView('n-students')">全部</button></template>
        </SectionHead>
        <div class="space-y-2">
          <button v-for="r in pendingRecords" :key="r.id" class="tap soft-card w-full rounded-2xl p-3 text-left" @click="store.openStudent(r.studentId, 'n-student')">
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF5FA] text-[#2C7DA0]"><Salad class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5"><span class="text-[11px] font-extrabold text-ink">{{ studentOf(r.studentId)?.name }}</span><RiskBadge :risk="studentOf(r.studentId)?.risk || 'medium'" /><span class="text-[8.5px] text-muted">{{ r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '午餐' : '晚餐' }}</span></div>
                <div class="mt-0.5 line-clamp-1 text-[9px] text-muted">{{ r.desc }}</div>
              </div>
              <span class="pill" :class="r.salt === 'high' ? 'pill-coral' : 'pill-green'">{{ r.salt === 'high' ? '偏咸' : r.salt === 'medium' ? '适中' : '低盐' }}</span>
            </div>
          </button>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="营养重点关注" sub="合并症与用药相互作用">
          <template #icon><AlertTriangle class="h-4 w-4 text-amber-500" /></template>
        </SectionHead>
        <div class="space-y-2">
          <button v-for="p in nutritionRisk" :key="p.id" class="tap soft-card flex w-full items-center gap-2.5 rounded-2xl p-2.5 text-left" @click="store.openStudent(p.id, 'n-student')">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[10px] font-extrabold text-amber-700">{{ p.name.slice(0, 1) }}</span>
            <div class="min-w-0 flex-1"><div class="text-[10.5px] font-bold text-ink">{{ p.name }} <span class="text-[8.5px] font-normal text-muted">BMI {{ p.bmi }}</span></div><div class="text-[8.5px] text-muted">{{ p.riskTags.join(' / ') }}</div></div>
            <ChevronRight class="h-3.5 w-3.5 text-muted/30" />
          </button>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="配置与管理" sub="营期、指标、奖品与账号" />
        <div class="grid grid-cols-2 gap-2">
          <button v-for="c in [
            { l: '指标库配置', d: '心脑血管指标与参考区间', v: 'n-metrics' as const, i: Activity },
            { l: '营期管理', d: '创建营期、设置起止日期', v: 'n-camps' as const, i: ClipboardList },
            { l: '奖品配置', d: '连续打卡档位与库存', v: 'n-rewards' as const, i: Gift },
            { l: '账号管理', d: '学员与团队账号', v: 'n-accounts' as const, i: Users },
          ]" :key="c.l" class="tap soft-card flex items-center gap-2 rounded-2xl p-2.5 text-left" @click="store.setView(c.v)">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><component :is="c.i" class="h-4 w-4" /></span>
            <div><div class="text-[10px] font-bold text-ink">{{ c.l }}</div><div class="text-[8px] text-muted">{{ c.d }}</div></div>
          </button>
        </div>
      </div>
    </div>

    <BottomNav anchor="n-home" :items="navItems" :badge="unread" :badge-index="2" variant="blue" />
  </div>
</template>
