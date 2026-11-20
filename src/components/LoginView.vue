<script setup lang="ts">
import { ref } from 'vue';
import { showDialog, Checkbox as VanCheckbox, showToast } from 'vant';
import { useAppStore, isQuestionnaireSubmitted, questionnaireStorageKey } from '../store/app';
import { Button, NavBar } from './ui';
import { MessageCircle, UserCircle, Dumbbell, Leaf, Activity, Stethoscope, Building2, ShieldCheck } from 'lucide-vue-next';
import type { Role } from '../types';

const store = useAppStore();
const step = ref<1 | 2>(1);
const phone = ref('');
const code = ref('');
const role = ref<Role>('student');
const demoPhones: Record<Role, string> = {
  student: '13800000001', coach: '13700000001', dietitian: '13900000001',
  doctor: '13600000001', org_admin: '13500000001', super_admin: '13400000001',
};
function fillDemo() { phone.value = demoPhones[role.value]; code.value = '123456'; }
const agreed = ref(false);
const error = ref('');

const showAgreement = () => showDialog({ title: '服务协议', message: '服务协议详细内容' });
const showPrivacy = () => showDialog({ title: '隐私政策', message: '隐私政策详细内容' });

const handleWeChatLogin = () => {
  setTimeout(() => {
    step.value = 2;
    error.value = '';
  }, 1000);
};

const handlePhoneSubmit = () => {
  if (!agreed.value) {
    error.value = '请先勾选同意《服务协议》与《隐私政策》';
    return;
  }
  if (phone.value.length !== 11 || code.value.length !== 6) {
    error.value = '请输入正确的11位手机号和6位验证码';
    return;
  }

  // 校验：手机号必须在账户管理中已配置且角色匹配、状态启用
  const account = store.accounts.find(
    (a) => a.phone === phone.value && a.role === role.value && a.active,
  );

  if (!account) {
    // 尝试找到该手机号但角色不匹配的账户，给出更精确的提示
    const wrongRoleAccount = store.accounts.find((a) => a.phone === phone.value && a.active);
    if (wrongRoleAccount) {
      const roleLabel = ({ student: '学员', coach: '运动师', dietitian: '营养师', doctor: '医师', org_admin: '机构管理员', super_admin: '超级管理员' } as Record<string,string>)[wrongRoleAccount.role] || '用户';
      error.value = `该手机号已注册为${roleLabel}，请切换角色后登录`;
    } else {
      const inactiveAccount = store.accounts.find((a) => a.phone === phone.value);
      if (inactiveAccount) {
        error.value = '该账户已被禁用，请联系营养师启用';
      } else {
        error.value = '该手机号未在系统中配置，请联系营养师添加账户';
      }
    }
    return;
  }

  error.value = '';
  // 从 students 列表补充 gender/age 信息
  const studentInfo = store.students.find((s) => s.id === account.id);
  if (account.role === 'student') {
    // 演示：跳过 5 步入营问卷，直接进入首页；正式环境由学员真实填写
    try {
      localStorage.setItem(questionnaireStorageKey('submitted', account.id), JSON.stringify({
        demo: true, submittedAt: new Date().toISOString(),
        name: account.name, gender: studentInfo?.gender || 'male', age: studentInfo?.age || 56,
        height: 172, weight: 79,
        medicalHistory: '高血压 3 级、颈动脉斑块、LDL-C 偏高',
        allergies: '无',
        sleepTime: '23:00', wakeTime: '06:30', sleepDuration: '7.5',
        drinkAlcohol: '从不', smoke: '已戒烟', snack: '否', dailyWater: '1800',
        exerciseFrequency: '3', exerciseDuration: '30', exerciseTypes: ['快走', '太极'],
        medicalReports: [
          { url: '', type: 'pdf', name: '空腹抽血化验单（三甲医院）' },
          { url: '', type: 'pdf', name: '12 导联心电图' },
          { url: '', type: 'pdf', name: '颈动脉超声报告' },
          { url: '', type: 'pdf', name: '疾病确诊病历' },
        ],
      }));
    } catch { /* 忽略 */ }
  }
  store.setUser({
    id: account.id,
    role: account.role,
    name: account.name,
    phone: account.phone,
    gender: studentInfo?.gender,
    age: studentInfo?.age,
    supervisor: account.supervisor === true,
  });
  const roleLabel = ({ student: '学员', coach: '运动师', dietitian: '营养师', doctor: '医师', org_admin: '机构管理员', super_admin: '超级管理员' } as Record<string,string>)[account.role] || '用户';
  showToast(`欢迎回来${account.name ? '，' + roleLabel + ' ' + account.name : '，' + roleLabel}`);

  if (account.role === 'coach') store.resetToView('coach-dashboard');
  else if (account.role === 'dietitian') store.resetToView('dietitian-dashboard');
  else if (account.role === 'doctor') { store.selectedCampId = 'camp1'; store.resetToView('doctor-dashboard'); }
  else if (account.role === 'org_admin' || account.role === 'super_admin') { store.selectedCampId = 'camp1'; store.resetToView('admin-dashboard'); }
  else store.resetToView(isQuestionnaireSubmitted(account.id) ? 'dashboard' : 'questionnaire');
};
</script>

