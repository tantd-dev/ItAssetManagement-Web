"use client";

import {
  ModalForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { Divider } from "antd";
import dayjs from "dayjs";
import { Cpu } from "lucide-react";
import { useState } from "react";
import { useAction } from "@/hooks/useAction";
import { ASSET_STATUS } from "@/lib/constants";
import {
  assetService,
  type AssetInput,
  type PcConfigurationInput,
} from "@/services/assets";
import {
  categoryOptions,
  locationOptions,
  modelOptions,
  pcComponentOptions,
} from "@/services/options";
import type { Asset } from "@/types";

type FormValues = Omit<AssetInput, "pcConfiguration"> & {
  pc?: PcConfigurationInput;
};

const MANUAL_STATUSES = (
  ["available", "maintenance", "broken", "retired"] as const
).map((s) => ({ value: s, label: ASSET_STATUS[s].label }));

// Loaders are created once so ProFormSelect does not refetch on every render.
const cpuOptions = pcComponentOptions("cpu");
const gpuOptions = pcComponentOptions("gpu");
const ramOptions = pcComponentOptions("ram");
const mainboardOptions = pcComponentOptions("mainboard");
const storageOptions = pcComponentOptions("storage");

const toInitial = (asset: Asset): Partial<FormValues> => {
  const pc = asset.pcConfiguration;
  return {
    assetTag: asset.assetTag,
    categoryId: asset.categoryId,
    modelId: asset.modelId ?? undefined,
    locationId: asset.locationId ?? undefined,
    serialNumber: asset.serialNumber ?? undefined,
    purchaseDate: asset.purchaseDate
      ? (dayjs(asset.purchaseDate) as never)
      : undefined,
    warrantyExpiry: asset.warrantyExpiry
      ? (dayjs(asset.warrantyExpiry) as never)
      : undefined,
    purchasePrice: asset.purchasePrice ?? undefined,
    notes: asset.notes ?? undefined,
    pc: pc
      ? {
          cpuId: pc.cpuId ?? undefined,
          gpuId: pc.gpuId ?? undefined,
          ramId: pc.ramId ?? undefined,
          mainboardId: pc.mainboardId ?? undefined,
          storageDevices: pc.storageDevices
            .filter((s) => s.componentId)
            .map((s) => ({
              componentId: s.componentId!,
              label: s.label ?? undefined,
            })),
        }
      : undefined,
  };
};

export function AssetFormModal({
  open,
  asset,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Asset (with category and pcConfiguration loaded) to edit; null to create. */
  asset: Asset | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const run = useAction();
  // Whether the chosen category carries a PC configuration.
  const [isPc, setIsPc] = useState(!!asset?.category?.hasPcConfig);
  const [prevAsset, setPrevAsset] = useState(asset);
  if (asset !== prevAsset) {
    setPrevAsset(asset);
    setIsPc(!!asset?.category?.hasPcConfig);
  }

  return (
    <ModalForm<FormValues>
      title={asset ? `Sửa tài sản ${asset.assetTag}` : "Thêm tài sản"}
      width={760}
      open={open}
      initialValues={asset ? toInitial(asset) : { status: "available" }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onOpenChange={(o) => !o && onClose()}
      grid
      rowProps={{ gutter: 16 }}
      onFinish={async ({ pc, ...values }) => {
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
        const pcBody: PcConfigurationInput | undefined = isPc
          ? {
              cpuId: pc?.cpuId ?? null,
              gpuId: pc?.gpuId ?? null,
              ramId: pc?.ramId ?? null,
              mainboardId: pc?.mainboardId ?? null,
              storageDevices: (pc?.storageDevices ?? []).filter(
                (s) => s?.componentId,
              ),
            }
          : undefined;
        const r = await run(async () => {
          if (!asset) {
            return assetService.create({ ...body, pcConfiguration: pcBody });
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
      <ProFormText
        name="serialNumber"
        label="Số serial"
        colProps={{ span: 12 }}
      />
      <ProFormSelect
        name="categoryId"
        label="Danh mục"
        colProps={{ span: 12 }}
        request={categoryOptions}
        showSearch
        rules={[{ required: true, message: "Chọn danh mục" }]}
        fieldProps={{
          onChange: (_: unknown, option: unknown) =>
            setIsPc(
              !!(option as { hasPcConfig?: boolean } | undefined)?.hasPcConfig,
            ),
        }}
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
      <ProFormDatePicker
        name="purchaseDate"
        label="Ngày mua"
        colProps={{ span: 8 }}
      />
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

      {isPc && (
        <>
          <Divider titlePlacement="start" style={{ margin: "4px 0 16px" }}>
            <Cpu size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Cấu hình PC
          </Divider>
          <ProFormSelect
            name={["pc", "cpuId"]}
            label="CPU"
            colProps={{ span: 12 }}
            request={cpuOptions}
            showSearch
            allowClear
          />
          <ProFormSelect
            name={["pc", "gpuId"]}
            label="GPU"
            colProps={{ span: 12 }}
            request={gpuOptions}
            showSearch
            allowClear
          />
          <ProFormSelect
            name={["pc", "ramId"]}
            label="RAM"
            colProps={{ span: 12 }}
            request={ramOptions}
            showSearch
            allowClear
          />
          <ProFormSelect
            name={["pc", "mainboardId"]}
            label="Mainboard"
            colProps={{ span: 12 }}
            request={mainboardOptions}
            showSearch
            allowClear
          />
          <ProFormList
            name={["pc", "storageDevices"]}
            label="Ổ lưu trữ"
            colProps={{ span: 24 }}
            creatorButtonProps={{ creatorButtonText: "Thêm ổ lưu trữ" }}
            copyIconProps={false}
          >
            <ProFormGroup key="storage">
              <ProFormSelect
                name="componentId"
                placeholder="Chọn ổ (SSD, HDD…)"
                width="md"
                request={storageOptions}
                showSearch
                rules={[{ required: true, message: "Chọn ổ lưu trữ" }]}
              />
              <ProFormText
                name="label"
                placeholder="Nhãn (C:, Data…)"
                width="xs"
              />
            </ProFormGroup>
          </ProFormList>
        </>
      )}
    </ModalForm>
  );
}
