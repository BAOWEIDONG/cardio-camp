<script setup lang="ts">
import { computed, ref } from 'vue';
import { Activity, ChevronLeft, ChevronRight, Dumbbell, HeartPulse, MessageCircle, Salad, Trophy } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { NavBar, SectionHead } from '../../components/ui';
import { DEMO_TODAY, fmtShort } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const year = ref(2026);
const month = ref(12); // 1-12
const selected = ref(DEMO_TODAY);

const monthDays = computed(() => {
  const first = new Date(year.value, month.value - 1, 1);
  const offset = first.getDay(); // 0 Sun
  const count = new Date(year.value, month.value, 0).getDate();
  const cells: { d: number | null; date: string }[] = [];
  for (let i = 0; i < offset; i++) cells.push({ d: null, date: '' });
  for (let d = 1; d <= count; d++) {
    cells.push({ d, date: `${year.value}-${String(month.value).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  while (cells.length % 7 !== 0) cells.push({ d: null, date: '' });
  return cells;
});

const recordsByDate = computed(() => {
  const map: Record<string, { bp: number; ex: number; diet: number; comment: number }> = {};
  const get = (d: string) => (map[d] ||= { bp: 0, ex: 0, diet: 0, comment: 0 });
  store.bpOf(sid.value).forEach((r) => { const g = get(r.date.slice(0, 10)); g.bp++; g.comment += r.comments?.length || 0; });
  store.exerciseOf(sid.value).forEach((r) => { const g = get(r.date.slice(0, 10)); g.ex++; g.comment += r.comments?.length || 0; });
  store.dietOf(sid.value).forEach((r) => { const g = get(r.date.slice(0, 10)); g.diet++; g.comment += r.comments?.length || 0; });
  return map;
});

const dayData = computed(() => recordsByDate.value[selected.value] || { bp: 0, ex: 0, diet: 0, comment: 0 });
const dayBp = computed(() => store.bpOf(sid.value).filter((r) => r.date.startsWith(selected.value)));
const dayEx = computed(() => store.exerciseOf(sid.value).filter((r) => r.date.startsWith(selected.value)));
const dayDiet = computed(() => store.dietOf(sid.value).filter((r) => r.date.startsWith(selected.value)));
const monthStats = computed(() => {
  const prefix = `${year.value}-${String(month.value).padStart(2, '0')}`;
  const days = new Set<string>();
  [...store.bpOf(sid.value), ...store.exerciseOf(sid.value), ...store.dietOf(sid.value)].forEach((r) => { if (r.date.startsWith(prefix)) days.add(r.date.slice(0, 10)); });
  return {
    days: days.size,
    bp: store.bpOf(sid.value).filter((r) => r.date.startsWith(prefix)).length,
    ex: store.exerciseOf(sid.value).filter((r) => r.date.startsWith(prefix)).length,
    diet: store.dietOf(sid.value).filter((r) => r.date.startsWith(prefix)).length,
  };
});
function shift(n: number) {
  let m = month.value + n;
  let y = year.value;
  if (m < 1) { m = 12; y--; }
  if (m > 12) { m = 1; y++; }
  if (y < 2026 || (y === 2027 && m > 2)) return;
  year.value = y; month.value = m;
}
function isFuture(date: string) { return date > DEMO_TODAY; }
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="打卡日历" :on-back="store.back" />

    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <button class="tap flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04]" @click="shift(-1)"><ChevronLeft class="h-4 w-4" /></button>
            <div class="text-center">
              <div class="text-[15px] font-extrabold text-ink">{{ year }} 年 {{ month }} 月</div>
              <div class="text-[8.5px] text-muted">开营第 {{ store.campDay }} 天 · 强化期</div>
            </div>
            <button class="tap flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04]" @click="shift(1)"><ChevronRight class="h-4 w-4" /></button>
          </div>

          <div class="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-muted">
            <span v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w">{{ w }}</span>
          </div>
          <div class="mt-1 grid grid-cols-7 gap-1">
            <button
              v-for="(c, i) in monthDays" :key="i" :disabled="!c.d || isFuture(c.date)"
              class="relative flex aspect-square flex-col items-center justify-center rounded-xl text-[11px] font-semibold transition"
              :class="[
                !c.d ? 'opacity-0' : isFuture(c.date) ? 'text-muted/30' : 'text-ink',
                c.date === selected ? 'bg-brand-600 text-white shadow-md' : '',
                c.date === DEMO_TODAY && c.date !== selected ? 'ring-1 ring-brand-600/40' : '',
              ]"
              @click="c.date && (selected = c.date)"
            >
              {{ c.d }}
              <span v-if="c.d && recordsByDate[c.date]" class="mt-0.5 flex gap-0.5">
                <i class="h-1 w-1 rounded-full" :class="c.date === selected ? 'bg-white' : 'bg-brand-500'" />
                <i v-if="recordsByDate[c.date].ex" class="h-1 w-1 rounded-full" :class="c.date === selected ? 'bg-white' : 'bg-coral-400'" />
                <i v-if="recordsByDate[c.date].diet" class="h-1 w-1 rounded-full" :class="c.date === selected ? 'bg-white' : 'bg-amber-400'" />
              </span>
              <span v-if="c.d && recordsByDate[c.date]?.comment" class="absolute right-1 top-1 h-1 w-1 rounded-full bg-[#2C7DA0]" />
            </button>
          </div>

          <div class="mt-3 flex items-center justify-center gap-3 border-t border-black/[0.05] pt-2 text-[8px] text-muted">
            <span class="flex items-center gap-1"><i class="h-1.5 w-1.5 rounded-full bg-brand-500" /> 血压</span>
            <span class="flex items-center gap-1"><i class="h-1.5 w-1.5 rounded-full bg-coral-400" /> 运动</span>
            <span class="flex items-center gap-1"><i class="h-1.5 w-1.5 rounded-full bg-amber-400" /> 饮食</span>
            <span class="flex items-center gap-1"><i class="h-1.5 w-1.5 rounded-full bg-[#2C7DA0]" /> 批注</span>
          </div>
        </div>

        <div class="mt-2 grid grid-cols-4 gap-2">
          <div class="soft-card rounded-xl p-2 text-center"><div class="text-[15px] font-extrabold text-brand-700 tabular">{{ monthStats.days }}</div><div class="text-[8px] text-muted">打卡天</div></div>
          <div class="soft-card rounded-xl p-2 text-center"><div class="text-[15px] font-extrabold text-ink tabular">{{ monthStats.bp }}</div><div class="text-[8px] text-muted">血压</div></div>
          <div class="soft-card rounded-xl p-2 text-center"><div class="text-[15px] font-extrabold text-coral-500 tabular">{{ monthStats.ex }}</div><div class="text-[8px] text-muted">运动</div></div>
          <div class="soft-card rounded-xl p-2 text-center"><div class="text-[15px] font-extrabold text-amber-600 tabular">{{ monthStats.diet }}</div><div class="text-[8px] text-muted">饮食</div></div>
        </div>
      </div>

      <div class="mt-4 px-4">
        <SectionHead :title="fmtShort(selected)" :sub="selected === DEMO_TODAY ? '今天 · 实时记录' : '历史记录'" />
        <div v-if="!dayBp.length && !dayEx.length && !dayDiet.length" class="rounded-2xl border border-dashed border-black/[0.08] bg-white/50 py-10 text-center text-[10px] text-muted">这一天没有打卡记录</div>
        <div v-else class="space-y-2">
          <div v-for="r in dayBp" :key="r.id" class="soft-card flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><HeartPulse class="h-4 w-4" /></span>
            <div class="flex-1"><div class="text-[10.5px] font-bold text-ink">{{ r.period === 'morning' ? '晨起血压' : '睡前血压' }}</div><div class="text-[8.5px] text-muted">{{ r.date.slice(11) }} · 心率 {{ r.hr }}</div></div>
            <span class="text-[14px] font-extrabold tabular" :class="r.sbp >= 140 ? 'text-coral-500' : 'text-ink'">{{ r.sbp }}/{{ r.dbp }}</span>
          </div>
          <div v-for="r in dayEx" :key="r.id" class="soft-card flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50 text-coral-500"><Dumbbell class="h-4 w-4" /></span>
            <div class="flex-1"><div class="text-[10.5px] font-bold text-ink">{{ r.type }}</div><div class="text-[8.5px] text-muted">{{ r.duration }} 分钟 · 心率 {{ r.hrAvg }}</div></div>
            <span v-if="r.comments?.length" class="pill pill-blue">{{ r.comments.length }} 条批注</span>
          </div>
          <div v-for="r in dayDiet" :key="r.id" class="soft-card flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Salad class="h-4 w-4" /></span>
            <div class="min-w-0 flex-1"><div class="text-[10.5px] font-bold text-ink">{{ r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '午餐' : '晚餐' }}</div><div class="truncate text-[8.5px] text-muted">{{ r.desc }}</div></div>
            <span v-if="r.comments?.length" class="pill pill-blue">{{ r.comments.length }} 条批注</span>
          </div>
        </div>
      </div>

      <div class="mt-4 px-4 pb-8">
        <div class="flex items-center gap-2 rounded-2xl bg-brand-50/70 px-3 py-2.5 text-[9px] leading-relaxed text-brand-800/75">
          <Trophy class="h-3.5 w-3.5 shrink-0" /> 连续打卡与活动进度按自然日计算；补录需联系营养师，不计入连续天数。
        </div>
      </div>
    </div>
  </div>
</template>
