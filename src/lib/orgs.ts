export interface OrgInfo { id: string; name: string; shortName: string }

export const ORGS: OrgInfo[] = [
  { id: 'org1', name: '北京大学国际医院', shortName: '国际医院' },
  { id: 'org2', name: '北大医疗康复医院', shortName: '康复医院' },
  { id: 'org3', name: '北大医疗石油医院', shortName: '石油医院' },
];

export const orgName = (id?: string) => ORGS.find((o) => o.id === id)?.name || '未分配医院';
