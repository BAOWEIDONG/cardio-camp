<script setup lang="ts">
import { computed, ref } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import {
  Activity, Building2, CalendarDays, Check, ChevronRight, Flower2, Gift, Globe2,
  Plus, Save, Settings2, ShieldCheck, ToggleLeft, ToggleRight, Users,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, SectionHead, Sheet } from '../../components/ui';
import type { Org, PermissionRow } from '../../types';
import { FEATURES } from '../../mock/features';

const props = defineProps<{ mode: 'orgs' | 'roles' | 'config' | 'projects' | 'accounts' | 'rewards' | 'camps' | 'activity' }>();
const store = useAppStore();
const titles: Record<string, string> = {
  orgs: '组织与分组', roles: '角色与权限', config: '全局规则配置', projects: '项目数据看板',
  accounts: '账号总表', rewards: '奖品与商城', camps: '营期与批次', activity: '活动配置',
};
const title = computed(() => titles[props.mode]);

// 组织
const showOrg = ref(false);
const orgForm = ref({ name: '', shortName: '', city: '北京', contact: '' });
function addOrg() {
  if (!orgForm.value.name.trim()) { showToast('请填写机构名称'); return; }
  const o: Org = { id: `org_${Date.now()}`, name: orgForm.value.name, shortName: orgForm.value.shortName || orgForm.value.name, type: 'hospital', city: orgForm.value.city, contact: orgForm.value.contact, accountCount: 0, studentCount: 0 };
  store.data.orgs.push(o);
  showOrg.value = false;
  showToast('机构已创建');
}

// 权限
const keys: { k: keyof Omit<PermissionRow, 'module'>; l: string }[] = [
  { k: 'student', l: '学员' }, { k: 'coach', l: '运动师' }, { k: 'dietitian', l: '营养师' },
  { k: 'doctor', l: '医师' }, { k: 'orgAdmin', l: '机构管理员' }, { k: 'superAdmin', l: '超级管理员' },
];
const cycle = ['●', '◐', '○', '—'];
function toggleCell(row: PermissionRow, k: keyof Omit<PermissionRow, 'module'>) {
  const cur = row[k];
  const base = cur.split(' ')[0];
  const i = cycle.indexOf(base);
  const next = cycle[(i + 1) % cycle.length];
  store.updatePermission(row.module, k, next);
}

// 规则配置
const cfg = ref({
  flowerRate: store.data.config.flowerRate,
  sbp: store.data.config.targets.sbp, dbp: store.data.config.targets.dbp,
  ldl: store.data.config.targets.ldl, hba1c: store.data.config.targets.hba1c,
  cSbp: store.data.config.critical.sbp, cDbp: store.data.config.critical.dbp,
  cHrLow: store.data.config.critical.hrLow, cHrHigh: store.data.config.critical.hrHigh,
  streak: store.data.config.streakTiers.join(' / '),
});
function saveConfig() {
  store.updateConfig({
    flowerRate: Number(cfg.value.flowerRate),
    targets: { sbp: Number(cfg.value.sbp), dbp: Number(cfg.value.dbp), ldl: Number(cfg.value.ldl), hba1c: Number(cfg.value.hba1c) },
    critical: { sbp: Number(cfg.value.cSbp), dbp: Number(cfg.value.cDbp), hrLow: Number(cfg.value.cHrLow), hrHigh: Number(cfg.value.cHrHigh) },
    streakTiers: cfg.value.streak.split('/').map((s) => Number(s.trim())).filter(Boolean),
  });
  showToast('全局规则已保存并下发');
}
function delegateOn(k: string) {
  return (store.data.config.delegate as unknown as Record<string, boolean>)[k] === true;
}
function toggleDelegate(k: string) {
  const d = store.data.config.delegate as unknown as Record<string, boolean>;
  d[k] = !d[k];
  showToast('授权范围已更新');
}

