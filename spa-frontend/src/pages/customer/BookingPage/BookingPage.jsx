import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  CalendarDays,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Check,
  Users,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"

import {
  services,
  formatPrice,
  serviceCategories,
} from "../../../data/serviceData"

import "./BookingPage.css"

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

function BookingPage() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const serviceSlug = params.get("service")

  const customerInfo = {
    fullName: "Nguyễn Thị Mai",
    phone: "0901234567",
  }

  const activeServices = useMemo(() => {
    return services.filter((service) => service.isActive)
  }, [])

  const bookingCategories = useMemo(() => {
    return serviceCategories.filter((category) => category && category !== "")
  }, [])

  const defaultService = useMemo(() => {
    return (
      activeServices.find((service) => service.slug === serviceSlug) ||
      activeServices[0]
    )
  }, [activeServices, serviceSlug])

  const [step, setStep] = useState(1)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const [selectedServiceIds, setSelectedServiceIds] = useState(
    defaultService?.id ? [defaultService.id] : []
  )

  const [selectedDate, setSelectedDate] = useState(null)
  const [tempDate, setTempDate] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)

  const [openServiceModal, setOpenServiceModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState(
    defaultService?.category || "Tất cả"
  )

  const [selectedTime, setSelectedTime] = useState("")
  const [note, setNote] = useState("")
  const [peopleCount, setPeopleCount] = useState(1)

  const [notice, setNotice] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  })

  const showNotice = ({ type = "warning", title, message }) => {
    setNotice({
      open: true,
      type,
      title,
      message,
    })
  }

  const closeNotice = () => {
    setNotice((prev) => ({
      ...prev,
      open: false,
    }))
  }

  const selectedServices = useMemo(() => {
    return activeServices.filter((service) =>
      selectedServiceIds.some((id) => String(id) === String(service.id))
    )
  }, [activeServices, selectedServiceIds])

  const totalPrice = selectedServices.reduce((sum, service) => {
    return sum + Number(service.price || 0)
  }, 0)

  const finalTotalPrice = totalPrice * peopleCount

  const totalDuration = selectedServices.reduce((sum, service) => {
    return sum + Number(service.duration || 0)
  }, 0)

  const categoryPreviewMap = useMemo(() => {
    const result = {}

    bookingCategories.forEach((category) => {
      if (category === "Tất cả") {
        result[category] = activeServices[0]?.image || ""
      } else {
        result[category] =
          activeServices.find((service) => service.category === category)
            ?.image || ""
      }
    })

    return result
  }, [bookingCategories, activeServices])

  const filteredServicesForModal = useMemo(() => {
    const baseServices =
      activeCategory === "Tất cả"
        ? activeServices
        : activeServices.filter((service) => service.category === activeCategory)

    return [...baseServices].sort((a, b) => {
      const aSelected = selectedServiceIds.some(
        (id) => String(id) === String(a.id)
      )

      const bSelected = selectedServiceIds.some(
        (id) => String(id) === String(b.id)
      )

      if (aSelected === bSelected) return 0

      return aSelected ? 1 : -1
    })
  }, [activeServices, activeCategory, selectedServiceIds])

  const openServiceSelector = () => {
    setActiveCategory(defaultService?.category || "Tất cả")
    setOpenServiceModal(true)
  }

  const handleAddService = (serviceId) => {
    setSelectedServiceIds((prev) => {
      const existed = prev.some((id) => String(id) === String(serviceId))

      if (existed) return prev

      return [...prev, serviceId]
    })
  }

  const handleRemoveService = (serviceId) => {
    if (selectedServiceIds.length === 1) {
      showNotice({
        type: "warning",
        title: "Không thể bỏ dịch vụ",
        message: "Bạn cần chọn ít nhất 1 dịch vụ để đặt lịch.",
      })

      return
    }

    setSelectedServiceIds((prev) =>
      prev.filter((id) => String(id) !== String(serviceId))
    )
  }

  const handleToggleService = (serviceId) => {
    const existed = selectedServiceIds.some(
      (id) => String(id) === String(serviceId)
    )

    if (existed) {
      handleRemoveService(serviceId)
      return
    }

    handleAddService(serviceId)
  }

  const handleDecreasePeople = () => {
    setPeopleCount((prev) => {
      if (prev <= 1) return 1
      return prev - 1
    })
  }

  const handleIncreasePeople = () => {
    setPeopleCount((prev) => prev + 1)
  }

  const openDateModal = () => {
    setTempDate(selectedDate || new Date())
    setOpenCalendar(true)
  }

  const applyDate = () => {
    if (!tempDate) return

    setSelectedDate(tempDate)
    setSelectedTime("")
    setOpenCalendar(false)
  }

  const handleContinue = () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
      showNotice({
        type: "warning",
        title: "Thiếu thông tin đặt lịch",
        message:
          "Vui lòng chọn đầy đủ dịch vụ, ngày và giờ hẹn trước khi tiếp tục.",
      })

      return
    }

    setStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log({
      lichHen: {
        soLuongNguoi: peopleCount,
        tongTien: finalTotalPrice,
        tongThoiLuong: totalDuration,
        ngayHen: selectedDate,
        gioHen: selectedTime,
        ghiChu: note,
        trangThai: "Chờ xác nhận",
      },
      chiTietLichHen: selectedServices.map((service) => ({
        idDichVu: service.id,
        tenDichVu: service.title,
        donGia: service.price,
        thoiLuongPhut: service.duration,
        soLuong: peopleCount,
      })),
    })

    setBookingSuccess(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (bookingSuccess) {
    return (
      <div className="booking-page">
        <Header />

        <main className="booking-success-main">
          <section className="booking-success-card">
            <div className="booking-success-icon">
              <CheckCircle2 size={58} />
            </div>

            <h1>Đặt lịch thành công!</h1>

            <p className="booking-success-message">
              Cảm ơn bạn đã chọn Serenity Spa. Lịch hẹn của bạn đang chờ xác
              nhận. Chúng tôi sẽ liên hệ sớm nhất.
            </p>

            <div className="booking-success-info">
              <div className="success-info-row success-info-row-full">
                <span>Dịch vụ</span>

                <div className="success-service-list">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="success-service-item">
                      {service.title}
                    </div>
                  ))}
                </div>
              </div>

              <div className="success-info-grid">
                <div>
                  <span>Thời gian</span>
                  <strong>
                    {selectedTime} -{" "}
                    {selectedDate?.toLocaleDateString("vi-VN")}
                  </strong>
                </div>

                <div>
                  <span>Khách hàng</span>
                  <strong>{customerInfo.fullName}</strong>
                </div>
              </div>

              <div className="success-info-grid">
                <div>
                  <span>Số lượng người</span>
                  <strong>{peopleCount} người</strong>
                </div>

                <div>
                  <span>Tổng tiền</span>
                  <strong>{formatPrice(finalTotalPrice)}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="booking-success-primary"
              onClick={() => {
                console.log("Xem lịch hẹn của tôi")
              }}
            >
              Xem lịch hẹn của tôi
            </button>

            <button
              type="button"
              className="booking-success-secondary"
              onClick={() => {
                window.location.href = "/"
              }}
            >
              Về trang chủ
            </button>
          </section>
        </main>

        <FloatingChat />
      </div>
    )
  }

  return (
    <div className="booking-page">
      <Header />

      <main className="booking-main">
        <section className="booking-hero">
          <h1>Đặt lịch hẹn</h1>
          <p>Chọn dịch vụ và thời gian phù hợp với bạn</p>

          <div className="booking-steps">
            <span
              className={`booking-step ${
                step === 1 ? "booking-step--active" : ""
              }`}
            >
              1
            </span>

            <span className="booking-step-line"></span>

            <span
              className={`booking-step ${
                step === 2 ? "booking-step--active" : ""
              }`}
            >
              2
            </span>
          </div>
        </section>

        <section className="booking-section">
          <form className="booking-card" onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <div className="booking-field">
                  <div className="booking-label-row">
                    <label>
                      Dịch vụ đã chọn <span>*</span>
                    </label>

                    <button
                      type="button"
                      className="btn-add-service"
                      onClick={openServiceSelector}
                    >
                      <Plus size={18} />
                      Thêm dịch vụ
                    </button>
                  </div>

                  <div className="selected-service-box">
                    <div className="selected-service-head">
                      <div className="selected-service-title">
                        <ShoppingBag size={20} />
                        <span>Serenity Spa</span>
                      </div>

                      <div className="selected-service-columns">
                        <span>Đơn giá</span>
                        <span>Thao tác</span>
                      </div>
                    </div>

                    {selectedServices.map((service) => (
                      <div className="selected-service-item" key={service.id}>
                        <div className="service-info-left">
                          <div className="service-thumb">
                            {service.image ? (
                              <img src={service.image} alt={service.title} />
                            ) : (
                              <ShoppingBag size={26} />
                            )}
                          </div>

                          <div>
                            <h4>{service.title}</h4>

                            <p>
                              {service.duration
                                ? `Thời lượng: ${service.duration} phút`
                                : "Dịch vụ chăm sóc sắc đẹp"}
                            </p>
                          </div>
                        </div>

                        <div className="service-price">
                          {formatPrice(service.price)}
                        </div>

                        <button
                          type="button"
                          className="btn-remove-service"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          <Trash2 size={18} />
                          Xóa
                        </button>
                      </div>
                    ))}

                    <div className="selected-service-total">
                      <span>
                        Tổng cộng ({selectedServices.length} dịch vụ x{" "}
                        {peopleCount} người):
                      </span>

                      <strong>{formatPrice(finalTotalPrice)}</strong>
                    </div>
                  </div>
                </div>

                <div className="booking-field">
                  <label>
                    Số lượng người <span>*</span>
                  </label>

                  <div className="people-count-box">
                    <div className="people-count-info">
                      <Users size={22} />

                      <div>
                        <h4>Số khách sử dụng dịch vụ</h4>
                        <p>Chọn số lượng người đi cùng trong lịch hẹn này</p>
                      </div>
                    </div>

                    <div className="people-count-control">
                      <button
                        type="button"
                        className="people-count-btn"
                        onClick={handleDecreasePeople}
                        disabled={peopleCount <= 1}
                      >
                        <Minus size={18} />
                      </button>

                      <span className="people-count-number">{peopleCount}</span>

                      <button
                        type="button"
                        className="people-count-btn"
                        onClick={handleIncreasePeople}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="booking-field">
                  <label>
                    Chọn ngày <span>*</span>
                  </label>

                  <button
                    type="button"
                    className="booking-date-trigger"
                    onClick={openDateModal}
                  >
                    <CalendarDays size={21} />

                    <span>
                      {selectedDate
                        ? selectedDate.toLocaleDateString("vi-VN")
                        : "-- Chọn ngày hẹn --"}
                    </span>
                  </button>
                </div>

                <div className="booking-field">
                  <label>
                    Chọn giờ <span>*</span>
                  </label>

                  <div className="booking-time-grid">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={!selectedDate}
                        className={`booking-time ${
                          selectedTime === time ? "active" : ""
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="booking-field">
                  <label>Ghi chú (Không bắt buộc)</label>

                  <div className="booking-note-wrap">
                    <FileText size={21} />

                    <textarea
                      placeholder="Yêu cầu đặc biệt của bạn..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="booking-submit"
                  onClick={handleContinue}
                >
                  Tiếp tục
                </button>
              </>
            )}

            {step === 2 && (
              <div className="booking-confirm booking-confirm-modern">
                <h3>Xác nhận thông tin đặt lịch</h3>

                <div className="confirm-divider"></div>

                <div className="confirm-info-list">
                  <div className="confirm-info-row">
                    <span>Khách hàng</span>
                    <strong>{customerInfo.fullName}</strong>
                  </div>

                  <div className="confirm-info-row">
                    <span>Số điện thoại</span>
                    <strong>{customerInfo.phone}</strong>
                  </div>

                  <div className="confirm-info-row confirm-info-row--top">
                    <span>Dịch vụ</span>

                    <div className="confirm-service-summary">
                      {selectedServices.map((service) => (
                        <div className="confirm-service-line" key={service.id}>
                          <strong>{service.title}</strong>
                          <small>
                            {service.duration
                              ? `${service.duration} phút`
                              : "Dịch vụ"}{" "}
                            · {formatPrice(service.price)}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="confirm-info-row">
                    <span>Số lượng người</span>
                    <strong>{peopleCount} người</strong>
                  </div>

                  <div className="confirm-info-row">
                    <span>Thời gian</span>
                    <strong className="confirm-highlight">
                      {selectedTime} -{" "}
                      {selectedDate?.toLocaleDateString("vi-VN")}
                    </strong>
                  </div>

                  <div className="confirm-info-row">
                    <span>Tổng thời lượng</span>
                    <strong>{totalDuration} phút</strong>
                  </div>

                  <div className="confirm-info-row">
                    <span>Tổng tiền dự kiến</span>
                    <strong className="confirm-total">
                      {formatPrice(finalTotalPrice)}
                    </strong>
                  </div>

                  {note && (
                    <div className="confirm-info-row confirm-info-row--top">
                      <span>Ghi chú</span>
                      <strong className="confirm-note">{note}</strong>
                    </div>
                  )}
                </div>

                <div className="confirm-actions confirm-actions-modern">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => setStep(1)}
                  >
                    Quay lại
                  </button>

                  <button type="submit" className="booking-submit">
                    Xác nhận đặt lịch
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>
      </main>

      {openServiceModal && (
        <div className="service-modal-overlay">
          <div className="service-modal service-modal--dark">
            <button
              type="button"
              className="service-modal-close"
              onClick={() => setOpenServiceModal(false)}
            >
              <X size={22} />
            </button>

            <div className="service-modal-header">
              <h3>Chọn dịch vụ cho lịch hẹn</h3>

              <p>
                Chọn nhóm dịch vụ rồi nhấn vào dịch vụ tương ứng để thêm hoặc
                bỏ dịch vụ trong lịch hẹn của bạn.
              </p>
            </div>

            <div className="service-category-tabs">
              {bookingCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`service-category-tab ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  <div className="service-category-thumb">
                    {categoryPreviewMap[category] ? (
                      <img src={categoryPreviewMap[category]} alt={category} />
                    ) : (
                      <span>{category.charAt(0)}</span>
                    )}
                  </div>

                  <span>{category}</span>
                </button>
              ))}
            </div>

            <div className="service-card-list">
              <div className="service-card-grid">
                {filteredServicesForModal.map((service) => {
                  const isAdded = selectedServiceIds.some(
                    (id) => String(id) === String(service.id)
                  )

                  return (
                    <div
                      className={`service-picker-card ${
                        isAdded ? "is-added" : ""
                      }`}
                      key={service.id}
                      onClick={() => handleToggleService(service.id)}
                    >
                      <div className="service-picker-image">
                        {service.image ? (
                          <img src={service.image} alt={service.title} />
                        ) : (
                          <div className="service-picker-placeholder">
                            <ShoppingBag size={28} />
                          </div>
                        )}
                      </div>

                      <div className="service-picker-content">
                        <div className="service-picker-top">
                          <h4>{service.title}</h4>

                          <div
                            className={`service-top-check ${
                              isAdded ? "is-checked" : ""
                            }`}
                          >
                            {isAdded && <Check size={14} />}
                          </div>
                        </div>

                        <p className="service-picker-description">
                          {service.description}
                        </p>

                        <div className="service-picker-meta">
                          <span className="service-picker-chip">
                            {service.category}
                          </span>

                          {service.duration && (
                            <span className="service-picker-chip">
                              {service.duration} phút
                            </span>
                          )}
                        </div>

                        <div
                          className={`service-price-pill ${
                            isAdded ? "is-checked" : ""
                          }`}
                        >
                          {formatPrice(service.price)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="service-modal-footer">
              <button
                type="button"
                className="service-modal-done"
                onClick={() => setOpenServiceModal(false)}
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {openCalendar && (
        <div className="calendar-overlay">
          <div className="calendar-modal">
            <button
              type="button"
              className="calendar-close"
              onClick={() => setOpenCalendar(false)}
            >
              <X size={22} />
            </button>

            <DatePicker
              inline
              selected={tempDate}
              onChange={(date) => setTempDate(date)}
              minDate={new Date()}
              calendarStartDay={1}
              fixedHeight
              showPopperArrow={false}
              renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                <div className="calendar-header">
                  <button
                    type="button"
                    className="calendar-nav"
                    onClick={decreaseMonth}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <h3 className="calendar-title">
                    tháng {date.getMonth() + 1} năm {date.getFullYear()}
                  </h3>

                  <button
                    type="button"
                    className="calendar-nav calendar-nav--next"
                    onClick={increaseMonth}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            />

            <button
              type="button"
              className="calendar-apply"
              onClick={applyDate}
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {notice.open && (
        <div className="notice-overlay">
          <div className={`notice-modal notice-modal--${notice.type}`}>
            <button
              type="button"
              className="notice-close"
              onClick={closeNotice}
            >
              <X size={20} />
            </button>

            <div className="notice-icon">
              {notice.type === "success" ? (
                <CheckCircle2 size={34} />
              ) : (
                <AlertCircle size={34} />
              )}
            </div>

            <h3>{notice.title}</h3>

            <p>{notice.message}</p>

            <button
              type="button"
              className="notice-button"
              onClick={closeNotice}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      <Footer />
      <FloatingChat />
    </div>
  )
}

export default BookingPage