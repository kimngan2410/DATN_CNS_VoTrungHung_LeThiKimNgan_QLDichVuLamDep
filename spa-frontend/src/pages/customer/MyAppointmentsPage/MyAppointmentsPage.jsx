import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  LogOut,
  X,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import { getCurrentUser, logout } from "../../../services/authApi"
import { getAccountProfileApi } from "../../../services/accountApi"
import {
  cancelMyAppointmentApi,
  getMyAppointmentsApi,
  rescheduleMyAppointmentApi,
} from "../../../services/appointmentApi"
import {
  getActiveAppointmentCount,
  getCachedAppointmentCount,
  saveCachedAppointmentCount,
} from "../../../utils/appointmentCountHelper"

import "./MyAppointmentsPage.css"

function generateTimeSlots(start = "09:00", end = "21:00", stepMinutes = 30) {
  const [startHour, startMinute] = start.split(":").map(Number)
  const [endHour, endMinute] = end.split(":").map(Number)

  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = endHour * 60 + endMinute
  const slots = []

  for (
    let totalMinutes = startTotalMinutes;
    totalMinutes <= endTotalMinutes;
    totalMinutes += stepMinutes
  ) {
    const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0")
    const minute = String(totalMinutes % 60).padStart(2, "0")
    slots.push(`${hour}:${minute}`)
  }

  return slots
}

const timeSlots = generateTimeSlots("09:00", "21:00", 30)

const statusTabs = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
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
  doing: {
    label: "Đang thực hiện",
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
  no_show: {
    label: "Không đến",
    className: "status-cancelled",
  },
}

const cancelReasonOptions = [
  "Bận việc đột xuất",
  "Thay đổi kế hoạch",
  "Vấn đề sức khỏe",
  "Đã đặt nhầm dịch vụ/thời gian",
  "Khác",
]

