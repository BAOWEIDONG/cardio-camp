import type { Role } from '../types';

export interface PermissionAction { key: string; label: string }
export interface PermissionModule { key: string; label: string; group: string; actions: PermissionAction[] }

export const ACTION_LABELS: Record<string, string> = {
  view: '查看', create: '新增', edit: '编辑', delete: '删除', export: '导出',
  review: '批注/评分', send: '发送消息', publish: '发布', ship: '发放/发货',
  disable: '启禁用', config: '配置', approve: '审核', prescribe: '开方',
};

export const PERMISSION_MODULES: PermissionModule[] = [
  { key: 'dashboard', label: '工作台', group: '业务', actions: [{ key: 'view', label: '查看' }] },
  { key: 'students', label: '学员/患者档案', group: '业务', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '新增' }, { key: 'edit', label: '编辑' }, { key: 'delete', label: '删除' }, { key: 'export', label: '导出' }] },
  { key: 'bp', label: '血压与指标', group: '业务', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '录入' }, { key: 'edit', label: '编辑' }, { key: 'export', label: '导出' }] },
  { key: 'exercise', label: '运动处方与批注', group: '业务', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '开方' }, { key: 'edit', label: '编辑' }, { key: 'review', label: '批注/评分' }] },
  { key: 'diet', label: '营养处方与批注', group: '业务', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '开方' }, { key: 'edit', label: '编辑' }, { key: 'review', label: '批注/评分' }] },
  { key: 'medication', label: '用药与诊疗', group: '业务', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '开具' }, { key: 'edit', label: '调整' }] },
  { key: 'followup', label: '随访管理', group: '业务', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '新增' }, { key: 'edit', label: '编辑' }, { key: 'export', label: '导出' }] },
  { key: 'chat', label: '在线沟通', group: '业务', actions: [{ key: 'view', label: '查看' }, { key: 'send', label: '发送' }] },
  { key: 'activity', label: '活动管理', group: '运营', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '新增' }, { key: 'edit', label: '编辑' }, { key: 'publish', label: '发布/开关' }] },
  { key: 'mall', label: '小红花商城', group: '运营', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '新增商品' }, { key: 'edit', label: '编辑' }, { key: 'ship', label: '发放/发货' }] },
  { key: 'report', label: '报告与统计', group: '数据', actions: [{ key: 'view', label: '查看' }, { key: 'export', label: '导出' }] },
  { key: 'account', label: '账号管理', group: '管理', actions: [{ key: 'view', label: '查看' }, { key: 'create', label: '新增' }, { key: 'edit', label: '编辑' }, { key: 'disable', label: '启禁用' }] },
  { key: 'config', label: '规则配置', group: '管理', actions: [{ key: 'view', label: '查看' }, { key: 'edit', label: '编辑' }] },
  { key: 'permission', label: '权限配置', group: '管理', actions: [{ key: 'view', label: '查看' }, { key: 'edit', label: '编辑' }] },
  { key: 'project', label: '项目总览', group: '管理', actions: [{ key: 'view', label: '查看' }, { key: 'export', label: '导出' }] },
];

const allActions = (moduleKeys: string[]) => {
  const out: Record<string, string[]> = {};
  for (const m of PERMISSION_MODULES) {
    if (moduleKeys.includes(m.key)) out[m.key] = m.actions.map((a) => a.key);
  }
  return out;
};

const defaultByRole = (role: Role): Record<string, string[]> => {
  if (role === 'super_admin') return allActions(PERMISSION_MODULES.map((m) => m.key));
  if (role === 'org_admin') return allActions(['dashboard', 'students', 'bp', 'exercise', 'diet', 'medication', 'followup', 'chat', 'activity', 'mall', 'report', 'account', 'config', 'permission', 'project']);
  if (role === 'doctor') {
    return {
      dashboard: ['view'], students: ['view', 'edit'], bp: ['view', 'create', 'edit', 'export'],
      exercise: ['view'], diet: ['view'], medication: ['view', 'create', 'edit'],
      followup: ['view', 'create', 'edit', 'export'], chat: ['view', 'send'], report: ['view', 'export'],
    };
  }
  if (role === 'coach') {
    return {
      dashboard: ['view'], students: ['view'], bp: ['view'],
      exercise: ['view', 'create', 'edit', 'review'], diet: ['view'],
      chat: ['view', 'send'], report: ['view'],
    };
  }
  if (role === 'dietitian') {
    return {
      dashboard: ['view'], students: ['view'], bp: ['view'],
      exercise: ['view'], diet: ['view', 'create', 'edit', 'review'],
      medication: ['view'], chat: ['view', 'send'], activity: ['view'], mall: ['view'], report: ['view'],
    };
  }
  return {
    dashboard: ['view'], bp: ['view', 'create'], exercise: ['view', 'create'],
    diet: ['view', 'create'], chat: ['view', 'send'], activity: ['view'], mall: ['view'], report: ['view'],
  };
};

/** 权限配置键：医院 + 角色。团队权限跟随医院，不跨院 */
export const permissionKey = (orgId: string, role: Role) => `${orgId}:${role}`;

export function defaultPermissions(role: Role): Record<string, string[]> {
  return defaultByRole(role);
}

export function mergePermissions(base: Record<string, string[]>, override?: Record<string, string[]>): Record<string, string[]> {
  if (!override) return base;
  const out: Record<string, string[]> = {};
  for (const m of PERMISSION_MODULES) {
    out[m.key] = override[m.key] ?? base[m.key] ?? [];
  }
  return out;
}
