<script setup lang="ts">
import { computed, ref } from 'vue';
import { showDialog, showToast, Checkbox as VanCheckbox } from 'vant';
import {
  Activity, Building2, CheckCircle2, Dumbbell, GraduationCap, HeartPulse, Leaf,
  ShieldCheck, Stethoscope, ChevronRight, Sparkles, LockKeyhole,
} from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { DEMO_LOGINS } from '../mock/data';
import { Button, Input } from '../components/ui';
import type { Role } from '../types';

const store = useAppStore();
const role = ref<Role>('student');
const phone = ref('');
const code = ref('123456');
const agreed = ref(false);
const error = ref('');
const loading = ref(false);

const roles: { key: Role; label: string; sub: string; icon: unknown; color: string; bg: string }[] = [
  { key: 'student', label: '学员', sub: '营员端', icon: GraduationCap, color: '#1F6A95', bg: '#EDF6FC' },
  { key: 'doctor', label: '医师', sub: '诊疗与随访', icon: Stethoscope, color: '#144E73', bg: '#EDF3F8' },
  { key: 'coach', label: '运动师', sub: '评估与处方', icon: Dumbbell, color: '#D9553E', bg: '#FDF1ED' },
  { key: 'dietitian', label: '营养师', sub: '营养与批注', icon: Leaf, color: '#2C7DA0', bg: '#EDF5FA' },
  { key: 'org_admin', label: '机构管理员', sub: '二级运营', icon: Building2, color: '#96703F', bg: '#F8F2E9' },
  { key: 'super_admin', label: '超级管理员', sub: '北医国际', icon: ShieldCheck, color: '#1E3A52', bg: '#EDF3F2' },
];

const activeRole = computed(() => roles.find((r) => r.key === role.value)!);
const demoForRole = computed(() => DEMO_LOGINS.find((d) => d.role === role.value)!);

function pickRole(r: Role) {
  role.value = r;
  error.value = '';
}

function afterLogin(ok: boolean, message?: string) {
  if (!ok) { error.value = message || '登录失败'; return; }
  showToast({ message: `欢迎回来，${store.currentUser?.name || ''}`, position: 'bottom' });
}

function quickLogin() {
  if (!agreed.value) { error.value = '请先勾选同意《服务协议》与《隐私政策》'; return; }
  loading.value = true;
  const acc = DEMO_LOGINS.find((d) => d.role === role.value)!;
  setTimeout(() => {
    const res = store.login(acc.phone, role.value);
    loading.value = false;
    afterLogin(res.ok, res.message);
  }, 350);
}

function manualLogin() {
  error.value = '';
  if (!agreed.value) { error.value = '请先勾选同意《服务协议》与《隐私政策》'; return; }
  if (phone.value.length !== 11) { error.value = '请输入 11 位手机号'; return; }
  if (code.value.length !== 6) { error.value = '请输入 6 位验证码'; return; }
  const res = store.login(phone.value, role.value);
  afterLogin(res.ok, res.message);
}

const agreement = () => showDialog({
  title: '服务协议与隐私授权',
  message: '本演示为产品原型，所有姓名、电话、健康指标均为模拟数据。正式环境将按《个人信息保护法》与医疗健康数据管理要求，签署知情同意书并留存授权版本、时间与操作留痕。',
  confirmButtonText: '我知道了',
});
const privacy = () => showDialog({
  title: '健康数据使用说明',
  message: '健康数据仅用于营期评估、处方制定与随访管理；医师、运动师、营养师按最小必要原则分级授权；互联网医院问诊将跳转至合作平台，不在此 H5 内留存诊疗数据。',
  confirmButtonText: '我知道了',
});
</script>

