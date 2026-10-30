import { api } from "@/lib/api";
import type {
  AssetEvent,
  AssetStatusHistory,
  AssignmentItem,
  DashboardSummary,
  ListParams,
  PcConfigurationHistory,
} from "@/types";

export const historyService = {
  events: (params?: ListParams) =>
    api.list<AssetEvent>("/history/events", params),
  eventTypes: () => api.get<string[]>("/history/event-types"),
  status: (params?: ListParams) =>
    api.list<AssetStatusHistory>("/history/status", params),
  assignments: (params?: ListParams) =>
    api.list<AssignmentItem>("/history/assignments", params),
  pcConfiguration: (params?: ListParams) =>
    api.list<PcConfigurationHistory>("/history/pc-configuration", params),
};

export const dashboardService = {
  summary: () => api.get<DashboardSummary>("/dashboard"),
};
