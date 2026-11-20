<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import {
  Box, CheckCircle2, ChevronRight, Flower2, Gift, MapPin, Package, Truck, Wallet,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, ProgressBar, Sheet } from '../../components/ui';
import type { Product } from '../../types';

const props = withDefaults(defineProps<{ initialTab?: 'mall' | 'rewards'; standalone?: boolean }>(), { initialTab: 'mall', standalone: false });
const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const tab = ref<'mall' | 'rewards'>(props.initialTab);
const cat = ref('全部');
const balance = computed(() => store.flowers(sid.value));
const cats = computed(() => ['全部', ...Array.from(new Set(store.data.products.map((p) => p.category)))]);
const products = computed(() => store.data.products.filter((p) => p.active && (cat.value === '全部' || p.category === cat.value)));
const exchanges = computed(() => store.data.exchanges.filter((e) => e.studentId === sid.value));
const claims = computed(() => store.data.rewardClaims.filter((c) => c.studentId === sid.value));
const tiers = computed(() => store.data.rewardTiers);
const selected = ref<Product | null>(null);
const show = ref(false);
const delivery = ref<'shipped' | 'in-person'>('shipped');
const address = ref('北京市昌平区回龙观龙域中心 A 座 1201');

function openProduct(p: Product) {
  selected.value = p;
  delivery.value = p.delivery[0];
  show.value = true;
}
function doExchange() {
  if (!selected.value) return;
  if (delivery.value === 'shipped' && address.value.trim().length < 6) { showToast('请填写完整收货地址'); return; }
  const res = store.exchangeProduct(selected.value.id, delivery.value, delivery.value === 'shipped' ? address.value : undefined);
  showToast({ message: res.message, position: 'bottom' });
  if (res.ok) show.value = false;
}
function claim(tierId: string) {
  store.claimReward(tierId);
  showToast({ message: '已提交领取，等待发放', position: 'bottom' });
}
const statusText: Record<string, string> = { pending: '待发放', shipped: '已发货', received: '已领取', cancelled: '已取消', unlocked: '待领取' };
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar :title="standalone && tab === 'rewards' ? '我的奖励' : '小红花商城'" :on-back="store.back">
      <template #right>
        <span class="flex items-center gap-1 text-[11px] font-extrabold text-brand-700"><Flower2 class="h-3.5 w-3.5" /> {{ balance }}</span>
      </template>
    </NavBar>

    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="hero-card rounded-[24px] p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-bold tracking-[0.14em] text-white/55">FLOWER WALLET</div>
              <div class="mt-1 flex items-end gap-1.5"><span class="stat-num text-[34px]">{{ balance }}</span><span class="mb-1 text-[10px] text-white/65">朵可用</span></div>
              <div class="mt-1 text-[9px] text-white/55">1 朵 = {{ store.data.config.flowerRate }} 元 · 不可提现</div>
            </div>
            <button class="tap flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10" @click="store.setView('s-points')">
              <Wallet class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="!standalone" class="mt-3 px-4">
        <div class="seg-tabs">
          <button class="seg-tab" :class="tab === 'mall' ? 'active' : ''" @click="tab = 'mall'">小红花商城</button>
          <button class="seg-tab" :class="tab === 'rewards' ? 'active' : ''" @click="tab = 'rewards'">我的奖励</button>
        </div>
      </div>

      <!-- 商城 -->
      <div v-if="tab === 'mall'" class="mt-3 px-4">
        <div class="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="c in cats" :key="c" class="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold" :class="cat === c ? 'bg-brand-600 text-white' : 'bg-white/75 text-muted'" @click="cat = c">{{ c }}</button>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2.5">
          <button v-for="p in products" :key="p.id" class="tap soft-card overflow-hidden rounded-2xl text-left" @click="openProduct(p)">
            <div class="flex h-[92px] items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#edf6fc,#f8fbfa)] text-[28px] font-extrabold text-brand-700">{{ p.icon }}</div>
            <div class="p-2.5">
              <div class="line-clamp-1 text-[11px] font-extrabold text-ink">{{ p.name }}</div>
              <div class="mt-0.5 line-clamp-1 text-[8.5px] text-muted">{{ p.desc }}</div>
              <div class="mt-1.5 flex items-center justify-between">
                <span class="flex items-center gap-0.5 text-[13px] font-extrabold text-coral-500"><Flower2 class="h-3.5 w-3.5" />{{ p.flowers }}</span>
                <span class="text-[8px] text-muted">余 {{ p.stock }}</span>
              </div>
            </div>
          </button>
        </div>
        <div class="mt-3 flex items-center gap-2 rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3 py-2 text-[9px] leading-relaxed text-brand-800/75">
          <Truck class="h-3.5 w-3.5 shrink-0" /> 支持邮寄或线下领取；库存、限兑次数由国际医院/机构管理员配置。
        </div>
      </div>

      <!-- 我的奖励 -->
      <div v-else class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div class="section-title"><Gift class="h-4 w-4 text-amber-500" /> 连续打卡奖励</div>
            <span class="text-[9px] text-muted">当前连续 {{ store.streak(sid) }} 天</span>
          </div>
          <div class="mt-2 space-y-2">
            <div v-for="t in tiers" :key="t.id" class="rounded-xl border border-black/[0.05] p-2.5">
              <div class="flex items-center gap-2">
                <span class="text-[20px]">{{ t.icon }}</span>
                <div class="min-w-0 flex-1">
                  <div class="text-[10.5px] font-bold text-ink">{{ t.name }}</div>
                  <div class="mt-0.5 text-[8.5px] text-muted">{{ t.desc }}</div>
                </div>
                <button v-if="store.streak(sid) >= t.days" class="rounded-full bg-brand-600 px-2.5 py-1 text-[9px] font-bold text-white" @click="claim(t.id)">领取</button>
                <span v-else class="text-[9px] font-semibold text-muted">差 {{ t.days - store.streak(sid) }} 天</span>
              </div>
              <div class="mt-1.5"><ProgressBar :value="Math.min(store.streak(sid), t.days)" :max="t.days" :height="4" /></div>
            </div>
          </div>
        </div>

        <div v-if="claims.length" class="glass-card rounded-2xl p-3.5">
          <div class="text-[11.5px] font-extrabold text-ink">领取记录</div>
          <div v-for="c in claims" :key="c.id" class="mt-2 flex items-center gap-2 border-t border-black/[0.05] pt-2 text-[10px]">
            <Gift class="h-3.5 w-3.5 text-amber-500" />
            <span class="flex-1 text-ink">{{ c.tierName }}</span>
            <span class="pill" :class="c.status === 'shipped' ? 'pill-green' : 'pill-amber'">{{ statusText[c.status] }}</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <div class="text-[11.5px] font-extrabold text-ink">兑换记录</div>
          <div v-if="!exchanges.length" class="py-6 text-center text-[10px] text-muted">还没有兑换记录</div>
          <div v-for="e in exchanges" :key="e.id" class="mt-2 flex items-center gap-2 border-t border-black/[0.05] pt-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Package class="h-4 w-4" /></div>
            <div class="min-w-0 flex-1">
              <div class="text-[10.5px] font-bold text-ink">{{ e.productName }}</div>
              <div class="text-[8.5px] text-muted">{{ e.date.slice(0, 10) }} · {{ e.delivery === 'shipped' ? '邮寄' : '线下领取' }} {{ e.trackingNo || '' }}</div>
            </div>
            <span class="pill" :class="e.status === 'shipped' ? 'pill-green' : e.status === 'pending' ? 'pill-amber' : 'pill-slate'">{{ statusText[e.status] }}</span>
          </div>
        </div>
      </div>
    </div>

    <Sheet v-model:show="show" :title="selected?.name" :sub="selected ? `${selected.flowers} 朵小红花 · 余 ${selected.stock} 件` : ''">
      <div v-if="selected" class="space-y-3">
        <div class="flex items-center gap-3 rounded-2xl bg-mist p-3">
          <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-[30px]">{{ selected.icon }}</div>
          <div class="min-w-0 flex-1">
            <div class="text-[11px] leading-relaxed text-ink/80">{{ selected.desc }}</div>
            <div class="mt-1 text-[9px] text-muted">每人限兑 {{ selected.limitPerPerson }} 次</div>
          </div>
        </div>
        <div>
          <div class="mb-1.5 text-[10.5px] font-bold text-muted">领取方式</div>
          <div class="flex gap-2">
            <button v-for="d in selected.delivery" :key="d" class="flex-1 rounded-xl border py-2.5 text-[10.5px] font-bold" :class="delivery === d ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.07] text-muted'" @click="delivery = d">
              {{ d === 'shipped' ? '快递邮寄' : '线下领取' }}
            </button>
          </div>
        </div>
        <div v-if="delivery === 'shipped'">
          <div class="mb-1.5 flex items-center gap-1 text-[10.5px] font-bold text-muted"><MapPin class="h-3 w-3" /> 收货地址</div>
          <Input v-model:value="address" type="textarea" rows="2" autosize placeholder="省市区 + 详细地址" />
        </div>
        <div v-else class="rounded-xl bg-[#EDF5FA] px-3 py-2 text-[9.5px] leading-relaxed text-[#2C7DA0]">
          线下领取点：国际医院健康管理中心 3 层服务台，凭领取码核销。
        </div>
        <div class="flex items-center justify-between rounded-xl bg-mist px-3 py-2 text-[10px]">
          <span class="text-muted">兑换后余额</span>
          <span class="font-bold" :class="balance - (selected?.flowers || 0) < 0 ? 'text-coral-500' : 'text-brand-700'">{{ balance - (selected?.flowers || 0) }} 朵</span>
        </div>
        <Button class="w-full" size="lg" :disabled="balance < (selected?.flowers || 0) || selected.stock <= 0" @click="doExchange">
          {{ balance < (selected?.flowers || 0) ? '小红花不足' : selected.stock <= 0 ? '库存不足' : '确认兑换' }}
        </Button>
      </div>
    </Sheet>
  </div>
</template>
