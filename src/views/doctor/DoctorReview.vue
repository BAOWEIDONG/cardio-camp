<script setup lang="ts">
import { computed, ref } from 'vue';
import { showDialog, showToast } from 'vant';
import {
  Check, ChevronRight, ClipboardCheck, FileHeart, FileText, FlaskConical, HeartPulse,
  ScanLine, ShieldCheck, X,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, NavBar, RiskBadge, Sheet } from '../../components/ui';

const store = useAppStore();
const queue = ref([
  { id: 's2', risk: 'very_high' as const, note: '冠心病 + 糖尿病，动态心电偶发房早，建议心电监护下起始运动', materials: 4 },
  { id: 's5', risk: 'very_high' as const, note: '陈旧性脑梗 + 房颤，收缩压 176，需先控压再开运动处方', materials: 4 },
  { id: 's8', risk: 'high' as const, note: '高血压 2 级，颈动脉斑块，材料齐全，可按常规入营', materials: 3 },
]);
const active = ref<typeof queue.value[number] | null>(null);
const show = ref(false);
const decision = ref<'approve' | 'defer'>('approve');
const rejectReason = ref('');
const list = computed(() => queue.value.map((q) => ({ ...q, student: store.studentById(q.id)! })));

function open(q: typeof queue.value[number]) { active.value = q; decision.value = 'approve'; show.value = true; }
function submit() {
  if (!active.value) return;
  if (decision.value === 'defer' && !rejectReason.value.trim()) { showToast('请填写退回原因'); return; }
  queue.value = queue.value.filter((q) => q.id !== active.value!.id);
  show.value = false;
  showToast({ message: decision.value === 'approve' ? '入营审核通过，已通知学员' : '已退回补充材料', position: 'bottom' });
}
const materials = [
  { name: '空腹抽血化验单', icon: FlaskConical, ok: true },
  { name: '心电图 / 动态心电', icon: HeartPulse, ok: true },
  { name: '颈动脉超声', icon: ScanLine, ok: true },
  { name: '疾病确诊病历', icon: FileHeart, ok: true },
];
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="入营审核" :on-back="store.back">
      <template #right><span class="pill pill-amber">{{ queue.length }} 待审核</span></template>
    </NavBar>
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="hero-card hero-doctor rounded-[24px] p-4">
          <div class="text-[9.5px] font-bold tracking-[0.16em] text-white/55">ADMISSION REVIEW</div>
          <div class="mt-1 text-[18px] font-extrabold">先分层，再开方</div>
          <div class="mt-1 text-[10.5px] leading-relaxed text-white/70">审核三甲医院报告与病历，确认风险分层后再进入运动/营养处方流程。</div>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8.5px] text-white/55">待审核</div><div class="text-[17px] font-extrabold">{{ queue.length }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8.5px] text-white/55">材料异常</div><div class="text-[17px] font-extrabold">2</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8.5px] text-white/55">今日通过</div><div class="text-[17px] font-extrabold">9</div></div>
          </div>
        </div>
      </div>

      <div class="mt-3 space-y-2 px-4 pb-8">
        <button v-for="q in list" :key="q.id" class="tap w-full rounded-2xl border border-black/[0.05] bg-white/85 p-3.5 text-left" @click="open(q)">
          <div class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3F5] text-[11px] font-extrabold text-[#0F5C6B]">{{ q.student.name.slice(0, 1) }}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="text-[12px] font-extrabold text-ink">{{ q.student.name }}</span><RiskBadge :risk="q.risk" /><span class="text-[9px] text-muted">{{ q.student.age }} 岁</span></div>
              <div class="mt-0.5 text-[9px] text-muted">{{ q.student.riskTags.join(' / ') }}</div>
            </div>
            <ChevronRight class="h-4 w-4 text-muted/35" />
          </div>
          <div class="mt-2 rounded-xl bg-mist px-2.5 py-2 text-[9px] leading-relaxed text-ink/70">
            <b class="text-ink">分层建议：</b>{{ q.note }}
          </div>
          <div class="mt-2 flex items-center gap-2 text-[8.5px] text-muted">
            <ClipboardCheck class="h-3 w-3" /> 材料 {{ q.materials }}/4 已上传
            <span class="ml-auto font-bold text-brand-700">去审核 ›</span>
          </div>
        </button>
      </div>
    </div>

    <Sheet v-model:show="show" title="入营材料审核" :sub="active ? `${store.studentById(active.id)?.name} · ${store.studentById(active.id)?.age} 岁` : ''">
      <div v-if="active" class="space-y-3">
        <div class="space-y-1.5">
          <div v-for="m in materials" :key="m.name" class="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2">
            <component :is="m.icon" class="h-3.5 w-3.5 text-brand-600" />
            <span class="flex-1 text-[10px] font-semibold text-ink">{{ m.name }}</span>
            <span class="pill pill-green">已上传</span>
          </div>
        </div>
        <div class="rounded-xl bg-[#fbf6e9] px-3 py-2 text-[9px] leading-relaxed text-[#8a641f]">
          <b>分层建议：</b>{{ active.note }}
        </div>
        <div>
          <div class="mb-1.5 text-[10px] font-bold text-muted">审核结论</div>
          <div class="grid grid-cols-2 gap-2">
            <button class="rounded-xl border py-2.5 text-[10.5px] font-bold" :class="decision === 'approve' ? 'border-brand-600/40 bg-brand-50 text-brand-800' : 'border-black/[0.07] text-muted'" @click="decision = 'approve'"><Check class="mr-1 inline h-3.5 w-3.5" /> 通过入营</button>
            <button class="rounded-xl border py-2.5 text-[10.5px] font-bold" :class="decision === 'defer' ? 'border-coral-400/40 bg-coral-50 text-coral-700' : 'border-black/[0.07] text-muted'" @click="decision = 'defer'"><X class="mr-1 inline h-3.5 w-3.5" /> 退回补充</button>
          </div>
        </div>
        <div v-if="decision === 'defer'">
          <textarea v-model="rejectReason" class="w-full rounded-xl border border-black/[0.07] bg-white p-2.5 text-[10px] outline-none" rows="2" placeholder="请说明需补充的材料或复查项目" />
        </div>
        <div class="flex items-center gap-1.5 text-[8.5px] text-muted"><ShieldCheck class="h-3 w-3" /> 审核结果将通知学员，并进入医师随访队列</div>
        <Button class="w-full" size="lg" @click="submit">提交审核</Button>
      </div>
    </Sheet>
  </div>
</template>
