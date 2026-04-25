import { Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/customer/HomePage/HomePage"
import LoginPage from "./pages/auth/LoginPage/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage/RegisterPage"
import ServiceListPage from "./pages/customer/ServiceListPage/ServiceListPage"
import ServiceDetailPage from "./pages/customer/ServiceDetailPage/ServiceDetailPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trang-chu" replace />} />
      <Route path="/trang-chu" element={<HomePage />} />
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/dang-ky" element={<RegisterPage/>} />
      <Route path="/dich-vu" element={<ServiceListPage/>} />
      <Route path="/dich-vu/:slug" element={<ServiceDetailPage/>} />
    </Routes>
  )
}

export default App