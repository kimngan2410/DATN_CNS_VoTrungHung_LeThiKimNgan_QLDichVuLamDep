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

export async function getServiceCategoriesApi() {
  const response = await fetch(`${API_BASE_URL}/danh-muc-dich-vu`)

  return handleResponse(response, "Không thể tải danh mục dịch vụ")
}

export async function getServicesApi() {
  const response = await fetch(`${API_BASE_URL}/dich-vu`)

  return handleResponse(response, "Không thể tải danh sách dịch vụ")
}

export async function getServiceDetailApi(serviceId) {
  const response = await fetch(`${API_BASE_URL}/dich-vu/${serviceId}`)

  return handleResponse(response, "Không thể tải chi tiết dịch vụ")
}

export async function getServiceReviewsApi(serviceId) {
  const response = await fetch(`${API_BASE_URL}/dich-vu/${serviceId}/danh-gia`)

  return handleResponse(response, "Không thể tải đánh giá dịch vụ")
}