import type { AssetStatus, MaintenanceStatus, PcComponentType } from "@/types";

export const PC_COMPONENT_TYPES: Record<PcComponentType, string> = {
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  mainboard: "Mainboard",
  storage: "Ổ lưu trữ",
};

export const ASSET_STATUS: Record<
  AssetStatus,
  { label: string; color: string }
> = {
  available: { label: "Tồn kho", color: "green" },
  assigned: { label: "Đang sử dụng", color: "blue" },
  maintenance: { label: "Đang bảo trì", color: "orange" },
  broken: { label: "Hỏng", color: "red" },
  retired: { label: "Thanh lý", color: "default" },
};

export const MAINTENANCE_STATUS: Record<
  MaintenanceStatus,
  { label: string; color: string }
> = {
  scheduled: { label: "Đã lên lịch", color: "default" },
  in_progress: { label: "Đang thực hiện", color: "processing" },
  completed: { label: "Hoàn thành", color: "success" },
  cancelled: { label: "Đã hủy", color: "error" },
};

export const EMPLOYEE_STATUS = {
  active: { label: "Đang làm việc", color: "green" },
  inactive: { label: "Đã nghỉ", color: "default" },
} as const;

export const EVENT_LABELS: Record<string, string> = {
  created: "Tạo mới",
  updated: "Cập nhật thông tin",
  status_changed: "Đổi trạng thái",
  assigned: "Cấp phát",
  returned: "Thu hồi",
  transferred: "Điều chuyển",
  pc_config_changed: "Đổi cấu hình PC",
  maintenance_created: "Tạo bảo trì",
  maintenance_updated: "Cập nhật bảo trì",
  maintenance_completed: "Hoàn tất bảo trì",
};

/** Statuses an asset may be left in after being returned or maintained. */
export const RESULT_STATUS_OPTIONS = (
  ["available", "maintenance", "broken", "retired"] as AssetStatus[]
).map((s) => ({ value: s, label: ASSET_STATUS[s].label }));

export const toValueEnum = (
  map: Record<string, { label: string; color?: string }>,
) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { text: v.label }]));