function MyAppointmentsPage() {
  const navigate = useNavigate()
  const rescheduleDateInputRef = useRef(null)
  const actionNoticeTimerRef = useRef(null)

  const [appointments, setAppointments] = useState([])
  const [appointmentCount, setAppointmentCount] = useState(() => {
    const user = getCurrentUser()
    return getCachedAppointmentCount(user?.maTK)
  })
  const [profileData, setProfileData] = useState(() => {
    const user = getCurrentUser()

    return {
      avatar: user?.avatar || user?.anhDaiDien || "",
      fullName: user?.hoTen || user?.fullName || "Khách hàng",
      email: user?.email || "",
    }
  })

  const [activeStatus, setActiveStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [showLogoutPopup, setShowLogoutPopup] = useState(false)
  const [detailAppointment, setDetailAppointment] = useState(null)

  const [cancelModalData, setCancelModalData] = useState(null)
  const [selectedCancelReason, setSelectedCancelReason] = useState("")
  const [otherCancelReason, setOtherCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  const [rescheduleModalData, setRescheduleModalData] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)

  const [actionNotice, setActionNotice] = useState({
    open: false,
    type: "loading",
    title: "",
    message: "",
  })

  const currentUser = getCurrentUser()

  const fetchAppointments = useCallback(async () => {
    const user = getCurrentUser()

    if (!user?.maTK) {
      navigate("/dang-nhap", { replace: true })
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage("")

      const [appointmentData, profile] = await Promise.all([
        getMyAppointmentsApi(user.maTK),
        getAccountProfileApi(user.maTK).catch(() => null),
      ])

      setAppointments(appointmentData)

      const activeAppointmentCount = getActiveAppointmentCount(appointmentData)
      setAppointmentCount(activeAppointmentCount)
      saveCachedAppointmentCount(user.maTK, activeAppointmentCount)

      if (profile) {
        setProfileData({
          avatar: profile.avatar,
          fullName: profile.fullName,
          email: profile.email,
        })
      } else {
        setProfileData({
          avatar: user.avatar || user.anhDaiDien || "",
          fullName: user.hoTen || "Khách hàng",
          email: user.email || "",
        })
      }
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải danh sách lịch hẹn.")
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    return () => {
      if (actionNoticeTimerRef.current) {
        clearTimeout(actionNoticeTimerRef.current)
      }
    }
  }, [])

  const filteredAppointments = useMemo(() => {
    const visibleStatuses = ["pending", "confirmed"]

    if (activeStatus === "all") {
      return appointments.filter((item) => visibleStatuses.includes(item.status))
    }

    return appointments.filter((item) => item.status === activeStatus)
  }, [appointments, activeStatus])

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price || 0) + " đ"
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

  const formatCancelPopupDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const getAppointmentTotalPrice = (appointment) => {
    return appointment.services.reduce((sum, service) => {
      return sum + Number(service.total || service.price * service.quantity || 0)
    }, 0)
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

  const getTimeRange = (appointment) => {
    return `${appointment.time} - ${appointment.endTime}`
  }

  const getServiceNames = (appointment) => {
    return appointment.services
      .map((service) => `${service.name} x ${service.quantity}`)
      .join(", ")
  }

  const getServiceNamesPreview = (appointment) => {
    const serviceNames = appointment.services.map((service) => {
      return `${service.name} x ${service.quantity}`
    })

    if (serviceNames.length <= 2) {
      return serviceNames.join(", ")
    }

    return `${serviceNames.slice(0, 2).join(", ")}, ...`
  }

  const canUpdateAppointment = (status) => {
    return status === "pending" || status === "confirmed"
  }

  const openCancelModal = (appointment) => {
    setCancelModalData(appointment)
    setSelectedCancelReason("")
    setOtherCancelReason("")
  }

  const closeCancelModal = () => {
    if (isCancelling) return

    setCancelModalData(null)
    setSelectedCancelReason("")
    setOtherCancelReason("")
  }

  const showActionNotice = ({ type = "loading", title, message, autoClose = false }) => {
    if (actionNoticeTimerRef.current) {
      clearTimeout(actionNoticeTimerRef.current)
    }

    setActionNotice({
      open: true,
      type,
      title,
      message,
    })

    if (autoClose) {
      actionNoticeTimerRef.current = setTimeout(() => {
        setActionNotice({
          open: false,
          type: "loading",
          title: "",
          message: "",
        })
      }, 1800)
    }
  }

  const hideActionNotice = () => {
    if (actionNoticeTimerRef.current) {
      clearTimeout(actionNoticeTimerRef.current)
    }

    setActionNotice({
      open: false,
      type: "loading",
      title: "",
      message: "",
    })
  }

  const handleConfirmCancelAppointment = async () => {
    if (!cancelModalData || !currentUser?.maTK) return

    if (!selectedCancelReason) {
      alert("Vui lòng chọn lý do hủy lịch.")
      return
    }

    if (selectedCancelReason === "Khác" && !otherCancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy lịch.")
      return
    }

    const finalReason =
      selectedCancelReason === "Khác"
        ? otherCancelReason.trim()
        : selectedCancelReason

    try {
      setIsCancelling(true)

      showActionNotice({
        type: "loading",
        title: "Đang hủy lịch hẹn",
        message: "Hệ thống đang cập nhật trạng thái lịch hẹn của bạn...",
      })

      await cancelMyAppointmentApi(cancelModalData.id, {
        idTaiKhoan: currentUser.maTK,
        lyDoHuy: finalReason,
      })

      setCancelModalData(null)
      setSelectedCancelReason("")
      setOtherCancelReason("")
      setDetailAppointment(null)

      await fetchAppointments()

      showActionNotice({
        type: "success",
        title: "Hủy lịch thành công",
        message: "Lịch hẹn của bạn đã được hủy thành công.",
        autoClose: true,
      })
    } catch (error) {
      hideActionNotice()
      alert(error.message || "Không thể hủy lịch hẹn.")
    } finally {
      setIsCancelling(false)
    }
  }

  const openRescheduleModal = (appointment) => {
    setRescheduleModalData(appointment)
    setRescheduleDate(appointment.date)
    setRescheduleTime(appointment.time)
  }

  const closeRescheduleModal = () => {
    if (isRescheduling) return

    setRescheduleModalData(null)
    setRescheduleDate("")
    setRescheduleTime("")
  }

  const openNativeDatePicker = () => {
    if (rescheduleDateInputRef.current?.showPicker) {
      rescheduleDateInputRef.current.showPicker()
    } else {
      rescheduleDateInputRef.current?.focus()
    }
  }

  const handleConfirmRescheduleAppointment = async () => {
    if (!rescheduleModalData || !rescheduleDate || !rescheduleTime) {
      alert("Vui lòng chọn đầy đủ ngày và giờ mới.")
      return
    }

    if (!currentUser?.maTK) {
      navigate("/dang-nhap", { replace: true })
      return
    }

    try {
      setIsRescheduling(true)

      showActionNotice({
        type: "loading",
        title: "Đang đổi lịch hẹn",
        message: "Hệ thống đang cập nhật thời gian lịch hẹn của bạn...",
      })

      await rescheduleMyAppointmentApi(rescheduleModalData.id, {
        idTaiKhoan: currentUser.maTK,
        ngayHen: rescheduleDate,
        gioHen: rescheduleTime,
      })

      setRescheduleModalData(null)
      setRescheduleDate("")
      setRescheduleTime("")
      setDetailAppointment(null)

      await fetchAppointments()

      showActionNotice({
        type: "success",
        title: "Đổi lịch thành công",
        message: "Lịch hẹn của bạn đã được cập nhật thời gian mới.",
        autoClose: true,
      })
    } catch (error) {
      hideActionNotice()
      alert(error.message || "Không thể đổi lịch hẹn.")
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleLogout = () => {
    setShowLogoutPopup(true)
  }

  const confirmLogout = () => {
    logout()
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
            <div className="my-appointments-header-card">
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
            </div>

            {isLoading ? (
              <div className="my-appointments-empty my-appointments-loading">
                <Loader2 size={28} className="my-appointments-loading-icon" />
                <p>Đang tải lịch hẹn của bạn...</p>
              </div>
            ) : errorMessage ? (
              <div className="my-appointments-empty">
                <p>{errorMessage}</p>

                <button
                  type="button"
                  className="appointment-card-btn appointment-card-btn-primary"
                  onClick={fetchAppointments}
                >
                  Thử lại
                </button>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="my-appointments-empty">
                <p>Không có lịch hẹn nào thuộc trạng thái này.</p>
              </div>
            ) : (
              <div className="my-appointments-list">
                {filteredAppointments.map((appointment) => {
                  const statusInfo =
                    statusMap[appointment.status] || statusMap.pending

                  return (
                    <article
                      className="appointment-card"
                      key={appointment.id}
                      onClick={() => setDetailAppointment(appointment)}
                    >
                      <div className="appointment-card-top">
                        <div className="appointment-card-info">
                          <p className="appointment-code">{appointment.code}</p>

                          <h3
                            className="appointment-service-name"
                            title={getServiceNames(appointment)}
                          >
                            {getServiceNamesPreview(appointment)}
                          </h3>
                        </div>

                        <span
                          className={`appointment-status ${statusInfo.className}`}
                        >
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
                          Thời gian hẹn:{" "}
                          <strong>{getTimeRange(appointment)}</strong>
                        </span>
                      </div>

                      <div className="appointment-card-divider"></div>

                      <div className="appointment-card-bottom appointment-card-bottom--price-only">
                        <strong>
                          {formatPrice(getAppointmentTotalPrice(appointment))}
                        </strong>
                      </div>

                      {canUpdateAppointment(appointment.status) && (
                        <div
                          className="appointment-card-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="appointment-card-btn appointment-card-btn-primary"
                            onClick={() => openRescheduleModal(appointment)}
                          >
                            Đổi lịch
                          </button>

                          <button
                            type="button"
                            className="appointment-card-btn appointment-card-btn-danger"
                            onClick={() => openCancelModal(appointment)}
                          >
                            Hủy lịch
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
                  {detailAppointment.code}
                </p>

                <span
                  className={`appointment-status ${
                    statusMap[detailAppointment.status]?.className ||
                    "status-pending"
                  }`}
                >
                  {statusMap[detailAppointment.status]?.label ||
                    detailAppointment.statusLabel}
                </span>
              </div>

              <div className="appointment-detail-service">
                <span>Dịch vụ</span>

                <div className="appointment-detail-service-list">
                  {detailAppointment.services.map((service) => (
                    <div className="appointment-detail-service-row" key={service.id}>
                      <div className="appointment-detail-service-left">
                        <div className="appointment-detail-service-thumb">
                          {service.image ? (
                            <img src={service.image} alt={service.name} />
                          ) : (
                            <span>{service.name.charAt(0)}</span>
                          )}
                        </div>

                        <div>
                          <p>{service.name}</p>

                          <small className="appointment-detail-service-meta">
                            Số lượng: {service.quantity} · Thời lượng:{" "}
                            {service.duration} phút
                          </small>
                        </div>
                      </div>

                      <div className="appointment-detail-service-price-group">
                        <span>{formatPrice(service.price)} / lượt</span>
                        <strong>{formatPrice(service.total)}</strong>
                      </div>
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
                  <span>{getTimeRange(detailAppointment)}</span>
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

              {detailAppointment.cancelReason && (
                <>
                  <div className="appointment-detail-divider"></div>

                  <div className="appointment-detail-cancel-reason">
                    <span>Lý do hủy</span>
                    <p>{detailAppointment.cancelReason}</p>
                  </div>
                </>
              )}

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

      {rescheduleModalData && (
        <div
          className="reschedule-booking-overlay"
          onClick={closeRescheduleModal}
        >
          <div
            className="reschedule-booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reschedule-booking-header">
              <h3>Đổi lịch hẹn</h3>

              <button
                type="button"
                className="reschedule-booking-close"
                onClick={closeRescheduleModal}
              >
                <X size={22} />
              </button>
            </div>

            <div className="reschedule-booking-body">
              <div className="reschedule-form-group">
                <label>Ngày mới</label>

                <div
                  className="reschedule-date-select-wrap"
                  onClick={openNativeDatePicker}
                >
                  <CalendarDays size={21} />

                  <input
                    ref={rescheduleDateInputRef}
                    type="date"
                    value={rescheduleDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>

                {rescheduleDate === rescheduleModalData.date && (
                  <p className="reschedule-current-date-note">Ngày hiện tại</p>
                )}
              </div>

              <div className="reschedule-form-group">
                <label>Giờ mới</label>

                <div className="reschedule-time-grid">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`reschedule-time-slot ${
                        rescheduleTime === time ? "active" : ""
                      }`}
                      onClick={() => setRescheduleTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="reschedule-booking-footer">
              <button
                type="button"
                className="reschedule-booking-btn reschedule-booking-btn-secondary"
                onClick={closeRescheduleModal}
                disabled={isRescheduling}
              >
                Đóng
              </button>

              <button
                type="button"
                className="reschedule-booking-btn reschedule-booking-btn-primary"
                onClick={handleConfirmRescheduleAppointment}
                disabled={isRescheduling}
              >
                {isRescheduling ? "Đang đổi..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelModalData && (
        <div className="cancel-booking-overlay" onClick={closeCancelModal}>
          <div
            className="cancel-booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cancel-booking-header">
              <div className="cancel-booking-title">
                <AlertTriangle size={22} />
                <h3>Hủy lịch hẹn</h3>
              </div>

              <button
                type="button"
                className="cancel-booking-close"
                onClick={closeCancelModal}
              >
                <X size={22} />
              </button>
            </div>

            <div className="cancel-booking-body">
              <p className="cancel-booking-message">
                Bạn có chắc chắn muốn hủy lịch hẹn{" "}
                <strong>#{cancelModalData.code}</strong> vào lúc{" "}
                <strong>{cancelModalData.time}</strong> -{" "}
                <strong>{formatCancelPopupDate(cancelModalData.date)}</strong>{" "}
                không?
              </p>

              <label className="cancel-booking-label">
                Lý do hủy lịch <span>*</span>
              </label>

              <div className="cancel-booking-reason-list">
                {cancelReasonOptions.map((reason) => (
                  <label
                    key={reason}
                    className={`cancel-booking-reason-item ${
                      selectedCancelReason === reason ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel-reason"
                      checked={selectedCancelReason === reason}
                      onChange={() => setSelectedCancelReason(reason)}
                    />

                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {selectedCancelReason === "Khác" && (
                <textarea
                  className="cancel-booking-textarea"
                  placeholder="Nhập lý do hủy lịch..."
                  value={otherCancelReason}
                  onChange={(e) => setOtherCancelReason(e.target.value)}
                />
              )}
            </div>

            <div className="cancel-booking-footer">
              <button
                type="button"
                className="cancel-booking-btn cancel-booking-btn-secondary"
                onClick={closeCancelModal}
                disabled={isCancelling}
              >
                Đóng
              </button>

              <button
                type="button"
                className="cancel-booking-btn cancel-booking-btn-danger"
                onClick={handleConfirmCancelAppointment}
                disabled={isCancelling}
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionNotice.open && (
        <div className="appointment-action-notice-overlay">
          <div
            className={`appointment-action-notice appointment-action-notice--${actionNotice.type}`}
          >
            <div className="appointment-action-notice-icon">
              {actionNotice.type === "loading" ? (
                <Loader2 size={38} />
              ) : (
                <CheckCircle2 size={42} />
              )}
            </div>

            <h3>{actionNotice.title}</h3>
            <p>{actionNotice.message}</p>
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