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

function normalizeAppointment(item) {
  const services = (item.chiTietLichHen || []).map((service) => ({
    id: service.idDichVu,
    name: service.tenDichVu,
    price: Number(service.donGia || 0),
    duration: Number(service.thoiLuongPhut || 0),
    quantity: Number(service.soLuong || 1),
    total: Number(service.thanhTien || 0),
    image: getFullImageUrl(service.hinhAnh || ""),
  }))

  return {
    id: item.idLichHen,
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