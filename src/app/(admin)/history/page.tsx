"use client";

import { PageContainer, type ProColumns } from "@ant-design/pro-components";
import { Card, Tabs, Tag } from "antd";
import { DataTable } from "@/components/DataTable";
import { StatusTag } from "@/components/StatusTag";
import { describeEvent, eventLabel } from "@/lib/events";
import { fmtDateTime } from "@/lib/format";
import { tableRequest } from "@/lib/table";
import { historyService } from "@/services/history";
import { assetOptions, employeeOptions } from "@/services/options";
import type {
  AssetEvent,
  AssetStatusHistory,
  AssignmentItem,
  PcConfigurationHistory,
} from "@/types";

const assetFilter = {
  title: "Tài sản",
  dataIndex: "assetId",
  hideInTable: true,
  valueType: "select" as const,
  request: assetOptions,
  fieldProps: { showSearch: true },
};
const searchFilter = {
  title: "Từ khóa",
  dataIndex: "search",
  hideInTable: true,
};
const dateRange = (title: string) => ({
  title,
  dataIndex: "range",
  hideInTable: true,
  valueType: "dateRange" as const,
  search: {
    transform: (v: [string, string]) => ({ from: v[0], to: `${v[1]} 23:59:59` }),
  },
});

function EventsTab() {
  const columns: ProColumns<AssetEvent>[] = [
    searchFilter,
    assetFilter,
    {
      title: "Loại sự kiện",
      dataIndex: "eventType",
      valueType: "select",
      request: async () =>
        (await historyService.eventTypes()).map((t) => ({
          value: t,
          label: eventLabel(t),
        })),
      render: (_, r) => <Tag>{eventLabel(r.eventType)}</Tag>,
    },
    dateRange("Thời gian"),
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      search: false,
      render: (_, r) => fmtDateTime(r.createdAt),
    },
    { title: "Tài sản", search: false, render: (_, r) => r.asset.assetTag },
    {
      title: "Chi tiết",
      search: false,
      render: (_, r) => describeEvent(r) || "—",
    },
    { title: "Người thực hiện", search: false, render: (_, r) => r.actor?.fullName ?? "—" },
  ];
  return (
    <DataTable<AssetEvent> columns={columns} request={tableRequest(historyService.events)} />
  );
}

function StatusTab() {
  const columns: ProColumns<AssetStatusHistory>[] = [
    searchFilter,
    assetFilter,
    dateRange("Thời gian"),
    {
      title: "Thời gian",
      search: false,
      render: (_, r) => fmtDateTime(r.changedAt),
    },
    { title: "Tài sản", search: false, render: (_, r) => r.asset.assetTag },
    {
      title: "Từ",
      search: false,
      render: (_, r) =>
        r.oldStatus ? <StatusTag status={r.oldStatus} /> : <Tag>{"—"}</Tag>,
    },
    { title: "Sang", search: false, render: (_, r) => <StatusTag status={r.newStatus} /> },
    { title: "Người thực hiện", search: false, render: (_, r) => r.changedBy?.fullName ?? "—" },
  ];
  return (
    <DataTable<AssetStatusHistory>
      columns={columns}
      request={tableRequest(historyService.status)}
    />
  );
}

function UsageTab() {
  const columns: ProColumns<AssignmentItem>[] = [
    searchFilter,
    assetFilter,
    {
      title: "Nhân viên",
      dataIndex: "employeeId",
      hideInTable: true,
      valueType: "select",
      request: employeeOptions,
      fieldProps: { showSearch: true },
    },
    dateRange("Ngày cấp"),
    {
      title: "Đang sử dụng",
      dataIndex: "active",
      hideInTable: true,
      valueType: "select",
      valueEnum: { true: { text: "Chỉ thiết bị chưa thu hồi" } },
    },
    { title: "Phiếu", search: false, render: (_, r) => r.batch.code },
    { title: "Tài sản", search: false, render: (_, r) => r.asset.assetTag },
    {
      title: "Nhân viên",
      search: false,
      render: (_, r) => `${r.batch.employee.fullName} (${r.batch.employee.employeeCode})`,
    },
    {
      title: "Phòng ban",
      search: false,
      render: (_, r) => r.batch.employee.department?.name ?? "—",
    },
    { title: "Nhận lúc", search: false, render: (_, r) => fmtDateTime(r.batch.assignedAt) },
    {
      title: "Trả lúc",
      search: false,
      render: (_, r) =>
        r.returnedAt ? fmtDateTime(r.returnedAt) : <Tag color="blue">Đang sử dụng</Tag>,
    },
    { title: "Tình trạng cấp", dataIndex: "conditionOut", search: false },
    { title: "Tình trạng thu", dataIndex: "conditionIn", search: false },
  ];
  return (
    <DataTable<AssignmentItem>
      columns={columns}
      request={tableRequest(historyService.assignments)}
    />
  );
}

function PcConfigTab() {
  const columns: ProColumns<PcConfigurationHistory>[] = [
    searchFilter,
    assetFilter,
    dateRange("Thời gian"),
    { title: "Thời gian", search: false, render: (_, r) => fmtDateTime(r.changedAt) },
    { title: "Tài sản", search: false, render: (_, r) => r.asset.assetTag },
    {
      title: "Trước",
      search: false,
      render: (_, r) => <code>{r.oldConfig ? JSON.stringify(r.oldConfig) : "—"}</code>,
      ellipsis: true,
    },
    {
      title: "Sau",
      search: false,
      render: (_, r) => <code>{r.newConfig ? JSON.stringify(r.newConfig) : "—"}</code>,
      ellipsis: true,
    },
    { title: "Người thực hiện", search: false, render: (_, r) => r.changedBy?.fullName ?? "—" },
  ];
  return (
    <DataTable<PcConfigurationHistory>
      columns={columns}
      request={tableRequest(historyService.pcConfiguration)}
    />
  );
}

export default function HistoryPage() {
  return (
    <PageContainer title="Lịch sử tài sản">
      <Card>
        <Tabs
          items={[
            { key: "events", label: "Nhật ký sự kiện", children: <EventsTab /> },
            { key: "usage", label: "Lịch sử sử dụng", children: <UsageTab /> },
            { key: "status", label: "Đổi trạng thái", children: <StatusTab /> },
            { key: "pc", label: "Cấu hình PC", children: <PcConfigTab /> },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
