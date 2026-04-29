import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, Clock3, LogOut, Users, X } from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import "./MyAppointmentsPage.css"

function MyAppointmentsPage() {
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([
    {
      id: "LH20250101",
      services: [
        {
          name: "Cắt tóc",
          price: 150000,
          duration: 35,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
        },
        {
          name: "Gội đầu dưỡng sinh",
          price: 120000,
          duration: 40,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",

        },
      ],
      date: "2025-05-02",
      time: "10:00",
      peopleCount: 1,
      status: "pending",
    },
    {
      id: "LH20250102",
      services: [
        {
          name: "Nhuộm tóc",
          price: 350000,
          duration: 120,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
        },
      ],
      date: "2025-05-03",
      time: "14:00",
      peopleCount: 1,
      status: "confirmed",
    },
    {
      id: "LH20250103",
      services: [
        {
          name: "Chăm sóc da mặt",
          price: 300000,
          duration: 75,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
        },
        {
          name: "Nail art",
          price: 150000,
          duration: 60,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
        },
      ],
      date: "2025-04-28",
      time: "09:00",
      peopleCount: 2,
      status: "checkedin",
    },
    {
      id: "LH20250104",
      services: [
        {
          name: "Cắt tóc",
          price: 120000,
          duration: 45,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
        },
        {
          name: "Nhuộm tóc",
          price: 350000,
          duration: 120,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
        },
        {
          name: "Gội đầu dưỡng sinh",
          price: 150000,
          duration: 45,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
        },
      ],
      date: "2025-04-20",
      time: "10:30",
      peopleCount: 1,
      status: "completed",
    },
    {
      id: "LH20250105",
      services: [
        {
          name: "Massage body đá nóng",
          price: 650000,
          duration: 60,
          image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
        },
      ],
      date: "2025-04-18",
      time: "15:00",
      peopleCount: 1,
      status: "cancelled",
    },
  ])

  const [activeStatus, setActiveStatus] = useState("all")
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)
  const [detailAppointment, setDetailAppointment] = useState(null)

  const profileData = {
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    fullName: "Nguyễn Thị Mai",
    email: "admin@gmail.com",
  }

  const statusTabs = [
    {
      value: "all",
      label: "Tất cả",
    },
    {
      value: "pending",
      label: "Chờ xác nhận",
    },
    {
      value: "confirmed",
      label: "Đã xác nhận",
    },
    {
      value: "checkedin",
      label: "Đã check-in",
    },
  ]

  const statusMap = {
    pending: {
      label: "Chờ xác nhận",
      className: "status-pending",
    },
    confirmed: {
      label: "Đã xác nhận",
      className: "status-confirmed",
    },
    checkedin: {
      label: "Đã check-in",
      className: "status-checkedin",
    },
    completed: {
      label: "Đã hoàn thành",
      className: "status-completed",
    },
    cancelled: {
      label: "Đã hủy",
      className: "status-cancelled",
    },
  }

  const activeAppointments = useMemo(() => {
    return appointments.filter((item) =>
      ["pending", "confirmed", "checkedin"].includes(item.status)
    )
  }, [appointments])

  const appointmentCount = useMemo(() => {
    return activeAppointments.length
  }, [activeAppointments])

  const filteredAppointments = useMemo(() => {
    if (activeStatus === "all") return activeAppointments

    return activeAppointments.filter((item) => item.status === activeStatus)
  }, [activeAppointments, activeStatus])

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ"
  }

  const formatVietnameseDate = (dateString) => {
    const date = new Date(dateString)

    const weekdays = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ]

    const weekday = weekdays[date.getDay()]
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    return `${weekday}, ${day}/${month}/${year}`
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

  const formatDurationText = (minutes) => {
    const total = Number(minutes || 0)
    const hours = Math.floor(total / 60)
    const mins = total % 60

    if (hours > 0 && mins > 0) return `${hours} giờ ${mins} phút`
    if (hours > 0) return `${hours} giờ`
    return `${mins} phút`
  }

  const getEndTime = (startTime, durationMinutes) => {
    const [hour, minute] = startTime.split(":").map(Number)

    const startDate = new Date()
    startDate.setHours(hour)
    startDate.setMinutes(minute)
    startDate.setSeconds(0)

    startDate.setMinutes(startDate.getMinutes() + durationMinutes)

    const endHour = String(startDate.getHours()).padStart(2, "0")
    const endMinute = String(startDate.getMinutes()).padStart(2, "0")

    return `${endHour}:${endMinute}`
  }

  const getTimeRange = (appointment) => {
    const totalDuration = getAppointmentTotalDuration(appointment)
    const endTime = getEndTime(appointment.time, totalDuration)

    return `${appointment.time} - ${endTime}`
  }

  const getServiceNames = (appointment) => {
    return appointment.services.map((service) => service.name).join(", ")
  }

  const getServiceNamesPreview = (appointment) => {
    const serviceNames = appointment.services.map((service) => service.name)

    if (serviceNames.length <= 2) {
      return serviceNames.join(", ")
    }

    return `${serviceNames.slice(0, 2).join(", ")}, ...`
  }

  const canUpdateAppointment = (status) => {
    return status === "pending" || status === "confirmed"
  }
  const handleCancelAppointment = (appointmentId) => {
    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")

    if (!confirmCancel) return

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointmentId
          ? {
              ...item,
              status: "cancelled",
            }
          : item
      )
    )

    setDetailAppointment(null)
  }

  const handleRescheduleAppointment = (appointment) => {
    alert(`Mở chức năng đổi lịch hẹn ${appointment.id}`)
  }

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
    <div className="my-appointments-page">
      <Header />

      <main className="my-appointments-main">
        <div className="my-appointments-container">
          <AccountSidebar
            activeMenu="appointments"
            profileData={profileData}
            appointmentCount={appointmentCount}
            onLogout={handleLogout}
          />

          <section className="my-appointments-content">
            <h2 className="my-appointments-title">Lịch hẹn của tôi</h2>

            <div className="appointment-status-tabs-wrap">
              <div className="appointment-status-tabs">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={`appointment-status-tab ${
                      activeStatus === tab.value ? "active" : ""
                    }`}
                    onClick={() => setActiveStatus(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="my-appointments-empty">
                <p>Không có lịch hẹn nào thuộc trạng thái này.</p>
              </div>
            ) : (
              <div className="my-appointments-list">
                {filteredAppointments.map((appointment) => {
                  const statusInfo = statusMap[appointment.status]

                  return (
                    <article
                      className="appointment-card"
                      key={appointment.id}
                      onClick={() => setDetailAppointment(appointment)}
                    >
                      <div className="appointment-card-top">
                        <div className="appointment-card-info">
                          <p className="appointment-code">{appointment.id}</p>

                          <h3
                            className="appointment-service-name"
                            title={getServiceNames(appointment)}
                          >
                            {getServiceNamesPreview(appointment)}
                          </h3>
                        </div>

                        <span className={`appointment-status ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="appointment-date-row">
                        <CalendarDays size={16} />
                        <span>{formatVietnameseDate(appointment.date)}</span>
                      </div>

                      <div className="appointment-time-range-row">
                        <Clock3 size={16} />
                        <span>
                          Thời gian hẹn: <strong>{getTimeRange(appointment)}</strong>
                        </span>
                      </div>

                      <div className="appointment-card-divider"></div>

                      <div className="appointment-card-bottom">
                        <span>{appointment.peopleCount} người</span>

                        <strong>{formatPrice(getAppointmentTotalPrice(appointment))}</strong>
                      </div>

                      {canUpdateAppointment(appointment.status) && (
                        <div
                          className="appointment-card-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="appointment-card-btn appointment-card-btn-primary"
                            onClick={() => handleRescheduleAppointment(appointment)}
                          >
                            Đổi lịch hẹn
                          </button>

                          <button
                            type="button"
                            className="appointment-card-btn appointment-card-btn-danger"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Hủy lịch hẹn
                          </button>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <FloatingChat />

      {detailAppointment && (
        <div
          className="appointment-detail-overlay"
          onClick={() => setDetailAppointment(null)}
        >
          <div
            className="appointment-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="appointment-detail-close"
              onClick={() => setDetailAppointment(null)}
            >
              <X size={22} />
            </button>

            <div className="appointment-detail-card">
              <div className="appointment-detail-top">
                <p className="appointment-detail-code">
                  {detailAppointment.id}
                </p>

                <span
                  className={`appointment-status ${
                    statusMap[detailAppointment.status].className
                  }`}
                >
                  {statusMap[detailAppointment.status].label}
                </span>
              </div>

              <div className="appointment-detail-service">
                <span>Dịch vụ</span>

              <div className="appointment-detail-service-list">
                {detailAppointment.services.map((service, index) => (
                  <div className="appointment-detail-service-row" key={index}>
                    <div className="appointment-detail-service-left">
                      <div className="appointment-detail-service-thumb">
                        {service.image ? (
                          <img src={service.image} alt={service.name} />
                        ) : (
                          <span>{service.name.charAt(0)}</span>
                        )}
                      </div>

                      <p>{service.name}</p>
                    </div>

                    <strong>{formatPrice(service.price)}</strong>
                  </div>
                ))}
              </div>
              </div>

              <div className="appointment-detail-info-grid">
                <div className="appointment-detail-info-item">
                  <CalendarDays size={19} />
                  <span>{formatVietnameseDate(detailAppointment.date)}</span>
                </div>

                <div className="appointment-detail-info-item">
                  <Clock3 size={19} />
                  <span>{detailAppointment.time}</span>
                </div>

                <div className="appointment-detail-info-item">
                  <Users size={19} />
                  <span>{detailAppointment.peopleCount} người</span>
                </div>

                <div className="appointment-detail-info-item">
                  <Clock3 size={19} />
                  <span>
                    {formatDurationText(
                      getAppointmentTotalDuration(detailAppointment)
                    )}
                  </span>
                </div>
              </div>

              <div className="appointment-detail-divider"></div>

              <div className="appointment-detail-total">
                <span>Tổng tiền dự kiến</span>

                <strong>
                  {formatPrice(getAppointmentTotalPrice(detailAppointment))}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default MyAppointmentsPage