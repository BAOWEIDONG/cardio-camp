<script setup lang="ts">
import { computed } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import {
  Activity, ArrowUpRight, Building2, CalendarDays, ChevronRight, ClipboardCheck, Flower2,
  HeartPulse, Home, Layers, Settings2, ShieldCheck, Users,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { BottomNav, PageHero, ProgressBar, RiskBadge, SectionHead } from '../../components/ui';
import { FEATURES } from '../../mock/features';

const store = useAppStore();
const u = computed(() => store.currentUser!);
const org = computed(() => store.data.orgs.find((o) => o.id === u.value.orgId)!);
const accounts = computed(() => store.data.accounts.filter((a) => a.orgId === u.value.orgId));
const students = computed(() => store.data.students.filter((s) => s.orgId === u.value.orgId));
const camps = computed(() => store.data.camps.filter((c) => c.orgId === u.value.orgId || c.id === 'camp1'));
const activeCamp = computed(() => camps.value.find((c) => c.status === 'active'));
const upcoming = computed(() => camps.value.find((c) => c.status === 'upcoming'));
const high = computed(() => students.value.filter((s) => s.risk === 'high' || s.risk === 'very_high').length);
const avgAdherence = computed(() => Math.round(students.value.reduce((n, s) => n + store.summary(s.id).adherence.ex, 0) / Math.max(1, students.value.length)));
const roleCounts = computed(() => ({
  doctor: accounts.value.filter((a) => a.role === 'doctor').length,
  coach: accounts.value.filter((a) => a.role === 'coach').length,
  dietitian: accounts.value.filter((a) => a.role === 'dietitian').length,
}));

const navItems = [
  { key: 'a-dashboard' as const, label: '机构总览', icon: Home },
  { key: 'n-accounts' as const, label: '账号', icon: Users },
  { key: 'n-camps' as const, label: '营期', icon: CalendarDays },
  { key: 'n-rewards' as const, label: '配置', icon: Settings2 },
];

function openBatch() {
  showConfirmDialog({
    title: '开启新批次',
    message: `将在「${upcoming.value?.name || '第二期'}」下创建新批次，生成专属名单导入链接与账号开通任务。确认后不可撤回，可继续补充名单。`,
    confirmButtonText: '确认开启',
  }).then(() => showToast({ message: '批次已创建，请导入企业名单', position: 'bottom' })).catch(() => {});
}
</script>

<template>
  <div class="app-page flat-bg">
    <div class="page-scroll pb-[112px]">
      <div class="flex items-center gap-3 px-4 pb-3 pt-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#96703F] text-white"><Building2 class="h-5 w-5" /></div>
        <div class="min-w-0 flex-1">
          <div class="text-[10px] text-muted">{{ org.name }}</div>
          <div class="text-[15px] font-extrabold text-ink">{{ u.name }} · 机构运营管理员</div>
        </div>
        <span class="pill pill-amber">二级运营</span>
      </div>

      <div class="px-4">
        <PageHero variant="admin" eyebrow="INSTITUTION CONSOLE" title="把营开起来，把人管起来" sub="只看到本机构的账号、营期与学员数据；规则由国际医院统一配置。">
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">本机构账号</div><div class="text-[18px] font-extrabold">{{ accounts.length }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">在营学员</div><div class="text-[18px] font-extrabold">{{ students.length }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">高危占比</div><div class="text-[18px] font-extrabold">{{ Math.round((high / Math.max(1, students.length)) * 100) }}%</div></div>
          </div>
        </PageHero>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-2 px-4">
        <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">运动依从</div><div class="text-[18px] font-extrabold text-brand-700 tabular">{{ avgAdherence }}%</div><div class="mt-1"><ProgressBar :value="avgAdherence" :height="3" /></div></div>
        <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">待随访</div><div class="text-[18px] font-extrabold text-coral-500 tabular">{{ store.data.alerts.filter((a) => a.status === 'open').length }}</div><div class="mt-1"><ProgressBar :value="60" :height="3" tone="coral" /></div></div>
        <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">已发小红花</div><div class="text-[18px] font-extrabold text-amber-600 tabular">{{ students.reduce((n, s) => n + store.flowers(s.id), 0) }}</div><div class="mt-1"><ProgressBar :value="55" :height="3" tone="amber" /></div></div>
      </div>

      <div v-if="upcoming" class="mt-4 px-4">
        <button class="tap hero-card hero-admin flex w-full items-center gap-3 rounded-2xl p-3.5 text-left" @click="openBatch">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><CalendarDays class="h-5 w-5" /></span>
          <div class="flex-1"><div class="text-[11.5px] font-extrabold">开启「{{ upcoming.name }}」新批次</div><div class="mt-0.5 text-[9px] text-white/65">{{ upcoming.batch }} · 导入名单后自动开通账号</div></div>
          <ArrowUpRight class="h-4 w-4 text-white/60" />
        </button>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="本机构账号" sub="医师 / 运动师 / 营养师分组">
          <template #icon><Users class="h-4 w-4 text-brand-600" /></template>
          <template #action><button class="text-[10.5px] font-bold text-brand-700" @click="store.setView('n-accounts')">管理</button></template>
        </SectionHead>
        <div class="grid grid-cols-3 gap-2">
          <div v-for="r in [{ l: '医师', n: roleCounts.doctor, c: 'text-[#0F5C6B] bg-[#EAF3F5]' }, { l: '运动师', n: roleCounts.coach, c: 'text-coral-500 bg-coral-50' }, { l: '营养师', n: roleCounts.dietitian, c: 'text-[#2C7DA0] bg-[#EDF5FA]' }]" :key="r.l" class="soft-card rounded-xl p-2.5 text-center">
            <div class="mx-auto flex h-7 w-7 items-center justify-center rounded-full" :class="r.c"><Users class="h-3.5 w-3.5" /></div>
            <div class="mt-1 text-[15px] font-extrabold text-ink">{{ r.n }}</div><div class="text-[8px] text-muted">{{ r.l }}</div>
          </div>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="营期与批次" sub="一个营期可拆多个企业批次">
          <template #icon><Layers class="h-4 w-4 text-brand-600" /></template>
          <template #action><button class="text-[10.5px] font-bold text-brand-700" @click="store.setView('n-camps')">全部</button></template>
        </SectionHead>
        <div class="space-y-2">
          <div v-for="c in camps" :key="c.id" class="glass-card rounded-2xl p-3">
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg" :class="c.status === 'active' ? 'bg-brand-50 text-brand-700' : 'bg-black/[0.04] text-muted'"><CalendarDays class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="text-[10.5px] font-extrabold text-ink">{{ c.name }}</span><span class="pill" :class="c.status === 'active' ? 'pill-green' : 'pill-slate'">{{ c.status === 'active' ? '进行中' : '筹备中' }}</span></div><div class="text-[8.5px] text-muted">{{ c.batch }} · {{ c.studentCount }} 人</div></div>
              <ChevronRight class="h-3.5 w-3.5 text-muted/30" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="运营与数据" sub="机构权限范围内的配置" />
        <div class="grid grid-cols-2 gap-2">
          <button v-for="m in [
            { l: '活动配置', d: '开关本机构活动', v: 'n-rewards' as const, i: Activity },
            { l: '奖品与商城', d: '库存与上下架', v: 'n-products' as const, i: Flower2 },
            { l: '结营统计', d: '指标改善与汇报', v: 'n-summary' as const, i: ClipboardCheck },
            { l: '发放中心', d: '奖励与兑换台账', v: 'n-fulfillment' as const, i: HeartPulse },
          ]" :key="m.l" class="tap soft-card flex items-center gap-2 rounded-2xl p-2.5 text-left" @click="store.setView(m.v)">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><component :is="m.i" class="h-4 w-4" /></span>
            <div><div class="text-[10px] font-bold text-ink">{{ m.l }}</div><div class="text-[8px] text-muted">{{ m.d }}</div></div>
          </button>
        </div>
      </div>

      <div class="mt-4 px-4">
        <div class="flex items-start gap-2 rounded-2xl bg-mist px-3 py-2.5 text-[9px] leading-relaxed text-muted">
          <ShieldCheck class="mt-0.5 h-3.5 w-3.5 shrink-0" /> 二级机构仅可管理本机构数据；角色权限、全局规则与危急值由北京大学国际医院统一配置。
        </div>
      </div>
    </div>

    <BottomNav anchor="a-dashboard" :items="navItems" variant="ink" />
  </div>
</template>
