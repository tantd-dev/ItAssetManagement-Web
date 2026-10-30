import { Tag } from "antd";
import {
  ASSET_STATUS,
  EMPLOYEE_STATUS,
  MAINTENANCE_STATUS,
} from "@/lib/constants";

type Kind = "asset" | "maintenance" | "employee";

const MAPS: Record<Kind, Record<string, { label: string; color: string }>> = {
  asset: ASSET_STATUS,
  maintenance: MAINTENANCE_STATUS,
  employee: EMPLOYEE_STATUS,
};

export function StatusTag({
  kind = "asset",
  status,
}: {
  kind?: Kind;
  status?: string | null;
}) {
  if (!status) return <>—</>;
  const meta = MAPS[kind][status];
  return <Tag color={meta?.color}>{meta?.label ?? status}</Tag>;
}
