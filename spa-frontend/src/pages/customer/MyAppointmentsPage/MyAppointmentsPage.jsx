import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Clock3,
  LogOut,
  Tag,
  Timer,
  TriangleAlert,
  Users,
  X,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import "./MyAppointmentsPage.css"

function MyAppointmentsPage() {
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([
    {
      id: "#A1001",
      services: [
        {
          name: "Chăm sóc da mặt chuyên sâu",
          price: 850000,
          duration: 90,
        },
        {
          name: "Dưỡng trắng cấp ẩm chuyên sâu",
          price: 990000,
          duration: 75,
        },
      ],
      date: "2026-04-25",
      time: "14:30",
      peopleCount: 1,
      status: "pending",
    },
    {
      id: "#A1002",
      services: [
        {
          name: "Massage body đá nóng",
          price: 650000,
          duration: 60,
        },
      ],
      date: "2026-04-22",
      time: "10:00",
      peopleCount: 1,
      status: "confirmed",
    },
    {
      id: "#A1006",
      services: [
        {
          name: "Gội đầu dưỡng sinh",
          price: 250000,
          duration: 45,
        },
        {
          name: "Nail Art Cao Cấp",
          price: 350000,
          duration: 60,
        },
      ],
      date: "2026-04-30",
      time: "09:00",
      peopleCount: 2,
      status: "checkedin",
    },
  ])

  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [customCancelReason, setCustomCancelReason] = useState("")

  const profileData = {
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    fullName: "Nguyễn Thị Mai",
    email: "admin@gmail.com",
  }

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
  }

  const cancelReasonOptions = [
    "Bận việc đột xuất",
    "Thay đổi kế hoạch",
    "Vấn đề sức khoẻ",
    "Đã đặt nhầm dịch vụ/thời gian",
    "Khác",
  ]

  const dateOptions = [
    "2026-04-25",
    "2026-04-26",
    "2026-04-27",
    "2026-04-28",
    "2026-04-29",
  ]

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ]

  const appointmentCount = useMemo(() => {
    return appointments.length
  }, [appointments])

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

  const canUpdateAppointment = (status) => {
    return status === "pending" || status === "confirmed"
  }

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment)
    setSelectedDate(appointment.date)
    setSelectedTime(appointment.time)
    setShowRescheduleModal(true)
  }

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false)
    setSelectedAppointment(null)
    setSelectedDate("")
    setSelectedTime("")
  }

  const handleConfirmReschedule = () => {
    if (!selectedAppointment || !selectedDate || !selectedTime) {
      alert("Vui lòng chọn đầy đủ ngày và giờ mới.")
      return
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointment.id
          ? {
              ...item,
              date: selectedDate,
              time: selectedTime,
            }
          : item
      )
    )

    closeRescheduleModal()
    alert("Đổi lịch hẹn thành công!")
  }

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment)
    setCancelReason("")
    setCustomCancelReason("")
    setShowCancelModal(true)
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setSelectedAppointment(null)
    setCancelReason("")
    setCustomCancelReason("")
  }

  const handleConfirmCancel = () => {
    if (!cancelReason) {
      alert("Vui lòng chọn lý do huỷ lịch.")
      return
    }

    if (cancelReason === "Khác" && !customCancelReason.trim()) {
      alert("Vui lòng nhập lý do huỷ lịch cụ thể.")
      return
    }

    const finalCancelReason =
      cancelReason === "Khác" ? customCancelReason.trim() : cancelReason

    console.log({
      appointmentId: selectedAppointment.id,
      cancelReason: finalCancelReason,
      status: "cancelled",
    })

    setAppointments((prev) =>
      prev.filter((item) => item.id !== selectedAppointment.id)
    )

    closeCancelModal()
    alert("Huỷ lịch hẹn thành công. Lịch hẹn đã được chuyển sang lịch sử.")
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

            {appointments.length === 0 ? (
              <div className="my-appointments-empty">
                <p>Bạn chưa có lịch hẹn nào đang xử lý.</p>
              </div>
            ) : (
              <div className="my-appointments-list">
                {appointments.map((appointment) => {
                  const statusInfo = statusMap[appointment.status]
                  const allowAction = canUpdateAppointment(appointment.status)

                  return (
                    <div className="appointment-card" key={appointment.id}>
                      <div className="appointment-card-header">
                        <div>
                          <p className="appointment-code">
                            Mã LH: {appointment.id}
                          </p>
                        </div>

                        <span
                          className={`appointment-status ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="appointment-meta-row">
                        <div className="appointment-meta-item">
                          <div className="appointment-meta-icon">
                            <CalendarDays size={18} />
                          </div>

                          <div>
                            <span className="meta-label">Ngày hẹn</span>
                            <strong className="meta-value">
                              {appointment.date}
                            </strong>
                          </div>
                        </div>

                        <div className="appointment-meta-item">
                          <div className="appointment-meta-icon">
                            <Clock3 size={18} />
                          </div>

                          <div>
                            <span className="meta-label">Giờ hẹn</span>
                            <strong className="meta-value">
                              {appointment.time}
                            </strong>
                          </div>
                        </div>

                        <div className="appointment-meta-item">
                          <div className="appointment-meta-icon">
                            <Users size={18} />
                          </div>

                          <div>
                            <span className="meta-label">Số lượng người</span>
                            <strong className="meta-value">
                              {appointment.peopleCount} người
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="appointment-table-box">
                        <div className="appointment-table-title">
                          Danh sách dịch vụ
                        </div>

                        <div className="appointment-table-scroll">
                          <table className="appointment-service-table">
                            <thead>
                              <tr>
                                <th>STT</th>
                                <th>Dịch vụ</th>
                                <th>Thời lượng</th>
                                <th>Đơn giá</th>
                              </tr>
                            </thead>

                            <tbody>
                              {appointment.services.map((service, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>

                                  <td className="service-name-cell">
                                    {service.name}
                                  </td>

                                  <td>
                                    <span className="table-duration">
                                      <Timer size={16} />
                                      {service.duration} phút
                                    </span>
                                  </td>

                                  <td className="table-price">
                                    {formatPrice(service.price)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="appointment-summary-box">
                          <div className="appointment-summary-item">
                            <span>Tổng thời lượng</span>
                            <strong>
                              {getAppointmentTotalDuration(appointment)} phút
                            </strong>
                          </div>

                          <div className="appointment-summary-item">
                            <span>Tổng tiền</span>
                            <strong className="summary-price">
                              {formatPrice(
                                getAppointmentTotalPrice(appointment)
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {allowAction && (
                        <div className="appointment-action-row">
                          <button
                            type="button"
                            className="appointment-btn appointment-btn-secondary"
                            onClick={() => openRescheduleModal(appointment)}
                          >
                            Đổi lịch
                          </button>

                          <button
                            type="button"
                            className="appointment-btn appointment-btn-danger"
                            onClick={() => openCancelModal(appointment)}
                          >
                            Huỷ lịch
                          </button>
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

      {showRescheduleModal && selectedAppointment && (
        <div className="appointment-modal-overlay">
          <div className="appointment-modal">
            <div className="appointment-modal-header">
              <h3>Đổi lịch hẹn</h3>

              <button
                type="button"
                className="appointment-modal-close"
                onClick={closeRescheduleModal}
              >
                <X size={28} />
              </button>
            </div>

            <div className="appointment-modal-body">
              <div className="appointment-form-group">
                <label>Ngày mới</label>

                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  {dateOptions.map((date) => (
                    <option key={date} value={date}>
                      {date}
                      {date === selectedAppointment.date ? " (Hiện tại)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="appointment-form-group">
                <label>Giờ mới</label>

                <div className="appointment-time-grid">
                  {timeSlots.map((time) => (
                    <button
                      type="button"
                      key={time}
                      className={`appointment-time-slot ${
                        selectedTime === time ? "active" : ""
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="appointment-modal-footer">
              <button
                type="button"
                className="appointment-btn-modal appointment-btn-outline"
                onClick={closeRescheduleModal}
              >
                Đóng
              </button>

              <button
                type="button"
                className="appointment-btn-modal appointment-btn-dark"
                onClick={handleConfirmReschedule}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedAppointment && (
        <div className="appointment-modal-overlay">
          <div className="appointment-modal">
            <div className="appointment-modal-header">
              <div className="appointment-modal-title danger">
                <TriangleAlert size={28} />
                <h3>Huỷ lịch hẹn</h3>
              </div>

              <button
                type="button"
                className="appointment-modal-close"
                onClick={closeCancelModal}
              >
                <X size={28} />
              </button>
            </div>

            <div className="appointment-modal-body">
              <p className="appointment-cancel-message">
                Bạn có chắc chắn muốn huỷ lịch hẹn{" "}
                <strong>{selectedAppointment.id}</strong> vào lúc{" "}
                <strong>
                  {selectedAppointment.time} - {selectedAppointment.date}
                </strong>{" "}
                không?
              </p>

              <div className="appointment-form-group">
                <label>
                  Lý do huỷ lịch <span>*</span>
                </label>

                <div className="appointment-reason-list">
                  {cancelReasonOptions.map((reason) => (
                    <label className="appointment-reason-item" key={reason}>
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={(e) => {
                          setCancelReason(e.target.value)

                          if (e.target.value !== "Khác") {
                            setCustomCancelReason("")
                          }
                        }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}

                  {cancelReason === "Khác" && (
                    <textarea
                      className="appointment-cancel-textarea"
                      placeholder="Nhập lý do cụ thể..."
                      value={customCancelReason}
                      onChange={(e) => setCustomCancelReason(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="appointment-modal-footer">
              <button
                type="button"
                className="appointment-btn-modal appointment-btn-outline"
                onClick={closeCancelModal}
              >
                Đóng
              </button>

              <button
                type="button"
                className="appointment-btn-modal appointment-btn-red"
                onClick={handleConfirmCancel}
              >
                Xác nhận huỷ
              </button>
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