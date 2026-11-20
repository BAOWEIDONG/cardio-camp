// ============================================================================
//  心脑血管健康营 · 数据模型
//  四类业务角色（学员/医师/运动师/营养师）+ 两级管理端（机构管理员/超级管理员）
//  营期：12 个月 = 21 天线下强化 + 11 个月线上长期管理
// ============================================================================

export type Role = 'student' | 'doctor' | 'coach' | 'dietitian' | 'org_admin' | 'super_admin';

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export type CheckpointKey = 'baseline' | 'month6' | 'closing';

export type View =
  | 'login'
  | 'onboarding'
  // 学员
  | 's-home' | 's-profile' | 's-checkin' | 's-prescription' | 's-activity'
  | 's-mall' | 's-messages' | 's-report' | 's-followup' | 's-service' | 's-calendar'
  | 's-points' | 's-team'
  // 医师
  | 'd-home' | 'd-patients' | 'd-patient' | 'd-followup' | 'd-alerts' | 'd-review' | 'd-messages'
  // 运动师
  | 'c-home' | 'c-students' | 'c-student' | 'c-rx' | 'c-courses' | 'c-messages'
  // 营养师
  | 'n-home' | 'n-students' | 'n-student' | 'n-rx' | 'n-fulfillment' | 'n-rewards'
  | 'n-products' | 'n-accounts' | 'n-metrics' | 'n-camps' | 'n-summary' | 'n-messages'
  // 管理端
  | 'a-home' | 'a-orgs' | 'a-roles' | 'a-config' | 'a-projects' | 'a-accounts' | 'a-rewards'
  | 'a-camps' | 'a-activity' | 'a-dashboard' | 'a-features';

export interface Org {
  id: string;
  name: string;
  shortName: string;
  type: 'head' | 'hospital';
  city?: string;
  contact?: string;
  accountCount: number;
  studentCount: number;
}

export interface Account {
  id: string;
  phone: string;
  name: string;
  role: Role;
  orgId: string;
  title?: string;
  dept?: string;
  campIds: string[];
  active: boolean;
  employeeNo?: string;
  /** 机构管理员可管理的分组 */
  groups?: string[];
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
  orgId: string;
  campId: string;
  cohort: string;
  risk: RiskLevel;
  riskTags: string[];
  height: number;
  weight: number;
  bmi: number;
  waist: number;
  occupation: string;
  enrolledAt: string;
  status: 'screening' | 'active' | 'ended';
  careTeam: { doctorId: string; coachId: string; dietitianId: string };
  targets: { sbp: number; ldl: number; weight: number };
  /** 入营材料是否齐全 */
  materialsReady: boolean;
  consentSigned: boolean;
  questionnaireDone: boolean;
}

export interface Camp {
  id: string;
  name: string;
  orgId: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  batch: string;
  /** 21 天强化期结束日 */
  intensiveEnd: string;
  checkpoints: { key: CheckpointKey; label: string; date: string; status: 'done' | 'current' | 'upcoming' }[];
  studentCount: number;
}

export interface MetricDef {
  key: string;
  name: string;
  shortName: string;
  unit: string;
  category: '血压心率' | '血脂' | '血糖' | '身体测量' | '血管与炎症' | '肝肾功能';
  refText: string;
  refLow?: number;
  refHigh?: number;
  direction: 'lower' | 'higher' | 'range';
  target?: number;
  decimals?: number;
}

export interface MetricSnapshot {
  id: string;
  studentId: string;
  campId: string;
  checkpoint: CheckpointKey;
  date: string;
  values: Record<string, number | null>;
  plaque?: string;
  note?: string;
}

export interface CheckinComment {
  id: string;
  role: 'doctor' | 'coach' | 'dietitian';
  name: string;
  text: string;
  date: string;
  /** 随访留痕：医师随访记录同步到消息与档案 */
  traced?: boolean;
}

export interface BpRecord {
  id: string;
  studentId: string;
  campId: string;
  date: string; // yyyy-MM-dd HH:mm
  period: 'morning' | 'evening';
  sbp: number;
  dbp: number;
  hr: number;
  takenMed: boolean;
  note?: string;
  comments?: CheckinComment[];
}

export interface WeightRecord {
  id: string;
  studentId: string;
  campId: string;
  date: string;
  weight: number;
  bodyFat?: number;
  waist?: number;
  comments?: CheckinComment[];
}

export interface ExerciseRecord {
  id: string;
  studentId: string;
  campId: string;
  date: string;
  type: string;
  duration: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  hrAvg: number;
  fatigue: 1 | 2 | 3;
  symptoms?: string[];
  photos?: string[];
  note?: string;
  comments?: CheckinComment[];
  coachScore?: 0 | 1 | 2 | null;
  studentFeedback?: 'received' | 'helpful';
}

export interface DietRecord {
  id: string;
  studentId: string;
  campId: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  desc: string;
  salt: 'low' | 'medium' | 'high';
  photo?: string;
  comments?: CheckinComment[];
  dietitianScore?: 0 | 1 | 2 | null;
  studentFeedback?: 'received' | 'helpful';
}

export interface MedRecord {
  id: string;
  studentId: string;
  campId: string;
  date: string;
  period: 'morning' | 'evening';
  taken: boolean;
  time?: string;
}

