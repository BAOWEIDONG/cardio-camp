<script setup lang="ts">
import { computed, ref } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import { Building2, Lock, RotateCcw, ShieldCheck } from 'lucide-vue-next';
import { useAppStore } from '../store/app';
import { NavBar, Card } from './ui';
import { ORGS, orgName } from '../lib/orgs';
import { PERMISSION_MODULES } from '../lib/permissions';
import type { Role } from '../types';

const store = useAppStore();
const isGroup = computed(() => store.user?.role === 'super_admin');
const selectedOrg = ref(store.currentOrgId || 'org1');
const role = ref<Role>('org_admin');
const roleTabs: { key: Role; label: string }[] = [
  { key: 'org_admin', label: '医院管理员' },
  { key: 'doctor', label: '医师' },
  { key: 'coach', label: '运动师' },
  { key: 'dietitian', label: '营养师' },
  { key: 'student', label: '学员' },
];

const perms = computed(() => store.rolePermissions(selectedOrg.value, role.value));
const groups = computed(() => {
  const map: Record<string, typeof PERMISSION_MODULES> = {};
  PERMISSION_MODULES.forEach((m) => (map[m.group] ||= []).push(m));
  return map;
});
const has = (module: string, action: string) => (perms.value[module] || []).includes(action);
function toggle(module: string, action: string) {
  store.toggleRolePermission(selectedOrg.value, role.value, module, action);
}
function allOn(module: string) {
  const def = PERMISSION_MODULES.find((m) => m.key === module);
  return def ? def.actions.every((a) => has(module, a.key)) : false;
}
function toggleAll(module: string) {
  const def = PERMISSION_MODULES.find((m) => m.key === module);
  if (!def) return;
  if (allOn(module)) def.actions.forEach((a) => { if (has(module, a.key)) toggle(module, a.key); });
  else def.actions.forEach((a) => { if (!has(module, a.key)) toggle(module, a.key); });
}
function reset() {
  showConfirmDialog({
    title: '恢复默认权限',
    message: `将「${orgName(selectedOrg.value)} · ${roleTabs.find((r) => r.key === role.value)?.label}」恢复为系统默认权限，已做的自定义修改会丢失。`,
    confirmButtonText: '确认恢复',
  }).then(() => { store.resetRolePermissions(selectedOrg.value, role.value); showToast('已恢复默认'); }).catch(() => {});
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] pb-8">
    <NavBar title="权限配置" :on-back="store.goBack" />

    <div class="px-4 pt-3 space-y-3">
      <Card class="border-0 shadow-sm bg-gradient-to-br from-[#123B53] to-[#1F6A95] text-white p-4">
        <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/55"><ShieldCheck class="h-3.5 w-3.5" /> ROLE & PERMISSION</div>
        <div class="mt-1 text-[17px] font-black">角色 × 菜单 × 操作</div>
        <div class="mt-1 text-[10px] leading-relaxed text-white/70">
          {{ isGroup ? '集团管理员可配置所有医院；' : '医院管理员只能配置本院；' }}团队成员权限跟随医院，不能跨院查看其他医院数据。
        </div>
      </Card>

      <!-- 医院选择 -->
      <Card class="border-0 shadow-sm p-3.5">
        <div class="flex items-center gap-2 text-[11px] font-bold text-gray-900"><Building2 class="h-4 w-4 text-[#1F6A95]" /> 配置范围</div>
        <div v-if="isGroup" class="mt-2 flex flex-wrap gap-1.5">
          <button v-for="o in ORGS" :key="o.id" class="rounded-full px-3 py-1.5 text-[10px] font-bold" :class="selectedOrg === o.id ? 'bg-[#1F6A95] text-white' : 'bg-gray-100 text-gray-500'" @click="selectedOrg = o.id">{{ o.shortName }}</button>
        </div>
        <div v-else class="mt-2 flex items-center gap-2 rounded-xl bg-[#1F6A95]/5 px-3 py-2 text-[10px] text-[#1F6A95]">
          <Lock class="h-3.5 w-3.5" /> 当前医院：{{ orgName(store.currentOrgId) }}（仅可配置本院团队）
        </div>
      </Card>

      <!-- 角色 -->
      <div class="grid grid-cols-5 gap-1.5">
        <button v-for="r in roleTabs" :key="r.key" class="rounded-xl border py-2 text-[9.5px] font-bold" :class="role === r.key ? 'border-[#1F6A95] bg-[#1F6A95] text-white' : 'border-gray-100 bg-white text-gray-500'" @click="role = r.key">{{ r.label }}</button>
      </div>

      <!-- 模块权限 -->
      <div v-for="(mods, group) in groups" :key="group" class="space-y-2">
        <div class="ml-1 text-[11px] font-bold text-gray-500">{{ group }}</div>
        <Card v-for="m in mods" :key="m.key" class="border-0 shadow-sm p-3">
          <div class="flex items-center gap-2">
            <div class="min-w-0 flex-1 text-[11px] font-bold text-gray-900">{{ m.label }}</div>
            <button class="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-bold text-gray-500" @click="toggleAll(m.key)">{{ allOn(m.key) ? '清空' : '全选' }}</button>
          </div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="a in m.actions" :key="a.key" class="rounded-lg border px-2.5 py-1 text-[9px] font-bold" :class="has(m.key, a.key) ? 'border-[#1F6A95]/30 bg-[#1F6A95]/8 text-[#1F6A95]' : 'border-gray-100 bg-white text-gray-400'" @click="toggle(m.key, a.key)">{{ a.label }}</button>
          </div>
        </Card>
      </div>

      <button class="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-[10px] font-bold text-gray-500" @click="reset"><RotateCcw class="h-3.5 w-3.5" /> 恢复该角色默认权限</button>

      <div class="rounded-2xl bg-[#1F6A95]/5 px-3 py-2.5 text-[8.5px] leading-relaxed text-[#1A577C]">
        说明：集团管理员为一级权限，可查看所有医院并配置任意医院团队；医院管理员为二级权限，只能配置本院团队。医师/运动师/营养师/学员的权限在本院内生效，不能跨院。
      </div>
    </div>
  </div>
</template>
