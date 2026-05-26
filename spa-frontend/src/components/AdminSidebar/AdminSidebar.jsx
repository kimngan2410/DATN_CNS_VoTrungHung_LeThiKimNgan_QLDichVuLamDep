import React, { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  UsersRound,
  Layers,
  WandSparkles,
  UserRound,
  Star,
  ShieldCheck,
  BarChart3,
  ChevronDown,
  ReceiptText,
  CircleDollarSign,
  ClipboardList,
  CalendarCheck,
  Settings,
  LogOut,
} from "lucide-react"
import "./AdminSidebar.css"
import spaLogo from "../../assets/images/logo_header.png";
import { logoutAdmin } from "../../services/authApi"


const menuItems = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/admin/tong-quan",
  },
  {
    label: "Khách hàng",
    icon: UsersRound,
    path: "/admin/khach-hang",
  },
  {
    label: "Danh mục dịch vụ",
    icon: Layers,
    path: "/admin/danh-muc-dich-vu",
  },
  {
    label: "Dịch vụ",
    icon: WandSparkles,
    path: "/admin/dich-vu",
  },
  {
    label: "Nhân viên",
    icon: UserRound,
    path: "/admin/nhan-vien",
  },
  {
    label: "Đánh giá dịch vụ",
    icon: Star,
    path: "/admin/danh-gia-dich-vu",
  },
  {
    label: "Tài khoản",
    icon: ShieldCheck,
    path: "/admin/tai-khoan",
  },
]

const reportItems = [
  {
    label: "Báo cáo doanh thu",
    icon: CircleDollarSign,
    path: "/admin/bao-cao/doanh-thu",
  },
  {
    label: "Giao dịch hoá đơn",
    icon: ReceiptText,
    path: "/admin/bao-cao/hoa-don",
  },
  {
    label: "Tình hình sử dụng dịch vụ",
    icon: ClipboardList,
    path: "/admin/bao-cao/tinh-hinh-su-dung-dich-vu",
  },
  {
    label: "Báo cáo lịch hẹn",
    icon: CalendarCheck,
    path: "/admin/bao-cao/lich-hen",
  },
]

function AdminSidebar() {
  const location = useLocation()
  const isReportActive = location.pathname.startsWith("/admin/bao-cao")
  const [isReportOpen, setIsReportOpen] = useState(false)

  const shouldShowReportMenu = isReportOpen || isReportActive

  const navigate = useNavigate()

  const handleLogout = () => {
    logoutAdmin()
    navigate("/admin/dang-nhap", { replace: true })
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <img
          src={spaLogo}
          alt="Serenity Spa Logo"
          className="admin-brand-image"
        />
      </div>

      <nav className="admin-sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "admin-sidebar-item active" : "admin-sidebar-item"
              }
            >
              <Icon size={21} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}

        <div className="admin-sidebar-report-group">
          <button
            type="button"
            className={
              isReportActive
                ? "admin-sidebar-item admin-sidebar-report-toggle active"
                : "admin-sidebar-item admin-sidebar-report-toggle"
            }
            onClick={() => setIsReportOpen((prev) => !prev)}
          >
            <BarChart3 size={21} strokeWidth={2} />
            <span>Báo cáo</span>

            <ChevronDown
              size={17}
              className={
                shouldShowReportMenu
                  ? "admin-report-chevron open"
                  : "admin-report-chevron"
              }
            />
          </button>

          {shouldShowReportMenu && (
            <div className="admin-sidebar-submenu">
              {reportItems.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? "admin-sidebar-subitem active"
                        : "admin-sidebar-subitem"
                    }
                  >
                    <Icon size={17} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="admin-sidebar-footer">
        <NavLink
          to="/admin/cai-dat"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-footer-item active"
              : "admin-sidebar-footer-item"
          }
        >
          <Settings size={19} />
          <span>Cài đặt</span>
        </NavLink>

        <button
          type="button"
          className="admin-sidebar-footer-item admin-sidebar-logout-item"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar