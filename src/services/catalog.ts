import { api } from "@/lib/api";
import type {
  AssetCategory,
  AssetModel,
  CodeName,
  Department,
  Location,
} from "@/types";
import { createCrud } from "./crud";

type CodeNameInput = Pick<CodeName, "code" | "name">;

export const departmentService = createCrud<Department, CodeNameInput>(
  "/departments",
);
export const locationService = createCrud<Location, CodeNameInput>(
  "/locations",
);
export const categoryService = createCrud<AssetCategory, CodeNameInput>(
  "/asset-categories",
);

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
