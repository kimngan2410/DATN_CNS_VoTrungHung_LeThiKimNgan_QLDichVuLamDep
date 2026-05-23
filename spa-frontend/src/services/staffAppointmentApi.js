import { getStaffAuthToken } from "./authApi"

const getAuthToken = () => {
  return getStaffAuthToken()
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

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

function normalizeStaffAppointment(item) {
  return {
    id: item.maLH || `LH${item.idLichHen}`,
    appointmentId: item.idLichHen,

    customer: item.customer || "Khách hàng",
    phone: item.phone || "",

    services: (item.services || []).map((service) => ({
      id: service.maDV || service.idDichVu,
      idDichVu: service.idDichVu,
      idChiTietLH: service.idChiTietLH,
      name: service.name,
      price: Number(service.price || 0),
      soLuong: Number(service.soLuong || 1),
      thoiLuongPhut: Number(service.thoiLuongPhut || 0),
      thanhTien: Number(service.thanhTien || 0),
    })),

    date: item.date,
    time: item.time,
    endTime: item.endTime,

    status: item.status,
    note: item.note || "",
    lyDoHuy: item.lyDoHuy || "",
    statusReason: item.statusReason || "",

    totalPrice: Number(item.totalPrice || 0),
    totalDuration: Number(item.totalDuration || 0),
    totalQuantity: Number(item.totalQuantity || 0),
  }
}

export async function getStaffAppointmentsApi({
  date,
  keyword = "",
  status = "Tất cả",
} = {}) {
  const token = getAuthToken()
  const params = new URLSearchParams()

  if (date) params.set("ngay", date)
  if (keyword.trim()) params.set("keyword", keyword.trim())
  if (status && status !== "Tất cả") params.set("trang_thai", status)

  const queryString = params.toString()

  const response = await fetch(
    `${API_BASE_URL}/lich-hen/staff/danh-sach${
      queryString ? `?${queryString}` : ""
    }`,
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

  return data.map(normalizeStaffAppointment)
}

export async function createStaffAppointmentApi(payload) {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/lich-hen/staff/tao`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await handleResponse(response, "Không thể tạo lịch hẹn")

  return normalizeStaffAppointment(data.appointment)
}


export async function updateStaffAppointmentStatusApi(appointmentId, payload) {
  const token = getAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/lich-hen/staff/${appointmentId}/trang-thai`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  )

  const data = await handleResponse(
    response,
    "Không thể cập nhật trạng thái lịch hẹn"
  )

  return normalizeStaffAppointment(data.appointment)
}

