import { api } from "@/lib/api";
import type {
  AssetCategory,
  AssetModel,
  CodeName,
  Department,
  Location,
  PcComponent,
  PcComponentType,
} from "@/types";
import { createCrud } from "./crud";

type CodeNameInput = Pick<CodeName, "code" | "name">;

export const departmentService = createCrud<Department, CodeNameInput>(
  "/departments",
);
export const locationService = createCrud<Location, CodeNameInput>(
  "/locations",
);
export const categoryService = createCrud<
  AssetCategory,
  CodeNameInput & { hasPcConfig?: boolean; isDisplay?: boolean }
>("/asset-categories");

export interface PcComponentInput {
  componentType: PcComponentType;
  name: string;
  manufacturer?: string | null;
  capacityGb?: number | null;
  storageType?: string | null;
  notes?: string | null;
}

export const pcComponentService = createCrud<
  PcComponent,
  PcComponentInput,
  Partial<Omit<PcComponentInput, "componentType">>
>("/pc-components");

export interface AssetModelInput {
  categoryId: string;
  manufacturer?: string;
  modelName: string;
  specifications?: Record<string, unknown>;
}

export const modelService = {
  ...createCrud<AssetModel, AssetModelInput>("/asset-models"),
  manufacturers: () => api.get<string[]>("/asset-models/manufacturers"),
};
