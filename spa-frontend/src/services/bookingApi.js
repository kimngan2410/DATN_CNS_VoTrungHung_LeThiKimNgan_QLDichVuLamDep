import { getAuthToken } from "./authApi"

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

export async function createAppointmentApi(payload) {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/lich-hen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Không thể đặt lịch hẹn")
}

export async function getAvailableBookingSlotsApi({ ngay, thoiLuong }) {
  const token = getAuthToken()

  const params = new URLSearchParams({
    ngay,
    thoi_luong: String(thoiLuong),
  })

  const response = await fetch(
    `${API_BASE_URL}/lich-hen/khung-gio-kha-dung?${params.toString()}`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  return handleResponse(response, "Không thể tải khung giờ khả dụng")
}