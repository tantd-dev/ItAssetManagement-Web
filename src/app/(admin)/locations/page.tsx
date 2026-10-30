"use client";

import { PageContainer } from "@ant-design/pro-components";
import { CodeNameTable } from "@/components/CodeNameTable";
import { locationService } from "@/services/catalog";

export default function LocationsPage() {
  return (
    <PageContainer title="Vị trí lưu trữ" subTitle="Kho, phòng, tầng nơi đặt tài sản">
      <CodeNameTable service={locationService} entity="vị trí" />
    </PageContainer>
  );
}
