"use client";

import { ProTable, type ProTableProps } from "@ant-design/pro-components";
import { App } from "antd";
import { errorMessage } from "@/lib/api";

/** ProTable with the project's defaults (id row key, paging, error toast). */
export function DataTable<
  // ProTable itself constrains rows to Record<string, any>.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends Record<string, any> = Record<string, any>,
>(props: ProTableProps<T, P>) {
  const { message } = App.useApp();
  return (
    <ProTable<T, P>
      rowKey="id"
      search={{ labelWidth: "auto", defaultCollapsed: false }}
      options={{ density: false, setting: false }}
      pagination={{ defaultPageSize: 20, showSizeChanger: true }}
      scroll={{ x: "max-content" }}
      dateFormatter="string"
      onRequestError={(e) => message.error(errorMessage(e))}
      {...props}
    />
  );
}
