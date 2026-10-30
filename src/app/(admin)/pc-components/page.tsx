"use client";

import { PageContainer } from "@ant-design/pro-components";
import { Card, Tabs } from "antd";
import { PcComponentsTable } from "@/components/PcComponentsTable";
import { PC_COMPONENT_TYPES } from "@/lib/constants";
import type { PcComponentType } from "@/types";

export default function PcComponentsPage() {
  return (
    <PageContainer
      title="Linh kiện PC"
      subTitle="Danh mục CPU, GPU, RAM, mainboard, ổ lưu trữ dùng khi cấu hình tài sản"
    >
      <Card>
        <Tabs
          destroyOnHidden
          items={(Object.keys(PC_COMPONENT_TYPES) as PcComponentType[]).map(
            (type) => ({
              key: type,
              label: PC_COMPONENT_TYPES[type],
              children: <PcComponentsTable type={type} />,
            }),
          )}
        />
      </Card>
    </PageContainer>
  );
}
