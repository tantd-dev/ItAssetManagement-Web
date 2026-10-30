"use client";

import { PageContainer } from "@ant-design/pro-components";
import { ComputersTable } from "@/components/ComputersTable";

export default function ComputersPage() {
  return (
    <PageContainer
      title="Máy tính"
      subTitle="Tổng hợp cấu hình, người dùng và thiết bị đi kèm của từng máy"
    >
      <ComputersTable />
    </PageContainer>
  );
}
