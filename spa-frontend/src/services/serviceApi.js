const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "")

function toAbsoluteFileUrl(url) {
  if (!url) return ""

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
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

function normalizeServiceReviews(data) {
  return {
    ...data,
    reviews: (data?.reviews || []).map((review) => ({
      ...review,

      avatar: toAbsoluteFileUrl(review.avatar),

      images: (review.images || []).map((image) => {
        const rawUrl = image.imageUrl || image.url || image.duongDanAnh || ""

        return {
          ...image,
          imageUrl: toAbsoluteFileUrl(rawUrl),
          url: toAbsoluteFileUrl(rawUrl),
        }
      }),
    })),
  }
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

  const data = await handleResponse(response, "Không thể tải đánh giá dịch vụ")

  return normalizeServiceReviews(data)
}