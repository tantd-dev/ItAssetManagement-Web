import { api } from "@/lib/api";
import type { Asset } from "@/types";
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

/** Every part is a pc_components id; null clears it. */
export interface PcConfigurationInput {
  cpuId?: string | null;
  gpuId?: string | null;
  ramId?: string | null;
  mainboardId?: string | null;
  storageDevices?: { componentId: string; label?: string }[];
}

export const assetService = {
  ...createCrud<Asset, AssetInput>("/assets"),
  changeStatus: (id: string, status: string, reason?: string) =>
    api.patch<Asset>(`/assets/${id}/status`, { status, reason }),
  setPcConfiguration: (id: string, body: PcConfigurationInput) =>
    api.put<Asset>(`/assets/${id}/pc-configuration`, body),
};
