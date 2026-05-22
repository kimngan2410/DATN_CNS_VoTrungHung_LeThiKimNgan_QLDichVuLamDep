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

export async function getStaffTransactionsApi({
  date,
  paymentMethod,
  status,
  keyword,
} = {}) {
  const token = getAuthToken()
  const params = new URLSearchParams()

  if (date) params.set("date", date)
  if (paymentMethod && paymentMethod !== "Tất cả") {
    params.set("payment_method", paymentMethod)
  }
  if (status && status !== "Tất cả") {
    params.set("status", status)
  }
  if (keyword && keyword.trim()) {
    params.set("keyword", keyword.trim())
  }

  const queryString = params.toString()

  const response = await fetch(
    `${API_BASE_URL}/hoa-don/staff${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  return handleResponse(response, "Không thể tải danh sách giao dịch")
}

export async function getStaffTransactionDetailApi(invoiceId) {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/hoa-don/staff/${invoiceId}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  return handleResponse(response, "Không thể tải chi tiết giao dịch")
}
