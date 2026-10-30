import { api } from "@/lib/api";
import type { ListParams } from "@/types";

/** Builds list/get/create/update/remove calls for a REST resource. */
export function createCrud<T, C = Partial<T>, U = Partial<C>>(path: string) {
  return {
    list: (params?: ListParams) => api.list<T>(path, params),
    get: (id: string) => api.get<T>(`${path}/${id}`),
    create: (body: C) => api.post<T>(path, body),
    update: (id: string, body: U) => api.patch<T>(`${path}/${id}`, body),
    remove: (id: string) => api.delete(`${path}/${id}`),
  };
}
