import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Loader2, LogOut, PencilLine, Save, X } from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import { getCurrentUser, logout } from "../../../services/authApi"
import {
  getAccountProfileApi,
  updateAccountProfileApi,
} from "../../../services/accountApi"
import { getMyAppointmentsApi } from "../../../services/appointmentApi"

import "./AccountProfilePage.css"

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"

function syncProfileToStoredUser(updatedProfile) {
  const localUser = localStorage.getItem("user")
  const sessionUser = sessionStorage.getItem("user")

  const storage = localUser ? localStorage : sessionUser ? sessionStorage : null

  if (!storage) return

  try {
    const oldUser = JSON.parse(storage.getItem("user") || "{}")

    const nextUser = {
      ...oldUser,
      hoTen: updatedProfile.fullName,
      fullName: updatedProfile.fullName,
      email: updatedProfile.email,
      sdt: updatedProfile.phone,

      avatar: updatedProfile.avatar,
      anhDaiDien: updatedProfile.avatar,
    }

    storage.setItem("user", JSON.stringify(nextUser))
    window.dispatchEvent(new Event("auth-changed"))
  } catch {
    // Bỏ qua nếu dữ liệu storage bị lỗi
  }
}

function getInitialProfileFromStorage() {
  const user = getCurrentUser()

  return {
    avatar: user?.avatar || user?.anhDaiDien || DEFAULT_AVATAR,
    fullName: user?.hoTen || user?.fullName || "",
    email: user?.email || "",
    phone: user?.sdt || "",
    birthDate: "",
    gender: "",
  }
}

