import { Routes, Route, Navigate } from "react-router-dom"

/* CUSTOMER */
import HomePage from "./pages/customer/HomePage/HomePage"
import LoginPage from "./pages/auth/LoginPage/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage/RegisterPage"
import ServiceListPage from "./pages/customer/ServiceListPage/ServiceListPage"
import ServiceDetailPage from "./pages/customer/ServiceDetailPage/ServiceDetailPage"
import BookingPage from "./pages/customer/BookingPage/BookingPage"
import AccountProfilePage from "./pages/customer/AccountProfilePage/AccountProfilePage"
import MyAppointmentsPage from "./pages/customer/MyAppointmentsPage/MyAppointmentsPage"
import ServiceHistoryPage from "./pages/customer/ServiceHistoryPage/ServiceHistoryPage"

/* STAFF */
import StaffLayout from "./components/StaffLayout/StaffLayout"
import StaffOverview from "./pages/staff/StaffOverview/StaffOverview"
import StaffAppointments from "./pages/staff/StaffAppointments/StaffAppointments"
import StaffTransactions from "./pages/staff/StaffTransactions/StaffTransactions"
import StaffConversations from "./pages/staff/StaffConversations/StaffConversations"
import StaffCustomersList from "./pages/staff/StaffCustomersList/StaffCustomersList"
import StaffSettings from "./pages/staff/StaffSettings/StaffSettings"

/* ADMIN */
import AdminLayout from "./components/AdminLayout/AdminLayout"
import AdminOverview from "./pages/admin/AdminOverview/AdminOverview"
import AdminCustomersList from "./pages/admin/AdminCustomersList/AdminCustomersList"
import AdminServiceCategories from "./pages/admin/AdminServiceCategories/AdminServiceCategories"
import AdminServices from "./pages/admin/AdminServices/AdminServices"
import AdminEmployeeList from "./pages/admin/AdminEmployeeList/AdminEmployeeList"
import AdminReviews from "./pages/admin/AdminReviews/AdminReviews"
import AdminAccounts from "./pages/admin/AdminAccounts/AdminAccounts"
import RevenueReport from "./pages/admin/reports/RevenueReport/RevenueReport"
import InvoiceReport from "./pages/admin/reports/InvoiceReport/InvoiceReport"
import ServiceUsageReport from "./pages/admin/reports/ServiceUsageReport/ServiceUsageReport";
import AppointmentReport from "./pages/admin/reports/AppointmentReport/AppointmentReport";
import ChangePasswordPage from "./pages/customer/ChangePasswordPage/ChangePasswordPage"

function App() {
  return (
    <Routes>
      {/* CUSTOMER ROUTES */}
      <Route path="/" element={<Navigate to="/trang-chu" replace />} />
      <Route path="/trang-chu" element={<HomePage />} />
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/dang-ky" element={<RegisterPage />} />
      <Route path="/dich-vu" element={<ServiceListPage />} />
      <Route path="/dich-vu/:slug" element={<ServiceDetailPage />} />
      <Route path="/dat-lich" element={<BookingPage />} />
      <Route path="/tai-khoan" element={<AccountProfilePage />} />
      <Route path="/lich-hen-cua-toi" element={<MyAppointmentsPage />} />
      <Route path="/lich-su-dich-vu" element={<ServiceHistoryPage />} />
      <Route path="/doi-mat-khau" element={<ChangePasswordPage />} />

      {/* STAFF ROUTES */}
      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<Navigate to="/staff/tong-quan" replace />} />
        <Route path="tong-quan" element={<StaffOverview />} />
        <Route path="lich-hen" element={<StaffAppointments />} />
        <Route path="giao-dich" element={<StaffTransactions />} />
        <Route path="hoi-thoai" element={<StaffConversations />} />
        <Route path="khach-hang" element={<StaffCustomersList />} />
        <Route path="cai-dat" element={<StaffSettings />} />
      </Route>

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/tong-quan" replace />} />
        <Route path="tong-quan" element={<AdminOverview />} />
        <Route path="khach-hang" element={<AdminCustomersList />} />
        <Route path="danh-muc-dich-vu" element={<AdminServiceCategories />} />
        <Route path="dich-vu" element={<AdminServices />} />
        <Route path="nhan-vien" element={<AdminEmployeeList />} />
        <Route path="danh-gia-dich-vu" element={<AdminReviews />} />
        <Route path="tai-khoan" element={<AdminAccounts />} />
        <Route path="bao-cao/doanh-thu" element={<RevenueReport />} />
        <Route path="bao-cao/hoa-don" element={<InvoiceReport />} />
        <Route path="bao-cao/tinh-hinh-su-dung-dich-vu" element={<ServiceUsageReport />} />
        <Route path="bao-cao/lich-hen" element={<AppointmentReport />} />
      </Route>

      {/* NOT FOUND */}
      <Route path="*" element={<Navigate to="/trang-chu" replace />} />
    </Routes>
  )
}

export default App