import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Clock3,
  LogOut,
  Star,
  Upload,
  Users,
  X,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import "./ServiceHistoryPage.css"

function ServiceHistoryPage() {
  const navigate = useNavigate()
  const reviewFileInputRef = useRef(null)

  const [showLogoutPopup, setShowLogoutPopup] = useState(false)
  const [activeStatus, setActiveStatus] = useState("all")
  const [detailHistory, setDetailHistory] = useState(null)

  const [serviceReviewPicker, setServiceReviewPicker] = useState(null)
  const [viewReviewTarget, setViewReviewTarget] = useState(null)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewContent, setReviewContent] = useState("")
  const [reviewImages, setReviewImages] = useState([])

  const [historyAppointments, setHistoryAppointments] = useState([
    {
      id: "LH20250104",
      invoiceCode: "HD20250104",
      date: "2025-04-20",
      time: "10:30",
      peopleCount: 1,
      status: "completed",
      paymentMethod: "Tiền mặt",
      paymentStatus: "Đã thanh toán",
      paidAt: "2025-04-20",
      services: [
        {
          idChiTietLH: "CTLH001",
          idDichVu: "DV001",
          name: "Cắt tóc",
          price: 120000,
          quantity: 1,
          duration: 45,
          type: "booked",
          image:
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=80",
          reviewed: true,
          review: {
            rating: 5,
            content: "Cắt tóc đẹp, nhân viên tư vấn nhiệt tình.",
            images: [],
          },
        },
        {
          idChiTietLH: "CTLH002",
          idDichVu: "DV002",
          name: "Nhuộm tóc",
          price: 350000,
          quantity: 1,
          duration: 120,
          type: "booked",
          image:
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80",
          reviewed: true,
          review: {
            rating: 4,
            content: "Màu tóc lên khá đẹp, sẽ quay lại lần sau.",
            images: [],
          },
        },
        {
          idChiTietLH: "CTLH003",
          idDichVu: "DV003",
          name: "Gội đầu dưỡng sinh",
          price: 150000,
          quantity: 1,
          duration: 45,
          type: "additional",
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
          reviewed: false,
          review: null,
        },
      ],
    },
    {
      id: "LH20250105",
      invoiceCode: null,
      date: "2025-04-18",
      time: "15:00",
      peopleCount: 1,
      status: "cancelled",
      cancelReason: "Thay đổi kế hoạch",
      services: [
        {
          idChiTietLH: "CTLH004",
          idDichVu: "DV004",
          name: "Massage body đá nóng",
          price: 650000,
          quantity: 1,
          duration: 60,
          type: "booked",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
          reviewed: false,
          review: null,
        },
      ],
    },
    {
      id: "LH20250106",
      invoiceCode: "HD20250106",
      date: "2025-04-12",
      time: "09:00",
      peopleCount: 1,
      status: "completed",
      paymentMethod: "Chuyển khoản",
      paymentStatus: "Đã thanh toán",
      paidAt: "2025-04-12",
      services: [
        {
          idChiTietLH: "CTLH005",
          idDichVu: "DV005",
          name: "Chăm sóc da mặt chuyên sâu",
          price: 850000,
          quantity: 1,
          duration: 90,
          type: "booked",
          image:
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80",
          reviewed: true,
          review: {
            rating: 5,
            content:
              "Dịch vụ rất tốt, nhân viên tư vấn nhiệt tình, da mặt sau khi làm khá dễ chịu.",
            images: [],
          },
        },
      ],
    },
    {
      id: "LH20250107",
      invoiceCode: null,
      date: "2025-04-08",
      time: "14:30",
      peopleCount: 2,
      status: "cancelled",
      cancelReason: "Đặt nhầm thời gian",
      services: [
        {
          idChiTietLH: "CTLH006",
          idDichVu: "DV006",
          name: "Nail art",
          price: 150000,
          quantity: 2,
          duration: 60,
          type: "booked",
          image:
            "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
          reviewed: false,
          review: null,
        },
        {
          idChiTietLH: "CTLH007",
          idDichVu: "DV003",
          name: "Gội đầu dưỡng sinh",
          price: 150000,
          quantity: 2,
          duration: 45,
          type: "booked",
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
          reviewed: false,
          review: null,
        },
      ],
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
    { value: "all", label: "Tất cả" },
    { value: "completed", label: "Đã hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
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
    return new Intl.NumberFormat("vi-VN").format(Number(price || 0)) + "đ"
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

  const getServiceType = (service) => {
    if (service.type) return service.type
    if (service.isAdditional) return "additional"
    return "booked"
  }

  const getBookedServices = (appointment) => {
    return appointment.services.filter(
      (service) => getServiceType(service) === "booked"
    )
  }

  const getAdditionalServices = (appointment) => {
    return appointment.services.filter(
      (service) => getServiceType(service) === "additional"
    )
  }

  const getServiceLineTotal = (service) => {
    const quantity = Number(service.quantity || 1)
    return Number(service.price || 0) * quantity
  }

  const getAppointmentTotalPrice = (appointment) => {
    return appointment.services.reduce((sum, service) => {
      return sum + getServiceLineTotal(service)
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
    const bookedServices = getBookedServices(appointment)
    const additionalServices = getAdditionalServices(appointment)

    const bookedNames = bookedServices.map((service) => service.name)

    let preview = ""

    if (bookedNames.length === 0) {
      preview = appointment.services
        .slice(0, 2)
        .map((service) => service.name)
        .join(", ")
    } else if (bookedNames.length <= 2) {
      preview = bookedNames.join(", ")
    } else {
      preview = `${bookedNames.slice(0, 2).join(", ")}, ...`
    }

    if (additionalServices.length > 0) {
      return `${preview}, +${additionalServices.length} dịch vụ phát sinh`
    }

    return preview
  }

  const getReviewedCount = (appointment) => {
    return appointment.services.filter((service) => service.reviewed).length
  }

  const hasUnreviewedService = (appointment) => {
    return appointment.services.some((service) => !service.reviewed)
  }

  const getReviewButtonLabel = (appointment) => {
    const totalServices = appointment.services.length
    const reviewedCount = getReviewedCount(appointment)

    if (reviewedCount === 0) return "Đánh giá dịch vụ"
    if (reviewedCount < totalServices) return "Tiếp tục đánh giá"
    return "Xem đánh giá"
  }

  const openServiceReviewPicker = (appointment) => {
    setServiceReviewPicker(appointment)
  }

  const closeServiceReviewPicker = () => {
    setServiceReviewPicker(null)
  }

  const openViewReviewModal = (appointment, service) => {
    setViewReviewTarget({ appointment, service })
  }

  const closeViewReviewModal = () => {
    setViewReviewTarget(null)
  }

  const openReviewModal = (appointment, service) => {
    setServiceReviewPicker(null)

    setReviewTarget({
      appointmentId: appointment.id,
      idChiTietLH: service.idChiTietLH,
      idDichVu: service.idDichVu,
      serviceName: service.name,
      reviewed: Boolean(service.reviewed),
    })

    setReviewRating(service.review?.rating || 0)
    setReviewContent(service.review?.content || "")
    setReviewImages(service.review?.images || [])
  }

  const closeReviewModal = () => {
    setReviewTarget(null)
    setReviewRating(0)
    setReviewContent("")
    setReviewImages([])
  }

  const handleReviewImagesChange = (event) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    const remainingSlots = 3 - reviewImages.length
    const selectedFiles = files.slice(0, remainingSlots)

    const newImages = selectedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }))

    setReviewImages((prev) => [...prev, ...newImages].slice(0, 3))
    event.target.value = ""
  }

  const removeReviewImage = (imageId) => {
    setReviewImages((prev) => prev.filter((image) => image.id !== imageId))
  }

  const updateServiceReviewInAppointment = (appointment, newReview) => {
    if (!appointment) return appointment

    if (appointment.id !== reviewTarget.appointmentId) {
      return appointment
    }

    return {
      ...appointment,
      services: appointment.services.map((service) =>
        service.idChiTietLH === reviewTarget.idChiTietLH
          ? {
              ...service,
              reviewed: true,
              review: newReview,
            }
          : service
      ),
    }
  }

  const handleSaveReview = () => {
    if (!reviewTarget) return

    if (reviewRating === 0) {
      alert("Vui lòng chọn số sao đánh giá.")
      return
    }

    const newReview = {
      rating: reviewRating,
      content: reviewContent.trim(),
      images: reviewImages,
      idChiTietLH: reviewTarget.idChiTietLH,
      idDichVu: reviewTarget.idDichVu,
    }

    setHistoryAppointments((prev) =>
      prev.map((appointment) =>
        updateServiceReviewInAppointment(appointment, newReview)
      )
    )

    setDetailHistory((prev) =>
      updateServiceReviewInAppointment(prev, newReview)
    )

    closeReviewModal()
  }

  const renderStars = (rating, size = 18) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={size}
        className={index < rating ? "star-filled" : "star-empty"}
        fill={index < rating ? "currentColor" : "none"}
      />
    ))
  }

  const getReviewImageSrc = (image) => {
    if (typeof image === "string") return image
    return image.url
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
                  const additionalCount =
                    getAdditionalServices(appointment).length

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

                          {additionalCount > 0 && (
                            <p className="history-service-subline">
                              Có {additionalCount} dịch vụ phát sinh sau khi
                              thực hiện dịch vụ
                            </p>
                          )}
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

                        <div className="history-card-total-wrap">
                          <small>
                            {appointment.status === "completed"
                              ? "Tổng thanh toán"
                              : "Tổng tiền"}
                          </small>
                          <strong>
                            {formatPrice(getAppointmentTotalPrice(appointment))}
                          </strong>
                        </div>
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
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            className={
                              hasUnreviewedService(appointment)
                                ? "history-review-btn"
                                : "history-reviewed-btn"
                            }
                            onClick={() => openServiceReviewPicker(appointment)}
                          >
                            {getReviewButtonLabel(appointment)}
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

      {detailHistory && (
        <div
          className="history-detail-overlay"
          onClick={() => setDetailHistory(null)}
        >
          <div
            className="history-detail-modal"
            onClick={(event) => event.stopPropagation()}
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
                <div>
                  <p className="history-detail-code">{detailHistory.id}</p>

                  {detailHistory.invoiceCode && (
                    <p className="history-detail-invoice">
                      Hóa đơn: {detailHistory.invoiceCode}
                    </p>
                  )}
                </div>

                <span
                  className={`history-status ${
                    statusMap[detailHistory.status].className
                  }`}
                >
                  {statusMap[detailHistory.status].label}
                </span>
              </div>

              <div className="history-detail-service">
                <span>Dịch vụ đã đặt</span>

                <div className="history-detail-service-list">
                  {getBookedServices(detailHistory).map((service) => (
                    <div
                      className="history-detail-service-row"
                      key={service.idChiTietLH}
                    >
                      <div className="history-detail-service-left">
                        <div className="history-detail-service-thumb">
                          {service.image ? (
                            <img src={service.image} alt={service.name} />
                          ) : (
                            <span>{service.name.charAt(0)}</span>
                          )}
                        </div>

                        <div>
                          <p>{service.name}</p>
                          <small>
                            SL: {service.quantity || 1} • Đơn giá:{" "}
                            {formatPrice(service.price)}
                          </small>
                        </div>
                      </div>

                      <strong>
                        {formatPrice(getServiceLineTotal(service))}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {getAdditionalServices(detailHistory).length > 0 && (
                <div className="history-detail-service history-additional-box">
                  <span>Dịch vụ phát sinh</span>

                  <div className="history-detail-service-list">
                    {getAdditionalServices(detailHistory).map((service) => (
                      <div
                        className="history-detail-service-row"
                        key={service.idChiTietLH}
                      >
                        <div className="history-detail-service-left">
                          <div className="history-detail-service-thumb">
                            {service.image ? (
                              <img src={service.image} alt={service.name} />
                            ) : (
                              <span>{service.name.charAt(0)}</span>
                            )}
                          </div>

                          <div>
                            <div className="history-detail-service-name-row">
                              <p>{service.name}</p>
                              <em>Phát sinh</em>
                            </div>

                            <small>
                              SL: {service.quantity || 1} • Đơn giá:{" "}
                              {formatPrice(service.price)}
                            </small>
                          </div>
                        </div>

                        <strong>
                          {formatPrice(getServiceLineTotal(service))}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

                <div className="history-detail-info-item">
                  <Clock3 size={19} />
                  <span>
                    {formatDurationText(
                      getAppointmentTotalDuration(detailHistory)
                    )}
                  </span>
                </div>
              </div>

              {detailHistory.status === "completed" && (
                <div className="history-payment-info">
                  <div>
                    <span>Phương thức thanh toán</span>
                    <strong>
                      {detailHistory.paymentMethod || "Chưa cập nhật"}
                    </strong>
                  </div>

                  <div>
                    <span>Trạng thái thanh toán</span>
                    <strong>
                      {detailHistory.paymentStatus || "Đã thanh toán"}
                    </strong>
                  </div>
                </div>
              )}

              <div className="history-detail-divider"></div>

              <div className="history-detail-total">
                <span>
                  {detailHistory.status === "completed"
                    ? "Tổng thanh toán"
                    : "Tổng tiền"}
                </span>

                <strong>
                  {formatPrice(getAppointmentTotalPrice(detailHistory))}
                </strong>
              </div>

              {detailHistory.cancelReason && (
                <div className="history-detail-cancel-reason">
                  <strong>Lý do hủy:</strong> {detailHistory.cancelReason}
                </div>
              )}

              {detailHistory.status === "completed" && (
                <div className="history-detail-action">
                  <button
                    type="button"
                    className={
                      hasUnreviewedService(detailHistory)
                        ? "history-review-btn"
                        : "history-reviewed-btn"
                    }
                    onClick={() => openServiceReviewPicker(detailHistory)}
                  >
                    {getReviewButtonLabel(detailHistory)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {serviceReviewPicker && (
        <div
          className="service-review-picker-overlay"
          onClick={closeServiceReviewPicker}
        >
          <div
            className="service-review-picker-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="service-review-picker-header">
              <h3>Đánh giá dịch vụ</h3>

              <button
                type="button"
                className="service-review-picker-close"
                onClick={closeServiceReviewPicker}
              >
                <X size={21} />
              </button>
            </div>

            <div className="service-review-picker-body">
              <p className="service-review-picker-desc">
                Lịch hẹn <strong>{serviceReviewPicker.id}</strong> có{" "}
                <strong>{serviceReviewPicker.services.length}</strong> dịch vụ.
                Bạn có thể đánh giá từng dịch vụ đã sử dụng.
              </p>

              <div className="service-review-picker-list">
                {serviceReviewPicker.services.map((service) => {
                  const isAdditional = getServiceType(service) === "additional"

                  return (
                    <div
                      className="service-review-picker-item"
                      key={service.idChiTietLH}
                    >
                      <div className="service-review-picker-left">
                        <div className="service-review-picker-thumb">
                          {service.image ? (
                            <img src={service.image} alt={service.name} />
                          ) : (
                            <span>{service.name.charAt(0)}</span>
                          )}
                        </div>

                        <div>
                          <div className="service-review-picker-name-row">
                            <h4>{service.name}</h4>
                            {isAdditional && <em>Phát sinh</em>}
                          </div>

                          <p>{formatPrice(getServiceLineTotal(service))}</p>

                          {service.reviewed && (
                            <div className="service-review-stars-mini">
                              {renderStars(service.review?.rating || 0, 14)}
                            </div>
                          )}
                        </div>
                      </div>

                      {service.reviewed ? (
                        <button
                          type="button"
                          className="service-review-picker-btn reviewed"
                          onClick={() =>
                            openViewReviewModal(serviceReviewPicker, service)
                          }
                        >
                          Xem đánh giá
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="service-review-picker-btn"
                          onClick={() =>
                            openReviewModal(serviceReviewPicker, service)
                          }
                        >
                          Đánh giá
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewReviewTarget && (
        <div className="view-review-overlay" onClick={closeViewReviewModal}>
          <div
            className="view-review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="view-review-header">
              <h3>Đánh giá của bạn</h3>

              <button
                type="button"
                className="view-review-close"
                onClick={closeViewReviewModal}
              >
                <X size={21} />
              </button>
            </div>

            <div className="view-review-body">
              <div className="view-review-service">
                <p>Dịch vụ</p>
                <strong>{viewReviewTarget.service.name}</strong>
              </div>

              <div className="view-review-stars">
                {renderStars(viewReviewTarget.service.review?.rating || 0, 24)}
              </div>

              {viewReviewTarget.service.review?.content ? (
                <p className="view-review-content">
                  {viewReviewTarget.service.review.content}
                </p>
              ) : (
                <p className="view-review-empty-content">
                  Bạn chưa nhập nội dung nhận xét.
                </p>
              )}

              {viewReviewTarget.service.review?.images?.length > 0 && (
                <div className="view-review-image-grid">
                  {viewReviewTarget.service.review.images.map(
                    (image, index) => (
                      <img
                        key={image.id || index}
                        src={getReviewImageSrc(image)}
                        alt={`review-${index + 1}`}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            <div className="view-review-actions">
              <button
                type="button"
                className="review-modal-btn secondary"
                onClick={closeViewReviewModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewTarget && (
        <div className="review-modal-overlay" onClick={closeReviewModal}>
          <div
            className="review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="review-modal-header">
              <h3>Đánh giá dịch vụ</h3>

              <button
                type="button"
                className="review-modal-close"
                onClick={closeReviewModal}
              >
                <X size={23} />
              </button>
            </div>

            <div className="review-modal-body">
              <div className="review-modal-intro">
                <p>Bạn đánh giá thế nào về dịch vụ</p>
                <strong>{reviewTarget.serviceName}</strong>
              </div>

              <div className="review-star-picker">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1

                  return (
                    <button
                      key={starValue}
                      type="button"
                      className="review-star-btn"
                      onClick={() => setReviewRating(starValue)}
                    >
                      <Star
                        size={38}
                        className={
                          starValue <= reviewRating
                            ? "star-filled"
                            : "star-empty"
                        }
                        fill={
                          starValue <= reviewRating ? "currentColor" : "none"
                        }
                      />
                    </button>
                  )
                })}
              </div>

              <div className="review-field-block">
                <label className="review-field-label">
                  Nhận xét của bạn (Không bắt buộc)
                </label>

                <textarea
                  className="review-textarea"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  value={reviewContent}
                  onChange={(event) => setReviewContent(event.target.value)}
                />
              </div>

              <div className="review-field-block">
                <label className="review-field-label">
                  Hình ảnh minh họa (Tối đa 3 ảnh)
                </label>

                <input
                  ref={reviewFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleReviewImagesChange}
                />

                <button
                  type="button"
                  className="review-upload-dropzone"
                  onClick={() => reviewFileInputRef.current?.click()}
                  disabled={reviewImages.length >= 3}
                >
                  <Upload size={26} />
                  <span>Nhấn để tải ảnh lên</span>
                </button>

                {reviewImages.length > 0 && (
                  <div className="review-image-preview-grid">
                    {reviewImages.map((image) => (
                      <div className="review-image-preview" key={image.id}>
                        <img src={getReviewImageSrc(image)} alt={image.name} />

                        <button
                          type="button"
                          onClick={() => removeReviewImage(image.id)}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="review-modal-actions">
              <button
                type="button"
                className="review-modal-btn secondary"
                onClick={closeReviewModal}
              >
                Đóng
              </button>

              <button
                type="button"
                className="review-modal-btn primary"
                onClick={handleSaveReview}
              >
                Gửi đánh giá
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