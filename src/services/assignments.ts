import { api } from "@/lib/api";
import type { AssignmentBatch } from "@/types";

export interface AssignInput {
  employeeId: string;
  assetIds: string[];
  handoverBy?: string;
  departmentId?: string;
  assignedAt?: string;
  conditionOut?: string;
  note?: string;
}

export interface ReturnInput {
  assetIds: string[];
  receivedBy?: string;
  conditionIn?: string;
  returnedAt?: string;
  resultStatus?: string;
}

export interface TransferInput {
  assetIds: string[];
  toEmployeeId: string;
  fromEmployeeId?: string;
  handoverBy?: string;
  transferredAt?: string;
  conditionIn?: string;
  conditionOut?: string;
  note?: string;
}

export const assignmentService = {
  list: (params?: Parameters<typeof api.list>[1]) =>
    api.list<AssignmentBatch>("/assignments", params),
  get: (id: string) => api.get<AssignmentBatch>(`/assignments/${id}`),
  assign: (body: AssignInput) =>
    api.post<AssignmentBatch>("/assignments/assign", body),
  returnAssets: (body: ReturnInput) =>
    api.post<AssignmentBatch[]>("/assignments/return", body),
  transfer: (body: TransferInput) =>
    api.post<AssignmentBatch>("/assignments/transfer", body),
};
