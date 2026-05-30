import { getAdminAuthToken } from "./authApi"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "")

export function toAbsoluteAccountAvatarUrl(url) {
  if (!url) return ""

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url
  }

  if (url.startsWith("/")) {
    return `${API_ROOT_URL}${url}`
  }

  return `${API_ROOT_URL}/${url}`
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

function getAdminHeaders() {
  const token = getAdminAuthToken()

  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function normalizeAccount(account) {
  return {
    ...account,
    avatar: toAbsoluteAccountAvatarUrl(account?.avatar || ""),
    fullName: account?.fullName || "Chưa cập nhật",
    phone: account?.phone || "",
    status: account?.status || "Hoạt động",
    role: account?.role || "Khách hàng",
  }
}

export async function getAdminAccountsApi() {
  const response = await fetch(`${API_BASE_URL}/tai-khoan/admin/danh-sach`, {
    method: "GET",
    cache: "no-store",
    headers: getAdminHeaders(),
  })

  const data = await handleResponse(response, "Không thể tải danh sách tài khoản.")

  return Array.isArray(data) ? data.map(normalizeAccount) : []
}

export async function getAdminAccountDetailApi(idTaiKhoan) {
  const response = await fetch(`${API_BASE_URL}/tai-khoan/admin/${idTaiKhoan}`, {
    method: "GET",
    cache: "no-store",
    headers: getAdminHeaders(),
  })

  const data = await handleResponse(response, "Không thể tải chi tiết tài khoản.")

  return normalizeAccount(data)
}

export async function createAdminAccountApi(payload) {
  const response = await fetch(`${API_BASE_URL}/tai-khoan/admin/tao`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await handleResponse(response, "Không thể tạo tài khoản.")

  return normalizeAccount(data)
}

export async function updateAdminAccountApi(idTaiKhoan, payload) {
  const response = await fetch(`${API_BASE_URL}/tai-khoan/admin/${idTaiKhoan}`, {
    method: "PUT",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await handleResponse(response, "Không thể cập nhật tài khoản.")

  return normalizeAccount(data)
}

export async function updateAdminAccountStatusApi(idTaiKhoan, status) {
  const response = await fetch(
    `${API_BASE_URL}/tai-khoan/admin/${idTaiKhoan}/trang-thai`,
    {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    }
  )

  const data = await handleResponse(
    response,
    "Không thể cập nhật trạng thái tài khoản."
  )

  return normalizeAccount(data)
}

export async function deleteAdminAccountApi(idTaiKhoan) {
  const response = await fetch(`${API_BASE_URL}/tai-khoan/admin/${idTaiKhoan}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  })

  return handleResponse(response, "Không thể xoá tài khoản.")
}