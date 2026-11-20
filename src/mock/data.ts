import type {
  Account, ActivityDef, AlertItem, AppData, BpRecord, Camp, CheckinComment, DietRecord,
  ExerciseRecord, ExerciseRx, FollowupRecord, GlobalConfig, MedicationPlan, MetricDef,
  MetricSnapshot, NutritionRx, Org, PermissionRow, Student, Thread, WeightRecord,
} from '../types';
import { addDays, DEMO_TODAY, rel, relTime } from '../lib/date';

// ============================================================================
//  基础字典
// ============================================================================

export const METRIC_DEFS: MetricDef[] = [
  { key: 'sbp', name: '收缩压', shortName: '收缩压', unit: 'mmHg', category: '血压心率', refText: '<130', refHigh: 130, direction: 'lower', target: 130 },
  { key: 'dbp', name: '舒张压', shortName: '舒张压', unit: 'mmHg', category: '血压心率', refText: '<80', refHigh: 80, direction: 'lower', target: 80 },
  { key: 'hr', name: '静息心率', shortName: '心率', unit: '次/分', category: '血压心率', refText: '60–100', refLow: 60, refHigh: 100, direction: 'range' },
  { key: 'ldl', name: '低密度脂蛋白胆固醇', shortName: 'LDL-C', unit: 'mmol/L', category: '血脂', refText: '<1.8（高危）', refHigh: 1.8, direction: 'lower', target: 1.8, decimals: 2 },
  { key: 'tc', name: '总胆固醇', shortName: 'TC', unit: 'mmol/L', category: '血脂', refText: '<5.2', refHigh: 5.2, direction: 'lower', decimals: 2 },
  { key: 'tg', name: '甘油三酯', shortName: 'TG', unit: 'mmol/L', category: '血脂', refText: '<1.7', refHigh: 1.7, direction: 'lower', decimals: 2 },
  { key: 'hdl', name: '高密度脂蛋白胆固醇', shortName: 'HDL-C', unit: 'mmol/L', category: '血脂', refText: '>1.04', refLow: 1.04, direction: 'higher', decimals: 2 },
  { key: 'hba1c', name: '糖化血红蛋白', shortName: 'HbA1c', unit: '%', category: '血糖', refText: '<6.5', refHigh: 6.5, direction: 'lower', decimals: 1 },
  { key: 'fpg', name: '空腹血糖', shortName: 'FPG', unit: 'mmol/L', category: '血糖', refText: '3.9–6.1', refLow: 3.9, refHigh: 6.1, direction: 'range', decimals: 1 },
  { key: 'weight', name: '体重', shortName: '体重', unit: 'kg', category: '身体测量', refText: '—', direction: 'range', decimals: 1 },
  { key: 'bmi', name: '体质指数', shortName: 'BMI', unit: 'kg/m²', category: '身体测量', refText: '<24', refHigh: 24, direction: 'lower', decimals: 1 },
  { key: 'waist', name: '腰围', shortName: '腰围', unit: 'cm', category: '身体测量', refText: '男<90 / 女<85', refHigh: 90, direction: 'lower' },
  { key: 'bodyFat', name: '体脂率', shortName: '体脂率', unit: '%', category: '身体测量', refText: '男<25 / 女<32', refHigh: 25, direction: 'lower', decimals: 1 },
  { key: 'imt', name: '颈动脉内中膜厚度', shortName: 'IMT', unit: 'mm', category: '血管与炎症', refText: '<1.0', refHigh: 1.0, direction: 'lower', decimals: 2 },
  { key: 'hcy', name: '同型半胱氨酸', shortName: 'Hcy', unit: 'μmol/L', category: '血管与炎症', refText: '<15', refHigh: 15, direction: 'lower', decimals: 1 },
  { key: 'crp', name: '超敏C反应蛋白', shortName: 'hs-CRP', unit: 'mg/L', category: '血管与炎症', refText: '<3.0', refHigh: 3.0, direction: 'lower', decimals: 1 },
  { key: 'alt', name: '丙氨酸氨基转移酶', shortName: 'ALT', unit: 'U/L', category: '肝肾功能', refText: '7–40', refLow: 7, refHigh: 40, direction: 'range' },
  { key: 'cr', name: '肌酐', shortName: 'Cr', unit: 'μmol/L', category: '肝肾功能', refText: '57–97', refLow: 57, refHigh: 97, direction: 'range' },
  { key: 'ua', name: '尿酸', shortName: 'UA', unit: 'μmol/L', category: '肝肾功能', refText: '男<420 / 女<360', refHigh: 420, direction: 'lower' },
];

export const ORGS: Org[] = [
  { id: 'org1', name: '北京大学国际医院', shortName: '北医国际', type: 'head', city: '北京', contact: '李项目', accountCount: 18, studentCount: 96 },
  { id: 'org2', name: '北大医疗康复医院', shortName: '康复医院', type: 'hospital', city: '北京', contact: '王主任', accountCount: 12, studentCount: 48 },
  { id: 'org3', name: '北大医疗石油医院', shortName: '石油医院', type: 'hospital', city: '北京', contact: '刘主任', accountCount: 8, studentCount: 32 },
];

const camp: Camp = {
  id: 'camp1',
  name: '心脑血管防治营 · 第一期',
  orgId: 'org1',
  startDate: '2026-12-01',
  endDate: '2027-11-30',
  status: 'active',
  batch: '2026 冬季批次',
  intensiveEnd: '2026-12-21',
  checkpoints: [
    { key: 'baseline', label: '开营筛查', date: '2026-12-01', status: 'done' },
    { key: 'month6', label: '第 6 个月复筛', date: '2027-05-20', status: 'upcoming' },
    { key: 'closing', label: '结营复查', date: '2027-11-25', status: 'upcoming' },
  ],
  studentCount: 12,
};

const camp2: Camp = {
  id: 'camp2',
  name: '心脑血管防治营 · 第二期（筹备）',
  orgId: 'org2',
  startDate: '2027-03-01',
  endDate: '2028-02-29',
  status: 'upcoming',
  batch: '2027 春季批次',
  intensiveEnd: '2027-03-21',
  checkpoints: [
    { key: 'baseline', label: '开营筛查', date: '2027-03-01', status: 'upcoming' },
    { key: 'month6', label: '第 6 个月复筛', date: '2027-08-20', status: 'upcoming' },
    { key: 'closing', label: '结营复查', date: '2028-02-25', status: 'upcoming' },
  ],
  studentCount: 0,
};

