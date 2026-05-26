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

function getAdminHeaders() {
  const token = getAdminAuthToken()

  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getAdminServiceCategoriesApi(filters = {}) {
  const params = new URLSearchParams()

  if (filters.fromDate) {
    params.set("fromDate", filters.fromDate)
  }

  if (filters.toDate) {
    params.set("toDate", filters.toDate)
  }

  const queryString = params.toString()
  const url = queryString
    ? `${API_BASE_URL}/danh-muc-dich-vu/admin/danh-sach?${queryString}`
    : `${API_BASE_URL}/danh-muc-dich-vu/admin/danh-sach`

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: getAdminHeaders(),
  })

  return handleResponse(response, "Không thể tải danh sách danh mục dịch vụ.")
}

export async function getAdminServiceCategoryDetailApi(idDanhMuc) {
  const response = await fetch(
    `${API_BASE_URL}/danh-muc-dich-vu/admin/${idDanhMuc}`,
    {
      method: "GET",
      cache: "no-store",
      headers: getAdminHeaders(),
    }
  )

  return handleResponse(response, "Không thể tải chi tiết danh mục dịch vụ.")
}

export async function createAdminServiceCategoryApi(payload) {
  const response = await fetch(`${API_BASE_URL}/danh-muc-dich-vu/admin/tao`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Không thể thêm danh mục dịch vụ.")
}

export async function updateAdminServiceCategoryApi(idDanhMuc, payload) {
  const response = await fetch(
    `${API_BASE_URL}/danh-muc-dich-vu/admin/${idDanhMuc}`,
    {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    }
  )

  return handleResponse(response, "Không thể cập nhật danh mục dịch vụ.")
}

export async function deleteAdminServiceCategoryApi(idDanhMuc) {
  const response = await fetch(
    `${API_BASE_URL}/danh-muc-dich-vu/admin/${idDanhMuc}`,
    {
      method: "DELETE",
      headers: getAdminHeaders(),
    }
  )

  return handleResponse(response, "Không thể xoá danh mục dịch vụ.")
}