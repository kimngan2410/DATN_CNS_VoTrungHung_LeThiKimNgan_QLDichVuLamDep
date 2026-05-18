import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Save,
  ShieldCheck,
  X,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import {
  changePasswordApi,
  getCurrentUser,
  logout,
} from "../../../services/authApi"
import {
  getAccountProfileApi,
  updateAccountProfileApi,
} from "../../../services/accountApi"
import { getMyAppointmentsApi } from "../../../services/appointmentApi"
import {
  getStrongPasswordError,
  PASSWORD_HINT,
} from "../../../utils/passwordValidation"

import "./ChangePasswordPage.css"

function ChangePasswordPage() {
  const navigate = useNavigate()

  const [profileData, setProfileData] = useState(() => {
    const user = getCurrentUser()

    return {
      avatar: user?.avatar || user?.anhDaiDien || "",
      fullName: user?.hoTen || user?.fullName || "Khách hàng",
      email: user?.email || "",
      phone: "",
      birthDate: "",
      gender: "",
    }
  })

  const [appointmentCount, setAppointmentCount] = useState(0)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const updateStoredUser = useCallback((profile) => {
    const currentUser = getCurrentUser()

    if (!currentUser || !profile) return

    const updatedUser = {
      ...currentUser,
      hoTen: profile.fullName,
      fullName: profile.fullName,
      avatar: profile.avatar,
      anhDaiDien: profile.avatar,
      email: profile.email,
    }

    const storageMode = localStorage.getItem("authStorageMode")
    const storage = storageMode === "session" ? sessionStorage : localStorage

    storage.setItem("user", JSON.stringify(updatedUser))
    window.dispatchEvent(new Event("auth-changed"))
  }, [])

  const fetchChangePasswordProfile = useCallback(async () => {
    const user = getCurrentUser()

    if (!user?.maTK) {
      navigate("/dang-nhap", { replace: true })
      return
    }

    try {
      setIsProfileLoading(true)

      const [profile, appointmentData] = await Promise.all([
        getAccountProfileApi(user.maTK),
        getMyAppointmentsApi(user.maTK).catch(() => []),
      ])

      const nextProfile = {
        avatar: profile.avatar,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone || "",
        birthDate: profile.birthDate || "",
        gender: profile.gender || "",
      }

      setProfileData(nextProfile)

      const activeAppointmentCount = appointmentData.filter((item) =>
        ["pending", "confirmed"].includes(item.status)
      ).length

      setAppointmentCount(activeAppointmentCount)
      updateStoredUser(nextProfile)
    } catch (error) {
      console.error(error)

      const fallbackUser = getCurrentUser()

      setProfileData((prev) => ({
        ...prev,
        avatar: fallbackUser?.avatar || fallbackUser?.anhDaiDien || "",
        fullName:
          fallbackUser?.hoTen || fallbackUser?.fullName || "Khách hàng",
        email: fallbackUser?.email || "",
      }))
    } finally {
      setIsProfileLoading(false)
    }
  }, [navigate, updateStoredUser])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChangePasswordProfile()
  }, [fetchChangePasswordProfile])

  const handleAvatarChange = async (file) => {
    const user = getCurrentUser()

    if (!user?.maTK || !file) return

    try {
      setIsAvatarUploading(true)
      setMessage({
        type: "",
        text: "",
      })

      const formDataUpload = new FormData()
      formDataUpload.append("hoTen", profileData.fullName || "")
      formDataUpload.append("sdt", profileData.phone || "")
      formDataUpload.append("ngaySinh", profileData.birthDate || "")
      formDataUpload.append("gioiTinh", profileData.gender || "")
      formDataUpload.append("avatar", file)

      const updatedProfile = await updateAccountProfileApi(
        user.maTK,
        formDataUpload
      )

      const nextProfile = {
        avatar: updatedProfile.avatar,
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
        phone: updatedProfile.phone || "",
        birthDate: updatedProfile.birthDate || "",
        gender: updatedProfile.gender || "",
      }

      setProfileData(nextProfile)
      updateStoredUser(nextProfile)

      setMessage({
        type: "success",
        text: "Cập nhật ảnh đại diện thành công.",
      })
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Không thể cập nhật ảnh đại diện.",
      })
    } finally {
      setIsAvatarUploading(false)
    }
  }

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

    const passwordError = getStrongPasswordError(formData.newPassword)

    if (passwordError) {
      newErrors.newPassword = passwordError
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

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) return

    if (!validateForm()) {
      setMessage({
        type: "error",
        text: "Vui lòng kiểm tra lại thông tin mật khẩu.",
      })
      return
    }

    const currentUser = getCurrentUser()

    if (!currentUser?.maTK) {
      setMessage({
        type: "error",
        text: "Bạn cần đăng nhập để đổi mật khẩu.",
      })

      setTimeout(() => {
        navigate("/dang-nhap")
      }, 900)

      return
    }

    try {
      setIsSubmitting(true)

      const result = await changePasswordApi(currentUser.maTK, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })

      setMessage({
        type: "success",
        text: result.message || "Đổi mật khẩu thành công.",
      })

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setErrors({})
    } catch (error) {
      const errorText = error.message || "Đổi mật khẩu thất bại."

      if (errorText.includes("Mật khẩu hiện tại")) {
        setErrors({
          currentPassword: errorText,
        })
      }

      setMessage({
        type: "error",
        text: errorText,
      })
    } finally {
      setIsSubmitting(false)
    }
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
    logout()
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
            appointmentCount={appointmentCount}
            onAvatarChange={handleAvatarChange}
            onLogout={handleLogout}
            isAvatarUploading={isAvatarUploading || isProfileLoading}
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
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      onClick={() => toggleShowPassword("currentPassword")}
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      onClick={() => toggleShowPassword("newPassword")}
                      disabled={isSubmitting}
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
                  <label htmlFor="confirmPassword">
                    Xác nhận mật khẩu mới
                  </label>

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
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      onClick={() => toggleShowPassword("confirmPassword")}
                      disabled={isSubmitting}
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
                    {PASSWORD_HINT}
                  </span>
                </div>

                <div className="change-password-actions">
                  <button
                    type="button"
                    className="change-password-btn change-password-btn--cancel"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <X size={18} />
                    <span>Hủy</span>
                  </button>

                  <button
                    type="submit"
                    className="change-password-btn change-password-btn--save"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2
                        size={18}
                        className="change-password-spin"
                      />
                    ) : (
                      <Save size={18} />
                    )}

                    <span>
                      {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </span>
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

            <p>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại không?
            </p>

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