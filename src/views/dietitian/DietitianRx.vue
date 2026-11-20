<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { showToast } from 'vant';
import { AlertTriangle, Check, Info, Leaf, Salad, Sparkles, UtensilsCrossed } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, RiskBadge, SectionHead } from '../../components/ui';
import { DEMO_TODAY, addDays } from '../../lib/date';

const store = useAppStore();
const sid = ref(store.activeStudentId);
const s = computed(() => store.studentById(sid.value)!);
const existing = computed(() => store.data.nutritionRxs.find((r) => r.studentId === sid.value));
const form = ref({
  energy: 1800, sodium: 2000, protein: 18, fatPct: 25, carbPct: 50,
  pattern: 'DASH 饮食 + 低盐低脂',
  note: '超重/腹型肥胖，合并血脂异常，以 DASH 饮食为基础',
  meals: [
    { meal: '早餐', dishes: '燕麦牛奶 250ml、水煮蛋 1 个、凉拌菠菜 100g' },
    { meal: '午餐', dishes: '糙米饭 75g、清蒸鲈鱼 100g、西兰花 150g' },
    { meal: '加餐', dishes: '无糖酸奶 100g 或苹果半个' },
    { meal: '晚餐', dishes: '小米粥 200ml、虾仁豆腐 100g、油麦菜 150g' },
  ],
  interactions: ['阿托伐他汀：避免大量西柚/柚子汁', '阿司匹林：避免空腹饮酒，注意胃肠道反应'],
  precautions: ['每日食盐 <5g，警惕酱油、腐乳、腌制品中的隐形盐', '烹调油每日 25–30g，优先橄榄油、菜籽油', '戒烟限酒，男性酒精 <25g/日'],
  reviewDate: addDays(DEMO_TODAY, 7),
});
watch(sid, () => {
  const rx = existing.value;
  if (!rx) return;
  form.value = {
    ...form.value,
    energy: rx.targets.energy, sodium: rx.targets.sodium, protein: rx.targets.protein,
    fatPct: rx.targets.fatPct, carbPct: rx.targets.carbPct, pattern: rx.pattern,
    note: rx.assessment.note, meals: rx.sampleMenu.map((m) => ({ ...m })),
    interactions: [...rx.interactions], precautions: [...rx.precautions], reviewDate: rx.reviewDate,
  };
}, { immediate: true });

