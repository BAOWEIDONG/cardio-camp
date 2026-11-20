/** 医师端演示数据：随访记录与用药方案（纯前端 mock） */

export interface FollowupRecord {
  id: string;
  studentId: string;
  campId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  type: '入企面诊' | '线上随访' | '电话随访' | '绿色通道';
  risk: '低危' | '中危' | '高危' | '很高危';
  sbp: number;
  dbp: number;
  hr: number;
  symptoms: string;
  conclusion: string;
  plan: string;
  nextDate: string;
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

const d = (offset: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + offset);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
};

export const MOCK_FOLLOWUPS: FollowupRecord[] = [
  {
    id: 'fu1', studentId: 's1', campId: 'camp1', doctorId: 'dr1', doctorName: '李建国',
    date: `${d(-15)} 11:00`, type: '入企面诊', risk: '高危', sbp: 158, dbp: 96, hr: 78,
    symptoms: '偶有晨起头晕，无胸痛、无夜间阵发性呼吸困难',
    conclusion: '高血压 3 级（很高危），颈动脉斑块，LDL-C 4.62 mmol/L 未达标；心电图窦性心律，未见缺血性改变。',
    plan: '维持氨氯地平 5mg qd、阿托伐他汀 20mg qn、阿司匹林 100mg qd；启动运动与营养处方；家庭血压早晚各一次。',
    nextDate: d(4),
  },
  {
    id: 'fu2', studentId: 's1', campId: 'camp1', doctorId: 'dr1', doctorName: '李建国',
    date: `${d(-7)} 16:30`, type: '线上随访', risk: '高危', sbp: 148, dbp: 92, hr: 76,
    symptoms: '头晕缓解，运动后无胸闷；饮食已开始减盐',
    conclusion: '血压较开营下降 10/4 mmHg，耐受良好；运动依从性较好，继续当前强度。',
    plan: '维持处方；有氧运动增至每周 5 次、每次 30 分钟；2 周后复查家庭血压平均值。',
    nextDate: d(4),
  },
  {
    id: 'fu3', studentId: 's1', campId: 'camp1', doctorId: 'dr1', doctorName: '李建国',
    date: `${d(-1)} 15:00`, type: '电话随访', risk: '高危', sbp: 138, dbp: 86, hr: 74,
    symptoms: '无不适，睡眠改善，已戒烟 2 周',
    conclusion: '家庭血压平均值 136/85 mmHg，较基线下降 22/11 mmHg；用药依从 94%。',
    plan: '维持现有用药与运动处方；下次入企复诊评估是否调整氨氯地平剂量。',
    nextDate: d(6),
  },
  {
    id: 'fu4', studentId: 's2', campId: 'camp1', doctorId: 'dr1', doctorName: '李建国',
    date: `${d(-13)} 10:20`, type: '入企面诊', risk: '很高危', sbp: 165, dbp: 92, hr: 84,
    symptoms: '活动后气短，偶发心悸',
    conclusion: '冠心病史合并高血压、糖尿病，运动风险高危，需心电监护下起始训练。',
    plan: '调整二甲双胍剂量，运动处方从 15 分钟低强度起始，营养处方按糖尿病低 GI 执行。',
    nextDate: d(2),
  },
  {
    id: 'fu5', studentId: 's3', campId: 'camp1', doctorId: 'dr1', doctorName: '李建国',
    date: `${d(-5)} 14:00`, type: '线上随访', risk: '高危', sbp: 142, dbp: 90, hr: 82,
    symptoms: '无明显不适，应酬较多',
    conclusion: '血压下降但仍未达标，腹型肥胖，建议加强饮食依从。',
    plan: '加用低剂量他汀强化，营养师加密随访，限制饮酒。',
    nextDate: d(6),
  },
  {
    id: 'fu6', studentId: 's7', campId: 'camp2', doctorId: 'dr3', doctorName: '赵医生',
    date: `${d(-2)} 10:30`, type: '入企面诊', risk: '中危', sbp: 136, dbp: 88, hr: 78,
    symptoms: '偶有应酬后头晕，无胸痛',
    conclusion: '高血压 1 级合并血脂异常，颈动脉未见明显斑块，运动风险中危。',
    plan: '先生活方式干预 4 周，家庭血压早晚各一次；运动从快走 20 分钟起始，低盐低脂饮食。',
    nextDate: d(5),
  },
  {
    id: 'fu7', studentId: 's8', campId: 'camp2', doctorId: 'dr3', doctorName: '赵医生',
    date: `${d(-1)} 15:00`, type: '线上随访', risk: '高危', sbp: 153, dbp: 87, hr: 74,
    symptoms: '晨起血压偏高，无明显不适',
    conclusion: '高血压 2 级，需强化限盐与家庭自测，暂不调整药物。',
    plan: '继续氨氯地平 5mg qd；营养师加密随访，2 周后复评。',
    nextDate: d(6),
  },
];

export const MOCK_MEDS: MedicationPlan[] = [
  {
    id: 'med_s1', studentId: 's1', doctorId: 'dr1', doctorName: '李建国', updatedAt: `${d(-15)} 11:20`, adherence: 0.94,
    drugs: [
      { name: '苯磺酸氨氯地平片', dose: '5 mg', freq: '每日 1 次，晨服', note: '监测踝部水肿' },
      { name: '阿托伐他汀钙片', dose: '20 mg', freq: '每晚 1 次', note: '避免西柚汁' },
      { name: '阿司匹林肠溶片', dose: '100 mg', freq: '每日 1 次，餐后', note: '注意黑便、牙龈出血' },
    ],
    note: '用药调整需经医师复诊，不可自行停药',
  },
  {
    id: 'med_s2', studentId: 's2', doctorId: 'dr1', doctorName: '李建国', updatedAt: `${d(-13)} 10:40`, adherence: 0.88,
    drugs: [
      { name: '苯磺酸氨氯地平片', dose: '5 mg', freq: '每日 1 次' },
      { name: '二甲双胍缓释片', dose: '0.5 g', freq: '每日 2 次，随餐', note: '肾功能 eGFR<45 需减量' },
      { name: '阿托伐他汀钙片', dose: '20 mg', freq: '每晚 1 次' },
    ],
  },
  {
    id: 'med_s3', studentId: 's3', doctorId: 'dr1', doctorName: '李建国', updatedAt: `${d(-5)} 14:20`, adherence: 0.82,
    drugs: [
      { name: '缬沙坦胶囊', dose: '80 mg', freq: '每日 1 次' },
      { name: '阿托伐他汀钙片', dose: '20 mg', freq: '每晚 1 次' },
    ],
  },
  {
    id: 'med_s7', studentId: 's7', doctorId: 'dr3', doctorName: '赵医生', updatedAt: `${d(-2)} 10:40`, adherence: 0.9,
    drugs: [
      { name: '苯磺酸氨氯地平片', dose: '5 mg', freq: '每日 1 次' },
      { name: '阿托伐他汀钙片', dose: '20 mg', freq: '每晚 1 次' },
    ],
    note: '先生活方式干预，4 周后复评',
  },
];

/** 医师负责的患者（演示用固定分组，正式环境按营期/分组授权） */
export const DOCTOR_PATIENTS: Record<string, string[]> = {
  dr1: ['s1', 's2', 's3', 's5'],
  dr2: ['s4', 's6', 's7', 's8'],
  dr3: ['s7', 's8', 's9', 's10'],
};
