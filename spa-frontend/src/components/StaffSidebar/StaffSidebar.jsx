import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  BadgeDollarSign,
  MessageSquare,
  UsersRound,
  Settings,
  LogOut,
} from "lucide-react";
import "./StaffSidebar.css";
import spaLogo from "../../assets/images/logo_footer.png";

const menuItems = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/staff/tong-quan",
  },
  {
    label: "Lịch hẹn",
    icon: CalendarDays,
    path: "/staff/lich-hen",
  },
  {
    label: "Giao dịch",
    icon: BadgeDollarSign,
    path: "/staff/giao-dich",
  },
  {
    label: "Hội thoại",
    icon: MessageSquare,
    path: "/staff/hoi-thoai",
  },
  {
    label: "Khách hàng",
    icon: UsersRound,
    path: "/staff/khach-hang",
  },
];

function StaffSidebar() {
  return (
    <aside className="staff-sidebar">
      <div className="staff-brand">
        <img src={spaLogo} alt="Serenity Spa Logo" className="staff-brand-image" />
      </div>

      <nav className="staff-sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "staff-menu-item active" : "staff-menu-item"
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="staff-sidebar-footer">
        <NavLink to="/staff/cai-dat" className="staff-menu-item">
          <Settings size={18} />
          <span>Cài đặt</span>
        </NavLink>

        <button type="button" className="staff-menu-item staff-logout">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

export default StaffSidebar;