// 账号总表
const accounts = computed(() => store.data.accounts);
const roleLabel: Record<string, string> = { student: '学员', doctor: '医师', coach: '运动师', dietitian: '营养师', org_admin: '机构管理员', super_admin: '超级管理员' };
const roleTone: Record<string, string> = { student: 'pill-brand', doctor: 'pill-blue', coach: 'pill-coral', dietitian: 'pill-blue', org_admin: 'pill-amber', super_admin: 'pill-slate' };

// 活动
function toggleActivity(id: string) {
  const on = store.data.config.activitySwitch[id];
  showConfirmDialog({
    title: on ? '关闭活动' : '开启活动',
    message: on ? '关闭后学员端活动入口保留，但该活动不可参与；已产生的进度与奖励保留。' : '开启后全营学员可见并可参与，按当前批次生效。',
    confirmButtonText: on ? '确认关闭' : '确认开启',
  }).then(() => { store.data.config.activitySwitch[id] = !on; showToast('活动状态已更新'); }).catch(() => {});
}
const phaseLabel: Record<number, string> = { 1: '一期', 2: '二期', 3: '三期' };
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar :title="title" :on-back="store.back">
      <template #right>
        <button v-if="mode === 'orgs'" class="flex items-center gap-1 text-[10px] font-bold text-brand-700" @click="showOrg = true"><Plus class="h-3.5 w-3.5" /> 新增机构</button>
        <button v-if="mode === 'config'" class="text-[10px] font-bold text-brand-700" @click="saveConfig">保存</button>
      </template>
    </NavBar>

    <div class="page-scroll no-tabbar">
      <!-- 组织 -->
      <div v-if="mode === 'orgs'" class="px-4 pt-3 pb-8">
        <div class="hero-card hero-admin rounded-2xl p-3.5">
          <div class="text-[9px] font-bold tracking-[0.14em] text-white/50">ORGANIZATION</div>
          <div class="mt-1 text-[16px] font-extrabold">一级管控，二级运营</div>
          <div class="mt-1 text-[9.5px] text-white/65">国际医院维护机构、班组与名单；机构管理员配置本机构账号与批次。</div>
        </div>
        <div class="mt-3 space-y-2">
          <div v-for="o in store.data.orgs" :key="o.id" class="glass-card rounded-2xl p-3.5">
            <div class="flex items-center gap-2.5">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="o.type === 'head' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'"><Building2 class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5"><span class="text-[11.5px] font-extrabold text-ink">{{ o.name }}</span><span class="pill" :class="o.type === 'head' ? 'pill-brand' : 'pill-slate'">{{ o.type === 'head' ? '总部' : '机构' }}</span></div>
                <div class="mt-0.5 text-[9px] text-muted">{{ o.city }} · 联系人 {{ o.contact }}</div>
              </div>
              <ChevronRight class="h-4 w-4 text-muted/30" />
            </div>
            <div class="mt-2 grid grid-cols-3 gap-2 border-t border-black/[0.04] pt-2 text-[9px] text-muted">
              <span>账号 <b class="text-ink">{{ o.accountCount }}</b></span>
              <span>学员 <b class="text-ink">{{ o.studentCount }}</b></span>
              <span>分组 <b class="text-ink">{{ o.type === 'head' ? '总部组' : 'A/B 组' }}</b></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限 -->
      <div v-else-if="mode === 'roles'" class="px-4 pt-3 pb-8">
        <div class="rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800">
          点击单元格循环切换：● 可操作 / ◐ 部分 / ○ 仅查看 / — 无权限。角色权限仅超级管理员可配置。
        </div>
        <div class="mt-3 overflow-x-auto rounded-2xl border border-black/[0.05] bg-white/85">
          <table class="w-full min-w-[560px] border-collapse text-[8.5px]">
            <thead>
              <tr class="bg-mist text-muted">
                <th class="sticky left-0 bg-mist px-2 py-2 text-left font-bold">模块</th>
                <th v-for="k in keys" :key="k.k" class="px-1.5 py-2 font-bold">{{ k.l }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in store.data.permissions" :key="row.module" class="border-t border-black/[0.04]">
                <td class="sticky left-0 bg-white px-2 py-2 font-semibold text-ink">{{ row.module }}</td>
                <td v-for="k in keys" :key="k.k" class="cursor-pointer px-1.5 py-2 text-center hover:bg-brand-50" @click="toggleCell(row, k.k)">{{ row[k.k] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 text-[8.5px] text-muted">示例矩阵，实际以超级管理员分配为准。</div>
        <div class="mt-4">
          <SectionHead title="功能清单覆盖" :sub="`${FEATURES.length} 项 · 一期 ${FEATURES.filter((f) => f.phase === '一期').length} / 二期 ${FEATURES.filter((f) => f.phase === '二期').length} / 三期 ${FEATURES.filter((f) => f.phase === '三期').length}`" />
          <button class="tap flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-600/20 bg-white py-2.5 text-[10px] font-bold text-brand-700" @click="store.setView('a-features')">查看 59 项功能清单 <ChevronRight class="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <!-- 全局配置 -->
      <div v-else-if="mode === 'config'" class="px-4 pt-3 pb-8 space-y-3">
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="小红花规则" sub="虚拟物品，等值人民币，仅兑换不可提现" />
          <div class="mt-2 flex items-center gap-2">
            <span class="text-[10px] text-muted">1 朵 =</span>
            <Input v-model:value="cfg.flowerRate as any" type="number" class="!w-20" />
            <span class="text-[10px] text-muted">元</span>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="达标线" sub="学员端目标值与报告判定" />
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div><div class="mb-1 text-[9px] font-bold text-muted">收缩压 &lt;</div><Input v-model:value="cfg.sbp as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">舒张压 &lt;</div><Input v-model:value="cfg.dbp as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">LDL-C &lt;</div><Input v-model:value="cfg.ldl as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">HbA1c &lt;</div><Input v-model:value="cfg.hba1c as any" type="number" /></div>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="危急值预警" sub="触发后推送医师与机构管理员" />
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div><div class="mb-1 text-[9px] font-bold text-muted">收缩压 ≥</div><Input v-model:value="cfg.cSbp as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">舒张压 ≥</div><Input v-model:value="cfg.cDbp as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">心率 &lt;</div><Input v-model:value="cfg.cHrLow as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">心率 &gt;</div><Input v-model:value="cfg.cHrHigh as any" type="number" /></div>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="连续打卡档位" sub="用 / 分隔" />
          <div class="mt-2"><Input v-model:value="cfg.streak" placeholder="21 / 45 / 90" /></div>
        </div>
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="二级机构授权" sub="关闭后仅超级管理员可操作" />
          <div v-for="d in [{ k: 'activity', l: '活动配置' }, { k: 'accounts', l: '账号管理' }, { k: 'camps', l: '营期与批次' }, { k: 'rewards', l: '奖品与商城' }]" :key="d.k" class="mt-2 flex items-center justify-between">
            <span class="text-[10.5px] text-ink">{{ d.l }}</span>
            <button class="flex items-center gap-1 text-[9px] font-bold" :class="delegateOn(d.k) ? 'text-brand-700' : 'text-muted'" @click="toggleDelegate(d.k)">
              <component :is="delegateOn(d.k) ? ToggleRight : ToggleLeft" class="h-5 w-5" />
              {{ delegateOn(d.k) ? '已授权' : '未授权' }}
            </button>
          </div>
        </div>
        <Button class="w-full" size="lg" @click="saveConfig"><Save class="h-4 w-4" /> 保存并下发</Button>
      </div>

      <!-- 项目 -->
      <div v-else-if="mode === 'projects'" class="px-4 pt-3 pb-8 space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div class="hero-card hero-admin rounded-2xl p-3"><div class="text-[8.5px] text-white/55">项目数</div><div class="text-[24px] font-extrabold">{{ store.data.camps.length }}</div></div>
          <div class="hero-card hero-admin rounded-2xl p-3"><div class="text-[8.5px] text-white/55">总学员</div><div class="text-[24px] font-extrabold">{{ store.data.students.length }}</div></div>
        </div>
        <div v-for="c in store.data.camps" :key="c.id" class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><CalendarDays class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="text-[11px] font-extrabold text-ink">{{ c.name }}</span><span class="pill" :class="c.status === 'active' ? 'pill-green' : 'pill-slate'">{{ c.status === 'active' ? '进行中' : '筹备中' }}</span></div><div class="text-[9px] text-muted">{{ c.startDate }} – {{ c.endDate }} · {{ c.studentCount }} 人</div></div>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <div class="rounded-lg bg-mist p-2 text-center"><div class="text-[13px] font-extrabold text-brand-700">{{ c.status === 'active' ? 78 : 0 }}%</div><div class="text-[7.5px] text-muted">打卡率</div></div>
            <div class="rounded-lg bg-mist p-2 text-center"><div class="text-[13px] font-extrabold text-ink">{{ c.status === 'active' ? 5.8 : 0 }}</div><div class="text-[7.5px] text-muted">↓SBP</div></div>
            <div class="rounded-lg bg-mist p-2 text-center"><div class="text-[13px] font-extrabold text-coral-500">{{ c.status === 'active' ? 3 : 0 }}</div><div class="text-[7.5px] text-muted">待随访</div></div>
          </div>
        </div>
        <button class="tap flex w-full items-center justify-center gap-1 rounded-xl border border-brand-600/20 bg-white py-2.5 text-[10px] font-bold text-brand-700" @click="store.setView('a-camps')">管理营期与批次 <ChevronRight class="h-3.5 w-3.5" /></button>
      </div>

      <!-- 账号总表 -->
      <div v-else-if="mode === 'accounts'" class="px-4 pt-3 pb-8 space-y-2">
        <div class="grid grid-cols-4 gap-1.5">
          <div v-for="r in ['student', 'doctor', 'coach', 'dietitian']" :key="r" class="soft-card rounded-xl p-2 text-center">
            <div class="text-[15px] font-extrabold text-ink">{{ store.data.accounts.filter((a) => a.role === r).length }}</div>
            <div class="text-[8px] text-muted">{{ roleLabel[r] }}</div>
          </div>
        </div>
        <div v-for="a in accounts" :key="a.id" class="glass-card flex items-center gap-2.5 rounded-2xl p-2.5">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[10px] font-extrabold text-brand-700">{{ a.name.slice(0, 1) }}</span>
          <div class="min-w-0 flex-1"><div class="flex items-center gap-1"><span class="text-[10.5px] font-bold text-ink">{{ a.name }}</span><span class="pill" :class="roleTone[a.role]">{{ roleLabel[a.role] }}</span><span v-if="!a.active" class="pill pill-coral">禁用</span></div><div class="text-[8.5px] text-muted">{{ a.phone }} · {{ store.data.orgs.find((o) => o.id === a.orgId)?.shortName }}</div></div>
        </div>
      </div>

      <!-- 奖品总览 -->
      <div v-else-if="mode === 'rewards'" class="px-4 pt-3 pb-8 space-y-3">
        <div class="rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800">一级规则由国际医院统一维护；奖品与商品的具体库存可由机构管理员在授权范围内调整。</div>
        <div>
          <SectionHead title="连续打卡奖品" :sub="`${store.data.rewardTiers.length} 档`" />
          <div class="space-y-1.5">
            <div v-for="t in store.data.rewardTiers" :key="t.id" class="glass-card flex items-center gap-2 rounded-xl p-2.5">
              <span class="text-[18px]">{{ t.icon }}</span>
              <div class="min-w-0 flex-1"><div class="text-[10px] font-bold text-ink">{{ t.name }}</div><div class="text-[8px] text-muted">{{ t.days }} 天 · 库存 {{ t.stock }} · 已领 {{ t.claimed }}</div></div>
              <span class="pill" :class="t.active ? 'pill-green' : 'pill-slate'">{{ t.active ? '上架' : '下架' }}</span>
            </div>
          </div>
        </div>
        <div>
          <SectionHead title="商城商品" :sub="`${store.data.products.length} 件`" />
          <div class="grid grid-cols-2 gap-2">
            <div v-for="p in store.data.products" :key="p.id" class="soft-card rounded-xl p-2.5">
              <div class="flex items-center gap-1.5"><span class="text-[16px]">{{ p.icon }}</span><span class="truncate text-[9.5px] font-bold text-ink">{{ p.name }}</span></div>
              <div class="mt-1 flex items-center justify-between text-[8.5px]"><span class="flex items-center gap-0.5 text-coral-500"><Flower2 class="h-2.5 w-2.5" />{{ p.flowers }}</span><span class="text-muted">余 {{ p.stock }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 营期 -->
      <div v-else-if="mode === 'camps'" class="px-4 pt-3 pb-8 space-y-2">
        <div class="rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800">支持分批开营：同一营期下按企业/班组拆批次，名单与账号独立导入。</div>
        <div v-for="c in store.data.camps" :key="c.id" class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center gap-2"><CalendarDays class="h-4 w-4 text-brand-600" /><div class="min-w-0 flex-1"><div class="text-[11px] font-extrabold text-ink">{{ c.name }}</div><div class="text-[9px] text-muted">{{ c.batch }} · {{ c.studentCount }} 人</div></div><span class="pill" :class="c.status === 'active' ? 'pill-green' : 'pill-slate'">{{ c.status === 'active' ? '进行中' : '筹备中' }}</span></div>
          <div class="mt-2 flex flex-wrap gap-1"><span v-for="cp in c.checkpoints" :key="cp.key" class="pill" :class="cp.status === 'done' ? 'pill-green' : 'pill-slate'">{{ cp.label }} {{ cp.date.slice(5) }}</span></div>
          <div class="mt-2 flex gap-2"><button class="flex-1 rounded-lg bg-brand-50 py-1.5 text-[9px] font-bold text-brand-700">导入名单</button><button class="flex-1 rounded-lg bg-mist py-1.5 text-[9px] font-bold text-muted">批次设置</button></div>
        </div>
      </div>

      <!-- 活动 -->
      <div v-else class="px-4 pt-3 pb-8 space-y-2">
        <div class="rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800">活动由国际医院统一配置，机构可在授权范围内开关；所有参与记录线上留痕。</div>
        <div v-for="a in store.data.activities" :key="a.id" class="glass-card rounded-2xl p-3">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Activity class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="text-[10.5px] font-bold text-ink">{{ a.name }}</span><span class="pill pill-slate">{{ phaseLabel[a.phase] }}</span></div><div class="text-[8.5px] text-muted">{{ a.type }} · {{ a.window }}</div></div>
            <button class="flex items-center gap-1 text-[9px] font-bold" :class="store.data.config.activitySwitch[a.id] ? 'text-brand-700' : 'text-muted'" @click="toggleActivity(a.id)">
              <component :is="store.data.config.activitySwitch[a.id] ? ToggleRight : ToggleLeft" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <Sheet v-model:show="showOrg" title="新增机构" sub="机构管理员由超级管理员分配">
      <div class="space-y-3">
        <div><div class="mb-1 text-[10px] font-bold text-muted">机构全称</div><Input v-model:value="orgForm.name" /></div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">简称</div><Input v-model:value="orgForm.shortName" /></div>
        <div class="grid grid-cols-2 gap-2">
          <div><div class="mb-1 text-[10px] font-bold text-muted">城市</div><Input v-model:value="orgForm.city" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">联系人</div><Input v-model:value="orgForm.contact" /></div>
        </div>
        <Button class="w-full" size="lg" @click="addOrg"><Plus class="h-4 w-4" /> 创建机构</Button>
      </div>
    </Sheet>
  </div>
</template>
