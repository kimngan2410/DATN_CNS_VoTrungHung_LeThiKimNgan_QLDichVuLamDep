import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react"

import {
  clearAllAuthData,
  loginAdminApi,
  saveAdminAuthData,
} from "../../../services/authApi"

import "./AdminLogin.css"

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTimerRef = useRef(null)

  const from = location.state?.from || "/admin/tong-quan"

  const [formData, setFormData] = useState(() => {
    const savedRememberMe = localStorage.getItem("adminRememberMe") === "true"
    const savedEmail = localStorage.getItem("adminRememberedEmail") || ""

    return {
      email: savedRememberMe ? savedEmail : "",
      password: "",
    }
  })

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("adminRememberMe") === "true"
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isEnteringAdmin, setIsEnteringAdmin] = useState(false)

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setLoginError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const email = formData.email.trim().toLowerCase()
    const password = formData.password

    if (!email) {
      setLoginError("Vui lòng nhập email quản trị viên.")
      return
    }

    if (!password) {
      setLoginError("Vui lòng nhập mật khẩu.")
      return
    }

    try {
      setIsLoggingIn(true)
      setLoginError("")

      const data = await loginAdminApi({
        email,
        password,
      })

      if (data?.user?.vaiTro !== "Admin") {
        setLoginError("Tài khoản này không có quyền truy cập trang quản trị.")
        setIsLoggingIn(false)
        return
      }

      if (rememberMe) {
        localStorage.setItem("adminRememberMe", "true")
        localStorage.setItem("adminRememberedEmail", email)
      } else {
        localStorage.removeItem("adminRememberMe")
        localStorage.removeItem("adminRememberedEmail")
      }

      clearAllAuthData()
      saveAdminAuthData(data, rememberMe)

      setIsEnteringAdmin(true)

      redirectTimerRef.current = setTimeout(() => {
        navigate(from, { replace: true })
      }, 1200)
    } catch (error) {
      setLoginError(error.message || "Đăng nhập quản trị viên thất bại.")
      setIsLoggingIn(false)
      setIsEnteringAdmin(false)
    }
  }

  return (
    <div className="admin-login-page">
      <main className="admin-login-main">
        <div className="admin-login-card">
          <section className="admin-login-card__brand">
            <div className="admin-login-brand-icon">
              <ShieldCheck size={34} />
            </div>

            <p className="admin-login-brand-subtitle">Serenity Spa</p>

            <h1>Đăng nhập quản trị viên</h1>

            <p>
              Khu vực dành riêng cho quản trị viên để quản lý hệ thống,
              nhân viên, dịch vụ, tài khoản, báo cáo và dữ liệu vận hành spa.
            </p>
          </section>

          <section className="admin-login-card__form">
            <div className="admin-login-card__top">
              <h2>Chào mừng trở lại</h2>
              <p>Vui lòng đăng nhập bằng tài khoản quản trị viên được cấp.</p>
            </div>

            <form className="admin-login-form" onSubmit={handleSubmit}>
              <div className="admin-login-form__group">
                <label>Email quản trị viên</label>

                <div className="admin-login-form__input-wrap">
                  <Mail size={20} />

                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email quản trị viên"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoggingIn || isEnteringAdmin}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="admin-login-form__group">
                <label>Mật khẩu</label>

                <div className="admin-login-form__input-wrap">
                  <Lock size={20} />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoggingIn || isEnteringAdmin}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="admin-login-form__eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoggingIn || isEnteringAdmin}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="admin-login-form__options">
                <label className="admin-login-form__remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    disabled={isLoggingIn || isEnteringAdmin}
                  />

                  <span className="admin-login-form__remember-box"></span>

                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              {loginError && (
                <div className="admin-login-form__error">{loginError}</div>
              )}

              <button
                type="submit"
                className="admin-login-form__submit"
                disabled={isLoggingIn || isEnteringAdmin}
              >
                {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </section>
        </div>
      </main>

      {isEnteringAdmin && (
        <div className="admin-login-success-loading">
          <div className="admin-login-success-loading__box">
            <div className="admin-login-success-loading__spinner"></div>
            <h3>Serenity Spa</h3>
            <p>Đăng nhập thành công. Đang chuyển đến trang quản trị...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLogin