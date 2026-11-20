<script setup lang="ts">
import { computed, defineAsyncComponent, h, onBeforeUnmount, onMounted, watch, type Component } from 'vue';
import { useAppStore } from './store/app';
import LoginView from './views/LoginView.vue';
import OnboardingView from './views/OnboardingView.vue';
import ViewSkeleton from './components/ui/ViewSkeleton.vue';

const lazy = (loader: () => Promise<{ default: Component }>) =>
  defineAsyncComponent({ loader, loadingComponent: ViewSkeleton, delay: 0 });

const StudentHome = lazy(() => import('./views/student/StudentHome.vue'));
const StudentProfile = lazy(() => import('./views/student/StudentProfile.vue'));
const StudentCheckin = lazy(() => import('./views/student/StudentCheckin.vue'));
const StudentCheckinHub = lazy(() => import('./views/student/StudentCheckinHub.vue'));
const StudentJourney = lazy(() => import('./views/student/StudentJourney.vue'));
const StudentPrescription = lazy(() => import('./views/student/StudentPrescription.vue'));
const StudentActivity = lazy(() => import('./views/student/StudentActivity.vue'));
const StudentMall = lazy(() => import('./views/student/StudentMall.vue'));
const StudentMessages = lazy(() => import('./views/student/StudentMessages.vue'));
const StudentReport = lazy(() => import('./views/student/StudentReport.vue'));
const StudentFollowup = lazy(() => import('./views/student/StudentFollowup.vue'));
const StudentCalendar = lazy(() => import('./views/student/StudentCalendar.vue'));
const StudentPoints = lazy(() => import('./views/student/StudentPoints.vue'));

const DoctorHome = lazy(() => import('./views/doctor/DoctorHome.vue'));
const DoctorPatient = lazy(() => import('./views/doctor/DoctorPatient.vue'));
const DoctorFollowup = lazy(() => import('./views/doctor/DoctorFollowup.vue'));
const DoctorAlerts = lazy(() => import('./views/doctor/DoctorAlerts.vue'));
const DoctorReview = lazy(() => import('./views/doctor/DoctorReview.vue'));

const CoachHome = lazy(() => import('./views/coach/CoachHome.vue'));
const CoachStudent = lazy(() => import('./views/coach/CoachStudent.vue'));
const CoachRx = lazy(() => import('./views/coach/CoachRx.vue'));
const CoachCourses = lazy(() => import('./views/coach/CoachCourses.vue'));

const DietitianHome = lazy(() => import('./views/dietitian/DietitianHome.vue'));
const DietitianStudent = lazy(() => import('./views/dietitian/DietitianStudent.vue'));
const DietitianRx = lazy(() => import('./views/dietitian/DietitianRx.vue'));
const DietitianFulfillment = lazy(() => import('./views/dietitian/DietitianFulfillment.vue'));
const DietitianSummary = lazy(() => import('./views/dietitian/DietitianSummary.vue'));

const PeopleList = lazy(() => import('./views/shared/PeopleList.vue'));
const MessagesView = lazy(() => import('./views/shared/MessagesView.vue'));
const ConfigCenter = lazy(() => import('./views/shared/ConfigCenter.vue'));
const AdminCenter = lazy(() => import('./views/admin/AdminCenter.vue'));
const AdminHome = lazy(() => import('./views/admin/AdminHome.vue'));
const OrgDashboard = lazy(() => import('./views/admin/OrgDashboard.vue'));
const FeatureCoverage = lazy(() => import('./views/admin/FeatureCoverage.vue'));

const store = useAppStore();

