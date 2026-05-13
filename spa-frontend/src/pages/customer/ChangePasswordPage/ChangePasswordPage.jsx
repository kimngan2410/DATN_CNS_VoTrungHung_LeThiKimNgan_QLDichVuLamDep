import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Save,
  ShieldCheck,
  X,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import "./ChangePasswordPage.css"

const profileData = {
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
  fullName: "Nguyễn Thị Mai",
  email: "admin@gmail.com",
}

function ChangePasswordPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({
    type: "",
    text: "",
  })

  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    if (message.text) {
      setMessage({
        type: "",
        text: "",
      })
    }
  }

  const toggleShowPassword = (fieldName) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại."
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới."
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự."
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới nên có ít nhất 1 chữ hoa."
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới nên có ít nhất 1 chữ số."
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới."
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp."
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "Mật khẩu mới không được trùng với mật khẩu hiện tại."
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validateForm()) {
      setMessage({
        type: "error",
        text: "Vui lòng kiểm tra lại thông tin mật khẩu.",
      })
      return
    }

    setMessage({
      type: "success",
      text: "Đổi mật khẩu thành công.",
    })

    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    /*
      Khi nối backend, bạn thay đoạn trên bằng API:

      await changePasswordApi({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      Nếu backend trả lỗi sai mật khẩu hiện tại:
      setErrors({ currentPassword: "Mật khẩu hiện tại không chính xác." })
    */
  }

  const handleCancel = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    setErrors({})

    setMessage({
      type: "",
      text: "",
    })
  }

  const handleLogout = () => {
    setShowLogoutPopup(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    window.dispatchEvent(new Event("auth-changed"))

    setShowLogoutPopup(false)
    navigate("/trang-chu")
  }

  const cancelLogout = () => {
    setShowLogoutPopup(false)
  }

  return (
    <div className="change-password-page">
      <Header />

      <main className="change-password-main">
        <div className="change-password-container">
          <AccountSidebar
            activeMenu="password"
            profileData={profileData}
            appointmentCount={3}
            onLogout={handleLogout}
          />

          <section className="change-password-content">
            <div className="change-password-card">
              <div className="change-password-card__header">
                <div>
                  <h1>Đổi mật khẩu</h1>
                  <p>
                    Cập nhật mật khẩu mới để tăng cường bảo mật cho tài khoản.
                  </p>
                </div>
              </div>

              {message.text && (
                <div
                  className={`change-password-message ${
                    message.type === "success" ? "success" : "error"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form className="change-password-form" onSubmit={handleSubmit}>
                <div className="change-password-form__group">
                  <label htmlFor="currentPassword">Mật khẩu hiện tại</label>

                  <div className="change-password-input-wrap">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={
                        showPassword.currentPassword ? "text" : "password"
                      }
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu hiện tại"
                    />

                    <button
                      type="button"
                      onClick={() => toggleShowPassword("currentPassword")}
                    >
                      {showPassword.currentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.currentPassword && (
                    <span className="change-password-error">
                      {errors.currentPassword}
                    </span>
                  )}
                </div>

                <div className="change-password-form__group">
                  <label htmlFor="newPassword">Mật khẩu mới</label>

                  <div className="change-password-input-wrap">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.newPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu mới"
                    />

                    <button
                      type="button"
                      onClick={() => toggleShowPassword("newPassword")}
                    >
                      {showPassword.newPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.newPassword && (
                    <span className="change-password-error">
                      {errors.newPassword}
                    </span>
                  )}
                </div>

                <div className="change-password-form__group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>

                  <div className="change-password-input-wrap">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showPassword.confirmPassword ? "text" : "password"
                      }
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập lại mật khẩu mới"
                    />

                    <button
                      type="button"
                      onClick={() => toggleShowPassword("confirmPassword")}
                    >
                      {showPassword.confirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <span className="change-password-error">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <div className="change-password-note">
                  <ShieldCheck size={18} />
                  <span>
                    Mật khẩu nên có tối thiểu 8 ký tự, gồm chữ hoa và chữ số.
                  </span>
                </div>

                <div className="change-password-actions">
                  <button
                    type="button"
                    className="change-password-btn change-password-btn--cancel"
                    onClick={handleCancel}
                  >
                    <X size={18} />
                    <span>Hủy</span>
                  </button>

                  <button
                    type="submit"
                    className="change-password-btn change-password-btn--save"
                  >
                    <Save size={18} />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {showLogoutPopup && (
        <div className="change-password-logout-overlay">
          <div className="change-password-logout-popup">
            <div className="change-password-logout-icon">
              <LogOut size={34} />
            </div>

            <h3>Xác nhận đăng xuất</h3>

            <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại không?</p>

            <div className="change-password-logout-actions">
              <button
                type="button"
                className="change-password-logout-btn change-password-logout-btn--cancel"
                onClick={cancelLogout}
              >
                Hủy
              </button>

              <button
                type="button"
                className="change-password-logout-btn change-password-logout-btn--confirm"
                onClick={confirmLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChangePasswordPage