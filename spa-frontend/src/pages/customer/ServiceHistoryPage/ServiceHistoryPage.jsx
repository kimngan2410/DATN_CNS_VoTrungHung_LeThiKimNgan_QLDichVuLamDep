import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, Clock3, LogOut, Star, Users, X } from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import "./ServiceHistoryPage.css"

function ServiceHistoryPage() {
  const navigate = useNavigate()

  const [showLogoutPopup, setShowLogoutPopup] = useState(false)
  const [activeStatus, setActiveStatus] = useState("all")
  const [detailHistory, setDetailHistory] = useState(null)
  const [reviewAppointment, setReviewAppointment] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState("")

  const [historyAppointments, setHistoryAppointments] = useState([
    {
      id: "LH20250104",
      services: [
        {
          name: "Cắt tóc",
          price: 120000,
          duration: 45,
          image:
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=80",
        },
        {
          name: "Nhuộm tóc",
          price: 350000,
          duration: 120,
          image:
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80",
        },
        {
          name: "Gội đầu dưỡng sinh",
          price: 150000,
          duration: 45,
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
        },
      ],
      date: "2025-04-20",
      time: "10:30",
      peopleCount: 1,
      status: "completed",
      reviewed: false,
      review: null,
    },
    {
      id: "LH20250105",
      services: [
        {
          name: "Massage body đá nóng",
          price: 650000,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
        },
      ],
      date: "2025-04-18",
      time: "15:00",
      peopleCount: 1,
      status: "cancelled",
      cancelReason: "Thay đổi kế hoạch",
    },
    {
      id: "LH20250106",
      services: [
        {
          name: "Chăm sóc da mặt chuyên sâu",
          price: 850000,
          duration: 90,
          image:
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80",
        },
      ],
      date: "2025-04-12",
      time: "09:00",
      peopleCount: 1,
      status: "completed",
      reviewed: true,
      review: {
        rating: 5,
        content:
          "Dịch vụ rất tốt, nhân viên tư vấn nhiệt tình, da mặt sau khi làm khá dễ chịu.",
      },
    },
    {
      id: "LH20250107",
      services: [
        {
          name: "Nail art",
          price: 150000,
          duration: 60,
          image:
            "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
        },
        {
          name: "Gội đầu dưỡng sinh",
          price: 150000,
          duration: 45,
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
        },
      ],
      date: "2025-04-08",
      time: "14:30",
      peopleCount: 2,
      status: "cancelled",
      cancelReason: "Đặt nhầm thời gian",
    },
  ])

  const profileData = {
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    fullName: "Nguyễn Thị Mai",
    email: "admin@gmail.com",
  }

  const appointmentCount = 3

  const historyTabs = [
    {
      value: "all",
      label: "Tất cả",
    },
    {
      value: "completed",
      label: "Đã hoàn thành",
    },
    {
      value: "cancelled",
      label: "Đã hủy",
    },
  ]

  const statusMap = {
    completed: {
      label: "Đã hoàn thành",
      className: "history-status-completed",
    },
    cancelled: {
      label: "Đã hủy",
      className: "history-status-cancelled",
    },
  }

  const filteredHistory = useMemo(() => {
    const historyOnly = historyAppointments.filter((item) =>
      ["completed", "cancelled"].includes(item.status)
    )

    if (activeStatus === "all") return historyOnly

    return historyOnly.filter((item) => item.status === activeStatus)
  }, [historyAppointments, activeStatus])

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

  const openReviewModal = (appointment) => {
    setReviewAppointment(appointment)
    setReviewRating(appointment.review?.rating || 5)
    setReviewContent(appointment.review?.content || "")
  }

  const closeReviewModal = () => {
    setReviewAppointment(null)
    setReviewRating(5)
    setReviewContent("")
  }

  const handleSaveReview = () => {
    if (!reviewAppointment) return

    if (!reviewContent.trim()) {
      alert("Vui lòng nhập nội dung đánh giá.")
      return
    }

    setHistoryAppointments((prev) =>
      prev.map((item) =>
        item.id === reviewAppointment.id
          ? {
              ...item,
              reviewed: true,
              review: {
                rating: reviewRating,
                content: reviewContent.trim(),
              },
            }
          : item
      )
    )

    setDetailHistory((prev) => {
      if (!prev || prev.id !== reviewAppointment.id) return prev

      return {
        ...prev,
        reviewed: true,
        review: {
          rating: reviewRating,
          content: reviewContent.trim(),
        },
      }
    })

    closeReviewModal()
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={18}
        className={index < rating ? "star-filled" : "star-empty"}
        fill={index < rating ? "currentColor" : "none"}
      />
    ))
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

            <div className="history-status-tabs-wrap">
              <div className="history-status-tabs">
                {historyTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={`history-status-tab ${
                      activeStatus === tab.value ? "active" : ""
                    }`}
                    onClick={() => setActiveStatus(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="service-history-empty">
                <p>Không có lịch sử dịch vụ thuộc trạng thái này.</p>
              </div>
            ) : (
              <div className="service-history-list">
                {filteredHistory.map((appointment) => {
                  const statusInfo = statusMap[appointment.status]

                  return (
                    <article
                      className="history-card"
                      key={appointment.id}
                      onClick={() => setDetailHistory(appointment)}
                    >
                      <div className="history-card-top">
                        <div className="history-card-info">
                          <p className="history-code">{appointment.id}</p>

                          <h3
                            className="history-service-name"
                            title={getServiceNames(appointment)}
                          >
                            {getServiceNamesPreview(appointment)}
                          </h3>
                        </div>

                        <span
                          className={`history-status ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="history-date-row">
                        <CalendarDays size={16} />
                        <span>{formatVietnameseDate(appointment.date)}</span>
                      </div>

                      <div className="history-time-range-row">
                        <Clock3 size={16} />
                        <span>
                          Thời gian hẹn:{" "}
                          <strong>{getTimeRange(appointment)}</strong>
                        </span>
                      </div>

                      <div className="history-card-divider"></div>

                      <div className="history-card-bottom">
                        <span>{appointment.peopleCount} người</span>

                        <strong>
                          {formatPrice(getAppointmentTotalPrice(appointment))}
                        </strong>
                      </div>

                      {appointment.cancelReason && (
                        <div className="history-cancel-reason">
                          <strong>Lý do hủy:</strong>{" "}
                          {appointment.cancelReason}
                        </div>
                      )}

                      {appointment.status === "completed" && (
                        <div
                          className="history-action-row"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {appointment.reviewed ? (
                            <button
                              type="button"
                              className="history-reviewed-btn"
                              onClick={() => setDetailHistory(appointment)}
                            >
                              Xem đánh giá
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="history-review-btn"
                              onClick={() => openReviewModal(appointment)}
                            >
                              Đánh giá dịch vụ
                            </button>
                          )}
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

      {detailHistory && (
        <div
          className="history-detail-overlay"
          onClick={() => setDetailHistory(null)}
        >
          <div
            className="history-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="history-detail-close"
              onClick={() => setDetailHistory(null)}
            >
              <X size={22} />
            </button>

            <div className="history-detail-card">
              <div className="history-detail-top">
                <p className="history-detail-code">{detailHistory.id}</p>

                <span
                  className={`history-status ${
                    statusMap[detailHistory.status].className
                  }`}
                >
                  {statusMap[detailHistory.status].label}
                </span>
              </div>

              <div className="history-detail-service">
                <span>Dịch vụ</span>

                <div className="history-detail-service-list">
                  {detailHistory.services.map((service, index) => (
                    <div className="history-detail-service-row" key={index}>
                      <div className="history-detail-service-left">
                        <div className="history-detail-service-thumb">
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

              <div className="history-detail-info-grid">
                <div className="history-detail-info-item">
                  <CalendarDays size={19} />
                  <span>{formatVietnameseDate(detailHistory.date)}</span>
                </div>

                <div className="history-detail-info-item">
                  <Clock3 size={19} />
                  <span>{getTimeRange(detailHistory)}</span>
                </div>

                <div className="history-detail-info-item">
                  <Users size={19} />
                  <span>{detailHistory.peopleCount} người</span>
                </div>
              </div>

              <div className="history-detail-divider"></div>

              <div className="history-detail-total">
                <span>Tổng tiền</span>

                <strong>
                  {formatPrice(getAppointmentTotalPrice(detailHistory))}
                </strong>
              </div>

              {detailHistory.cancelReason && (
                <div className="history-detail-cancel-reason">
                  <strong>Lý do hủy:</strong> {detailHistory.cancelReason}
                </div>
              )}

              {detailHistory.status === "completed" && detailHistory.reviewed && (
                <div className="history-detail-review-box">
                  <div className="history-detail-review-head">
                    <h4>Đánh giá dịch vụ</h4>

                    <button
                      type="button"
                      className="history-edit-review-btn"
                      onClick={() => openReviewModal(detailHistory)}
                    >
                      Chỉnh sửa
                    </button>
                  </div>

                  <div className="history-review-stars">
                    {renderStars(detailHistory.review?.rating || 5)}
                  </div>

                  <p className="history-review-content">
                    {detailHistory.review?.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reviewAppointment && (
        <div
          className="review-modal-overlay"
          onClick={closeReviewModal}
        >
          <div
            className="review-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="review-modal-close"
              onClick={closeReviewModal}
            >
              <X size={22} />
            </button>

            <h3>
              {reviewAppointment.reviewed
                ? "Chỉnh sửa đánh giá"
                : "Đánh giá dịch vụ"}
            </h3>

            <p className="review-modal-subtitle">
              {reviewAppointment.id} - {getServiceNamesPreview(reviewAppointment)}
            </p>

            <div className="review-rating-row">
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1

                return (
                  <button
                    key={starValue}
                    type="button"
                    className={`review-star-btn ${
                      starValue <= reviewRating ? "active" : ""
                    }`}
                    onClick={() => setReviewRating(starValue)}
                  >
                    <Star
                      size={30}
                      fill={starValue <= reviewRating ? "currentColor" : "none"}
                    />
                  </button>
                )
              })}
            </div>

            <textarea
              className="review-textarea"
              placeholder="Nhập cảm nhận của bạn về dịch vụ..."
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
            />

            <div className="review-modal-actions">
              <button
                type="button"
                className="review-btn review-btn-cancel"
                onClick={closeReviewModal}
              >
                Hủy
              </button>

              <button
                type="button"
                className="review-btn review-btn-save"
                onClick={handleSaveReview}
              >
                Lưu đánh giá
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

export default ServiceHistoryPage