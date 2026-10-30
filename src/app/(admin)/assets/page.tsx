"use client";

import { PageContainer } from "@ant-design/pro-components";
import { AssetsTable } from "@/components/AssetsTable";

export default function AssetsPage() {
  return (
    <PageContainer
      title="Quản lý tài sản"
      subTitle="PC, Laptop, Monitor và các thiết bị/phụ kiện"
    >
      <AssetsTable />
    </PageContainer>
  );
}
