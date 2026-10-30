"use client";

import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { Button, Popconfirm, Space } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { useAction } from "@/hooks/useAction";
import { PC_COMPONENT_TYPES } from "@/lib/constants";
import { fmtCapacity } from "@/lib/format";
import { tableRequest } from "@/lib/table";
import { pcComponentService, type PcComponentInput } from "@/services/catalog";
import type { PcComponent, PcComponentType } from "@/types";

const STORAGE_TYPES = ["SSD", "NVMe", "HDD", "SSHD"].map((t) => ({
  value: t,
  label: t,
}));

const NAME_HINTS: Record<PcComponentType, string> = {
  cpu: "Core i7-12700",
  gpu: "GeForce RTX 3060 12GB",
  ram: "16GB DDR4 3200",
  mainboard: "B660M Pro",
  storage: "980 Pro",
};

/** CRUD table for one kind of PC part (CPU, GPU, RAM, mainboard, storage). */
export function PcComponentsTable({ type }: { type: PcComponentType }) {
  const actionRef = useRef<ActionType>(null);
  const run = useAction();
  const [editing, setEditing] = useState<PcComponent | null | undefined>();
  const hasCapacity = type === "ram" || type === "storage";
  const label = PC_COMPONENT_TYPES[type];

  const columns: ProColumns<PcComponent>[] = [
    { title: "Tên", dataIndex: "name", sorter: true },
    {
      title: "Hãng",
      dataIndex: "manufacturer",
      sorter: true,
      render: (_, r) => r.manufacturer ?? "—",
    },
    ...(type === "storage"
      ? [
          {
            title: "Loại ổ",
            dataIndex: "storageType",
            sorter: true,
          } satisfies ProColumns<PcComponent>,
        ]
      : []),
    ...(hasCapacity
      ? [
          {
            title: "Dung lượng",
            dataIndex: "capacityGb",
            sorter: true,
            render: (_, r) => fmtCapacity(r.capacityGb),
          } satisfies ProColumns<PcComponent>,
        ]
      : []),
    { title: "Ghi chú", dataIndex: "notes", ellipsis: true },
    {
      title: "Thao tác",
      valueType: "option",
      width: 110,
      render: (_, row) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => setEditing(row)}
          />
          <Popconfirm
            title={`Xóa ${label} này?`}
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              const r = await run(
                () => pcComponentService.remove(row.id),
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
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable<PcComponent>
        actionRef={actionRef}
        columns={columns}
        search={false}
        options={{
          density: false,
          setting: false,
          search: { name: "search", placeholder: "Tìm theo tên, hãng…" },
        }}
        request={tableRequest(pcComponentService.list, { type })}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setEditing(null)}
          >
            Thêm {label}
          </Button>,
        ]}
      />
      <ModalForm<PcComponentInput>
        title={editing ? `Sửa ${label}` : `Thêm ${label}`}
        width={480}
        open={editing !== undefined}
        initialValues={
          editing
            ? {
                ...editing,
                manufacturer: editing.manufacturer ?? undefined,
                capacityGb: editing.capacityGb ?? undefined,
                storageType: editing.storageType ?? undefined,
                notes: editing.notes ?? undefined,
              }
            : {}
        }
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => setEditing(undefined),
        }}
        onOpenChange={(open) => !open && setEditing(undefined)}
        onFinish={async (values) => {
          const body = {
            name: values.name,
            manufacturer: values.manufacturer || null,
            capacityGb: hasCapacity ? values.capacityGb : null,
            storageType: type === "storage" ? values.storageType : null,
            notes: values.notes || null,
          };
          const r = await run(
            () =>
              editing
                ? pcComponentService.update(editing.id, body)
                : pcComponentService.create({ ...body, componentType: type }),
            "Đã lưu",
          );
          if (r.ok) actionRef.current?.reload();
          return r.ok;
        }}
      >
        <ProFormText
          name="name"
          label="Tên"
          placeholder={NAME_HINTS[type]}
          rules={[{ required: true, message: "Nhập tên" }]}
        />
        <ProFormText
          name="manufacturer"
          label="Hãng"
          placeholder="Intel, AMD, NVIDIA, Samsung…"
        />
        {type === "storage" && (
          <ProFormSelect
            name="storageType"
            label="Loại ổ"
            options={STORAGE_TYPES}
            rules={[{ required: true, message: "Chọn loại ổ" }]}
          />
        )}
        {hasCapacity && (
          <ProFormDigit
            name="capacityGb"
            label="Dung lượng (GB)"
            min={1}
            rules={[{ required: true, message: "Nhập dung lượng" }]}
          />
        )}
        <ProFormTextArea name="notes" label="Ghi chú" />
      </ModalForm>
    </>
  );
}
