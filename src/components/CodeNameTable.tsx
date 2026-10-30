"use client";

import {
  ModalForm,
  ProFormText,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { Button, Popconfirm, Space } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { useAction } from "@/hooks/useAction";
import { tableRequest } from "@/lib/table";
import type { CodeName, ListParams, Page } from "@/types";

interface Service {
  list: (params?: ListParams) => Promise<Page<CodeName>>;
  create: (body: { code: string; name: string }) => Promise<unknown>;
  update: (id: string, body: { code: string; name: string }) => Promise<unknown>;
  remove: (id: string) => Promise<void>;
}

/** CRUD table for the simple "code + name" lookup resources. */
export function CodeNameTable({
  service,
  entity,
}: {
  service: Service;
  /** Lower-case noun used in labels, e.g. "phòng ban". */
  entity: string;
}) {
  const actionRef = useRef<ActionType>(null);
  const run = useAction();
  // undefined = closed, null = creating, object = editing
  const [editing, setEditing] = useState<CodeName | null | undefined>();

  const columns: ProColumns<CodeName>[] = [
    { title: "Từ khóa", dataIndex: "search", hideInTable: true },
    { title: "Mã", dataIndex: "code", sorter: true, search: false },
    { title: "Tên", dataIndex: "name", sorter: true, search: false },
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
            title={`Xóa ${entity} này?`}
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              const r = await run(() => service.remove(row.id), "Đã xóa");
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
      <DataTable<CodeName>
        actionRef={actionRef}
        columns={columns}
        request={tableRequest(service.list)}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setEditing(null)}
          >
            Thêm {entity}
          </Button>,
        ]}
      />
      <ModalForm<{ code: string; name: string }>
        title={editing ? `Sửa ${entity}` : `Thêm ${entity}`}
        width={440}
        open={editing !== undefined}
        initialValues={editing ?? {}}
        modalProps={{ destroyOnHidden: true, onCancel: () => setEditing(undefined) }}
        onOpenChange={(open) => !open && setEditing(undefined)}
        onFinish={async (values) => {
          const r = await run(
            () =>
              editing
                ? service.update(editing.id, values)
                : service.create(values),
            "Đã lưu",
          );
          if (r.ok) actionRef.current?.reload();
          return r.ok;
        }}
      >
        <ProFormText
          name="code"
          label="Mã"
          rules={[{ required: true, message: "Nhập mã" }]}
          fieldProps={{ maxLength: 50 }}
        />
        <ProFormText
          name="name"
          label="Tên"
          rules={[{ required: true, message: "Nhập tên" }]}
          fieldProps={{ maxLength: 255 }}
        />
      </ModalForm>
    </>
  );
}