function AccountProfilePage() {
  const navigate = useNavigate()
  const objectUrlRef = useRef("")

  const [profile, setProfile] = useState(() => getInitialProfileFromStorage())
  const [formData, setFormData] = useState(() => getInitialProfileFromStorage())

  const [appointmentCount, setAppointmentCount] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)

  const [loadError, setLoadError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState({})

  const [message, setMessage] = useState({
    type: "",
    text: "",
  })

  const [avatarToast, setAvatarToast] = useState({
    open: false,
    message: "",
  })

  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

  const showAvatarToast = (toastMessage) => {
    setAvatarToast({
      open: true,
      message: toastMessage,
    })

    setTimeout(() => {
      setAvatarToast({
        open: false,
        message: "",
      })
    }, 2600)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = getCurrentUser()

      if (!currentUser?.maTK) {
        navigate("/dang-nhap", { replace: true })
        return
      }

      try {
        setIsLoading(true)
        setLoadError("")

        const [profileResult, appointmentResult] = await Promise.all([
          getAccountProfileApi(currentUser.maTK),
          getMyAppointmentsApi(currentUser.maTK).catch(() => []),
        ])

        setProfile(profileResult)
        setFormData(profileResult)

        const activeAppointmentCount = appointmentResult.filter((item) =>
          ["pending", "confirmed", "checkedin", "doing"].includes(item.status)
        ).length

        setAppointmentCount(activeAppointmentCount)
      } catch (error) {
        setLoadError(error.message || "Không thể tải thông tin cá nhân.")
      } finally {
        setIsLoading(false)
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile()
  }, [navigate])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên."
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự."
    }

    const phoneRegex = /^(0|\+84)\d{9,10}$/

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại."
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ."
    }

    if (formData.birthDate) {
      const selectedDate = new Date(formData.birthDate)
      const today = new Date()

      if (selectedDate > today) {
        newErrors.birthDate = "Ngày sinh không được lớn hơn ngày hiện tại."
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính."
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleStartEdit = () => {
    setFormData(profile)
    setErrors({})
    setMessage({
      type: "",
      text: "",
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setFormData(profile)
    setErrors({})
    setMessage({
      type: "",
      text: "",
    })
    setIsEditing(false)

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = ""
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
  }

  const handleAvatarChange = async (file) => {
    if (!file) return

    const currentUser = getCurrentUser()

    if (!currentUser?.maTK) {
      navigate("/dang-nhap", { replace: true })
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    const maxSize = 2 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Ảnh đại diện không hợp lệ. Chỉ chấp nhận JPG, PNG hoặc WEBP.",
      })
      return
    }

    if (file.size > maxSize) {
      setMessage({
        type: "error",
        text: "Ảnh đại diện vượt quá dung lượng cho phép. Tối đa 2MB.",
      })
      return
    }

    try {
      setIsAvatarUploading(true)

      setMessage({
        type: "",
        text: "",
      })

      const payload = new FormData()

      payload.append("fullName", profile.fullName || formData.fullName || "")
      payload.append("phone", profile.phone || formData.phone || "")
      payload.append("birthDate", profile.birthDate || formData.birthDate || "")
      payload.append("gender", profile.gender || formData.gender || "")
      payload.append("avatar", file)

      const updatedProfile = await updateAccountProfileApi(
        currentUser.maTK,
        payload
      )

      setProfile(updatedProfile)
      setFormData(updatedProfile)

      syncProfileToStoredUser(updatedProfile)

      showAvatarToast("Đã cập nhật ảnh đại diện thành công")
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Không thể cập nhật ảnh đại diện.",
      })
    } finally {
      setIsAvatarUploading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const currentUser = getCurrentUser()

    if (!currentUser?.maTK) {
      navigate("/dang-nhap", { replace: true })
      return
    }

    if (!validateForm()) {
      setMessage({
        type: "error",
        text: "Vui lòng kiểm tra lại thông tin đã nhập.",
      })
      return
    }

    try {
      setIsSaving(true)

      setMessage({
        type: "",
        text: "",
      })

      const payload = new FormData()

      payload.append("fullName", formData.fullName.trim())
      payload.append("phone", formData.phone.trim())
      payload.append("birthDate", formData.birthDate || "")
      payload.append("gender", formData.gender || "")

      const updatedProfile = await updateAccountProfileApi(
        currentUser.maTK,
        payload
      )

      setProfile(updatedProfile)
      setFormData(updatedProfile)
      setIsEditing(false)

      syncProfileToStoredUser(updatedProfile)

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = ""
      }

      setMessage({
        type: "success",
        text: "Cập nhật thông tin cá nhân thành công.",
      })
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Không thể cập nhật thông tin cá nhân.",
      })
    } finally {
      setIsSaving(false)
    }
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

  const sidebarProfile = isEditing ? formData : profile

  return (
    <div className="account-profile-page">
      <Header />

      {avatarToast.open && (
        <div className="account-profile-toast">
          <span>{avatarToast.message}</span>

          <button
            type="button"
            onClick={() =>
              setAvatarToast({
                open: false,
                message: "",
              })
            }
            aria-label="Đóng thông báo"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <main className="account-profile-main">
        <div className="account-profile-container">
          <AccountSidebar
            activeMenu="profile"
            profileData={sidebarProfile}
            appointmentCount={appointmentCount}
            onAvatarChange={handleAvatarChange}
            onLogout={handleLogout}
            isAvatarUploading={isAvatarUploading}
          />

          <section className="account-profile-content">
            <div className="account-profile-card">
              {isLoading ? (
                <div className="account-profile-loading">
                  <Loader2 size={34} className="account-profile-loading-icon" />

                  <h2>Đang tải thông tin cá nhân</h2>

                  <p>Vui lòng chờ trong giây lát.</p>
                </div>
              ) : loadError ? (
                <div className="account-profile-loading">
                  <AlertCircle size={36} />

                  <h2>Không thể tải thông tin</h2>

                  <p>{loadError}</p>

                  <button
                    type="button"
                    className="btn-save"
                    onClick={() => window.location.reload()}
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <>
                  <div className="account-profile-card__top">
                    <div>
                      <h1 className="account-profile-card__title">
                        Thông tin cá nhân
                      </h1>

                      {isEditing && (
                        <p className="account-profile-card__note">
                          Bạn có thể cập nhật họ tên, số điện thoại, ngày sinh
                          và giới tính. Ảnh đại diện sẽ được cập nhật ngay sau
                          khi chọn ảnh.
                        </p>
                      )}
                    </div>

                    {!isEditing && (
                      <button
                        type="button"
                        className="account-profile-card__edit-btn"
                        onClick={handleStartEdit}
                      >
                        <PencilLine size={18} />
                        <span>Chỉnh sửa</span>
                      </button>
                    )}
                  </div>

                  <div className="account-profile-card__divider"></div>

                  {message.text && (
                    <div
                      className={`account-profile-card__message ${
                        message.type === "success"
                          ? "success"
                          : message.type === "error"
                          ? "error"
                          : ""
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <form
                    className="account-profile-form"
                    onSubmit={handleSubmit}
                  >
                    <div className="account-profile-form__grid">
                      <div className="account-profile-form__group">
                        <label htmlFor="fullName">Họ và tên</label>

                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={!isEditing || isSaving}
                          placeholder="Nhập họ và tên"
                        />

                        {errors.fullName && (
                          <span className="form-error">{errors.fullName}</span>
                        )}
                      </div>

                      <div className="account-profile-form__group">
                        <label htmlFor="email">Email</label>

                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="readonly-input"
                        />
                      </div>

                      <div className="account-profile-form__group">
                        <label htmlFor="phone">Số điện thoại</label>

                        <input
                          id="phone"
                          name="phone"
                          type="text"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing || isSaving}
                          placeholder="Nhập số điện thoại"
                        />

                        {errors.phone && (
                          <span className="form-error">{errors.phone}</span>
                        )}
                      </div>

                      <div className="account-profile-form__group">
                        <label htmlFor="birthDate">Ngày sinh</label>

                        <input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          disabled={!isEditing || isSaving}
                        />

                        {errors.birthDate && (
                          <span className="form-error">
                            {errors.birthDate}
                          </span>
                        )}
                      </div>

                      <div className="account-profile-form__group account-profile-form__group--half">
                        <label htmlFor="gender">Giới tính</label>

                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing || isSaving}
                        >
                          <option value="">-- Chọn giới tính --</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>

                        {errors.gender && (
                          <span className="form-error">{errors.gender}</span>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="account-profile-form__actions">
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          <X size={18} />
                          <span>Hủy</span>
                        </button>

                        <button
                          type="submit"
                          className="btn-save"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2
                                size={18}
                                className="account-profile-loading-icon"
                              />
                              <span>Đang lưu...</span>
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              <span>Lưu</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {showLogoutPopup && (
        <div className="logout-popup-overlay">
          <div className="logout-popup">
            <div className="logout-popup-icon">
              <LogOut size={34} />
            </div>

            <h3>Xác nhận đăng xuất</h3>

            <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại không?</p>

            <div className="logout-popup-actions">
              <button
                type="button"
                className="logout-popup-btn logout-popup-btn-cancel"
                onClick={cancelLogout}
              >
                Hủy
              </button>

              <button
                type="button"
                className="logout-popup-btn logout-popup-btn-confirm"
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

export default AccountProfilePage