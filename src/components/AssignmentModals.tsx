"use client";

import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAction } from "@/hooks/useAction";
import { RESULT_STATUS_OPTIONS } from "@/lib/constants";
import {
  assignmentService,
  type AssignInput,
  type ReturnInput,
  type TransferInput,
} from "@/services/assignments";
import { assetOptions, employeeOptions } from "@/services/options";

export type AssignmentMode = "assign" | "return" | "transfer";

interface Props {
  mode?: AssignmentMode;
  onClose: () => void;
  onDone: () => void;
}

const iso = (v?: string) => (v ? dayjs(v).toISOString() : undefined);
const activeEmployees = ({ keyWords }: { keyWords?: string }) =>
  employeeOptions({ keyWords, status: "active" });

const common = {
  width: 560,
  grid: true,
  rowProps: { gutter: 16 },
} as const;

function useClose({ onClose }: Props) {
  return {
    modalProps: { destroyOnHidden: true, onCancel: onClose },
    onOpenChange: (open: boolean) => !open && onClose(),
  };
}

export function AssignmentModals(props: Props) {
  const run = useAction();
  const close = useClose(props);
  const finish = async (fn: () => Promise<unknown>, msg: string) => {
    const r = await run(fn, msg);
    if (r.ok) props.onDone();
    return r.ok;
  };

  return (
    <>
      <ModalForm<AssignInput & { assignedAt?: string }>
        {...common}
        {...close}
        title="Cấp phát thiết bị"
        open={props.mode === "assign"}
        onFinish={(v) =>
          finish(
            () =>
              assignmentService.assign({ ...v, assignedAt: iso(v.assignedAt) }),
            "Đã cấp phát thiết bị",
          )
        }
      >
        <ProFormSelect
          name="employeeId"
          label="Nhân viên nhận"
          colProps={{ span: 24 }}
          request={activeEmployees}
          showSearch
          rules={[{ required: true, message: "Chọn nhân viên" }]}
        />
        <ProFormSelect
          name="assetIds"
          label="Thiết bị (đang tồn kho)"
          colProps={{ span: 24 }}
          mode="multiple"
          params={{ status: "available" }}
          request={assetOptions}
          showSearch
          rules={[{ required: true, message: "Chọn ít nhất một thiết bị" }]}
        />
        <ProFormSelect
          name="handoverBy"
          label="Người bàn giao"
          colProps={{ span: 12 }}
          request={activeEmployees}
          showSearch
          allowClear
        />
        <ProFormDateTimePicker
          name="assignedAt"
          label="Thời điểm cấp"
          colProps={{ span: 12 }}
        />
        <ProFormText
          name="conditionOut"
          label="Tình trạng khi cấp"
          colProps={{ span: 24 }}
          placeholder="Mới, tốt, trầy xước nhẹ…"
        />
        <ProFormTextArea name="note" label="Ghi chú" colProps={{ span: 24 }} />
      </ModalForm>

      <ModalForm<ReturnInput & { sourceEmployeeId?: string }>
        {...common}
        {...close}
        title="Thu hồi thiết bị"
        open={props.mode === "return"}
        initialValues={{ resultStatus: "available" }}
        onFinish={(v) =>
          finish(
            () =>
              assignmentService.returnAssets({
                assetIds: v.assetIds,
                receivedBy: v.receivedBy,
                conditionIn: v.conditionIn,
                resultStatus: v.resultStatus,
                returnedAt: iso(v.returnedAt),
              }),
            "Đã thu hồi thiết bị",
          )
        }
      >
        <ProFormSelect
          name="sourceEmployeeId"
          label="Lọc theo nhân viên đang giữ"
          colProps={{ span: 24 }}
          request={employeeOptions}
          showSearch
          allowClear
        />
        <ProFormDependency name={["sourceEmployeeId"]}>
          {({ sourceEmployeeId }) => (
            <ProFormSelect
              name="assetIds"
              label="Thiết bị cần thu hồi"
              colProps={{ span: 24 }}
              mode="multiple"
              params={{ status: "assigned", employeeId: sourceEmployeeId }}
              request={assetOptions}
              showSearch
              rules={[{ required: true, message: "Chọn ít nhất một thiết bị" }]}
            />
          )}
        </ProFormDependency>
        <ProFormSelect
          name="receivedBy"
          label="Người nhận lại"
          colProps={{ span: 12 }}
          request={activeEmployees}
          showSearch
          allowClear
        />
        <ProFormSelect
          name="resultStatus"
          label="Trạng thái sau thu hồi"
          colProps={{ span: 12 }}
          options={RESULT_STATUS_OPTIONS}
          allowClear={false}
        />
        <ProFormText
          name="conditionIn"
          label="Tình trạng khi thu hồi"
          colProps={{ span: 12 }}
        />
        <ProFormDateTimePicker
          name="returnedAt"
          label="Thời điểm thu hồi"
          colProps={{ span: 12 }}
        />
      </ModalForm>

      <ModalForm<TransferInput>
        {...common}
        {...close}
        title="Điều chuyển thiết bị"
        open={props.mode === "transfer"}
        onFinish={(v) =>
          finish(
            () =>
              assignmentService.transfer({
                ...v,
                transferredAt: iso(v.transferredAt),
              }),
            "Đã điều chuyển thiết bị",
          )
        }
      >
        <ProFormSelect
          name="fromEmployeeId"
          label="Từ nhân viên"
          colProps={{ span: 12 }}
          request={employeeOptions}
          showSearch
          rules={[{ required: true, message: "Chọn nhân viên nguồn" }]}
        />
        <ProFormSelect
          name="toEmployeeId"
          label="Đến nhân viên"
          colProps={{ span: 12 }}
          request={activeEmployees}
          showSearch
          rules={[{ required: true, message: "Chọn nhân viên nhận" }]}
        />
        <ProFormDependency name={["fromEmployeeId"]}>
          {({ fromEmployeeId }) => (
            <ProFormSelect
              name="assetIds"
              label="Thiết bị"
              colProps={{ span: 24 }}
              mode="multiple"
              disabled={!fromEmployeeId}
              params={{ status: "assigned", employeeId: fromEmployeeId }}
              request={assetOptions}
              showSearch
              rules={[{ required: true, message: "Chọn ít nhất một thiết bị" }]}
            />
          )}
        </ProFormDependency>
        <ProFormSelect
          name="handoverBy"
          label="Người thực hiện"
          colProps={{ span: 12 }}
          request={activeEmployees}
          showSearch
          allowClear
        />
        <ProFormDateTimePicker
          name="transferredAt"
          label="Thời điểm điều chuyển"
          colProps={{ span: 12 }}
        />
        <ProFormText
          name="conditionIn"
          label="Tình trạng thiết bị"
          colProps={{ span: 24 }}
        />
        <ProFormTextArea name="note" label="Ghi chú" colProps={{ span: 24 }} />
      </ModalForm>
    </>
  );
}
