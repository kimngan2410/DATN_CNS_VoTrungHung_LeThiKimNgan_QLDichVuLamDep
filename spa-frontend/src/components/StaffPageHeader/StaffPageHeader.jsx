import React from "react";
import { Search, Bell, UserRound } from "lucide-react";
import "./StaffPageHeader.css";

function StaffPageHeader({
  title,
  searchPlaceholder = "Tìm kiếm nhanh...",
  searchValue = "",
  onSearchChange,
  staffName = "Lễ tân 01",
  shiftLabel = "Ca sáng",
}) {
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
            <UserRound size={18} />
          </div>

          <div>
            <strong>{staffName}</strong>
            <p>{shiftLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default StaffPageHeader;