<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronRight, ClipboardCheck, Search } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { NavBar, Sheet } from '../../components/ui';
import { FEATURES, type FeatureItem } from '../../mock/features';

const store = useAppStore();
const phase = ref<'全部' | '一期' | '二期' | '三期'>('全部');
const role = ref('全部');
const kw = ref('');
const detail = ref<FeatureItem | null>(null);
const show = ref(false);
const roles = computed(() => ['全部', ...Array.from(new Set(FEATURES.map((f) => f.role)))]);
const roleShort = (r: string) => {
  if (r.includes('二级机构')) return '机构管理员';
  if (r.includes('超级管理员')) return '超级管理员';
  return r.replace('端', '');
};
const list = computed(() => FEATURES.filter((f) =>
  (phase.value === '全部' || f.phase === phase.value) &&
  (role.value === '全部' || f.role === role.value) &&
  (!kw.value || f.name.includes(kw.value) || f.desc.includes(kw.value) || f.module.includes(kw.value)),
));
const stats = computed(() => ({
  all: FEATURES.length,
  p1: FEATURES.filter((f) => f.phase === '一期').length,
  p2: FEATURES.filter((f) => f.phase === '二期').length,
  p3: FEATURES.filter((f) => f.phase === '三期').length,
  p0: FEATURES.filter((f) => f.priority === 'P0').length,
  reuse: FEATURES.filter((f) => f.status.includes('直接可用')).length,
  optimize: FEATURES.filter((f) => f.status.includes('优化')).length,
  new: FEATURES.filter((f) => f.status.includes('新增')).length,
}));
const phaseTone: Record<string, string> = { 一期: 'pill-brand', 二期: 'pill-amber', 三期: 'pill-slate' };
const statusTone: Record<string, string> = { 已有直接可用: 'pill-green', 已有但需优化: 'pill-blue', 新增: 'pill-coral' };
function open(f: FeatureItem) { detail.value = f; show.value = true; }

const routeMap: Record<string, any> = {
  学员端: 's-home', 教练端: 'c-home', 营养师端: 'n-home', 医师端: 'd-home',
  '二级机构管理员端或超级管理员（北医国际）': 'a-dashboard', '超级管理员（北医国际）': 'a-home',
};
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="功能清单 · 59 项" :on-back="store.back" />
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="hero-card hero-admin rounded-[24px] p-4">
          <div class="text-[9.5px] font-bold tracking-[0.16em] text-white/50">FEATURE COVERAGE</div>
          <div class="mt-1 text-[18px] font-extrabold">三期规划，一屏对照</div>
          <div class="mt-1 text-[10px] text-white/65">按 31 项服务 SOP 与减重营代码基线拆解，一期 12 月开营必保 P0。</div>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">一期</div><div class="text-[18px] font-extrabold">{{ stats.p1 }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">二期</div><div class="text-[18px] font-extrabold">{{ stats.p2 }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">三期</div><div class="text-[18px] font-extrabold">{{ stats.p3 }}</div></div>
          </div>
        </div>
        <div class="mt-2 grid grid-cols-3 gap-1.5">
          <div class="soft-card rounded-xl p-2 text-center"><div class="text-[15px] font-extrabold text-brand-700">{{ stats.reuse }}</div><div class="text-[7.5px] text-muted">直接可用</div></div>
          <div class="soft-card rounded-xl p-2 text-center"><div class="text-[15px] font-extrabold text-[#2C7DA0]">{{ stats.optimize }}</div><div class="text-[7.5px] text-muted">需优化</div></div>
          <div class="soft-card rounded-xl p-2 text-center"><div class="text-[15px] font-extrabold text-coral-500">{{ stats.new }}</div><div class="text-[7.5px] text-muted">新增</div></div>
        </div>
      </div>

      <div class="mt-3 px-4">
        <div class="flex items-center gap-2 rounded-xl border border-black/[0.05] bg-white/80 px-3 py-2">
          <Search class="h-4 w-4 text-muted/50" /><input v-model="kw" class="flex-1 bg-transparent text-[11px] outline-none" placeholder="搜索功能名称 / 模块" />
        </div>
        <div class="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="p in ['全部', '一期', '二期', '三期']" :key="p" class="shrink-0 rounded-full px-3 py-1.5 text-[9.5px] font-bold" :class="phase === p ? 'bg-brand-600 text-white' : 'bg-white/70 text-muted'" @click="phase = p as any">{{ p }}</button>
        </div>
        <div class="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="r in roles" :key="r" class="shrink-0 rounded-full px-2.5 py-1.5 text-[9px] font-bold" :class="role === r ? 'bg-[#1E3A52] text-white' : 'bg-white/70 text-muted'" @click="role = r">{{ roleShort(r) }}</button>
        </div>
      </div>

      <div class="mt-2 space-y-1.5 px-4 pb-8">
        <button v-for="f in list" :key="f.no" class="tap w-full rounded-2xl border border-black/[0.045] bg-white/85 p-3 text-left" @click="open(f)">
          <div class="flex items-start gap-2">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[9px] font-extrabold text-brand-700">{{ f.no }}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="truncate text-[11px] font-extrabold text-ink">{{ f.name }}</span>
                <span class="pill !px-1.5 !py-0 !text-[7.5px]" :class="phaseTone[f.phase]">{{ f.phase }}</span>
                <span v-if="f.priority" class="pill !px-1.5 !py-0 !text-[7.5px] pill-slate">{{ f.priority }}</span>
              </div>
              <div class="mt-0.5 text-[8px] text-muted">{{ f.role }} · {{ f.module }}</div>
              <div class="mt-0.5 line-clamp-1 text-[9px] text-ink/60">{{ f.desc }}</div>
            </div>
            <ChevronRight class="mt-1 h-3.5 w-3.5 shrink-0 text-muted/30" />
          </div>
        </button>
        <div v-if="!list.length" class="py-12 text-center text-[10px] text-muted">没有匹配的功能项</div>
      </div>
    </div>

    <Sheet v-model:show="show" :title="detail?.name" :sub="detail ? `${detail.role} · ${detail.module} · 第 ${detail.no} 项` : ''">
      <div v-if="detail" class="space-y-3">
        <div class="flex gap-1.5">
          <span class="pill" :class="phaseTone[detail.phase]">{{ detail.phase }}</span>
          <span class="pill" :class="statusTone[detail.status]">{{ detail.status }}</span>
          <span v-if="detail.priority" class="pill pill-slate">{{ detail.priority }}</span>
        </div>
        <div class="rounded-2xl bg-mist p-3">
          <div class="text-[9px] font-bold text-muted">功能概述</div>
          <div class="mt-1 text-[10.5px] leading-relaxed text-ink/80">{{ detail.desc }}</div>
        </div>
        <div v-if="detail.note" class="rounded-2xl bg-brand-50/60 p-3">
          <div class="text-[9px] font-bold text-brand-700">复用 / 改造说明</div>
          <div class="mt-1 text-[10px] leading-relaxed text-brand-800/80">{{ detail.note }}</div>
        </div>
        <button class="w-full rounded-xl bg-brand-600 py-2.5 text-[11px] font-bold text-white" @click="show = false; store.setView(routeMap[detail.role] || 'a-home')">进入对应角色端体验</button>
      </div>
    </Sheet>
  </div>
</template>
