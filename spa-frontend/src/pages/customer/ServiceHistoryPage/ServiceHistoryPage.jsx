import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Clock3,
  Tag,
  LogOut,
  Star,
  Users,
  Timer,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import "./ServiceHistoryPage.css"

function ServiceHistoryPage() {
  const navigate = useNavigate()

  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

  const profileData = {
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    fullName: "Nguyễn Thị Mai",
    email: "admin@gmail.com",
  }

  const historyAppointments = [
    {
      id: "#A1003",
      services: [
        {
          name: "Gội đầu dưỡng sinh",
          price: 250000,
          duration: 45,
        },
      ],
      date: "2026-04-10",
      time: "09:00",
      peopleCount: 1,
      status: "completed",
      reviewed: false,
    },
    {
      id: "#A1004",
      services: [
        {
          name: "Nail Art Cao Cấp",
          price: 350000,
          duration: 60,
        },
        {
          name: "Massage body đá nóng",
          price: 650000,
          duration: 60,
        },
      ],
      date: "2026-03-15",
      time: "16:00",
      peopleCount: 1,
      status: "completed",
      reviewed: true,
    },
    {
      id: "#A1005",
      services: [
        {
          name: "Trị liệu mụn chuẩn y khoa",
          price: 1200000,
          duration: 120,
        },
      ],
      date: "2026-04-20",
      time: "16:00",
      peopleCount: 2,
      status: "cancelled",
      cancelReason: "Thay đổi kế hoạch",
    },
  ]

  const appointmentCount = 3

  const statusMap = {
    completed: {
      label: "Đã hoàn thành",
      className: "history-status-completed",
    },
    cancelled: {
      label: "Đã huỷ",
      className: "history-status-cancelled",
    },
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫"
  }

  const getAppointmentTotalPrice = (appointment) => {
    const serviceTotal = appointment.services.reduce((sum, service) => {
      return sum + Number(service.price || 0)
    }, 0)

    return serviceTotal * Number(appointment.peopleCount || 1)
  }

  const getAppointmentTotalDuration = (appointment) => {
    return appointment.services.reduce((sum, service) => {
      return sum + Number(service.duration || 0)
    }, 0)
  }

  const completedHistory = useMemo(() => {
    return historyAppointments.filter((item) =>
      ["completed", "cancelled"].includes(item.status)
    )
  }, [])

  const handleLogout = () => {
    setShowLogoutPopup(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setShowLogoutPopup(false)
    navigate("/trang-chu")
  }

  const cancelLogout = () => {
    setShowLogoutPopup(false)
  }

  return (
    <div className="service-history-page">
      <Header />

      <main className="service-history-main">
        <div className="service-history-container">
          <AccountSidebar
            activeMenu="history"
            profileData={profileData}
            appointmentCount={appointmentCount}
            onLogout={handleLogout}
          />

          <section className="service-history-content">
            <h2 className="service-history-title">Lịch sử dịch vụ</h2>

            {completedHistory.length === 0 ? (
              <div className="service-history-empty">
                <p>Bạn chưa có lịch sử dịch vụ nào.</p>
              </div>
            ) : (
              <div className="service-history-list">
                {completedHistory.map((appointment) => {
                  const statusInfo = statusMap[appointment.status]

                  return (
                    <div className="history-card" key={appointment.id}>
                      <div className="history-card-top">
                        <div>
                          <p className="history-code">
                            Mã LH: {appointment.id}
                          </p>

                          <div className="history-services">
                            {appointment.services.map((service, index) => (
                              <div className="history-service-line" key={index}>
                                <h3>{service.name}</h3>

                                <span>
                                  {service.duration} phút ·{" "}
                                  {formatPrice(service.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <span
                          className={`history-status ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="history-info-grid">
                        <div className="history-info-item">
                          <CalendarDays size={18} />
                          <span>{appointment.date}</span>
                        </div>

                        <div className="history-info-item">
                          <Clock3 size={18} />
                          <span>{appointment.time}</span>
                        </div>

                        <div className="history-info-item">
                          <Tag size={18} />
                          <span>
                            {formatPrice(getAppointmentTotalPrice(appointment))}
                          </span>
                        </div>
                      </div>

                      <div className="history-extra-info">
                        <span>
                          <Users size={16} />
                          Số lượng người:{" "}
                          <strong>{appointment.peopleCount} người</strong>
                        </span>

                        <span>
                          <Timer size={16} />
                          Tổng thời lượng:{" "}
                          <strong>
                            {getAppointmentTotalDuration(appointment)} phút
                          </strong>
                        </span>
                      </div>

                      {appointment.cancelReason && (
                        <div className="history-cancel-reason">
                          <strong>Lý do huỷ:</strong>{" "}
                          {appointment.cancelReason}
                        </div>
                      )}

                      {appointment.status === "completed" && (
                        <div className="history-action-row">
                          {appointment.reviewed ? (
                            <button
                              type="button"
                              className="history-reviewed-btn"
                              disabled
                            >
                              Đã đánh giá
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="history-review-btn"
                              onClick={() => alert("Mở popup đánh giá dịch vụ")}
                            >
                              <Star size={18} />
                              Đánh giá dịch vụ
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <FloatingChat />

      {showLogoutPopup && (
        <div className="logout-popup-overlay">
          <div className="logout-popup">
            <div className="logout-popup-icon">
              <LogOut size={34} />
            </div>

            <h3>Xác nhận đăng xuất</h3>

            <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại không?</p>

            <div className="logout-popup-actions">
              <button
                type="button"
                className="logout-popup-btn logout-popup-btn-cancel"
                onClick={cancelLogout}
              >
                Hủy
              </button>

              <button
                type="button"
                className="logout-popup-btn logout-popup-btn-confirm"
                onClick={confirmLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceHistoryPage