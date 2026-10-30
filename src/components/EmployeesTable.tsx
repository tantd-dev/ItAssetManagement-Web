"use client";

import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { Button, Drawer, Popconfirm, Space, Tabs } from "antd";
import { Eye, Laptop, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { AssetDrawer } from "@/components/AssetDrawer";
import { DataTable } from "@/components/DataTable";
import { StatusTag } from "@/components/StatusTag";
import { useAction } from "@/hooks/useAction";
import { EMPLOYEE_STATUS, toValueEnum } from "@/lib/constants";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { tableRequest } from "@/lib/table";
import { employeeService, type EmployeeInput } from "@/services/employees";
import { departmentOptions } from "@/services/options";
import type {
  AssignmentItem,
  Employee,
  EmployeeDepartmentHistory,
} from "@/types";

function EmployeeDrawer({
  employee,
  onClose,
}: {
  employee?: Employee;
  onClose: () => void;
}) {
  return (
    <Drawer
      title={employee ? `${employee.fullName} (${employee.employeeCode})` : ""}
      open={!!employee}
      onClose={onClose}
      size={640}
      destroyOnHidden
    >
      {employee && (
        <Tabs
          items={[
            {
              key: "assets",
              label: "Thiết bị đang giữ",
              children: <HeldAssets employeeId={employee.id} />,
            },
            {
              key: "departments",
              label: "Lịch sử phòng ban",
              children: <DepartmentHistory employeeId={employee.id} />,
            },
          ]}
        />
      )}
    </Drawer>
  );
}

function HeldAssets({ employeeId }: { employeeId: string }) {
  const [viewId, setViewId] = useState<string>();
  return (
    <>
      <DataTable<AssignmentItem>
        search={false}
        options={false}
        pagination={false}
        request={async () => ({
          data: await employeeService.currentAssets(employeeId),
          success: true,
        })}
        columns={[
          { title: "Mã tài sản", dataIndex: ["asset", "assetTag"] },
          {
            title: "Loại",
            render: (_, r) =>
              r.asset.model?.modelName ?? r.asset.category?.name ?? "—",
          },
          { title: "Phiếu", dataIndex: ["batch", "code"] },
          {
            title: "Ngày cấp",
            render: (_, r) => fmtDate(r.batch.assignedAt),
          },
          {
            title: "Thao tác",
            valueType: "option",
            render: (_, r) => (
              <Button
                type="link"
                size="small"
                icon={<Eye size={14} />}
                onClick={() => setViewId(r.assetId)}
              >
                Xem chi tiết thiết bị
              </Button>
            ),
          },
        ]}
      />
      <AssetDrawer assetId={viewId} onClose={() => setViewId(undefined)} />
    </>
  );
}

function DepartmentHistory({ employeeId }: { employeeId: string }) {
  return (
    <DataTable<EmployeeDepartmentHistory>
      search={false}
      options={false}
      pagination={false}
      request={async () => ({
        data: await employeeService.departmentHistory(employeeId),
        success: true,
      })}
      columns={[
        { title: "Phòng ban", dataIndex: ["department", "name"] },
        { title: "Từ", render: (_, r) => fmtDateTime(r.startedAt) },
        {
          title: "Đến",
          render: (_, r) => (r.endedAt ? fmtDateTime(r.endedAt) : "Hiện tại"),
        },
      ]}
    />
  );
}

export function EmployeesTable() {
  const actionRef = useRef<ActionType>(null);
  const run = useAction();
  const [editing, setEditing] = useState<Employee | null | undefined>();
  const [viewing, setViewing] = useState<Employee>();

  const columns: ProColumns<Employee>[] = [
    { title: "Từ khóa", dataIndex: "search", hideInTable: true },
    { title: "Mã NV", dataIndex: "employeeCode", sorter: true, search: false },
    { title: "Họ tên", dataIndex: "fullName", sorter: true, search: false },
    {
      title: "Phòng ban",
      dataIndex: "departmentId",
      valueType: "select",
      request: departmentOptions,
      fieldProps: { showSearch: true },
      render: (_, r) => r.department?.name ?? "—",
    },
    { title: "Email", dataIndex: "email", search: false, ellipsis: true },
    {
      title: "Trạng thái",
      dataIndex: "status",
      valueType: "select",
      valueEnum: toValueEnum(EMPLOYEE_STATUS),
      render: (_, r) => <StatusTag kind="employee" status={r.status} />,
    },
    {
      title: "Thao tác",
      valueType: "option",
      width: 140,
      render: (_, row) => (
        <Space>
          <Button
            type="text"
            size="small"
            title="Thiết bị đang giữ"
            icon={<Laptop size={14} />}
            onClick={() => setViewing(row)}
          />
          <Button
            type="text"
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => setEditing(row)}
          />
          <Popconfirm
            title="Xóa nhân viên này?"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              const r = await run(() => employeeService.remove(row.id), "Đã xóa");
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
      <DataTable<Employee>
        actionRef={actionRef}
        columns={columns}
        request={tableRequest(employeeService.list)}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setEditing(null)}
          >
            Thêm nhân viên
          </Button>,
        ]}
      />
      <ModalForm<EmployeeInput>
        title={editing ? "Sửa nhân viên" : "Thêm nhân viên"}
        width={480}
        open={editing !== undefined}
        initialValues={
          editing
            ? {
                ...editing,
                departmentId: editing.departmentId ?? undefined,
                email: editing.email ?? undefined,
              }
            : { status: "active" }
        }
        modalProps={{ destroyOnHidden: true, onCancel: () => setEditing(undefined) }}
        onOpenChange={(open) => !open && setEditing(undefined)}
        onFinish={async (values) => {
          const body = { ...values, departmentId: values.departmentId ?? null };
          const r = await run(
            () =>
              editing
                ? employeeService.update(editing.id, body)
                : employeeService.create(body),
            "Đã lưu",
          );
          if (r.ok) actionRef.current?.reload();
          return r.ok;
        }}
      >
        <ProFormText
          name="employeeCode"
          label="Mã nhân viên"
          rules={[{ required: true, message: "Nhập mã nhân viên" }]}
        />
        <ProFormText
          name="fullName"
          label="Họ tên"
          rules={[{ required: true, message: "Nhập họ tên" }]}
        />
        <ProFormSelect
          name="departmentId"
          label="Phòng ban"
          request={departmentOptions}
          showSearch
          allowClear
        />
        <ProFormText
          name="email"
          label="Email"
          rules={[{ type: "email", message: "Email không hợp lệ" }]}
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          valueEnum={toValueEnum(EMPLOYEE_STATUS)}
          allowClear={false}
        />
      </ModalForm>
      <EmployeeDrawer employee={viewing} onClose={() => setViewing(undefined)} />
    </>
  );
}
