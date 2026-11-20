<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Activity, AlertTriangle, CalendarClock, CheckCircle2, ChevronRight, Dumbbell, Flame,
  HeartPulse, Info, Leaf, MessageCircle, PlayCircle, Salad, ShieldAlert, Target, UtensilsCrossed,
} from 'lucide-vue-next';
import { showToast } from 'vant';
import { useAppStore } from '../../store/app';
import { NavBar, ProgressBar, SectionHead } from '../../components/ui';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const tab = ref<'exercise' | 'nutrition'>('exercise');
const rxEx = computed(() => store.data.exerciseRxs.find((r) => r.studentId === s.value.id)!);
const rxNu = computed(() => store.data.nutritionRxs.find((r) => r.studentId === s.value.id)!);
const showCourses = ref(false);
const courses = [
  { name: '坐姿热身与关节活动', dur: '8 分钟', level: '低强度', icon: '🧘' },
  { name: '室内快走跟练 · 第 1 组', dur: '20 分钟', level: '目标心率 96–112', icon: '🚶' },
  { name: '弹力带上肢训练', dur: '12 分钟', level: '2 组 × 10 次', icon: '💪' },
  { name: '运动后拉伸与呼吸放松', dur: '6 分钟', level: '低强度', icon: '🌿' },
];
const pct = computed(() => 68);
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="我的双处方" :on-back="store.back" />

    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="hero-card hero-doctor rounded-[24px] p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[10px] font-bold tracking-[0.16em] text-white/55">PERSONAL PRESCRIPTION</div>
              <div class="mt-1.5 text-[19px] font-extrabold">运动 + 营养，一张方子管一年</div>
              <div class="mt-1 text-[10.5px] text-white/70">医师评估风险，运动师定强度，营养师定吃法</div>
            </div>
            <span class="pill pill-white">已发布</span>
          </div>
          <div class="mt-3 flex items-center gap-1.5">
            <span class="flex -space-x-1.5">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold">李</span>
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold">王</span>
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold">陈</span>
            </span>
            <span class="text-[9.5px] text-white/65">李建国医师 · 王凯运动师 · 陈静营养师 · 2026-12-02 发布</span>
          </div>
        </div>
      </div>

      <div class="mt-3 px-4">
        <div class="seg-tabs">
          <button class="seg-tab" :class="tab === 'exercise' ? 'active' : ''" @click="tab = 'exercise'"><Dumbbell class="h-3.5 w-3.5" /> 运动处方</button>
          <button class="seg-tab" :class="tab === 'nutrition' ? 'active' : ''" @click="tab = 'nutrition'"><Salad class="h-3.5 w-3.5" /> 饮食处方</button>
        </div>
      </div>

      <!-- 运动 -->
      <div v-if="tab === 'exercise'" class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-start gap-2">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Target class="h-4 w-4" /></span>
            <div>
              <div class="text-[10px] font-bold text-muted">处方目标</div>
              <div class="mt-0.5 text-[11.5px] leading-relaxed text-ink">{{ rxEx.goal }}</div>
            </div>
          </div>
          <div class="mt-3">
            <div class="flex items-center justify-between text-[9.5px] text-muted"><span>本周完成 4/5 次</span><span>依从 80%</span></div>
            <ProgressBar class="mt-1" :value="pct" :height="6" />
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="有氧运动" sub="处方核心 · 心率区间控制" />
          <div class="mt-2 rounded-xl bg-brand-50/70 p-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[13px] font-extrabold text-brand-800">{{ rxEx.aerobic.mode }}</div>
                <div class="mt-0.5 text-[10px] text-brand-700/70">每周 {{ rxEx.aerobic.freq }} 次 · 每次 {{ rxEx.aerobic.minutes }} 分钟</div>
              </div>
              <div class="text-right">
                <div class="text-[15px] font-extrabold text-brand-800 tabular">{{ rxEx.aerobic.hrLow }}–{{ rxEx.aerobic.hrHigh }}</div>
                <div class="text-[8.5px] text-brand-600">目标心率 次/分</div>
              </div>
            </div>
            <div class="mt-2.5">
              <div class="relative h-2 rounded-full bg-[linear-gradient(90deg,#d9efe9_0%,#7fcbba_38%,#1f6a95_60%,#e8674f_100%)]">
                <div class="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-brand-700 shadow" :style="{ left: '60%' }" />
              </div>
              <div class="mt-1 flex justify-between text-[8px] text-muted"><span>热身</span><span>目标区间</span><span>高强度</span></div>
            </div>
            <div class="mt-2 text-[9.5px] text-brand-700">主观强度：{{ rxEx.aerobic.rpe }}</div>
          </div>

          <div class="mt-2 grid grid-cols-2 gap-2">
            <div class="rounded-xl bg-mist p-2.5">
              <div class="flex items-center gap-1 text-[10px] font-bold text-ink"><Dumbbell class="h-3 w-3 text-brand-600" /> 抗阻训练</div>
              <div class="mt-1 text-[9.5px] leading-relaxed text-muted">每周 {{ rxEx.resistance.freq }} 次 · {{ rxEx.resistance.sets }} 组 × {{ rxEx.resistance.reps }}</div>
              <div class="mt-0.5 text-[9px] text-muted">{{ rxEx.resistance.mode }}</div>
            </div>
            <div class="rounded-xl bg-mist p-2.5">
              <div class="flex items-center gap-1 text-[10px] font-bold text-ink"><Activity class="h-3 w-3 text-brand-600" /> 柔韧放松</div>
              <div class="mt-1 text-[9.5px] leading-relaxed text-muted">{{ rxEx.flexibility }}</div>
            </div>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="运动评估" sub="开营前完成 · 2026-12-02" />
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div class="rounded-xl border border-black/[0.05] bg-white p-2.5"><div class="text-[9px] text-muted">6 分钟步行</div><div class="mt-0.5 text-[13px] font-extrabold text-ink">{{ rxEx.assessment.sixMinWalk }} m</div></div>
            <div class="rounded-xl border border-black/[0.05] bg-white p-2.5"><div class="text-[9px] text-muted">最大心率</div><div class="mt-0.5 text-[13px] font-extrabold text-ink">{{ rxEx.assessment.hrmax }} 次/分</div></div>
            <div class="rounded-xl border border-black/[0.05] bg-white p-2.5"><div class="text-[9px] text-muted">静息血压</div><div class="mt-0.5 text-[13px] font-extrabold text-ink">{{ rxEx.assessment.bpRest }}</div></div>
            <div class="rounded-xl border border-black/[0.05] bg-white p-2.5"><div class="text-[9px] text-muted">运动风险</div><div class="mt-0.5 text-[10px] font-bold leading-snug text-coral-600">{{ rxEx.assessment.risk }}</div></div>
          </div>
          <div class="mt-2 rounded-xl bg-mist px-2.5 py-2 text-[9.5px] leading-relaxed text-muted">心电图：{{ rxEx.assessment.ecg }}</div>
        </div>

        <div class="rounded-2xl border border-coral-200/50 bg-coral-50/60 p-3.5">
          <div class="flex items-center gap-1.5 text-[11px] font-extrabold text-coral-700"><ShieldAlert class="h-4 w-4" /> 运动禁忌与暂停条件</div>
          <ul class="mt-1.5 space-y-1">
            <li v-for="p in rxEx.precautions" :key="p" class="flex items-start gap-1.5 text-[10px] leading-relaxed text-coral-700/85">
              <span class="mt-1 h-1 w-1 shrink-0 rounded-full bg-coral-400" />{{ p }}
            </li>
          </ul>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <button class="flex w-full items-center justify-between" @click="showCourses = !showCourses">
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50 text-coral-500"><PlayCircle class="h-4 w-4" /></span>
              <div class="text-left">
                <div class="text-[12px] font-extrabold text-ink">跟练课程</div>
                <div class="text-[9px] text-muted">运动师录制 · 4 节 · 共 46 分钟</div>
              </div>
            </div>
            <ChevronRight class="h-4 w-4 text-muted/40 transition" :class="showCourses ? 'rotate-90' : ''" />
          </button>
          <div v-if="showCourses" class="mt-2 space-y-1.5">
            <div v-for="c in courses" :key="c.name" class="flex items-center gap-2 rounded-xl bg-mist p-2.5">
              <span class="text-[16px]">{{ c.icon }}</span>
              <div class="min-w-0 flex-1"><div class="text-[10.5px] font-bold text-ink">{{ c.name }}</div><div class="text-[9px] text-muted">{{ c.level }}</div></div>
              <span class="text-[9px] text-muted">{{ c.dur }}</span>
              <PlayCircle class="h-4 w-4 text-brand-600" @click="showToast('演示环境：视频播放暂未开放')" />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-2xl border border-black/[0.05] bg-white/75 px-3.5 py-3">
          <div class="flex items-center gap-2 text-[10px] text-muted"><CalendarClock class="h-3.5 w-3.5" /> 下次复评：{{ rxEx.reviewDate }}</div>
          <button class="flex items-center gap-1 text-[10.5px] font-bold text-brand-700" @click="store.setView('s-messages')"><MessageCircle class="h-3.5 w-3.5" /> 问运动师</button>
        </div>
      </div>

      <!-- 营养 -->
      <div v-else class="mt-3 space-y-3 px-4">
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-start gap-2">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF5FA] text-[#2C7DA0]"><UtensilsCrossed class="h-4 w-4" /></span>
            <div>
              <div class="text-[10px] font-bold text-muted">饮食模式</div>
              <div class="mt-0.5 text-[13px] font-extrabold text-ink">{{ rxNu.pattern }}</div>
              <div class="mt-0.5 text-[9.5px] leading-relaxed text-muted">{{ rxNu.assessment.note }}</div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-4 gap-1.5">
            <div class="rounded-xl bg-mist p-2 text-center"><div class="text-[15px] font-extrabold text-ink tabular">{{ rxNu.targets.energy }}</div><div class="text-[8px] text-muted">kcal/日</div></div>
            <div class="rounded-xl bg-mist p-2 text-center"><div class="text-[15px] font-extrabold text-ink tabular">&lt;5</div><div class="text-[8px] text-muted">g 食盐</div></div>
            <div class="rounded-xl bg-mist p-2 text-center"><div class="text-[15px] font-extrabold text-ink tabular">{{ rxNu.targets.protein }}%</div><div class="text-[8px] text-muted">蛋白质</div></div>
            <div class="rounded-xl bg-mist p-2 text-center"><div class="text-[15px] font-extrabold text-ink tabular">{{ rxNu.targets.fatPct }}%</div><div class="text-[8px] text-muted">脂肪</div></div>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="一日食谱示例" sub="可按同类食材替换 · 保持低盐低脂" />
          <div class="mt-2 space-y-1.5">
            <div v-for="m in rxNu.sampleMenu" :key="m.meal" class="flex gap-2 rounded-xl bg-mist px-2.5 py-2">
              <span class="w-9 shrink-0 text-[10px] font-extrabold text-brand-700">{{ m.meal }}</span>
              <span class="text-[10px] leading-relaxed text-ink/80">{{ m.dishes }}</span>
            </div>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="用药与饮食相互作用" sub="来自处方与用药清单" />
          <div class="mt-2 space-y-1.5">
            <div v-for="it in rxNu.interactions" :key="it" class="flex items-start gap-2 rounded-xl bg-[#fdf6ef] px-2.5 py-2">
              <AlertTriangle class="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span class="text-[10px] leading-relaxed text-[#8a641f]">{{ it }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-[#2C7DA0]/15 bg-[#EDF5FA]/70 p-3.5">
          <div class="flex items-center gap-1.5 text-[11px] font-extrabold text-[#1A577C]"><Info class="h-4 w-4" /> 饮食原则</div>
          <ul class="mt-1.5 space-y-1">
            <li v-for="p in rxNu.precautions" :key="p" class="flex items-start gap-1.5 text-[10px] leading-relaxed text-[#1A577C]/80">
              <span class="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#2C7DA0]" />{{ p }}
            </li>
          </ul>
        </div>

        <div class="flex items-center justify-between rounded-2xl border border-black/[0.05] bg-white/75 px-3.5 py-3">
          <div class="flex items-center gap-2 text-[10px] text-muted"><CalendarClock class="h-3.5 w-3.5" /> 下次复评：{{ rxNu.reviewDate }}</div>
          <button class="flex items-center gap-1 text-[10.5px] font-bold text-[#2C7DA0]" @click="store.setView('s-messages')"><MessageCircle class="h-3.5 w-3.5" /> 问营养师</button>
        </div>
      </div>

      <div class="mt-3 px-4 pb-6">
        <div class="flex items-center justify-center gap-1 text-[9px] text-muted/55"><CheckCircle2 class="h-3 w-3" /> 处方由医师、运动师、营养师共同制定，调整需复评后发布</div>
      </div>
    </div>
  </div>
</template>
