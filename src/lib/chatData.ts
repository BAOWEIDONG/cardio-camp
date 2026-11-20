import type { ChatThread } from '../types';

const t = (offsetMin: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + offsetMin);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const MOCK_CHAT_THREADS: ChatThread[] = [
  {
    id: 'chat_s1_doctor', studentId: 's1', staffRole: 'doctor', title: '李建国医师 · 随访沟通',
    messages: [
      { id: 'cm1', fromRole: 'doctor', fromName: '李建国', text: '张伟您好，开营筛查报告我看过了。血压和低密度脂蛋白都需要干预，先按目前方案用药，21 天强化期我们每周跟进一次。', time: t(-60 * 24 * 15), read: true },
      { id: 'cm2', fromRole: 'student', fromName: '张伟', text: '收到，李主任。这两天早上血压 150/92 左右，头有点晕，需要调药吗？', time: t(-60 * 24 * 10), read: true },
      { id: 'cm3', fromRole: 'doctor', fromName: '李建国', text: '先继续监测，不要自行加药。头晕如果加重或出现胸闷，随时发消息，我们安排绿色通道。', time: t(-60 * 24 * 10 + 50), read: true },
      { id: 'cm4', fromRole: 'doctor', fromName: '李建国', text: '12 月 15 日电话随访记录已归档：家庭血压平均 136/85，较基线下降 22/11，方案不变，22 日入企复诊。', time: t(-60 * 24 * 1), read: false },
    ],
  },
  {
    id: 'chat_s1_dietitian', studentId: 's1', staffRole: 'dietitian', title: '王营养师 · 饮食处方',
    messages: [
      { id: 'cm5', fromRole: 'dietitian', fromName: '王营养师', text: '饮食处方已发您：每日 1800 kcal，食盐 <5g，优先 DASH 饮食。您正在服用他汀，注意不要大量喝西柚汁。', time: t(-60 * 24 * 15), read: true },
      { id: 'cm6', fromRole: 'student', fromName: '张伟', text: '应酬比较多，晚上在外吃饭怎么控制？', time: t(-60 * 24 * 6), read: true },
      { id: 'cm7', fromRole: 'dietitian', fromName: '王营养师', text: '点菜优先清蒸、白灼，避开红烧和腌制品；主食减半，先吃蔬菜和蛋白质。第二天早餐清淡一些即可，不用极端节食。', time: t(-60 * 24 * 6 + 30), read: false },
    ],
  },
  {
    id: 'chat_s1_coach', studentId: 's1', staffRole: 'coach', title: '李运动师 · 运动处方',
    messages: [
      { id: 'cm8', fromRole: 'coach', fromName: '李运动师', text: '您的运动处方已发布：快走每周 5 次、每次 30 分钟，心率控制在 98–115。前两周以适应为主，不要追求配速。', time: t(-60 * 24 * 15), read: true },
      { id: 'cm9', fromRole: 'student', fromName: '张伟', text: '今天走了 35 分钟，平均心率 108，没有不舒服。', time: t(-60 * 24 * 2), read: true },
      { id: 'cm10', fromRole: 'coach', fromName: '李运动师', text: '很好，强度在靶心率内。下周开始每周加 1 次弹力带抗阻，注意不要憋气。', time: t(-60 * 24 * 2 + 40), read: false },
    ],
  },
];
