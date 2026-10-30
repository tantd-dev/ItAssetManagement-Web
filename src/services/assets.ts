import { api } from "@/lib/api";
import type { Asset, PcStorageDevice } from "@/types";
import { createCrud } from "./crud";

export interface AssetInput {
  assetTag: string;
  categoryId: string;
  modelId?: string | null;
  locationId?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  purchasePrice?: number | null;
  notes?: string | null;
  status?: string;
  pcConfiguration?: PcConfigurationInput;
}

export interface PcConfigurationInput {
  cpu?: string;
  gpu?: string;
  ramGb?: number;
  mainboard?: string;
  storageDevices?: PcStorageDevice[];
}

export const assetService = {
  ...createCrud<Asset, AssetInput>("/assets"),
  changeStatus: (id: string, status: string, reason?: string) =>
    api.patch<Asset>(`/assets/${id}/status`, { status, reason }),
  setPcConfiguration: (id: string, body: PcConfigurationInput) =>
    api.put<Asset>(`/assets/${id}/pc-configuration`, body),
};
