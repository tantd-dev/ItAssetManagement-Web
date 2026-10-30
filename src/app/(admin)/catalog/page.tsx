"use client";

import { PageContainer, ProFormSwitch } from "@ant-design/pro-components";
import { Card, Tabs, Tag } from "antd";
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
                <CodeNameTable
                  service={categoryService}
                  entity="danh mục"
                  extraColumns={[
                    {
                      title: "Cấu hình PC",
                      dataIndex: "hasPcConfig",
                      search: false,
                      render: (_, r) =>
                        r.hasPcConfig ? <Tag color="blue">Có</Tag> : "—",
                    },
                    {
                      title: "Màn hình",
                      dataIndex: "isDisplay",
                      search: false,
                      render: (_, r) =>
                        r.isDisplay ? <Tag color="purple">Có</Tag> : "—",
                    },
                  ]}
                  extraFields={
                    <>
                      <ProFormSwitch
                        name="hasPcConfig"
                        label="Tài sản thuộc danh mục này có cấu hình PC"
                        tooltip="Bật cho PC, Laptop, Workstation… để form tài sản hiện phần chọn CPU, RAM, ổ lưu trữ"
                      />
                      <ProFormSwitch
                        name="isDisplay"
                        label="Danh mục màn hình"
                        tooltip="Thiết bị thuộc danh mục này hiện ở cột Màn hình của trang Máy tính; các danh mục khác hiện ở cột Thiết bị khác"
                      />
                    </>
                  }
                />
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
