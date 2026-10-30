import type { SortOrder } from "antd/es/table/interface";
import type { ListParams, Page } from "@/types";

type Params = { current?: number; pageSize?: number; [key: string]: unknown };

/** Adapts a paginated API list function to ProTable's `request`. */
export function tableRequest<T>(
  list: (params: ListParams) => Promise<Page<T>>,
  extra: ListParams = {},
) {
  return async (params: Params, sort: Record<string, SortOrder>) => {
    const { current, pageSize, ...filters } = params;
    const [sortBy, order] = Object.entries(sort ?? {})[0] ?? [];
    const res = await list({
      ...(filters as ListParams),
      ...extra,
      page: current,
      pageSize,
      ...(sortBy && {
        sortBy,
        sortOrder: order === "ascend" ? "ASC" : "DESC",
      }),
    });
    return { data: res.data, total: res.meta.total, success: true };
  };
}
