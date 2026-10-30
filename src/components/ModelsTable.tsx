"use client";

import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { AutoComplete, Button, Form, Popconfirm, Space } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { useAction } from "@/hooks/useAction";
import { tableRequest } from "@/lib/table";
import { modelService } from "@/services/catalog";
import { categoryOptions } from "@/services/options";
import type { AssetModel } from "@/types";

interface FormValues {
  categoryId: string;
  manufacturer?: string;
  modelName: string;
  specifications?: string;
}

export function ModelsTable() {
  const actionRef = useRef<ActionType>(null);
  const run = useAction();
  const [editing, setEditing] = useState<AssetModel | null | undefined>();
  const [brands, setBrands] = useState<string[]>([]);

  const loadBrands = useCallback(
    () => modelService.manufacturers().then(setBrands).catch(() => undefined),
    [],
  );
  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  const columns: ProColumns<AssetModel>[] = [
    { title: "Từ khóa", dataIndex: "search", hideInTable: true },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      hideInTable: true,
      valueType: "select",
      request: categoryOptions,
      fieldProps: { showSearch: true },
    },
    {
      title: "Thương hiệu",
      dataIndex: "manufacturer",
      valueType: "select",
      sorter: true,
      fieldProps: { options: brands.map((b) => ({ label: b, value: b })) },
      render: (_, r) => r.manufacturer ?? "—",
    },
    { title: "Model", dataIndex: "modelName", sorter: true, search: false },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      search: false,
    },
    {
      title: "Thông số",
      dataIndex: "specifications",
      search: false,
      ellipsis: true,
      render: (_, r) =>
        Object.entries(r.specifications ?? {})
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join(", ") || "—",
    },
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
            title="Xóa model này?"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              const r = await run(() => modelService.remove(row.id), "Đã xóa");
              if (r.ok) {
                actionRef.current?.reload();
                void loadBrands();
              }
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
      <DataTable<AssetModel>
        actionRef={actionRef}
        columns={columns}
        request={tableRequest(modelService.list)}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setEditing(null)}
          >
            Thêm model
          </Button>,
        ]}
      />
      <ModalForm<FormValues>
        title={editing ? "Sửa model" : "Thêm model"}
        width={520}
        open={editing !== undefined}
        initialValues={
          editing
            ? {
                ...editing,
                manufacturer: editing.manufacturer ?? undefined,
                specifications: JSON.stringify(editing.specifications ?? {}, null, 2),
              }
            : { specifications: "{}" }
        }
        modalProps={{ destroyOnHidden: true, onCancel: () => setEditing(undefined) }}
        onOpenChange={(open) => !open && setEditing(undefined)}
        onFinish={async (values) => {
          let specifications: Record<string, unknown> = {};
          try {
            specifications = JSON.parse(values.specifications || "{}");
          } catch {
            return run(() => Promise.reject(new Error("Thông số phải là JSON hợp lệ"))).then(
              (r) => r.ok,
            );
          }
          const body = { ...values, specifications };
          const r = await run(
            () =>
              editing
                ? modelService.update(editing.id, body)
                : modelService.create(body),
            "Đã lưu",
          );
          if (r.ok) {
            actionRef.current?.reload();
            void loadBrands();
          }
          return r.ok;
        }}
      >
        <ProFormSelect
          name="categoryId"
          label="Danh mục"
          request={categoryOptions}
          showSearch
          rules={[{ required: true, message: "Chọn danh mục" }]}
        />
        <Form.Item name="manufacturer" label="Thương hiệu">
          <AutoComplete
            options={brands.map((b) => ({ value: b }))}
            placeholder="Dell, HP, Logitech…"
            filterOption
          />
        </Form.Item>
        <ProFormText
          name="modelName"
          label="Model"
          rules={[{ required: true, message: "Nhập tên model" }]}
        />
        <ProFormTextArea
          name="specifications"
          label="Thông số (JSON)"
          fieldProps={{ rows: 4, style: { fontFamily: "monospace" } }}
        />
      </ModalForm>
    </>
  );
}
