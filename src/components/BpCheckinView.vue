<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import { HeartPulse, Info, TrendingDown, TrendingUp, Minus, Activity } from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { Button, Card, Input, NavBar } from './ui';

const store = useAppStore();
const period = ref<'morning' | 'evening'>('morning');
const sbp = ref<number | string>(136);
const dbp = ref<number | string>(84);
const hr = ref<number | string>(72);
const takenMed = ref(true);
const saving = ref(false);

const sid = computed(() => store.user?.id || '');
const campId = computed(() => store.selectedCampId || 'camp1');
const records = computed(() => store.getStudentBpRecords(sid.value, campId.value).slice().reverse());
const latest = computed(() => store.latestBpFor(sid.value, campId.value));
const avg = computed(() => {
  const arr = records.value.slice(0, 7);
  if (!arr.length) return null;
  return {
    sbp: Math.round(arr.reduce((n, r) => n + r.sbp, 0) / arr.length),
    dbp: Math.round(arr.reduce((n, r) => n + r.dbp, 0) / arr.length),
  };
});
const change = computed(() => {
  if (records.value.length < 2 || !avg.value) return null;
  const first = records.value[records.value.length - 1];
  return { sbp: avg.value.sbp - first.sbp, dbp: avg.value.dbp - first.dbp };
});
const todayDone = computed(() => records.value.some((r) => r.date.startsWith(new Date().toISOString().slice(0, 10))));

function fill(periodValue: 'morning' | 'evening') {
  period.value = periodValue;
  const last = records.value.find((r) => r.period === periodValue) || latest.value;
  sbp.value = last?.sbp ?? 136;
  dbp.value = last?.dbp ?? 84;
  hr.value = last?.hr ?? 72;
}

function save() {
  const s = Number(sbp.value);
  const d = Number(dbp.value);
  const h = Number(hr.value);
  if (!s || !d) { showToast('请填写完整的血压数值'); return; }
  if (s < 60 || s > 260 || d < 30 || d > 160) { showToast('血压数值超出合理范围，请核对'); return; }
  saving.value = true;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
  store.addBpRecord({
    id: `bp_${sid.value}_${Date.now()}`,
    studentId: sid.value,
    campId: campId.value,
    date,
    period: period.value,
    sbp: s,
    dbp: d,
    hr: h || 72,
    takenMed: takenMed.value,
  });
  saving.value = false;
  showToast({ message: '血压已记录', position: 'bottom' });
}

