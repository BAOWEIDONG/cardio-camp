# 技术接入说明

## 1. 运行环境

- Node.js 18/20，npm 9+
- `npm install` → `npm run dev`（默认 3000 端口）
- `npm run lint`（vue-tsc）→ `npm run build` → `dist/`
- 环境变量见 `.env.example`；复制为 `.env` 后按需修改：
  - `VITE_USE_MOCK=true`：纯前端 mock，演示默认
  - `VITE_API_BASE=/api`：接真实后端时使用
  - `VITE_BASE=/cardio-camp/`：部署子路径，改后需重新 build

## 2. 目录

```
src/
  App.vue                 视图注册、角色预取、页面栈/返回手势
  store/app.ts            全局状态、登录、打卡、权限、数据范围、持久化
  types.ts                账户/学员/营期/血压/处方/随访/聊天/权限等类型
  mock/data.ts            演示数据（学员、营期、血压、体重、饮食、运动、指标、奖品等）
  lib/doctorData.ts       医师随访/用药/患者分组
  lib/chatData.ts         三师沟通会话
  lib/permissions.ts      权限模块/操作定义与角色默认权限
  lib/orgs.ts             医院字典
  lib/api.ts              API 封装（当前 mock，可切真实后端）
  components/             页面（学员/医师/运动师/营养师/管理端）
  components/ui/          通用组件
```

## 3. 角色与数据范围

`Role = student | coach | dietitian | doctor | org_admin | super_admin`

- `Account.orgId` 标识医院；`Student.orgId`、`Camp.orgId` 同理。
- 集团管理员（super_admin）：全部医院、全部营期、全部账号。
- 医院管理员（org_admin）：仅本院 `scopedStudents / scopedAccounts / scopedCamps`。
- 医师：`DOCTOR_PATIENTS` 定义负责患者，并按医院再过滤；dr1 国际医院，dr3 康复医院。
- 运动师/营养师：按医院 + 营期过滤；默认演示按本院学员展示。
- 学员：仅本人数据。

关键 computed/方法：`scopedStudents`、`scopedAccounts`、`scopedCamps`、`getDoctorPatients(doctorId)`、`currentOrgId`、`isGroupAdmin`。

## 4. 权限模型

- 定义：`src/lib/permissions.ts` 的 `PERMISSION_MODULES`，每个模块含 `view/create/edit/delete/export/review/send/publish/ship/disable/config/...` 操作。
- 默认：`defaultPermissions(role)`；医院/角色覆盖存在 `store.permissionOverrides[orgId:role]`，持久化在 `camp_biz_data_cardio`。
- 判断：`store.can(module, action)`；当前已接入管理端入口、账号管理新增/编辑/禁用/删除等按钮，业务页面按钮可按同一方法继续接入。
- 配置页：`PermissionConfigView.vue`，路由 `permission-config`；集团管理员可切医院，医院管理员锁定本院。
- 扩展方式：在 `PERMISSION_MODULES` 增加模块/操作，在页面用 `v-if="store.can('模块','操作')"` 控制。

## 5. Mock 数据与持久化

- 登录态：`camp_auth_cardio`
- 业务快照：`camp_biz_data_cardio`（学员、打卡、血压、处方、随访、聊天、权限覆盖等）
- 其他 key 统一前缀 `cardio_`，与 versionall 完全隔离。
- 演示数据版本：`DEMO_SCHEMA_VERSION`（改 mock 种子后递增，旧快照会做增量合并）。
- 重置：清空 localStorage 或在登录页清除站点数据。

## 6. 核心业务对象

- `BpRecord`：家庭血压，晨起/睡前、收缩压/舒张压/心率/服药、医师批注；页面按天聚类。
- `MetricConfig` / `MetricValue`：心脑血管指标，血压/心率/IMT/Hcy/CRP/LDL 等；报告和档案共用。
- `ExerciseRecord` / `DietRecord` / `WeightRecord`：沿用原打卡与批注模型。
- 随访：`FollowupRecord`；医师新增后写入 `doctorFollowups` 并推一条聊天记录。
- 聊天：`ChatThread` / `ChatMessage`，学员 ↔ 医师/营养师/运动师三线程。
- 入营材料：健康档案读取问卷 `medicalReports`，按四类关键词匹配上传状态。

## 7. 心血管专项落点

- 学员首页：主卡“当前血压”，每日任务含血压/用药/运动/三餐。
- 血压打卡：`BpCheckinView.vue`，晨起/睡前、目标 130/80、按天聚类。
- 入营材料：`HealthProfileView.vue` 的“心脑血管入营材料”，4 类清单 + 补充/替换。
- 运动：`ExerciseView.vue` 顶部心血管运动处方（靶心率 60–70% HRmax、RPE 11–13、暂停条件、运动类型）。
- 饮食：`DietView.vue` 顶部 DASH 低盐低脂处方 + 药物食物相互作用。
- 问卷：`QuestionnaireView.vue` 心脑血管病史、用药、近 3 个月症状。
- 报告：`CampReportView.vue` 阶段达标率、7 日平均血压、LDL、用药依从、随访次数、风险分层变化、长期用药、医师结论；体重退为辅助。
- 结营统计：`DietitianCampSummaryView.vue` 增加心脑血管核心结果 4 项。

## 8. 当前演示限制

- 纯前端 mock，无真实后端；聊天/随访/权限配置为同浏览器本地持久化，不是实时多端同步。
- 入营材料上传为演示交互，未接对象存储。
- 权限目前驱动管理端入口和账号操作，业务页面按钮级权限需按 `store.can()` 继续接入。
- 活动中的“阶梯达标”和部分徽章仍沿用体重口径，未全部改为血压达标/低盐天数。
- 互联网医院问诊为跳转占位，未接合作平台。

## 9. 部署

GitHub Actions：`.github/workflows/deploy.yml`，push `main` 自动构建并发布 Pages。
Pages 需设置为 `build_type=workflow`，不要用 legacy 分支模式。
