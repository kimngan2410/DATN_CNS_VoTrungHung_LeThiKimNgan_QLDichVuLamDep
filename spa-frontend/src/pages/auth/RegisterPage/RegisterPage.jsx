import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  ArrowLeft,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import "./RegisterPage.css"

function RegisterPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const [otpError, setOtpError] = useState("")
  const [countdown, setCountdown] = useState(58)

  const otpRefs = useRef([])

  useEffect(() => {
    if (step !== 2) return
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [step, countdown])

  const maskedEmail = useMemo(() => formData.email || "example@gmail.com", [formData.email])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }))
  }

  const validateStepOne = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^(0|\+84)\d{9,10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = (e) => {
    e.preventDefault()

    if (!validateStepOne()) return

    setStep(2)
    setCountdown(58)
    setOtpValues(["", "", "", "", "", ""])
    setOtpError("")
  }

  const handleBack = () => {
    setStep(1)
    setOtpError("")
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return

    const nextOtp = [...otpValues]
    nextOtp[index] = value
    setOtpValues(nextOtp)
    setOtpError("")

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePasteOtp = (e) => {
    e.preventDefault()
    const pastedValue = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (!pastedValue) return

    const nextOtp = pastedValue.split("")
    while (nextOtp.length < 6) nextOtp.push("")

    setOtpValues(nextOtp)
    setOtpError("")

    const lastIndex = Math.min(pastedValue.length - 1, 5)
    otpRefs.current[lastIndex]?.focus()
  }

  const handleResendOtp = () => {
    if (countdown > 0) return
    setCountdown(58)
    setOtpValues(["", "", "", "", "", ""])
    setOtpError("")
    otpRefs.current[0]?.focus()
  }

  const handleVerifyOtp = () => {
    const enteredOtp = otpValues.join("")

    if (enteredOtp.length < 6) {
      setOtpError("Vui lòng nhập đầy đủ 6 số OTP")
      return
    }

    if (enteredOtp !== "123456") {
      setOtpError("Mã OTP không đúng. Vui lòng thử lại")
      return
    }

    navigate("/")
  }

  return (
    <div className="register-page">
      <Header />

      <main className="register-main">
        <div className="register-card">
          {step === 1 ? (
            <>
              <div className="register-card__top">
                <h1>Đăng ký tài khoản</h1>
                <p>Điền thông tin để trở thành thành viên của Serenity Spa</p>
              </div>

              <div className="register-stepper">
                <div className="register-stepper__item register-stepper__item--active">1</div>
                <div className="register-stepper__line"></div>
                <div className="register-stepper__item">2</div>
              </div>

              <form className="register-form" onSubmit={handleContinue}>
                <div className="register-form__group">
                  <label>Họ và tên</label>
                  <div className={`register-form__input-wrap ${errors.fullName ? "register-form__input-wrap--error" : ""}`}>
                    <User size={18} />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Nhập họ và tên"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.fullName && <p className="register-form__error">{errors.fullName}</p>}
                </div>

                <div className="register-form__group">
                  <label>Email</label>
                  <div className={`register-form__input-wrap ${errors.email ? "register-form__input-wrap--error" : ""}`}>
                    <Mail size={18} />
                    <input
                      type="email"
                      name="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <p className="register-form__error">{errors.email}</p>}
                </div>

                <div className="register-form__group">
                  <label>Số điện thoại</label>
                  <div className={`register-form__input-wrap ${errors.phone ? "register-form__input-wrap--error" : ""}`}>
                    <Phone size={18} />
                    <input
                      type="text"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.phone && <p className="register-form__error">{errors.phone}</p>}
                </div>

                <div className="register-form__group">
                  <label>Mật khẩu</label>
                  <div className={`register-form__input-wrap ${errors.password ? "register-form__input-wrap--error" : ""}`}>
                    <Lock size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="register-form__eye-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="register-form__error">{errors.password}</p>}
                </div>

                <div className="register-form__group">
                  <label>Xác nhận mật khẩu</label>
                  <div
                    className={`register-form__input-wrap ${
                      errors.confirmPassword ? "register-form__input-wrap--error" : ""
                    }`}
                  >
                    <Lock size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="register-form__eye-btn"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="register-form__error">{errors.confirmPassword}</p>
                  )}
                </div>

                <button type="submit" className="register-form__submit">
                  Tiếp tục
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="register-card__top">
                <h1>Đăng ký tài khoản</h1>
                <p>Xác thực địa chỉ email của bạn</p>
              </div>

              <div className="register-stepper">
                <div className="register-stepper__item register-stepper__item--active">1</div>
                <div className="register-stepper__line register-stepper__line--active"></div>
                <div className="register-stepper__item register-stepper__item--active">2</div>
              </div>

              <div className="register-otp">
                <div className="register-otp__box">
                  <div className="register-otp__icon">
                    <Mail size={26} />
                  </div>
                  <p>
                    Mã xác thực đã được gửi đến email
                    <br />
                    <strong>{maskedEmail}</strong>
                  </p>
                </div>

                <div className="register-otp__inputs" onPaste={handlePasteOtp}>
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>

                {otpError && <p className="register-form__error register-form__error--center">{otpError}</p>}

                <div className="register-otp__resend">
                  {countdown > 0 ? (
                    <p>
                      Gửi lại mã sau <span>{countdown}s</span>
                    </p>
                  ) : (
                    <button type="button" onClick={handleResendOtp}>
                      Gửi lại mã
                    </button>
                  )}
                </div>

                <div className="register-otp__actions">
                  <button type="button" className="register-otp__btn register-otp__btn--outline" onClick={handleBack}>
                    <ArrowLeft size={16} />
                    Quay lại
                  </button>

                  <button
                    type="button"
                    className="register-otp__btn register-otp__btn--primary"
                    onClick={handleVerifyOtp}
                  >
                    Xác nhận
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="register-card__bottom">
            Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập ngay</Link>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingChat />
    </div>
  )
}

export default RegisterPage