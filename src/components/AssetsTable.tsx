"use client";

import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { Button, Popconfirm, Space } from "antd";
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { AssetDrawer } from "@/components/AssetDrawer";
import { AssetFormModal } from "@/components/AssetFormModal";
import { DataTable } from "@/components/DataTable";
import { StatusTag } from "@/components/StatusTag";
import { useAction } from "@/hooks/useAction";
import { ASSET_STATUS, toValueEnum } from "@/lib/constants";
import { tableRequest } from "@/lib/table";
import { assetService } from "@/services/assets";
import {
  categoryOptions,
  employeeOptions,
  locationOptions,
  manufacturerOptions,
  modelOptions,
} from "@/services/options";
import type { Asset } from "@/types";

const WARRANTY_ENUM = {
  valid: { text: "Còn bảo hành" },
  expiring: { text: "Hết hạn trong 30 ngày" },
  expired: { text: "Đã hết bảo hành" },
  none: { text: "Không có thông tin" },
};

const MANUAL_STATUS_ENUM = toValueEnum({
  available: ASSET_STATUS.available,
  maintenance: ASSET_STATUS.maintenance,
  broken: ASSET_STATUS.broken,
  retired: ASSET_STATUS.retired,
});

export function AssetsTable() {
  const actionRef = useRef<ActionType>(null);
  const run = useAction();
  const [form, setForm] = useState<{ asset: Asset | null } | undefined>();
  const [statusTarget, setStatusTarget] = useState<Asset>();
  const [viewId, setViewId] = useState<string>();

  const openEdit = async (row: Asset) => {
    const r = await run(() => assetService.get(row.id));
    if (r.ok) setForm({ asset: r.data });
  };

  const columns: ProColumns<Asset>[] = [
    { title: "Mã tài sản", dataIndex: "assetTag", sorter: true, search: false },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      valueType: "select",
      request: categoryOptions,
      fieldProps: { showSearch: true },
      render: (_, r) => r.category?.name ?? "—",
    },
    {
      title: "Thương hiệu",
      dataIndex: "manufacturer",
      valueType: "select",
      request: manufacturerOptions,
      fieldProps: { showSearch: true },
      render: (_, r) => r.model?.manufacturer ?? "—",
    },
    {
      title: "Model",
      dataIndex: "modelId",
      valueType: "select",
      request: modelOptions,
      fieldProps: { showSearch: true },
      render: (_, r) => r.model?.modelName ?? "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      valueType: "select",
      valueEnum: toValueEnum(ASSET_STATUS),
      sorter: true,
      render: (_, r) => <StatusTag status={r.status} />,
    },
    {
      title: "Người đang giữ",
      dataIndex: "employeeId",
      valueType: "select",
      request: employeeOptions,
      fieldProps: { showSearch: true },
      render: (_, r) => r.assignmentItems?.[0]?.batch.employee.fullName ?? "—",
    },
    // Filter-only fields (not shown as columns).
    {
      title: "Vị trí",
      dataIndex: "locationId",
      hideInTable: true,
      valueType: "select",
      request: locationOptions,
      fieldProps: { showSearch: true },
    },
    {
      title: "Bảo hành",
      dataIndex: "warranty",
      hideInTable: true,
      valueType: "select",
      valueEnum: WARRANTY_ENUM,
    },
    {
      title: "Ngày mua",
      dataIndex: "purchaseRange",
      hideInTable: true,
      valueType: "dateRange",
      search: {
        transform: ([purchaseFrom, purchaseTo]: [string, string]) => ({
          purchaseFrom,
          purchaseTo,
        }),
      },
    },
    {
      title: "Thao tác",
      valueType: "option",
      fixed: "right",
      width: 170,
      render: (_, row) => (
        <Space>
          <Button
            type="text"
            size="small"
            title="Chi tiết"
            icon={<Eye size={14} />}
            onClick={() => setViewId(row.id)}
          />
          <Button
            type="text"
            size="small"
            title="Sửa"
            icon={<Pencil size={14} />}
            onClick={() => void openEdit(row)}
          />
          <Button
            type="text"
            size="small"
            title="Đổi trạng thái"
            disabled={row.status === "assigned"}
            icon={<RefreshCw size={14} />}
            onClick={() => setStatusTarget(row)}
          />
          <Popconfirm
            title="Xóa tài sản này?"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              const r = await run(() => assetService.remove(row.id), "Đã xóa");
              if (r.ok) actionRef.current?.reload();
            }}
          >
            <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable<Asset>
        actionRef={actionRef}
        columns={columns}
        request={tableRequest(assetService.list)}
        options={{
          density: false,
          setting: false,
          reload: true,
          search: {
            name: "search",
            placeholder: "Tìm mã, serial, model, người giữ…",
            allowClear: true,
            style: { width: 300 },
          },
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setForm({ asset: null })}
          >
            Thêm tài sản
          </Button>,
        ]}
      />
      <AssetFormModal
        open={!!form}
        asset={form?.asset ?? null}
        onClose={() => setForm(undefined)}
        onSaved={() => {
          setForm(undefined);
          actionRef.current?.reload();
        }}
      />
      <ModalForm<{ status: string; reason?: string }>
        title={`Đổi trạng thái ${statusTarget?.assetTag ?? ""}`}
        width={420}
        open={!!statusTarget}
        initialValues={{ status: statusTarget?.status }}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => setStatusTarget(undefined),
        }}
        onOpenChange={(o) => !o && setStatusTarget(undefined)}
        onFinish={async ({ status, reason }) => {
          const r = await run(
            () => assetService.changeStatus(statusTarget!.id, status, reason),
            "Đã đổi trạng thái",
          );
          if (r.ok) actionRef.current?.reload();
          return r.ok;
        }}
      >
        <ProFormSelect
          name="status"
          label="Trạng thái mới"
          valueEnum={MANUAL_STATUS_ENUM}
          allowClear={false}
        />
        <ProFormText name="reason" label="Lý do" />
      </ModalForm>
      <AssetDrawer assetId={viewId} onClose={() => setViewId(undefined)} />
    </>
  );
}
