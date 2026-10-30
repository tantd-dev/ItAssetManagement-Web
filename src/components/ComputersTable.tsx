"use client";

import { type ActionType, type ProColumns } from "@ant-design/pro-components";
import { Badge, Button, Input, Select, Space, Tag, Typography } from "antd";
import { Download } from "lucide-react";
import { useRef, useState } from "react";
import { AssetDrawer } from "@/components/AssetDrawer";
import { DataTable } from "@/components/DataTable";
import { DeviceTag } from "@/components/DeviceTag";
import { EmployeePopover } from "@/components/EmployeePopover";
import { useAction } from "@/hooks/useAction";
import { downloadCsv } from "@/lib/csv";
import { ASSET_STATUS } from "@/lib/constants";
import { fmtCapacity } from "@/lib/format";
import { tableRequest } from "@/lib/table";
import { computerService } from "@/services/computers";
import type {
  AssetStatus,
  ComputerRow,
  PcComponent,
  PcStorageDevice,
} from "@/types";

const STATUS_BADGE: Record<
  AssetStatus,
  "success" | "default" | "error" | "warning"
> = {
  assigned: "success",
  available: "default",
  maintenance: "warning",
  broken: "error",
  retired: "default",
};

const TAG_COLORS = [
  "blue",
  "green",
  "gold",
  "purple",
  "cyan",
  "magenta",
  "geekblue",
  "volcano",
  "lime",
  "orange",
];

