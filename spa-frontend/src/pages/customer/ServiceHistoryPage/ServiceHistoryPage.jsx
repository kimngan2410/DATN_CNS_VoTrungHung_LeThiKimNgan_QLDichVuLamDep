import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Clock3,
  Loader2,
  LogOut,
  RotateCcw,
  Star,
  Upload,
  X,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import { getCurrentUser, logout } from "../../../services/authApi"
import { getAccountProfileApi } from "../../../services/accountApi"
import {
  getMyAppointmentsApi,
  getMyServiceHistoryApi,
} from "../../../services/appointmentApi"

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

  const [historyAppointments, setHistoryAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [profileData, setProfileData] = useState(() => {
    const user = getCurrentUser()

    return {
      avatar: user?.avatar || user?.anhDaiDien || "",
      fullName: user?.hoTen || user?.fullName || "Khách hàng",
      email: user?.email || "",
    }
  })

  const [appointmentCount, setAppointmentCount] = useState(0)

  const historyTabs = [
    { value: "all", label: "Tất cả" },
    { value: "completed", label: "Đã hoàn thành" },
    { value: "cancelled", label: "Đã huỷ" },
    { value: "no_show", label: "Không đến" },
  ]

  const statusMap = {
    completed: {
      label: "Đã hoàn thành",
      className: "history-status-completed",
    },
    cancelled: {
      label: "Đã huỷ",
      className: "history-status-cancelled",
    },
    no_show: {
      label: "Không đến",
      className: "history-status-no-show",
    },
  }

  const fetchServiceHistory = useCallback(async () => {
    const user = getCurrentUser()

    if (!user?.maTK) {
      navigate("/dang-nhap", { replace: true })
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage("")

      const [historyData, profile, appointmentData] = await Promise.all([
        getMyServiceHistoryApi(user.maTK),
        getAccountProfileApi(user.maTK).catch(() => null),
        getMyAppointmentsApi(user.maTK).catch(() => []),
      ])

      setHistoryAppointments(historyData)

      if (profile) {
        setProfileData({
          avatar: profile.avatar,
          fullName: profile.fullName,
          email: profile.email,
        })
      }

      const activeAppointmentCount = appointmentData.filter((item) =>
        ["pending", "confirmed"].includes(item.status)
      ).length

      setAppointmentCount(activeAppointmentCount)
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải lịch sử dịch vụ.")
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServiceHistory()
  }, [fetchServiceHistory])

  const filteredHistory = useMemo(() => {
    const historyOnly = historyAppointments.filter((item) =>
      ["completed", "cancelled", "no_show"].includes(item.status)
    )

    if (activeStatus === "all") return historyOnly

    return historyOnly.filter((item) => item.status === activeStatus)
  }, [historyAppointments, activeStatus])

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(Number(price || 0)) + " đ"
  }

  const formatVietnameseDate = (dateString) => {
    if (!dateString) return ""

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

  const getServices = (appointment) => {
    return appointment?.services || []
  }

  const getServiceType = (service) => {
    if (service.type) return service.type
    if (service.isAdditional) return "additional"
    return "booked"
  }

  const getBookedServices = (appointment) => {
    return getServices(appointment).filter(
      (service) => getServiceType(service) === "booked"
    )
  }

  const getAdditionalServices = (appointment) => {
    return getServices(appointment).filter(
      (service) => getServiceType(service) === "additional"
    )
  }

  const getServiceLineTotal = (service) => {
    const quantity = Number(service.quantity || 1)
    return Number(service.price || 0) * quantity
  }

  const getAppointmentTotalPrice = (appointment) => {
    if (appointment?.totalPrice !== undefined) {
      return Number(appointment.totalPrice || 0)
    }

    return getServices(appointment).reduce((sum, service) => {
      return sum + getServiceLineTotal(service)
    }, 0)
  }

  const getAppointmentTotalDuration = (appointment) => {
    if (appointment?.totalDuration !== undefined) {
      return Number(appointment.totalDuration || 0)
    }

    return getServices(appointment).reduce((sum, service) => {
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
    if (!startTime) return ""

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
    if (appointment?.endTime) {
      return `${appointment.time} - ${appointment.endTime}`
    }

    const totalDuration = getAppointmentTotalDuration(appointment)
    const endTime = getEndTime(appointment?.time, totalDuration)

    return `${appointment?.time || ""} - ${endTime}`
  }

  const getServiceNames = (appointment) => {
    return getServices(appointment)
      .map((service) => service.name)
      .join(", ")
  }

  const getServiceNamesPreview = (appointment) => {
    const services = getServices(appointment)
    const bookedServices = getBookedServices(appointment)
    const additionalServices = getAdditionalServices(appointment)

    const bookedNames = bookedServices.map((service) => service.name)

    let preview = ""

    if (bookedNames.length === 0) {
      preview = services
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
    return getServices(appointment).filter((service) => service.reviewed).length
  }

  const hasUnreviewedService = (appointment) => {
    return getServices(appointment).some((service) => !service.reviewed)
  }

  const getReviewButtonLabel = (appointment) => {
    const totalServices = getServices(appointment).length
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
      services: getServices(appointment).map((service) =>
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

  const canRebookAppointment = (appointment) => {
    return ["cancelled", "no_show"].includes(appointment?.status)
  }

  const getRebookServiceId = (service) => {
    const rawId = service.idDichVu ?? service.id

    const serviceId = Number(rawId)

    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return null
    }

    return serviceId
  }

  const handleRebookAppointment = (appointment, event) => {
    if (event) {
      event.stopPropagation()
    }

    const services = getServices(appointment)

    if (services.length === 0) {
      alert("Không tìm thấy dịch vụ để đặt lại.")
      return
    }

    const rebookServices = services
      .map((service) => {
        const serviceId = getRebookServiceId(service)

        if (!serviceId) return null

        return {
          id: serviceId,
          idDichVu: serviceId,
          title: service.name || service.title || "Dịch vụ",
          name: service.name || service.title || "Dịch vụ",
          price: Number(service.price || 0),
          duration: Number(service.duration || 0),
          quantity: Math.max(1, Number(service.quantity || 1)),
          image: service.image || "",
          category: service.category || "",
        }
      })
      .filter(Boolean)

    if (rebookServices.length === 0) {
      alert(
        "Không thể đặt lại vì dữ liệu dịch vụ cũ đang thiếu mã dịch vụ. Vui lòng kiểm tra API lịch sử dịch vụ."
      )
      return
    }

    sessionStorage.setItem("rebook_services", JSON.stringify(rebookServices))

    navigate("/dat-lich?from=history&rebook=1", {
      state: {
        from: "history",
        rebookServices,
        sourceAppointmentId: appointment.appointmentId || appointment.id,
      },
    })
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
            <div className="service-history-header-card">
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
            </div>

            {isLoading ? (
              <div className="service-history-empty service-history-loading">
                <Loader2 size={28} className="service-history-loading-icon" />
                <p>Đang tải lịch sử dịch vụ...</p>
              </div>
            ) : errorMessage ? (
              <div className="service-history-empty">
                <p>{errorMessage}</p>

                <button
                  type="button"
                  className="history-review-btn"
                  onClick={fetchServiceHistory}
                >
                  Thử lại
                </button>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="service-history-empty">
                <p>Không có lịch sử dịch vụ thuộc trạng thái này.</p>
              </div>
            ) : (
              <div className="service-history-list">
                {filteredHistory.map((appointment) => {
                  const statusInfo =
                    statusMap[appointment.status] || statusMap.cancelled
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

                      <div className="history-card-bottom history-card-bottom--price-only">
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
                          <strong>Lý do huỷ:</strong>{" "}
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

                      {canRebookAppointment(appointment) && (
                        <div
                          className="history-action-row"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="history-rebook-btn"
                            onClick={(event) => handleRebookAppointment(appointment, event)}
                          >
                            <RotateCcw size={17} />
                            <span>Đặt lại</span>
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
                    (statusMap[detailHistory.status] || statusMap.cancelled)
                      .className
                  }`}
                >
                  {(statusMap[detailHistory.status] || statusMap.cancelled)
                    .label}
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
                            Số lượng: {service.quantity || 1} • Thời lượng:{" "}
                            {service.duration || 0} phút
                          </small>
                        </div>
                      </div>

                      <div className="history-detail-service-price">
                        <span>{formatPrice(service.price)} / lượt</span>
                        <strong>{formatPrice(getServiceLineTotal(service))}</strong>
                      </div>
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
                              Số lượng: {service.quantity || 1} • Thời lượng:{" "}
                              {service.duration || 0} phút
                            </small>
                          </div>
                        </div>

                        <div className="history-detail-service-price">
                          <span>{formatPrice(service.price)} / lượt</span>
                          <strong>{formatPrice(getServiceLineTotal(service))}</strong>
                        </div>
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
                  <Clock3 size={19} />
                  <span>
                    {formatDurationText(getAppointmentTotalDuration(detailHistory))}
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
                  <strong>Lý do huỷ:</strong> {detailHistory.cancelReason}
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

              {canRebookAppointment(detailHistory) && (
                <div className="history-detail-action">
                  <button
                    type="button"
                    className="history-rebook-btn"
                    onClick={(event) => handleRebookAppointment(detailHistory, event)}
                  >
                    <RotateCcw size={17} />
                    <span>Đặt lại</span>
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
                <strong>{getServices(serviceReviewPicker).length}</strong> dịch
                vụ. Bạn có thể đánh giá từng dịch vụ đã sử dụng.
              </p>

              <div className="service-review-picker-list">
                {getServices(serviceReviewPicker).map((service) => {
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