const STUDENT_SEED = [
  { id: 's1', name: '张伟', gender: 'male', age: 56, risk: 'high', tags: ['高血压 3 级', '颈动脉斑块', 'LDL-C 偏高'], height: 172, weight: 82, waist: 98, job: '项目经理', phone: '13900000001' },
  { id: 's2', name: '李秀兰', gender: 'female', age: 62, risk: 'very_high', tags: ['冠心病史', '高血压', '2 型糖尿病'], height: 158, weight: 68, waist: 92, job: '退休教师', phone: '13900000002' },
  { id: 's3', name: '王建国', gender: 'male', age: 58, risk: 'high', tags: ['高血压', '吸烟史', '腹型肥胖'], height: 176, weight: 88, waist: 102, job: '工程师', phone: '13900000003' },
  { id: 's4', name: '赵敏', gender: 'female', age: 49, risk: 'medium', tags: ['LDL-C 偏高', '超重'], height: 163, weight: 66, waist: 86, job: '财务主管', phone: '13900000004' },
  { id: 's5', name: '陈志强', gender: 'male', age: 61, risk: 'very_high', tags: ['脑梗史', '高血压', '房颤'], height: 170, weight: 76, waist: 96, job: '退休干部', phone: '13900000005' },
  { id: 's6', name: '刘芳', gender: 'female', age: 54, risk: 'high', tags: ['高血压', '颈动脉斑块'], height: 160, weight: 64, waist: 88, job: '行政经理', phone: '13900000006' },
  { id: 's7', name: '孙海', gender: 'male', age: 47, risk: 'medium', tags: ['血脂异常', '脂肪肝'], height: 178, weight: 86, waist: 98, job: '销售总监', phone: '13900000007' },
  { id: 's8', name: '周慧', gender: 'female', age: 65, risk: 'high', tags: ['高血压', '骨质疏松'], height: 156, weight: 60, waist: 86, job: '退休医生', phone: '13900000008' },
  { id: 's9', name: '吴刚', gender: 'male', age: 52, risk: 'high', tags: ['高血压', '高尿酸'], height: 174, weight: 80, waist: 96, job: '个体经营', phone: '13900000009' },
  { id: 's10', name: '郑丽', gender: 'female', age: 57, risk: 'medium', tags: ['LDL-C 偏高', '失眠'], height: 161, weight: 62, waist: 84, job: '教师', phone: '13900000010' },
  { id: 's11', name: '冯涛', gender: 'male', age: 44, risk: 'medium', tags: ['肥胖', '血脂异常', '久坐'], height: 180, weight: 95, waist: 104, job: '程序员', phone: '13900000011' },
  { id: 's12', name: '何静', gender: 'female', age: 50, risk: 'low', tags: ['血压正常高值', '家族史'], height: 165, weight: 58, waist: 78, job: '设计师', phone: '13900000012' },
] as const;

function careTeam(i: number) {
  return {
    doctorId: i % 2 === 0 ? 'd1' : 'd2',
    coachId: i % 2 === 0 ? 'c1' : 'c2',
    dietitianId: i % 2 === 0 ? 'n1' : 'n2',
  };
}

const STUDENTS: Student[] = STUDENT_SEED.map((s, i) => ({
  id: s.id,
  name: s.name,
  gender: s.gender,
  age: s.age,
  phone: s.phone,
  orgId: 'org1',
  campId: 'camp1',
  cohort: '2026 冬季批次',
  risk: s.risk,
  riskTags: [...s.tags],
  height: s.height,
  weight: s.weight,
  bmi: +(s.weight / ((s.height / 100) ** 2)).toFixed(1),
  waist: s.waist,
  occupation: s.job,
  enrolledAt: '2026-11-26',
  status: 'active',
  careTeam: careTeam(i),
  targets: { sbp: 130, ldl: 1.8, weight: +(s.weight - 6).toFixed(1) },
  materialsReady: true,
  consentSigned: true,
  questionnaireDone: true,
}));

const ACCOUNTS: Account[] = [
  ...STUDENTS.map((s) => ({
    id: s.id, phone: s.phone, name: s.name, role: 'student' as const, orgId: 'org1',
    campIds: ['camp1'], active: true, title: '营员', createdAt: '2026-11-26 10:00',
  })),
  { id: 'd1', phone: '13800000001', name: '李建国', role: 'doctor', orgId: 'org1', title: '主任医师', dept: '心内科', campIds: ['camp1'], active: true, employeeNo: 'D0001', createdAt: '2026-10-01 09:00' },
  { id: 'd2', phone: '13800000002', name: '周敏', role: 'doctor', orgId: 'org1', title: '副主任医师', dept: '心内科', campIds: ['camp1'], active: true, employeeNo: 'D0002', createdAt: '2026-10-01 09:00' },
  { id: 'c1', phone: '13700000001', name: '王凯', role: 'coach', orgId: 'org1', title: '运动康复师', dept: '心脏康复中心', campIds: ['camp1'], active: true, employeeNo: 'C0001', createdAt: '2026-10-01 09:00' },
  { id: 'c2', phone: '13700000002', name: '刘畅', role: 'coach', orgId: 'org1', title: '运动康复师', dept: '心脏康复中心', campIds: ['camp1'], active: true, employeeNo: 'C0002', createdAt: '2026-10-01 09:00' },
  { id: 'n1', phone: '13600000001', name: '陈静', role: 'dietitian', orgId: 'org1', title: '注册营养师', dept: '临床营养科', campIds: ['camp1'], active: true, employeeNo: 'N0001', createdAt: '2026-10-01 09:00' },
  { id: 'n2', phone: '13600000002', name: '赵倩', role: 'dietitian', orgId: 'org1', title: '注册营养师', dept: '临床营养科', campIds: ['camp1'], active: true, employeeNo: 'N0002', createdAt: '2026-10-01 09:00' },
  { id: 'o1', phone: '13500000001', name: '王丽', role: 'org_admin', orgId: 'org2', title: '机构运营管理员', dept: '健康管理部', campIds: ['camp1', 'camp2'], active: true, groups: ['康复医院 A 组', '康复医院 B 组'], createdAt: '2026-09-20 09:00' },
  { id: 'o2', phone: '13500000002', name: '刘强', role: 'org_admin', orgId: 'org1', title: '机构运营管理员', dept: '健康管理中心', campIds: ['camp1'], active: true, groups: ['国际医院总部组'], createdAt: '2026-09-20 09:00' },
  { id: 'a1', phone: '13400000001', name: '李项目', role: 'super_admin', orgId: 'org1', title: '项目超级管理员', dept: '健康事业部', campIds: ['camp1', 'camp2'], active: true, employeeNo: 'A0001', createdAt: '2026-09-01 09:00' },
];

// ============================================================================
//  指标快照
// ============================================================================

