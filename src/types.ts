export interface OrganizationInfo {
  name: string;
  industry: string;
  size: string;
}

export interface FinancialData {
  revenue: number;
  expenses: number;
}

export interface AssessmentState {
  step: number;
  organizationInfo: OrganizationInfo;
  financialData: FinancialData;
}
