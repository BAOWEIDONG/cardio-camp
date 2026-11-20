import { beforeEach, describe, expect, it } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

import LoginView from '../views/LoginView.vue';
import StudentHome from '../views/student/StudentHome.vue';
import StudentCheckin from '../views/student/StudentCheckin.vue';
import DoctorHome from '../views/doctor/DoctorHome.vue';
import DoctorPatient from '../views/doctor/DoctorPatient.vue';
import CoachRx from '../views/coach/CoachRx.vue';
import AdminCenter from '../views/admin/AdminCenter.vue';
import { useAppStore } from '../store/app';

function freshStore() {
  localStorage.clear();
  const pinia = createPinia();
  setActivePinia(pinia);
  const store = useAppStore();
  return { pinia, store };
}

async function mountView(comp: any, pinia: any, props: any = {}) {
  const wrapper = mount(comp, { props, global: { plugins: [pinia] }, attachTo: document.body });
  await flushPromises();
  await nextTick();
  return wrapper;
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('登录与角色路由', () => {
  it('学员一键登录后进入学员首页', async () => {
    const { pinia, store } = freshStore();
    const w = await mountView(LoginView, pinia);
    const btn = w.findAll('button').find((b) => b.text().includes('一键进入演示'));
    expect(btn).toBeTruthy();
    // 勾选协议
    const checkbox = w.find('.van-checkbox');
    await checkbox.trigger('click');
    await btn!.trigger('click');
    await new Promise((r) => setTimeout(r, 500));
    expect(store.currentView).toBe('s-home');
    expect(store.currentUser?.name).toBe('张伟');
    w.unmount();
  });

  it('医师登录后查看的是自己负责的患者', async () => {
    const { store } = freshStore();
    const res = store.login('13800000001', 'doctor');
    expect(res.ok).toBe(true);
    expect(store.currentView).toBe('d-home');
    expect(store.activeStudent?.careTeam.doctorId).toBe('d1');
  });

  it('非名单手机号无法登录', () => {
    const { store } = freshStore();
    const res = store.login('13999999999', 'student');
    expect(res.ok).toBe(false);
  });
});

describe('学员端核心链路', () => {
  it('首页渲染今日任务与双处方，点击任务可进入打卡页', async () => {
    const { pinia, store } = freshStore();
    store.login('13900000001', 'student');
    const w = await mountView(StudentHome, pinia);
    expect(w.text()).toContain('今日任务');
    expect(w.text()).toContain('我的双处方');
    const bpTask = w.findAll('button').find((b) => b.text().includes('家庭血压'));
    expect(bpTask).toBeTruthy();
    await bpTask!.trigger('click');
    expect(store.currentView).toBe('s-checkin');
    w.unmount();
  });

  it('打卡页可打开血压表单并保存，记录数增加', async () => {
    const { pinia, store } = freshStore();
    store.login('13900000001', 'student');
    const before = store.data.bpRecords.length;
    const w = await mountView(StudentCheckin, pinia);
    const recordBtn = w.findAll('button').find((b) => b.text().includes('记录 07:00'));
    expect(recordBtn).toBeTruthy();
    await recordBtn!.trigger('click');
    await flushPromises();
    expect(document.body.textContent).toContain('记录血压');
    const save = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent?.includes('保存血压')) as HTMLButtonElement;
    expect(save).toBeTruthy();
    save.click();
    await flushPromises();
    expect(store.data.bpRecords.length).toBe(before + 1);
    w.unmount();
  });
});

describe('医师端', () => {
  it('医师首页展示待随访与预警', async () => {
    const { pinia, store } = freshStore();
    store.login('13800000001', 'doctor');
    const w = await mountView(DoctorHome, pinia);
    expect(w.text()).toContain('待随访患者');
    expect(w.text()).toContain('实时预警');
    expect(w.text()).toContain('72 小时心电监测');
    w.unmount();
  });

  it('患者档案可新增医师意见并写入批注', async () => {
    const { pinia, store } = freshStore();
    store.login('13800000001', 'doctor');
    store.selectedStudentId = 's1';
    const w = await mountView(DoctorPatient, pinia);
    const checkinTab = w.findAll('button').find((b) => b.text() === '打卡');
    expect(checkinTab).toBeTruthy();
    await checkinTab!.trigger('click');
    await flushPromises();
    const opinion = w.findAll('button').find((b) => b.text() === '意见');
    expect(opinion).toBeTruthy();
    await opinion!.trigger('click');
    await flushPromises();
    const input = document.body.querySelector('textarea') as HTMLTextAreaElement;
    expect(input).toBeTruthy();
    input.value = '血压较前下降，继续当前方案';
    input.dispatchEvent(new Event('input'));
    await nextTick();
    const save = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent?.includes('发送意见')) as HTMLButtonElement;
    save.click();
    await flushPromises();
    const rec = store.data.bpRecords.find((r) => r.studentId === 's1' && r.comments?.some((c) => c.text.includes('继续当前方案')));
    expect(rec).toBeTruthy();
    w.unmount();
  });
});

describe('运动处方与权限', () => {
  it('运动师发布处方后学员端可读取', async () => {
    const { pinia, store } = freshStore();
    store.login('13700000001', 'coach');
    store.selectedStudentId = 's1';
    const w = await mountView(CoachRx, pinia);
    const publish = w.findAll('button').find((b) => b.text().includes('发布运动处方'));
    expect(publish).toBeTruthy();
    await publish!.trigger('click');
    await flushPromises();
    expect(store.data.exerciseRxs.find((r) => r.studentId === 's1')?.status).toBe('published');
    w.unmount();
  });

  it('权限矩阵点击可循环切换', async () => {
    const { pinia, store } = freshStore();
    store.login('13400000001', 'super_admin');
    const before = store.data.permissions[0].doctor;
    const w = await mountView(AdminCenter, pinia, { mode: 'roles' });
    const row = w.findAll('tbody tr')[0];
    const cells = row.findAll('td');
    await cells[4].trigger('click');
    expect(store.data.permissions[0].doctor).not.toBe(before);
    w.unmount();
  });
});