const BASE_VALUES: Record<string, Record<string, number>> = {
  s1: { sbp: 158, dbp: 96, hr: 78, ldl: 4.62, tc: 6.35, tg: 2.41, hdl: 0.98, hba1c: 6.4, fpg: 6.8, weight: 82, bmi: 27.7, waist: 98, bodyFat: 29.2, imt: 1.21, hcy: 16.8, crp: 3.8, alt: 32, cr: 88, ua: 452 },
  s2: { sbp: 165, dbp: 92, hr: 84, ldl: 3.21, tc: 5.86, tg: 2.02, hdl: 1.12, hba1c: 7.6, fpg: 8.2, weight: 68, bmi: 27.2, waist: 92, bodyFat: 34.1, imt: 1.08, hcy: 14.2, crp: 4.6, alt: 28, cr: 72, ua: 338 },
  s3: { sbp: 152, dbp: 98, hr: 88, ldl: 3.86, tc: 6.02, tg: 2.88, hdl: 0.92, hba1c: 6.1, fpg: 6.2, weight: 88, bmi: 28.4, waist: 102, bodyFat: 27.8, imt: 1.14, hcy: 18.2, crp: 4.1, alt: 46, cr: 91, ua: 486 },
  s4: { sbp: 128, dbp: 82, hr: 76, ldl: 4.12, tc: 6.12, tg: 1.66, hdl: 1.28, hba1c: 5.8, fpg: 5.6, weight: 66, bmi: 24.8, waist: 86, bodyFat: 31.2, imt: 0.92, hcy: 12.1, crp: 2.1, alt: 22, cr: 64, ua: 302 },
  s5: { sbp: 148, dbp: 90, hr: 96, ldl: 2.92, tc: 5.22, tg: 1.82, hdl: 1.02, hba1c: 6.8, fpg: 7.1, weight: 76, bmi: 26.3, waist: 96, bodyFat: 26.2, imt: 1.32, hcy: 17.5, crp: 5.2, alt: 35, cr: 96, ua: 412 },
  s6: { sbp: 146, dbp: 94, hr: 80, ldl: 3.72, tc: 5.92, tg: 1.92, hdl: 1.18, hba1c: 6.0, fpg: 5.9, weight: 64, bmi: 25.0, waist: 88, bodyFat: 33.4, imt: 1.12, hcy: 13.8, crp: 3.1, alt: 24, cr: 60, ua: 286 },
  s7: { sbp: 136, dbp: 88, hr: 82, ldl: 4.32, tc: 6.52, tg: 3.12, hdl: 0.88, hba1c: 5.9, fpg: 5.8, weight: 86, bmi: 27.1, waist: 98, bodyFat: 26.8, imt: 0.96, hcy: 15.8, crp: 3.6, alt: 58, cr: 82, ua: 468 },
  s8: { sbp: 156, dbp: 88, hr: 72, ldl: 3.42, tc: 5.62, tg: 1.52, hdl: 1.32, hba1c: 6.2, fpg: 6.3, weight: 60, bmi: 24.7, waist: 86, bodyFat: 32.6, imt: 1.06, hcy: 12.6, crp: 2.8, alt: 20, cr: 58, ua: 312 },
  s9: { sbp: 150, dbp: 96, hr: 86, ldl: 3.62, tc: 5.78, tg: 2.62, hdl: 0.96, hba1c: 6.3, fpg: 6.6, weight: 80, bmi: 26.4, waist: 96, bodyFat: 25.6, imt: 1.04, hcy: 17.2, crp: 3.4, alt: 42, cr: 90, ua: 512 },
  s10: { sbp: 132, dbp: 84, hr: 74, ldl: 4.02, tc: 5.98, tg: 1.72, hdl: 1.24, hba1c: 5.9, fpg: 5.7, weight: 62, bmi: 23.9, waist: 84, bodyFat: 30.8, imt: 0.88, hcy: 11.8, crp: 1.9, alt: 19, cr: 55, ua: 268 },
  s11: { sbp: 138, dbp: 90, hr: 80, ldl: 3.92, tc: 6.18, tg: 2.92, hdl: 0.94, hba1c: 6.0, fpg: 5.9, weight: 95, bmi: 29.3, waist: 104, bodyFat: 30.2, imt: 0.94, hcy: 15.2, crp: 3.2, alt: 62, cr: 78, ua: 438 },
  s12: { sbp: 124, dbp: 78, hr: 70, ldl: 3.32, tc: 5.12, tg: 1.18, hdl: 1.46, hba1c: 5.6, fpg: 5.2, weight: 58, bmi: 21.3, waist: 78, bodyFat: 27.4, imt: 0.82, hcy: 10.2, crp: 1.2, alt: 18, cr: 52, ua: 246 },
};

const PLAQUES: Record<string, string> = {
  s1: '左侧颈动脉分叉处斑块 3.2×1.6 mm，低回声',
  s2: '双侧颈动脉多发斑块，右侧最大 4.1×2.0 mm',
  s3: '左侧颈动脉斑块 2.8×1.4 mm',
  s5: '右侧颈动脉斑块 3.6×1.8 mm，伴陈旧性脑梗',
  s6: '左侧颈动脉斑块 2.4×1.2 mm',
  s8: '右侧颈动脉斑块 2.9×1.5 mm',
};

const SNAPSHOTS: MetricSnapshot[] = STUDENTS.map((s) => ({
  id: `snap_${s.id}_baseline`,
  studentId: s.id,
  campId: 'camp1',
  checkpoint: 'baseline',
  date: '2026-12-01',
  values: BASE_VALUES[s.id],
  plaque: PLAQUES[s.id] || '未见明显斑块',
  note: '开营入企筛查 · 三甲医院空腹检查报告',
}));

// 第 6 个月复筛：仅 s1 预留一条“演示预览”数据（页面标注为演示），其余待采集
SNAPSHOTS.push({
  id: 'snap_s1_month6',
  studentId: 's1',
  campId: 'camp1',
  checkpoint: 'month6',
  date: '2027-05-20',
  values: { sbp: 132, dbp: 84, hr: 72, ldl: 2.42, tc: 4.86, tg: 1.62, hdl: 1.14, hba1c: 6.0, fpg: 5.9, weight: 76.8, bmi: 26.0, waist: 92, bodyFat: 25.6, imt: 1.12, hcy: 13.2, crp: 2.4, alt: 28, cr: 86, ua: 402 },
  plaque: '左侧颈动脉斑块 3.0×1.4 mm，较前缩小',
  note: '演示预览数据，实际以第 6 个月入企复筛为准',
});

// ============================================================================
//  打卡记录（围绕演示日生成，确定性）
// ============================================================================

const BP_RECORDS: BpRecord[] = [];
const WEIGHT_RECORDS: WeightRecord[] = [];
const EXERCISE_RECORDS: ExerciseRecord[] = [];
const DIET_RECORDS: DietRecord[] = [];
const MED_RECORDS: { id: string; studentId: string; campId: string; date: string; period: 'morning' | 'evening'; taken: boolean; time?: string }[] = [];

const EX_TYPES = ['快走', '室内骑行', '太极', '弹力带上肢训练', '八段锦', '慢跑'];
const BREAKFASTS = ['燕麦牛奶 + 水煮蛋 + 凉拌菠菜', '全麦面包 + 无糖豆浆 + 小番茄', '杂粮粥 + 鸡蛋 + 清炒时蔬', '玉米 + 低脂奶 + 黄瓜'];
const LUNCHES = ['糙米饭 + 清蒸鲈鱼 + 西兰花', '荞麦面 + 鸡胸肉 + 生菜', '杂粮饭 + 番茄牛腩 + 油麦菜', '藜麦饭 + 虾仁豆腐 + 西葫芦'];
const DINNERS = ['小米粥 + 清炒虾仁 + 菠菜', '红薯 + 香菇鸡片 + 娃娃菜', '杂粮饭 + 清蒸鳕鱼 + 芦笋', '南瓜 + 豆腐羹 + 凉拌木耳'];

