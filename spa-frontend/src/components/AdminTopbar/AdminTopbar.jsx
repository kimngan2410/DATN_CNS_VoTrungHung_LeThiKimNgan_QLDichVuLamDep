import React, { useEffect, useState } from "react"
import { Bell, Search } from "lucide-react"
import { getCurrentAdminUser } from "../../services/authApi"
import "./AdminTopbar.css"

function AdminTopbar({ title = "Tổng quan" }) {
  const [currentAdmin, setCurrentAdmin] = useState(getCurrentAdminUser())

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentAdmin(getCurrentAdminUser())
    }

    window.addEventListener("admin-auth-changed", handleAuthChange)
    window.addEventListener("storage", handleAuthChange)

    return () => {
      window.removeEventListener("admin-auth-changed", handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [])

  const displayName = currentAdmin?.hoTen || "Admin"
  const roleText = currentAdmin?.chucVu || "Quản trị viên"
  const avatar = currentAdmin?.avatar
  const avatarText = displayName.charAt(0).toUpperCase()

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <h1>{title}</h1>
      </div>

      <div className="admin-topbar-actions">
        <div className="admin-search-box">
          <Search size={19} />
          <input type="text" placeholder="Tìm kiếm nhanh..." />
        </div>

        <button type="button" className="admin-bell-btn">
          <Bell size={21} />
          <span className="admin-bell-dot"></span>
        </button>

        <div className="admin-topbar-profile">
          <div className="admin-topbar-avatar">
            {avatar ? (
              <img src={avatar} alt={displayName} />
            ) : (
              <span>{avatarText}</span>
            )}
          </div>

          <div className="admin-topbar-profile-info">
            <strong>{displayName}</strong>
            <span>{roleText}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminTopbar