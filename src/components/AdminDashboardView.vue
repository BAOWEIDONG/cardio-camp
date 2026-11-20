<script setup lang="ts">
import { computed } from 'vue';
import { Building2, CalendarDays, ChevronRight, ClipboardCheck, HeartPulse, Settings2, ShieldCheck, Users } from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { Card } from './ui';

const store = useAppStore();
const role = computed(() => store.user?.role);
const isSuper = computed(() => role.value === 'super_admin');
const students = computed(() => store.scopedStudents);
const accounts = computed(() => store.scopedAccounts);
const highRisk = computed(() => students.value.filter((s) => {
  const b = store.latestBpFor(s.id, store.selectedCampId || 'camp1');
  return b && (b.sbp >= 140 || b.dbp >= 90);
}).length);
const allOrgs = [
  { id: 'org1', name: '北京大学国际医院', type: '总部', accounts: 18, students: students.value.length, active: true },
  { id: 'org2', name: '北大医疗康复医院', type: '机构', accounts: 6, students: 0, active: true },
  { id: 'org3', name: '北大医疗石油医院', type: '机构', accounts: 4, students: 0, active: false },
];
const orgs = computed(() => isSuper.value ? allOrgs : allOrgs.filter((o) => o.id === store.currentOrgId));
const roles = [
  { name: '学员', scope: '本人数据 · 打卡/领奖' },
  { name: '医师', scope: '所负责营期 · 诊疗/随访/用药' },
  { name: '运动师', scope: '所负责营期 · 评估/处方/批注' },
  { name: '营养师', scope: '所负责营期 · 营养处方/批注/配置' },
  { name: '医院管理员', scope: '本机构 · 账号/营期/活动' },
  { name: '集团管理员', scope: '全部机构 · 规则/权限/项目' },
];
const permissionRows = [
  { m: '账号与准入', s: '●', d: '◐审核', c: '○', n: '○', o: '●本机构', a: '●' },
  { m: '电子健康档案', s: '●编辑', d: '◐录方案', c: '◐录运动', n: '◐录营养', o: '●本机构', a: '●' },
  { m: '运动管理', s: '●打卡', d: '○', c: '●评估/处方', n: '○', o: '●本机构', a: '●' },
  { m: '营养管理', s: '●打卡', d: '○', c: '—', n: '●评估/处方', o: '●本机构', a: '●' },
  { m: '用药与诊疗', s: '●查看', d: '●开具', c: '—', n: '—', o: '—', a: '●' },
  { m: '运营活动', s: '●参与', d: '○', c: '○', n: '○', o: '●本机构', a: '●' },
  { m: '报告与数据', s: '●查看', d: '○', c: '○', n: '○', o: '●本机构', a: '●项目' },
];
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] pb-8">
    <div class="bg-gradient-to-b from-[#EAF1F6] to-transparent px-5 pb-2 pt-5">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3A52] text-white shadow-lg"><ShieldCheck class="h-6 w-6" /></div>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] text-gray-500">{{ isSuper ? '北京大学国际医院 · 健康事业部' : '北大医疗康复医院 · 健康管理部' }}</div>
          <div class="text-[17px] font-black text-gray-900">{{ store.user?.name }} · {{ isSuper ? '集团管理员' : '医院管理员' }}</div>
        </div>
        <span class="rounded-full bg-[#1E3A52]/8 px-2.5 py-1 text-[9px] font-bold text-[#1E3A52]">{{ isSuper ? '一级管控' : '二级运营' }}</span>
      </div>
    </div>

    <div class="px-5 pt-3 space-y-4">
      <div class="rounded-[24px] bg-gradient-to-br from-[#142F45] via-[#1B4056] to-[#22506A] p-4 text-white shadow-xl">
        <div class="text-[10px] font-bold tracking-[0.16em] text-white/50">PROJECT CONTROL TOWER</div>
        <div class="mt-1 text-[20px] font-black">{{ isSuper ? '两个项目，一张总表' : '把营开起来，把人管起来' }}</div>
        <div class="mt-1 text-[11px] text-white/65">{{ isSuper ? '入营、打卡、指标改善、活动参与与随访完成率，一级视角全掌握。' : '只看到本机构的账号、营期与学员数据；规则由国际医院统一配置。' }}</div>
        <div class="mt-3 grid grid-cols-4 gap-2">
          <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">在营学员</div><div class="text-[17px] font-black">{{ students.length }}</div></div>
          <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">高危</div><div class="text-[17px] font-black">{{ highRisk }}</div></div>
          <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">账号</div><div class="text-[17px] font-black">{{ accounts.length }}</div></div>
          <div class="rounded-xl bg-white/10 px-2 py-2"><div class="text-[8px] text-white/55">营期</div><div class="text-[17px] font-black">{{ store.scopedCamps.length }}</div></div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-2">
        <button v-if="store.can('account', 'view')" class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="store.setCurrentView('account-manage')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A52]/10 text-[#1E3A52]"><Users class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">账号管理</span>
        </button>
        <button v-if="store.can('permission', 'view')" class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="store.setCurrentView('permission-config')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F6A95]/10 text-[#1F6A95]"><ShieldCheck class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">权限配置</span>
        </button>
        <button v-if="store.can('report', 'view')" class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="store.setCurrentView('camp-summary')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2C7DA0]/10 text-[#2C7DA0]"><ClipboardCheck class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">结营统计</span>
        </button>
        <button v-if="store.can('config', 'view')" class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="store.setCurrentView('metric-config')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F6A95]/10 text-[#1F6A95]"><Settings2 class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">指标配置</span>
        </button>
        <button v-if="store.can('activity', 'view')" class="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-sm" @click="store.setCurrentView('activity-admin')">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8674F]/10 text-[#E8674F]"><HeartPulse class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-gray-700">活动配置</span>
        </button>
      </div>

      <div>
        <div class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900"><Building2 class="h-4 w-4 text-[#1E3A52]" /> 机构与分组</div>
        <div class="space-y-2">
          <Card v-for="o in orgs" :key="o.name" class="border-0 shadow-sm p-3.5">
            <div class="flex items-center gap-2.5">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="o.type === '总部' ? 'bg-[#1E3A52] text-white' : 'bg-[#1E3A52]/8 text-[#1E3A52]'"><Building2 class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5"><span class="text-[11px] font-bold text-gray-900">{{ o.name }}</span><span class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[8px] font-bold text-gray-500">{{ o.type }}</span></div>
                <div class="text-[9px] text-gray-400 mt-0.5">{{ o.accounts }} 账号 · {{ o.students }} 学员</div>
              </div>
              <span class="text-[9px] font-bold" :class="o.active ? 'text-[#1F6A95]' : 'text-gray-400'">{{ o.active ? '运营中' : '未启用' }}</span>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900"><ShieldCheck class="h-4 w-4 text-[#1E3A52]" /> 角色权限</div>
        <Card class="border-0 shadow-sm p-3.5">
          <div v-for="(r, i) in roles" :key="r.name" class="flex items-center gap-2 border-b border-gray-50 py-2 last:border-0">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E3A52]/8 text-[8px] font-black text-[#1E3A52]">{{ i + 1 }}</span>
            <span class="w-20 text-[10px] font-bold text-gray-900">{{ r.name }}</span>
            <span class="flex-1 text-[9px] text-gray-500">{{ r.scope }}</span>
          </div>
        </Card>
      </div>

      <div>
        <div class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900"><ShieldCheck class="h-4 w-4 text-[#1E3A52]" /> 功能权限矩阵</div>
        <Card class="border-0 shadow-sm p-3 overflow-x-auto">
          <table class="w-full min-w-[520px] border-collapse text-[8px]">
            <thead><tr class="text-gray-400"><th class="py-1 text-left font-bold">模块</th><th class="py-1 font-bold">学员</th><th class="py-1 font-bold">医师</th><th class="py-1 font-bold">运动师</th><th class="py-1 font-bold">营养师</th><th class="py-1 font-bold">机构</th><th class="py-1 font-bold">超管</th></tr></thead>
            <tbody>
              <tr v-for="r in permissionRows" :key="r.m" class="border-t border-gray-50">
                <td class="py-1.5 text-left font-semibold text-gray-700">{{ r.m }}</td>
                <td class="py-1.5 text-center text-gray-600">{{ r.s }}</td>
                <td class="py-1.5 text-center text-gray-600">{{ r.d }}</td>
                <td class="py-1.5 text-center text-gray-600">{{ r.c }}</td>
                <td class="py-1.5 text-center text-gray-600">{{ r.n }}</td>
                <td class="py-1.5 text-center text-gray-600">{{ r.o }}</td>
                <td class="py-1.5 text-center text-gray-600">{{ r.a }}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div>
        <div class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900"><CalendarDays class="h-4 w-4 text-[#1E3A52]" /> 营期与批次</div>
        <div class="space-y-2">
          <Card v-for="c in store.scopedCamps" :key="c.id" class="border-0 shadow-sm p-3.5">
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A52]/8 text-[#1E3A52]"><CalendarDays class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1"><div class="text-[11px] font-bold text-gray-900">心脑血管防治营 · {{ c.name }}</div><div class="text-[9px] text-gray-400">{{ c.startDate }} – {{ c.endDate }}</div></div>
              <span class="rounded-full px-2 py-0.5 text-[8px] font-bold" :class="c.status === 'active' ? 'bg-[#1F6A95]/10 text-[#1F6A95]' : 'bg-gray-100 text-gray-500'">{{ c.status === 'active' ? '进行中' : c.status === 'upcoming' ? '筹备中' : '已结营' }}</span>
              <ChevronRight class="h-4 w-4 text-gray-300" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