export interface ExerciseRx {
  id: string;
  studentId: string;
  campId: string;
  coachId: string;
  coachName: string;
  date: string;
  status: 'draft' | 'published';
  goal: string;
  assessment: {
    sixMinWalk: number;
    hrmax: number;
    bpRest: string;
    ecg: string;
    risk: string;
  };
  aerobic: { mode: string; freq: number; minutes: number; hrLow: number; hrHigh: number; rpe: string };
  resistance: { freq: number; sets: number; reps: string; mode: string };
  flexibility: string;
  precautions: string[];
  reviewDate: string;
}

export interface NutritionRx {
  id: string;
  studentId: string;
  campId: string;
  dietitianId: string;
  dietitianName: string;
  date: string;
  status: 'draft' | 'published';
  assessment: { energy: number; bmi: number; waist: number; egfr?: number; note: string };
  targets: { energy: number; sodium: number; protein: number; fatPct: number; carbPct: number };
  pattern: string;
  sampleMenu: { meal: string; dishes: string }[];
  interactions: string[];
  precautions: string[];
  reviewDate: string;
}

export interface MedicationPlan {
  id: string;
  studentId: string;
  doctorId: string;
  doctorName: string;
  updatedAt: string;
  drugs: { name: string; dose: string; freq: string; note?: string }[];
  adherence: number;
  note?: string;
}

export interface FollowupRecord {
  id: string;
  studentId: string;
  campId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  type: '入企面诊' | '线上随访' | '电话随访' | '绿色通道';
  risk: RiskLevel;
  sbp: number;
  dbp: number;
  hr: number;
  symptoms: string;
  conclusion: string;
  plan: string;
  nextDate: string;
  traced: boolean;
}

export interface AlertItem {
  id: string;
  studentId: string;
  studentName: string;
  campId: string;
  type: '血压危急' | '心率异常' | '低血糖风险' | '随访逾期' | '指标异常' | '用药依从低';
  level: 'high' | 'medium';
  value: string;
  time: string;
  status: 'open' | 'handled';
  handler?: string;
}

export interface ActivityDef {
  id: string;
  name: string;
  type: string;
  window: string;
  rule: string;
  reward: string;
  target: number;
  unit: string;
  status: 'upcoming' | 'active' | 'done';
  joined?: boolean;
  progress?: number;
  phase: 1 | 2 | 3;
  icon: string;
}

export interface RewardTier {
  id: string;
  name: string;
  days: number;
  desc: string;
  icon: string;
  stock: number;
  claimed: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  flowers: number;
  stock: number;
  icon: string;
  desc: string;
  delivery: ('shipped' | 'in-person')[];
  active: boolean;
  limitPerPerson: number;
}

export interface ExchangeRecord {
  id: string;
  studentId: string;
  studentName: string;
  productId: string;
  productName: string;
  flowers: number;
  date: string;
  status: 'pending' | 'shipped' | 'received' | 'cancelled';
  delivery: 'shipped' | 'in-person';
  trackingNo?: string;
  address?: string;
}

export interface RewardClaim {
  id: string;
  studentId: string;
  tierId: string;
  tierName: string;
  days: number;
  date: string;
  status: 'unlocked' | 'pending' | 'shipped' | 'received';
  delivery: 'shipped' | 'in-person';
  trackingNo?: string;
}

export interface FlowerLedger {
  id: string;
  studentId: string;
  date: string;
  amount: number;
  reason: string;
  type: 'earn' | 'spend';
}

export interface Notice {
  id: string;
  studentId?: string;
  role?: Role;
  category: 'comment' | 'prescription' | 'system' | 'followup' | 'alert' | 'activity';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface Message {
  id: string;
  fromRole: 'student' | 'doctor' | 'coach' | 'dietitian' | 'system';
  fromName: string;
  text: string;
  time: string;
  kind: 'text' | 'record' | 'prescription' | 'alert';
  read: boolean;
}

export interface Thread {
  id: string;
  studentId: string;
  title: string;
  members: { role: Role; name: string }[];
  messages: Message[];
}

export interface GlobalConfig {
  /** 1 朵小红花 = 多少元 */
  flowerRate: number;
  targets: { sbp: number; dbp: number; ldl: number; hba1c: number };
  critical: { sbp: number; dbp: number; hrLow: number; hrHigh: number };
  streakTiers: number[];
  activitySwitch: Record<string, boolean>;
  /** 允许机构管理员配置的权限项 */
  delegate: { activity: boolean; accounts: boolean; camps: boolean; rewards: boolean };
}

export interface PermissionRow {
  module: string;
  student: string;
  coach: string;
  dietitian: string;
  doctor: string;
  orgAdmin: string;
  superAdmin: string;
}

export interface AppData {
  orgs: Org[];
  accounts: Account[];
  students: Student[];
  camps: Camp[];
  metrics: MetricDef[];
  snapshots: MetricSnapshot[];
  bpRecords: BpRecord[];
  weightRecords: WeightRecord[];
  exerciseRecords: ExerciseRecord[];
  dietRecords: DietRecord[];
  medRecords: MedRecord[];
  exerciseRxs: ExerciseRx[];
  nutritionRxs: NutritionRx[];
  medications: MedicationPlan[];
  followups: FollowupRecord[];
  alerts: AlertItem[];
  activities: ActivityDef[];
  rewardTiers: RewardTier[];
  products: Product[];
  exchanges: ExchangeRecord[];
  rewardClaims: RewardClaim[];
  ledger: FlowerLedger[];
  notices: Notice[];
  threads: Thread[];
  config: GlobalConfig;
  permissions: PermissionRow[];
}