function sbpFor(i: number, d: number) {
  const base = BASE_VALUES[`s${i}`].sbp;
  const drop = i === 1 ? 26 : i % 3 === 0 ? 14 : 8;
  return Math.round(base - (drop * d) / 17 + ((d * 7 + i * 3) % 5) - 2);
}

function dbpFor(i: number, d: number) {
  const base = BASE_VALUES[`s${i}`].dbp;
  const drop = i === 1 ? 12 : 6;
  return Math.round(base - (drop * d) / 17 + ((d * 3 + i) % 3) - 1);
}

for (let i = 1; i <= 12; i++) {
  const sid = `s${i}`;
  const startW = BASE_VALUES[sid].weight;
  for (let d = 0; d <= 17; d++) {
    const date = addDays('2026-12-01', d);
    const morning = d % 2 === 0 || i === 1;
    if (morning) {
      BP_RECORDS.push({
        id: `bp_${sid}_${d}_m`, studentId: sid, campId: 'camp1', date: `${date} 07:${20 + (i % 3) * 5}`,
        period: 'morning', sbp: sbpFor(i, d), dbp: dbpFor(i, d), hr: 68 + ((d + i) % 12),
        takenMed: !(d === 6 && i === 3),
      });
    }
    if (d % 2 === 1 || i === 1) {
      BP_RECORDS.push({
        id: `bp_${sid}_${d}_e`, studentId: sid, campId: 'camp1', date: `${date} 20:${10 + (i % 4) * 6}`,
        period: 'evening', sbp: sbpFor(i, d) + 3, dbp: dbpFor(i, d) + 2, hr: 72 + ((d + i) % 10),
        takenMed: true,
      });
    }
    if (d % 2 === 0) {
      WEIGHT_RECORDS.push({
        id: `wt_${sid}_${d}`, studentId: sid, campId: 'camp1', date,
        weight: +(startW - (i === 1 ? 3.4 : 1.2) * (d / 17) + ((d + i) % 3) * 0.1).toFixed(1),
        bodyFat: i === 1 ? +(29.2 - 1.8 * (d / 17)).toFixed(1) : undefined,
        waist: i === 1 ? Math.round(98 - 3 * (d / 17)) : undefined,
      });
    }
    if (d <= 9) {
      MED_RECORDS.push({ id: `med_${sid}_${d}_m`, studentId: sid, campId: 'camp1', date, period: 'morning', taken: !(i === 3 && d === 6), time: `${date} 07:35` });
      if (d % 2 === 0) MED_RECORDS.push({ id: `med_${sid}_${d}_e`, studentId: sid, campId: 'camp1', date, period: 'evening', taken: true, time: `${date} 21:10` });
    }
    // 运动：s1 高频，其他隔天
    if (i === 1 || (d + i) % 2 === 0) {
      const exIdx = (d + i) % EX_TYPES.length;
      const rec: ExerciseRecord = {
        id: `ex_${sid}_${d}`, studentId: sid, campId: 'camp1', date: `${date} ${d % 2 === 0 ? '17:30' : '07:10'}`,
        type: EX_TYPES[exIdx], duration: 25 + ((d * 5 + i) % 20), intensity: (2 + ((d + i) % 3)) as 1 | 2 | 3 | 4 | 5,
        hrAvg: 102 + ((d * 3 + i) % 14), fatigue: (1 + ((d + i) % 2)) as 1 | 2 | 3,
        symptoms: d === 5 && i === 2 ? ['轻微胸闷'] : [],
        note: d % 4 === 0 ? '按处方完成，运动后无不适' : '',
      };
      if (i <= 3 && d >= 14) {
        rec.coachScore = (d % 3 === 0 ? 2 : 1) as 0 | 1 | 2;
        rec.comments = [{
          id: `exc_${sid}_${d}`, role: 'coach', name: i === 1 ? '王凯' : '刘畅',
          text: d % 3 === 0 ? '强度控制得不错，心率在目标区间内，继续保持。' : '时长略短，下次可在热身充分后补足 30 分钟。',
          date: `${date} 19:00`,
        }];
      }
      EXERCISE_RECORDS.push(rec);
    }
    // 饮食：s1 最近 7 天三餐，其他隔天
    if (i === 1 ? d >= 11 : (d + i) % 3 === 0) {
      const meals: { meal: DietRecord['meal']; desc: string; salt: DietRecord['salt'] }[] = [
        { meal: 'breakfast', desc: BREAKFASTS[(d + i) % 4], salt: 'low' },
        { meal: 'lunch', desc: LUNCHES[(d + 1) % 4], salt: d === 14 ? 'high' : 'low' },
        { meal: 'dinner', desc: DINNERS[(d + 2) % 4], salt: 'medium' },
      ];
      meals.forEach((m, mi) => {
        const rec: DietRecord = {
          id: `diet_${sid}_${d}_${mi}`, studentId: sid, campId: 'camp1', date: `${date} ${['08:00', '12:20', '18:40'][mi]}`,
          meal: m.meal, desc: m.desc, salt: m.salt,
        };
        if (i <= 4 && d >= 15) {
          rec.dietitianScore = (mi === 1 && d === 14 ? 0 : 1) as 0 | 1 | 2;
          rec.comments = [{
            id: `dc_${sid}_${d}_${mi}`, role: 'dietitian', name: i <= 2 ? '陈静' : '赵倩',
            text: m.salt === 'high'
              ? '这餐钠摄入偏高，腌制品和酱油要减量，建议用柠檬汁、香醋提味。'
              : '结构合理，主食选了粗粮，蛋白质和蔬菜比例不错，继续保持。',
            date: `${date} ${['09:10', '13:05', '19:30'][mi]}`,
          }];
        }
        DIET_RECORDS.push(rec);
      });
    }
  }
}

// ============================================================================
//  处方 / 用药 / 随访 / 预警
// ============================================================================

const EXERCISE_RXS: ExerciseRx[] = STUDENTS.map((s, i) => ({
  id: `rx_ex_${s.id}`,
  studentId: s.id,
  campId: 'camp1',
  coachId: i % 2 === 0 ? 'c1' : 'c2',
  coachName: i % 2 === 0 ? '王凯' : '刘畅',
  date: '2026-12-02',
  status: 'published',
  goal: i === 1 ? '控制血压、改善心肺耐力，12 周内六分钟步行距离提升 50 米' : '提高心肺耐力，稳定血压，养成规律运动习惯',
  assessment: {
    sixMinWalk: 420 + (i % 5) * 18,
    hrmax: 164 - (s.age - 40),
    bpRest: `${BASE_VALUES[s.id].sbp}/${BASE_VALUES[s.id].dbp} mmHg`,
    ecg: i === 1 ? '窦性心律，偶发房早，未见 ST 段压低' : '窦性心律，未见明显异常',
    risk: i === 1 || i === 4 ? '运动风险中高危，需心电监护下起始' : '运动风险中危，可居家自主训练',
  },
  aerobic: {
    mode: i === 1 ? '快走（平地）' : '快走 / 室内骑行',
    freq: 5,
    minutes: i === 1 ? 30 : 35,
    hrLow: 96,
    hrHigh: 112,
    rpe: '11–13（稍累，可说话）',
  },
  resistance: { freq: 2, sets: 2, reps: '10–12 次/组', mode: '弹力带、自重训练（避免憋气）' },
  flexibility: '每次运动后 5 分钟拉伸，重点下肢与肩背',
  precautions: ['避免清晨 6 点前户外运动', '运动前测血压，≥180/110 暂停', '出现胸闷、胸痛、头晕立即停止并联系医师', '不在饱餐后 1 小时内运动'],
  reviewDate: '2026-12-25',
}));

