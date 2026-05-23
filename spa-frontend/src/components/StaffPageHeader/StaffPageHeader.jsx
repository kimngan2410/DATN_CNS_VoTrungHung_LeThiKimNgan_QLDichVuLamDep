import React, { useEffect, useMemo, useState } from "react"
import { Search, Bell, UserRound } from "lucide-react"
import { getCurrentStaffUser } from "../../services/authApi"
import "./StaffPageHeader.css"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ORIGIN = API_BASE_URL.replace("/api/v1", "")

function getFullAvatarUrl(avatar) {
  if (!avatar) return ""

  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("blob:") ||
    avatar.startsWith("data:")
  ) {
    return avatar
  }

  if (avatar.startsWith("/uploads")) {
    return `${API_ORIGIN}${avatar}`
  }

  return avatar
}

function StaffPageHeader({
  title,
  searchPlaceholder = "Tìm kiếm nhanh...",
  searchValue = "",
  onSearchChange,
  staffName,
}) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentStaffUser())

  useEffect(() => {
    const syncStaffUser = () => {
      setCurrentUser(getCurrentStaffUser())
    }

    window.addEventListener("staff-auth-changed", syncStaffUser)
    window.addEventListener("storage", syncStaffUser)

    return () => {
      window.removeEventListener("staff-auth-changed", syncStaffUser)
      window.removeEventListener("storage", syncStaffUser)
    }
  }, [])

  const displayName = useMemo(() => {
    if (staffName) return staffName

    if (currentUser?.hoTen) return currentUser.hoTen

    if (currentUser?.email) {
      return currentUser.email.split("@")[0]
    }

    return "Nhân viên lễ tân"
  }, [currentUser, staffName])

  const staffRole = currentUser?.chucVu || "Lễ tân"
  const avatarUrl = getFullAvatarUrl(currentUser?.avatar)

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
  )
}

export default StaffPageHeader