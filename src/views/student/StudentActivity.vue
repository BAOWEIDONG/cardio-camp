<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Activity, Bell, ChevronRight, Flame, Flower2, Footprints, Gift, HeartPulse, Home,
  Image, Medal, Sparkles, Star, Target, Trophy, Video, Dumbbell, FileHeart,
} from 'lucide-vue-next';
import { showToast } from 'vant';
import { useAppStore } from '../../store/app';
import { BottomNav, NavBar, ProgressBar, SectionHead, Sheet } from '../../components/ui';
import type { ActivityDef } from '../../types';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const filter = ref<'all' | 'active' | 'upcoming'>('all');
const detail = ref<ActivityDef | null>(null);
const show = ref(false);
const unread = computed(() => store.unreadCount(sid.value));
const balance = computed(() => store.flowers(sid.value));
const acts = computed(() => store.data.activities.filter((a) => filter.value === 'all' || a.status === filter.value));
const tiers = computed(() => store.data.rewardTiers);
const streak = computed(() => store.streak(sid.value));
const nextTier = computed(() => tiers.value.find((t) => t.days > streak.value) || tiers.value[tiers.value.length - 1]);

const iconMap: Record<string, any> = {
  flame: Flame, dumbbell: Dumbbell, heart: HeartPulse, target: Target, star: Star,
  gift: Gift, image: Image, video: Video, trophy: Trophy, footprints: Footprints,
};

