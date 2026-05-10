import React, { useMemo } from "react"
import { Outlet, useLocation } from "react-router-dom"
import AdminSidebar from "../AdminSidebar/AdminSidebar"
import AdminTopbar from "../AdminTopbar/AdminTopbar"
import "./AdminLayout.css"

const titleMap = {
  "/admin/tong-quan": "Tổng quan",
  "/admin/khach-hang": "Khách hàng",
  "/admin/danh-muc-dich-vu": "Danh mục dịch vụ",
  "/admin/dich-vu": "Dịch vụ",
  "/admin/nhan-vien": "Nhân viên",
  "/admin/danh-gia-dich-vu": "Đánh giá dịch vụ",
  "/admin/tai-khoan": "Tài khoản",
}

function AdminLayout() {
  const location = useLocation()

  const pageTitle = useMemo(() => {
    return titleMap[location.pathname] || "Quản trị hệ thống"
  }, [location.pathname])

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminTopbar title={pageTitle} />
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout