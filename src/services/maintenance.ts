import type { Maintenance } from "@/types";
import { createCrud } from "./crud";

export interface MaintenanceInput {
  assetId: string;
  maintenanceType: string;
  performedAt: string;
  status?: string;
  cost?: number;
  description?: string;
  vendor?: string;
}

export interface MaintenanceUpdate extends Partial<MaintenanceInput> {
  resultStatus?: string;
}

export const maintenanceService = createCrud<
  Maintenance,
  MaintenanceInput,
  MaintenanceUpdate
>("/maintenance");
