import { pcComponentLabel } from "@/lib/format";
import type { AssetStatus, PcComponentType } from "@/types";
import { assetService } from "./assets";
import {
  categoryService,
  departmentService,
  locationService,
  modelService,
  pcComponentService,
} from "./catalog";
import { employeeService } from "./employees";

export interface Option {
  label: string;
  value: string;
}

interface SearchParams {
  keyWords?: string;
}

const LIMIT = 50;

/** Option loaders for remote-searchable selects (ProFormSelect `request`). */
export const departmentOptions = async ({
  keyWords,
}: SearchParams = {}): Promise<Option[]> =>
  (await departmentService.list({ pageSize: LIMIT, search: keyWords })).data.map(
    (d) => ({ value: d.id, label: `${d.code} - ${d.name}` }),
  );

export const locationOptions = async ({
  keyWords,
}: SearchParams = {}): Promise<Option[]> =>
  (await locationService.list({ pageSize: LIMIT, search: keyWords })).data.map(
    (l) => ({ value: l.id, label: `${l.code} - ${l.name}` }),
  );

/** Options also carry `hasPcConfig` so forms can react to the choice. */
export const categoryOptions = async ({
  keyWords,
}: SearchParams = {}): Promise<(Option & { hasPcConfig: boolean })[]> =>
  (await categoryService.list({ pageSize: LIMIT, search: keyWords })).data.map(
    (c) => ({
      value: c.id,
      label: `${c.code} - ${c.name}`,
      hasPcConfig: c.hasPcConfig,
    }),
  );

export const pcComponentOptions =
  (type: PcComponentType) =>
  async ({ keyWords }: SearchParams = {}): Promise<Option[]> =>
    (
      await pcComponentService.list({
        type,
        pageSize: LIMIT,
        search: keyWords,
      })
    ).data.map((p) => ({ value: p.id, label: pcComponentLabel(p) }));

/** Brands in use by asset models. */
export const manufacturerOptions = async (): Promise<Option[]> =>
  (await modelService.manufacturers()).map((m) => ({ value: m, label: m }));

export const modelOptions = async ({
  keyWords,
  categoryId,
}: SearchParams & { categoryId?: string } = {}): Promise<Option[]> =>
  (
    await modelService.list({ pageSize: LIMIT, search: keyWords, categoryId })
  ).data.map((m) => ({
    value: m.id,
    label: [m.manufacturer, m.modelName].filter(Boolean).join(" "),
  }));

export const employeeOptions = async ({
  keyWords,
  status,
}: SearchParams & { status?: string } = {}): Promise<Option[]> =>
  (
    await employeeService.list({ pageSize: LIMIT, search: keyWords, status })
  ).data.map((e) => ({ value: e.id, label: `${e.employeeCode} - ${e.fullName}` }));

export const assetOptions = async ({
  keyWords,
  status,
  employeeId,
}: SearchParams & { status?: AssetStatus; employeeId?: string } = {}): Promise<
  Option[]
> =>
  (
    await assetService.list({
      pageSize: LIMIT,
      search: keyWords,
      status,
      employeeId,
    })
  ).data.map((a) => ({
    value: a.id,
    label: [a.assetTag, a.model?.modelName ?? a.category?.name]
      .filter(Boolean)
      .join(" · "),
  }));
