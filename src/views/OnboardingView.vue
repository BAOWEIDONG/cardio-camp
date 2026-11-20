<script setup lang="ts">
import { computed, ref } from 'vue';
import { showToast, Checkbox as VanCheckbox, RadioGroup as VanRadioGroup, Radio as VanRadio } from 'vant';
import {
  BadgeCheck, Check, ChevronLeft, FileHeart, FileText, FlaskConical, HeartPulse,
  IdCard, ScanLine, ShieldCheck, UploadCloud, Activity,
} from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { Button, Card, Input } from '../components/ui';

const store = useAppStore();
const step = ref(1);
const stepTitles = ['身份核验', '知情同意', '入营问卷', '材料上传'];
const student = computed(() => store.currentStudent);
const verified = ref(false);
const consents = ref([false, false, false]);
const signature = ref('');
const q = ref({
  events: [] as string[],
  comorbid: [] as string[],
  meds: '',
  smoke: '不吸烟',
  alcohol: '不饮酒',
  exercise: '每周 1–2 次',
  salt: '偏咸',
  symptoms: [] as string[],
  family: '无',
  ability: '可正常活动',
});
const files = ref<Record<string, string>>({});
const uploading = ref('');

const events = ['高血压', '冠心病', '脑梗死/短暂性脑缺血', '心房颤动', '心力衰竭', '外周动脉疾病'];
const comorbids = ['2 型糖尿病', '血脂异常', '颈动脉斑块', '高尿酸/痛风', '脂肪肝', '慢性肾病'];
const symptomList = ['胸闷/胸痛', '活动后气短', '头晕/黑矇', '心悸', '下肢水肿', '无上述症状'];
const materials = [
  { key: 'blood', name: '空腹抽血化验单', desc: '血脂四项、血糖、肝肾功能', icon: FlaskConical },
  { key: 'ecg', name: '心电图 / 动态心电', desc: '12 导联心电图或 24–72 小时 Holter', icon: Activity },
  { key: 'ultrasound', name: '颈动脉超声', desc: 'IMT 厚度与斑块描述', icon: ScanLine },
  { key: 'record', name: '疾病确诊病历', desc: '出院小结 / 门诊病历复印件或扫描件', icon: FileHeart },
];

const canNext = computed(() => {
  if (step.value === 1) return verified.value;
  if (step.value === 2) return consents.value.every(Boolean) && signature.value.trim().length >= 2;
  if (step.value === 3) return q.value.events.length > 0 && q.value.symptoms.length > 0 && q.value.meds.trim().length > 0;
  return materials.every((m) => files.value[m.key]);
});

function toggle(list: string[], v: string) {
  const i = list.indexOf(v);
  if (i >= 0) list.splice(i, 1);
  else list.push(v);
}
function chooseExclusive(list: string[], v: string, exclusive: string) {
  if (v === exclusive) { list.splice(0, list.length, v); return; }
  const ex = list.indexOf(exclusive);
  if (ex >= 0) list.splice(ex, 1);
  toggle(list, v);
}
function next() {
  if (!canNext.value) { showToast('请先完成本步骤必填项'); return; }
  if (step.value < 4) { step.value++; return; }
  submit();
}
function back() {
  if (step.value > 1) step.value--;
  else { store.logout(); }
}
function upload(key: string) {
  uploading.value = key;
  setTimeout(() => {
    files.value[key] = `${key}_${Date.now()}.pdf`;
    uploading.value = '';
    showToast('材料已上传');
  }, 600);
}
function submit() {
  if (!student.value) { store.setView('s-home'); return; }
  store.completeOnboarding(student.value.id);
  showToast({ message: '入营资料已提交，等待医师审核', position: 'bottom' });
  store.resetToView('s-home');
}
</script>