<template>
  <div v-if="step === 1" class="flex flex-col bg-gradient-to-b from-[#F7F8FA] to-white" style="min-height: 100vh; min-height: 100dvh;">
    <NavBar title="授权登录" />
    <div class="flex flex-1 flex-col items-center justify-center p-6 space-y-10">
      <div class="flex flex-col items-center space-y-4 mt-4">
        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1F6A95] to-[#164864] shadow-lg shadow-[#1F6A95]/30">
          <Activity class="h-12 w-12 text-white" />
        </div>
        <h1 class="text-[26px] font-bold tracking-tight text-gray-900">心脑血管防治营</h1>
        <p class="text-gray-500 text-center text-sm px-4 leading-relaxed">一年期心血管全程管理，医师、运动师、营养师三师共管</p>
      </div>

      <div class="w-full space-y-4">
        <div class="grid grid-cols-3 gap-3 mb-8">
          <button
            @click="role = 'student'"
            :class="['flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all', role === 'student' ? 'border-[#1F6A95] bg-[#1F6A95]/5' : 'border-gray-100 bg-white hover:border-[#1F6A95]/30']"
          >
            <div :class="['p-2 rounded-full mb-2', role === 'student' ? 'bg-[#1F6A95] text-white' : 'bg-gray-100 text-gray-500']">
              <UserCircle class="w-6 h-6" />
            </div>
            <span :class="['text-sm font-bold', role === 'student' ? 'text-[#1F6A95]' : 'text-gray-600']">学员</span>
          </button>
          <button
            @click="role = 'coach'"
            :class="['flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all', role === 'coach' ? 'border-[#E8674F] bg-[#E8674F]/5' : 'border-gray-100 bg-white hover:border-[#E8674F]/30']"
          >
            <div :class="['p-2 rounded-full mb-2', role === 'coach' ? 'bg-[#E8674F] text-white' : 'bg-gray-100 text-gray-500']">
              <Dumbbell class="w-6 h-6" />
            </div>
            <span :class="['text-sm font-bold', role === 'coach' ? 'text-[#E8674F]' : 'text-gray-600']">运动师</span>
          </button>
          <button
            @click="role = 'dietitian'"
            :class="['flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all', role === 'dietitian' ? 'border-[#2C7DA0] bg-[#2C7DA0]/5' : 'border-gray-100 bg-white hover:border-[#2C7DA0]/30']"
          >
            <div :class="['p-2 rounded-full mb-2', role === 'dietitian' ? 'bg-[#2C7DA0] text-white' : 'bg-gray-100 text-gray-500']">
              <Leaf class="w-6 h-6" />
            </div>
            <span :class="['text-sm font-bold', role === 'dietitian' ? 'text-[#2C7DA0]' : 'text-gray-600']">营养师</span>
          </button>
          <button
            @click="role = 'doctor'"
            :class="['flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all', role === 'doctor' ? 'border-[#1F6A95] bg-[#1F6A95]/5' : 'border-gray-100 bg-white hover:border-[#1F6A95]/30']"
          >
            <div :class="['p-2 rounded-full mb-2', role === 'doctor' ? 'bg-[#1F6A95] text-white' : 'bg-gray-100 text-gray-500']"><Stethoscope class="w-6 h-6" /></div>
            <span :class="['text-sm font-bold', role === 'doctor' ? 'text-[#1F6A95]' : 'text-gray-600']">医师</span>
          </button>
          <button
            @click="role = 'org_admin'"
            :class="['flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all', role === 'org_admin' ? 'border-[#96703F] bg-[#96703F]/5' : 'border-gray-100 bg-white hover:border-[#96703F]/30']"
          >
            <div :class="['p-2 rounded-full mb-2', role === 'org_admin' ? 'bg-[#96703F] text-white' : 'bg-gray-100 text-gray-500']"><Building2 class="w-6 h-6" /></div>
            <span :class="['text-sm font-bold', role === 'org_admin' ? 'text-[#96703F]' : 'text-gray-600']">机构管理员</span>
          </button>
          <button
            @click="role = 'super_admin'"
            :class="['flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all', role === 'super_admin' ? 'border-[#1E3A52] bg-[#1E3A52]/5' : 'border-gray-100 bg-white hover:border-[#1E3A52]/30']"
          >
            <div :class="['p-2 rounded-full mb-2', role === 'super_admin' ? 'bg-[#1E3A52] text-white' : 'bg-gray-100 text-gray-500']"><ShieldCheck class="w-6 h-6" /></div>
            <span :class="['text-sm font-bold', role === 'super_admin' ? 'text-[#1E3A52]' : 'text-gray-600']">超级管理员</span>
          </button>
        </div>

        <button class="w-full rounded-xl border border-[#1F6A95]/20 bg-[#1F6A95]/5 py-2.5 text-[11px] font-bold text-[#1F6A95]" @click="fillDemo">填入体验账号（{{ role === 'student' ? '学员' : role === 'coach' ? '运动师' : role === 'dietitian' ? '营养师' : role === 'doctor' ? '医师' : role === 'org_admin' ? '机构管理员' : '超级管理员' }}）</button>
        <Button class="w-full" size="lg" @click="handleWeChatLogin">
          <MessageCircle class="h-5 w-5" />
          登录/注册
        </Button>
      </div>

      <p class="text-[10px] text-gray-400 text-center leading-relaxed">
        演示环境请使用下方体验账号一键填入<br />
        体验账号：学员 13800000001 / 医师 13600000001 / 运动师 13700000001 / 营养师 13900000001 / 管理员 13400000001
      </p>
    </div>
  </div>

  <div v-else class="flex flex-col bg-white" style="min-height: 100vh; min-height: 100dvh;">
    <NavBar title="绑定手机号" :on-back="() => (step = 1)" />

    <div class="flex-1 flex flex-col px-6 pt-12 pb-6">
      <div class="mb-10">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">安全验证</h2>
        <p class="text-sm text-gray-500">为了保障您的账号安全，请绑定您的常用手机号</p>
      </div>

      <div class="space-y-6">
        <div class="space-y-1 relative">
          <input
            type="tel"
            placeholder="请输入11位手机号"
            class="w-full border-b border-gray-200 py-4 px-2 text-lg focus:border-[#1F6A95] focus:outline-none transition-colors bg-transparent placeholder-gray-300"
            :value="phone"
            @input="phone = ($event.target as HTMLInputElement).value; error = ''"
            maxlength="11"
          />
        </div>

        <div class="space-y-1 relative flex items-center border-b border-gray-200 focus-within:border-[#1F6A95] transition-colors">
          <input
            type="number"
            inputmode="numeric"
            placeholder="请输入6位验证码"
            class="flex-1 py-4 px-2 text-lg focus:outline-none bg-transparent placeholder-gray-300"
            :value="code"
            @input="code = ($event.target as HTMLInputElement).value; error = ''"
            maxlength="6"
          />
          <button
            class="text-[#1F6A95] font-medium text-sm px-4 whitespace-nowrap active:opacity-70 transition-opacity"
            @click="code = '123456'; error = ''"
          >
            获取验证码
          </button>
        </div>
      </div>

      <div v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</div>

      <div class="mt-12">
        <Button class="w-full h-12 text-base font-medium rounded-full shadow-lg shadow-[#1F6A95]/20" @click="handlePhoneSubmit">
          确认绑定
        </Button>
        <div class="flex justify-center mt-6">
          <VanCheckbox :model-value="agreed" @update:model-value="(v: boolean) => { agreed = v; error = ''; }" class="custom-checkbox">
            <p class="text-[10px] text-gray-400 text-center">
              我已阅读并同意<a href="#" class="text-[#1F6A95] hover:underline" @click.prevent="showAgreement">《服务协议》</a>与<a href="#" class="text-[#1F6A95] hover:underline" @click.prevent="showPrivacy">《隐私政策》</a>
            </p>
          </VanCheckbox>
        </div>
      </div>
    </div>
  </div>
</template>