const NUTRITION_RXS: NutritionRx[] = STUDENTS.map((s, i) => ({
  id: `rx_nu_${s.id}`,
  studentId: s.id,
  campId: 'camp1',
  dietitianId: i % 2 === 0 ? 'n1' : 'n2',
  dietitianName: i % 2 === 0 ? '陈静' : '赵倩',
  date: '2026-12-02',
  status: 'published',
  assessment: {
    energy: 1800 - (i % 3) * 100,
    bmi: s.bmi,
    waist: s.waist,
    egfr: 82 - (i % 4) * 3,
    note: i === 1 ? '合并 2 型糖尿病，需兼顾血糖波动与低盐低脂' : '超重/腹型肥胖，合并血脂异常，以 DASH 饮食为基础',
  },
  targets: { energy: 1800 - (i % 3) * 100, sodium: 2000, protein: 18, fatPct: 25, carbPct: 50 },
  pattern: i === 1 ? 'DASH 饮食 + 糖尿病低GI 主食替换' : 'DASH 饮食 + 低盐低脂',
  sampleMenu: [
    { meal: '早餐', dishes: '燕麦牛奶 250ml、水煮蛋 1 个、凉拌菠菜 100g' },
    { meal: '午餐', dishes: '糙米饭 75g、清蒸鲈鱼 100g、西兰花 150g' },
    { meal: '加餐', dishes: '无糖酸奶 100g 或苹果半个' },
    { meal: '晚餐', dishes: '小米粥 200ml、虾仁豆腐 100g、油麦菜 150g' },
  ],
  interactions: s.id === 's1' ? ['阿托伐他汀：避免大量西柚/柚子汁', '阿司匹林：避免空腹饮酒，注意胃肠道反应'] : ['降压药：避免与高钾盐同用，遵医嘱', '二甲双胍：随餐服用，避免空腹'],
  precautions: ['每日食盐 <5g，警惕酱油、腐乳、腌制品中的隐形盐', '烹调油每日 25–30g，优先橄榄油、菜籽油', '戒烟限酒，男性酒精 <25g/日'],
  reviewDate: '2026-12-25',
}));

const MEDICATIONS: MedicationPlan[] = STUDENTS.map((s, i) => ({
  id: `medplan_${s.id}`,
  studentId: s.id,
  doctorId: i % 2 === 0 ? 'd1' : 'd2',
  doctorName: i % 2 === 0 ? '李建国' : '周敏',
  updatedAt: '2026-12-01 11:20',
  drugs: i === 1
    ? [
        { name: '苯磺酸氨氯地平片', dose: '5 mg', freq: '每日 1 次，晨服', note: '监测踝部水肿' },
        { name: '阿托伐他汀钙片', dose: '20 mg', freq: '每晚 1 次', note: '避免西柚汁' },
        { name: '阿司匹林肠溶片', dose: '100 mg', freq: '每日 1 次，餐后', note: '注意黑便、牙龈出血' },
        { name: '二甲双胍缓释片', dose: '0.5 g', freq: '每日 2 次，随餐', note: '肾功能 eGFR<45 需减量' },
      ]
    : [
        { name: '苯磺酸氨氯地平片', dose: '5 mg', freq: '每日 1 次，晨服' },
        { name: '阿托伐他汀钙片', dose: '20 mg', freq: '每晚 1 次', note: '避免西柚汁' },
        { name: '阿司匹林肠溶片', dose: '100 mg', freq: '每日 1 次，餐后' },
      ],
  adherence: i === 1 ? 0.94 : 0.88,
  note: '用药调整需经医师复诊，不可自行停药',
}));

const FOLLOWUPS: FollowupRecord[] = [
  {
    id: 'fu1', studentId: 's1', campId: 'camp1', doctorId: 'd1', doctorName: '李建国',
    date: '2026-12-01 11:00', type: '入企面诊', risk: 'high', sbp: 158, dbp: 96, hr: 78,
    symptoms: '偶有晨起头晕，无胸痛、无夜间阵发性呼吸困难',
    conclusion: '高血压 3 级（很高危），颈动脉斑块，LDL-C 4.62 mmol/L 未达标；心电图为窦性心律，未见缺血性改变。',
    plan: '维持氨氯地平 5mg qd、阿托伐他汀 20mg qn、阿司匹林 100mg qd；启动 21 天强化期运动与营养处方；家庭血压早晚各一次。',
    nextDate: '2026-12-22', traced: true,
  },
  {
    id: 'fu2', studentId: 's1', campId: 'camp1', doctorId: 'd1', doctorName: '李建国',
    date: '2026-12-08 16:30', type: '线上随访', risk: 'high', sbp: 148, dbp: 92, hr: 76,
    symptoms: '头晕缓解，运动后无胸闷；饮食已开始减盐',
    conclusion: '血压较开营下降 10/4 mmHg，耐受良好；运动依从性较好，继续当前强度。',
    plan: '维持处方；第 2 周起有氧运动增至每周 5 次、每次 30 分钟；2 周后复查家庭血压平均值。',
    nextDate: '2026-12-22', traced: true,
  },
  {
    id: 'fu3', studentId: 's1', campId: 'camp1', doctorId: 'd1', doctorName: '李建国',
    date: '2026-12-15 15:00', type: '电话随访', risk: 'high', sbp: 138, dbp: 86, hr: 74,
    symptoms: '无不适，睡眠改善，已戒烟 2 周',
    conclusion: '家庭血压平均值 136/85 mmHg，较基线下降 22/11 mmHg；用药依从 94%。',
    plan: '维持现有用药与运动处方；12 月 22 日入企复诊，评估是否调整氨氯地平剂量。',
    nextDate: '2026-12-22', traced: true,
  },
  {
    id: 'fu4', studentId: 's2', campId: 'camp1', doctorId: 'd2', doctorName: '周敏',
    date: '2026-12-03 10:20', type: '入企面诊', risk: 'very_high', sbp: 165, dbp: 92, hr: 84,
    symptoms: '活动后气短，偶发心悸',
    conclusion: '冠心病史合并高血压、糖尿病，运动风险高危，需心电监护下起始训练。',
    plan: '调整二甲双胍剂量，运动处方从 15 分钟低强度起始，营养处方按糖尿病低GI执行。',
    nextDate: '2026-12-24', traced: true,
  },
  {
    id: 'fu5', studentId: 's3', campId: 'camp1', doctorId: 'd2', doctorName: '周敏',
    date: '2026-12-10 14:00', type: '线上随访', risk: 'high', sbp: 142, dbp: 90, hr: 82,
    symptoms: '无明显不适，应酬较多',
    conclusion: '血压下降但仍未达标，腹型肥胖，建议加强饮食依从。',
    plan: '加用低剂量他汀强化，营养师加密随访，限制饮酒。',
    nextDate: '2026-12-24', traced: true,
  },
  {
    id: 'fu6', studentId: 's5', campId: 'camp1', doctorId: 'd2', doctorName: '周敏',
    date: '2026-12-12 09:40', type: '绿色通道', risk: 'very_high', sbp: 176, dbp: 104, hr: 110,
    symptoms: '晨起血压 176/104，伴心慌',
    conclusion: '血压危急值，房颤伴快速心室率，已安排心内科门诊加号。',
    plan: '当日门诊评估，暫停运动处方，调整降压与控率方案。',
    nextDate: '2026-12-19', traced: true,
  },
];

