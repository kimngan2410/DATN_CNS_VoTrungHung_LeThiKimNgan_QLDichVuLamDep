import React, { useCallback, useEffect, useState } from "react";
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

import { logoutStaff } from "../../services/authApi";
import { getStaffNotificationCountsApi } from "../../services/staffNotificationApi";

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
    badgeKey: "appointments",
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
    badgeKey: "conversations",
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
  const [notificationCounts, setNotificationCounts] = useState({
    appointments: 0,
    conversations: 0,
  });

  const fetchNotificationCounts = useCallback(async () => {
    try {
      const counts = await getStaffNotificationCountsApi();

      setNotificationCounts({
        appointments: Number(counts.appointments || 0),
        conversations: Number(counts.conversations || 0),
      });
    } catch (error) {
      console.error("Không thể tải số thông báo:", error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotificationCounts();

    // Tự cập nhật mỗi 10 giây
    const intervalId = setInterval(() => {
      fetchNotificationCounts();
    }, 10000);

    // Khi tab được mở lại thì cập nhật ngay
    const handleFocus = () => {
      fetchNotificationCounts();
    };

    // Khi trang lịch hẹn hoặc hội thoại bắn event refresh thì cập nhật ngay
    const handleRefreshEvent = () => {
      fetchNotificationCounts();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("staff-notifications-refresh", handleRefreshEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "staff-notifications-refresh",
        handleRefreshEvent
      );
    };
  }, [fetchNotificationCounts]);

  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLogout = () => {
    logoutStaff();

    localStorage.removeItem("staffRememberMe");
    localStorage.removeItem("staffRememberedEmail");

    setIsLogoutModalOpen(false);

    navigate("/staff/dang-nhap", {
      replace: true,
    });
  };

  const renderBadge = (badgeKey) => {
    if (!badgeKey) return null;

    const value = Number(notificationCounts[badgeKey] || 0);

    if (value <= 0) return null;

    return (
      <span className="staff-menu-badge">
        {value > 99 ? "99+" : value}
      </span>
    );
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
                <span className="staff-menu-label">{item.label}</span>
                {renderBadge(item.badgeKey)}
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
            <span className="staff-menu-label">Cài đặt</span>
          </NavLink>

          <button
            type="button"
            className="staff-menu-item staff-logout"
            onClick={handleOpenLogoutModal}
          >
            <LogOut size={18} />
            <span className="staff-menu-label">Đăng xuất</span>
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