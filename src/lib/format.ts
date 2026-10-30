import dayjs from "dayjs";
import type { PcComponent } from "@/types";

export const fmtDate = (v?: string | null) =>
  v ? dayjs(v).format("DD/MM/YYYY") : "—";
export const fmtDateTime = (v?: string | null) =>
  v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—";
export const fmtMoney = (v?: number | null) =>
  v === null || v === undefined
    ? "—"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(v);

export const fmtCapacity = (gb?: number | null) =>
  gb === null || gb === undefined
    ? "—"
    : gb >= 1024 && gb % 1024 === 0
      ? `${gb / 1024} TB`
      : `${gb} GB`;

/**
 * e.g. "Intel Core i7-12700", "Kingston Fury DDR4 · 16 GB" or
 * "Samsung 980 · NVMe 512 GB".
 */
export function pcComponentLabel(p: PcComponent) {
  const name = [p.manufacturer, p.name].filter(Boolean).join(" ");
  if (p.componentType === "storage") {
    return `${name} · ${p.storageType ?? ""} ${fmtCapacity(p.capacityGb)}`;
  }
  if (p.componentType === "ram") {
    return `${name} · ${fmtCapacity(p.capacityGb)}`;
  }
  return name;
}