/** Same text always gets the same color, so equal parts read alike. */
function colorOf(text: string) {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

/** Short part name: the catalog name, falling back to the stored snapshot. */
const partName = (part?: PcComponent | null, snapshot?: string | null) =>
  part?.name ?? snapshot ?? null;

const isHdd = (s: PcStorageDevice) =>
  /hdd|sshd/i.test(s.component?.storageType ?? s.storageType);

const capacities = (devices: PcStorageDevice[]) =>
  devices.map((d) => fmtCapacity(d.component?.capacityGb ?? d.capacityGb)).join(" + ");

const storageOf = (row: ComputerRow) => {
  const devices = row.pcConfiguration?.storageDevices ?? [];
  return {
    ssd: capacities(devices.filter((d) => !isHdd(d))),
    hdd: capacities(devices.filter(isHdd)),
  };
};

const ramOf = (row: ComputerRow) => {
  const gb = row.pcConfiguration?.ramGb;
  return gb ? fmtCapacity(gb) : "";
};

function PartTag({ text, colored }: { text?: string | null; colored?: boolean }) {
  if (!text) return null;
  return (
    <Tag color={colored ? colorOf(text) : undefined} bordered={false}>
      {text}
    </Tag>
  );
}

export function ComputersTable() {
  const actionRef = useRef<ActionType>(null);
  const run = useAction();
  const [search, setSearch] = useState<string>();
  const [status, setStatus] = useState<AssetStatus>();
  const [viewId, setViewId] = useState<string>();
  const [exporting, setExporting] = useState(false);

  const exportCsv = async () => {
    setExporting(true);
    const r = await run(() => computerService.listAll({ search, status }));
    setExporting(false);
    if (!r.ok) return;
    downloadCsv(
      `may-tinh-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Máy",
        "Chip",
        "GPU",
        "RAM",
        "SSD",
        "HDD",
        "Main",
        "Màn hình",
        "Thiết bị khác",
        "Trạng thái",
        "Người dùng",
        "Vị trí",
      ],
      r.data.map((row) => {
        const pc = row.pcConfiguration;
        const { ssd, hdd } = storageOf(row);
        return [
          row.assetTag,
          partName(pc?.cpuComponent, pc?.cpu),
          partName(pc?.gpuComponent, pc?.gpu),
          ramOf(row),
          ssd,
          hdd,
          partName(pc?.mainboardComponent, pc?.mainboard),
          row.monitors.map((m) => m.assetTag).join(" | "),
          row.otherDevices
            .map((d) => `${d.category?.name ?? ""} ${d.assetTag}`.trim())
            .join(" | "),
          ASSET_STATUS[row.status]?.label ?? row.status,
          row.holder?.fullName ?? "",
          row.location?.name ?? "",
        ];
      }),
    );
  };

  const columns: ProColumns<ComputerRow>[] = [
    {
      title: "Máy",
      dataIndex: "assetTag",
      sorter: true,
      fixed: "left",
      render: (_, r) => (
        <Typography.Link strong onClick={() => setViewId(r.id)}>
          {r.assetTag}
        </Typography.Link>
      ),
    },
    {
      title: "Chip",
      render: (_, r) => (
        <PartTag
          colored
          text={partName(r.pcConfiguration?.cpuComponent, r.pcConfiguration?.cpu)}
        />
      ),
    },
    {
      title: "GPU",
      render: (_, r) => (
        <PartTag
          colored
          text={partName(r.pcConfiguration?.gpuComponent, r.pcConfiguration?.gpu)}
        />
      ),
    },
    {
      title: "RAM",
      dataIndex: "ramGb",
      sorter: true,
      render: (_, r) => <PartTag text={ramOf(r)} />,
    },
    { title: "SSD", render: (_, r) => <PartTag text={storageOf(r).ssd} /> },
    { title: "HDD", render: (_, r) => <PartTag text={storageOf(r).hdd} /> },
    {
      title: "Main",
      render: (_, r) =>
        partName(
          r.pcConfiguration?.mainboardComponent,
          r.pcConfiguration?.mainboard,
        ) ?? "",
    },
    {
      title: "Màn hình",
      render: (_, r) =>
        r.monitors.map((m) => (
          <DeviceTag key={m.id} asset={m} onOpen={setViewId} />
        )),
    },
    {
      title: "Thiết bị khác",
      render: (_, r) =>
        r.otherDevices.map((d) => (
          <DeviceTag
            key={d.id}
            asset={d}
            label={`${d.category?.name ?? ""} ${d.assetTag}`.trim()}
            onOpen={setViewId}
          />
        )),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      sorter: true,
      render: (_, r) => (
        <Badge
          status={STATUS_BADGE[r.status]}
          text={ASSET_STATUS[r.status]?.label ?? r.status}
        />
      ),
    },
    {
      title: "Người dùng",
      render: (_, r) =>
        r.holder ? (
          <EmployeePopover
            employee={r.holder}
            since={r.assignedAt}
            devices={r.holderDevices}
          >
            {r.holder.fullName}
          </EmployeePopover>
        ) : (
          <Typography.Text type="secondary">Chưa cấp</Typography.Text>
        ),
    },
    { title: "Vị trí", render: (_, r) => r.location?.name ?? "" },
  ];

  return (
    <>
      <DataTable<ComputerRow>
        actionRef={actionRef}
        size="small"
        search={false}
        columns={columns}
        params={{ search, status }}
        request={tableRequest(computerService.list)}
        options={{ density: false, setting: false, reload: true }}
        headerTitle={
          <Input.Search
            allowClear
            placeholder="Tìm mã máy, chip, GPU, main, người dùng, vị trí…"
            style={{ width: 380 }}
            onSearch={(v) => setSearch(v || undefined)}
          />
        }
        toolBarRender={() => [
          <Space key="tools">
            <Select<AssetStatus>
              allowClear
              placeholder="Mọi trạng thái"
              style={{ width: 170 }}
              value={status}
              onChange={setStatus}
              options={(Object.keys(ASSET_STATUS) as AssetStatus[]).map((s) => ({
                value: s,
                label: ASSET_STATUS[s].label,
              }))}
            />
            <Button
              icon={<Download size={14} />}
              loading={exporting}
              onClick={() => void exportCsv()}
            >
              Xuất CSV
            </Button>
          </Space>,
        ]}
      />
      <AssetDrawer assetId={viewId} onClose={() => setViewId(undefined)} />
    </>
  );
}
