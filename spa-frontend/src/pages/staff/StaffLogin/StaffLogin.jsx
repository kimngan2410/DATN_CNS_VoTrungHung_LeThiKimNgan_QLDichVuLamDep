import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react"

import {
  loginReceptionistApi,
  saveAuthData,
} from "../../../services/authApi"

import "./StaffLogin.css"

function StaffLogin() {
  const navigate = useNavigate()
  const redirectTimerRef = useRef(null)

  const [formData, setFormData] = useState(() => {
    const savedRememberMe = localStorage.getItem("staffRememberMe") === "true"
    const savedEmail = localStorage.getItem("staffRememberedEmail") || ""

    return {
      email: savedRememberMe ? savedEmail : "",
      password: "",
    }
  })

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("staffRememberMe") === "true"
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isEnteringStaff, setIsEnteringStaff] = useState(false)

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
      setLoginError("Vui lòng nhập email nhân viên.")
      return
    }

    if (!password) {
      setLoginError("Vui lòng nhập mật khẩu.")
      return
    }

    try {
      setIsLoggingIn(true)
      setLoginError("")

      const data = await loginReceptionistApi({
        email,
        password,
      })

      if (data?.user?.vaiTro !== "NhanVien") {
        setLoginError("Tài khoản này không có quyền truy cập trang nhân viên.")
        setIsLoggingIn(false)
        return
      }

      if (rememberMe) {
        localStorage.setItem("staffRememberMe", "true")
        localStorage.setItem("staffRememberedEmail", email)
      } else {
        localStorage.removeItem("staffRememberMe")
        localStorage.removeItem("staffRememberedEmail")
      }

      saveAuthData(data, rememberMe)

      setIsEnteringStaff(true)

      redirectTimerRef.current = setTimeout(() => {
        navigate("/staff/tong-quan", { replace: true })
      }, 1200)
    } catch (error) {
      setLoginError(error.message || "Đăng nhập thất bại.")
      setIsLoggingIn(false)
      setIsEnteringStaff(false)
    }
  }

  return (
    <div className="staff-login-page">
      <main className="staff-login-main">
        <div className="staff-login-card">
          <section className="staff-login-card__brand">
            <div className="staff-login-brand-icon">
              <ShieldCheck size={34} />
            </div>

            <p className="staff-login-brand-subtitle">Serenity Spa</p>

            <h1>Đăng nhập nhân viên lễ tân</h1>

            <p>
              Khu vực dành riêng cho nhân viên lễ tân để quản lý lịch hẹn,
              khách hàng và giao dịch thanh toán tại spa.
            </p>
          </section>

          <section className="staff-login-card__form">
            <div className="staff-login-card__top">
              <h2>Chào mừng trở lại</h2>
              <p>Vui lòng đăng nhập bằng tài khoản nhân viên được cấp.</p>
            </div>

            <form className="staff-login-form" onSubmit={handleSubmit}>
              <div className="staff-login-form__group">
                <label>Email nhân viên</label>

                <div className="staff-login-form__input-wrap">
                  <Mail size={20} />

                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email nhân viên"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoggingIn || isEnteringStaff}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="staff-login-form__group">
                <label>Mật khẩu</label>

                <div className="staff-login-form__input-wrap">
                  <Lock size={20} />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoggingIn || isEnteringStaff}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="staff-login-form__eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoggingIn || isEnteringStaff}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="staff-login-form__options">
                <label className="staff-login-form__remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    disabled={isLoggingIn || isEnteringStaff}
                  />

                  <span className="staff-login-form__remember-box"></span>

                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              {loginError && (
                <div className="staff-login-form__error">{loginError}</div>
              )}

              <button
                type="submit"
                className="staff-login-form__submit"
                disabled={isLoggingIn || isEnteringStaff}
              >
                {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </section>
        </div>
      </main>

      {isEnteringStaff && (
        <div className="staff-login-success-loading">
          <div className="staff-login-success-loading__box">
            <div className="staff-login-success-loading__spinner"></div>
            <h3>Serenity Spa</h3>
            <p>Đăng nhập thành công. Đang chuyển đến trang nhân viên...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffLogin