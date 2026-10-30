"use client";

import {
  ModalForm,
  PageContainer,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { Button, Popconfirm, Space } from "antd";
import dayjs from "dayjs";
import { CheckCheck, Pencil, Play, Plus, Trash2, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusTag } from "@/components/StatusTag";
import { useAction } from "@/hooks/useAction";
import {
  MAINTENANCE_STATUS,
  RESULT_STATUS_OPTIONS,
  toValueEnum,
} from "@/lib/constants";
import { fmtDateTime, fmtMoney } from "@/lib/format";
import { tableRequest } from "@/lib/table";
import {
  maintenanceService,
  type MaintenanceInput,
} from "@/services/maintenance";
import { assetOptions } from "@/services/options";
import type { Maintenance } from "@/types";

type FormValues = MaintenanceInput;

export default function MaintenancePage() {
  const actionRef = useRef<ActionType>(null);
  const run = useAction();
  const [editing, setEditing] = useState<Maintenance | null | undefined>();
  const [finishing, setFinishing] = useState<{
    row: Maintenance;
    status: "completed" | "cancelled";
  }>();

  const transition = async (row: Maintenance, status: string) => {
    const r = await run(
      () => maintenanceService.update(row.id, { status }),
      "Đã cập nhật",
    );
    if (r.ok) actionRef.current?.reload();
  };

  const columns: ProColumns<Maintenance>[] = [
    { title: "Từ khóa", dataIndex: "search", hideInTable: true,
      fieldProps: { placeholder: "Mã tài sản, loại, nhà cung cấp…" } },
    {
      title: "Tài sản",
      dataIndex: "assetId",
      valueType: "select",
      request: assetOptions,
      fieldProps: { showSearch: true },
      render: (_, r) => r.asset.assetTag,
    },
    { title: "Loại bảo trì", dataIndex: "maintenanceType", search: false },
    {
      title: "Trạng thái",
      dataIndex: "status",
      valueType: "select",
      valueEnum: toValueEnum(MAINTENANCE_STATUS),
      render: (_, r) => <StatusTag kind="maintenance" status={r.status} />,
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "performedAt",
      sorter: true,
      search: false,
      render: (_, r) => fmtDateTime(r.performedAt),
    },
    {
      title: "Hoàn tất",
      dataIndex: "completedAt",
      search: false,
      render: (_, r) => fmtDateTime(r.completedAt),
    },
    { title: "Nhà cung cấp", dataIndex: "vendor", search: false },
    {
      title: "Chi phí",
      dataIndex: "cost",
      sorter: true,
      search: false,
      render: (_, r) => fmtMoney(r.cost),
    },
    { title: "Mô tả", dataIndex: "description", search: false, ellipsis: true },
    {
      title: "Thao tác",
      valueType: "option",
      fixed: "right",
      width: 190,
      render: (_, row) => {
        const open = row.status === "scheduled" || row.status === "in_progress";
        return (
          <Space>
            {row.status === "scheduled" && (
              <Button
                type="text"
                size="small"
                title="Bắt đầu"
                icon={<Play size={14} />}
                onClick={() => void transition(row, "in_progress")}
              />
            )}
            {open && (
              <>
                <Button
                  type="text"
                  size="small"
                  title="Hoàn thành"
                  icon={<CheckCheck size={14} />}
                  onClick={() => setFinishing({ row, status: "completed" })}
                />
                <Button
                  type="text"
                  size="small"
                  title="Hủy"
                  icon={<XCircle size={14} />}
                  onClick={() => setFinishing({ row, status: "cancelled" })}
                />
                <Button
                  type="text"
                  size="small"
                  title="Sửa"
                  icon={<Pencil size={14} />}
                  onClick={() => setEditing(row)}
                />
              </>
            )}
            {row.status !== "in_progress" && (
              <Popconfirm
                title="Xóa bản ghi bảo trì?"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  const r = await run(
                    () => maintenanceService.remove(row.id),
                    "Đã xóa",
                  );
                  if (r.ok) actionRef.current?.reload();
                }}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<Trash2 size={14} />}
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer title="Bảo trì & sửa chữa">
      <DataTable<Maintenance>
        actionRef={actionRef}
        columns={columns}
        request={tableRequest(maintenanceService.list)}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setEditing(null)}
          >
            Tạo phiếu bảo trì
          </Button>,
        ]}
      />
      <ModalForm<FormValues>
        title={editing ? "Sửa phiếu bảo trì" : "Tạo phiếu bảo trì"}
        width={560}
        open={editing !== undefined}
        initialValues={
          editing
            ? {
                ...editing,
                cost: editing.cost ?? undefined,
                description: editing.description ?? undefined,
                vendor: editing.vendor ?? undefined,
                performedAt: dayjs(editing.performedAt) as never,
              }
            : { status: "scheduled", performedAt: dayjs() as never }
        }
        modalProps={{ destroyOnHidden: true, onCancel: () => setEditing(undefined) }}
        onOpenChange={(o) => !o && setEditing(undefined)}
        grid
        rowProps={{ gutter: 16 }}
        onFinish={async (v) => {
          const performedAt = dayjs(v.performedAt).toISOString();
          const r = await run(
            () =>
              editing
                ? maintenanceService.update(editing.id, {
                    maintenanceType: v.maintenanceType,
                    cost: v.cost,
                    vendor: v.vendor,
                    description: v.description,
                    performedAt,
                  })
                : maintenanceService.create({ ...v, performedAt }),
            "Đã lưu",
          );
          if (r.ok) actionRef.current?.reload();
          return r.ok;
        }}
      >
        <ProFormSelect
          name="assetId"
          label="Tài sản"
          colProps={{ span: 24 }}
          disabled={!!editing}
          request={assetOptions}
          showSearch
          rules={[{ required: true, message: "Chọn tài sản" }]}
        />
        <ProFormText
          name="maintenanceType"
          label="Loại bảo trì"
          colProps={{ span: 12 }}
          placeholder="Sửa chữa, vệ sinh, nâng cấp RAM…"
          rules={[{ required: true, message: "Nhập loại bảo trì" }]}
        />
        <ProFormDateTimePicker
          name="performedAt"
          label="Ngày thực hiện"
          colProps={{ span: 12 }}
          rules={[{ required: true, message: "Chọn ngày" }]}
        />
        {!editing && (
          <ProFormSelect
            name="status"
            label="Trạng thái"
            colProps={{ span: 12 }}
            valueEnum={toValueEnum(MAINTENANCE_STATUS)}
            allowClear={false}
          />
        )}
        <ProFormDigit
          name="cost"
          label="Chi phí (VND)"
          colProps={{ span: 12 }}
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormText name="vendor" label="Nhà cung cấp" colProps={{ span: 24 }} />
        <ProFormTextArea name="description" label="Mô tả" colProps={{ span: 24 }} />
      </ModalForm>
      <ModalForm<{ resultStatus?: string; cost?: number }>
        title={
          finishing?.status === "completed"
            ? "Hoàn thành bảo trì"
            : "Hủy phiếu bảo trì"
        }
        width={420}
        open={!!finishing}
        initialValues={{ resultStatus: "available", cost: finishing?.row.cost ?? undefined }}
        modalProps={{ destroyOnHidden: true, onCancel: () => setFinishing(undefined) }}
        onOpenChange={(o) => !o && setFinishing(undefined)}
        onFinish={async ({ resultStatus, cost }) => {
          const r = await run(
            () =>
              maintenanceService.update(finishing!.row.id, {
                status: finishing!.status,
                resultStatus,
                ...(finishing!.status === "completed" && cost !== undefined && { cost }),
              }),
            "Đã cập nhật",
          );
          if (r.ok) actionRef.current?.reload();
          return r.ok;
        }}
      >
        {finishing?.status === "completed" && (
          <ProFormDigit
            name="cost"
            label="Chi phí thực tế (VND)"
            min={0}
            fieldProps={{ precision: 0 }}
          />
        )}
        <ProFormSelect
          name="resultStatus"
          label="Trạng thái tài sản sau đó"
          options={RESULT_STATUS_OPTIONS}
          allowClear={false}
        />
      </ModalForm>
    </PageContainer>
  );
}
