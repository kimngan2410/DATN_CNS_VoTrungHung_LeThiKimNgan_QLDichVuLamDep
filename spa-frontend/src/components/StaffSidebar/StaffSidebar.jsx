import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  BadgeDollarSign,
  MessageSquare,
  UsersRound,
  Settings,
  LogOut,
  X,
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
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    setIsLogoutModalOpen(false);

    navigate("/dang-nhap", {
      replace: true,
    });
  };

  return (
    <>
      <aside className="staff-sidebar">
        <div className="staff-brand">
          <img
            src={spaLogo}
            alt="Serenity Spa Logo"
            className="staff-brand-image"
          />
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
          <NavLink
            to="/staff/cai-dat"
            className={({ isActive }) =>
              isActive ? "staff-menu-item active" : "staff-menu-item"
            }
          >
            <Settings size={18} />
            <span>Cài đặt</span>
          </NavLink>

          <button
            type="button"
            className="staff-menu-item staff-logout"
            onClick={handleOpenLogoutModal}
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {isLogoutModalOpen && (
        <div
          className="staff-logout-modal-overlay"
          onClick={handleCloseLogoutModal}
        >
          <div
            className="staff-logout-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-logout-modal-header">
              <div className="staff-logout-icon">
                <LogOut size={22} />
              </div>

              <button
                type="button"
                className="staff-logout-close-btn"
                onClick={handleCloseLogoutModal}
              >
                <X size={19} />
              </button>
            </div>

            <div className="staff-logout-modal-body">
              <h2>Xác nhận đăng xuất</h2>
              <p>
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản nhân viên lễ tân
                không?
              </p>
            </div>

            <div className="staff-logout-modal-actions">
              <button
                type="button"
                className="staff-logout-cancel-btn"
                onClick={handleCloseLogoutModal}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="staff-logout-confirm-btn"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StaffSidebar;