function openDetail(a: ActivityDef) {
  detail.value = a;
  show.value = true;
}
function goStreak() {
  document.getElementById('streak')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const navItems = [
  { key: 's-home' as const, label: '首页', icon: Home },
  { key: 's-activity' as const, label: '活动', icon: Trophy },
  { key: 's-messages' as const, label: '消息', icon: Bell },
  { key: 's-profile' as const, label: '档案', icon: FileHeart },
];
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="活动中心" :on-back="store.back">
      <template #right>
        <button class="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-brand-700" @click="store.setView('s-mall')">
          <Flower2 class="h-3.5 w-3.5" /> {{ balance }}
        </button>
      </template>
    </NavBar>

    <div class="page-scroll pb-[112px]">
      <!-- 小红花 -->
      <div class="px-4 pt-3">
        <div class="hero-card rounded-[24px] p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-white/60"><Flower2 class="h-3.5 w-3.5" /> 我的小红花</div>
              <div class="mt-1 flex items-end gap-1.5">
                <span class="stat-num text-[38px]">{{ balance }}</span>
                <span class="mb-1.5 text-[11px] font-semibold text-white/65">朵</span>
              </div>
              <div class="mt-1 text-[9.5px] text-white/60">1 朵 = {{ store.data.config.flowerRate }} 元 · 由国际医院统一配置</div>
            </div>
            <button class="tap rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-[10px] font-bold text-white" @click="store.setView('s-mall')">
              去兑换 <ChevronRight class="inline h-3 w-3" />
            </button>
          </div>
          <div class="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
            <Sparkles class="h-3.5 w-3.5 text-white/70" />
            <span class="text-[9.5px] text-white/70">打卡、完成挑战、参与线下活动都能获得；不可提现，仅兑换健康礼品。</span>
          </div>
        </div>
      </div>

      <!-- 活动中心四大入口（对齐 versionall ActivityHub） -->
      <div class="mt-3 grid grid-cols-4 gap-2 px-4">
        <button class="tap flex flex-col items-center gap-1.5 rounded-2xl border border-black/[0.04] bg-white/80 py-2.5" @click="goStreak">
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Flame class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-ink">连续打卡</span>
        </button>
        <button class="tap flex flex-col items-center gap-1.5 rounded-2xl border border-black/[0.04] bg-white/80 py-2.5" @click="store.setView('s-mall')">
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Flower2 class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-ink">小红花商城</span>
        </button>
        <button class="tap flex flex-col items-center gap-1.5 rounded-2xl border border-black/[0.04] bg-white/80 py-2.5" @click="store.setView('s-rewards')">
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-coral-50 text-coral-500"><Gift class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-ink">我的奖励</span>
        </button>
        <button class="tap flex flex-col items-center gap-1.5 rounded-2xl border border-black/[0.04] bg-white/80 py-2.5" @click="openDetail(store.data.activities.find((x) => x.id === 'act10')!)">
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDF5FA] text-[#2C7DA0]"><Footprints class="h-4 w-4" /></span>
          <span class="text-[9px] font-bold text-ink">一起走</span>
        </button>
      </div>

      <!-- 连续打卡 -->
      <div id="streak" class="mt-4 px-4">
        <SectionHead title="连续打卡挑战" sub="21 / 45 / 90 天三档，断卡重新累计">
          <template #icon><Flame class="h-4 w-4 text-amber-500" /></template>
        </SectionHead>
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] text-muted">当前连续</div>
              <div class="mt-0.5 flex items-end gap-1"><span class="stat-num text-[26px] text-ink">{{ streak }}</span><span class="mb-1 text-[10px] text-muted">天</span></div>
            </div>
            <div class="rounded-xl bg-amber-50 px-3 py-2 text-right">
              <div class="text-[9px] text-amber-700">距下一档</div>
              <div class="text-[12px] font-extrabold text-amber-700">{{ Math.max(0, nextTier.days - streak) }} 天</div>
            </div>
          </div>
          <div class="mt-3 flex gap-1.5">
            <div v-for="(t, i) in tiers" :key="t.id" class="flex-1">
              <div class="flex items-center justify-between text-[8px] text-muted"><span>{{ t.days }} 天</span><span v-if="streak >= t.days" class="font-bold text-brand-600">已达成</span></div>
              <div class="mt-1"><ProgressBar :value="Math.min(streak, t.days)" :max="t.days" :tone="streak >= t.days ? 'brand' : 'amber'" :height="5" /></div>
              <div class="mt-1 truncate text-[8.5px] font-semibold text-ink/70"><span class="font-extrabold text-brand-700">{{ t.icon }}</span> {{ t.name.split('·')[1] }}</div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-1.5 rounded-xl bg-mist px-2.5 py-1.5 text-[9px] text-muted">
            <Flame class="h-3 w-3 text-amber-500" /> 今日还需完成 {{ Math.max(0, 4 - [store.todayDone(sid).bp, store.todayDone(sid).med, store.todayDone(sid).ex, store.todayDone(sid).diet].filter(Boolean).length) }} 项打卡
          </div>
        </div>
      </div>

      <!-- 活动列表 -->
      <div class="mt-4 px-4">
        <div class="mb-2.5 flex items-center justify-between">
          <div class="section-title"><Activity class="h-4 w-4 text-brand-600" /> 全部活动</div>
          <div class="flex gap-1">
            <button v-for="f in [{ k: 'all', l: '全部' }, { k: 'active', l: '进行中' }, { k: 'upcoming', l: '待开始' }]" :key="f.k"
              class="rounded-full px-2.5 py-1 text-[9.5px] font-bold" :class="filter === f.k ? 'bg-brand-600 text-white' : 'bg-white/70 text-muted'" @click="filter = f.k as any">{{ f.l }}</button>
          </div>
        </div>
        <div class="space-y-2">
          <button v-for="a in acts" :key="a.id" class="tap soft-card w-full rounded-2xl p-3.5 text-left" @click="openDetail(a)">
            <div class="flex items-start gap-2.5">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :class="a.status === 'active' ? 'bg-amber-50 text-amber-600' : 'bg-black/[0.04] text-muted'">
                <component :is="iconMap[a.icon] || Trophy" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="truncate text-[12px] font-extrabold text-ink">{{ a.name }}</span>
                  <span class="pill" :class="a.status === 'active' ? (a.phase === 1 ? 'pill-brand' : 'pill-amber') : 'pill-slate'">{{ a.status === 'active' ? (a.phase === 1 ? '一期' : '长期') : '待开始' }}</span>
                </div>
                <div class="mt-0.5 text-[9px] text-muted">{{ a.type }} · {{ a.window }}</div>
                <div class="mt-1 flex items-center gap-1 text-[9.5px] text-ink/65"><Gift class="h-3 w-3 shrink-0 text-amber-500" /><span class="line-clamp-1">{{ a.reward }}</span></div>
                <div v-if="a.status === 'active'" class="mt-2 flex items-center gap-2">
                  <div class="flex-1"><ProgressBar :value="a.progress || 0" :max="a.target" :tone="a.phase === 1 ? 'brand' : 'amber'" :height="4" /></div>
                  <span class="text-[9px] font-bold text-brand-700 tabular">{{ a.progress }}/{{ a.target }}</span>
                </div>
              </div>
              <ChevronRight class="mt-1 h-4 w-4 shrink-0 text-muted/35" />
            </div>
          </button>
        </div>
      </div>

      <div class="mx-4 mt-4 rounded-2xl border border-brand-600/10 bg-brand-50/60 px-3.5 py-3 text-[9.5px] leading-relaxed text-brand-800/80">
        <b>运营说明：</b>活动由国际医院统一配置，二级机构可按批次开启；所有活动线上留痕，不依赖微信群人工统计。
      </div>
    </div>

    <BottomNav anchor="s-activity" :items="navItems" :badge="unread" :badge-index="2" />

    <Sheet v-model:show="show" :title="detail?.name" :sub="detail ? `${detail.type} · ${detail.window}` : ''">
      <div v-if="detail" class="space-y-3">
        <div class="rounded-2xl bg-mist p-3">
          <div class="text-[10px] font-bold text-muted">活动规则</div>
          <div class="mt-1 text-[10.5px] leading-relaxed text-ink/80">{{ detail.rule }}</div>
        </div>
        <div class="flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-[10px] text-amber-800">
          <Gift class="h-4 w-4 shrink-0" /> 激励：{{ detail.reward }}
        </div>
        <div class="rounded-2xl border border-black/[0.05] p-3">
          <div class="flex items-center justify-between text-[10px]"><span class="text-muted">我的进度</span><span class="font-bold text-brand-700">{{ detail.progress || 0 }} / {{ detail.target }} {{ detail.unit }}</span></div>
          <ProgressBar class="mt-2" :value="detail.progress || 0" :max="detail.target" />
        </div>
        <button class="w-full rounded-xl bg-brand-600 py-3 text-[12px] font-bold text-white" @click="show = false; store.setView('s-checkin')">
          {{ detail.status === 'active' ? '去完成今日打卡' : '查看打卡记录' }}
        </button>
        <button class="w-full rounded-xl border border-black/[0.07] py-2.5 text-[11px] font-semibold text-muted" @click="show = false">稍后再说</button>
      </div>
    </Sheet>
  </div>
</template>
