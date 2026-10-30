"use client";

import { Descriptions, Drawer, Empty, Skeleton, Tabs, Timeline } from "antd";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusTag } from "@/components/StatusTag";
import { describeEvent, eventLabel } from "@/lib/events";
import {
  fmtCapacity,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  pcComponentLabel,
} from "@/lib/format";
import { tableRequest } from "@/lib/table";
import { assetService } from "@/services/assets";
import { historyService } from "@/services/history";
import type { Asset, AssetEvent, AssignmentItem } from "@/types";

function AssetInfo({ asset }: { asset: Asset }) {
  const holder = asset.assignmentItems?.[0]?.batch.employee;
  const pc = asset.pcConfiguration;
  return (
    <>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Mã tài sản">{asset.assetTag}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <StatusTag status={asset.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Danh mục">{asset.category?.name}</Descriptions.Item>
        <Descriptions.Item label="Model">
          {[asset.model?.manufacturer, asset.model?.modelName]
            .filter(Boolean)
            .join(" ") || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Serial">{asset.serialNumber ?? "—"}</Descriptions.Item>
        <Descriptions.Item label="Vị trí">{asset.location?.name ?? "—"}</Descriptions.Item>
        <Descriptions.Item label="Người đang giữ" span={2}>
          {holder ? `${holder.fullName} (${holder.employeeCode})` : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày mua">{fmtDate(asset.purchaseDate)}</Descriptions.Item>
        <Descriptions.Item label="Hết bảo hành">
          {fmtDate(asset.warrantyExpiry)}
        </Descriptions.Item>
        <Descriptions.Item label="Giá mua" span={2}>
          {fmtMoney(asset.purchasePrice)}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú" span={2}>
          {asset.notes ?? "—"}
        </Descriptions.Item>
      </Descriptions>
      {pc && (
        <Descriptions
          title="Cấu hình PC"
          style={{ marginTop: 24 }}
          column={2}
          size="small"
          bordered
        >
          <Descriptions.Item label="CPU">{pc.cpu ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="GPU">{pc.gpu ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="RAM">
            {pc.ramComponent
              ? pcComponentLabel(pc.ramComponent)
              : fmtCapacity(pc.ramGb)}
          </Descriptions.Item>
          <Descriptions.Item label="Mainboard">{pc.mainboard ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Ổ lưu trữ" span={2}>
            {pc.storageDevices.length
              ? pc.storageDevices
                  .map(
                    (s) =>
                      (s.component
                        ? pcComponentLabel(s.component)
                        : `${s.storageType} ${fmtCapacity(s.capacityGb)}`) +
                      (s.label ? ` (${s.label})` : ""),
                  )
                  .join(" · ")
              : "—"}
          </Descriptions.Item>
        </Descriptions>
      )}
    </>
  );
}

function AssetTimeline({ assetId }: { assetId: string }) {
  const [events, setEvents] = useState<AssetEvent[]>();
  useEffect(() => {
    let active = true;
    historyService
      .events({ assetId, pageSize: 100 })
      .then((r) => active && setEvents(r.data))
      .catch(() => active && setEvents([]));
    return () => {
      active = false;
    };
  }, [assetId]);

  if (!events) return <Skeleton active />;
  if (!events.length) return <Empty description="Chưa có lịch sử" />;
  return (
    <Timeline
      items={events.map((e) => ({
        title: fmtDateTime(e.createdAt),
        content: (
          <>
            <strong>{eventLabel(e.eventType)}</strong>
            <div>{describeEvent(e)}</div>
            {e.actor && <small>Thực hiện: {e.actor.fullName}</small>}
          </>
        ),
      }))}
    />
  );
}

function AssetUsage({ assetId }: { assetId: string }) {
  return (
    <DataTable<AssignmentItem>
      search={false}
      options={false}
      request={tableRequest(historyService.assignments, { assetId })}
      columns={[
        { title: "Phiếu", dataIndex: ["batch", "code"] },
        {
          title: "Nhân viên",
          render: (_, r) => r.batch.employee.fullName,
        },
        { title: "Từ", render: (_, r) => fmtDateTime(r.batch.assignedAt) },
        {
          title: "Đến",
          render: (_, r) => (r.returnedAt ? fmtDateTime(r.returnedAt) : "Đang dùng"),
        },
      ]}
    />
  );
}

export function AssetDrawer({
  assetId,
  onClose,
}: {
  assetId?: string;
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState<Asset>();
  // Only trust the fetched asset if it belongs to the id being shown.
  const asset = loaded?.id === assetId ? loaded : undefined;

  useEffect(() => {
    if (!assetId) return;
    let active = true;
    assetService
      .get(assetId)
      .then((a) => active && setLoaded(a))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [assetId]);

  return (
    <Drawer
      title={asset ? `Tài sản ${asset.assetTag}` : "Tài sản"}
      open={!!assetId}
      onClose={onClose}
      size={760}
      destroyOnHidden
    >
      {assetId && !asset ? (
        <Skeleton active />
      ) : (
        asset && (
          <Tabs
            items={[
              { key: "info", label: "Thông tin", children: <AssetInfo asset={asset} /> },
              {
                key: "timeline",
                label: "Lịch sử thay đổi",
                children: <AssetTimeline assetId={asset.id} />,
              },
              {
                key: "usage",
                label: "Lịch sử sử dụng",
                children: <AssetUsage assetId={asset.id} />,
              },
            ]}
          />
        )
      )}
    </Drawer>
  );
}
