import {
  PlanningLineType,
  ProjectBlocked,
  ProjectLineKind,
  ProjectStatus,
  ProjectTaskType,
  ResourceType,
} from '../../types/projects.types';

export interface EnumOption<T extends number> {
  value: T;
  label: string;
}

export const PROJECT_STATUS_OPTIONS: EnumOption<ProjectStatus>[] = [
  { value: ProjectStatus.Planning, label: 'Planning' },
  { value: ProjectStatus.Quote, label: 'Quote' },
  { value: ProjectStatus.Open, label: 'Open' },
  { value: ProjectStatus.Completed, label: 'Completed' },
];

export const PROJECT_BLOCKED_OPTIONS: EnumOption<ProjectBlocked>[] = [
  { value: ProjectBlocked.None, label: 'None' },
  { value: ProjectBlocked.Posting, label: 'Posting' },
  { value: ProjectBlocked.All, label: 'All' },
];

export const PROJECT_TASK_TYPE_OPTIONS: EnumOption<ProjectTaskType>[] = [
  { value: ProjectTaskType.Posting, label: 'Posting' },
  { value: ProjectTaskType.Heading, label: 'Heading' },
];

export const PLANNING_LINE_TYPE_OPTIONS: EnumOption<PlanningLineType>[] = [
  { value: PlanningLineType.Budget, label: 'Budget' },
  { value: PlanningLineType.Billable, label: 'Billable' },
  { value: PlanningLineType.BudgetAndBillable, label: 'Budget and billable' },
];

export const PROJECT_LINE_KIND_OPTIONS: EnumOption<ProjectLineKind>[] = [
  { value: ProjectLineKind.Resource, label: 'Resource' },
  { value: ProjectLineKind.Item, label: 'Item' },
  { value: ProjectLineKind.Expense, label: 'Expense' },
  { value: ProjectLineKind.Text, label: 'Text' },
];

export const RESOURCE_TYPE_OPTIONS: EnumOption<ResourceType>[] = [
  { value: ResourceType.Person, label: 'Person' },
  { value: ResourceType.Machine, label: 'Machine' },
];

export function projectStatusTagColor(status: string | undefined): string {
  switch (status?.toLowerCase()) {
    case 'planning':
      return 'default';
    case 'quote':
      return 'processing';
    case 'open':
      return 'success';
    case 'completed':
      return 'purple';
    default:
      return 'default';
  }
}

export function canRunProjectOperations(perms: {
  canExecute?: boolean;
  canUpdate: boolean;
}): boolean {
  return Boolean(perms.canExecute || perms.canUpdate);
}
