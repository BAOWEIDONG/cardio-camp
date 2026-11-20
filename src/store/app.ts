import { computed, reactive, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type {
  Account, AppData, BpRecord, Camp, CheckinComment, DietRecord,
  ExerciseRecord, ExerciseRx, FollowupRecord, MedicationPlan, Message, MetricSnapshot, NutritionRx, Role,
  Student, Thread, View, WeightRecord,
} from '../types';
import { createSeedData } from '../mock/data';
import { CAMP_DAY, CAMP_START, DEMO_TODAY } from '../mock/data';
import { addDays, diffDays, nowTime, parseDate, relTime } from '../lib/date';

const STORAGE_KEY = 'cardio_camp_data_v1';
const AUTH_KEY = 'cardio_camp_auth_v1';
const SCHEMA = 1;

interface Persisted {
  schema: number;
  data: AppData;
  authId: string | null;
  selectedCampId: string;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Persisted;
    if (p.schema !== SCHEMA || !p.data) return null;
    return p;
  } catch { return null; }
}

export const useAppStore = defineStore('app', () => {
  const persisted = typeof localStorage !== 'undefined' ? loadPersisted() : null;
  const data = reactive<AppData>(persisted ? persisted.data : createSeedData());

  const authId = ref<string | null>(
    persisted?.authId || (typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_KEY) : null),
  );
  const currentUser = computed<Account | null>(() => data.accounts.find((a) => a.id === authId.value) || null);
  const role = computed<Role | null>(() => currentUser.value?.role || null);

  const selectedCampId = ref<string>(persisted?.selectedCampId || 'camp1');
  const selectedStudentId = ref<string>('s1');
  const selectedThreadId = ref<string>('th_s1_d1');
  const currentView = ref<View>('login');
  const viewStack = ref<View[]>(['login']);
  const lastNavDirection = ref<'forward' | 'back'>('forward');

  // ── 基础 ─────────────────────────────────────────────────────
  const camp = computed<Camp>(() => data.camps.find((c) => c.id === selectedCampId.value) || data.camps[0]);
  const campDay = computed(() => Math.min(365, Math.max(1, diffDays(camp.value.startDate, DEMO_TODAY) + 1)));
  const intensiveDay = computed(() => Math.min(21, campDay.value, CAMP_DAY));
  const daysToIntensiveEnd = computed(() => Math.max(0, diffDays(DEMO_TODAY, camp.value.intensiveEnd)));
  const isIntensive = computed(() => campDay.value <= 21);

  const accountById = (id?: string) => data.accounts.find((a) => a.id === id);
  const accountName = (id?: string) => accountById(id)?.name || '—';
  const studentById = (id?: string) => data.students.find((s) => s.id === id);
  const currentStudent = computed<Student | null>(() =>
    role.value === 'student' ? studentById(authId.value || '') || null : null,
  );

  const careTeam = (sid: string) => {
    const s = studentById(sid);
    if (!s) return [];
    const pairs: { id: string; label: string }[] = [
      { id: s.careTeam.doctorId, label: '主管医师' },
      { id: s.careTeam.coachId, label: '运动康复师' },
      { id: s.careTeam.dietitianId, label: '注册营养师' },
    ];
    return pairs
      .map((p) => {
        const a = accountById(p.id);
        return a ? { ...a, label: p.label } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  };

  // ── 角色数据范围 ─────────────────────────────────────────────
  const myStudents = computed<Student[]>(() => {
    if (!currentUser.value) return [];
    const id = currentUser.value.id;
    const r = currentUser.value.role;
    const inCamp = (s: Student) => s.campId === selectedCampId.value;
    if (r === 'student') return data.students.filter((s) => s.id === id);
    if (r === 'doctor') return data.students.filter((s) => inCamp(s) && s.careTeam.doctorId === id);
    if (r === 'coach') return data.students.filter((s) => inCamp(s) && s.careTeam.coachId === id);
    if (r === 'dietitian') return data.students.filter((s) => inCamp(s) && s.careTeam.dietitianId === id);
    if (r === 'org_admin') return data.students.filter((s) => inCamp(s) && s.orgId === currentUser.value!.orgId);
    return data.students.filter(inCamp);
  });

  const activeStudentId = computed(() => {
    if (role.value === 'student') return authId.value || 's1';
    if (selectedStudentId.value) return selectedStudentId.value;
    return myStudents.value[0]?.id || 's1';
  });
  const activeStudent = computed(() => studentById(activeStudentId.value));

  // ── 记录读取 ─────────────────────────────────────────────────
  const sortByDate = <T extends { date: string }>(arr: T[]) => [...arr].sort((a, b) => a.date.localeCompare(b.date));

  const bpOf = (sid: string) => sortByDate(data.bpRecords.filter((r) => r.studentId === sid));
  const weightOf = (sid: string) => sortByDate(data.weightRecords.filter((r) => r.studentId === sid));
  const exerciseOf = (sid: string) => sortByDate(data.exerciseRecords.filter((r) => r.studentId === sid));
  const dietOf = (sid: string) => sortByDate(data.dietRecords.filter((r) => r.studentId === sid));
  const medOf = (sid: string) => data.medRecords.filter((r) => r.studentId === sid).sort((a, b) => a.date.localeCompare(b.date));
  const followupsOf = (sid: string) => [...data.followups.filter((f) => f.studentId === sid)].sort((a, b) => b.date.localeCompare(a.date));
  const snapshotOf = (sid: string, checkpoint: string): MetricSnapshot | undefined =>
    data.snapshots.find((s) => s.studentId === sid && s.checkpoint === checkpoint);

  const latestBp = (sid: string) => {
    const arr = bpOf(sid);
    return arr.length ? arr[arr.length - 1] : null;
  };
  const bpAvg = (sid: string, days = 7) => {
    const from = addDays(DEMO_TODAY, -(days - 1));
    const arr = bpOf(sid).filter((r) => r.date.slice(0, 10) >= from);
    if (!arr.length) return null;
    return {
      sbp: Math.round(arr.reduce((n, r) => n + r.sbp, 0) / arr.length),
      dbp: Math.round(arr.reduce((n, r) => n + r.dbp, 0) / arr.length),
      hr: Math.round(arr.reduce((n, r) => n + r.hr, 0) / arr.length),
      count: arr.length,
    };
  };
  const latestWeight = (sid: string) => {
    const arr = weightOf(sid);
    return arr.length ? arr[arr.length - 1] : null;
  };
  const weightChange = (sid: string) => {
    const arr = weightOf(sid);
    if (arr.length < 2) return null;
    return +(arr[arr.length - 1].weight - arr[0].weight).toFixed(1);
  };
  const bpChange = (sid: string) => {
    const arr = bpOf(sid);
    if (arr.length < 2) return null;
    const first = arr[0];
    const avg = bpAvg(sid, 7);
    if (!avg) return null;
    return { sbp: avg.sbp - first.sbp, dbp: avg.dbp - first.dbp };
  };

  const flowers = (sid: string) =>
    data.ledger.filter((l) => l.studentId === sid).reduce((n, l) => n + l.amount, 0);

  const streak = (sid: string) => {
    const dates = new Set<string>();
    bpOf(sid).forEach((r) => dates.add(r.date.slice(0, 10)));
    exerciseOf(sid).forEach((r) => dates.add(r.date.slice(0, 10)));
    dietOf(sid).forEach((r) => dates.add(r.date.slice(0, 10)));
    let n = 0;
    for (let i = 0; i < 120; i++) {
      const d = addDays(DEMO_TODAY, -i);
      if (dates.has(d)) n++;
      else if (i > 0) break;
    }
    return n;
  };

  const todayDone = (sid: string) => {
    const bp = bpOf(sid).some((r) => r.date.startsWith(DEMO_TODAY));
    const ex = exerciseOf(sid).some((r) => r.date.startsWith(DEMO_TODAY));
    const diet = dietOf(sid).filter((r) => r.date.startsWith(DEMO_TODAY)).length >= 3;
    const med = medOf(sid).filter((r) => r.date === DEMO_TODAY).every((r) => r.taken);
    return { bp, ex, diet, med };
  };

  const adherence = (sid: string) => {
    const from = addDays(DEMO_TODAY, -6);
    const inWeek = (d: string) => d.slice(0, 10) >= from;
    const exDays = new Set(exerciseOf(sid).filter((r) => inWeek(r.date)).map((r) => r.date.slice(0, 10))).size;
    const dietDays = new Set(dietOf(sid).filter((r) => inWeek(r.date)).map((r) => r.date.slice(0, 10))).size;
    const meds = medOf(sid).filter((r) => r.date >= from && r.date <= DEMO_TODAY);
    const medRate = meds.length ? Math.round((meds.filter((r) => r.taken).length / meds.length) * 100) : 100;
    return { ex: Math.round((exDays / 7) * 100), diet: Math.round((dietDays / 7) * 100), med: medRate };
  };

  const summary = (sid: string) => {
    const s = studentById(sid);
    const avg = bpAvg(sid);
    const base = snapshotOf(sid, 'baseline');
    const baseSbp = base?.values.sbp ?? null;
    const w0 = weightOf(sid)[0]?.weight ?? s?.weight ?? null;
    const w1 = latestWeight(sid)?.weight ?? null;
    return {
      student: s,
      bp: avg,
      sbpDrop: baseSbp !== null && avg ? Math.round(baseSbp - avg.sbp) : null,
      weight: w1,
      weightDrop: w0 !== null && w1 !== null ? +(w0 - w1).toFixed(1) : null,
      streak: streak(sid),
      flowers: flowers(sid),
      adherence: adherence(sid),
      done: todayDone(sid),
      risk: s?.risk || 'medium',
    };
  };

  const rankList = computed(() => {
    return myStudents.value
      .map((s) => ({ student: s, flowers: flowers(s.id), summary: summary(s.id) }))
      .sort((a, b) => b.flowers - a.flowers)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  });

  // ── 待办 ─────────────────────────────────────────────────────
  const doctorPending = computed(() => {
    const ids = new Set(myStudents.value.map((s) => s.id));
    const openAlerts = data.alerts.filter((a) => a.status === 'open' && ids.has(a.studentId));
    const due = data.students.filter((s) => ids.has(s.id) && followupsOf(s.id)[0] && followupsOf(s.id)[0].nextDate <= addDays(DEMO_TODAY, 4));
    return { alerts: openAlerts.length, due: due.length, review: 3 };
  });

  const coachPending = computed(() => {
    const ids = new Set(myStudents.value.map((s) => s.id));
    const list = data.exerciseRecords.filter((r) => ids.has(r.studentId) && !(r.comments && r.comments.length) && r.date >= addDays(DEMO_TODAY, -3));
    return { comments: list.length, missing: Math.max(0, myStudents.value.length - 3), rx: 2 };
  });

  const dietitianPending = computed(() => {
    const ids = new Set(myStudents.value.map((s) => s.id));
    const list = data.dietRecords.filter((r) => ids.has(r.studentId) && !(r.comments && r.comments.length) && r.date >= addDays(DEMO_TODAY, -2));
    return { comments: list.length, missing: Math.max(0, myStudents.value.length - 4), rx: 1 };
  });

  // ── 通知 / 消息 ─────────────────────────────────────────────
  const noticesFor = (sid: string) => data.notices.filter((n) => n.studentId === sid);
  const unreadNotices = (sid: string) => noticesFor(sid).filter((n) => !n.read).length;
  const unreadMessages = (sid: string) =>
    data.threads.filter((t) => t.studentId === sid).reduce((n, t) => n + t.messages.filter((m) => !m.read && m.fromRole !== 'student').length, 0);
  const unreadCount = (sid: string) => unreadNotices(sid) + unreadMessages(sid);

  const threadFor = (sid: string, roleKey?: 'doctor' | 'coach' | 'dietitian') =>
    data.threads.find((t) => t.studentId === sid && (!roleKey || t.members.some((m) => m.role === roleKey)));

  const threadsFor = (sid: string) => data.threads.filter((t) => t.studentId === sid);

  // ── 登录 / 导航 ─────────────────────────────────────────────
  function login(phone: string, roleSel: Role) {
    const acc = data.accounts.find((a) => a.phone === phone && a.role === roleSel && a.active);
    if (!acc) return { ok: false, message: '该手机号不在营员/员工名单内，请联系项目专员' };
    authId.value = acc.id;
    localStorage.setItem(AUTH_KEY, acc.id);
    if (acc.role === 'student') {
      selectedStudentId.value = acc.id;
      const s = studentById(acc.id);
      if (s) selectedCampId.value = s.campId;
      const ok = s?.questionnaireDone && s?.materialsReady && s?.consentSigned;
      resetToView(ok ? 's-home' : 'onboarding');
    } else if (acc.role === 'doctor') {
      selectedStudentId.value = data.students.find((x) => x.careTeam.doctorId === acc.id)?.id || 's1';
      resetToView('d-home');
    } else if (acc.role === 'coach') {
      selectedStudentId.value = data.students.find((x) => x.careTeam.coachId === acc.id)?.id || 's1';
      resetToView('c-home');
    } else if (acc.role === 'dietitian') {
      selectedStudentId.value = data.students.find((x) => x.careTeam.dietitianId === acc.id)?.id || 's1';
      resetToView('n-home');
    } else if (acc.role === 'org_admin') resetToView('a-dashboard');
    else resetToView('a-home');
    return { ok: true };
  }

  function logout() {
    authId.value = null;
    localStorage.removeItem(AUTH_KEY);
    resetToView('login');
  }

  function setView(v: View, opts: { tab?: boolean } = {}) {
    if (v === currentView.value) return;
    lastNavDirection.value = 'forward';
    if (opts.tab) viewStack.value = [v];
    else viewStack.value = [...viewStack.value, v];
    currentView.value = v;
    const el = document.querySelector('.page-scroll');
    if (el) el.scrollTop = 0;
  }

  function resetToView(v: View) {
    currentView.value = v;
    viewStack.value = [v];
  }

  function back() {
    if (viewStack.value.length > 1) {
      lastNavDirection.value = 'back';
      viewStack.value = viewStack.value.slice(0, -1);
      currentView.value = viewStack.value[viewStack.value.length - 1];
    } else {
      const home: Record<string, View> = {
        student: 's-home', doctor: 'd-home', coach: 'c-home', dietitian: 'n-home',
        org_admin: 'a-dashboard', super_admin: 'a-home',
      };
      if (role.value) resetToView(home[role.value]);
    }
  }

  function openStudent(sid: string, view: View) {
    selectedStudentId.value = sid;
    setView(view);
  }

  // ── 打卡写入 ─────────────────────────────────────────────────
  function addBp(payload: { sbp: number; dbp: number; hr: number; period: 'morning' | 'evening'; takenMed: boolean; note?: string }) {
    const sid = authId.value || 's1';
    const rec: BpRecord = {
      id: `bp_${sid}_${Date.now()}`, studentId: sid, campId: selectedCampId.value,
      date: `${DEMO_TODAY} ${payload.period === 'morning' ? '07:40' : '20:10'}`,
      ...payload,
    };
    data.bpRecords.push(rec);
    addLedger(sid, 2, '血压打卡');
    return rec;
  }

  function addWeight(payload: { weight: number; bodyFat?: number; waist?: number }) {
    const sid = authId.value || 's1';
    const rec: WeightRecord = {
      id: `wt_${sid}_${Date.now()}`, studentId: sid, campId: selectedCampId.value,
      date: DEMO_TODAY, ...payload,
    };
    data.weightRecords.push(rec);
    addLedger(sid, 2, '体重打卡');
    return rec;
  }

  function addExercise(payload: { type: string; duration: number; intensity: 1 | 2 | 3 | 4 | 5; hrAvg: number; fatigue: 1 | 2 | 3; symptoms?: string[]; note?: string }) {
    const sid = authId.value || 's1';
    const rec: ExerciseRecord = {
      id: `ex_${sid}_${Date.now()}`, studentId: sid, campId: selectedCampId.value,
      date: `${DEMO_TODAY} 18:00`, ...payload,
    };
    data.exerciseRecords.push(rec);
    addLedger(sid, 5, '运动打卡');
    return rec;
  }

  function addDiet(payload: { meal: DietRecord['meal']; desc: string; salt: DietRecord['salt'] }) {
    const sid = authId.value || 's1';
    const rec: DietRecord = {
      id: `diet_${sid}_${Date.now()}`, studentId: sid, campId: selectedCampId.value,
      date: `${DEMO_TODAY} ${payload.meal === 'breakfast' ? '08:10' : payload.meal === 'lunch' ? '12:30' : '18:50'}`,
      ...payload,
    };
    data.dietRecords.push(rec);
    addLedger(sid, 3, '饮食打卡');
    return rec;
  }

  function addMed(payload: { period: 'morning' | 'evening'; taken: boolean }) {
    const sid = authId.value || 's1';
    data.medRecords.push({
      id: `med_${sid}_${Date.now()}`, studentId: sid, campId: selectedCampId.value,
      date: DEMO_TODAY, ...payload, time: nowTime(),
    });
  }

  function addLedger(sid: string, amount: number, reason: string) {
    data.ledger.push({ id: `lg_${sid}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, studentId: sid, date: DEMO_TODAY, amount, reason, type: amount >= 0 ? 'earn' : 'spend' });
  }

  // ── 批注 ─────────────────────────────────────────────────────
  type RecordKind = 'bp' | 'weight' | 'exercise' | 'diet';
  function addComment(kind: RecordKind, id: string, text: string, score?: 0 | 1 | 2) {
    const u = currentUser.value;
    if (!u) return;
    const comment: CheckinComment = {
      id: `cm_${Date.now()}`, role: u.role as 'doctor' | 'coach' | 'dietitian', name: u.name, text, date: nowTime(),
    };
    let target: { comments?: CheckinComment[]; coachScore?: 0 | 1 | 2 | null; dietitianScore?: 0 | 1 | 2 | null } | undefined;
    if (kind === 'bp') target = data.bpRecords.find((r) => r.id === id);
    else if (kind === 'weight') target = data.weightRecords.find((r) => r.id === id);
    else if (kind === 'exercise') target = data.exerciseRecords.find((r) => r.id === id);
    else target = data.dietRecords.find((r) => r.id === id);
    if (!target) return;
    target.comments = [...(target.comments || []), comment];
    if (kind === 'exercise' && score !== undefined) target.coachScore = score;
    if (kind === 'diet' && score !== undefined) target.dietitianScore = score;
    const sid = kind === 'bp' ? (target as BpRecord).studentId
      : kind === 'weight' ? (target as WeightRecord).studentId
      : kind === 'exercise' ? (target as ExerciseRecord).studentId
      : (target as DietRecord).studentId;
    data.notices.unshift({
      id: `nt_${Date.now()}`, studentId: sid, category: 'comment',
      title: kind === 'exercise' ? '运动批注' : kind === 'diet' ? '饮食批注' : '健康记录批注',
      body: `${u.name}${u.role === 'doctor' ? '医师' : u.role === 'coach' ? '运动师' : '营养师'}：${text}`,
      time: nowTime(), read: false,
    });
    addLedger(sid, 1, '互动反馈');
  }

  // ── 处方 / 随访 ─────────────────────────────────────────────
  function publishExerciseRx(rx: ExerciseRx) {
    const idx = data.exerciseRxs.findIndex((r) => r.id === rx.id);
    if (idx >= 0) data.exerciseRxs[idx] = { ...rx, status: 'published' };
    else data.exerciseRxs.unshift({ ...rx, status: 'published' });
    data.notices.unshift({
      id: `nt_${Date.now()}`, studentId: rx.studentId, category: 'prescription',
      title: '运动处方已发布', body: `${rx.coachName}运动师更新了您的运动处方，请查看。`,
      time: nowTime(), read: false,
    });
  }

  function publishNutritionRx(rx: NutritionRx) {
    const idx = data.nutritionRxs.findIndex((r) => r.id === rx.id);
    if (idx >= 0) data.nutritionRxs[idx] = { ...rx, status: 'published' };
    else data.nutritionRxs.unshift({ ...rx, status: 'published' });
    data.notices.unshift({
      id: `nt_${Date.now()}`, studentId: rx.studentId, category: 'prescription',
      title: '饮食处方已发布', body: `${rx.dietitianName}营养师更新了您的饮食处方，请查看。`,
      time: nowTime(), read: false,
    });
  }

  function saveMedication(sid: string, drugs: MedicationPlan['drugs'], note?: string) {
    const u = currentUser.value;
    if (!u) return;
    const plan = data.medications.find((m) => m.studentId === sid);
    if (plan) {
      plan.drugs = drugs;
      plan.note = note ?? plan.note;
      plan.updatedAt = nowTime();
      plan.doctorId = u.id;
      plan.doctorName = u.name;
    } else {
      data.medications.push({
        id: `medplan_${sid}`, studentId: sid, doctorId: u.id, doctorName: u.name,
        updatedAt: nowTime(), drugs, adherence: 1, note,
      });
    }
    data.notices.unshift({
      id: `nt_${Date.now()}`, studentId: sid, category: 'prescription',
      title: '用药方案已更新', body: `${u.name}医师调整了您的用药方案，请查看并遵医嘱服用。`,
      time: nowTime(), read: false,
    });
  }

  function addFollowup(payload: Omit<FollowupRecord, 'id' | 'doctorId' | 'doctorName' | 'campId' | 'traced'>) {
    const u = currentUser.value;
    if (!u) return;
    const rec: FollowupRecord = {
      ...payload, id: `fu_${Date.now()}`, doctorId: u.id, doctorName: u.name,
      campId: selectedCampId.value, traced: true,
    };
    data.followups.unshift(rec);
    data.notices.unshift({
      id: `nt_${Date.now()}`, studentId: payload.studentId, category: 'followup',
      title: '随访记录已归档', body: `${u.name}医师已完成${payload.type}，结论：${payload.conclusion}`,
      time: nowTime(), read: false,
    });
    const th = threadFor(payload.studentId, 'doctor');
    if (th) {
      th.messages.push({
        id: `msg_${Date.now()}`, fromRole: 'doctor', fromName: u.name,
        text: `【随访记录】${payload.conclusion} 处理方案：${payload.plan}`,
        time: nowTime(), kind: 'record', read: false,
      });
    }
    return rec;
  }

  function handleAlert(id: string) {
    const a = data.alerts.find((x) => x.id === id);
    if (a) { a.status = 'handled'; a.handler = currentUser.value?.name; }
  }

  // ── 消息 ─────────────────────────────────────────────────────
  function sendMessage(threadId: string, text: string) {
    const th = data.threads.find((t) => t.id === threadId);
    const u = currentUser.value;
    if (!th || !u || !text.trim()) return;
    th.messages.push({
      id: `msg_${Date.now()}`, fromRole: u.role as Message['fromRole'], fromName: u.name,
      text: text.trim(), time: nowTime(), kind: 'text', read: true,
    });
    // 自动回执（演示）
    const responder = th.members.find((m) => m.role !== u.role && m.role !== 'student');
    if (responder) {
      setTimeout(() => {
        th.messages.push({
          id: `msg_${Date.now()}_r`, fromRole: responder.role as Message['fromRole'], fromName: responder.name,
          text: '收到，我先看一下您的记录，稍后给您具体建议。如有胸闷、胸痛等不适请立即停止运动并联系我们。',
          time: nowTime(), kind: 'text', read: true,
        });
      }, 900);
    }
  }

  function ensureThread(sid: string, roleKey: 'doctor' | 'coach' | 'dietitian') {
    const exist = threadFor(sid, roleKey);
    if (exist) return exist;
    const stu = studentById(sid);
    const staff = roleKey === 'doctor' ? accountById(stu?.careTeam.doctorId) : roleKey === 'coach' ? accountById(stu?.careTeam.coachId) : accountById(stu?.careTeam.dietitianId);
    const th: Thread = {
      id: `th_${sid}_${roleKey}`, studentId: sid,
      title: `${staff?.name || ''}${roleKey === 'doctor' ? '医师' : roleKey === 'coach' ? '运动师' : '营养师'} · ${roleKey === 'doctor' ? '随访沟通' : roleKey === 'coach' ? '运动处方' : '饮食处方'}`,
      members: [{ role: 'student', name: stu?.name || '学员' }, { role: roleKey, name: staff?.name || '' }],
      messages: [],
    };
    data.threads.push(th);
    return th;
  }

  function markThreadRead(threadId: string) {
    const th = data.threads.find((t) => t.id === threadId);
    th?.messages.forEach((m) => { if (m.fromRole !== role.value) m.read = true; });
  }

  function markNoticeRead(id: string) {
    const n = data.notices.find((x) => x.id === id);
    if (n) n.read = true;
  }
  function markAllNoticesRead(sid: string) {
    data.notices.forEach((n) => { if (n.studentId === sid) n.read = true; });
  }

  // ── 商城 / 奖励 ─────────────────────────────────────────────
  function exchangeProduct(productId: string, delivery: 'shipped' | 'in-person', address?: string) {
    const u = currentUser.value;
    const p = data.products.find((x) => x.id === productId);
    if (!u || !p) return { ok: false, message: '商品不存在' };
    if (!p.active || p.stock <= 0) return { ok: false, message: '商品已下架或库存不足' };
    if (flowers(u.id) < p.flowers) return { ok: false, message: '小红花不足' };
    p.stock -= 1;
    data.exchanges.unshift({
      id: `ex_${Date.now()}`, studentId: u.id, studentName: u.name, productId: p.id,
      productName: p.name, flowers: p.flowers, date: nowTime(), status: 'pending',
      delivery, address,
    });
    addLedger(u.id, -p.flowers, `兑换${p.name}`);
    return { ok: true, message: '兑换成功，等待发放' };
  }

  function claimReward(tierId: string) {
    const u = currentUser.value;
    const t = data.rewardTiers.find((x) => x.id === tierId);
    if (!u || !t) return;
    data.rewardClaims.unshift({
      id: `rc_${Date.now()}`, studentId: u.id, tierId: t.id, tierName: t.name,
      days: t.days, date: nowTime(), status: 'pending', delivery: 'shipped',
    });
  }

  function shipClaim(id: string, trackingNo: string) {
    const c = data.rewardClaims.find((x) => x.id === id);
    if (c) { c.status = 'shipped'; c.trackingNo = trackingNo; c.delivery = 'shipped'; }
  }
  function shipExchange(id: string, trackingNo: string) {
    const e = data.exchanges.find((x) => x.id === id);
    if (e) { e.status = 'shipped'; e.trackingNo = trackingNo; }
  }
  function verifyExchange(id: string) {
    const e = data.exchanges.find((x) => x.id === id);
    if (e) { e.status = 'received'; }
  }
  function cancelExchange(id: string) {
    const e = data.exchanges.find((x) => x.id === id);
    if (e) { e.status = 'cancelled'; }
  }

  function reorderTier(id: string, dir: -1 | 1) {
    const i = data.rewardTiers.findIndex((t) => t.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= data.rewardTiers.length) return;
    const [x] = data.rewardTiers.splice(i, 1);
    data.rewardTiers.splice(j, 0, x);
  }

  // ── 账户 / 配置 ─────────────────────────────────────────────
  function toggleAccount(id: string) {
    const a = data.accounts.find((x) => x.id === id);
    if (a) a.active = !a.active;
  }

  function addAccount(payload: { name: string; phone: string; role: Role; orgId: string; title?: string }) {
    data.accounts.unshift({
      ...payload, id: `acc_${Date.now()}`, campIds: [selectedCampId.value],
      active: true, createdAt: nowTime(),
    });
  }

  function updateConfig(patch: Partial<AppData['config']>) {
    Object.assign(data.config, patch);
  }

  function completeOnboarding(sid: string) {
    const s = studentById(sid);
    if (!s) return;
    s.questionnaireDone = true;
    s.consentSigned = true;
    s.materialsReady = true;
    s.status = 'active';
    data.notices.unshift({
      id: `nt_${Date.now()}`, studentId: sid, category: 'system',
      title: '入营资料已提交', body: '您的入营问卷与医学材料已提交，医师将在 1 个工作日内完成入营审核。',
      time: nowTime(), read: false,
    });
  }

  function updatePermission(module: string, key: keyof Omit<AppData['permissions'][number], 'module'>, value: string) {
    const row = data.permissions.find((p) => p.module === module);
    if (row) row[key] = value;
  }

  // ── 重置 ─────────────────────────────────────────────────────
  function resetDemo() {
    const seed = createSeedData();
    Object.keys(data).forEach((k) => { delete (data as any)[k]; });
    Object.assign(data, seed);
    selectedCampId.value = 'camp1';
    selectedStudentId.value = 's1';
    resetToView(role.value === 'student' ? 's-home' : role.value === 'doctor' ? 'd-home' : role.value === 'coach' ? 'c-home' : role.value === 'dietitian' ? 'n-home' : role.value === 'org_admin' ? 'a-dashboard' : 'a-home');
  }

  // ── 持久化 ───────────────────────────────────────────────────
  watch(
    () => [data, authId.value, selectedCampId.value],
    () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          schema: SCHEMA, data, authId: authId.value, selectedCampId: selectedCampId.value,
        }));
      } catch { /* 忽略容量错误 */ }
    },
    { deep: true },
  );

  return {
    data, role, currentUser, currentStudent, selectedCampId, selectedStudentId, selectedThreadId,
    currentView, viewStack, lastNavDirection,
    camp, campDay, intensiveDay, daysToIntensiveEnd, isIntensive,
    accountById, accountName, studentById, careTeam, myStudents, activeStudentId, activeStudent,
    bpOf, weightOf, exerciseOf, dietOf, medOf, followupsOf, snapshotOf,
    latestBp, bpAvg, latestWeight, weightChange, bpChange, flowers, streak, todayDone, adherence, summary, rankList,
    doctorPending, coachPending, dietitianPending,
    noticesFor, unreadNotices, unreadMessages, unreadCount, threadFor, threadsFor,
    login, logout, setView, resetToView, back, openStudent,
    addBp, addWeight, addExercise, addDiet, addMed, addLedger, addComment,
    publishExerciseRx, publishNutritionRx, addFollowup, saveMedication, handleAlert,
    sendMessage, ensureThread, markThreadRead, markNoticeRead, markAllNoticesRead,
    exchangeProduct, claimReward, reorderTier, shipClaim, shipExchange, verifyExchange, cancelExchange,
    toggleAccount, addAccount, updateConfig, updatePermission, resetDemo, completeOnboarding,
  };
});
