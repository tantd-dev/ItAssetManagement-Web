import dayjs from "dayjs";

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
