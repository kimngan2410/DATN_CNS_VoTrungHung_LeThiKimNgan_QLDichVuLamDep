import React from "react"
import { Bell, Search } from "lucide-react"
import "./AdminTopbar.css"

function AdminTopbar({ title = "Tổng quan" }) {
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
      </div>
    </header>
  )
}

export default AdminTopbar