<template>
  <div class="app-page flat-bg">
    <div class="sticky top-0 z-40 border-b border-black/[0.04] bg-white/80 px-3 py-2.5 backdrop-blur-xl">
      <div class="flex items-center gap-2">
        <button class="tap flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04]" @click="back">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <div class="min-w-0 flex-1">
          <div class="text-[14px] font-extrabold text-ink">入营准备</div>
          <div class="text-[9.5px] text-muted">第 {{ step }} / 4 步 · {{ stepTitles[step - 1] }}</div>
        </div>
        <div class="pill pill-brand"><ShieldCheck class="h-3 w-3" /> 数据加密</div>
      </div>
      <div class="mt-2.5 flex gap-1">
        <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-all" :class="i <= step ? 'bg-brand-600' : 'bg-black/[0.06]'" />
      </div>
    </div>

    <div class="page-scroll no-tabbar px-4 pb-8 pt-4">
      <!-- Step 1 -->
      <div v-if="step === 1" class="space-y-3">
        <div class="hero-card rounded-[24px] p-4">
          <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/60"><IdCard class="h-3.5 w-3.5" /> IDENTITY VERIFICATION</div>
          <div class="mt-2 text-[19px] font-extrabold">先确认，你是名单里的那个人</div>
          <div class="mt-1 text-[11px] leading-relaxed text-white/70">心血管营仅面向企业/机构名单内已确诊或高危人群，首次登录需核验姓名与手机号。</div>
        </div>
        <Card class="rounded-2xl">
          <div class="text-[11px] font-bold text-muted">营员信息</div>
          <div class="mt-3 space-y-3">
            <div class="flex items-center justify-between border-b border-black/[0.05] pb-3">
              <span class="text-[12px] text-muted">姓名</span>
              <span class="text-[14px] font-extrabold text-ink">{{ student?.name }}</span>
            </div>
            <div class="flex items-center justify-between border-b border-black/[0.05] pb-3">
              <span class="text-[12px] text-muted">手机号</span>
              <span class="text-[14px] font-extrabold text-ink">{{ student?.phone }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[12px] text-muted">所属机构</span>
              <span class="text-[13px] font-bold text-ink">北京大学国际医院 · {{ student?.cohort }}</span>
            </div>
          </div>
        </Card>
        <button
          class="tap flex w-full items-center gap-3 rounded-2xl border-2 border-dashed p-4 text-left transition"
          :class="verified ? 'border-brand-600/40 bg-brand-50' : 'border-black/[0.08] bg-white/70'"
          @click="verified = true"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full" :class="verified ? 'bg-brand-600 text-white' : 'bg-black/[0.04] text-muted'">
            <BadgeCheck class="h-5 w-5" />
          </div>
          <div class="flex-1">
            <div class="text-[13px] font-extrabold text-ink">{{ verified ? '身份核验通过' : '点击完成身份核验' }}</div>
            <div class="mt-0.5 text-[10.5px] text-muted">{{ verified ? '与营员名单匹配成功' : '演示环境：点击即模拟核验' }}</div>
          </div>
          <Check v-if="verified" class="h-5 w-5 text-brand-600" />
        </button>
      </div>

      <!-- Step 2 -->
      <div v-else-if="step === 2" class="space-y-3">
        <div class="hero-card rounded-[24px] p-4">
          <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/60"><ShieldCheck class="h-3.5 w-3.5" /> INFORMED CONSENT</div>
          <div class="mt-2 text-[19px] font-extrabold">健康数据，先授权再使用</div>
          <div class="mt-1 text-[11px] leading-relaxed text-white/70">签署记录将留存协议版本、签署时间与操作留痕，可随时在档案中查看。</div>
        </div>
        <Card class="space-y-3 rounded-2xl">
          <label v-for="(c, i) in [
            '我已阅读《心脑血管防治营服务说明》，了解营期服务内容与三次入企筛查安排。',
            '我授权项目组在营期管理范围内收集、使用我的健康问卷、医学报告与打卡数据。',
            '我知悉本服务不替代医院诊疗，紧急情况将立即拨打 120 或前往急诊。',
          ]" :key="i" class="flex items-start gap-2.5 rounded-xl bg-mist p-3">
            <VanCheckbox v-model="consents[i]" class="custom-checkbox mt-0.5" />
            <span class="text-[11px] leading-relaxed text-ink/80">{{ c }}</span>
          </label>
          <div>
            <div class="mb-1.5 text-[11px] font-bold text-muted">签署姓名</div>
            <Input v-model:value="signature" placeholder="请输入本人姓名" />
          </div>
          <div class="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-[10px] text-brand-800">
            <FileText class="h-3.5 w-3.5 shrink-0" />
            协议版本 v1.0 · 2026-11 · 签署时间将自动记录
          </div>
        </Card>
      </div>

      <!-- Step 3 -->
      <div v-else-if="step === 3" class="space-y-3">
        <div class="hero-card rounded-[24px] p-4">
          <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/60"><HeartPulse class="h-3.5 w-3.5" /> CARDIO QUESTIONNAIRE</div>
          <div class="mt-2 text-[19px] font-extrabold">心脑血管专项问卷</div>
          <div class="mt-1 text-[11px] leading-relaxed text-white/70">用于风险分层与处方制定，请按实际情况填写；不确定的项可留待医师面诊补充。</div>
        </div>

        <Card class="rounded-2xl">
          <div class="text-[12px] font-extrabold text-ink">1. 既往心脑血管事件 <span class="text-coral-500">*</span></div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="e in events" :key="e" class="chip" :class="q.events.includes(e) ? 'chip-on' : ''" @click="toggle(q.events, e)">{{ e }}</button>
          </div>
        </Card>
        <Card class="rounded-2xl">
          <div class="text-[12px] font-extrabold text-ink">2. 合并症</div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="e in comorbids" :key="e" class="chip" :class="q.comorbid.includes(e) ? 'chip-on' : ''" @click="toggle(q.comorbid, e)">{{ e }}</button>
          </div>
        </Card>
        <Card class="rounded-2xl">
          <div class="text-[12px] font-extrabold text-ink">3. 正在服用的药物 <span class="text-coral-500">*</span></div>
          <div class="mt-2">
            <Input v-model:value="q.meds" type="textarea" rows="3" autosize placeholder="如：氨氯地平 5mg 每日1次；阿托伐他汀 20mg 每晚1次…" />
          </div>
        </Card>
        <Card class="rounded-2xl">
          <div class="text-[12px] font-extrabold text-ink">4. 生活方式</div>
          <div class="mt-2 space-y-2.5">
            <div v-for="cfg in [
              { key: 'smoke', label: '吸烟', opts: ['不吸烟', '已戒烟', '偶尔', '每日'] },
              { key: 'alcohol', label: '饮酒', opts: ['不饮酒', '偶尔', '每周 3 次以上'] },
              { key: 'exercise', label: '运动频率', opts: ['几乎不运动', '每周 1–2 次', '每周 3 次以上'] },
              { key: 'salt', label: '口味', opts: ['清淡', '适中', '偏咸'] },
            ]" :key="cfg.key">
              <div class="text-[10.5px] font-semibold text-muted">{{ cfg.label }}</div>
              <div class="mt-1 flex flex-wrap gap-1.5">
                <button v-for="o in cfg.opts" :key="o" class="chip" :class="(q as any)[cfg.key] === o ? 'chip-on' : ''" @click="(q as any)[cfg.key] = o">{{ o }}</button>
              </div>
            </div>
          </div>
        </Card>
        <Card class="rounded-2xl">
          <div class="text-[12px] font-extrabold text-ink">5. 近 3 个月症状 <span class="text-coral-500">*</span></div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="s in symptomList" :key="s" class="chip" :class="q.symptoms.includes(s) ? 'chip-on' : ''" @click="chooseExclusive(q.symptoms, s, '无上述症状')">{{ s }}</button>
          </div>
        </Card>
        <Card class="rounded-2xl">
          <div class="text-[12px] font-extrabold text-ink">6. 活动能力与家族史</div>
          <div class="mt-2">
            <VanRadioGroup v-model="q.ability" direction="horizontal" class="flex flex-wrap gap-2">
              <VanRadio v-for="a in ['可正常活动', '中等活动受限', '轻微活动即气短']" :key="a" :name="a" class="custom-radio">{{ a }}</VanRadio>
            </VanRadioGroup>
          </div>
          <div class="mt-3 text-[10.5px] font-semibold text-muted">直系亲属早发心血管病</div>
          <div class="mt-1 flex gap-1.5">
            <button v-for="f in ['无', '有']" :key="f" class="chip" :class="q.family === f ? 'chip-on' : ''" @click="q.family = f">{{ f }}</button>
          </div>
        </Card>
      </div>

      <!-- Step 4 -->
      <div v-else class="space-y-3">
        <div class="hero-card rounded-[24px] p-4">
          <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/60"><UploadCloud class="h-3.5 w-3.5" /> MEDICAL RECORDS</div>
          <div class="mt-2 text-[19px] font-extrabold">上传三甲医院筛查材料</div>
          <div class="mt-1 text-[11px] leading-relaxed text-white/70">支持图片 / PDF，多份分类归档。演示环境点击即可模拟上传。</div>
        </div>
        <button
          v-for="m in materials" :key="m.key"
          class="tap flex w-full items-center gap-3 rounded-2xl border bg-white/85 p-3.5 text-left"
          :class="files[m.key] ? 'border-brand-600/25' : 'border-black/[0.06]'"
          @click="upload(m.key)"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="files[m.key] ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'">
            <component :is="files[m.key] ? Check : m.icon" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[12.5px] font-extrabold text-ink">{{ m.name }}</div>
            <div class="mt-0.5 text-[10px] text-muted">{{ files[m.key] || m.desc }}</div>
          </div>
          <span class="pill" :class="files[m.key] ? 'pill-green' : 'pill-slate'">{{ uploading === m.key ? '上传中' : files[m.key] ? '已上传' : '上传' }}</span>
        </button>
        <div class="rounded-2xl border border-amber-300/30 bg-[#fbf6e9] p-3 text-[10px] leading-relaxed text-[#8a641f]">
          <b>材料要求：</b>开营前 30 天内的三甲医院空腹抽血、心电图或动态心电、颈动脉超声；如已确诊，请附出院小结或门诊病历。材料仅用于医师评估，不会对外提供。
        </div>
      </div>

      <div class="mt-4">
        <Button class="w-full" size="lg" :disabled="!canNext" @click="next">
          {{ step < 4 ? '下一步' : '提交并进入健康营' }}
        </Button>
        <p class="mt-2 text-center text-[9.5px] text-muted/60">提交后医师将在 1 个工作日内完成入营审核</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chip {
  padding: 6px 11px;
  border-radius: 10px;
  border: 1px solid rgba(20, 48, 46, 0.08);
  background: #f7faf9;
  font-size: 11px;
  font-weight: 600;
  color: #526663;
}
.chip-on {
  border-color: rgba(14, 124, 107, 0.4);
  background: #eaf7f3;
  color: #0b6558;
  font-weight: 800;
}
</style>
