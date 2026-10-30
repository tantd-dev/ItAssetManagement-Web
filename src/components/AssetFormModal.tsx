"use client";

import {
  ModalForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAction } from "@/hooks/useAction";
import { ASSET_STATUS } from "@/lib/constants";
import { assetService, type AssetInput } from "@/services/assets";
import {
  categoryOptions,
  locationOptions,
  modelOptions,
} from "@/services/options";
import type { Asset } from "@/types";

type FormValues = Omit<AssetInput, "pcConfiguration"> & {
  hasPc?: boolean;
  pc?: {
    cpu?: string;
    gpu?: string;
    ramGb?: number;
    mainboard?: string;
    storageDevices?: { storageType: string; capacityGb: number; label?: string }[];
  };
};

const MANUAL_STATUSES = (["available", "maintenance", "broken", "retired"] as const).map(
  (s) => ({ value: s, label: ASSET_STATUS[s].label }),
);

const toInitial = (asset: Asset): Partial<FormValues> => ({
  assetTag: asset.assetTag,
  categoryId: asset.categoryId,
  modelId: asset.modelId ?? undefined,
  locationId: asset.locationId ?? undefined,
  serialNumber: asset.serialNumber ?? undefined,
  purchaseDate: asset.purchaseDate ? (dayjs(asset.purchaseDate) as never) : undefined,
  warrantyExpiry: asset.warrantyExpiry
    ? (dayjs(asset.warrantyExpiry) as never)
    : undefined,
  purchasePrice: asset.purchasePrice ?? undefined,
  notes: asset.notes ?? undefined,
  hasPc: !!asset.pcConfiguration,
  pc: asset.pcConfiguration
    ? {
        cpu: asset.pcConfiguration.cpu ?? undefined,
        gpu: asset.pcConfiguration.gpu ?? undefined,
        ramGb: asset.pcConfiguration.ramGb ?? undefined,
        mainboard: asset.pcConfiguration.mainboard ?? undefined,
        storageDevices: asset.pcConfiguration.storageDevices.map((s) => ({
          storageType: s.storageType,
          capacityGb: s.capacityGb,
          label: s.label ?? undefined,
        })),
      }
    : undefined,
});

export function AssetFormModal({
  open,
  asset,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Asset (with pcConfiguration loaded) to edit; null to create. */
  asset: Asset | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const run = useAction();

  return (
    <ModalForm<FormValues>
      title={asset ? `Sửa tài sản ${asset.assetTag}` : "Thêm tài sản"}
      width={720}
      open={open}
      initialValues={asset ? toInitial(asset) : { status: "available" }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onOpenChange={(o) => !o && onClose()}
      grid
      rowProps={{ gutter: 16 }}
      onFinish={async ({ hasPc, pc, ...values }) => {
        const body: AssetInput = {
          ...values,
          modelId: values.modelId ?? null,
          locationId: values.locationId ?? null,
          serialNumber: values.serialNumber || null,
          purchaseDate: values.purchaseDate || null,
          warrantyExpiry: values.warrantyExpiry || null,
          purchasePrice: values.purchasePrice ?? null,
          notes: values.notes || null,
        };
        const pcBody = hasPc ? pc : undefined;
        const r = await run(async () => {
          if (!asset) {
            return assetService.create({ ...body, pcConfiguration: pcBody ?? undefined });
          }
          const update = { ...body };
          delete update.status;
          await assetService.update(asset.id, update);
          if (pcBody) await assetService.setPcConfiguration(asset.id, pcBody);
        }, "Đã lưu tài sản");
        if (r.ok) onSaved();
        return r.ok;
      }}
    >
      <ProFormText
        name="assetTag"
        label="Mã tài sản"
        colProps={{ span: 12 }}
        rules={[{ required: true, message: "Nhập mã tài sản" }]}
      />
      <ProFormText name="serialNumber" label="Số serial" colProps={{ span: 12 }} />
      <ProFormSelect
        name="categoryId"
        label="Danh mục"
        colProps={{ span: 12 }}
        request={categoryOptions}
        showSearch
        rules={[{ required: true, message: "Chọn danh mục" }]}
      />
      <ProFormDependency name={["categoryId"]}>
        {({ categoryId }) => (
          <ProFormSelect
            name="modelId"
            label="Model"
            colProps={{ span: 12 }}
            params={{ categoryId }}
            request={modelOptions}
            showSearch
            allowClear
          />
        )}
      </ProFormDependency>
      <ProFormSelect
        name="locationId"
        label="Vị trí"
        colProps={{ span: 12 }}
        request={locationOptions}
        showSearch
        allowClear
      />
      {!asset && (
        <ProFormSelect
          name="status"
          label="Trạng thái ban đầu"
          colProps={{ span: 12 }}
          options={MANUAL_STATUSES}
          allowClear={false}
        />
      )}
      <ProFormDatePicker name="purchaseDate" label="Ngày mua" colProps={{ span: 8 }} />
      <ProFormDatePicker
        name="warrantyExpiry"
        label="Hết hạn bảo hành"
        colProps={{ span: 8 }}
      />
      <ProFormDigit
        name="purchasePrice"
        label="Giá mua (VND)"
        colProps={{ span: 8 }}
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormTextArea name="notes" label="Ghi chú" colProps={{ span: 24 }} />
      <ProFormSwitch
        name="hasPc"
        label="Có cấu hình phần cứng (PC/Laptop)"
        colProps={{ span: 24 }}
      />
      <ProFormDependency name={["hasPc"]}>
        {({ hasPc }) =>
          hasPc ? (
            <ProFormGroup colProps={{ span: 24 }} title="Cấu hình PC">
              <ProFormText name={["pc", "cpu"]} label="CPU" colProps={{ span: 12 }} />
              <ProFormText name={["pc", "gpu"]} label="GPU" colProps={{ span: 12 }} />
              <ProFormDigit
                name={["pc", "ramGb"]}
                label="RAM (GB)"
                colProps={{ span: 12 }}
                min={0}
              />
              <ProFormText
                name={["pc", "mainboard"]}
                label="Mainboard"
                colProps={{ span: 12 }}
              />
              <ProFormList
                name={["pc", "storageDevices"]}
                label="Ổ lưu trữ"
                creatorButtonProps={{ creatorButtonText: "Thêm ổ lưu trữ" }}
                copyIconProps={false}
              >
                <ProFormGroup key="storage">
                  <ProFormText
                    name="storageType"
                    label="Loại"
                    placeholder="SSD, HDD, NVMe…"
                    width="xs"
                    rules={[{ required: true }]}
                  />
                  <ProFormDigit
                    name="capacityGb"
                    label="Dung lượng (GB)"
                    min={1}
                    width="xs"
                    rules={[{ required: true }]}
                  />
                  <ProFormText name="label" label="Nhãn" width="xs" />
                </ProFormGroup>
              </ProFormList>
            </ProFormGroup>
          ) : null
        }
      </ProFormDependency>
    </ModalForm>
  );
}
