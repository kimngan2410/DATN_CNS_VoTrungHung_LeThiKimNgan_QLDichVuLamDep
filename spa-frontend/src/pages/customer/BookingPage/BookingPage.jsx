import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
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
  Loader2,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"

import {
  getServiceCategoriesApi,
  getServicesApi,
} from "../../../services/serviceApi"
import {
  createAppointmentApi,
  getAvailableBookingSlotsApi,
} from "../../../services/bookingApi"
import { getCurrentUser } from "../../../services/authApi"

import "./BookingPage.css"

const SPA_OPEN_TIME = "09:00"
const SPA_CLOSE_TIME = "21:00"
const TIME_SLOT_STEP_MINUTES = 30

function timeToMinutes(time) {
  const [hour, minute] = time.split(":").map(Number)

  return hour * 60 + minute
}

function minutesToTime(totalMinutes) {
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0")
  const minute = String(totalMinutes % 60).padStart(2, "0")

  return `${hour}:${minute}`
}

function generateTimeSlots(
  start = SPA_OPEN_TIME,
  end = SPA_CLOSE_TIME,
  stepMinutes = TIME_SLOT_STEP_MINUTES
) {
  const startTotalMinutes = timeToMinutes(start)
  const endTotalMinutes = timeToMinutes(end)

  const slots = []

  // Chỉ sinh giờ bắt đầu trước giờ đóng cửa.
  // 21:00 là giờ kết thúc phục vụ, không phải giờ bắt đầu lịch hẹn.
  for (
    let totalMinutes = startTotalMinutes;
    totalMinutes < endTotalMinutes;
    totalMinutes += stepMinutes
  ) {
    slots.push(minutesToTime(totalMinutes))
  }

  return slots
}