<template>
  <div class="app-page">
    <div class="page-scroll no-tabbar">
      <!-- 顶部品牌区 -->
      <div class="relative overflow-hidden rounded-b-[34px] bg-[linear-gradient(150deg,#123B53_0%,#1A577C_46%,#1F6A95_100%)] px-5 pb-7 pt-9 text-white">
        <div class="absolute -right-16 -top-14 h-52 w-52 rounded-full border border-white/10" />
        <div class="absolute -right-8 -top-6 h-36 w-36 rounded-full border border-white/10" />
        <svg class="pointer-events-none absolute inset-x-0 bottom-14 h-16 opacity-25" viewBox="0 0 360 64" preserveAspectRatio="none">
          <path d="M0 38 H54 L62 38 L68 14 L75 52 L82 26 L89 38 H132 L140 38 L146 18 L153 48 L160 28 L167 38 H214 L222 38 L228 12 L235 50 L242 24 L249 38 H294 L302 38 L308 20 L315 44 L322 30 L329 38 H360"
            fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round" />
        </svg>

        <div class="relative flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/12 backdrop-blur">
            <HeartPulse class="h-6 w-6" />
          </div>
          <div class="min-w-0">
            <div class="text-[10.5px] font-bold tracking-[0.18em] text-white/60">北大医疗国际医院 · 心脏康复中心</div>
            <div class="text-[13px] font-bold text-white/90">心脑血管防治营</div>
          </div>
          <div class="ml-auto rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9.5px] font-bold text-white/80">DEMO</div>
        </div>

        <h1 class="relative mt-7 text-[30px] font-extrabold leading-[1.18] tracking-tight">
          一年守护，<br />让血管慢下来。
        </h1>
        <p class="relative mt-2.5 max-w-[290px] text-[12px] leading-relaxed text-white/72">
          21 天入企强化 + 11 个月线上长期管理，医师、运动师、营养师三师共管，把血压、血脂和斑块管到位。
        </p>

        <div class="relative mt-5 grid grid-cols-3 gap-2">
          <div class="rounded-2xl border border-white/15 bg-white/10 px-2.5 py-2.5 backdrop-blur">
            <div class="text-[18px] font-extrabold leading-none">12<span class="ml-0.5 text-[10px] font-semibold text-white/65">个月</span></div>
            <div class="mt-1 text-[9.5px] text-white/65">全程管理周期</div>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/10 px-2.5 py-2.5 backdrop-blur">
            <div class="text-[18px] font-extrabold leading-none">3<span class="ml-0.5 text-[10px] font-semibold text-white/65">次</span></div>
            <div class="mt-1 text-[9.5px] text-white/65">入企筛查节点</div>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/10 px-2.5 py-2.5 backdrop-blur">
            <div class="text-[18px] font-extrabold leading-none">4<span class="ml-0.5 text-[10px] font-semibold text-white/65">类</span></div>
            <div class="mt-1 text-[9.5px] text-white/65">专业角色共管</div>
          </div>
        </div>
      </div>

      <div class="px-4 pb-8 pt-5">
        <!-- 角色选择 -->
        <div class="flex items-end justify-between px-1">
          <div>
            <div class="text-[15px] font-extrabold text-ink">选择演示角色</div>
            <div class="mt-0.5 text-[11px] text-muted">四类业务角色 + 两级运营管理</div>
          </div>
          <div class="pill pill-brand"><Sparkles class="h-3 w-3" /> 全角色可切换</div>
        </div>

        <div class="mt-3 grid grid-cols-3 gap-2">
          <button
            v-for="r in roles" :key="r.key" @click="pickRole(r.key)"
            class="tap relative flex flex-col items-start rounded-2xl border bg-white/85 p-2.5 text-left transition-all"
            :class="role === r.key ? 'border-transparent shadow-[0_8px_22px_-12px_rgba(8,63,57,.35)] ring-2' : 'border-black/[0.05]'"
            :style="role === r.key ? { '--tw-ring-color': r.color } : {}"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-xl" :style="{ background: r.bg, color: r.color }">
              <component :is="r.icon" class="h-[17px] w-[17px]" />
            </div>
            <div class="mt-2 text-[12px] font-extrabold text-ink">{{ r.label }}</div>
            <div class="mt-0.5 text-[9px] text-muted">{{ r.sub }}</div>
            <CheckCircle2 v-if="role === r.key" class="absolute right-2 top-2 h-3.5 w-3.5" :style="{ color: r.color }" />
          </button>
        </div>

        <!-- 体验账号 -->
        <div class="glass-card mt-4 rounded-2xl p-3.5">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl text-white" :style="{ background: activeRole.color }">
              <component :is="activeRole.icon" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[13px] font-extrabold text-ink">{{ demoForRole.label }}</div>
              <div class="mt-0.5 text-[10.5px] text-muted">{{ demoForRole.desc }} · {{ demoForRole.phone }}</div>
            </div>
            <ChevronRight class="h-4 w-4 text-muted/50" />
          </div>
          <Button class="mt-3 w-full" size="lg" :loading="loading" @click="quickLogin">
            <LockKeyhole class="h-4 w-4" /> 一键进入演示
          </Button>
        </div>

        <!-- 手动登录 -->
        <div class="mt-4 flex items-center gap-3 px-1">
          <div class="h-px flex-1 bg-black/[0.06]" />
          <span class="text-[10px] font-semibold text-muted/70">或使用手机号登录</span>
          <div class="h-px flex-1 bg-black/[0.06]" />
        </div>
        <div class="mt-3 space-y-2.5">
          <Input v-model:value="phone" type="tel" maxlength="11" placeholder="请输入营员名单内的手机号" />
          <div class="flex gap-2.5">
            <Input v-model:value="code" type="text" inputmode="numeric" maxlength="6" placeholder="验证码" />
            <button class="tap shrink-0 rounded-[13px] border border-brand-600/15 bg-brand-50 px-3 text-[11px] font-bold text-brand-700" @click="showToast('验证码已发送：123456')">获取验证码</button>
          </div>
        </div>
        <div v-if="error" class="mt-2 rounded-xl bg-coral-50 px-3 py-2 text-[11px] font-semibold text-coral-600">{{ error }}</div>

        <Button class="mt-3 w-full" variant="secondary" size="lg" @click="manualLogin">登录</Button>

        <div class="mt-3 flex items-start gap-2 px-1">
          <VanCheckbox v-model="agreed" class="custom-checkbox" />
          <div class="text-[10px] leading-relaxed text-muted">
            我已阅读并同意
            <button class="font-bold text-brand-700" @click="agreement">《服务协议》</button>与
            <button class="font-bold text-brand-700" @click="privacy">《隐私政策》</button>，
            授权项目组在营期管理范围内使用我的健康数据。
          </div>
        </div>

        <div class="mt-6 rounded-2xl border border-brand-600/10 bg-brand-50/60 p-3.5">
          <div class="flex items-center gap-2 text-[11px] font-extrabold text-brand-800">
            <Activity class="h-3.5 w-3.5" /> 营期主链路
          </div>
          <div class="mt-2 flex items-center justify-between text-[9.5px] font-semibold text-brand-800/70">
            <span>入营筛查</span><span class="text-brand-600/40">›</span>
            <span>医师评估</span><span class="text-brand-600/40">›</span>
            <span>双处方</span><span class="text-brand-600/40">›</span>
            <span>21 天打卡</span><span class="text-brand-600/40">›</span>
            <span>年度随访</span>
          </div>
        </div>

        <div class="mt-5 text-center text-[9.5px] leading-relaxed text-muted/60">
          本页面为产品演示原型，所有数据均为模拟，不构成医疗建议。<br />
          正式服务由北京大学国际医院心脏康复中心提供。
        </div>
      </div>
    </div>
  </div>
</template>
