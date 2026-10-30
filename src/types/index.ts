export interface Page<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number };
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  [key: string]: string | number | boolean | undefined;
}

export interface CodeName {
  id: string;
  code: string;
  name: string;
}
export type Department = CodeName;
export type Location = CodeName;
export interface AssetCategory extends CodeName {
  /** Assets of this category carry a PC hardware configuration. */
  hasPcConfig: boolean;
  /** Assets of this category are displays (monitor column of the overview). */
  isDisplay: boolean;
}

export type PcComponentType = "cpu" | "gpu" | "ram" | "mainboard" | "storage";

export interface PcComponent {
  id: string;
  componentType: PcComponentType;
  name: string;
  manufacturer: string | null;
  capacityGb: number | null;
  storageType: string | null;
  notes: string | null;
}

export type AssetStatus =
  | "available"
  | "assigned"
  | "maintenance"
  | "broken"
  | "retired";
export type MaintenanceStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  departmentId: string | null;
  department: Department | null;
  email: string | null;
  status: "active" | "inactive";
}

export interface EmployeeDepartmentHistory {
  id: string;
  department: Department;
  startedAt: string;
  endedAt: string | null;
}

export interface AssetModel {
  id: string;
  categoryId: string;
  category?: AssetCategory;
  manufacturer: string | null;
  modelName: string;
  specifications: Record<string, unknown>;
}

export interface PcStorageDevice {
  id: string;
  componentId: string | null;
  component?: PcComponent | null;
  storageType: string;
  capacityGb: number;
  label: string | null;
}

/** Text columns are readable snapshots; *Id columns link to the catalog. */
export interface PcConfiguration {
  id: string;
  cpu: string | null;
  gpu: string | null;
  ramGb: number | null;
  mainboard: string | null;
  cpuId: string | null;
  gpuId: string | null;
  cpuComponent?: PcComponent | null;
  gpuComponent?: PcComponent | null;
  mainboardComponent?: PcComponent | null;
  ramId: string | null;
  mainboardId: string | null;
  ramComponent?: PcComponent | null;
  storageDevices: PcStorageDevice[];
}

export interface Asset {
  id: string;
  assetTag: string;
  categoryId: string;
  category?: AssetCategory;
  modelId: string | null;
  model?: AssetModel | null;
  locationId: string | null;
  location?: Location | null;
  serialNumber: string | null;
  status: AssetStatus;
  purchaseDate: string | null;
  warrantyExpiry: string | null;
  purchasePrice: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  pcConfiguration?: PcConfiguration | null;
  assignmentItems?: AssignmentItem[];
}

export interface AssignmentItem {
  id: string;
  batchId: string;
  batch: AssignmentBatch;
  assetId: string;
  asset: Asset;
  returnedAt: string | null;
  receivedBy: Employee | null;
  conditionOut: string | null;
  conditionIn: string | null;
}

export interface AssignmentBatch {
  id: string;
  code: string;
  employeeId: string;
  employee: Employee;
  handoverBy: Employee | null;
  department: Department | null;
  assignedAt: string;
  note: string | null;
  items: AssignmentItem[];
}

export interface Maintenance {
  id: string;
  assetId: string;
  asset: Asset;
  maintenanceType: string;
  cost: number | null;
  performedAt: string;
  status: MaintenanceStatus;
  description: string | null;
  vendor: string | null;
  completedAt: string | null;
}

export interface AssetEvent {
  id: string;
  asset: Asset;
  eventType: string;
  metadata: Record<string, unknown>;
  actor: Employee | null;
  createdAt: string;
}

export interface AssetStatusHistory {
  id: string;
  asset: Asset;
  oldStatus: AssetStatus | null;
  newStatus: AssetStatus;
  changedBy: Employee | null;
  changedAt: string;
}

export interface PcConfigurationHistory {
  id: string;
  asset: Asset;
  oldConfig: Record<string, unknown> | null;
  newConfig: Record<string, unknown> | null;
  changedBy: Employee | null;
  changedAt: string;
}

export interface DashboardSummary {
  totals: {
    total: number;
    assigned: number;
    available: number;
    maintenance: number;
    broken: number;
    retired: number;
    activeEmployees: number;
    openMaintenance: number;
    maintenanceCostYear: number;
    warrantyExpiringSoon: number;
    warrantyExpired: number;
  };
  byStatus: Record<AssetStatus, number>;
  byCategory: {
    name: string;
    total: number;
    assigned: number;
    available: number;
    broken: number;
  }[];
  byLocation: { name: string; total: number }[];
  assignedByDepartment: { name: string; total: number }[];
  monthlyActivity: { month: string; assigned: number; returned: number }[];
  recentEvents: AssetEvent[];
  upcomingMaintenance: Maintenance[];
}

/** One row of the computer overview. */
export interface ComputerRow {
  id: string;
  assetTag: string;
  status: AssetStatus;
  category: AssetCategory;
  model: AssetModel | null;
  location: Location | null;
  pcConfiguration: PcConfiguration | null;
  holder: Employee | null;
  /** Displays currently held by the same employee. */
  monitors: Asset[];
  /** Other non-PC devices held by the same employee. */
  otherDevices: Asset[];
}