function fmt(date: string) {
  return date.slice(5, 16);
}
const roleLabel: Record<string, string> = { doctor: '医师', dietitian: '营养师', coach: '运动师' };
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA]">
    <NavBar title="血压打卡" :on-back="store.goBack" />
    <div class="px-4 pb-8 pt-3 space-y-3">
      <Card class="p-4 border-0 shadow-sm">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-[11px] text-gray-500 font-bold">7 日平均 / 目标 130/80</div>
            <div class="flex items-end gap-1 mt-1">
              <span class="text-[30px] font-black text-gray-900 tracking-tighter">{{ avg?.sbp ?? '--' }}</span>
              <span class="text-sm mb-1 text-gray-500">/ {{ avg?.dbp ?? '--' }}</span>
              <span class="text-[10px] font-bold mb-1 ml-1" :class="(avg?.sbp || 999) <= 130 ? 'text-[#1F6A95]' : 'text-orange-500'">
                {{ (avg?.sbp || 999) <= 130 ? '已达标' : '待达标' }}
              </span>
            </div>
            <div v-if="change" class="mt-1 flex items-center gap-1 text-[10px] font-bold" :class="change.sbp < 0 ? 'text-[#1F6A95]' : 'text-orange-500'">
              <TrendingDown v-if="change.sbp < 0" class="w-3 h-3" />
              <TrendingUp v-else-if="change.sbp > 0" class="w-3 h-3" />
              <Minus v-else class="w-3 h-3" />
              较开营 {{ change.sbp > 0 ? '+' : '' }}{{ change.sbp }}/{{ change.dbp }} mmHg
            </div>
          </div>
          <div class="w-10 h-10 rounded-full bg-[#1F6A95]/10 text-[#1F6A95] flex items-center justify-center">
            <HeartPulse class="w-5 h-5" />
          </div>
        </div>
      </Card>

      <div class="grid grid-cols-2 gap-3">
        <button class="rounded-xl border-2 px-3 py-2.5 text-left transition" :class="period === 'morning' ? 'border-[#1F6A95] bg-[#1F6A95]/5' : 'border-gray-100 bg-white'" @click="fill('morning')">
          <div class="text-[9px] text-gray-500">晨起血压</div>
          <div class="text-[12px] font-bold text-gray-900 mt-0.5">07:00–09:00</div>
          <div class="text-[8px] text-gray-400 mt-0.5">排尿后、服药前、坐位 5 分钟</div>
        </button>
        <button class="rounded-xl border-2 px-3 py-2.5 text-left transition" :class="period === 'evening' ? 'border-[#FF976A] bg-[#FF976A]/5' : 'border-gray-100 bg-white'" @click="fill('evening')">
          <div class="text-[9px] text-gray-500">睡前血压</div>
          <div class="text-[12px] font-bold text-gray-900 mt-0.5">20:00–22:00</div>
          <div class="text-[8px] text-gray-400 mt-0.5">服药后、睡前 1 小时</div>
        </button>
      </div>

      <Card class="p-4 border-0 shadow-sm">
        <div class="text-sm font-bold text-gray-900 mb-3">记录{{ period === 'morning' ? '晨起' : '睡前' }}血压</div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-[10px] font-bold text-gray-500 mb-1">收缩压 mmHg</div>
            <Input v-model:value="sbp as any" type="number" inputmode="numeric" />
          </div>
          <div>
            <div class="text-[10px] font-bold text-gray-500 mb-1">舒张压 mmHg</div>
            <Input v-model:value="dbp as any" type="number" inputmode="numeric" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-[10px] font-bold text-gray-500 mb-1">心率 次/分</div>
          <Input v-model:value="hr as any" type="number" inputmode="numeric" />
        </div>
        <button class="mt-3 flex w-full items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5" @click="takenMed = !takenMed">
          <span class="text-[11px] font-semibold text-gray-700">本次测量前已服药</span>
          <span class="flex h-5 w-9 items-center rounded-full p-0.5 transition" :class="takenMed ? 'bg-[#1F6A95]' : 'bg-gray-200'">
            <span class="h-4 w-4 rounded-full bg-white transition" :class="takenMed ? 'translate-x-4' : ''" />
          </span>
        </button>
        <Button class="w-full mt-3" size="lg" :loading="saving" @click="save">保存血压</Button>
      </Card>

      <Card class="p-3.5 border-0 shadow-sm">
        <div class="flex items-center gap-1.5 text-[10px] leading-relaxed text-[#8a641f] bg-[#fbf6e9] rounded-xl px-2.5 py-2">
          <Info class="w-3.5 h-3.5 shrink-0" />
          测量前 30 分钟避免吸烟、咖啡、剧烈运动；袖带与心脏同高。收缩压 ≥180 或舒张压 ≥110 请立即联系医师。
        </div>
      </Card>

      <div>
        <div class="flex items-center justify-between mb-2 ml-1">
          <div class="text-sm font-bold text-gray-900">血压记录</div>
          <div class="text-[10px] text-gray-400">{{ records.length }} 次</div>
        </div>
        <div class="space-y-2">
          <Card v-for="r in records.slice(0, 12)" :key="r.id" class="p-3 border-0 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="r.period === 'morning' ? 'bg-[#1F6A95]/10 text-[#1F6A95]' : 'bg-[#FF976A]/10 text-[#FF976A]'">
                <HeartPulse class="w-4 h-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[11px] font-bold text-gray-900">{{ fmt(r.date) }} · {{ r.period === 'morning' ? '晨起' : '睡前' }}</div>
                <div class="text-[9px] text-gray-400">{{ r.takenMed ? '已服药' : '未服药' }} · 心率 {{ r.hr }} 次/分</div>
              </div>
              <div class="text-right">
                <span class="text-[16px] font-black tracking-tight" :class="r.sbp >= 140 || r.dbp >= 90 ? 'text-orange-500' : 'text-gray-900'">{{ r.sbp }}/{{ r.dbp }}</span>
                <div class="text-[8px] text-gray-400">mmHg</div>
              </div>
            </div>
            <div v-for="c in r.comments" :key="c.id" class="mt-2 rounded-lg bg-[#1F6A95]/5 px-2.5 py-2">
              <div class="text-[9px] font-bold text-[#1F6A95]">{{ c.name }} {{ roleLabel[c.role] || '医师' }}</div>
              <div class="text-[10px] text-gray-700 mt-0.5 leading-relaxed">{{ c.text }}</div>
            </div>
          </Card>
          <div v-if="!records.length" class="py-12 text-center text-[11px] text-gray-400">还没有血压记录，先记录一次吧</div>
        </div>
      </div>
    </div>
  </div>
</template>
