import { getAuthToken } from "./authApi"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ORIGIN = API_BASE_URL.replace("/api/v1", "")

function getFullImageUrl(image) {
  if (!image) return ""

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image
  }

  if (image.startsWith("/uploads")) {
    return `${API_ORIGIN}${image}`
  }

  return image
}

function getServiceId(service) {
  const rawId =
    service?.idDichVu ??
    service?.idDich_vu ??
    service?.idDV ??
    service?.id ??
    service?.maDV

  const serviceId = Number(rawId)

  if (!Number.isFinite(serviceId) || serviceId <= 0) {
    return null
  }

  return serviceId
}

async function handleResponse(response, defaultMessage) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.detail || defaultMessage)
  }

  return data
}

function normalizeAppointmentService(service, appointmentId) {
  const serviceId = getServiceId(service)

  const isAdditional = Boolean(service.isAdditional)

  const serviceType =
    service.type || service.loaiDichVu || (isAdditional ? "additional" : "booked")

  return {
    idChiTietLH:
      service.idChiTietLH ||
      service.idChiTietLichHen ||
      `${appointmentId || "LH"}-${serviceId || Date.now()}`,

    idDichVu: serviceId,
    id: serviceId,

    name: service.tenDichVu || service.tenDV || service.name || "Dịch vụ",
    title: service.tenDichVu || service.tenDV || service.name || "Dịch vụ",

    price: Number(service.donGia || service.price || 0),
    duration: Number(service.thoiLuongPhut || service.duration || 0),
    quantity: Math.max(1, Number(service.soLuong || service.quantity || 1)),
    total: Number(service.thanhTien || service.total || 0),

    image: getFullImageUrl(service.hinhAnh || service.image || ""),
    category: service.tenDanhMuc || service.category || "",

    type: serviceType,
    isAdditional: serviceType === "additional" || isAdditional,

    reviewed: Boolean(service.reviewed || false),
    review: service.review || null,
  }
}

function normalizeAppointment(item) {
  const services = (item.chiTietLichHen || [])
    .map((service) => normalizeAppointmentService(service, item.idLichHen))
    .filter((service) => service.idDichVu)

  return {
    id: item.idLichHen,
    appointmentId: item.idLichHen,
    code: item.maLH,

    date: item.ngayHen,
    time: item.gioHen,
    endTime: item.gioKetThuc,
    startDateTime: item.thoiGianBatDau,
    endDateTime: item.thoiGianKetThuc,

    status: item.trangThaiCode,
    statusLabel: item.trangThai,

    note: item.ghiChu || "",
    cancelReason: item.lyDoHuy || "",

    totalPrice: Number(item.tongTienDuKien || 0),
    totalDuration: Number(item.tongThoiLuong || 0),
    totalQuantity: Number(item.tongSoLuong || 0),
    peopleCount: Number(item.tongSoLuong || 0),

    services,
  }
}

function normalizeHistoryAppointment(item) {
  const services = (item.chiTietLichHen || [])
    .map((service) => normalizeAppointmentService(service, item.idLichHen))
    .filter((service) => service.idDichVu)

  return {
    id: item.maLH || item.idLichHen,
    appointmentId: item.idLichHen,
    code: item.maLH,
    invoiceCode: item.maHD || item.invoiceCode || null,

    date: item.ngayHen,
    time: item.gioHen,
    endTime: item.gioKetThuc,
    startDateTime: item.thoiGianBatDau,
    endDateTime: item.thoiGianKetThuc,

    status: item.trangThaiCode,
    statusLabel: item.trangThai,

    cancelReason: item.lyDoHuy || "",
    note: item.ghiChu || "",

    peopleCount: Number(item.tongSoLuong || 0),
    totalQuantity: Number(item.tongSoLuong || 0),

    totalPrice: Number(
      item.totalPayment ??
        item.thanhTien ??
        item.tongThanhToan ??
        item.tongTienDuKien ??
        0
    ),

    totalDuration: Number(item.tongThoiLuong || 0),

    paymentMethod:
      item.paymentMethod || item.phuongThucThanhToan || "Chưa cập nhật",

    paymentStatus:
      item.paymentStatus ||
      item.trangThaiThanhToan ||
      (item.trangThaiCode === "completed" ? "Đã thanh toán" : ""),

    paidAt: item.ngayThanhToan || item.paymentTime || "",

    services,
  }
}

export async function getMyAppointmentsApi(idTaiKhoan) {
  const token = getAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/lich-hen/tai-khoan/${idTaiKhoan}`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  const data = await handleResponse(
    response,
    "Không thể tải danh sách lịch hẹn"
  )

  return data.map(normalizeAppointment)
}

export async function cancelMyAppointmentApi(appointmentId, payload) {
  const token = getAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/lich-hen/${appointmentId}/huy`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  )

  return handleResponse(response, "Không thể hủy lịch hẹn")
}

export async function rescheduleMyAppointmentApi(appointmentId, payload) {
  const token = getAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/lich-hen/${appointmentId}/doi-lich`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  )

  return handleResponse(response, "Không thể đổi lịch hẹn")
}

export async function getMyServiceHistoryApi(idTaiKhoan) {
  const token = getAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/lich-hen/tai-khoan/${idTaiKhoan}/lich-su-dich-vu`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  const data = await handleResponse(response, "Không thể tải lịch sử dịch vụ")

  return data.map(normalizeHistoryAppointment)
}