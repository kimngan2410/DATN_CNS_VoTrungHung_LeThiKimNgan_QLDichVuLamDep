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
    }

    throw new Error(message)
  }

  return data
}

export async function searchCustomerServicesApi({
  keyword = "",
  category = "Tất cả",
  priceRange = "Tất cả mức giá",
  duration = "Tất cả thời lượng",
  rating = "Tất cả",
  sortBy = "default",
  page = 1,
  limit = 9,
}) {
  const params = new URLSearchParams()

  if (keyword) params.set("keyword", keyword)
  params.set("category", category)
  params.set("priceRange", priceRange)
  params.set("duration", duration)
  params.set("rating", rating)
  params.set("sortBy", sortBy)
  params.set("page", String(page))
  params.set("limit", String(limit))

  const response = await fetch(
    `${API_BASE_URL}/customer-services/search?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  return handleResponse(response, "Không thể tìm kiếm dịch vụ.")
}

export async function suggestCustomerServicesApi({
  keyword = "",
  limit = 5,
}) {
  const params = new URLSearchParams()

  if (keyword) params.set("keyword", keyword)
  params.set("limit", String(limit))

  const response = await fetch(
    `${API_BASE_URL}/customer-services/search/suggest?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  return handleResponse(response, "Không thể lấy gợi ý dịch vụ.")
}