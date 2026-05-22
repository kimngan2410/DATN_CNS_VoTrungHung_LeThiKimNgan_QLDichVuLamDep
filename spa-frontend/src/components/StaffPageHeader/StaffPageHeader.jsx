import React, { useMemo } from "react";
import { Search, Bell, UserRound } from "lucide-react";
import { getCurrentUser } from "../../services/authApi";
import "./StaffPageHeader.css";

function StaffPageHeader({
  title,
  searchPlaceholder = "Tìm kiếm nhanh...",
  searchValue = "",
  onSearchChange,
  staffName,
}) {
  const currentUser = getCurrentUser();

  const displayName = useMemo(() => {
    if (staffName) return staffName;

    if (currentUser?.hoTen) return currentUser.hoTen;

    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }

    return "Nhân viên lễ tân";
  }, [currentUser, staffName]);

  const staffRole = currentUser?.chucVu || "Lễ tân";
  const avatarUrl = currentUser?.avatar || "";

  return (
    <header className="staff-page-header">
      <h1>{title}</h1>

      <div className="staff-page-header-actions">
        <div className="staff-page-header-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>

        <button type="button" className="staff-page-header-bell-btn">
          <Bell size={18} />
          <span></span>
        </button>

        <div className="staff-page-header-divider"></div>

        <div className="staff-page-header-user-info">
          <div className="staff-page-header-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} />
            ) : (
              <UserRound size={18} />
            )}
          </div>

          <div>
            <strong>{displayName}</strong>
            <p>{staffRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default StaffPageHeader;