const allInteractions = ['阿托伐他汀：避免大量西柚/柚子汁', '阿司匹林：避免空腹饮酒，注意胃肠道反应', '降压药：避免与高钾盐同用，遵医嘱', '二甲双胍：随餐服用，避免空腹', '华法林：保持维生素 K 摄入稳定'];
function toggleI(v: string) {
  const i = form.value.interactions.indexOf(v);
  if (i >= 0) form.value.interactions.splice(i, 1); else form.value.interactions.push(v);
}
function publish() {
  if (!form.value.pattern.trim()) { showToast('请填写饮食模式'); return; }
  store.publishNutritionRx({
    id: existing.value?.id || `rx_nu_${sid.value}`,
    studentId: sid.value, campId: 'camp1', dietitianId: store.currentUser!.id, dietitianName: store.currentUser!.name,
    date: DEMO_TODAY, status: 'published',
    assessment: { energy: Number(form.value.energy), bmi: s.value.bmi, waist: s.value.waist, note: form.value.note },
    targets: { energy: Number(form.value.energy), sodium: Number(form.value.sodium), protein: Number(form.value.protein), fatPct: Number(form.value.fatPct), carbPct: Number(form.value.carbPct) },
    pattern: form.value.pattern, sampleMenu: form.value.meals,
    interactions: form.value.interactions, precautions: form.value.precautions, reviewDate: form.value.reviewDate,
  });
  showToast({ message: '饮食处方已发布，学员端可见', position: 'bottom' });
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="饮食处方" :on-back="store.back" />
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="text-[9.5px] font-bold text-muted">选择学员</div>
        <div class="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="p in store.myStudents" :key="p.id" class="tap flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5" :class="sid === p.id ? 'border-[#2C7DA0]/40 bg-[#EDF5FA]' : 'border-black/[0.06] bg-white/70'" @click="sid = p.id">
            <span class="text-[10px] font-bold" :class="sid === p.id ? 'text-[#1A577C]' : 'text-ink'">{{ p.name }}</span>
            <RiskBadge :risk="p.risk" />
          </button>
        </div>
      </div>

      <div class="mt-3 px-4">
        <div class="hero-card hero-dietitian rounded-[24px] p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[9.5px] font-bold tracking-[0.16em] text-white/55">NUTRITION PRESCRIPTION</div>
              <div class="mt-1 text-[18px] font-extrabold">{{ s.name }} · 个体化饮食处方</div>
              <div class="mt-1 text-[10px] text-white/70">结合 BMI、腰围、eGFR 与用药清单制定</div>
            </div>
            <span class="pill pill-white">{{ existing?.status === 'published' ? '已发布' : '待发布' }}</span>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">BMI</div><div class="text-[15px] font-extrabold">{{ s.bmi }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">腰围</div><div class="text-[15px] font-extrabold">{{ s.waist }} cm</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8px] text-white/55">每日能量</div><div class="text-[15px] font-extrabold">{{ form.energy }} kcal</div></div>
          </div>
        </div>
      </div>

      <div class="mt-3 space-y-3 px-4 pb-8">
        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="营养评估" sub="合并症与用药相互作用" />
          <div class="mt-2"><Input v-model:value="form.note" type="textarea" rows="2" autosize /></div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="每日目标" sub="能量与三大营养素" />
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div><div class="mb-1 text-[9px] font-bold text-muted">能量（kcal）</div><Input v-model:value="form.energy as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">钠（mg）</div><Input v-model:value="form.sodium as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">蛋白质（%）</div><Input v-model:value="form.protein as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">脂肪（%）</div><Input v-model:value="form.fatPct as any" type="number" /></div>
            <div><div class="mb-1 text-[9px] font-bold text-muted">碳水（%）</div><Input v-model:value="form.carbPct as any" type="number" /></div>
            <div class="flex items-end"><div class="w-full rounded-xl bg-brand-50 px-2 py-2 text-center text-[9px] font-bold text-brand-800">食盐 &lt; {{ Math.round(Number(form.sodium) / 400) }} g</div></div>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="饮食模式" sub="处方核心口径" />
          <div class="mt-2"><Input v-model:value="form.pattern" /></div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="p in ['DASH 饮食 + 低盐低脂', 'DASH 饮食 + 糖尿病低GI', '地中海饮食', '低嘌呤饮食']" :key="p" class="rounded-lg border px-2 py-1.5 text-[9px] font-semibold" :class="form.pattern === p ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.06] text-muted'" @click="form.pattern = p">{{ p }}</button>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="一日食谱示例" sub="同类食材可替换" />
          <div v-for="(m, i) in form.meals" :key="i" class="mt-2 flex gap-2">
            <div class="w-11 shrink-0 pt-1.5 text-[9px] font-extrabold text-brand-700">{{ m.meal }}</div>
            <Input v-model:value="m.dishes" type="textarea" rows="1" autosize />
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="用药与饮食相互作用" sub="发布后学员端高亮提示" />
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="it in allInteractions" :key="it" class="rounded-lg border px-2 py-1.5 text-left text-[9px] font-semibold leading-snug" :class="form.interactions.includes(it) ? 'border-amber-400/50 bg-amber-50 text-amber-800' : 'border-black/[0.06] text-muted'" @click="toggleI(it)">{{ it }}</button>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-3.5">
          <SectionHead title="饮食原则" sub="低盐、低脂、控糖" />
          <div v-for="(p, i) in form.precautions" :key="i" class="mt-2 flex items-start gap-2">
            <span class="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
            <Input v-model:value="form.precautions[i]" type="textarea" rows="1" autosize />
          </div>
        </div>

        <div class="flex items-center justify-between rounded-2xl border border-black/[0.05] bg-white/75 px-3.5 py-3">
          <span class="text-[10px] text-muted">下次复评</span>
          <Input v-model:value="form.reviewDate" type="date" class="!h-8 !w-[130px]" />
        </div>

        <Button class="w-full" size="lg" @click="publish"><Check class="h-4 w-4" /> 发布饮食处方</Button>
        <div class="flex items-center justify-center gap-1 text-[8.5px] text-muted/60"><Info class="h-3 w-3" /> 涉及肾功能异常或特殊用药时，需与医师确认后再发布</div>
      </div>
    </div>
  </div>
</template>
