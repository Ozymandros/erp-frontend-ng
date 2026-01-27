/* eslint-disable @typescript-eslint/no-explicit-any */
// API Response Types based on legacy Vite-React project parity

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Base DTO Types
export interface BaseDto<T> {
  id: T;
}

export interface IAuditableDto<T> extends BaseDto<T> {
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export abstract class AuditableDto<T = string> implements IAuditableDto<T> {
  public id!: T;
  public createdAt!: string;
  public createdBy: string = "";
  public updatedAt?: string;
  public updatedBy?: string;

  constructor(data?: Partial<AuditableDto<T>>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// Concrete DTO Classes
export class UserDto extends AuditableDto<string> {
  public username!: string;
  public email!: string;
  public firstName?: string;
  public lastName?: string;
  public emailConfirmed: boolean = false;
  public isExternalLogin: boolean = false;
  public externalProvider?: string;
  public isAdmin: boolean = false;
  public isActive: boolean = true;
  public roles: RoleDto[] = [];
  public permissions: PermissionDto[] = [];

  constructor(data?: Partial<UserDto>) {
    super(data);
    if (data) {
      this.roles = data.roles?.map(role => new RoleDto(role)) ?? [];
      this.permissions =
        data.permissions?.map(permission => new PermissionDto(permission)) ??
        [];
    }
  }
}

export class RoleDto extends AuditableDto<string> {
  public name!: string;
  public description?: string;
  public permissions: PermissionDto[] = [];

  constructor(data?: Partial<RoleDto>) {
    super(data);
    if (data) {
      this.permissions =
        data.permissions?.map(permission => new PermissionDto(permission)) ??
        [];
    }
  }
}

export class PermissionDto extends AuditableDto<string> {
  public module!: string;
  public action!: string;
  public description?: string;
  constructor(data?: Partial<PermissionDto>) {
    super(data);
  }
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ProblemDetails for ASP.NET Core validation errors
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// Pagination and Query Types
export interface PaginatedResponse<T> {
  items: T[];
  page: number; // Maps to backend PageNumber
  pageSize: number;
  total: number; // Maps to backend TotalCount
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface QuerySpec {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  filters?: Record<string, string>;
  searchFields?: string;
  searchTerm?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

// ==================== AUTH MODULE ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ExternalLoginDto {
  provider: string;
  externalId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface PermissionCheckRequest {
  module: string;
  action: string;
}

export interface PermissionCheckResponse {
  allowed: boolean;
  reason?: string;
}

export interface ModulePermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

// User Types
export interface User extends IAuditableDto<string> {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailConfirmed: boolean;
  isExternalLogin: boolean;
  externalProvider?: string;
  isAdmin: boolean;
  isActive: boolean;
  roles: Role[];
  permissions: Permission[];
}

export interface CreateUserRequest {
  id?: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roleIds?: string[];
}

// Role Types
export interface Role extends IAuditableDto<string> {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

// Permission Types
export interface Permission extends IAuditableDto<string> {
  module: string;
  action: string;
  description?: string;
}

export interface CreatePermissionRequest {
  module: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  module: string;
  action: string;
  description?: string;
}

// ==================== PRODUCTS MODULE ====================

export interface ProductDto extends IAuditableDto<string> {
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
}

export interface CreateUpdateProductDto {
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
}

// ==================== WAREHOUSE MODULE ====================

export interface WarehouseDto extends IAuditableDto<string> {
  name: string;
  location: string;
}

export interface CreateUpdateWarehouseDto {
  name: string;
  location: string;
}

export interface WarehouseStockDto {
  productId: string;
  productName?: string;
  productSku?: string;
  warehouseId: string;
  warehouseName?: string;
  quantity: number;
  reservedQuantity: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface StockAvailabilityDto {
  productId: string;
  totalAvailable: number;
  warehouseStocks: WarehouseStockDto[];
}

export interface OrderDto extends IAuditableDto<string> {
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;
  orderDate: string;
  sourceId: string;
  targetId: string;
  externalOrderId?: string;
  orderLines: OrderLineDto[];
}

export interface OrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StockOperationRequest {
  productId: string;
  warehouseId: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  quantity: number;
  reason: string;
  adjustmentType?: AdjustmentType;
}

export interface InventoryTransactionDto {
  id: string;
  productId: string;
  warehouseId: string;
  quantityChange: number;
  transactionType: TransactionType;
  transactionDate: string;
  orderId?: string; // Reference to Order (Operational)
  product?: ProductDto;
  warehouse?: WarehouseDto;
}

// ==================== SALES MODULE ====================

export interface SalesOrderDto extends IAuditableDto<string> {
  orderNumber: string;
  customerId: string;
  customerName?: string;
  status: number;
  orderDate: string;
  totalAmount: number;
  lines: SalesOrderLineDto[];
  customer?: CustomerDto;
  // Quote tracking
  isQuote: boolean;
  quoteExpiryDate?: string;
  convertedToOrderId?: string;
}

export interface CreateUpdateSalesOrderDto {
  orderNumber: string;
  customerId: string;
  orderDate: string;
  status?: number;
  totalAmount?: number;
  lines: CreateUpdateSalesOrderLineDto[];
}

export interface SalesOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CreateUpdateSalesOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuoteDto {
  orderNumber: string;
  customerId: string;
  orderDate: string;
  validityDays?: number;
  lines: CreateUpdateSalesOrderLineDto[];
}

export interface ConfirmQuoteDto {
  quoteId: string;
  warehouseId: string;
  shippingAddress?: string;
}

export interface StockAvailabilityCheckDto {
  productId: string;
  requestedQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  warehouseStock: WarehouseAvailabilityDto[];
}

export interface WarehouseAvailabilityDto {
  warehouseId: string;
  warehouseName: string;
  availableQuantity: number;
}

export interface CustomerDto extends IAuditableDto<string> {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

// ==================== PURCHASING MODULE ====================

export interface PurchaseOrderDto extends IAuditableDto<string> {
  orderNumber: string;
  supplierId: string;
  supplierName?: string;
  status: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  totalAmount: number;
  lines: PurchaseOrderLineDto[];
  supplier?: SupplierDto;
}

export interface CreateUpdatePurchaseOrderDto {
  orderNumber: string;
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status?: number;
  totalAmount?: number;
  lines: PurchaseOrderLineDto[];
}

export interface PurchaseOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ApprovePurchaseOrderDto {
  purchaseOrderId: string;
  notes?: string;
}

export interface ReceivePurchaseOrderDto {
  purchaseOrderId: string;
  warehouseId: string;
  receivedDate: string;
  notes?: string;
  lines: ReceivePurchaseOrderLineDto[];
}

export interface ReceivePurchaseOrderLineDto {
  purchaseOrderLineId: string;
  receivedQuantity: number;
  notes?: string;
}

export interface SupplierDto extends IAuditableDto<string> {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// ==================== ENUMS ====================

export enum TransactionType {
  Purchase = "Purchase",
  Sale = "Sale",
  Adjustment = "Adjustment",
  Transfer = "Transfer",
  Return = "Return",
  Damage = "Damage",
  Loss = "Loss",
}

export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Fulfilled = "Fulfilled",
  Cancelled = "Cancelled",
  Shipped = "Shipped",
  Delivered = "Delivered",
}

export enum SalesOrderStatus {
  Draft = "Draft",
  Quote = "Quote",
  Confirmed = "Confirmed",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export enum PurchaseOrderStatus {
  Draft = "Draft",
  Pending = "Pending",
  Approved = "Approved",
  Ordered = "Ordered",
  PartiallyReceived = "PartiallyReceived",
  Received = "Received",
  Cancelled = "Cancelled",
}

export enum OrderType {
  Inbound = "Inbound",
  Outbound = "Outbound",
  Transfer = "Transfer",
  Return = "Return",
}

export enum AdjustmentType {
  Increase = "Increase",
  Decrease = "Decrease",
  Found = "Found",
  Lost = "Lost",
  Damaged = "Damaged",
  Expired = "Expired",
}
