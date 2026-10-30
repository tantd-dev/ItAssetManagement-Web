"use client";

import { PageContainer, StatisticCard } from "@ant-design/pro-components";
import {
  Alert,
  Card,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Skeleton,
  Table,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { StatusTag } from "@/components/StatusTag";
import { ASSET_STATUS } from "@/lib/constants";
import { describeEvent, eventLabel } from "@/lib/events";
import { errorMessage } from "@/lib/api";
import { fmtDateTime, fmtMoney } from "@/lib/format";
import { dashboardService } from "@/services/history";
import type { AssetStatus, DashboardSummary } from "@/types";

const STATUS_COLORS: Record<AssetStatus, string> = {
  available: "#52c41a",
  assigned: "#1677ff",
  maintenance: "#fa8c16",
  broken: "#f5222d",
  retired: "#bfbfbf",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    dashboardService
      .summary()
      .then(setData)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) {
    return (
      <PageContainer title="Tổng quan">
        <Alert type="error" showIcon message={error} />
      </PageContainer>
    );
  }
  if (!data) {
    return (
      <PageContainer title="Tổng quan">
        <Skeleton active />
      </PageContainer>
    );
  }

  const { totals } = data;
  const maxMonthly = Math.max(
    1,
    ...data.monthlyActivity.flatMap((m) => [m.assigned, m.returned]),
  );
  const stat = (title: string, value: number, color?: string) => (
    <StatisticCard
      statistic={{ title, value, valueStyle: color ? { color } : undefined }}
    />
  );

  return (
    <PageContainer title="Tổng quan tài sản CNTT">
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8} xl={4}>{stat("Tổng thiết bị", totals.total)}</Col>
        <Col xs={12} md={8} xl={4}>{stat("Đang sử dụng", totals.assigned, STATUS_COLORS.assigned)}</Col>
        <Col xs={12} md={8} xl={4}>{stat("Tồn kho", totals.available, STATUS_COLORS.available)}</Col>
        <Col xs={12} md={8} xl={4}>{stat("Đang bảo trì", totals.maintenance, STATUS_COLORS.maintenance)}</Col>
        <Col xs={12} md={8} xl={4}>{stat("Hỏng", totals.broken, STATUS_COLORS.broken)}</Col>
        <Col xs={12} md={8} xl={4}>{stat("Nhân viên", totals.activeEmployees)}</Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Phân bổ theo trạng thái" style={{ height: "100%" }}>
            {(Object.keys(ASSET_STATUS) as AssetStatus[]).map((s) => (
              <div key={s} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{ASSET_STATUS[s].label}</span>
                  <strong>{data.byStatus[s]}</strong>
                </div>
                <Progress
                  percent={totals.total ? (data.byStatus[s] / totals.total) * 100 : 0}
                  showInfo={false}
                  strokeColor={STATUS_COLORS[s]}
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Cấp phát / thu hồi 6 tháng gần nhất" style={{ height: "100%" }}>
            {data.monthlyActivity.map((m) => (
              <div key={m.month} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12 }}>{m.month}</div>
                <Progress
                  percent={(m.assigned / maxMonthly) * 100}
                  format={() => `Cấp ${m.assigned}`}
                  size="small"
                  strokeColor={STATUS_COLORS.assigned}
                />
                <Progress
                  percent={(m.returned / maxMonthly) * 100}
                  format={() => `Thu ${m.returned}`}
                  size="small"
                  strokeColor={STATUS_COLORS.available}
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Cần chú ý" style={{ height: "100%" }}>
            <List
              dataSource={[
                { label: "Bảo hành hết hạn trong 30 ngày", value: totals.warrantyExpiringSoon, color: "orange" },
                { label: "Đã hết bảo hành", value: totals.warrantyExpired, color: "red" },
                { label: "Phiếu bảo trì đang mở", value: totals.openMaintenance, color: "blue" },
                { label: "Chi phí bảo trì năm nay", value: fmtMoney(totals.maintenanceCostYear), color: "default" },
                { label: "Đã thanh lý", value: totals.retired, color: "default" },
              ]}
              renderItem={(i) => (
                <List.Item>
                  <span>{i.label}</span>
                  <Tag color={i.color}>{i.value}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Theo danh mục thiết bị">
            <Table
              size="small"
              rowKey="name"
              pagination={false}
              dataSource={data.byCategory}
              locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
              columns={[
                { title: "Danh mục", dataIndex: "name" },
                { title: "Tổng", dataIndex: "total", align: "right" },
                { title: "Đang dùng", dataIndex: "assigned", align: "right" },
                { title: "Tồn kho", dataIndex: "available", align: "right" },
                { title: "Hỏng", dataIndex: "broken", align: "right" },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Thiết bị đang dùng theo phòng ban">
            <Table
              size="small"
              rowKey="name"
              pagination={false}
              dataSource={data.assignedByDepartment}
              locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
              columns={[
                { title: "Phòng ban", dataIndex: "name" },
                { title: "Số thiết bị", dataIndex: "total", align: "right" },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Hoạt động gần đây">
            <List
              dataSource={data.recentEvents}
              locale={{ emptyText: <Empty description="Chưa có hoạt động" /> }}
              renderItem={(e) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <>
                        <Tag>{eventLabel(e.eventType)}</Tag>
                        {e.asset.assetTag}
                      </>
                    }
                    description={describeEvent(e)}
                  />
                  <small>{fmtDateTime(e.createdAt)}</small>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Bảo trì sắp tới / đang thực hiện">
            <List
              dataSource={data.upcomingMaintenance}
              locale={{ emptyText: <Empty description="Không có" /> }}
              renderItem={(m) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${m.asset.assetTag} · ${m.maintenanceType}`}
                    description={fmtDateTime(m.performedAt)}
                  />
                  <StatusTag kind="maintenance" status={m.status} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
