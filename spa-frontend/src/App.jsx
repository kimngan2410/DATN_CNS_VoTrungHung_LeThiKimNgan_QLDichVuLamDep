import { Routes, Route, Navigate } from "react-router-dom"

/*CUSTOMER*/
import HomePage from "./pages/customer/HomePage/HomePage"
import LoginPage from "./pages/auth/LoginPage/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage/RegisterPage"
import ServiceListPage from "./pages/customer/ServiceListPage/ServiceListPage"
import ServiceDetailPage from "./pages/customer/ServiceDetailPage/ServiceDetailPage"
import BookingPage from "./pages/customer/BookingPage/BookingPage"
import AccountProfilePage from "./pages/customer/AccountProfilePage/AccountProfilePage"
import MyAppointmentsPage from "./pages/customer/MyAppointmentsPage/MyAppointmentsPage"
import ServiceHistoryPage from "./pages/customer/ServiceHistoryPage/ServiceHistoryPage"


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trang-chu" replace />} />
      <Route path="/trang-chu" element={<HomePage />} />
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/dang-ky" element={<RegisterPage/>} />
      <Route path="/dich-vu" element={<ServiceListPage/>} />
      <Route path="/dich-vu/:slug" element={<ServiceDetailPage/>} />
      <Route path="/dat-lich" element={<BookingPage />} />
      <Route path="/tai-khoan" element={<AccountProfilePage />} />
      <Route path="/lich-hen-cua-toi" element={<MyAppointmentsPage />} />
      <Route path="/lich-su-dich-vu" element={<ServiceHistoryPage />} />
    </Routes>
  )
}

export default App