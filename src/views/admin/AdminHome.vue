<script setup lang="ts">
import { computed } from 'vue';
import {
  Activity, AlertTriangle, ArrowUpRight, Building2, CalendarDays, ChevronRight, ClipboardCheck,
  Flower2, Globe2, HeartPulse, Home, Settings2, ShieldCheck, Users, Layers,
} from 'lucide-vue-next';
import { showConfirmDialog, showToast } from 'vant';
import { useAppStore } from '../../store/app';
import { BottomNav, PageHero, ProgressBar, RiskBadge, SectionHead } from '../../components/ui';
import { DEMO_TODAY } from '../../lib/date';
import { FEATURES } from '../../mock/features';

const store = useAppStore();
const u = computed(() => store.currentUser!);
const students = computed(() => store.data.students);
const activeCamp = computed(() => store.data.camps.find((c) => c.status === 'active')!);
const high = computed(() => students.value.filter((s) => s.risk === 'high' || s.risk === 'very_high').length);
const avgAdherence = computed(() => Math.round(students.value.reduce((n, s) => n + store.summary(s.id).adherence.ex, 0) / Math.max(1, students.value.length)));
const avgSbpDrop = computed(() => {
  const vals = students.value.map((s) => Math.max(0, store.summary(s.id).sbpDrop || 0));
  return (vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length)).toFixed(1);
});
const alerts = computed(() => store.data.alerts.filter((a) => a.status === 'open'));

const navItems = [
  { key: 'a-home' as const, label: '总览', icon: Home },
  { key: 'a-projects' as const, label: '项目', icon: Layers },
  { key: 'a-orgs' as const, label: '组织', icon: Building2 },
  { key: 'a-config' as const, label: '配置', icon: Settings2 },
];
function resetDemo() {
  showConfirmDialog({
    title: '重置演示数据',
    message: '将清空本次演示中新增的打卡、批注、消息与兑换记录，恢复到初始演示状态。此操作不可撤销。',
    confirmButtonText: '确认重置',
    confirmButtonColor: '#D9553E',
  }).then(() => { store.resetDemo(); showToast('演示数据已重置'); }).catch(() => {});
}
</script>

