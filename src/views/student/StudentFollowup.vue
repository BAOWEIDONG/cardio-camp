<script setup lang="ts">
import { computed, ref } from 'vue';
import { showDialog, showToast } from 'vant';
import {
  Activity, AlertTriangle, CalendarClock, ChevronRight, CircleCheck, Clock, Dumbbell,
  ExternalLink, HeartPulse, Leaf, MapPin, MessageCircle, Phone, Pill, Siren, Stethoscope, Video,
} from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { NavBar, SectionHead, Sheet } from '../../components/ui';
import { fmtShort } from '../../lib/date';

const store = useAppStore();
const s = computed(() => store.currentStudent!);
const sid = computed(() => s.value.id);
const team = computed(() => store.careTeam(sid.value));
const records = computed(() => store.followupsOf(sid.value));
const med = computed(() => store.data.medications.find((m) => m.studentId === sid.value));
const next = computed(() => records.value[0]);
const showOnline = ref(false);
const typeTone: Record<string, string> = {
  入企面诊: 'bg-[#EDF3F8] text-[#144E73]',
  线上随访: 'bg-brand-50 text-brand-700',
  电话随访: 'bg-amber-50 text-amber-700',
  绿色通道: 'bg-coral-50 text-coral-500',
};
function openOnline(kind: string) {
  showOnline.value = false;
  showDialog({
    title: `${kind} · 互联网医院`,
    message: '将跳转至合作互联网医院平台完成挂号与问诊，诊疗费用按平台标准收取，本项目不提供免费挂号。\n\n演示环境不实际跳转。',
    confirmButtonText: '我知道了',
  });
}
const emergency = () => showDialog({
  title: '紧急情况处理',
  message: '如出现持续胸痛（>15 分钟）、意识障碍、呼吸困难、血压 ≥180/110 伴头痛呕吐，请立即拨打 120 或前往最近医院急诊，不要等待线上回复。',
  confirmButtonText: '我知道了',
});
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="随访与诊疗" :on-back="store.back" />

    <div class="page-scroll no-tabbar">
      <!-- 下次随访 -->
      <div class="px-4 pt-3">
        <div class="hero-card hero-doctor rounded-[24px] p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[9.5px] font-bold tracking-[0.16em] text-white/55">NEXT FOLLOW-UP</div>
              <div class="mt-1 text-[17px] font-extrabold">{{ next?.type }} · {{ next?.doctorName }}医师</div>
              <div class="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-white/75"><CalendarClock class="h-3.5 w-3.5" /> {{ fmtShort(next?.nextDate || '') }} 09:30</div>
              <div class="mt-1 flex items-center gap-1.5 text-[10px] text-white/60"><MapPin class="h-3.5 w-3.5" /> 国际医院健康管理中心 3 层 · 心内科 5 诊室</div>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10"><Stethoscope class="h-5 w-5" /></div>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="tap flex-1 rounded-xl bg-white/15 py-2 text-[10px] font-bold text-white backdrop-blur" @click="store.setView('s-messages')"><MessageCircle class="mr-1 inline h-3.5 w-3.5" /> 联系医师</button>
            <button class="tap flex-1 rounded-xl bg-white/15 py-2 text-[10px] font-bold text-white backdrop-blur" @click="showToast('已加入日历提醒（演示）')"><CalendarClock class="mr-1 inline h-3.5 w-3.5" /> 加入日历</button>
          </div>
        </div>
      </div>

      <!-- 三师 -->
      <div class="mt-4 px-4">
        <SectionHead title="我的三师团队" sub="多对一服务 · 消息全程留痕" />
        <div class="glass-card divide-y divide-black/[0.045] overflow-hidden rounded-2xl">
          <div v-for="m in team" :key="m.id" class="flex items-center gap-2.5 px-3.5 py-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-full" :class="m.role === 'doctor' ? 'bg-[#EDF3F8] text-[#144E73]' : m.role === 'coach' ? 'bg-coral-50 text-coral-500' : 'bg-[#EDF5FA] text-[#2C7DA0]'">
              <component :is="m.role === 'doctor' ? Stethoscope : m.role === 'coach' ? Dumbbell : Leaf" class="h-4 w-4" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-[11.5px] font-extrabold text-ink">{{ m.name }} <span class="text-[9px] font-normal text-muted">{{ m.title }}</span></div>
              <div class="text-[9px] text-muted">{{ m.label }} · {{ m.dept }}</div>
            </div>
            <button class="rounded-full bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700" @click="store.setView('s-messages')">发消息</button>
          </div>
        </div>
      </div>

      <!-- 随访时间线 -->
      <div class="mt-4 px-4">
        <SectionHead title="随访记录" sub="医师结论与干预方案 · 可追溯" />
        <div class="space-y-2">
          <div v-for="r in records" :key="r.id" class="glass-card rounded-2xl p-3.5">
            <div class="flex items-center gap-2">
              <span class="pill" :class="typeTone[r.type]">{{ r.type }}</span>
              <span class="text-[9px] text-muted">{{ r.date.slice(0, 16) }}</span>
              <span class="ml-auto text-[9px] font-bold text-ink/60">{{ r.doctorName }} 医师</span>
            </div>
            <div class="mt-1.5 flex items-center gap-2 text-[9.5px] text-muted">
              <HeartPulse class="h-3 w-3 text-coral-500" /> {{ r.sbp }}/{{ r.dbp }} mmHg · 心率 {{ r.hr }} 次/分
            </div>
            <div class="mt-2 text-[10px] leading-relaxed text-ink/80"><b class="text-ink">结论：</b>{{ r.conclusion }}</div>
            <div class="mt-1 text-[10px] leading-relaxed text-ink/70"><b class="text-ink">方案：</b>{{ r.plan }}</div>
            <div class="mt-2 flex items-center gap-1 rounded-lg bg-mist px-2 py-1.5 text-[8.5px] text-muted">
              <Clock class="h-3 w-3" /> 下次随访 {{ fmtShort(r.nextDate) }} · 记录已同步至档案
            </div>
          </div>
        </div>
      </div>

      <!-- 用药 -->
      <div class="mt-4 px-4">
        <SectionHead title="用药方案" sub="医师开具 · 用药调整需复诊" />
        <div class="glass-card rounded-2xl p-3.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-[11px] font-extrabold text-ink"><Pill class="h-4 w-4 text-[#2C7DA0]" /> 当前用药</div>
            <span class="pill pill-blue">依从 {{ med?.adherence ? Math.round(med.adherence * 100) : 0 }}%</span>
          </div>
          <div v-for="d in med?.drugs" :key="d.name" class="mt-2 rounded-xl bg-mist px-2.5 py-2">
            <div class="flex items-center justify-between">
              <span class="text-[10.5px] font-bold text-ink">{{ d.name }}</span>
              <span class="text-[9.5px] text-muted">{{ d.dose }} · {{ d.freq }}</span>
            </div>
            <div v-if="d.note" class="mt-0.5 text-[8.5px] font-semibold text-coral-600">{{ d.note }}</div>
          </div>
          <div class="mt-2 text-[8.5px] leading-relaxed text-muted/70">{{ med?.note }}</div>
        </div>
      </div>

      <!-- 互联网医院 -->
      <div class="mt-4 px-4">
        <SectionHead title="互联网医院" sub="图文 / 视频问诊 · 跳转合作平台" />
        <div class="glass-card rounded-2xl p-3.5">
          <div class="grid grid-cols-2 gap-2">
            <button class="tap rounded-xl border border-brand-600/12 bg-brand-50/70 p-3 text-left" @click="openOnline('图文问诊')">
              <MessageCircle class="h-5 w-5 text-brand-700" />
              <div class="mt-1.5 text-[11px] font-extrabold text-brand-800">图文问诊</div>
              <div class="mt-0.5 text-[8.5px] text-brand-600">上传报告，48 小时内回复</div>
            </button>
            <button class="tap rounded-xl border border-[#144E73]/12 bg-[#EDF3F8] p-3 text-left" @click="openOnline('视频问诊')">
              <Video class="h-5 w-5 text-[#144E73]" />
              <div class="mt-1.5 text-[11px] font-extrabold text-[#144E73]">视频问诊</div>
              <div class="mt-0.5 text-[8.5px] text-[#144E73]/65">与医师面对面，需预约</div>
            </button>
          </div>
          <div class="mt-2 flex items-start gap-1.5 rounded-xl bg-mist px-2.5 py-2 text-[8.5px] leading-relaxed text-muted">
            <ExternalLink class="mt-0.5 h-3 w-3 shrink-0" />
            问诊将跳转至合作互联网医院，按平台标准收费，本项目不提供免费挂号；诊疗记录不回传本 H5。
          </div>
        </div>
      </div>

      <!-- 紧急 -->
      <div class="mt-4 px-4 pb-8">
        <button class="tap flex w-full items-center gap-3 rounded-2xl border border-coral-200/50 bg-coral-50/70 p-3.5 text-left" @click="emergency">
          <span class="flex h-10 w-10 items-center justify-center rounded-full bg-coral-500 text-white"><Siren class="h-5 w-5" /></span>
          <div class="flex-1">
            <div class="text-[11.5px] font-extrabold text-coral-700">出现紧急症状？</div>
            <div class="mt-0.5 text-[9px] text-coral-600">持续胸痛、呼吸困难、意识障碍：立即拨打 120</div>
          </div>
          <ChevronRight class="h-4 w-4 text-coral-400" />
        </button>
      </div>
    </div>

    <Sheet v-model:show="showOnline" title="互联网医院">
      <div class="py-8 text-center text-[11px] text-muted">正在跳转合作互联网医院…</div>
    </Sheet>
  </div>
</template>
