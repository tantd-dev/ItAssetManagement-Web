"use client";

import { ProLayout } from "@ant-design/pro-components";
import {
  ArrowLeftRight,
  Boxes,
  Computer,
  Cpu,
  History,
  LayoutDashboard,
  MapPin,
  Package,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const icon = (Icon: typeof Package) => <Icon size={16} />;

const ROUTES = [
  { path: "/", name: "Tổng quan", icon: icon(LayoutDashboard) },
  { path: "/assets", name: "Tài sản", icon: icon(Package) },
  { path: "/computers", name: "Máy tính", icon: icon(Computer) },
  { path: "/catalog", name: "Danh mục & Model", icon: icon(Boxes) },
  { path: "/pc-components", name: "Linh kiện PC", icon: icon(Cpu) },
  { path: "/employees", name: "Nhân viên & Phòng ban", icon: icon(Users) },
  { path: "/locations", name: "Vị trí", icon: icon(MapPin) },
  { path: "/assignments", name: "Cấp phát", icon: icon(ArrowLeftRight) },
  { path: "/maintenance", name: "Bảo trì", icon: icon(Wrench) },
  { path: "/history", name: "Lịch sử", icon: icon(History) },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ProLayout
      title="IT Asset Manager"
      logo={<Package size={28} color="#2563eb" />}
      layout="mix"
      fixSiderbar
      fixedHeader
      location={{ pathname }}
      route={{ path: "/", routes: ROUTES }}
      menuItemRender={(item, dom) => (
        <Link href={item.path ?? "/"}>{dom}</Link>
      )}
      menuFooterRender={(props) =>
        props?.collapsed ? null : (
          <div style={{ padding: 12, fontSize: 12, opacity: 0.6 }}>
            Quản lý tài sản CNTT
          </div>
        )
      }
    >
      {children}
    </ProLayout>
  );
}
