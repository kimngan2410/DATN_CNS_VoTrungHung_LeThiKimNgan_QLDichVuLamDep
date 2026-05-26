import { getAdminAuthToken } from "./authApi"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "")

export function toAbsoluteFileUrl(url) {
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

function getAdminUploadHeaders() {
  const token = getAdminAuthToken()

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function normalizeAdminService(service) {
  const rawImages = Array.isArray(service?.images) ? service.images : []

  return {
    ...service,
    id: service?.maDV || service?.id || "",
    idDichVu: service?.idDichVu || service?.id || "",
    name: service?.name || service?.title || "",
    categoryId: service?.categoryId || service?.idDanhMuc || "",
    categoryName: service?.categoryName || service?.category || "",
    price: Number(service?.price || 0),
    duration: Number(service?.duration || 0),
    status: service?.status || "Hoạt động",
    createdAt: service?.createdAt || "",
    shortDescription: service?.shortDescription || service?.description || "",
    detailDescription: service?.detailDescription || "",
    isUsedInAppointments: Boolean(service?.isUsedInAppointments),
    rawImages,
    images: rawImages.map(toAbsoluteFileUrl),
  }
}

export async function getAdminServicesApi() {
  const response = await fetch(`${API_BASE_URL}/dich-vu/admin/danh-sach`, {
    method: "GET",
    cache: "no-store",
    headers: getAdminHeaders(),
  })

  const data = await handleResponse(response, "Không thể tải danh sách dịch vụ.")

  return Array.isArray(data) ? data.map(normalizeAdminService) : []
}

export async function getAdminServiceDetailApi(idDichVu) {
  const response = await fetch(`${API_BASE_URL}/dich-vu/admin/${idDichVu}`, {
    method: "GET",
    cache: "no-store",
    headers: getAdminHeaders(),
  })

  const data = await handleResponse(response, "Không thể tải chi tiết dịch vụ.")

  return normalizeAdminService(data)
}

export async function uploadAdminServiceImagesApi(files) {
  const formData = new FormData()

  Array.from(files || []).forEach((file) => {
    formData.append("files", file)
  })

  const response = await fetch(`${API_BASE_URL}/dich-vu/admin/upload-anh`, {
    method: "POST",
    headers: getAdminUploadHeaders(),
    body: formData,
  })

  const data = await handleResponse(response, "Không thể tải ảnh dịch vụ.")

  return data?.images || []
}

export async function createAdminServiceApi(payload) {
  const response = await fetch(`${API_BASE_URL}/dich-vu/admin/tao`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await handleResponse(response, "Không thể thêm dịch vụ.")

  return normalizeAdminService(data)
}

export async function updateAdminServiceApi(idDichVu, payload) {
  const response = await fetch(`${API_BASE_URL}/dich-vu/admin/${idDichVu}`, {
    method: "PUT",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await handleResponse(response, "Không thể cập nhật dịch vụ.")

  return normalizeAdminService(data)
}

export async function deleteAdminServiceApi(idDichVu) {
  const response = await fetch(`${API_BASE_URL}/dich-vu/admin/${idDichVu}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  })

  return handleResponse(response, "Không thể xoá dịch vụ.")
}