<template>
  <div class="app-page flat-bg">
    <div class="page-scroll pb-[112px]">
      <div class="flex items-center gap-3 px-4 pb-3 pt-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1D5250] text-white"><ShieldCheck class="h-5 w-5" /></div>
        <div class="min-w-0 flex-1">
          <div class="text-[10px] text-muted">北京大学国际医院 · 健康事业部</div>
          <div class="text-[15px] font-extrabold text-ink">{{ u.name }} 超级管理员</div>
        </div>
        <button class="rounded-full bg-white/85 px-2.5 py-1.5 text-[9px] font-bold text-coral-500 shadow-sm" @click="resetDemo">重置演示</button>
      </div>

      <div class="px-4">
        <PageHero variant="admin" eyebrow="PROJECT CONTROL TOWER" title="两个项目，一张总表" sub="入营、打卡、指标改善、活动参与、预警与随访完成率，一级视角全掌握。">
          <template #right>
            <div class="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-center backdrop-blur min-w-[64px] whitespace-nowrap">
              <div class="text-[18px] font-extrabold leading-none">{{ students.length }}</div>
              <div class="mt-1 text-[8px] text-white/60">在营学员</div>
            </div>
          </template>
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">在营项目</div><div class="text-[18px] font-extrabold">{{ store.data.camps.filter((c) => c.status === 'active').length }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">高危占比</div><div class="text-[18px] font-extrabold">{{ Math.round((high / Math.max(1, students.length)) * 100) }}%</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">待处理预警</div><div class="text-[18px] font-extrabold">{{ alerts.length }}</div></div>
          </div>
        </PageHero>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-2 px-4">
        <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">入营进度</div><div class="text-[18px] font-extrabold text-ink tabular">100%</div><div class="mt-1"><ProgressBar :value="100" :height="3" /></div></div>
        <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">运动依从</div><div class="text-[18px] font-extrabold text-brand-700 tabular">{{ avgAdherence }}%</div><div class="mt-1"><ProgressBar :value="avgAdherence" :height="3" /></div></div>
        <div class="soft-card rounded-xl p-2.5"><div class="text-[8.5px] text-muted">平均↓SBP</div><div class="text-[18px] font-extrabold text-coral-500 tabular">{{ avgSbpDrop }}</div><div class="mt-1"><ProgressBar :value="68" :height="3" tone="coral" /></div></div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="项目总览" sub="按营期 · 数据截至今日">
          <template #icon><Layers class="h-4 w-4 text-brand-600" /></template>
          <template #action><button class="text-[10.5px] font-bold text-brand-700" @click="store.setView('a-projects')">全部</button></template>
        </SectionHead>
        <div class="space-y-2">
          <div v-for="c in store.data.camps" :key="c.id" class="glass-card rounded-2xl p-3.5">
            <div class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="c.status === 'active' ? 'bg-brand-50 text-brand-700' : 'bg-black/[0.04] text-muted'"><CalendarDays class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="text-[11px] font-extrabold text-ink">{{ c.name }}</span><span class="pill" :class="c.status === 'active' ? 'pill-green' : 'pill-slate'">{{ c.status === 'active' ? '进行中' : '筹备中' }}</span></div><div class="text-[9px] text-muted">{{ store.data.orgs.find((o) => o.id === c.orgId)?.shortName }} · {{ c.studentCount }} 人 · 第 {{ store.campDay }} / 365 天</div></div>
              <ChevronRight class="h-4 w-4 text-muted/30" />
            </div>
            <div class="mt-2 grid grid-cols-4 gap-1.5">
              <div class="rounded-lg bg-mist p-1.5 text-center"><div class="text-[11px] font-extrabold text-brand-700">{{ c.status === 'active' ? avgAdherence : 0 }}%</div><div class="text-[7px] text-muted">打卡</div></div>
              <div class="rounded-lg bg-mist p-1.5 text-center"><div class="text-[11px] font-extrabold text-ink">{{ c.status === 'active' ? 76 : 0 }}%</div><div class="text-[7px] text-muted">活动</div></div>
              <div class="rounded-lg bg-mist p-1.5 text-center"><div class="text-[11px] font-extrabold text-coral-500">{{ c.status === 'active' ? 3 : 0 }}</div><div class="text-[7px] text-muted">预警</div></div>
              <div class="rounded-lg bg-mist p-1.5 text-center"><div class="text-[11px] font-extrabold text-ink">{{ c.status === 'active' ? 92 : 0 }}%</div><div class="text-[7px] text-muted">随访</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="机构与分组" sub="一级维护组织，二级运营账号">
          <template #icon><Building2 class="h-4 w-4 text-brand-600" /></template>
          <template #action><button class="text-[10.5px] font-bold text-brand-700" @click="store.setView('a-orgs')">管理</button></template>
        </SectionHead>
        <div class="space-y-1.5">
          <div v-for="o in store.data.orgs" :key="o.id" class="glass-card flex items-center gap-2.5 rounded-2xl p-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg" :class="o.type === 'head' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'"><Building2 class="h-3.5 w-3.5" /></span>
            <div class="min-w-0 flex-1"><div class="text-[10.5px] font-bold text-ink">{{ o.name }}</div><div class="text-[8.5px] text-muted">{{ o.accountCount }} 账号 · {{ o.studentCount }} 学员</div></div>
            <span class="pill" :class="o.type === 'head' ? 'pill-brand' : 'pill-slate'">{{ o.type === 'head' ? '总部' : '机构' }}</span>
          </div>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead title="管理入口" sub="权限、规则、营期与功能清单" />
        <div class="grid grid-cols-2 gap-2">
          <button v-for="m in [
            { l: '角色与权限', d: '6 类角色矩阵', v: 'a-roles' as const, i: ShieldCheck },
            { l: '全局规则', d: '小红花/达标线/危急值', v: 'a-config' as const, i: Settings2 },
            { l: '营期与批次', d: '分批开营与名单', v: 'a-camps' as const, i: CalendarDays },
            { l: '活动配置', d: '24 项运营活动开关', v: 'a-activity' as const, i: Activity },
            { l: '奖品与商城', d: '档位/库存/上下架', v: 'a-rewards' as const, i: Flower2 },
            { l: '账号总表', d: '全机构账号状态', v: 'a-accounts' as const, i: Users },
          ]" :key="m.l" class="tap soft-card flex items-center gap-2 rounded-2xl p-2.5 text-left" @click="store.setView(m.v)">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><component :is="m.i" class="h-4 w-4" /></span>
            <div><div class="text-[10px] font-bold text-ink">{{ m.l }}</div><div class="text-[8px] text-muted">{{ m.d }}</div></div>
          </button>
        </div>
      </div>

      <div class="mt-4 px-4">
        <button class="tap flex w-full items-center gap-3 rounded-2xl border border-brand-600/15 bg-brand-50/60 px-3.5 py-3 text-left" @click="store.setView('a-features')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"><ClipboardCheck class="h-4 w-4" /></span>
          <div class="flex-1"><div class="text-[11px] font-extrabold text-brand-800">59 项功能清单 · 三期覆盖</div><div class="text-[9px] text-brand-700/70">一期 {{ FEATURES.filter((f) => f.phase === '一期').length }} · 二期 {{ FEATURES.filter((f) => f.phase === '二期').length }} · 三期 {{ FEATURES.filter((f) => f.phase === '三期').length }}</div></div>
          <ArrowUpRight class="h-4 w-4 text-brand-600/50" />
        </button>
      </div>
    </div>

    <BottomNav anchor="a-home" :items="navItems" variant="ink" />
  </div>
</template>
