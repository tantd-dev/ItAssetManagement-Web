"use client";

import {
  PageContainer,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { Button, Space, Table, Tag } from "antd";
import { ArrowLeftRight, PackageCheck, PackageMinus } from "lucide-react";
import { useRef, useState } from "react";
import {
  AssignmentModals,
  type AssignmentMode,
} from "@/components/AssignmentModals";
import { DataTable } from "@/components/DataTable";
import { fmtDateTime } from "@/lib/format";
import { tableRequest } from "@/lib/table";
import { assignmentService } from "@/services/assignments";
import { departmentOptions, employeeOptions } from "@/services/options";
import type { AssignmentBatch, AssignmentItem } from "@/types";

function BatchItems({ items }: { items: AssignmentItem[] }) {
  return (
    <Table<AssignmentItem>
      size="small"
      rowKey="id"
      pagination={false}
      dataSource={items}
      columns={[
        { title: "Mã tài sản", render: (_, i) => i.asset.assetTag },
        { title: "Model", render: (_, i) => i.asset.model?.modelName ?? "—" },
        { title: "Tình trạng khi cấp", dataIndex: "conditionOut" },
        {
          title: "Thu hồi",
          render: (_, i) =>
            i.returnedAt ? (
              fmtDateTime(i.returnedAt)
            ) : (
              <Tag color="blue">Đang sử dụng</Tag>
            ),
        },
        { title: "Tình trạng khi thu", dataIndex: "conditionIn" },
      ]}
    />
  );
}

export default function AssignmentsPage() {
  const actionRef = useRef<ActionType>(null);
  const [mode, setMode] = useState<AssignmentMode>();

  const columns: ProColumns<AssignmentBatch>[] = [
    { title: "Từ khóa", dataIndex: "search", hideInTable: true,
      fieldProps: { placeholder: "Mã phiếu, nhân viên, mã tài sản…" } },
    { title: "Mã phiếu", dataIndex: "code", sorter: true, search: false },
    {
      title: "Nhân viên",
      dataIndex: "employeeId",
      valueType: "select",
      request: employeeOptions,
      fieldProps: { showSearch: true },
      render: (_, r) => `${r.employee.fullName} (${r.employee.employeeCode})`,
    },
    {
      title: "Phòng ban",
      dataIndex: "departmentId",
      valueType: "select",
      request: departmentOptions,
      fieldProps: { showSearch: true },
      render: (_, r) => r.department?.name ?? "—",
    },
    {
      title: "Ngày cấp",
      dataIndex: "assignedAt",
      sorter: true,
      search: false,
      render: (_, r) => fmtDateTime(r.assignedAt),
    },
    {
      title: "Người bàn giao",
      search: false,
      render: (_, r) => r.handoverBy?.fullName ?? "—",
    },
    {
      title: "Thiết bị",
      search: false,
      render: (_, r) => {
        const open = r.items.filter((i) => !i.returnedAt).length;
        return `${r.items.length} (đang giữ ${open})`;
      },
    },
    {
      title: "Chỉ phiếu còn thiết bị",
      dataIndex: "active",
      hideInTable: true,
      valueType: "select",
      valueEnum: { true: { text: "Còn thiết bị chưa thu hồi" } },
    },
    { title: "Ghi chú", dataIndex: "note", search: false, ellipsis: true },
  ];

  return (
    <PageContainer title="Cấp phát, thu hồi & điều chuyển">
      <DataTable<AssignmentBatch>
        actionRef={actionRef}
        columns={columns}
        request={tableRequest(assignmentService.list)}
        expandable={{
          expandedRowRender: (r) => <BatchItems items={r.items} />,
        }}
        toolBarRender={() => [
          <Space key="actions">
            <Button
              type="primary"
              icon={<PackageCheck size={14} />}
              onClick={() => setMode("assign")}
            >
              Cấp phát
            </Button>
            <Button
              icon={<PackageMinus size={14} />}
              onClick={() => setMode("return")}
            >
              Thu hồi
            </Button>
            <Button
              icon={<ArrowLeftRight size={14} />}
              onClick={() => setMode("transfer")}
            >
              Điều chuyển
            </Button>
          </Space>,
        ]}
      />
      <AssignmentModals
        mode={mode}
        onClose={() => setMode(undefined)}
        onDone={() => {
          setMode(undefined);
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
}
