/** Projects service API types (MyApp.Projects.API). */

export type ProjectId = string;

export enum ProjectStatus {
  Planning = 0,
  Quote = 1,
  Open = 2,
  Completed = 3,
}

export enum ProjectBlocked {
  None = 0,
  Posting = 1,
  All = 2,
}

export enum ProjectTaskType {
  Posting = 0,
  Heading = 1,
}

export enum PlanningLineType {
  Budget = 0,
  Billable = 1,
  BudgetAndBillable = 2,
}

export enum ProjectLineKind {
  Resource = 0,
  Item = 1,
  Expense = 2,
  Text = 3,
}

export enum ResourceType {
  Person = 0,
  Machine = 1,
}

export interface ProjectDto {
  id: ProjectId;
  projectNumber?: string;
  description?: string;
  customerId?: ProjectId;
  projectManagerUserId?: ProjectId | null;
  status?: string;
  blocked?: string;
  startingDate?: string | null;
  endingDate?: string | null;
  currencyCode?: string;
  externalReference?: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface CreateProjectDto {
  description: string;
  customerId: ProjectId;
  projectManagerUserId?: ProjectId | null;
  startingDate?: string | null;
  endingDate?: string | null;
  currencyCode?: string | null;
  externalReference?: string | null;
}

export interface UpdateProjectDto {
  description: string;
  customerId: ProjectId;
  projectManagerUserId?: ProjectId | null;
  startingDate?: string | null;
  endingDate?: string | null;
  currencyCode: string;
  blocked?: ProjectBlocked;
  externalReference?: string | null;
}

export interface ChangeProjectStatusDto {
  status: ProjectStatus;
}

export interface CopyProjectDto {
  description?: string | null;
  customerId?: ProjectId | null;
  includePlanningLines?: boolean;
}

export interface ProjectTaskDto {
  id: ProjectId;
  projectId: ProjectId;
  parentTaskId?: ProjectId | null;
  taskNo: string;
  description: string;
  taskType?: string;
  sortOrder?: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface ProjectTaskTreeNodeDto {
  task: ProjectTaskDto;
  level: number;
  children: ProjectTaskTreeNodeDto[];
}

export interface CreateProjectTaskDto {
  parentTaskId?: ProjectId | null;
  taskNo: string;
  description: string;
  taskType?: ProjectTaskType;
  sortOrder?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateProjectTaskDto {
  taskNo: string;
  description: string;
  taskType?: ProjectTaskType;
  startDate?: string | null;
  endDate?: string | null;
}

export interface MoveProjectTaskDto {
  newParentTaskId?: ProjectId | null;
  sortOrder?: number | null;
}

export interface PlanningLineDto {
  id: ProjectId;
  projectId: ProjectId;
  projectTaskId: ProjectId;
  lineNo?: number;
  lineType?: string;
  kind?: string;
  resourceId?: ProjectId | null;
  productId?: ProjectId | null;
  warehouseId?: ProjectId | null;
  description?: string;
  unitOfMeasure?: string | null;
  planningDate?: string;
  quantity?: number;
  unitCostLcy?: number;
  unitPrice?: number;
  lineDiscountPercent?: number;
  currencyCode?: string;
  exchangeRate?: number;
  totalCostLcy?: number;
  lineAmount?: number;
  lineAmountLcy?: number;
  quantityPosted?: number;
  quantityInConsumption?: number;
  quantityTransferredToInvoice?: number;
  quantityInvoiced?: number;
  quantityToInvoice?: number;
  remainingQuantity?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface CreateUpdatePlanningLineDto {
  projectTaskId: ProjectId;
  lineType?: PlanningLineType;
  kind?: ProjectLineKind;
  resourceId?: ProjectId | null;
  productId?: ProjectId | null;
  warehouseId?: ProjectId | null;
  description?: string | null;
  unitOfMeasure?: string | null;
  planningDate?: string | null;
  quantity?: number;
  unitCostLcy?: number | null;
  unitPrice?: number | null;
  lineDiscountPercent?: number;
}

export interface ProjectLedgerEntryDto {
  id: ProjectId;
  entryNo?: number;
  entryType?: string;
  postingDate?: string;
  projectId: ProjectId;
  projectTaskId: ProjectId;
  planningLineId?: ProjectId | null;
  kind?: string;
  resourceId?: ProjectId | null;
  productId?: ProjectId | null;
  description?: string;
  quantity?: number;
  unitCostLcy?: number;
  totalCostLcy?: number;
  unitPrice?: number;
  lineAmount?: number;
  lineAmountLcy?: number;
  currencyCode?: string;
  exchangeRate?: number;
  sourceDocument?: string;
  sourceDocumentId?: ProjectId | null;
  sourceDocumentNo?: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface PostUsageDto {
  projectTaskId: ProjectId;
  planningLineId?: ProjectId | null;
  kind?: ProjectLineKind;
  resourceId?: ProjectId | null;
  description?: string | null;
  quantity?: number;
  unitCostLcy?: number | null;
  unitPrice?: number | null;
  postingDate?: string | null;
}

export interface ItemConsumptionLineDto {
  planningLineId: ProjectId;
  quantity?: number;
}

export interface CreateItemConsumptionDto {
  warehouseId: ProjectId;
  postingDate?: string | null;
  destinationAddress?: string | null;
  lines: ItemConsumptionLineDto[];
}

export interface ConsumptionOrderLineDto {
  id: ProjectId;
  planningLineId: ProjectId;
  productId: ProjectId;
  quantity: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface ConsumptionOrderDto {
  id: ProjectId;
  projectId: ProjectId;
  orderId: ProjectId;
  orderNumber?: string;
  warehouseId: ProjectId;
  status?: string;
  postingDate?: string;
  lines?: ConsumptionOrderLineDto[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface InvoiceRequestLineInputDto {
  planningLineId: ProjectId;
  quantity?: number | null;
}

export interface CreateInvoiceRequestDto {
  lines?: InvoiceRequestLineInputDto[];
  taxRate?: number;
}

export interface InvoiceRequestLineDto {
  id: ProjectId;
  planningLineId: ProjectId;
  projectTaskId: ProjectId;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  lineAmount?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface InvoiceRequestDto {
  id: ProjectId;
  projectId: ProjectId;
  customerId: ProjectId;
  currencyCode?: string;
  status?: string;
  requestedAt?: string;
  invoiceId?: ProjectId | null;
  invoiceNumber?: string | null;
  totalAmount?: number;
  lines?: InvoiceRequestLineDto[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface ProjectAmountsDto {
  budgetCostLcy?: number;
  budgetPrice?: number;
  billablePrice?: number;
  usageCostLcy?: number;
  usagePrice?: number;
  invoicedPrice?: number;
  invoicedPriceLcy?: number;
  remainingBudgetCostLcy?: number;
  profitLcy?: number;
}

export interface TaskStatisticsDto {
  taskId: ProjectId;
  parentTaskId?: ProjectId | null;
  taskNo?: string;
  description?: string;
  taskType?: string;
  amounts?: ProjectAmountsDto;
}

export interface ProjectStatisticsDto {
  projectId: ProjectId;
  currencyCode?: string;
  localCurrency?: string;
  totals?: ProjectAmountsDto;
  tasks?: TaskStatisticsDto[];
}

export interface CurrencyDto {
  id: ProjectId;
  code: string;
  description: string;
  symbol?: string | null;
  isLocalCurrency?: boolean;
  exchangeRates?: ExchangeRateDto[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface CreateUpdateCurrencyDto {
  code: string;
  description: string;
  symbol?: string | null;
}

export interface ExchangeRateDto {
  id: ProjectId;
  currencyId: ProjectId;
  startingDate: string;
  rateToLocal: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface CreateExchangeRateDto {
  startingDate: string;
  rateToLocal?: number;
}

export interface ResourceDto {
  id: ProjectId;
  resourceNo: string;
  name: string;
  type?: string;
  resourceGroupId?: ProjectId | null;
  resourceGroupCode?: string | null;
  userId?: ProjectId | null;
  baseUnitOfMeasure: string;
  unitCost?: number;
  unitPrice?: number;
  dailyCapacity?: number;
  blocked?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface CreateUpdateResourceDto {
  resourceNo: string;
  name: string;
  type?: ResourceType;
  resourceGroupId?: ProjectId | null;
  userId?: ProjectId | null;
  baseUnitOfMeasure: string;
  unitCost?: number;
  unitPrice?: number;
  dailyCapacity?: number;
  blocked?: boolean;
}

export interface ResourceGroupDto {
  id: ProjectId;
  code: string;
  name: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface CreateUpdateResourceGroupDto {
  code: string;
  name: string;
}
