<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import { Check, Gift, MapPin, Package, Truck, X } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, Sheet } from '../../components/ui';

const store = useAppStore();
const tab = ref<'reward' | 'exchange'>('reward');
const claims = computed(() => store.data.rewardClaims);
const exchanges = computed(() => store.data.exchanges);
const pendingRewards = computed(() => claims.value.filter((c) => c.status !== 'received' && c.status !== 'shipped'));
const pendingEx = computed(() => exchanges.value.filter((e) => e.status === 'pending'));
const show = ref(false);
const mode = ref<'reward' | 'exchange'>('reward');
const target = ref<string>('');
const tracking = ref('SF' + Date.now().toString().slice(-10));
function openShip(kind: 'reward' | 'exchange', id: string) { mode.value = kind; target.value = id; show.value = true; }
function ship() {
  if (!tracking.value.trim()) { showToast('请填写快递单号'); return; }
  if (mode.value === 'reward') store.shipClaim(target.value, tracking.value);
  else store.shipExchange(target.value, tracking.value);
  show.value = false;
  showToast({ message: '已发货并记录单号', position: 'bottom' });
}
function verify(id: string) { store.verifyExchange(id); showToast('线下核销完成'); }
function cancel(id: string) { store.cancelExchange(id); showToast('已取消并退回小红花'); }
const statusText: Record<string, string> = { unlocked: '待领取', pending: '待发放', shipped: '已发货', received: '已领取', cancelled: '已取消' };
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="发放中心" :on-back="store.back">
      <template #right><span class="text-[9px] text-muted">统一台账</span></template>
    </NavBar>
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="grid grid-cols-3 gap-2">
          <div class="soft-card rounded-xl p-2.5"><div class="text-[9px] text-muted">待发奖励</div><div class="text-[18px] font-extrabold text-amber-600 tabular">{{ pendingRewards.length }}</div></div>
          <div class="soft-card rounded-xl p-2.5"><div class="text-[9px] text-muted">待发兑换</div><div class="text-[18px] font-extrabold text-coral-500 tabular">{{ pendingEx.length }}</div></div>
          <div class="soft-card rounded-xl p-2.5"><div class="text-[9px] text-muted">已发货</div><div class="text-[18px] font-extrabold text-brand-700 tabular">{{ exchanges.filter((e) => e.status === 'shipped').length }}</div></div>
        </div>
        <div class="seg-tabs mt-3">
          <button class="seg-tab" :class="tab === 'reward' ? 'active' : ''" @click="tab = 'reward'">奖励发放</button>
          <button class="seg-tab" :class="tab === 'exchange' ? 'active' : ''" @click="tab = 'exchange'">兑换发货</button>
        </div>
      </div>

      <div v-if="tab === 'reward'" class="mt-3 space-y-2 px-4 pb-8">
        <div v-for="c in claims" :key="c.id" class="glass-card rounded-2xl p-3">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Gift class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1">
              <div class="text-[10.5px] font-bold text-ink">{{ c.tierName }}</div>
              <div class="text-[8.5px] text-muted">{{ c.studentId }} · {{ c.date.slice(0, 10) }} · 连续 {{ c.days }} 天</div>
            </div>
            <span class="pill" :class="c.status === 'shipped' ? 'pill-green' : c.status === 'received' ? 'pill-slate' : 'pill-amber'">{{ statusText[c.status] }}</span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <span v-if="c.trackingNo" class="text-[8.5px] text-muted">单号 {{ c.trackingNo }}</span>
            <button v-if="c.status !== 'shipped' && c.status !== 'received'" class="ml-auto rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700" @click="openShip('reward', c.id)"><Truck class="mr-0.5 inline h-3 w-3" /> 发货</button>
          </div>
        </div>
      </div>

      <div v-else class="mt-3 space-y-2 px-4 pb-8">
        <div v-for="e in exchanges" :key="e.id" class="glass-card rounded-2xl p-3">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Package class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1">
              <div class="text-[10.5px] font-bold text-ink">{{ e.productName }}</div>
              <div class="text-[8.5px] text-muted">{{ e.studentName }} · {{ e.flowers }} 朵 · {{ e.date.slice(5, 16) }}</div>
              <div v-if="e.address" class="mt-0.5 flex items-start gap-1 text-[8px] text-muted"><MapPin class="mt-0.5 h-2.5 w-2.5 shrink-0" />{{ e.address }}</div>
            </div>
            <span class="pill" :class="e.status === 'shipped' ? 'pill-green' : e.status === 'received' ? 'pill-slate' : e.status === 'cancelled' ? 'pill-coral' : 'pill-amber'">{{ statusText[e.status] }}</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <span v-if="e.trackingNo" class="text-[8.5px] text-muted">单号 {{ e.trackingNo }}</span>
            <div class="ml-auto flex gap-1.5">
              <button v-if="e.status === 'pending' && e.delivery === 'in-person'" class="rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700" @click="verify(e.id)"><Check class="mr-0.5 inline h-3 w-3" /> 核销</button>
              <button v-if="e.status === 'pending' && e.delivery === 'shipped'" class="rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700" @click="openShip('exchange', e.id)"><Truck class="mr-0.5 inline h-3 w-3" /> 发货</button>
              <button v-if="e.status === 'pending'" class="rounded-full bg-coral-50 px-2.5 py-1 text-[9px] font-bold text-coral-600" @click="cancel(e.id)">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Sheet v-model:show="show" title="填写快递单号" sub="发货后学员端可跟踪">
      <div class="space-y-3">
        <Input v-model:value="tracking" placeholder="如 SF1234567890" />
        <Button class="w-full" size="lg" @click="ship">确认发货</Button>
      </div>
    </Sheet>
  </div>
</template>
