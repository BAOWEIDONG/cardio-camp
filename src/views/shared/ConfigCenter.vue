<script setup lang="ts">
import { computed, ref } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import {
  Activity, CalendarDays, ChevronDown, ChevronUp, Edit3, Flower2, Gift, Package,
  Plus, Save, Search, Settings2, ToggleLeft, ToggleRight, UserPlus, Users,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, RiskBadge, SectionHead, Sheet } from '../../components/ui';
import type { Account, Camp, MetricDef, Product, RewardTier } from '../../types';

const props = defineProps<{ mode: 'rewards' | 'products' | 'accounts' | 'metrics' | 'camps' }>();
const store = useAppStore();
const titles = { rewards: '连续打卡奖品', products: '商城商品配置', accounts: '账号管理', metrics: '指标库配置', camps: '营期管理' };
const title = computed(() => titles[props.mode]);
const keyword = ref('');
const roleFilter = ref<'all' | 'student' | 'doctor' | 'coach' | 'dietitian'>('all');

// 奖品
const tier = ref<RewardTier | null>(null);
const showTier = ref(false);
function editTier(t: RewardTier) { tier.value = { ...t }; showTier.value = true; }
function saveTier() {
  if (!tier.value) return;
  const i = store.data.rewardTiers.findIndex((x) => x.id === tier.value!.id);
  if (i >= 0) store.data.rewardTiers[i] = { ...tier.value };
  showTier.value = false;
  showToast('奖品配置已保存');
}
function toggleTier(t: RewardTier) {
  showConfirmDialog({
    title: t.active ? '下架奖品' : '上架奖品',
    message: t.active
      ? `下架「${t.name}」后，学员端将不可见、不可兑换；已解锁/已领取记录不受影响。`
      : `上架「${t.name}」后，达到 ${t.days} 天连续打卡的学员可解锁领取。`,
    confirmButtonText: t.active ? '确认下架' : '确认上架',
  }).then(() => { t.active = !t.active; showToast('状态已更新'); }).catch(() => {});
}
function move(id: string, dir: -1 | 1) { store.reorderTier(id, dir); }

// 商品
const product = ref<Product | null>(null);
const showProduct = ref(false);
function editProduct(p: Product) { product.value = { ...p, delivery: [...p.delivery] }; showProduct.value = true; }
function saveProduct() {
  if (!product.value) return;
  const i = store.data.products.findIndex((x) => x.id === product.value!.id);
  if (i >= 0) store.data.products[i] = { ...product.value };
  showProduct.value = false;
  showToast('商品配置已保存');
}
function toggleProduct(p: Product) {
  showConfirmDialog({
    title: p.active ? '下架商品' : '上架商品',
    message: p.active ? `下架「${p.name}」后学员端不可见；已兑换订单不受影响。` : `上架「${p.name}」后学员可用小红花兑换。`,
    confirmButtonText: p.active ? '确认下架' : '确认上架',
  }).then(() => { p.active = !p.active; showToast('状态已更新'); }).catch(() => {});
}

// 账号
const accounts = computed(() => store.data.accounts.filter((a) =>
  (roleFilter.value === 'all' || a.role === roleFilter.value) &&
  (!keyword.value || a.name.includes(keyword.value) || a.phone.includes(keyword.value)),
));
const showAcc = ref(false);
const accForm = ref({ name: '', phone: '', role: 'student' as Account['role'], title: '' });
function saveAcc() {
  if (accForm.value.name.trim().length < 2 || accForm.value.phone.length !== 11) { showToast('请填写姓名与 11 位手机号'); return; }
  store.addAccount({ ...accForm.value, orgId: store.currentUser?.orgId || 'org1' });
  showAcc.value = false;
  accForm.value = { name: '', phone: '', role: 'student', title: '' };
  showToast('账号已创建，初始密码为手机号后 6 位');
}
function toggleAcc(a: Account) {
  showConfirmDialog({
    title: a.active ? '禁用账号' : '启用账号',
    message: a.active ? `禁用「${a.name}」后该手机号将无法登录，历史数据保留。` : `启用「${a.name}」后可使用手机号登录。`,
    confirmButtonText: a.active ? '确认禁用' : '确认启用',
  }).then(() => { store.toggleAccount(a.id); showToast('账号状态已更新'); }).catch(() => {});
}
const roleLabel: Record<string, string> = { student: '学员', doctor: '医师', coach: '运动师', dietitian: '营养师', org_admin: '机构管理员', super_admin: '超级管理员' };

