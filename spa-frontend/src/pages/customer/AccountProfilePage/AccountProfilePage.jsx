import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, PencilLine, Save, X } from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"
// import FloatingChat from "../../../components/FloatingChat/FloatingChat"

import "./AccountProfilePage.css"

const initialProfile = {
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
  fullName: "Nguyễn Thị Mai",
  email: "admin@gmail.com",
  phone: "0901234567",
  birthDate: "1995-08-15",
  gender: "Nữ",
}

function AccountProfilePage() {
  const navigate = useNavigate()
  const objectUrlRef = useRef("")

  const [profile, setProfile] = useState(initialProfile)
  const [formData, setFormData] = useState(initialProfile)

  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({
    type: "",
    text: "",
  })

  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

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

    if (!formData.birthDate) {
      newErrors.birthDate = "Vui lòng chọn ngày sinh."
    } else {
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

  const handleAvatarChange = (file) => {
    if (!file) return

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

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const previewUrl = URL.createObjectURL(file)
    objectUrlRef.current = previewUrl

    setFormData((prev) => ({
      ...prev,
      avatar: previewUrl,
      avatarFile: file,
    }))

    setIsEditing(true)

    setMessage({
      type: "success",
      text: "Đã chọn ảnh đại diện mới. Nhấn “Lưu” để cập nhật.",
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validateForm()) {
      setMessage({
        type: "error",
        text: "Vui lòng kiểm tra lại thông tin đã nhập.",
      })
      return
    }

    setProfile(formData)
    setIsEditing(false)

    setMessage({
      type: "success",
      text: "Cập nhật thông tin cá nhân thành công.",
    })

    /*
      Khi nối backend, bạn thay phần setProfile phía trên bằng API:

      const payload = new FormData()
      payload.append("fullName", formData.fullName)
      payload.append("phone", formData.phone)
      payload.append("birthDate", formData.birthDate)
      payload.append("gender", formData.gender)

      if (formData.avatarFile) {
        payload.append("avatar", formData.avatarFile)
      }

      await updateProfileApi(payload)
    */
  }

  const handleLogout = () => {
    setShowLogoutPopup(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
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

      <main className="account-profile-main">
        <div className="account-profile-container">
          <AccountSidebar
            activeMenu="profile"
            profileData={sidebarProfile}
            appointmentCount={3}
            onAvatarChange={handleAvatarChange}
            onLogout={handleLogout}
          />

          <section className="account-profile-content">
            <div className="account-profile-card">
              <div className="account-profile-card__top">
                <div>
                  <h1 className="account-profile-card__title">
                    Thông tin cá nhân
                  </h1>

                  {isEditing && (
                    <p className="account-profile-card__note">
                      Bạn có thể cập nhật họ tên, số điện thoại, ngày sinh,
                      giới tính và ảnh đại diện.
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

              <form className="account-profile-form" onSubmit={handleSubmit}>
                <div className="account-profile-form__grid">
                  <div className="account-profile-form__group">
                    <label htmlFor="fullName">Họ và tên</label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Nhập họ và tên"
                    />

                    {errors.fullName && (
                      <span className="form-error">{errors.fullName}</span>
                    )}
                  </div>

                  <div className="account-profile-form__group">
                    <label htmlFor="email">Email (Không thể thay đổi)</label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
                    />

                    {errors.birthDate && (
                      <span className="form-error">{errors.birthDate}</span>
                    )}
                  </div>

                  <div className="account-profile-form__group account-profile-form__group--half">
                    <label htmlFor="gender">Giới tính</label>

                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
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
                    >
                      <X size={18} />
                      <span>Hủy</span>
                    </button>

                    <button type="submit" className="btn-save">
                      <Save size={18} />
                      <span>Lưu</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Nếu bạn có FloatingChat giống trang lịch hẹn thì mở dòng này */}
      {/* <FloatingChat /> */}

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