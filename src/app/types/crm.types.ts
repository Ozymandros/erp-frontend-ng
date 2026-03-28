import type { CreateUpdateSalesOrderLineDto } from './api.types';

/** CRM API uses string IDs (GUIDs) */
export type CrmId = string;

export interface LeadDto {
  id: CrmId;
  title: string;
  source?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  customerId?: CrmId | null;
  status: string;
  ownerUsername: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateLeadDto {
  title: string;
  ownerUsername: string;
  source?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface UpdateLeadDto {
  title: string;
  source?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface QualifyLeadDto {
  customerId: CrmId;
}

export interface OpportunityDto {
  id: CrmId;
  customerId: CrmId;
  leadId?: CrmId | null;
  name: string;
  stage: string;
  probability: number;
  expectedAmount?: number | null;
  expectedCloseDate?: string | null;
  convertedSalesQuoteId?: CrmId | null;
  convertedSalesQuoteNumber?: string | null;
  ownerUsername: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateOpportunityDto {
  customerId: CrmId;
  name: string;
  ownerUsername: string;
  leadId?: CrmId | null;
}

export interface UpdateOpportunityForecastDto {
  probability: number;
  expectedAmount?: number | null;
  expectedCloseDate?: string | null;
}

export interface MoveOpportunityStageDto {
  stage: string;
}

export interface MarkOpportunityLostDto {
  reason: string;
}

export interface ConvertOpportunityToQuoteDto {
  validityDays: number;
  lines: CreateUpdateSalesOrderLineDto[];
  orderDate?: string | null;
}

export interface MarkOpportunityWonRequest {
  note?: string | null;
  convertToQuote: boolean;
  quote?: ConvertOpportunityToQuoteDto | null;
}

export interface OpportunityLineDto {
  id: CrmId;
  opportunityId: CrmId;
  productId?: CrmId | null;
  sku?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateOpportunityLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  productId?: CrmId | null;
  sku?: string | null;
}

export interface UpdateOpportunityLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  productId?: CrmId | null;
  sku?: string | null;
}

export interface ForecastByStageDto {
  stage: string;
  count: number;
  sumExpectedAmount?: number | null;
  weightedAmount: number;
}

export interface ForecastSummaryDto {
  ownerUsername: string;
  fromExpectedCloseDate?: string | null;
  toExpectedCloseDate?: string | null;
  totalCount: number;
  totalExpectedAmount?: number | null;
  totalWeightedAmount: number;
  byStage: ForecastByStageDto[];
}

export interface ActivityDto {
  id: CrmId;
  subject: string;
  type: string;
  status: string;
  dueAt: string;
  completedAt?: string | null;
  assignedToUsername: string;
  leadId?: CrmId | null;
  opportunityId?: CrmId | null;
  customerId?: CrmId | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateActivityDto {
  subject: string;
  type: string;
  dueAt: string;
  assignedToUsername: string;
  leadId?: CrmId | null;
  opportunityId?: CrmId | null;
  customerId?: CrmId | null;
}

export interface CompleteActivityDto {
  note?: string | null;
}

export interface AccountDto {
  id: CrmId;
  customerId: CrmId;
  name: string;
  taxId?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  isActive: boolean;
  ownerUsername?: string | null;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdateAccountOwnerDto {
  ownerUsername: string;
}

export interface ContactDto {
  id: CrmId;
  accountId: CrmId;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateContactDto {
  accountId: CrmId;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  isPrimary?: boolean;
}

export interface UpdateContactDto {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
}
