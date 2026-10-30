"use client";

import { PageContainer } from "@ant-design/pro-components";
import { Card, Tabs } from "antd";
import { CodeNameTable } from "@/components/CodeNameTable";
import { ModelsTable } from "@/components/ModelsTable";
import { categoryService } from "@/services/catalog";

export default function CatalogPage() {
  return (
    <PageContainer title="Danh mục, thương hiệu & Model">
      <Card>
        <Tabs
          items={[
            {
              key: "models",
              label: "Model & thương hiệu",
              children: <ModelsTable />,
            },
            {
              key: "categories",
              label: "Danh mục thiết bị",
              children: (
                <CodeNameTable service={categoryService} entity="danh mục" />
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
