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

function normalizeCustomer(customer) {
  return {
    ...customer,
    id: customer.id || customer.maKH,
    fullName: customer.fullName || "Khách hàng",
    avatarText: customer.avatarText || "K",
    avatar: getFullImageUrl(customer.avatar || ""),
    phone: customer.phone || "",
    email: customer.email || "",
    gender: customer.gender || "Chưa cập nhật",
    birthday: customer.birthday || "Chưa cập nhật",
    createdAt: customer.createdAt || "",
    loaiKH: customer.loaiKH || "Thường",
    status: customer.status || "Đang hoạt động",
    totalAppointments: Number(customer.totalAppointments || 0),
    totalSpent: Number(customer.totalSpent || 0),
    lastVisit: customer.lastVisit || "Chưa sử dụng",
    appointments: customer.appointments || [],
    serviceHistory: customer.serviceHistory || [],
  }
}

export async function getStaffCustomersApi() {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/khach-hang/staff/danh-sach`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await handleResponse(
    response,
    "Không thể tải danh sách khách hàng"
  )

  return data.map(normalizeCustomer)
}

export async function createStaffCustomerApi(payload) {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/khach-hang/staff/tao`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await handleResponse(response, "Không thể thêm khách hàng")

  return {
    ...data,
    customer: normalizeCustomer(data.customer),
  }
}