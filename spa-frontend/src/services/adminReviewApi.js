import { getAdminAuthToken } from "./authApi"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "")

export function toAbsoluteReviewImageUrl(url) {
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

function normalizeAdminReview(review) {
  const images = Array.isArray(review?.hinhAnh) ? review.hinhAnh : []

  return {
    ...review,
    avatar: toAbsoluteReviewImageUrl(review?.avatar || ""),
    hinhAnh: images.map(toAbsoluteReviewImageUrl),
    trangThai: review?.phanHoi
      ? "Đã phản hồi"
      : review?.trangThai || "Chưa phản hồi",
  }
}

export async function getAdminReviewsApi() {
  const response = await fetch(`${API_BASE_URL}/danh-gia/admin/danh-sach`, {
    method: "GET",
    cache: "no-store",
    headers: getAdminHeaders(),
  })

  const data = await handleResponse(response, "Không thể tải danh sách đánh giá.")

  return Array.isArray(data) ? data.map(normalizeAdminReview) : []
}

export async function getAdminReviewDetailApi(idDanhGia) {
  const response = await fetch(`${API_BASE_URL}/danh-gia/admin/${idDanhGia}`, {
    method: "GET",
    cache: "no-store",
    headers: getAdminHeaders(),
  })

  const data = await handleResponse(response, "Không thể tải chi tiết đánh giá.")

  return normalizeAdminReview(data)
}

export async function replyAdminReviewApi(idDanhGia, payload) {
  const response = await fetch(
    `${API_BASE_URL}/danh-gia/admin/${idDanhGia}/phan-hoi`,
    {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    }
  )

  const data = await handleResponse(response, "Không thể gửi phản hồi đánh giá.")

  return normalizeAdminReview(data)
}