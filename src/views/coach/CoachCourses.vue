<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast } from 'vant';
import { Check, Eye, ImagePlus, PlayCircle, Plus, UploadCloud, Users, Video } from 'lucide-vue-next';
import { useAppStore } from '../../store/app';
import { Button, Input, NavBar, SectionHead, Sheet } from '../../components/ui';

const store = useAppStore();
const tab = ref<'all' | 'published' | 'draft'>('all');
const courses = ref([
  { id: 1, name: '坐姿热身与关节活动', dur: '8 分钟', level: '低强度', groups: ['A 组', 'B 组'], status: 'published', plays: 86, icon: '🧘' },
  { id: 2, name: '室内快走跟练 · 第 1 组', dur: '20 分钟', level: '目标心率 96–112', groups: ['A 组'], status: 'published', plays: 64, icon: '🚶' },
  { id: 3, name: '弹力带上肢训练', dur: '12 分钟', level: '2 组 × 10 次', groups: ['A 组', 'B 组'], status: 'published', plays: 51, icon: '💪' },
  { id: 4, name: '运动后拉伸与呼吸放松', dur: '6 分钟', level: '低强度', groups: ['全部'], status: 'published', plays: 93, icon: '🌿' },
  { id: 5, name: '八段锦 · 慢速跟练', dur: '18 分钟', level: '低强度', groups: ['B 组'], status: 'draft', plays: 0, icon: '🎋' },
]);
const list = computed(() => courses.value.filter((c) => tab.value === 'all' || c.status === tab.value));
const show = ref(false);
const form = ref({ name: '', dur: '', level: '低强度', groups: '全部' });
function upload() {
  if (!form.value.name.trim()) { showToast('请填写课程名称'); return; }
  courses.value.unshift({
    id: Date.now(), name: form.value.name, dur: form.value.dur || '10 分钟', level: form.value.level,
    groups: form.value.groups.split(/[,，]/).map((s) => s.trim()).filter(Boolean), status: 'published', plays: 0, icon: '🎬',
  });
  show.value = false;
  form.value = { name: '', dur: '', level: '低强度', groups: '全部' };
  showToast({ message: '课程已发布，学员端可见', position: 'bottom' });
}
</script>

<template>
  <div class="app-page flat-bg">
    <NavBar title="跟练课程" :on-back="store.back">
      <template #right><button class="flex items-center gap-1 text-[10px] font-bold text-brand-700" @click="show = true"><Plus class="h-3.5 w-3.5" /> 上传</button></template>
    </NavBar>
    <div class="page-scroll no-tabbar">
      <div class="px-4 pt-3">
        <div class="hero-card hero-coach rounded-[24px] p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[9.5px] font-bold tracking-[0.16em] text-white/55">COURSE LIBRARY</div>
              <div class="mt-1 text-[18px] font-extrabold">录制一次，分组复用</div>
              <div class="mt-1 text-[10px] text-white/70">按风险分层与分组设置可见范围，学员端直接跟练。</div>
            </div>
            <Video class="h-7 w-7 text-white/50" />
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8.5px] text-white/55">课程</div><div class="text-[17px] font-extrabold">{{ courses.length }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8.5px] text-white/55">已发布</div><div class="text-[17px] font-extrabold">{{ courses.filter((c) => c.status === 'published').length }}</div></div>
            <div class="rounded-xl bg-white/10 px-2.5 py-2"><div class="text-[8.5px] text-white/55">累计播放</div><div class="text-[17px] font-extrabold">{{ courses.reduce((n, c) => n + c.plays, 0) }}</div></div>
          </div>
        </div>
      </div>
      <div class="mt-3 px-4">
        <div class="seg-tabs">
          <button v-for="t in [{ k: 'all', l: '全部' }, { k: 'published', l: '已发布' }, { k: 'draft', l: '草稿' }]" :key="t.k" class="seg-tab" :class="tab === t.k ? 'active' : ''" @click="tab = t.k as any">{{ t.l }}</button>
        </div>
      </div>
      <div class="mt-3 space-y-2 px-4 pb-8">
        <div v-for="c in list" :key="c.id" class="glass-card rounded-2xl p-3">
          <div class="flex items-center gap-3">
            <div class="relative flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_30%_20%,#fdf1ed,#f8fbfa)] text-[26px]">
              {{ c.icon }}
              <PlayCircle class="absolute bottom-1 right-1 h-4 w-4 text-white drop-shadow" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5"><span class="truncate text-[11.5px] font-extrabold text-ink">{{ c.name }}</span><span class="pill" :class="c.status === 'published' ? 'pill-green' : 'pill-slate'">{{ c.status === 'published' ? '已发布' : '草稿' }}</span></div>
              <div class="mt-0.5 text-[9px] text-muted">{{ c.dur }} · {{ c.level }} · 播放 {{ c.plays }}</div>
              <div class="mt-1 flex flex-wrap gap-1"><span v-for="g in c.groups" :key="g" class="pill pill-slate">{{ g }}</span></div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 rounded-2xl bg-mist px-3 py-2.5 text-[9px] leading-relaxed text-muted">
          <Eye class="h-3.5 w-3.5 shrink-0" /> 课程可见范围由运动师设置，学员端只展示已发布且命中分组的课程。
        </div>
      </div>
    </div>

    <Sheet v-model:show="show" title="上传跟练课程" sub="演示环境仅模拟发布">
      <div class="space-y-3">
        <div class="flex h-24 items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-mist text-[10px] text-muted" @click="showToast('演示环境：视频上传已模拟')"><ImagePlus class="mr-1 h-4 w-4" /> 上传视频（MP4，≤200MB）</div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">课程名称</div><Input v-model:value="form.name" placeholder="如：八段锦 · 慢速跟练" /></div>
        <div class="grid grid-cols-2 gap-2">
          <div><div class="mb-1 text-[10px] font-bold text-muted">时长</div><Input v-model:value="form.dur" placeholder="18 分钟" /></div>
          <div><div class="mb-1 text-[10px] font-bold text-muted">强度</div><Input v-model:value="form.level" placeholder="低强度" /></div>
        </div>
        <div><div class="mb-1 text-[10px] font-bold text-muted">可见分组（逗号分隔）</div><Input v-model:value="form.groups" placeholder="A 组, B 组" /></div>
        <Button class="w-full" size="lg" @click="upload"><Check class="h-4 w-4" /> 发布课程</Button>
      </div>
    </Sheet>
  </div>
</template>
