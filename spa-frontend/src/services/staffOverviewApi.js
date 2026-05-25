const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

import { getStaffAuthToken } from "./authApi"

const getAuthToken = () => {
  return getStaffAuthToken()
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

export async function getStaffOverviewApi(period = "date", value = "") {
  const token = getAuthToken()

  const params = new URLSearchParams()
  params.set("period", period)

  if (value) {
    params.set("value", value)
  }

  const response = await fetch(
    `${API_BASE_URL}/staff/overview?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  return handleResponse(response, "Không thể tải dữ liệu tổng quan.")
}