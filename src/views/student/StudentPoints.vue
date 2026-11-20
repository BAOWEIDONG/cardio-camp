<script setup lang="ts">
import { computed, ref } from 'vue';
import { Award, ChevronRight, Crown, Flower2, Info, TrendingUp, Trophy } from 'lucide-vue-next';
import { showDialog } from 'vant';
import { useAppStore } from '../../store/app';
import { NavBar, ProgressBar, SectionHead } from '../../components/ui';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const tab = ref<'ledger' | 'rank'>('ledger');
const ledger = computed(() => [...store.data.ledger].filter((l) => l.studentId === sid.value).sort((a, b) => b.date.localeCompare(a.date)));
const balance = computed(() => store.flowers(sid.value));
const earned = computed(() => ledger.value.filter((l) => l.amount > 0).reduce((n, l) => n + l.amount, 0));
const spent = computed(() => Math.abs(ledger.value.filter((l) => l.amount < 0).reduce((n, l) => n + l.amount, 0)));
const rank = computed(() => store.rankList);
const myRank = computed(() => rank.value.find((r) => r.student.id === sid.value));
const rules = () => showDialog({
  title: '小红花规则',
  message: '1 朵小红花 = 1 元人民币等值，仅用于兑换健康礼品，不可提现。\n\n获取：血压/体重打卡 +2，运动打卡 +5，三餐打卡 +3，完成挑战 +20~50，线下活动 +50。\n\n兑换比例、奖品库存与上下架由北京大学国际医院统一配置，二级机构可在授权范围内调整。',
  confirmButtonText: '知道了',
});
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="小红花" :on-back="store.back">
      <template #right><button class="text-[10px] font-bold text-brand-700" @click="rules">规则</button></template>
    </NavBar>

    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="hero-card rounded-[24px] p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-bold tracking-[0.14em] text-white/55">MY FLOWERS</div>
              <div class="mt-1 flex items-end gap-1.5"><span class="stat-num text-[36px]">{{ balance }}</span><span class="mb-1 text-[10px] text-white/65">朵</span></div>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10"><Flower2 class="h-6 w-6" /></div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[9px] text-white/55">累计获得</div><div class="mt-0.5 text-[15px] font-extrabold tabular">{{ earned }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[9px] text-white/55">累计使用</div><div class="mt-0.5 text-[15px] font-extrabold tabular">{{ spent }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[9px] text-white/55">当前排名</div><div class="mt-0.5 text-[15px] font-extrabold tabular">第 {{ myRank?.rank || '—' }}</div></div>
          </div>
        </div>
      </div>

      <div class="mt-3 px-4">
        <div class="seg-tabs">
          <button class="seg-tab" :class="tab === 'ledger' ? 'active' : ''" @click="tab = 'ledger'">明细</button>
          <button class="seg-tab" :class="tab === 'rank' ? 'active' : ''" @click="tab = 'rank'">排行</button>
        </div>
      </div>

      <div v-if="tab === 'ledger'" class="mt-3 px-4">
        <div class="glass-card overflow-hidden rounded-2xl">
          <div v-for="l in ledger" :key="l.id" class="flex items-center gap-2.5 border-b border-black/[0.045] px-3.5 py-2.5 last:border-0">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg" :class="l.amount > 0 ? 'bg-brand-50 text-brand-700' : 'bg-coral-50 text-coral-500'">
              <component :is="l.amount > 0 ? TrendingUp : Flower2" class="h-4 w-4" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-[10.5px] font-semibold text-ink">{{ l.reason }}</div>
              <div class="text-[8.5px] text-muted">{{ l.date }}</div>
            </div>
            <span class="text-[13px] font-extrabold tabular" :class="l.amount > 0 ? 'text-brand-700' : 'text-coral-500'">{{ l.amount > 0 ? '+' : '' }}{{ l.amount }}</span>
          </div>
        </div>
        <div class="mt-2 flex items-center gap-1.5 px-1 text-[9px] text-muted"><Info class="h-3 w-3" /> 仅本人可见明细，他人仅可查看总榜</div>
      </div>

      <div v-else class="mt-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="本期小红花榜" sub="同分并列，名次顺延" />
          <div class="mt-2 space-y-1">
            <div v-for="r in rank" :key="r.student.id" class="flex items-center gap-2.5 rounded-xl px-2 py-2" :class="r.student.id === sid ? 'bg-brand-50 ring-1 ring-brand-600/20' : ''">
              <span class="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-extrabold" :class="r.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-black/[0.04] text-muted'">
                <Crown v-if="r.rank === 1" class="h-3 w-3" /><span v-else>{{ r.rank }}</span>
              </span>
              <span class="text-[10.5px] font-semibold" :class="r.student.id === sid ? 'text-brand-800' : 'text-ink'">{{ r.student.name }}<span v-if="r.student.id === sid" class="ml-1 text-[8px] text-brand-600">(我)</span></span>
              <span class="ml-auto flex items-center gap-1 text-[11px] font-extrabold text-coral-500 tabular"><Flower2 class="h-3 w-3" />{{ r.flowers }}</span>
            </div>
          </div>
        </div>
        <div class="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-[9px] leading-relaxed text-muted">
          排名按累计获得小红花计算；兑换使用不影响榜单。
        </div>
      </div>
    </div>
  </div>
</template>