// 指标
const metric = ref<MetricDef | null>(null);
const showMetric = ref(false);
function editMetric(m: MetricDef) { metric.value = { ...m }; showMetric.value = true; }
function saveMetric() {
  if (!metric.value) return;
  const i = store.data.metrics.findIndex((x) => x.key === metric.value!.key);
  if (i >= 0) store.data.metrics[i] = { ...metric.value };
  showMetric.value = false;
  showToast('指标口径已保存');
}
const metricGroups = computed(() => {
  const g: Record<string, MetricDef[]> = {};
  store.data.metrics.forEach((m) => (g[m.category] ||= []).push(m));
  return g;
});

// 营期
const showCamp = ref(false);
const campForm = ref({ name: '', start: '2027-03-01', end: '2028-02-29', batch: '2027 春季批次' });
function saveCamp() {
  if (!campForm.value.name.trim()) { showToast('请填写营期名称'); return; }
  const c: Camp = {
    id: `camp_${Date.now()}`, name: campForm.value.name, orgId: store.currentUser?.orgId || 'org1',
    startDate: campForm.value.start, endDate: campForm.value.end, status: 'upcoming', batch: campForm.value.batch,
    intensiveEnd: campForm.value.start, checkpoints: [
      { key: 'baseline', label: '开营筛查', date: campForm.value.start, status: 'upcoming' },
      { key: 'month6', label: '第 6 个月复筛', date: campForm.value.start, status: 'upcoming' },
      { key: 'closing', label: '结营复查', date: campForm.value.end, status: 'upcoming' },
    ], studentCount: 0,
  };
  store.data.camps.push(c);
  showCamp.value = false;
  showToast('营期已创建，等待导入名单');
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar :title="title" :on-back="store.back">
      <template #right>
        <button v-if="mode === 'accounts'" class="flex items-center gap-1 text-[10px] font-bold text-brand-700" @click="showAcc = true"><UserPlus class="h-3.5 w-3.5" /> 新增</button>
        <button v-else-if="mode === 'camps'" class="flex items-center gap-1 text-[10px] font-bold text-brand-700" @click="showCamp = true"><Plus class="h-3.5 w-3.5" /> 建营</button>
      </template>
    </NavBar>

    <div class="page-scroll no-tabbar">
      <div v-if="mode === 'rewards'" class="px-4 pt-3">
        <div class="rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800">
          连续打卡档位与奖品由营养师配置；下架不影响已解锁学员的领取资格（快照机制）。
        </div>
        <div class="mt-3 space-y-2">
          <div v-for="(t, i) in store.data.rewardTiers" :key="t.id" class="glass-card rounded-2xl p-3">
            <div class="flex items-center gap-2.5">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[20px]">{{ t.icon }}</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5"><span class="text-[11px] font-extrabold text-ink">{{ t.name }}</span><span class="pill" :class="t.active ? 'pill-green' : 'pill-slate'">{{ t.active ? '上架' : '下架' }}</span></div>
                <div class="mt-0.5 text-[9px] text-muted">连续 {{ t.days }} 天 · 库存 {{ t.stock }} · 已领 {{ t.claimed }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <button class="rounded-lg bg-black/[0.03] p-1" @click="move(t.id, -1)"><ChevronUp class="h-3 w-3 text-muted" /></button>
                <button class="rounded-lg bg-black/[0.03] p-1" @click="move(t.id, 1)"><ChevronDown class="h-3 w-3 text-muted" /></button>
              </div>
            </div>
            <div class="mt-2 flex gap-2">
              <button class="flex-1 rounded-lg border border-black/[0.06] py-1.5 text-[9px] font-bold text-muted" @click="editTier(t)"><Edit3 class="mr-0.5 inline h-3 w-3" /> 编辑</button>
              <button class="flex-1 rounded-lg border py-1.5 text-[9px] font-bold" :class="t.active ? 'border-coral-200/60 text-coral-600' : 'border-brand-600/20 text-brand-700'" @click="toggleTier(t)">
                <component :is="t.active ? ToggleRight : ToggleLeft" class="mr-0.5 inline h-3 w-3" /> {{ t.active ? '下架' : '上架' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="mode === 'products'" class="px-4 pt-3">
        <div class="rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800">
          小红花商城商品：1 朵 = {{ store.data.config.flowerRate }} 元等值。库存、限兑次数、领取方式与上下架均在此配置。
        </div>
        <div class="mt-3 space-y-2">
          <div v-for="p in store.data.products" :key="p.id" class="glass-card rounded-2xl p-3">
            <div class="flex items-center gap-2.5">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-[20px]">{{ p.icon }}</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5"><span class="text-[11px] font-extrabold text-ink">{{ p.name }}</span><span class="pill" :class="p.active ? 'pill-green' : 'pill-slate'">{{ p.active ? '上架' : '下架' }}</span></div>
                <div class="mt-0.5 text-[9px] text-muted"><Flower2 class="inline h-2.5 w-2.5" /> {{ p.flowers }} · 库存 {{ p.stock }} · 限兑 {{ p.limitPerPerson }}</div>
              </div>
              <span class="text-[9px] text-muted">{{ p.category }}</span>
            </div>
            <div class="mt-2 flex gap-2">
              <button class="flex-1 rounded-lg border border-black/[0.06] py-1.5 text-[9px] font-bold text-muted" @click="editProduct(p)"><Edit3 class="mr-0.5 inline h-3 w-3" /> 编辑</button>
              <button class="flex-1 rounded-lg border py-1.5 text-[9px] font-bold" :class="p.active ? 'border-coral-200/60 text-coral-600' : 'border-brand-600/20 text-brand-700'" @click="toggleProduct(p)">
                <component :is="p.active ? ToggleRight : ToggleLeft" class="mr-0.5 inline h-3 w-3" /> {{ p.active ? '下架' : '上架' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="mode === 'accounts'" class="px-4 pt-3">
        <div class="flex items-center gap-2">
          <div class="flex flex-1 items-center gap-2 rounded-xl border border-black/[0.05] bg-white/80 px-3 py-2">
            <Search class="h-4 w-4 text-muted/50" /><input v-model="keyword" class="flex-1 bg-transparent text-[11px] outline-none" placeholder="姓名或手机号" />
          </div>
        </div>
        <div class="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="r in [{ k: 'all', l: '全部' }, { k: 'student', l: '学员' }, { k: 'doctor', l: '医师' }, { k: 'coach', l: '运动师' }, { k: 'dietitian', l: '营养师' }]" :key="r.k" class="shrink-0 rounded-full px-2.5 py-1.5 text-[9.5px] font-bold" :class="roleFilter === r.k ? 'bg-brand-600 text-white' : 'bg-white/70 text-muted'" @click="roleFilter = r.k as any">{{ r.l }}</button>
        </div>
        <div class="mt-2 space-y-2 pb-8">
          <div v-for="a in accounts" :key="a.id" class="glass-card flex items-center gap-2.5 rounded-2xl p-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-[11px] font-extrabold text-brand-700">{{ a.name.slice(0, 1) }}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="text-[11px] font-bold text-ink">{{ a.name }}</span><span class="pill pill-slate">{{ roleLabel[a.role] }}</span><span v-if="!a.active" class="pill pill-coral">禁用</span></div>
              <div class="mt-0.5 text-[9px] text-muted">{{ a.phone }} · {{ a.title || a.dept || '' }}</div>
            </div>
            <button class="rounded-full px-2 py-1 text-[8.5px] font-bold" :class="a.active ? 'bg-coral-50 text-coral-600' : 'bg-brand-50 text-brand-700'" @click="toggleAcc(a)">{{ a.active ? '禁用' : '启用' }}</button>
          </div>
        </div>
      </div>

      <div v-else-if="mode === 'metrics'" class="px-4 pt-3 pb-8">
        <div class="rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800">
          指标库支持心血管专项指标、单位、参考区间、异常判定方向；第 6 个月与结营复筛沿用同一口径。
        </div>
        <div v-for="(items, cat) in metricGroups" :key="cat" class="mt-3">
          <SectionHead :title="cat" :sub="`${items.length} 项`" />
          <div class="glass-card divide-y divide-black/[0.045] overflow-hidden rounded-2xl">
            <button v-for="m in items" :key="m.key" class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left" @click="editMetric(m)">
              <div class="min-w-0 flex-1"><div class="text-[10.5px] font-semibold text-ink">{{ m.name }} <span class="text-[8.5px] text-muted">{{ m.unit }}</span></div><div class="text-[8.5px] text-muted">参考 {{ m.refText }} · {{ m.direction === 'lower' ? '越低越好' : m.direction === 'higher' ? '越高越好' : '区间内' }}</div></div>
              <Edit3 class="h-3.5 w-3.5 text-muted/40" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="px-4 pt-3 pb-8">
        <div class="rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800">
          营期按 12 个月配置，含 21 天强化期与三次入企筛查节点；创建后可导入名单并分批开营。
        </div>
        <div class="mt-3 space-y-2">
          <div v-for="c in store.data.camps" :key="c.id" class="glass-card rounded-2xl p-3.5">
            <div class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="c.status === 'active' ? 'bg-brand-50 text-brand-700' : 'bg-black/[0.04] text-muted'"><CalendarDays class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="text-[11px] font-extrabold text-ink">{{ c.name }}</span><span class="pill" :class="c.status === 'active' ? 'pill-green' : 'pill-slate'">{{ c.status === 'active' ? '进行中' : '筹备中' }}</span></div><div class="mt-0.5 text-[9px] text-muted">{{ c.startDate }} 至 {{ c.endDate }} · {{ c.batch }}</div></div>
              <span class="text-[9px] text-muted">{{ c.studentCount }} 人</span>
            </div>
            <div class="mt-2 flex gap-1.5">
              <span v-for="cp in c.checkpoints" :key="cp.key" class="pill" :class="cp.status === 'done' ? 'pill-green' : 'pill-slate'">{{ cp.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 奖品编辑 -->
    <Sheet v-model:show="showTier" title="编辑奖品" sub="保存后立即生效">
      <div v-if="tier" class="space-y-3">
        <div><div class="mb-1 text-[10px] font-bold text-muted">奖品名称</div><Input v-model:value="tier.name" /></div>
        <div class="grid grid-cols-2 gap-2">
          <div><div class="mb-1 text-[10px] font-bold text-muted">连续天数</div><Input v-model:value="tier.days as any" type="number" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">库存</div><Input v-model:value="tier.stock as any" type="number" /></div>
        </div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">说明</div><Input v-model:value="tier.desc" type="textarea" rows="2" autosize /></div>
        <Button class="w-full" size="lg" @click="saveTier"><Save class="h-4 w-4" /> 保存配置</Button>
      </div>
    </Sheet>

    <!-- 商品编辑 -->
    <Sheet v-model:show="showProduct" title="编辑商品" sub="保存后立即生效">
      <div v-if="product" class="space-y-3">
        <div><div class="mb-1 text-[10px] font-bold text-muted">商品名称</div><Input v-model:value="product.name" /></div>
        <div class="grid grid-cols-2 gap-2">
          <div><div class="mb-1 text-[10px] font-bold text-muted">所需小红花</div><Input v-model:value="product.flowers as any" type="number" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">库存</div><Input v-model:value="product.stock as any" type="number" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">每人限兑</div><Input v-model:value="product.limitPerPerson as any" type="number" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">分类</div><Input v-model:value="product.category" /></div>
        </div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">商品说明</div><Input v-model:value="product.desc" type="textarea" rows="2" autosize /></div>
        <Button class="w-full" size="lg" @click="saveProduct"><Save class="h-4 w-4" /> 保存配置</Button>
      </div>
    </Sheet>

    <!-- 账号新增 -->
    <Sheet v-model:show="showAcc" title="新增账号" sub="手机号为唯一登录凭证">
      <div class="space-y-3">
        <div><div class="mb-1 text-[10px] font-bold text-muted">姓名</div><Input v-model:value="accForm.name" /></div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">手机号</div><Input v-model:value="accForm.phone" type="tel" maxlength="11" /></div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">角色</div>
          <div class="grid grid-cols-3 gap-1.5">
            <button v-for="r in [{ k: 'student', l: '学员' }, { k: 'doctor', l: '医师' }, { k: 'coach', l: '运动师' }, { k: 'dietitian', l: '营养师' }, { k: 'org_admin', l: '机构管理员' }]" :key="r.k" class="rounded-lg border py-1.5 text-[9px] font-bold" :class="accForm.role === r.k ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.06] text-muted'" @click="accForm.role = r.k as any">{{ r.l }}</button>
          </div>
        </div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">职务 / 科室</div><Input v-model:value="accForm.title" /></div>
        <Button class="w-full" size="lg" @click="saveAcc"><UserPlus class="h-4 w-4" /> 创建账号</Button>
      </div>
    </Sheet>

    <!-- 指标编辑 -->
    <Sheet v-model:show="showMetric" title="编辑指标口径" :sub="metric?.name">
      <div v-if="metric" class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <div><div class="mb-1 text-[10px] font-bold text-muted">参考区间文案</div><Input v-model:value="metric.refText" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">单位</div><Input v-model:value="metric.unit" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">参考下限</div><Input v-model:value="metric.refLow as any" type="number" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">参考上限</div><Input v-model:value="metric.refHigh as any" type="number" /></div>
        </div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">异常判定方向</div>
          <div class="grid grid-cols-3 gap-1.5">
            <button v-for="d in [{ k: 'lower', l: '越低越好' }, { k: 'higher', l: '越高越好' }, { k: 'range', l: '区间内' }]" :key="d.k" class="rounded-lg border py-1.5 text-[9px] font-bold" :class="metric.direction === d.k ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.06] text-muted'" @click="metric.direction = d.k as any">{{ d.l }}</button>
          </div>
        </div>
        <Button class="w-full" size="lg" @click="saveMetric"><Save class="h-4 w-4" /> 保存口径</Button>
      </div>
    </Sheet>

    <!-- 营期新建 -->
    <Sheet v-model:show="showCamp" title="创建营期" sub="12 个月周期，三次入企筛查">
      <div class="space-y-3">
        <div><div class="mb-1 text-[10px] font-bold text-muted">营期名称</div><Input v-model:value="campForm.name" placeholder="如：心脑血管防治营 · 第二期" /></div>
        <div class="grid grid-cols-2 gap-2">
          <div><div class="mb-1 text-[10px] font-bold text-muted">开营日期</div><Input v-model:value="campForm.start" type="date" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">结营日期</div><Input v-model:value="campForm.end" type="date" /></div>
        </div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">批次</div><Input v-model:value="campForm.batch" /></div>
        <Button class="w-full" size="lg" @click="saveCamp"><Plus class="h-4 w-4" /> 创建营期</Button>
      </div>
    </Sheet>
  </div>
</template>
