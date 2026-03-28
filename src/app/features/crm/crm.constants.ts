/** Common CRM string values — align with backend seed / CRM service as needed */
export const CRM_ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Task', 'Other'] as const;
export const CRM_ACTIVITY_STATUS = ['Open', 'Completed', 'Cancelled'] as const;
export const CRM_OPPORTUNITY_STAGES = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
] as const;
