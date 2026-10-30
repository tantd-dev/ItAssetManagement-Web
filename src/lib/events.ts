import type { AssetEvent } from "@/types";
import { ASSET_STATUS, EVENT_LABELS, MAINTENANCE_STATUS } from "./constants";

const statusLabel = (s: unknown) =>
  ASSET_STATUS[s as keyof typeof ASSET_STATUS]?.label ?? String(s ?? "—");

export const eventLabel = (type: string) => EVENT_LABELS[type] ?? type;

/** One-line human description of an audit event's metadata. */
export function describeEvent(e: Pick<AssetEvent, "eventType" | "metadata">) {
  const m = e.metadata ?? {};
  switch (e.eventType) {
    case "assigned":
      return `Cấp cho ${m.employeeName ?? "—"} (phiếu ${m.batchCode ?? "—"})`;
    case "returned":
      return `Thu hồi phiếu ${m.batchCode ?? "—"}, tình trạng: ${
        m.conditionIn ?? "—"
      }, trạng thái mới: ${statusLabel(m.resultStatus)}`;
    case "transferred":
      return `${m.fromEmployeeName ?? "—"} → ${m.toEmployeeName ?? "—"} (phiếu ${
        m.toBatchCode ?? "—"
      })`;
    case "status_changed":
      return `${statusLabel(m.from)} → ${statusLabel(m.to)}${
        m.reason ? ` · ${String(m.reason)}` : ""
      }`;
    case "updated":
      return `Thay đổi: ${Object.keys((m.changes as object) ?? {}).join(", ")}`;
    case "created":
      return `Mã tài sản ${m.assetTag ?? ""}`;
    case "maintenance_created":
      return `${m.type ?? ""} · ${
        MAINTENANCE_STATUS[m.status as keyof typeof MAINTENANCE_STATUS]?.label ??
        ""
      }`;
    case "maintenance_updated":
    case "maintenance_completed":
      return `${
        MAINTENANCE_STATUS[m.from as keyof typeof MAINTENANCE_STATUS]?.label ?? ""
      } → ${
        MAINTENANCE_STATUS[m.to as keyof typeof MAINTENANCE_STATUS]?.label ?? ""
      }`;
    default:
      return "";
  }
}
