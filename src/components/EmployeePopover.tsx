"use client";

import { Descriptions, Flex, Popover, Tag, Typography } from "antd";
import type { ReactNode } from "react";
import { StatusTag } from "@/components/StatusTag";
import { fmtDateTime } from "@/lib/format";
import type { Asset, Employee } from "@/types";

/**
 * Wraps an employee's name; hovering shows their details and the devices
 * they currently hold.
 */
export function EmployeePopover({
  employee,
  devices = [],
  since,
  children,
}: {
  employee: Employee;
  /** Devices the employee currently holds. */
  devices?: Pick<Asset, "id" | "assetTag" | "category">[];
  /** When the employee received the device this popover is shown for. */
  since?: string | null;
  children: ReactNode;
}) {
  return (
    <Popover
      title={`${employee.fullName} (${employee.employeeCode})`}
      content={
        <Descriptions column={1} size="small" style={{ width: 320 }}>
          <Descriptions.Item label="Mã nhân viên">
            {employee.employeeCode}
          </Descriptions.Item>
          <Descriptions.Item label="Phòng ban">
            {employee.department?.name ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {employee.email ? (
              <Typography.Link href={`mailto:${employee.email}`}>
                {employee.email}
              </Typography.Link>
            ) : (
              "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <StatusTag kind="employee" status={employee.status} />
          </Descriptions.Item>
          {since !== undefined && (
            <Descriptions.Item label="Nhận máy lúc">
              {fmtDateTime(since)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={`Đang giữ (${devices.length})`}>
            <Flex wrap gap={4}>
              {devices.length
                ? devices.map((d) => (
                    <Tag key={d.id} bordered={false}>
                      {[d.category?.name, d.assetTag].filter(Boolean).join(" ")}
                    </Tag>
                  ))
                : "—"}
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      }
    >
      <span style={{ cursor: "help", borderBottom: "1px dashed currentColor" }}>
        {children}
      </span>
    </Popover>
  );
}
