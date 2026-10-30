import { api } from "@/lib/api";
import type { ComputerRow, ListParams, Page } from "@/types";

export const computerService = {
  list: (params?: ListParams) => api.list<ComputerRow>("/computers", params),

  /** Every row matching the filters, fetched page by page (for export). */
  async listAll(params: ListParams = {}) {
    const rows: ComputerRow[] = [];
    for (let page = 1; ; page++) {
      const res: Page<ComputerRow> = await computerService.list({
        ...params,
        page,
        pageSize: 200,
      });
      rows.push(...res.data);
      if (rows.length >= res.meta.total || !res.data.length) return rows;
    }
  },
};