const ALERTS: AlertItem[] = [
  { id: 'al1', studentId: 's5', studentName: '陈志强', campId: 'camp1', type: '血压危急', level: 'high', value: '176/104 mmHg', time: relTime(-1, '07:42'), status: 'open' },
  { id: 'al2', studentId: 's2', studentName: '李秀兰', campId: 'camp1', type: '心率异常', level: 'high', value: '静息心率 112 次/分', time: relTime(-2, '21:10'), status: 'open' },
  { id: 'al3', studentId: 's3', studentName: '王建国', campId: 'camp1', type: '随访逾期', level: 'medium', value: '计划随访日 12-15，未完成', time: relTime(-3, '09:00'), status: 'open' },
  { id: 'al4', studentId: 's9', studentName: '吴刚', campId: 'camp1', type: '指标异常', level: 'medium', value: '尿酸 512 μmol/L', time: relTime(-4, '10:30'), status: 'open' },
  { id: 'al5', studentId: 's11', studentName: '冯涛', campId: 'camp1', type: '用药依从低', level: 'medium', value: '近 7 日漏服 3 次', time: relTime(-5, '18:00'), status: 'open' },
  { id: 'al6', studentId: 's1', studentName: '张伟', campId: 'camp1', type: '指标异常', level: 'medium', value: 'LDL-C 4.62 mmol/L 未达标', time: '2026-12-01 11:30', status: 'handled', handler: '李建国' },
];

// ============================================================================
//  运营活动 / 奖品 / 小红花
// ============================================================================

const ACTIVITIES: ActivityDef[] = [
  { id: 'act1', name: '21 / 45 / 90 天连续打卡', type: '连续打卡', window: '开营第 1–90 天', rule: '连续完成每日血压、运动、饮食打卡，断卡重新累计。', reward: '三档实物奖：血压计 / 低钠盐礼盒 / 健康礼包', target: 21, unit: '天', status: 'active', joined: true, progress: 18, phase: 1, icon: 'flame' },
  { id: 'act2', name: '运动达标周', type: '每周主题挑战', window: '开营第 3 周', rule: '按运动处方完成 ≥5 天运动打卡，单次时长达到处方要求。', reward: '30 朵小红花 + 抽奖资格', target: 5, unit: '天', status: 'active', joined: true, progress: 4, phase: 1, icon: 'dumbbell' },
  { id: 'act3', name: '血压自测 7 日赛', type: '指标监测', window: '开营第 4 周', rule: '连续 7 天早晚各测 1 次血压并录入，数据完整无缺项。', reward: '20 朵小红花 + 血压计抽奖资格', target: 7, unit: '天', status: 'active', joined: true, progress: 5, phase: 1, icon: 'heart' },
  { id: 'act4', name: '阶梯达标奖 · 第一阶段', type: '阶梯达标', window: '第 1–3 个月', rule: '血压达标率、运动时长、低盐天数分别达到阶梯目标，上传凭证经医师/运动师确认。', reward: '阶梯礼品 + 小红花', target: 3, unit: '项', status: 'active', joined: true, progress: 1, phase: 1, icon: 'target' },
  { id: 'act5', name: '季度之星评选', type: '排行激励', window: '第 3 个月', rule: '综合小红花榜与指标改善榜评选季度之星，全营公示。', reward: '荣誉证书 + 礼品 + 全营公示', target: 1, unit: '次', status: 'upcoming', joined: false, progress: 0, phase: 1, icon: 'star' },
  { id: 'act6', name: '全勤幸运抽奖', type: '抽奖', window: '第 3、6 个月节点', rule: '当期全勤学员自动进入抽奖池，线上抽取并公示中奖名单。', reward: '特别礼品', target: 1, unit: '次', status: 'upcoming', joined: false, progress: 0, phase: 1, icon: 'gift' },
  { id: 'act7', name: '看得见的改变 · 晒报告', type: 'UGC 分享', window: '第 6 个月', rule: '分享阶段健康报告截图并配一句改变感言，精选内容全营展示。', reward: '小红花 + 精选展示', target: 1, unit: '次', status: 'upcoming', joined: false, progress: 0, phase: 2, icon: 'image' },
  { id: 'act8', name: '阶段健康成果发布会', type: '线上活动', window: '第 6 个月', rule: '线上直播发布阶段成果、优秀学员分享、医师答疑。', reward: '参与小红花 + 抽奖', target: 1, unit: '次', status: 'upcoming', joined: false, progress: 0, phase: 2, icon: 'video' },
  { id: 'act9', name: '年度之星与结营典礼', type: '排行激励', window: '结营日', rule: '年度小红花榜、改善榜颁奖，线上结营典礼并发布年度报告。', reward: '奖杯/证书 + 大奖', target: 1, unit: '次', status: 'upcoming', joined: false, progress: 0, phase: 3, icon: 'trophy' },
  { id: 'act10', name: '一起走 · 万步有约', type: '线上健走', window: '第 2–12 个月', rule: '每日步数同步或手动录入，团队累计里程解锁城市地标，周榜前 10 名得小红花。', reward: '团队里程奖 + 周榜小红花', target: 45, unit: '天', status: 'active', joined: true, progress: 18, phase: 2, icon: 'footprints' },
];

// ============================================================================
//  消息 / 通知
// ============================================================================

