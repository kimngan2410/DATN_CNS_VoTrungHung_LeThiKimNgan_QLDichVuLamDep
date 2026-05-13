const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

export async function loginApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/dang-nhap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "Đăng nhập thất bại")
  }

  return data
}

export function saveAuthData(data) {
  localStorage.setItem("token", data.access_token)
  localStorage.setItem("user", JSON.stringify(data.user))

  window.dispatchEvent(new Event("auth-changed"))
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")

  window.dispatchEvent(new Event("auth-changed"))
}