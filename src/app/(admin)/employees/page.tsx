"use client";

import { PageContainer } from "@ant-design/pro-components";
import { Card, Tabs } from "antd";
import { CodeNameTable } from "@/components/CodeNameTable";
import { EmployeesTable } from "@/components/EmployeesTable";
import { departmentService } from "@/services/catalog";

export default function EmployeesPage() {
  return (
    <PageContainer title="Nhân viên & Phòng ban">
      <Card>
        <Tabs
          items={[
            { key: "employees", label: "Nhân viên", children: <EmployeesTable /> },
            {
              key: "departments",
              label: "Phòng ban",
              children: (
                <CodeNameTable service={departmentService} entity="phòng ban" />
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
