import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LogOut, Pencil } from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import AccountSidebar from "../../../components/AccountSidebar/AccountSidebar"

import "./AccountProfilePage.css"

function AccountProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [activeMenu, setActiveMenu] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

  const [profileData, setProfileData] = useState({
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    fullName: "Nguyễn Thị Mai",
    email: "admin@gmail.com",
    phone: "0901234567",
    birthDate: "1995-08-15",
    gender: "Nữ",
  })

  const [tempProfile, setTempProfile] = useState(profileData)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const appointmentCount = 3

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get("tab")

    if (tab === "password") {
      setActiveMenu("password")
    } else {
      setActiveMenu("profile")
    }
  }, [location.search])

  const handleEditClick = () => {
    setTempProfile(profileData)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setTempProfile(profileData)
    setIsEditing(false)
  }

  const handleSaveProfile = () => {
    setProfileData(tempProfile)
    setIsEditing(false)
    alert("Cập nhật thông tin cá nhân thành công!")
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target

    setTempProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarChange = (file) => {
    const imageUrl = URL.createObjectURL(file)

    setTempProfile((prev) => ({
      ...prev,
      avatar: imageUrl,
    }))

    if (!isEditing) {
      setProfileData((prev) => ({
        ...prev,
        avatar: imageUrl,
      }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitPassword = (e) => {
    e.preventDefault()

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Vui lòng nhập đầy đủ thông tin mật khẩu.")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp.")
      return
    }

    alert("Đổi mật khẩu thành công!")

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
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

  return (
    <div className="account-page">
      <Header />

      <main className="account-main">
        <div className="account-container">
          <AccountSidebar
            activeMenu={activeMenu === "password" ? "password" : "profile"}
            profileData={isEditing ? tempProfile : profileData}
            appointmentCount={appointmentCount}
            onAvatarChange={handleAvatarChange}
            onLogout={handleLogout}
          />

          <section className="account-content">
            {activeMenu === "profile" && (
              <div className="account-content-card">
                <div className="account-content-header">
                  <h2>Thông tin cá nhân</h2>

                  {!isEditing && (
                    <button
                      type="button"
                      className="account-edit-btn"
                      onClick={handleEditClick}
                    >
                      <Pencil size={18} />
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                <div className="account-divider"></div>

                <div className="account-form-grid">
                  <div className="account-form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={
                        isEditing ? tempProfile.fullName : profileData.fullName
                      }
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group">
                    <label>Email (Không thể thay đổi)</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                    />
                  </div>

                  <div className="account-form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={isEditing ? tempProfile.phone : profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={
                        isEditing
                          ? tempProfile.birthDate
                          : profileData.birthDate
                      }
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group account-form-group-full">
                    <label>Giới tính</label>
                    <select
                      name="gender"
                      value={
                        isEditing ? tempProfile.gender : profileData.gender
                      }
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    >
                      <option value="Nữ">Nữ</option>
                      <option value="Nam">Nam</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="account-action-row">
                    <button
                      type="button"
                      className="account-btn secondary"
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>

                    <button
                      type="button"
                      className="account-btn primary"
                      onClick={handleSaveProfile}
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeMenu === "password" && (
              <div className="account-content-card">
                <div className="account-content-header">
                  <h2>Đổi mật khẩu</h2>
                </div>

                <div className="account-divider"></div>

                <form
                  className="account-form-grid"
                  onSubmit={handleSubmitPassword}
                >
                  <div className="account-form-group account-form-group-full">
                    <label>Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Nhập mật khẩu hiện tại"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="account-form-group">
                    <label>Mật khẩu mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Nhập mật khẩu mới"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="account-form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu mới"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="account-action-row">
                    <button type="submit" className="account-btn primary">
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </div>
      </main>

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

      <Footer />
      <FloatingChat />
    </div>
  )
}

export default AccountProfilePage