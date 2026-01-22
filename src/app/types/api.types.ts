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
  public isActive: boolean = true;
  public isAdmin: boolean = false;
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

// User Types
export interface User extends IAuditableDto<string> {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailConfirmed: boolean;
  isExternalLogin: boolean;
  externalProvider?: string;
  isActive: boolean;
  isAdmin: boolean;
  avatarUrl?: string;
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

// ==================== INVENTORY MODULE ====================

export interface ProductDto extends IAuditableDto<string> {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice: number;
  stock: number;
  reorderLevel: number;
  isActive: boolean;
}

export interface CreateUpdateProductDto {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice: number;
  reorderLevel: number;
  isActive: boolean;
}

export interface WarehouseDto extends IAuditableDto<string> {
  name: string;
  location?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
}

export interface CreateUpdateWarehouseDto {
  name: string;
  location?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
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
  orderDate: string;
  customerId: string;
  orderLines: OrderLineDto[];
  totalAmount: number;
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

export interface InventoryTransactionDto extends IAuditableDto<string> {
  transactionType: TransactionType;
  productId: string;
  productName?: string;
  warehouseId: string;
  warehouseName?: string;
  quantity: number;
  referenceId?: string;
  referenceType?: string;
  referenceNumber?: string;
  reason?: string;
  transactionDate: string;
}

// ==================== SALES MODULE ====================

export interface SalesOrderDto extends IAuditableDto<string> {
  orderNumber: string;
  customerId: string;
  customerName?: string;
  status: SalesOrderStatus;
  orderDate: string;
  totalAmount: number;
  orderLines: SalesOrderLineDto[];
}

export interface CreateUpdateSalesOrderDto {
  customerId: string;
  orderDate: string;
  orderLines: CreateUpdateSalesOrderLineDto[];
}

export interface SalesOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateUpdateSalesOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CustomerDto extends IAuditableDto<string> {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
}

export interface CreateUpdateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
}

// ==================== PURCHASING MODULE ====================

export interface PurchaseOrderDto extends IAuditableDto<string> {
  orderNumber: string;
  supplierId: string;
  supplierName?: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  totalAmount: number;
  orderLines: PurchaseOrderLineDto[];
}

export interface CreateUpdatePurchaseOrderDto {
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  orderLines: PurchaseOrderLineDto[];
}

export interface PurchaseOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SupplierDto extends IAuditableDto<string> {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
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

export enum AdjustmentType {
  Increase = "Increase",
  Decrease = "Decrease",
  Found = "Found",
  Lost = "Lost",
  Damaged = "Damaged",
  Expired = "Expired",
}
