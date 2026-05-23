const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const AUTH_STORAGE = {
  customer: {
    token: "customerToken",
    user: "customerUser",
    mode: "customerAuthStorageMode",
    event: "customer-auth-changed",
  },
  staff: {
    token: "staffToken",
    user: "staffUser",
    mode: "staffAuthStorageMode",
    event: "staff-auth-changed",
  },
}

/* =========================
   COMMON
========================= */

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

function getStorageByRemember(rememberMe) {
  return rememberMe ? localStorage : sessionStorage
}

function removeAuthByKeys(keys) {
  localStorage.removeItem(keys.token)
  localStorage.removeItem(keys.user)
  localStorage.removeItem(keys.mode)

  sessionStorage.removeItem(keys.token)
  sessionStorage.removeItem(keys.user)
}

function saveAuthByKeys(data, rememberMe, keys) {
  if (!data?.access_token || !data?.user) {
    throw new Error("Dữ liệu đăng nhập không hợp lệ.")
  }

  removeAuthByKeys(keys)

  const storage = getStorageByRemember(rememberMe)

  storage.setItem(keys.token, data.access_token)
  storage.setItem(keys.user, JSON.stringify(data.user))

  localStorage.setItem(keys.mode, rememberMe ? "local" : "session")

  window.dispatchEvent(new Event(keys.event))
}

function getTokenByKeys(keys) {
  return localStorage.getItem(keys.token) || sessionStorage.getItem(keys.token)
}

function getUserByKeys(keys) {
  try {
    const savedUser =
      localStorage.getItem(keys.user) || sessionStorage.getItem(keys.user)

    return savedUser ? JSON.parse(savedUser) : null
  } catch {
    return null
  }
}

/* =========================
   LOGIN API
========================= */

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

export async function loginReceptionistApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/le-tan/dang-nhap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, "Đăng nhập nhân viên lễ tân thất bại")
}

/* =========================
   SOCIAL LOGIN
========================= */

export function loginWithGoogle() {
  window.location.href = `${API_BASE_URL}/auth/google`
}

export function loginWithFacebook() {
  window.location.href = `${API_BASE_URL}/auth/facebook`
}

/* =========================
   REGISTER
========================= */

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

/* =========================
   FORGOT PASSWORD
========================= */

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

/* =========================
   CUSTOMER AUTH STORAGE
========================= */

export function saveCustomerAuthData(data, rememberMe = true) {
  saveAuthByKeys(data, rememberMe, AUTH_STORAGE.customer)
}

export function getCustomerAuthToken() {
  return getTokenByKeys(AUTH_STORAGE.customer)
}

export function getCurrentCustomerUser() {
  return getUserByKeys(AUTH_STORAGE.customer)
}

export function clearCustomerAuthData() {
  removeAuthByKeys(AUTH_STORAGE.customer)
  window.dispatchEvent(new Event(AUTH_STORAGE.customer.event))
}

export function logoutCustomer() {
  clearCustomerAuthData()
}

/* =========================
   STAFF AUTH STORAGE
========================= */

export function saveStaffAuthData(data, rememberMe = true) {
  saveAuthByKeys(data, rememberMe, AUTH_STORAGE.staff)
}

export function getStaffAuthToken() {
  return getTokenByKeys(AUTH_STORAGE.staff)
}

export function getCurrentStaffUser() {
  return getUserByKeys(AUTH_STORAGE.staff)
}

export function clearStaffAuthData() {
  removeAuthByKeys(AUTH_STORAGE.staff)
  window.dispatchEvent(new Event(AUTH_STORAGE.staff.event))
}

export function logoutStaff() {
  clearStaffAuthData()
}

/* =========================
   BACKWARD COMPATIBILITY
   Giữ tên cũ để các file hiện tại không bị lỗi đỏ.
========================= */

export function saveAuthData(data, rememberMe = true) {
  const role = data?.user?.vaiTro

  if (role === "NhanVien") {
    saveStaffAuthData(data, rememberMe)
    return
  }

  saveCustomerAuthData(data, rememberMe)
}

export function getAuthToken() {
  return getCustomerAuthToken()
}

export function getCurrentUser() {
  return getCurrentCustomerUser()
}

export function logout() {
  logoutCustomer()
}

/* =========================
   CLEAR ALL OLD AUTH
========================= */

export function clearLegacyAuthData() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("authStorageMode")

  sessionStorage.removeItem("token")
  sessionStorage.removeItem("user")
}

export function clearAllAuthData() {
  clearCustomerAuthData()
  clearStaffAuthData()
  clearLegacyAuthData()
}

/* =========================
   CHANGE PASSWORD
========================= */

export async function changePasswordApi(idTaiKhoan, payload, actor = "customer") {
  const token =
    actor === "staff"
      ? getStaffAuthToken()
      : getCustomerAuthToken() || getStaffAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/auth/doi-mat-khau/${idTaiKhoan}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  )

  return handleResponse(response, "Không thể đổi mật khẩu")
}