"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import type { ReactNode } from "react";
import { AntdRegistry } from "./AntdRegistry";

dayjs.locale("vi");

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: "#2563eb",
            borderRadius: 8,
            fontFamily: "var(--font-sans), system-ui, sans-serif",
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
