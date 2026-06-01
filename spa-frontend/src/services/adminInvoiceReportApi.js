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
    let message = defaultMessage

    if (typeof data?.detail === "string") {
      message = data.detail
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item?.msg || JSON.stringify(item))
        .join(", ")
    } else if (data?.detail && typeof data.detail === "object") {
      message = JSON.stringify(data.detail)
    }

    throw new Error(message)
  }

  return data
}

function getAdminHeaders() {
  const token = getAdminAuthToken()

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getAdminInvoiceReportApi({
  fromDate,
  toDate,
  keyword = "",
  paymentMethod = "Tất cả",
  status = "Tất cả",
}) {
  const params = new URLSearchParams()

  if (fromDate) params.set("fromDate", fromDate)
  if (toDate) params.set("toDate", toDate)
  if (keyword) params.set("keyword", keyword)
  if (paymentMethod) params.set("paymentMethod", paymentMethod)
  if (status) params.set("status", status)

  const response = await fetch(
    `${API_BASE_URL}/admin-invoice-report?${params.toString()}`,
    {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    }
  )

  return handleResponse(response, "Không thể tải báo cáo giao dịch hoá đơn.")
}