const THREADS: Thread[] = [
  {
    id: 'th_s1_d1', studentId: 's1', title: '李建国医师 · 随访沟通',
    members: [{ role: 'student', name: '张伟' }, { role: 'doctor', name: '李建国' }],
    messages: [
      { id: 'm1', fromRole: 'doctor', fromName: '李建国', text: '张伟您好，开营筛查报告我看过了。血压和低密度脂蛋白都需要干预，先按目前方案用药，21 天强化期我们每周跟进一次。', time: relTime(-16, '11:30'), kind: 'text', read: true },
      { id: 'm2', fromRole: 'doctor', fromName: '李建国', text: '已为您制定随访与干预方案：家庭血压早晚各一次，运动从快走 20 分钟起始，2 周后复评。', time: relTime(-16, '11:32'), kind: 'record', read: true },
      { id: 'm3', fromRole: 'student', fromName: '张伟', text: '收到，李主任。这两天早上血压 150/92 左右，头有点晕，需要调药吗？', time: relTime(-10, '08:12'), kind: 'text', read: true },
      { id: 'm4', fromRole: 'doctor', fromName: '李建国', text: '先继续监测，不要自行加药。头晕如果加重或出现胸闷，随时发消息，我们安排绿色通道。', time: relTime(-10, '09:05'), kind: 'text', read: true },
      { id: 'm5', fromRole: 'doctor', fromName: '李建国', text: '12 月 15 日电话随访记录已归档：家庭血压平均 136/85，较基线下降 22/11，方案不变，22 日入企复诊。', time: relTime(-3, '15:20'), kind: 'record', read: false },
    ],
  },
  {
    id: 'th_s1_c1', studentId: 's1', title: '王凯运动师 · 运动处方',
    members: [{ role: 'student', name: '张伟' }, { role: 'coach', name: '王凯' }],
    messages: [
      { id: 'm6', fromRole: 'coach', fromName: '王凯', text: '您的运动处方已发布：快走每周 5 次、每次 30 分钟，心率控制在 96–112。前两周以适应为主，不要追求配速。', time: relTime(-15, '14:00'), kind: 'prescription', read: true },
      { id: 'm7', fromRole: 'student', fromName: '张伟', text: '今天走了 35 分钟，平均心率 108，没有不舒服。', time: relTime(-2, '18:20'), kind: 'text', read: true },
      { id: 'm8', fromRole: 'coach', fromName: '王凯', text: '很好，强度在目标区间内。下周开始每周加 1 次弹力带抗阻，注意不要憋气。', time: relTime(-2, '19:10'), kind: 'text', read: false },
    ],
  },
  {
    id: 'th_s1_n1', studentId: 's1', title: '陈静营养师 · 饮食处方',
    members: [{ role: 'student', name: '张伟' }, { role: 'dietitian', name: '陈静' }],
    messages: [
      { id: 'm9', fromRole: 'dietitian', fromName: '陈静', text: '饮食处方已发您：每日 1800 kcal，食盐 <5g，优先 DASH 饮食。您正在服用他汀，注意不要大量喝西柚汁。', time: relTime(-15, '15:10'), kind: 'prescription', read: true },
      { id: 'm10', fromRole: 'student', fromName: '张伟', text: '应酬比较多，晚上在外吃饭怎么控制？', time: relTime(-6, '20:05'), kind: 'text', read: true },
      { id: 'm11', fromRole: 'dietitian', fromName: '陈静', text: '点菜时优先清蒸、白灼，避开红烧和腌制品；主食减半，先吃蔬菜和蛋白质。第二天早餐清淡一些即可，不用极端节食。', time: relTime(-6, '20:30'), kind: 'text', read: true },
    ],
  },
];

// ============================================================================
//  Seed
// ============================================================================

