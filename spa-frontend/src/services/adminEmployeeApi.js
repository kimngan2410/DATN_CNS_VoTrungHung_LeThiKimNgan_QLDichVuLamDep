import { getAdminAuthToken } from "./authApi"

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

function getAuthHeaders() {
  const token = getAdminAuthToken()

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getAdminEmployeesApi() {
  const response = await fetch(`${API_BASE_URL}/nhan-vien/admin/danh-sach`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

  return handleResponse(response, "Không thể tải danh sách nhân viên")
}

export async function getAdminEmployeeDetailApi(idNhanVien) {
  const response = await fetch(`${API_BASE_URL}/nhan-vien/admin/${idNhanVien}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

  return handleResponse(response, "Không thể tải chi tiết nhân viên")
}

export async function createAdminEmployeeApi(payload) {
  const response = await fetch(`${API_BASE_URL}/nhan-vien/admin/tao`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Không thể thêm nhân viên")
}

export async function updateAdminEmployeeApi(idNhanVien, payload) {
  const response = await fetch(`${API_BASE_URL}/nhan-vien/admin/${idNhanVien}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Không thể cập nhật nhân viên")
}

export async function deleteAdminEmployeeApi(idNhanVien) {
  const response = await fetch(`${API_BASE_URL}/nhan-vien/admin/${idNhanVien}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  return handleResponse(response, "Không thể xoá nhân viên")
}

export async function uploadAdminEmployeeAvatarApi(file) {
  const token = getAdminAuthToken()

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/nhan-vien/admin/upload-avatar`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  return handleResponse(response, "Không thể tải ảnh đại diện")
}