const viewMap: Record<string, Component> = {
  login: LoginView,
  onboarding: OnboardingView,
  's-home': StudentHome,
  's-profile': StudentProfile,
  's-checkin': StudentCheckinHub,
  's-bp': h(StudentCheckin, { initialTab: 'bp', standalone: true }),
  's-exercise': h(StudentCheckin, { initialTab: 'exercise', standalone: true }),
  's-diet': h(StudentCheckin, { initialTab: 'diet', standalone: true }),
  's-med': h(StudentCheckin, { initialTab: 'med', standalone: true }),
  's-weight': h(StudentCheckin, { initialTab: 'weight', standalone: true }),
  's-prescription': StudentPrescription,
  's-activity': StudentActivity,
  's-mall': StudentMall,
  's-rewards': h(StudentMall, { initialTab: 'rewards', standalone: true }),
  's-messages': StudentMessages,
  's-report': StudentReport,
  's-journey': StudentJourney,
  's-followup': StudentFollowup,
  's-calendar': StudentCalendar,
  's-points': StudentPoints,

  'd-home': DoctorHome,
  'd-patients': h(PeopleList, { mode: 'doctor' }),
  'd-patient': DoctorPatient,
  'd-followup': DoctorFollowup,
  'd-alerts': DoctorAlerts,
  'd-review': DoctorReview,
  'd-messages': MessagesView,

  'c-home': CoachHome,
  'c-students': h(PeopleList, { mode: 'coach' }),
  'c-student': CoachStudent,
  'c-rx': CoachRx,
  'c-courses': CoachCourses,
  'c-messages': MessagesView,

  'n-home': DietitianHome,
  'n-students': h(PeopleList, { mode: 'dietitian' }),
  'n-student': DietitianStudent,
  'n-rx': DietitianRx,
  'n-fulfillment': DietitianFulfillment,
  'n-summary': DietitianSummary,
  'n-rewards': h(ConfigCenter, { mode: 'rewards' }),
  'n-products': h(ConfigCenter, { mode: 'products' }),
  'n-accounts': h(ConfigCenter, { mode: 'accounts' }),
  'n-metrics': h(ConfigCenter, { mode: 'metrics' }),
  'n-camps': h(ConfigCenter, { mode: 'camps' }),
  'n-messages': MessagesView,

  'a-home': AdminHome,
  'a-dashboard': OrgDashboard,
  'a-orgs': h(AdminCenter, { mode: 'orgs' }),
  'a-roles': h(AdminCenter, { mode: 'roles' }),
  'a-config': h(AdminCenter, { mode: 'config' }),
  'a-projects': h(AdminCenter, { mode: 'projects' }),
  'a-accounts': h(AdminCenter, { mode: 'accounts' }),
  'a-rewards': h(AdminCenter, { mode: 'rewards' }),
  'a-camps': h(AdminCenter, { mode: 'camps' }),
  'a-activity': h(AdminCenter, { mode: 'activity' }),
  'a-features': FeatureCoverage,
};

const currentComponent = computed(() => viewMap[store.currentView] || LoginView);
const cacheKey = computed(() => `${store.currentUser?.id || 'anon'}:${store.currentView}`);

watch(
  () => store.role,
  (r) => {
    document.body.classList.remove('role-doctor', 'role-coach', 'role-dietitian', 'role-admin');
    if (r === 'doctor') document.body.classList.add('role-doctor');
    else if (r === 'coach') document.body.classList.add('role-coach');
    else if (r === 'dietitian') document.body.classList.add('role-dietitian');
    else if (r === 'org_admin' || r === 'super_admin') document.body.classList.add('role-admin');
    document.body.classList.add('liquid-glass');
  },
  { immediate: true },
);

function onPop() {
  if (store.viewStack.length > 1) store.back();
  window.history.pushState({ cc: true }, '');
}
onMounted(() => {
  window.history.pushState({ cc: true }, '');
  window.addEventListener('popstate', onPop);
});
onBeforeUnmount(() => window.removeEventListener('popstate', onPop));
watch(() => store.currentView, () => window.history.pushState({ cc: true }, ''));
</script>

<template>
  <div class="mx-auto min-h-[100dvh] w-full max-w-[480px]">
    <KeepAlive :max="10">
      <component :is="currentComponent" :key="cacheKey" />
    </KeepAlive>
  </div>
</template>