export function createSeedData(): AppData {
  return {
    orgs: ORGS,
    accounts: ACCOUNTS,
    students: STUDENTS,
    camps: [camp, camp2],
    metrics: METRIC_DEFS,
    snapshots: SNAPSHOTS,
    bpRecords: BP_RECORDS,
    weightRecords: WEIGHT_RECORDS,
    exerciseRecords: EXERCISE_RECORDS,
    dietRecords: DIET_RECORDS,
    medRecords: MED_RECORDS,
    exerciseRxs: EXERCISE_RXS,
    nutritionRxs: NUTRITION_RXS,
    medications: MEDICATIONS,
    followups: FOLLOWUPS,
    alerts: ALERTS,
    activities: ACTIVITIES,
    rewardTiers: [
      { id: 'rt21', name: '21 天连续打卡 · 电子血压计', days: 21, desc: '上臂式电子血压计，支持双人记忆', icon: '压', stock: 40, claimed: 12, active: true },
      { id: 'rt45', name: '45 天连续打卡 · 低钠盐礼盒', days: 45, desc: '低钠盐 6 袋 + 限盐勺 + 低钠食谱', icon: '盐', stock: 60, claimed: 8, active: true },
      { id: 'rt90', name: '90 天连续打卡 · 健康礼包', days: 90, desc: '分药盒、血压记录本、运动毛巾', icon: '礼', stock: 30, claimed: 2, active: true },
    ],
    products: [
      { id: 'p1', name: '上臂式电子血压计', category: '监测设备', flowers: 299, stock: 26, icon: '压', desc: '医用级 accuracy，双人记忆，语音播报', delivery: ['shipped'], active: true, limitPerPerson: 1 },
      { id: 'p2', name: '低钠盐礼盒', category: '健康食品', flowers: 39, stock: 120, icon: '盐', desc: '低钠盐 6 袋 + 2g 限盐勺', delivery: ['shipped', 'in-person'], active: true, limitPerPerson: 2 },
      { id: 'p3', name: '七日分药盒', category: '用药辅助', flowers: 59, stock: 80, icon: '药', desc: '早中晚三格，便携防潮', delivery: ['shipped', 'in-person'], active: true, limitPerPerson: 1 },
      { id: 'p4', name: '智能运动手环', category: '监测设备', flowers: 399, stock: 12, icon: '环', desc: '心率/步数/睡眠监测，7 天续航', delivery: ['shipped'], active: true, limitPerPerson: 1 },
      { id: 'p5', name: '低芥酸菜籽油 2L', category: '健康食品', flowers: 89, stock: 60, icon: '油', desc: '富含不饱和脂肪酸，适合日常烹调', delivery: ['shipped', 'in-person'], active: true, limitPerPerson: 2 },
      { id: 'p6', name: '体脂秤', category: '监测设备', flowers: 199, stock: 18, icon: '秤', desc: '八电极，支持体脂/肌肉/内脏脂肪', delivery: ['shipped'], active: true, limitPerPerson: 1 },
      { id: 'p7', name: '家庭急救药盒', category: '用药辅助', flowers: 129, stock: 35, icon: '盒', desc: '硝酸甘油避光存放格 + 用药卡', delivery: ['shipped', 'in-person'], active: true, limitPerPerson: 1 },
      { id: 'p8', name: '保温杯 500ml', category: '生活用品', flowers: 69, stock: 0, icon: '杯', desc: '316 不锈钢，刻度提醒饮水', delivery: ['in-person'], active: false, limitPerPerson: 1 },
    ],
    exchanges: [
      { id: 'ex1', studentId: 's1', studentName: '张伟', productId: 'p2', productName: '低钠盐礼盒', flowers: 39, date: '2026-12-12 10:20', status: 'shipped', delivery: 'shipped', trackingNo: 'SF1234567890', address: '北京市昌平区回龙观龙域中心 A 座' },
      { id: 'ex2', studentId: 's2', studentName: '李秀兰', productId: 'p3', productName: '七日分药盒', flowers: 59, date: '2026-12-16 15:40', status: 'pending', delivery: 'in-person' },
    ],
    rewardClaims: [
      { id: 'rc1', studentId: 's1', tierId: 'rt21', tierName: '21 天连续打卡 · 电子血压计', days: 21, date: '2026-12-01', status: 'unlocked', delivery: 'shipped' },
      { id: 'rc2', studentId: 's2', tierId: 'rt45', tierName: '45 天连续打卡 · 低钠盐礼盒', days: 45, date: '2026-12-08', status: 'shipped', delivery: 'shipped', trackingNo: 'SF9876543210' },
    ],
    ledger: [
      { id: 'lg1', studentId: 's1', date: '2026-12-01', amount: 50, reason: '入营完成筛查与授权', type: 'earn' },
      { id: 'lg2', studentId: 's1', date: '2026-12-05', amount: 30, reason: '连续打卡 7 天', type: 'earn' },
      { id: 'lg3', studentId: 's1', date: '2026-12-08', amount: 20, reason: '血压自测 7 日赛完成', type: 'earn' },
      { id: 'lg4', studentId: 's1', date: '2026-12-09', amount: 15, reason: '运动达标周完成', type: 'earn' },
      { id: 'lg5', studentId: 's1', date: '2026-12-10', amount: 20, reason: '饮食依从周奖励', type: 'earn' },
      { id: 'lg6', studentId: 's1', date: '2026-12-11', amount: 30, reason: '每周主题挑战完成', type: 'earn' },
      { id: 'lg7', studentId: 's1', date: '2026-12-12', amount: 50, reason: '线下健康讲座参与', type: 'earn' },
      { id: 'lg8', studentId: 's1', date: '2026-12-12', amount: -39, reason: '兑换低钠盐礼盒', type: 'spend' },
      { id: 'lg9', studentId: 's1', date: '2026-12-14', amount: 20, reason: '邀请同事了解健康营', type: 'earn' },
      { id: 'lg10', studentId: 's1', date: '2026-12-16', amount: 30, reason: '连续打卡 14 天', type: 'earn' },
      { id: 'lg11', studentId: 's1', date: '2026-12-17', amount: 10, reason: '完成每周健康知识问答', type: 'earn' },
    ],
    notices: [
      { id: 'nt1', studentId: 's1', category: 'followup', title: '随访记录已归档', body: '李建国医师已将 12 月 15 日电话随访记录归档，结论：血压较基线下降 22/11 mmHg。', time: relTime(-3, '15:20'), read: false },
      { id: 'nt2', studentId: 's1', category: 'comment', title: '运动批注', body: '王凯运动师批注了您 12 月 16 日的快走记录：强度控制得不错。', time: relTime(-2, '19:10'), read: false },
      { id: 'nt3', studentId: 's1', category: 'prescription', title: '运动处方已发布', body: '您的个体化运动处方已更新，请查看并按时完成。', time: relTime(-15, '14:00'), read: true },
      { id: 'nt4', studentId: 's1', category: 'activity', title: '血压自测 7 日赛', body: '还差 2 天完成挑战，完成后可获 20 朵小红花与抽奖资格。', time: relTime(-1, '08:00'), read: false },
      { id: 'nt5', studentId: 's1', category: 'alert', title: '复诊提醒', body: '12 月 22 日 09:30 入企复诊，地点：国际医院健康管理中心 3 层。', time: relTime(-1, '10:00'), read: true },
      { id: 'nt6', studentId: 's1', category: 'system', title: '第 6 个月复筛预告', body: '2027 年 5 月 20 日将进行第 6 个月入企复筛，请提前安排时间。', time: '2026-12-01 09:00', read: true },
    ],
    threads: THREADS,
    config: {
      flowerRate: 1,
      targets: { sbp: 130, dbp: 80, ldl: 1.8, hba1c: 6.5 },
      critical: { sbp: 180, dbp: 110, hrLow: 50, hrHigh: 110 },
      streakTiers: [21, 45, 90],
      activitySwitch: { act1: true, act2: true, act3: true, act4: true, act5: true, act6: true, act7: true, act8: true, act9: true, act10: true },
      delegate: { activity: true, accounts: true, camps: true, rewards: false },
    } as GlobalConfig,
    permissions: [
      { module: '账号与准入', student: '●', coach: '○', dietitian: '○', doctor: '◐ 审核', orgAdmin: '● 机构内', superAdmin: '●' },
      { module: '电子健康档案', student: '● 编辑', coach: '◐ 录运动', dietitian: '◐ 录营养', doctor: '◐ 录方案', orgAdmin: '● 机构内', superAdmin: '●' },
      { module: '运动管理', student: '● 打卡', coach: '● 评估/处方/批注', dietitian: '○', doctor: '○', orgAdmin: '● 机构内', superAdmin: '●' },
      { module: '营养管理', student: '● 打卡', coach: '—', dietitian: '● 评估/处方/批注', doctor: '○', orgAdmin: '● 机构内', superAdmin: '●' },
      { module: '用药与诊疗', student: '● 查看', coach: '—', dietitian: '—', doctor: '● 开具', orgAdmin: '—', superAdmin: '● 配置' },
      { module: '打卡与激励', student: '● 打卡/领奖', coach: '◐ 运动积分', dietitian: '◐ 饮食积分', doctor: '—', orgAdmin: '● 机构内', superAdmin: '●' },
      { module: '运营活动', student: '● 参与', coach: '○', dietitian: '○', doctor: '○', orgAdmin: '● 机构内', superAdmin: '●' },
      { module: '报告与数据', student: '● 查看', coach: '○', dietitian: '○', doctor: '○', orgAdmin: '● 机构内', superAdmin: '● 项目' },
      { module: '互联网医院', student: '● 问诊', coach: '—', dietitian: '—', doctor: '● 接诊', orgAdmin: '—', superAdmin: '● 接入' },
      { module: '商城', student: '● 兑换', coach: '—', dietitian: '—', doctor: '◐ 开方', orgAdmin: '● 机构内', superAdmin: '● 配置' },
      { module: '系统与配置', student: '—', coach: '—', dietitian: '◐ 部分', doctor: '—', orgAdmin: '● 机构内', superAdmin: '全部' },
    ],
  };
}

/** 登录页一键体验账号 */
export const DEMO_LOGINS = [
  { role: 'student', label: '学员 · 张伟', phone: '13900000001', desc: '高危 · 高血压 + 斑块', color: '#0E7C6B' },
  { role: 'doctor', label: '医师 · 李建国', phone: '13800000001', desc: '心内科主任医师', color: '#0F5C6B' },
  { role: 'coach', label: '运动师 · 王凯', phone: '13700000001', desc: '心脏康复中心', color: '#D9553E' },
  { role: 'dietitian', label: '营养师 · 陈静', phone: '13600000001', desc: '临床营养科', color: '#2C7DA0' },
  { role: 'org_admin', label: '机构管理员 · 王丽', phone: '13500000001', desc: '康复医院 · 二级运营', color: '#7A5C3E' },
  { role: 'super_admin', label: '超级管理员 · 李项目', phone: '13400000001', desc: '北医国际 · 全局管控', color: '#1D5250' },
] as const;

export const CAMP_START = '2026-12-01';
export const CAMP_DAY = 18;
export { DEMO_TODAY };
