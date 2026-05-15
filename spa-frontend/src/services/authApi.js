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

export async function loginApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/dang-nhap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Đăng nhập thất bại")
}

export function loginWithGoogle() {
  window.location.href = `${API_BASE_URL}/auth/google`
}

export function loginWithFacebook() {
  window.location.href = `${API_BASE_URL}/auth/facebook`
}

export async function registerSendOtpApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/dang-ky/gui-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Không thể gửi mã OTP")
}

export async function registerVerifyOtpApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/dang-ky/xac-nhan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Xác nhận OTP thất bại")
}

export async function registerResendOtpApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/dang-ky/gui-lai-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Không thể gửi lại mã OTP")
}

export async function forgotPasswordSendOtpApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/quen-mat-khau/gui-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Không thể gửi mã OTP quên mật khẩu")
}

export async function forgotPasswordResendOtpApi(payload) {
  const response = await fetch(
    `${API_BASE_URL}/auth/quen-mat-khau/gui-lai-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )

  return handleResponse(response, "Không thể gửi lại mã OTP quên mật khẩu")
}

export async function forgotPasswordVerifyOtpApi(payload) {
  const response = await fetch(
    `${API_BASE_URL}/auth/quen-mat-khau/xac-nhan-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )

  return handleResponse(response, "Xác nhận OTP thất bại")
}

export async function forgotPasswordResetApi(payload) {
  const response = await fetch(
    `${API_BASE_URL}/auth/quen-mat-khau/dat-lai-mat-khau`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )

  return handleResponse(response, "Không thể đặt lại mật khẩu")
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