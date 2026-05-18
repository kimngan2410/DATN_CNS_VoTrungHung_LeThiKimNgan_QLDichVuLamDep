import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import {
  forgotPasswordResendOtpApi,
  forgotPasswordResetApi,
  forgotPasswordSendOtpApi,
  forgotPasswordVerifyOtpApi,
  loginApi,
  loginWithFacebook,
  loginWithGoogle,
  saveAuthData,
} from "../../../services/authApi"
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  X,
} from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { FaFacebookF } from "react-icons/fa"
import {
  getStrongPasswordError,
  PASSWORD_HINT,
} from "../../../utils/passwordValidation"
import "./LoginPage.css"

function LoginPage() {
  const navigate = useNavigate()

  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [isEnteringHome, setIsEnteringHome] = useState(false)
  const [loginSuccessMessage, setLoginSuccessMessage] = useState(
    "Đăng nhập thành công. Đang chuyển trang..."
  )

  const redirectTimerRef = useRef(null)
  const otpInputRefs = useRef([])

  const [showPassword, setShowPassword] = useState(false)

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberMe") === "true"
  })

  const [formData, setFormData] = useState(() => {
    const savedRememberMe = localStorage.getItem("rememberMe") === "true"
    const savedEmail = localStorage.getItem("rememberedEmail") || ""

    return {
      email: savedRememberMe ? savedEmail : "",
      password: "",
    }
  })

  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState("email")

  const [forgotEmail, setForgotEmail] = useState("")
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [verifiedOtp, setVerifiedOtp] = useState("")
  const [resendCooldown, setResendCooldown] = useState(52)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [forgotError, setForgotError] = useState("")
  const [forgotMessage, setForgotMessage] = useState("")

  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const redirectByRole = useCallback(
    (user, message = "Đăng nhập thành công. Đang chuyển trang...") => {
      setLoginSuccessMessage(message)
      setIsEnteringHome(true)

      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }

      redirectTimerRef.current = setTimeout(() => {
        if (user?.vaiTro === "Admin") {
          navigate("/admin/tong-quan", { replace: true })
          return
        }

        if (user?.vaiTro === "NhanVien") {
          navigate("/staff/tong-quan", { replace: true })
          return
        }

        navigate("/trang-chu", { replace: true })
      }, 1600)
    },
    [navigate]
  )

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user")

    if (!savedUser) return

    try {
      const user = JSON.parse(savedUser)

      // eslint-disable-next-line react-hooks/set-state-in-effect
      redirectByRole(user, "Bạn đã đăng nhập. Đang chuyển đến trang chủ...")
    } catch {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        sessionStorage.removeItem("user")
        sessionStorage.removeItem("token")
    }

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }
    }
  }, [redirectByRole])

  useEffect(() => {
    if (!showForgotModal || forgotStep !== "otp" || resendCooldown <= 0) {
      return
    }

    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [showForgotModal, forgotStep, resendCooldown])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setLoginError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoginError("")

    if (!formData.email.trim()) {
      setLoginError("Vui lòng nhập email.")
      return
    }

    if (!formData.password.trim()) {
      setLoginError("Vui lòng nhập mật khẩu.")
      return
    }

    try {
      setIsLoggingIn(true)

      const loginEmail = formData.email.trim().toLowerCase()

      const data = await loginApi({
        email: loginEmail,
        password: formData.password,
      })

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("rememberedEmail", loginEmail)
      } else {
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("rememberedEmail")
      }

      saveAuthData(data, rememberMe)
      redirectByRole(data.user, "Đăng nhập thành công. Đang chuyển trang...")
    } catch (error) {
      setLoginError(error.message || "Đăng nhập thất bại.")
      setIsLoggingIn(false)
      setIsEnteringHome(false)
    }
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const resetForgotState = () => {
    setForgotStep("email")
    setForgotEmail("")
    setOtpDigits(["", "", "", "", "", ""])
    setVerifiedOtp("")
    setResendCooldown(52)
    setNewPassword("")
    setConfirmPassword("")
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setForgotError("")
    setForgotMessage("")
    setIsSendingOtp(false)
    setIsVerifyingOtp(false)
    setIsResettingPassword(false)
  }

  const openForgotModal = () => {
    resetForgotState()
    setForgotEmail(formData.email || "")
    setShowForgotModal(true)
  }

  const closeForgotModal = () => {
    setShowForgotModal(false)
    resetForgotState()
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()

    setForgotError("")
    setForgotMessage("")

    const email = forgotEmail.trim().toLowerCase()

    if (!email) {
      setForgotError("Vui lòng nhập email của bạn.")
      return
    }

    if (!isValidEmail(email)) {
      setForgotError("Email không đúng định dạng.")
      return
    }

    try {
      setIsSendingOtp(true)

      const data = await forgotPasswordSendOtpApi({ email })

      setForgotEmail(email)
      setForgotStep("otp")
      setOtpDigits(["", "", "", "", "", ""])
      setVerifiedOtp("")
      setResendCooldown(52)
      setForgotMessage(data.message || "Mã OTP đã được gửi đến email của bạn.")

      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 80)
    } catch (error) {
      setForgotError(error.message || "Không gửi được mã OTP.")
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(0, 1)

    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })

    setForgotError("")
    setForgotMessage("")

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (event) => {
    event.preventDefault()

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)

    if (!pastedValue) return

    const nextDigits = ["", "", "", "", "", ""]

    pastedValue.split("").forEach((digit, index) => {
      nextDigits[index] = digit
    })

    setOtpDigits(nextDigits)
    setForgotError("")
    setForgotMessage("")

    const nextFocusIndex = Math.min(pastedValue.length, 5)
    otpInputRefs.current[nextFocusIndex]?.focus()
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return

    setForgotError("")
    setForgotMessage("")

    const email = forgotEmail.trim().toLowerCase()

    try {
      setIsSendingOtp(true)

      const data = await forgotPasswordResendOtpApi({ email })

      setOtpDigits(["", "", "", "", "", ""])
      setVerifiedOtp("")
      setResendCooldown(52)
      setForgotMessage(data.message || "Mã OTP mới đã được gửi lại.")

      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 80)
    } catch (error) {
      setForgotError(error.message || "Không gửi lại được mã OTP.")
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    setForgotError("")
    setForgotMessage("")

    const email = forgotEmail.trim().toLowerCase()
    const otpCode = otpDigits.join("")

    if (otpDigits.some((digit) => !digit)) {
      setForgotError("Vui lòng nhập đủ 6 số OTP.")
      return
    }

    try {
      setIsVerifyingOtp(true)

      const data = await forgotPasswordVerifyOtpApi({
        email,
        otp: otpCode,
      })

      setVerifiedOtp(otpCode)
      setForgotStep("reset")
      setForgotMessage(
        data.message || "Xác minh OTP thành công. Vui lòng nhập mật khẩu mới."
      )
    } catch (error) {
      setForgotError(error.message || "Mã OTP không chính xác.")
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    setForgotError("")
    setForgotMessage("")

    const email = forgotEmail.trim().toLowerCase()
    const otpCode = verifiedOtp || otpDigits.join("")

    const passwordError = getStrongPasswordError(newPassword)

    if (passwordError) {
      setForgotError(passwordError)
      return
    }

    if (!confirmPassword.trim()) {
      setForgotError("Vui lòng nhập lại mật khẩu mới.")
      return
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Mật khẩu nhập lại không khớp.")
      return
    }

    try {
      setIsResettingPassword(true)

      const data = await forgotPasswordResetApi({
        email,
        otp: otpCode,
        newPassword,
        confirmPassword,
      })

      setForgotStep("success")
      setForgotMessage(data.message || "Đổi mật khẩu thành công.")
      setFormData((prev) => ({
        ...prev,
        email,
        password: "",
      }))
    } catch (error) {
      setForgotError(error.message || "Không đổi được mật khẩu.")
    } finally {
      setIsResettingPassword(false)
    }
  }

  const getForgotTitle = () => {
    if (forgotStep === "email") return "Quên mật khẩu"
    if (forgotStep === "otp") return "Xác minh OTP"
    if (forgotStep === "reset") return "Đặt mật khẩu mới"
    return "Hoàn tất"
  }

  const getForgotSubtitle = () => {
    if (forgotStep === "email") {
      return "Nhập email để nhận mã OTP đặt lại mật khẩu"
    }

    if (forgotStep === "otp") {
      return "Nhập mã OTP đã được gửi đến email của bạn"
    }

    if (forgotStep === "reset") {
      return "Tạo mật khẩu mới cho tài khoản của bạn"
    }

    return "Mật khẩu của bạn đã được cập nhật"
  }

  return (
    <div className="login-page">
      <Header />

      <main className="login-main">
        <div className="login-card">
          <div className="login-card__top">
            <h1>Chào mừng trở lại</h1>
            <p>Đăng nhập để tiếp tục trải nghiệm dịch vụ</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__group">
              <label>Email</label>
              <div className="login-form__input-wrap">
                <Mail size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoggingIn || isEnteringHome}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-form__group">
              <div className="login-form__label-row">
                <label>Mật khẩu</label>

                <button
                  type="button"
                  className="login-form__forgot"
                  onClick={openForgotModal}
                  disabled={isLoggingIn || isEnteringHome}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div className="login-form__input-wrap">
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoggingIn || isEnteringHome}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-form__eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  disabled={isLoggingIn || isEnteringHome}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="login-form__options">
              <label className="login-form__remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoggingIn || isEnteringHome}
                />

                <span className="login-form__remember-box"></span>

                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {loginError && <div className="login-form__error">{loginError}</div>}

            <button
              type="submit"
              className="login-form__submit"
              disabled={isLoggingIn || isEnteringHome}
            >
              {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="login-form__divider">
              <span>Hoặc đăng nhập bằng</span>
            </div>

            <div className="login-form__socials">
              <button
                type="button"
                className="login-form__social-btn"
                onClick={loginWithGoogle}
                disabled={isLoggingIn || isEnteringHome}
              >
                <FcGoogle size={22} />
                <span>Google</span>
              </button>

              <button
                type="button"
                className="login-form__social-btn"
                onClick={loginWithFacebook}
                disabled={isLoggingIn || isEnteringHome}
              >
                <FaFacebookF className="login-form__facebook-icon" />
                <span>Facebook</span>
              </button>
            </div>
          </form>

          <div className="login-card__bottom">
            Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingChat />

      {showForgotModal && (
        <div className="forgot-password-overlay" onClick={closeForgotModal}>
          <div
            className="forgot-password-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="forgot-password-header">
              <div>
                <h3>{getForgotTitle()}</h3>
                <p>{getForgotSubtitle()}</p>
              </div>

              <button
                type="button"
                className="forgot-password-close"
                onClick={closeForgotModal}
              >
                <X size={22} />
              </button>
            </div>

            {forgotError && (
              <div className="forgot-password-alert forgot-password-alert--error">
                {forgotError}
              </div>
            )}

            {forgotMessage && forgotStep !== "otp" && (
              <div className="forgot-password-alert forgot-password-alert--success">
                {forgotMessage}
              </div>
            )}

            {forgotStep === "email" && (
              <form className="forgot-password-body" onSubmit={handleSendOtp}>
                <div className="forgot-password-icon">
                  <Mail size={30} />
                </div>

                <div className="forgot-password-group">
                  <label>Email</label>

                  <div className="forgot-password-input-wrap">
                    <Mail size={20} />
                    <input
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="forgot-password-actions">
                  <button
                    type="button"
                    className="forgot-password-btn forgot-password-btn--secondary"
                    onClick={closeForgotModal}
                  >
                    Đóng
                  </button>

                  <button
                    type="submit"
                    className="forgot-password-btn forgot-password-btn--primary"
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 size={18} className="forgot-loading-icon" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi mã OTP"
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === "otp" && (
              <form
                className="forgot-password-body forgot-password-otp-body"
                onSubmit={handleVerifyOtp}
              >
                <div className="forgot-otp-card">
                  <div className="forgot-otp-mail-icon">
                    <Mail size={34} />
                  </div>

                  <p>Mã xác thực đã được gửi đến email</p>
                  <strong>{forgotEmail}</strong>
                </div>

                <div className="forgot-otp-inputs" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputRefs.current[index] = element
                      }}
                      className="forgot-otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleOtpDigitChange(index, event.target.value)
                      }
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      aria-label={`Nhập số OTP thứ ${index + 1}`}
                    />
                  ))}
                </div>

                {forgotMessage && (
                  <div className="forgot-password-alert forgot-password-alert--success">
                    {forgotMessage}
                  </div>
                )}

                <div className="forgot-otp-resend">
                  {resendCooldown > 0 ? (
                    <span>
                      Gửi lại mã sau <strong>{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? "Đang gửi..." : "Gửi lại mã"}
                    </button>
                  )}
                </div>

                <div className="forgot-password-actions forgot-otp-actions">
                  <button
                    type="button"
                    className="forgot-password-btn forgot-password-btn--secondary"
                    onClick={() => {
                      setForgotStep("email")
                      setForgotError("")
                      setForgotMessage("")
                      setOtpDigits(["", "", "", "", "", ""])
                      setVerifiedOtp("")
                    }}
                  >
                    <ArrowLeft size={18} />
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    className="forgot-password-btn forgot-password-btn--primary"
                    disabled={isVerifyingOtp || otpDigits.some((digit) => !digit)}
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 size={18} className="forgot-loading-icon" />
                        Đang xác minh...
                      </>
                    ) : (
                      <>
                        Xác nhận
                        <CheckCircle2 size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === "reset" && (
              <form
                className="forgot-password-body"
                onSubmit={handleResetPassword}
              >
                <div className="forgot-password-icon">
                  <Lock size={32} />
                </div>

                <div className="forgot-password-group">
                  <label>Mật khẩu mới</label>

                  <div className="forgot-password-input-wrap">
                    <Lock size={20} />

                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      className="forgot-password-eye-btn"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                    >
                      {showNewPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="forgot-password-group">
                  <label>Nhập lại mật khẩu mới</label>

                  <div className="forgot-password-input-wrap">
                    <Lock size={20} />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      className="forgot-password-eye-btn"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="forgot-password-rule-note">
                  {PASSWORD_HINT}
                </div>

                <div className="forgot-password-actions">
                  <button
                    type="button"
                    className="forgot-password-btn forgot-password-btn--secondary"
                    onClick={() => {
                      setForgotStep("otp")
                      setForgotError("")
                      setForgotMessage("")
                    }}
                  >
                    <ArrowLeft size={18} />
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    className="forgot-password-btn forgot-password-btn--primary"
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 size={18} className="forgot-loading-icon" />
                        Đang cập nhật...
                      </>
                    ) : (
                      "Đổi mật khẩu"
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === "success" && (
              <div className="forgot-password-body forgot-password-success">
                <div className="forgot-password-success-icon">
                  <CheckCircle2 size={48} />
                </div>

                <h4>Đổi mật khẩu thành công</h4>

                <p>
                  Bạn có thể dùng mật khẩu mới để đăng nhập vào tài khoản của
                  mình.
                </p>

                <button
                  type="button"
                  className="forgot-password-btn forgot-password-btn--primary forgot-password-btn--full"
                  onClick={closeForgotModal}
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isEnteringHome && (
        <div className="login-success-loading">
          <div className="login-success-loading__box">
            <div className="login-success-loading__spinner"></div>
            <h3>Serenity Spa</h3>
            <p>{loginSuccessMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage