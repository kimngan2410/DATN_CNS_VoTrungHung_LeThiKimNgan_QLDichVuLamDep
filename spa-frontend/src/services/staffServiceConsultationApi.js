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

export async function searchStaffConsultationServicesApi({
  keyword = "",
  limit = 8,
}) {
  const params = new URLSearchParams()

  if (keyword) params.set("keyword", keyword)
  params.set("limit", String(limit))

  const response = await fetch(
    `${API_BASE_URL}/staff-service-consultation/services?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  return handleResponse(response, "Không thể tìm dịch vụ tư vấn.")
}

export async function getStaffConsultationTemplateApi({
  idDichVu,
  customerConcern = "",
}) {
  const response = await fetch(
    `${API_BASE_URL}/staff-service-consultation/template`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idDichVu,
        customerConcern,
      }),
    }
  )

  return handleResponse(response, "Không thể tạo mẫu tư vấn dịch vụ.")
}