import { getAuthToken } from "./authApi"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ORIGIN = API_BASE_URL.replace("/api/v1", "")

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"

function getFullAvatarUrl(avatar) {
  if (!avatar) return DEFAULT_AVATAR

  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("blob:") ||
    avatar.startsWith("data:")
  ) {
    return avatar
  }

  if (avatar.startsWith("/uploads")) {
    return `${API_ORIGIN}${avatar}`
  }

  return avatar
}

function normalizeProfile(data) {
  return {
    idTaiKhoan: data.idTaiKhoan,
    idKhachHang: data.idKhachHang,
    maKH: data.maKH,
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    birthDate: data.birthDate || "",
    gender: data.gender || "",
    avatar: getFullAvatarUrl(data.avatar),
    rawAvatar: data.avatar || "",
    customerType: data.customerType || "Thường",
    accountType: data.accountType || "",
    loginType: data.loginType || "",
    status: data.status || "",
  }
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

export async function getAccountProfileApi(idTaiKhoan) {
  const token = getAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/khach-hang/profile/${idTaiKhoan}`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  const data = await handleResponse(
    response,
    "Không thể tải thông tin tài khoản"
  )

  return normalizeProfile(data)
}

export async function updateAccountProfileApi(idTaiKhoan, formData) {
  const token = getAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/khach-hang/profile/${idTaiKhoan}`,
    {
      method: "PUT",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  )

  const data = await handleResponse(
    response,
    "Không thể cập nhật thông tin cá nhân"
  )

  return normalizeProfile(data)
}