const timeSlots = generateTimeSlots()

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatDateForApi(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getServiceTitle(service) {
  return (
    service?.title ||
    service?.name ||
    service?.tenDichVu ||
    service?.tenDV ||
    "Dịch vụ"
  )
}

function normalizeRebookService(service) {
  const serviceId = Number(service.idDichVu || service.id)

  return {
    ...service,
    id: serviceId,
    idDichVu: serviceId,
    title: getServiceTitle(service),
    name: getServiceTitle(service),
    price: Number(service.price || service.donGia || 0),
    duration: Number(service.duration || service.thoiLuongPhut || 0),
    quantity: Math.max(1, Number(service.quantity || service.soLuong || 1)),
    image: service.image || service.hinhAnh || "",
    category: service.category || service.tenDanhMuc || "",
    description: service.description || service.moTaNgan || "",
    isActive: true,
  }
}

function getRebookServicesFromStorage() {
  try {
    const data = JSON.parse(sessionStorage.getItem("rebook_services") || "[]")

    if (!Array.isArray(data)) return []

    return data.map(normalizeRebookService).filter((service) => service.id)
  } catch {
    return []
  }
}

function BookingPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const serviceSlug = params.get("service")
  const fromPage = params.get("from")
  const isRebookMode = params.get("rebook") === "1" || fromPage === "history"
  const initialQuantity = Math.max(1, Number(params.get("quantity") || 1))

  const currentUser = getCurrentUser()

  const customerInfo = {
    fullName: currentUser?.hoTen || currentUser?.fullName || "Khách hàng",
    phone: currentUser?.sdt || currentUser?.email || "",
  }

  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)

  const [step, setStep] = useState(1)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedServiceIds, setSelectedServiceIds] = useState([])
  const [serviceQuantities, setServiceQuantities] = useState({})

  const [selectedDate, setSelectedDate] = useState(null)
  const [tempDate, setTempDate] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)

  const [openServiceModal, setOpenServiceModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Tất cả")

  const [selectedTime, setSelectedTime] = useState("")
  const [note, setNote] = useState("")
  const [now, setNow] = useState(new Date())

  const [bookingSlots, setBookingSlots] = useState([])
  const [isLoadingBookingSlots, setIsLoadingBookingSlots] = useState(false)
  const [bookingSlotError, setBookingSlotError] = useState("")

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

  const getBackPath = () => {
    if (fromPage === "history") {
      return "/lich-su-dich-vu"
    }

    if (fromPage === "list") {
      return "/dich-vu"
    }

    if (fromPage === "detail" && serviceSlug) {
      return `/dich-vu/${serviceSlug}`
    }

    if (serviceSlug) {
      return `/dich-vu/${serviceSlug}`
    }

    return "/dich-vu"
  }

  const handleBackToPreviousPage = () => {
    navigate(getBackPath())
  }

  const activeServices = useMemo(() => {
    return services.filter((service) => service.isActive !== false)
  }, [services])

  const bookingCategories = useMemo(() => {
    return ["Tất cả", ...categories.map((category) => category.tenDM)]
  }, [categories])

  const selectedServices = useMemo(() => {
    return activeServices.filter((service) =>
      selectedServiceIds.some((id) => String(id) === String(service.id))
    )
  }, [activeServices, selectedServiceIds])

  const getServiceQuantity = (serviceId) => {
    return Math.max(1, Number(serviceQuantities[String(serviceId)] || 1))
  }

  const finalTotalPrice = selectedServices.reduce((sum, service) => {
    return sum + Number(service.price || 0) * getServiceQuantity(service.id)
  }, 0)

  const totalPeopleCount = selectedServices.reduce((sum, service) => {
    return sum + getServiceQuantity(service.id)
  }, 0)

  const totalDuration = selectedServices.reduce((sum, service) => {
    return sum + Number(service.duration || 0)
  }, 0)

  const selectedTimeEndText =
    selectedTime && totalDuration > 0
      ? minutesToTime(timeToMinutes(selectedTime) + totalDuration)
      : ""

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

      return aSelected ? -1 : 1
    })
  }, [activeServices, activeCategory, selectedServiceIds])

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setIsLoadingServices(true)

        const [categoryData, serviceData] = await Promise.all([
          getServiceCategoriesApi(),
          getServicesApi(),
        ])

        const stateServices = Array.isArray(location.state?.rebookServices)
          ? location.state.rebookServices
          : []

        const storageServices = getRebookServicesFromStorage()

        const rebookServices =
          stateServices.length > 0
            ? stateServices.map(normalizeRebookService).filter((item) => item.id)
            : storageServices

        let nextServices = Array.isArray(serviceData) ? [...serviceData] : []

        if (isRebookMode && rebookServices.length > 0) {
          const serviceIdsInApi = nextServices.map((service) =>
            String(service.id)
          )

          const missingRebookServices = rebookServices.filter(
            (service) => !serviceIdsInApi.includes(String(service.id))
          )

          nextServices = [...nextServices, ...missingRebookServices]
        }

        setCategories(categoryData)
        setServices(nextServices)

        if (isRebookMode && rebookServices.length > 0) {
          const selectedIds = rebookServices.map((service) => service.id)

          const quantityMap = rebookServices.reduce((result, service) => {
            result[String(service.id)] = Math.max(
              1,
              Number(service.quantity || 1)
            )
            return result
          }, {})

          setSelectedServiceIds(selectedIds)
          setServiceQuantities(quantityMap)
          setActiveCategory(rebookServices[0]?.category || "Tất cả")

          sessionStorage.removeItem("rebook_services")
          return
        }

        const selectedService =
          nextServices.find(
            (service) => String(service.id) === String(serviceSlug)
          ) || nextServices[0]

        if (selectedService) {
          setSelectedServiceIds([selectedService.id])
          setServiceQuantities({
            [String(selectedService.id)]: initialQuantity,
          })
          setActiveCategory(selectedService.category || "Tất cả")
        }
      } catch (error) {
        console.error(error)

        showNotice({
          type: "warning",
          title: "Không tải được dịch vụ",
          message:
            "Không thể tải danh sách dịch vụ từ hệ thống. Vui lòng kiểm tra backend.",
        })
      } finally {
        setIsLoadingServices(false)
      }
    }

    fetchBookingData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceSlug, initialQuantity, isRebookMode, location.state])

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!selectedDate || selectedServices.length === 0 || totalDuration <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBookingSlots([])
      setBookingSlotError("")
      return
    }

    let ignore = false

    const fetchAvailableSlots = async () => {
      try {
        setIsLoadingBookingSlots(true)
        setBookingSlotError("")

        const data = await getAvailableBookingSlotsApi({
          ngay: formatDateForApi(selectedDate),
          thoiLuong: totalDuration,
        })

        if (!ignore) {
          setBookingSlots(Array.isArray(data?.slots) ? data.slots : [])
        }
      } catch (error) {
        if (!ignore) {
          setBookingSlots([])
          setBookingSlotError(
            error.message || "Không thể kiểm tra khung giờ khả dụng."
          )
        }
      } finally {
        if (!ignore) {
          setIsLoadingBookingSlots(false)
        }
      }
    }

    fetchAvailableSlots()

    return () => {
      ignore = true
    }
  }, [selectedDate, selectedServices.length, totalDuration])

  const formatDurationText = (minutes) => {
    const total = Number(minutes || 0)
    const hours = Math.floor(total / 60)
    const mins = total % 60

    if (hours > 0 && mins > 0) return `${hours} giờ ${mins} phút`
    if (hours > 0) return `${hours} giờ`
    return `${mins} phút`
  }

  const formatVietnameseDate = (date) => {
    if (!date) return ""

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

  const isSameDay = (dateA, dateB) => {
    if (!dateA || !dateB) return false

    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    )
  }

  const bookingSlotMap = useMemo(() => {
    return bookingSlots.reduce((result, slot) => {
      result[slot.startTime] = slot
      return result
    }, {})
  }, [bookingSlots])

  const getTimeSlotDisabledReason = (time) => {
    if (!selectedDate) return "Vui lòng chọn ngày hẹn trước"

    if (selectedServices.length === 0) {
      return "Vui lòng chọn ít nhất một dịch vụ trước"
    }

    if (totalDuration <= 0) {
      return "Dịch vụ chưa có thời lượng hợp lệ"
    }

    const startMinutes = timeToMinutes(time)
    const endMinutes = startMinutes + totalDuration
    const openMinutes = timeToMinutes(SPA_OPEN_TIME)
    const closeMinutes = timeToMinutes(SPA_CLOSE_TIME)

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      return `Dịch vụ kéo dài ${formatDurationText(
        totalDuration
      )}, nếu bắt đầu lúc ${time} sẽ kết thúc lúc ${minutesToTime(
        endMinutes
      )}, vượt quá giờ đóng cửa ${SPA_CLOSE_TIME}`
    }

    if (isSameDay(selectedDate, now)) {
      const [hour, minute] = time.split(":").map(Number)

      const slotDateTime = new Date(selectedDate)
      slotDateTime.setHours(hour, minute, 0, 0)

      if (slotDateTime <= now) {
        return "Khung giờ này đã qua"
      }
    }

    if (isLoadingBookingSlots) {
      return "Đang kiểm tra khung giờ"
    }

    if (bookingSlotError) {
      return bookingSlotError
    }

    const slotInfo = bookingSlotMap[time]

    if (slotInfo && !slotInfo.available) {
      return slotInfo.reason || "Khung giờ này đã hết chỗ"
    }

    return ""
  }

  const isTimeSlotDisabled = (time) => {
    return Boolean(getTimeSlotDisabledReason(time))
  }

  const hasAvailableTimeSlots = selectedDate
    ? timeSlots.some((time) => !isTimeSlotDisabled(time))
    : true

  useEffect(() => {
    if (selectedTime && isTimeSlotDisabled(selectedTime)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTime("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTime,
    selectedDate,
    totalDuration,
    now,
    bookingSlots,
    isLoadingBookingSlots,
    bookingSlotError,
  ])

  const openServiceSelector = () => {
    setActiveCategory(selectedServices[0]?.category || "Tất cả")
    setOpenServiceModal(true)
  }

  const handleAddService = (serviceId) => {
    setSelectedServiceIds((prev) => {
      const existed = prev.some((id) => String(id) === String(serviceId))

      if (existed) return prev

      return [...prev, serviceId]
    })

    setServiceQuantities((prev) => ({
      ...prev,
      [String(serviceId)]: prev[String(serviceId)] || 1,
    }))
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

    setServiceQuantities((prev) => {
      const next = { ...prev }
      delete next[String(serviceId)]
      return next
    })
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

  const handleDecreaseServiceQuantity = (serviceId) => {
    setServiceQuantities((prev) => {
      const key = String(serviceId)
      const currentValue = Math.max(1, Number(prev[key] || 1))

      return {
        ...prev,
        [key]: currentValue <= 1 ? 1 : currentValue - 1,
      }
    })
  }

  const handleIncreaseServiceQuantity = (serviceId) => {
    setServiceQuantities((prev) => {
      const key = String(serviceId)
      const currentValue = Math.max(1, Number(prev[key] || 1))

      return {
        ...prev,
        [key]: currentValue + 1,
      }
    })
  }

  const openDateModal = () => {
    setTempDate(selectedDate || new Date())
    setOpenCalendar(true)
  }

  const applyDate = () => {
    if (!tempDate) return

    const pickedDate = new Date(tempDate)
    pickedDate.setHours(0, 0, 0, 0)

    setSelectedDate(pickedDate)
    setSelectedTime("")
    setOpenCalendar(false)
  }

  const handleContinue = () => {
    if (isLoadingServices) {
      showNotice({
        type: "warning",
        title: "Đang tải dịch vụ",
        message: "Vui lòng chờ hệ thống tải xong danh sách dịch vụ.",
      })

      return
    }

    if (
      selectedServices.length === 0 ||
      !selectedDate ||
      !selectedTime ||
      isTimeSlotDisabled(selectedTime)
    ) {
      showNotice({
        type: "warning",
        title: "Thiếu thông tin đặt lịch",
        message:
          "Vui lòng chọn đầy đủ dịch vụ, ngày và giờ hẹn hợp lệ trước khi tiếp tục.",
      })

      return
    }

    setStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return

    if (!currentUser?.maTK) {
      showNotice({
        type: "warning",
        title: "Vui lòng đăng nhập",
        message: "Bạn cần đăng nhập trước khi đặt lịch.",
      })

      setTimeout(() => {
        navigate("/dang-nhap")
      }, 900)

      return
    }

    if (
      selectedServices.length === 0 ||
      !selectedDate ||
      !selectedTime ||
      isTimeSlotDisabled(selectedTime)
    ) {
      showNotice({
        type: "warning",
        title: "Thiếu thông tin đặt lịch",
        message: "Vui lòng chọn đầy đủ dịch vụ, ngày và giờ hẹn hợp lệ.",
      })

      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        idTaiKhoan: currentUser.maTK,
        ngayHen: formatDateForApi(selectedDate),
        gioHen: selectedTime,
        ghiChu: note.trim() || null,
        dichVuItems: selectedServiceIds.map((id) => ({
          idDichVu: Number(id),
          soLuong: getServiceQuantity(id),
        })),
      }

      const result = await createAppointmentApi(payload)

      setBookingResult(result)
      setBookingSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      showNotice({
        type: "warning",
        title: "Đặt lịch thất bại",
        message:
          error.message || "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.",
      })
    } finally {
      setIsSubmitting(false)
    }
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

            {bookingResult?.emailThongBao && (
              <div
                className={`booking-success-email-card ${
                  bookingResult.emailDaGui
                    ? "booking-success-email-card--success"
                    : "booking-success-email-card--warning"
                }`}
              >
                {bookingResult.emailThongBao}
              </div>
            )}

            <div className="booking-success-info">
              <div className="success-info-row success-info-row-full">
                <span>Dịch vụ</span>

                <div className="success-service-list">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="success-service-item">
                      {getServiceTitle(service)} x {getServiceQuantity(service.id)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="success-info-grid">
                <div>
                  <span>Thời gian</span>
                  <strong>
                    {selectedTime} - {selectedDate?.toLocaleDateString("vi-VN")}
                  </strong>
                </div>

                <div>
                  <span>Khách hàng</span>
                  <strong>{customerInfo.fullName}</strong>
                </div>
              </div>

              <div className="success-info-grid">
                <div>
                  <span>Tổng lượt dịch vụ</span>
                  <strong>{totalPeopleCount} lượt</strong>
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
              onClick={() => navigate("/lich-hen-cua-toi")}
            >
              Xem lịch hẹn của tôi
            </button>

            <button
              type="button"
              className="booking-success-secondary"
              onClick={() => navigate("/trang-chu")}
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
                      disabled={isLoadingServices}
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
                        <span>Thành tiền</span>
                        <span>Số lượng</span>
                        <span>Thao tác</span>
                      </div>
                    </div>

                    {isLoadingServices ? (
                      <div className="selected-service-item">
                        <div className="service-info-left">
                          <div className="service-thumb">
                            <Loader2
                              size={26}
                              className="booking-loading-icon"
                            />
                          </div>

                          <div>
                            <h4>Đang tải dịch vụ...</h4>
                            <p>Vui lòng chờ trong giây lát</p>
                          </div>
                        </div>

                        <div className="service-price">--</div>
                        <span></span>
                        <span></span>
                      </div>
                    ) : selectedServices.length === 0 ? (
                      <div className="selected-service-item">
                        <div className="service-info-left">
                          <div className="service-thumb">
                            <ShoppingBag size={26} />
                          </div>

                          <div>
                            <h4>Chưa chọn dịch vụ</h4>
                            <p>Bấm “Thêm dịch vụ” để chọn dịch vụ đặt lịch</p>
                          </div>
                        </div>

                        <div className="service-price">--</div>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      selectedServices.map((service) => (
                        <div className="selected-service-item" key={service.id}>
                          <div className="service-info-left">
                            <div className="service-thumb">
                              {service.image ? (
                                <img
                                  src={service.image}
                                  alt={getServiceTitle(service)}
                                />
                              ) : (
                                <ShoppingBag size={26} />
                              )}
                            </div>

                            <div>
                              <h4>{getServiceTitle(service)}</h4>

                              <p>
                                {service.duration
                                  ? `Thời lượng: ${service.duration} phút`
                                  : "Dịch vụ chăm sóc sắc đẹp"}
                              </p>
                            </div>
                          </div>

                          <div className="service-price">
                            {formatPrice(
                              Number(service.price || 0) *
                                getServiceQuantity(service.id)
                            )}
                          </div>

                          <div className="service-quantity-control">
                            <button
                              type="button"
                              onClick={() =>
                                handleDecreaseServiceQuantity(service.id)
                              }
                              disabled={getServiceQuantity(service.id) <= 1}
                            >
                              <Minus size={14} />
                            </button>

                            <span>{getServiceQuantity(service.id)}</span>

                            <button
                              type="button"
                              onClick={() =>
                                handleIncreaseServiceQuantity(service.id)
                              }
                            >
                              <Plus size={14} />
                            </button>
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
                      ))
                    )}

                    <div className="selected-service-total">
                      <span>
                        Tổng cộng ({selectedServices.length} dịch vụ,{" "}
                        {totalPeopleCount} lượt):
                      </span>

                      <strong>{formatPrice(finalTotalPrice)}</strong>
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

                  <div className="booking-time-summary">
                    <span>
                      Giờ phục vụ: {SPA_OPEN_TIME} - {SPA_CLOSE_TIME}
                    </span>

                    <span>
                      Tổng thời lượng:{" "}
                      {totalDuration > 0
                        ? formatDurationText(totalDuration)
                        : "Chưa xác định"}
                    </span>

                    {selectedTime && selectedTimeEndText && (
                      <span>
                        Dự kiến kết thúc: {selectedTimeEndText}
                      </span>
                    )}
                  </div>

                  <div className="booking-time-grid">
                    {timeSlots.map((time) => {
                      const disabledReason = getTimeSlotDisabledReason(time)
                      const disabled = Boolean(disabledReason)
                      const slotInfo = bookingSlotMap[time]

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={disabled}
                          title={disabledReason || "Còn chỗ"}
                          className={[
                            "booking-time",
                            selectedTime === time ? "active" : "",
                            disabled ? "booking-time--disabled" : "",
                            slotInfo && !slotInfo.available ? "booking-time--full" : "",
                          ].join(" ")}
                          onClick={() => {
                            if (!disabled) {
                              setSelectedTime(time)
                            }
                          }}
                        >
                          <span>{time}</span>

                          {slotInfo && !slotInfo.available && (
                            <small>{slotInfo.reason || "Hết chỗ"}</small>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {isLoadingBookingSlots && (
                    <p className="booking-time-help">Đang kiểm tra khung giờ còn chỗ...</p>
                  )}

                  {bookingSlotError && (
                    <p className="booking-time-note">{bookingSlotError}</p>
                  )}

                  <p className="booking-time-help">
                    Hệ thống chỉ cho chọn khung giờ mà thời gian kết thúc không
                    vượt quá {SPA_CLOSE_TIME}. Ví dụ dịch vụ 60 phút thì giờ
                    cuối cùng có thể chọn là 20:00.
                  </p>

                  {selectedDate && !hasAvailableTimeSlots && (
                    <p className="booking-time-note">
                      Không còn khung giờ phù hợp với tổng thời lượng dịch vụ
                      trong ngày này. Vui lòng chọn ngày khác hoặc chọn dịch vụ
                      có thời lượng ngắn hơn.
                    </p>
                  )}
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

                <div className="booking-step-actions">
                  <button
                    type="button"
                    className="booking-back-inline"
                    onClick={handleBackToPreviousPage}
                  >
                    <ChevronLeft size={20} />
                    Quay lại
                  </button>

                  <button
                    type="button"
                    className="booking-submit booking-submit-inline"
                    onClick={handleContinue}
                    disabled={isLoadingServices}
                  >
                    {isLoadingServices ? "Đang tải dịch vụ..." : "Tiếp tục"}
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="booking-confirm booking-confirm-new">
                <div className="confirm-booking-box">
                  <h3>Thông tin đặt lịch</h3>

                  <div className="confirm-booking-content">
                    <div className="confirm-booking-row">
                      <span>Khách hàng</span>
                      <strong>{customerInfo.fullName}</strong>
                    </div>

                    <div className="confirm-booking-row">
                      <span>Số điện thoại / Email</span>
                      <strong>{customerInfo.phone || "Chưa cập nhật"}</strong>
                    </div>

                    <div className="confirm-booking-row">
                      <span>Tổng lượt dịch vụ</span>
                      <strong>{totalPeopleCount}</strong>
                    </div>

                    <div className="confirm-booking-row">
                      <span>Ngày hẹn</span>
                      <strong>{formatVietnameseDate(selectedDate)}</strong>
                    </div>

                    <div className="confirm-booking-row">
                      <span>Giờ hẹn</span>
                      <strong>{selectedTime}</strong>
                    </div>
                  </div>

                  <div className="confirm-booking-divider"></div>

                  <div className="confirm-service-selected">
                    <h4>Dịch vụ đã chọn</h4>

                    <div className="confirm-service-list-new">
                      {selectedServices.map((service) => (
                        <div
                          className="confirm-service-row-new"
                          key={service.id}
                        >
                          <span>
                            {getServiceTitle(service)} x{" "}
                            {getServiceQuantity(service.id)}
                          </span>

                          <strong>
                            {formatPrice(
                              Number(service.price || 0) *
                                getServiceQuantity(service.id)
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="confirm-booking-divider"></div>

                  <div className="confirm-booking-content">
                    <div className="confirm-booking-row">
                      <span>Tổng thời lượng</span>
                      <strong>{formatDurationText(totalDuration)}</strong>
                    </div>

                    <div className="confirm-booking-row confirm-booking-total-row">
                      <span>Tổng tiền dự kiến</span>
                      <strong>{formatPrice(finalTotalPrice)}</strong>
                    </div>

                    {note && (
                      <div className="confirm-booking-row confirm-booking-note-row">
                        <span>Ghi chú</span>
                        <strong>{note}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="confirm-actions confirm-actions-modern">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    className="booking-submit booking-submit-loading"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="booking-loading-icon" />
                        Đang đặt lịch...
                      </>
                    ) : (
                      "Xác nhận đặt lịch"
                    )}
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
              <h3>Chọn thêm dịch vụ</h3>
              <p>
                Bạn có thể chọn nhiều dịch vụ trong cùng một lịch hẹn. Hệ thống
                sẽ tính tổng tiền dự kiến theo số lượng của từng dịch vụ.
              </p>
            </div>

            <div className="service-category-tabs service-category-tabs--text-only">
              {bookingCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={`service-category-tab service-category-tab--text-only ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="service-card-list">
              <div className="service-card-grid">
                {filteredServicesForModal.map((service) => {
                  const isSelected = selectedServiceIds.some(
                    (id) => String(id) === String(service.id)
                  )

                  return (
                    <div
                      key={service.id}
                      className={`service-picker-card ${
                        isSelected ? "is-added" : ""
                      }`}
                      onClick={() => handleToggleService(service.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleToggleService(service.id)
                        }
                      }}
                    >
                      <div className="service-picker-image">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={getServiceTitle(service)}
                          />
                        ) : (
                          <div className="service-picker-placeholder">
                            <ShoppingBag size={28} />
                          </div>
                        )}
                      </div>

                      <div className="service-picker-content">
                        <div className="service-picker-top">
                          <h4>{getServiceTitle(service)}</h4>

                          <span
                            className={`service-top-check ${
                              isSelected ? "is-checked" : ""
                            }`}
                          >
                            <Check size={15} />
                          </span>
                        </div>

                        <p className="service-picker-description">
                          {service.description || "Dịch vụ chăm sóc sắc đẹp"}
                        </p>

                        <div className="service-picker-meta">
                          <span className="service-picker-chip">
                            {service.category || "Dịch vụ"}
                          </span>

                          <span className="service-picker-chip">
                            {service.duration || 0} phút
                          </span>
                        </div>

                        <div
                          className={`service-price-pill ${
                            isSelected ? "is-checked" : ""
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