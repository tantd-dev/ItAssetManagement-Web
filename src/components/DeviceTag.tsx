"use client";

import { Button, Descriptions, Popover, Tag } from "antd";
import { Eye } from "lucide-react";
import { StatusTag } from "@/components/StatusTag";
import { fmtDate, fmtMoney } from "@/lib/format";
import type { Asset } from "@/types";

function DeviceDetails({ asset }: { asset: Asset }) {
  const specs = Object.entries(asset.model?.specifications ?? {});
  return (
    <Descriptions column={1} size="small" style={{ width: 300 }}>
      <Descriptions.Item label="Danh mục">
        {asset.category?.name ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Hãng">
        {asset.model?.manufacturer ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Model">
        {asset.model?.modelName ?? "—"}
      </Descriptions.Item>
      {specs.map(([key, value]) => (
        <Descriptions.Item key={key} label={key}>
          {String(value)}
        </Descriptions.Item>
      ))}
      <Descriptions.Item label="Serial">
        {asset.serialNumber ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Trạng thái">
        <StatusTag status={asset.status} />
      </Descriptions.Item>
      <Descriptions.Item label="Vị trí">
        {asset.location?.name ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày mua">
        {fmtDate(asset.purchaseDate)}
      </Descriptions.Item>
      <Descriptions.Item label="Hết bảo hành">
        {fmtDate(asset.warrantyExpiry)}
      </Descriptions.Item>
      <Descriptions.Item label="Giá mua">
        {fmtMoney(asset.purchasePrice)}
      </Descriptions.Item>
    </Descriptions>
  );
}

/**
 * Compact tag for a device; hovering or clicking shows its details, with a
 * link to the full asset drawer.
 */
export function DeviceTag({
  asset,
  label = asset.assetTag,
  onOpen,
}: {
  asset: Asset;
  label?: string;
  onOpen?: (assetId: string) => void;
}) {
  return (
    <Popover
      trigger={["hover", "click"]}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>{asset.assetTag}</span>
          {onOpen && (
            <Button
              type="link"
              size="small"
              icon={<Eye size={14} />}
              onClick={() => onOpen(asset.id)}
            >
              Xem chi tiết
            </Button>
          )}
        </div>
      }
      content={<DeviceDetails asset={asset} />}
    >
      <Tag style={{ cursor: "pointer", marginInlineEnd: 4 }}>{label}</Tag>
    </Popover>
  );
}
